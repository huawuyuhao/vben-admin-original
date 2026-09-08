<script lang="ts" setup>
import type {
  FormInstance,
  FormRules,
  UploadInstance,
  UploadProps,
} from 'element-plus';

import type {
  PortalContentItem,
  PortalContentType,
  PortalContentWriteParams,
} from '#/types/monitoring/content/home/common';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { Delete, UploadFilled, ZoomIn } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { uploadImageApi } from '#/api/common';
import {
  createPortalContentApi,
  updatePortalContentApi,
} from '#/api/monitoring/content/home/common';

import {
  isAllowedPortalContentImageFile,
  isPortalBannerContent,
  PORTAL_BANNER_DATETIME_FORMAT,
  PORTAL_CONTENT_IMAGE_ACCEPT,
  resolvePortalContentImageUrl,
  supportsPortalContentImage,
  supportsPortalContentSort,
  supportsPortalContentText,
} from '../data';

defineOptions({ name: 'PortalContentFormDialog' });

const props = defineProps<{
  /** 内容类型 */
  contentType: PortalContentType;
}>();

const emit = defineEmits<{
  /** 保存成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = defineModel<boolean>('visible', { default: false });

/** 模式：新增 / 编辑 / 查看 */
const mode = ref<'create' | 'edit' | 'view'>('create');
/** 当前编辑行 */
const editingRow = ref<null | PortalContentItem>(null);
/** 提交中 */
const submitting = ref(false);
/** 图片上传中 */
const imageUploading = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();
/** 图片上传组件引用（失败时清空内部文件列表，避免 limit=1 误拦截） */
const uploadRef = ref<UploadInstance>();

const form = reactive({
  title: '',
  contentText: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  startTime: null as null | string,
  endTime: null as null | string,
});

/** 图片预览可见 */
const imagePreviewVisible = ref(false);
/** 图片预览地址 */
const imagePreviewUrl = ref('');

const isReadonly = computed(() => mode.value === 'view');
const showImage = computed(() => supportsPortalContentImage(props.contentType));
const showSort = computed(() => supportsPortalContentSort(props.contentType));
const showContentText = computed(() =>
  supportsPortalContentText(props.contentType),
);
const showBannerFields = computed(() =>
  isPortalBannerContent(props.contentType),
);

/** 表单图片展示地址 */
const displayImageUrl = computed(() => resolveFormImageUrl(form.imageUrl));

const dialogTitle = computed(() => {
  if (mode.value === 'create') {
    return $t('page.monitoring.content.home.common.form.createTitle');
  }
  if (mode.value === 'edit') {
    return $t('page.monitoring.content.home.common.form.editTitle');
  }
  return $t('page.monitoring.content.home.common.form.viewTitle');
});

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  title: [
    {
      required: true,
      message: $t('page.monitoring.content.home.common.form.titleRequired'),
      trigger: 'blur',
    },
  ],
  sortOrder: showSort.value
    ? [
        {
          required: true,
          message: $t('page.monitoring.content.home.common.form.sortRequired'),
          trigger: 'change',
        },
      ]
    : [],
}));

/**
 * 解析表单图片可预览地址
 * @param raw 原始地址
 */
function resolveFormImageUrl(raw?: string): string {
  return resolvePortalContentImageUrl(raw);
}

/**
 * 用行数据回填表单
 * @param row 行数据
 */
function fillForm(row: PortalContentItem) {
  form.title = row.title || '';
  form.contentText = row.content || '';
  form.imageUrl = row.imageUrl || row.coverImage || '';
  form.linkUrl = row.linkUrl || '';
  form.sortOrder = Number(row.sortOrder) || 0;
  form.startTime = row.startTime?.trim() || null;
  form.endTime = row.endTime?.trim() || null;
}

/**
 * 重置表单
 */
function resetForm() {
  form.title = '';
  form.contentText = '';
  form.imageUrl = '';
  form.linkUrl = '';
  form.sortOrder = 0;
  form.startTime = null;
  form.endTime = null;
  editingRow.value = null;
  imagePreviewVisible.value = false;
  imagePreviewUrl.value = '';
  formRef.value?.clearValidate();
  uploadRef.value?.clearFiles();
}

/**
 * 清空上传组件内部文件列表
 * el-upload 在自定义上传失败后仍会占用 limit 名额，需主动清理
 */
function clearUploadFiles() {
  uploadRef.value?.clearFiles();
}

/**
 * 打开新增弹窗
 */
function openCreate() {
  mode.value = 'create';
  resetForm();
  visible.value = true;
}

/**
 * 打开编辑弹窗
 * @param row 行数据
 */
function openEdit(row: PortalContentItem) {
  mode.value = 'edit';
  editingRow.value = row;
  fillForm(row);
  visible.value = true;
}

/**
 * 打开查看弹窗
 * @param row 行数据
 */
function openView(row: PortalContentItem) {
  mode.value = 'view';
  editingRow.value = row;
  fillForm(row);
  visible.value = true;
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
}

