<script lang="ts" setup>
import type { FormInstance, FormRules, UploadProps } from 'element-plus';

import { computed, reactive, ref } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { Delete, UploadFilled, ZoomIn } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { uploadImageApi } from '#/api/common';
import { submitFeedbackApi } from '#/api/mine/profile/feedback';

import {
  FEEDBACK_CONTENT_MAX_LENGTH,
  FEEDBACK_IMAGE_ACCEPT,
  FEEDBACK_IMAGE_MAX_COUNT,
  FEEDBACK_IMAGE_MAX_MB,
  isAllowedFeedbackImageFile,
  joinFeedbackImageUrls,
} from '../data';

defineOptions({ name: 'MineProfileFeedbackSubmitDialog' });

const emit = defineEmits<{
  /** 提交成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 提交中 */
const submitting = ref(false);
/** 进行中的上传任务数 */
const uploadingCount = ref(0);
/** 表单引用 */
const formRef = ref<FormInstance>();
/** 已上传成功的图片 URL（多图） */
const imageUrls = ref<string[]>([]);
/** 预览可见 */
const previewVisible = ref(false);
/** 预览起始下标 */
const previewIndex = ref(0);

const form = reactive({
  content: '',
});

/** 是否仍可继续上传 */
const canUploadMore = computed(
  () => imageUrls.value.length < FEEDBACK_IMAGE_MAX_COUNT,
);

/** 是否有图片正在上传 */
const imageUploading = computed(() => uploadingCount.value > 0);

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  content: [
    {
      required: true,
      message: $t('page.mine.feedback.form.contentRequired'),
      trigger: 'blur',
    },
    {
      min: 5,
      message: $t('page.mine.feedback.form.contentMin'),
      trigger: 'blur',
    },
    {
      max: FEEDBACK_CONTENT_MAX_LENGTH,
      message: $t('page.mine.feedback.form.contentMax', [
        FEEDBACK_CONTENT_MAX_LENGTH,
      ]),
      trigger: 'blur',
    },
  ],
}));

/**
 * 重置表单
 */
function resetForm() {
  form.content = '';
  imageUrls.value = [];
  uploadingCount.value = 0;
  previewVisible.value = false;
  previewIndex.value = 0;
  formRef.value?.clearValidate();
}

/**
 * 打开提交弹窗
 */
function open() {
  resetForm();
  visible.value = true;
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
  resetForm();
}

/**
 * 上传前校验
 * @param raw 原始文件
 */
const beforeUpload: UploadProps['beforeUpload'] = (raw) => {
  if (!canUploadMore.value) {
    ElMessage.warning(
      $t('page.mine.feedback.form.imageLimit', [FEEDBACK_IMAGE_MAX_COUNT]),
    );
    return false;
  }
  if (!isAllowedFeedbackImageFile(raw)) {
    ElMessage.warning($t('page.mine.feedback.form.imageTypeInvalid'));
    return false;
  }
  if (raw.size / 1024 / 1024 > FEEDBACK_IMAGE_MAX_MB) {
    ElMessage.warning(
      $t('page.mine.feedback.form.imageSizeInvalid', [FEEDBACK_IMAGE_MAX_MB]),
    );
    return false;
  }
  return true;
};

/**
 * 超出上传数量限制
 */
const handleUploadExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(
    $t('page.mine.feedback.form.imageLimit', [FEEDBACK_IMAGE_MAX_COUNT]),
  );
};

/**
 * 自定义上传图片（支持拖拽多选，逐张追加到 imageUrls）
 * @param options 上传选项
 */
async function handleImageUpload(options: {
  file: File;
  onError: (err: Error) => void;
  onSuccess: (res?: unknown) => void;
}) {
  if (imageUrls.value.length >= FEEDBACK_IMAGE_MAX_COUNT) {
    ElMessage.warning(
      $t('page.mine.feedback.form.imageLimit', [FEEDBACK_IMAGE_MAX_COUNT]),
    );
    options.onError(new Error('limit exceeded'));
    return;
  }

  uploadingCount.value += 1;
  try {
    const result = await uploadImageApi(options.file);
    const url = String(result?.url ?? '').trim();
    if (isEmpty(url)) {
      ElMessage.error($t('page.mine.feedback.form.uploadFail'));
      options.onError(new Error('empty url'));
      return;
    }
    if (imageUrls.value.length >= FEEDBACK_IMAGE_MAX_COUNT) {
      ElMessage.warning(
        $t('page.mine.feedback.form.imageLimit', [FEEDBACK_IMAGE_MAX_COUNT]),
      );
      options.onError(new Error('limit exceeded'));
      return;
    }
    imageUrls.value = [...imageUrls.value, url];
    options.onSuccess({ url });
  } catch (error) {
    options.onError(error as Error);
  } finally {
    uploadingCount.value = Math.max(0, uploadingCount.value - 1);
  }
}

/**
 * 打开大图预览
 * @param index 起始下标
 */
function openImagePreview(index: number) {
  previewIndex.value = index;
  previewVisible.value = true;
}

/**
 * 关闭大图预览
 */
function closeImagePreview() {
  previewVisible.value = false;
}