watch(visible, (val) => {
  if (!val) {
    resetForm();
  }
});

/**
 * 上传前校验
 * @param raw 原始文件
 */
const beforeUpload: UploadProps['beforeUpload'] = (raw) => {
  if (!isAllowedPortalContentImageFile(raw)) {
    ElMessage.warning(
      $t('page.monitoring.content.home.common.form.imageTypeInvalid'),
    );
    return false;
  }
  if (raw.size / 1024 / 1024 > 5) {
    ElMessage.warning(
      $t('page.monitoring.content.home.common.form.imageSizeInvalid'),
    );
    return false;
  }
  return true;
};

/**
 * 超出上传数量限制
 * @param files 本次选择的超出文件
 */
const handleUploadExceed: UploadProps['onExceed'] = (files) => {
  if (!isEmpty(form.imageUrl)) {
    ElMessage.warning($t('page.monitoring.content.home.common.form.imageLimit'));
    return;
  }
  clearUploadFiles();
  const raw = files[0];
  if (raw && beforeUpload(raw)) {
    void handleImageUpload({ file: raw });
  }
};

/**
 * 自定义上传图片
 * @param options 上传选项
 */
async function handleImageUpload(options: { file: File }) {
  imageUploading.value = true;
  try {
    const result = await uploadImageApi(options.file);
    const url = String(result?.url ?? '').trim();
    if (isEmpty(url)) {
      ElMessage.error($t('page.monitoring.content.home.common.form.uploadFail'));
      clearUploadFiles();
      return;
    }
    form.imageUrl = url;
    formRef.value?.clearValidate('imageUrl');
    clearUploadFiles();
  } catch {
    form.imageUrl = '';
    clearUploadFiles();
  } finally {
    imageUploading.value = false;
  }
}

/**
 * 移除图片
 */
function handleImageRemove() {
  form.imageUrl = '';
  clearUploadFiles();
}

/**
 * 打开放大预览
 */
function openImagePreview() {
  if (isEmpty(displayImageUrl.value)) {
    return;
  }
  imagePreviewUrl.value = displayImageUrl.value;
  imagePreviewVisible.value = true;
}

/**
 * 关闭图片预览
 */
function closeImagePreview() {
  imagePreviewVisible.value = false;
  imagePreviewUrl.value = '';
}

/**
 * 组装写接口参数
 */
function buildWriteParams(): PortalContentWriteParams {
  const payload: PortalContentWriteParams = {
    content: props.contentType,
    title: form.title.trim(),
    imageUrl: form.imageUrl.trim() || undefined,
    sortOrder: showSort.value ? Number(form.sortOrder) || 0 : 0,
  };

  if (showContentText.value) {
    payload.contentText = form.contentText.trim() || undefined;
  }

  if (showBannerFields.value) {
    payload.linkUrl = form.linkUrl.trim() || undefined;
    payload.startTime = form.startTime?.trim() || undefined;
    payload.endTime = form.endTime?.trim() || undefined;
    // targetRegion / targetUserType：后端字段暂保留，前端暂不采集、不传
  }

  return payload;
}

/**
 * 提交表单
 */
async function handleSubmit() {
  if (isReadonly.value) {
    handleClose();
    return;
  }

  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitting.value = true;
  try {
    const payload = buildWriteParams();

    if (mode.value === 'create') {
      await createPortalContentApi(payload);
      ElMessage.success(
        $t('page.monitoring.content.home.common.form.createSuccess'),
      );
    } else if (editingRow.value) {
      await updatePortalContentApi(editingRow.value.contentId, payload);
      ElMessage.success(
        $t('page.monitoring.content.home.common.form.updateSuccess'),
      );
    }

    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate, openEdit, openView });
</script>

<template>
  <el-dialog
    v-model="visible"
    append-to-body
    align-center
    class="content-form-dialog"
    destroy-on-close
    :close-on-click-modal="false"
    width="800px"
    :z-index="4000"
    :title="dialogTitle"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      class="content-form-dialog__form"
      :label-width="showBannerFields ? '120px' : '96px'"
      :model="form"
      :rules="rules"
      :disabled="isReadonly"
    >
      <el-form-item
        :label="$t('page.monitoring.content.home.common.fields.title')"
        prop="title"
      >
        <el-input
          v-model="form.title"
          clearable
          maxlength="120"
          show-word-limit
          :placeholder="
            $t('page.monitoring.content.home.common.form.titlePlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        v-if="showImage"
        :label="$t('page.monitoring.content.home.common.fields.image')"
      >
        <div class="content-form-dialog__image-picker">
          <div class="content-form-dialog__image-slot">
            <div v-if="displayImageUrl" class="content-form-dialog__image-card">
              <el-image
                class="content-form-dialog__image-thumb"
                fit="contain"
                :src="displayImageUrl"
              />
              <div class="content-form-dialog__image-actions">
                <button
                  class="content-form-dialog__image-action"
                  type="button"
                  @click="openImagePreview"
                >
                  <el-icon><ZoomIn /></el-icon>
                </button>
                <button
                  v-if="!isReadonly"
                  class="content-form-dialog__image-action"
                  type="button"
                  @click="handleImageRemove"
                >
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </div>

            <el-upload
              v-else-if="!isReadonly"
              ref="uploadRef"
              v-loading="imageUploading"
              drag
              :accept="PORTAL_CONTENT_IMAGE_ACCEPT"
              class="content-form-dialog__upload-drag"
              :disabled="imageUploading"
              :http-request="handleImageUpload"
              :limit="1"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-exceed="handleUploadExceed"
            >
              <el-icon class="content-form-dialog__upload-icon">
                <UploadFilled />
              </el-icon>
              <div class="el-upload__text">
                {{ $t('page.monitoring.content.home.common.form.dragDropText') }}
                <em>{{
                  $t('page.monitoring.content.home.common.form.dragDropClick')
                }}</em>
              </div>
            </el-upload>
          </div>
          <p class="content-form-dialog__hint">
            {{ $t('page.monitoring.content.home.common.form.imageHint') }}
          </p>
        </div>
      </el-form-item>

      <el-form-item
        v-if="showBannerFields"
        :label="$t('page.monitoring.content.home.common.fields.linkUrl')"
        prop="linkUrl"
      >
        <el-input
          v-model="form.linkUrl"
          clearable
          maxlength="500"
          :placeholder="
            $t('page.monitoring.content.home.common.form.linkUrlPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        v-if="showBannerFields"
        :label="$t('page.monitoring.content.home.common.fields.startTime')"
        prop="startTime"
      >
        <el-date-picker
          v-model="form.startTime"
          type="datetime"
          clearable
          teleported
          popper-class="content-form-dialog__popper"
          style="width: 100%"
          :value-format="PORTAL_BANNER_DATETIME_FORMAT"
          :placeholder="
            $t('page.monitoring.content.home.common.form.startTimePlaceholder')
          "
        />
        <p class="content-form-dialog__hint">
          {{ $t('page.monitoring.content.home.common.form.startTimeHint') }}
        </p>
      </el-form-item>

      <el-form-item
        v-if="showBannerFields"
        :label="$t('page.monitoring.content.home.common.fields.endTime')"
        prop="endTime"
      >
        <el-date-picker
          v-model="form.endTime"
          type="datetime"
          clearable
          teleported
          popper-class="content-form-dialog__popper"
          style="width: 100%"
          :value-format="PORTAL_BANNER_DATETIME_FORMAT"
          :placeholder="
            $t('page.monitoring.content.home.common.form.endTimePlaceholder')
          "
        />
        <p class="content-form-dialog__hint">
          {{ $t('page.monitoring.content.home.common.form.endTimeHint') }}
        </p>
      </el-form-item>

      <el-form-item
        v-if="showContentText"
        :label="$t('page.monitoring.content.home.common.fields.content')"
        prop="contentText"
      >
        <el-input
          v-model="form.contentText"
          :autosize="{ minRows: 5, maxRows: 12 }"
          maxlength="2000"
          show-word-limit
          type="textarea"
          :placeholder="
            $t('page.monitoring.content.home.common.form.contentPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        v-if="showSort"
        :label="$t('page.monitoring.content.home.common.fields.sortEdit')"
        prop="sortOrder"
      >
        <el-input-number
          v-model="form.sortOrder"
          :min="0"
          :step="1"
          controls-position="right"
        />
        <span class="content-form-dialog__hint-inline">
          {{ $t('page.monitoring.content.home.common.form.sortHint') }}
        </span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        {{
          isReadonly
            ? $t('page.monitoring.content.home.common.form.close')
            : $t('page.monitoring.content.home.common.form.cancel')
        }}
      </el-button>
      <el-button
        v-if="!isReadonly"
        type="primary"
        :loading="submitting || imageUploading"
        @click="handleSubmit"
      >
        {{ $t('page.monitoring.content.home.common.form.submit') }}
      </el-button>
    </template>
  </el-dialog>

  <el-image-viewer
    v-if="imagePreviewVisible"
    teleported
    :url-list="[imagePreviewUrl]"
    :z-index="4100"
    @close="closeImagePreview"
  />
</template>

<style lang="scss" scoped>
.content-form-dialog {
  &__form {
    padding-top: 4px;
  }

  &__image-picker {
    width: 100%;
  }

  &__image-slot {
    width: 100%;
    height: 180px;
  }

  &__image-card {
    position: relative;
    width: 100%;
    height: 100%;
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
      object-fit: contain;
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

    .content-form-dialog__image-card:hover & {
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

  &__upload-drag {
    width: 100%;
    height: 100%;

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
    font-size: 44px;
    color: var(--el-text-color-secondary);
  }

  &__hint {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }

  &__hint-inline {
    margin-left: 12px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}
</style>

<!-- 挂到 body 的弹出层需非 scoped，保证盖过 dialog 的 z-index:4000 -->
<style lang="scss">
.content-form-dialog__popper {
  z-index: 4200 !important;
}
</style>