/**
 * 移除已上传图片
 * @param index 下标
 */
function removeImage(index: number) {
  imageUrls.value = imageUrls.value.filter((_, i) => i !== index);
}

/**
 * 提交意见反馈
 */
async function handleSubmit() {
  if (!formRef.value) {
    return;
  }
  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  if (imageUploading.value) {
    ElMessage.warning($t('page.mine.feedback.form.uploading'));
    return;
  }

  const content = form.content.trim();
  const images = joinFeedbackImageUrls(imageUrls.value);

  submitting.value = true;
  try {
    await submitFeedbackApi({
      content,
      images,
    });
    ElMessage.success($t('page.mine.feedback.form.submitSuccess'));
    visible.value = false;
    resetForm();
    emit('success');
  } catch {
    // 错误提示由接口层处理
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    class="feedback-submit-dialog"
    destroy-on-close
    :close-on-click-modal="false"
    :title="$t('page.mine.feedback.form.title')"
    width="600px"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      class="feedback-submit-dialog__form"
      label-position="top"
      :model="form"
      :rules="rules"
      @submit.prevent
    >
      <el-form-item
        :label="$t('page.mine.feedback.form.content')"
        prop="content"
      >
        <el-input
          v-model="form.content"
          :autosize="{ minRows: 4, maxRows: 8 }"
          :maxlength="FEEDBACK_CONTENT_MAX_LENGTH"
          :placeholder="$t('page.mine.feedback.form.contentPlaceholder')"
          show-word-limit
          type="textarea"
        />
      </el-form-item>

      <el-form-item :label="$t('page.mine.feedback.form.images')">
        <div class="feedback-submit-dialog__image-picker">
          <el-upload
            v-if="canUploadMore"
            v-loading="imageUploading"
            :accept="FEEDBACK_IMAGE_ACCEPT"
            :before-upload="beforeUpload"
            class="feedback-submit-dialog__upload-drag"
            drag
            :disabled="imageUploading"
            :http-request="handleImageUpload"
            :limit="FEEDBACK_IMAGE_MAX_COUNT"
            multiple
            :on-exceed="handleUploadExceed"
            :show-file-list="false"
          >
            <el-icon class="feedback-submit-dialog__upload-icon">
              <UploadFilled />
            </el-icon>
            <div class="el-upload__text">
              {{ $t('page.mine.feedback.form.dragDropText') }}
              <em>{{ $t('page.mine.feedback.form.dragDropClick') }}</em>
            </div>
          </el-upload>

          <div
            v-if="imageUrls.length > 0"
            class="feedback-submit-dialog__image-grid"
          >
            <div
              v-for="(url, index) in imageUrls"
              :key="`${url}-${index}`"
              class="feedback-submit-dialog__image-card"
            >
              <el-image
                class="feedback-submit-dialog__image-thumb"
                fit="cover"
                :src="url"
              />
              <div class="feedback-submit-dialog__image-actions">
                <button
                  class="feedback-submit-dialog__image-action"
                  type="button"
                  @click="openImagePreview(index)"
                >
                  <el-icon><ZoomIn /></el-icon>
                </button>
                <button
                  class="feedback-submit-dialog__image-action"
                  type="button"
                  @click="removeImage(index)"
                >
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <p class="feedback-submit-dialog__tip">
            {{
              $t('page.mine.feedback.form.imagesTip', [
                FEEDBACK_IMAGE_MAX_COUNT,
                FEEDBACK_IMAGE_MAX_MB,
              ])
            }}
          </p>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.mine.feedback.form.cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="submitting || imageUploading"
        @click="handleSubmit"
      >
        {{ $t('page.mine.feedback.form.submit') }}
      </el-button>
    </template>
  </el-dialog>

  <el-image-viewer
    v-if="previewVisible"
    teleported
    :initial-index="previewIndex"
    :url-list="imageUrls"
    :z-index="4100"
    @close="closeImagePreview"
  />
</template>

<style lang="scss" scoped>
.feedback-submit-dialog {
  &__form {
    padding-top: 4px;
  }

  &__image-picker {
    width: 100%;
  }

  &__upload-drag {
    width: 100%;
    height: 160px;
    margin-bottom: 12px;

    :deep(.el-upload) {
      width: 100%;
      height: 100%;
    }

    :deep(.el-upload-dragger) {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 16px;
    }
  }

  &__upload-icon {
    margin-bottom: 8px;
    font-size: 40px;
    color: var(--el-color-primary);
  }

  &__image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__image-card {
    position: relative;
    width: 120px;
    height: 68px;
    overflow: hidden;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
  }

  &__image-thumb {
    display: block;
    width: 100%;
    height: 100%;

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__image-actions {
    position: absolute;
    inset: 0;
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 45%);
    opacity: 0;
    transition: opacity 0.2s ease;

    .feedback-submit-dialog__image-card:hover & {
      opacity: 1;
    }
  }

  &__image-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    color: #fff;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 4px;

    &:hover {
      background: rgb(255 255 255 / 18%);
    }

    .el-icon {
      font-size: 16px;
    }
  }

  &__tip {
    margin: 10px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }
}
</style>
