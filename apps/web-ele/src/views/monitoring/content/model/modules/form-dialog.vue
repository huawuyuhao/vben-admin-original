<script lang="ts" setup>
import type {
  FormInstance,
  FormRules,
  UploadInstance,
  UploadProps,
} from 'element-plus';

import type {
  AdminModelServiceId,
  AdminModelServiceItem,
  AdminModelServiceWriteParams,
} from '#/types/monitoring/content/model';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty, isHttpUrl } from '@vben/utils';

import { Delete, UploadFilled, ZoomIn } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { uploadImageApi } from '#/api/common';
import {
  createAdminModelServiceApi,
  getAdminModelServiceDetailApi,
  updateAdminModelServiceApi,
} from '#/api/monitoring/content/model';
import { hasApiId } from '#/utils/api-id';

import {
  ADMIN_MODEL_CATEGORY_INFER,
  ADMIN_MODEL_CATEGORY_TRAIN,
  ADMIN_MODEL_IMAGE_ACCEPT,
  ADMIN_MODEL_STATUS_OFF,
  ADMIN_MODEL_STATUS_ON,
  isAllowedAdminModelImageFile,
} from '../data';

defineOptions({ name: 'AdminModelFormDialog' });

const emit = defineEmits<{
  /** 保存成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 编辑中的模型 ID；新增时为空 */
const editingId = ref<AdminModelServiceId | null>(null);
/** 提交中 */
const submitting = ref(false);
/** 详情加载中 */
const detailLoading = ref(false);
/** 图片上传中 */
const imageUploading = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();
/** 图片上传组件引用 */
const uploadRef = ref<UploadInstance>();
/** 图片预览 */
const imagePreviewVisible = ref(false);
const imagePreviewUrl = ref('');

const form = reactive({
  modelName: '',
  iconUrl: '',
  description: '',
  score: undefined as number | undefined,
  callCount: undefined as number | undefined,
  collectCount: undefined as number | undefined,
  modelCategory: '' as string,
  sceneTag: '',
  paramsJson: '',
  status: ADMIN_MODEL_STATUS_ON as number,
});

/** 是否编辑模式 */
const isEdit = computed(() => editingId.value != null);

/** 弹窗标题 */
const dialogTitle = computed(() =>
  isEdit.value
    ? $t('page.monitoring.content.model.form.editTitle')
    : $t('page.monitoring.content.model.form.createTitle'),
);

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  modelName: [
    {
      required: true,
      message: $t('page.monitoring.content.model.form.modelNameRequired'),
      trigger: 'blur',
    },
  ],
}));

/**
 * 解析可预览图片地址
 * @param raw 原始地址
 */
function resolveImageUrl(raw?: string): string {
  const text = raw?.trim() || '';
  if (!text) {
    return '';
  }
  if (isHttpUrl(text) || text.startsWith('blob:') || text.startsWith('data:')) {
    return text;
  }
  if (text.startsWith('/')) {
    return `${window.location.origin}${text}`;
  }
  return text;
}

/** 表单图片展示地址 */
const displayImageUrl = computed(() => resolveImageUrl(form.iconUrl));

/**
 * 清空上传组件内部文件列表
 */
function clearUploadFiles() {
  uploadRef.value?.clearFiles();
}

/**
 * 重置表单
 */
function resetForm() {
  form.modelName = '';
  form.iconUrl = '';
  form.description = '';
  form.score = undefined;
  form.callCount = undefined;
  form.collectCount = undefined;
  form.modelCategory = '';
  form.sceneTag = '';
  form.paramsJson = '';
  form.status = ADMIN_MODEL_STATUS_ON;
  imagePreviewVisible.value = false;
  imagePreviewUrl.value = '';
  detailLoading.value = false;
  formRef.value?.clearValidate();
  clearUploadFiles();
}

/**
 * 用详情 / 行数据回填表单
 * @param row 模型条目
 */
function fillForm(row: AdminModelServiceItem) {
  form.modelName = row.modelName?.trim() || '';
  form.iconUrl = row.iconUrl?.trim() || '';
  form.description = row.description?.trim() || '';
  form.score = row.score == null ? undefined : Number(row.score);
  form.callCount = row.callCount == null ? undefined : Number(row.callCount);
  form.collectCount =
    row.collectCount == null ? undefined : Number(row.collectCount);
  form.modelCategory = row.modelCategory?.trim() || '';
  form.sceneTag = row.sceneTag?.trim() || '';
  form.paramsJson = row.paramsJson?.trim() || '';
  form.status =
    row.status == null ? ADMIN_MODEL_STATUS_ON : Number(row.status);
}

/**
 * 打开新增弹窗
 */
function openCreate() {
  editingId.value = null;
  resetForm();
  visible.value = true;
}

/**
 * 打开编辑弹窗：优先拉取详情回填
 * @param row 列表行（取 modelId）
 */
async function openEdit(row: AdminModelServiceItem) {
  if (!hasApiId(row.modelId)) {
    ElMessage.warning($t('page.monitoring.content.model.form.invalidId'));
    return;
  }
  editingId.value = row.modelId!;
  resetForm();
  fillForm(row);
  visible.value = true;
  detailLoading.value = true;
  try {
    const detail = await getAdminModelServiceDetailApi(row.modelId!);
    if (detail) {
      fillForm(detail);
    }
  } catch {
    ElMessage.error($t('page.monitoring.content.model.form.loadDetailFail'));
  } finally {
    detailLoading.value = false;
  }
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
}

watch(visible, (open) => {
  if (!open) {
    editingId.value = null;
    resetForm();
  }
});

/**
 * 上传前校验
 * @param raw 原始文件
 */
const beforeUpload: UploadProps['beforeUpload'] = (raw) => {
  if (!isAllowedAdminModelImageFile(raw)) {
    ElMessage.warning(
      $t('page.monitoring.content.model.form.imageTypeInvalid'),
    );
    return false;
  }
  if (raw.size / 1024 / 1024 > 5) {
    ElMessage.warning(
      $t('page.monitoring.content.model.form.imageSizeInvalid'),
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
  if (!isEmpty(form.iconUrl)) {
    ElMessage.warning($t('page.monitoring.content.model.form.imageLimit'));
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
      ElMessage.error($t('page.monitoring.content.model.form.uploadFail'));
      clearUploadFiles();
      return;
    }
    form.iconUrl = url;
    clearUploadFiles();
  } catch {
    form.iconUrl = '';
    clearUploadFiles();
  } finally {
    imageUploading.value = false;
  }
}

/**
 * 移除图片
 */
function handleImageRemove() {
  form.iconUrl = '';
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
function buildWriteParams(): AdminModelServiceWriteParams {
  return {
    modelName: form.modelName.trim(),
    iconUrl: form.iconUrl.trim() || undefined,
    description: form.description.trim() || undefined,
    score: form.score == null ? undefined : Number(form.score),
    callCount: form.callCount == null ? undefined : Number(form.callCount),
    collectCount:
      form.collectCount == null ? undefined : Number(form.collectCount),
    modelCategory: form.modelCategory.trim() || undefined,
    sceneTag: form.sceneTag.trim() || undefined,
    paramsJson: form.paramsJson.trim() || undefined,
    status: Number(form.status),
  };
}

/**
 * 提交新增 / 编辑
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitting.value = true;
  try {
    const payload = buildWriteParams();
    if (isEdit.value && editingId.value != null) {
      await updateAdminModelServiceApi(editingId.value, payload);
      ElMessage.success($t('page.monitoring.content.model.form.editSuccess'));
    } else {
      await createAdminModelServiceApi(payload);
      ElMessage.success(
        $t('page.monitoring.content.model.form.createSuccess'),
      );
    }
    visible.value = false;
    emit('success');
  } catch {
    // 错误提示由接口层处理
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate, openEdit });
</script>

<template>
  <el-dialog
    v-model="visible"
    class="model-form-dialog"
    destroy-on-close
    :title="dialogTitle"
    width="720px"
    @close="handleClose"
  >
    <div v-loading="detailLoading">
      <el-form
        ref="formRef"
        class="model-form-dialog__form"
        label-width="120px"
        :model="form"
        :rules="rules"
        @submit.prevent
      >
        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.modelName')"
          prop="modelName"
        >
          <el-input
            v-model="form.modelName"
            maxlength="100"
            show-word-limit
            :placeholder="
              $t('page.monitoring.content.model.form.modelNamePlaceholder')
            "
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.iconUrl')"
        >
          <div class="model-form-dialog__image-picker">
            <div
              v-if="displayImageUrl"
              class="model-form-dialog__image-card"
            >
              <el-image
                class="model-form-dialog__image-thumb"
                fit="contain"
                :src="displayImageUrl"
              />
              <div class="model-form-dialog__image-actions">
                <button
                  class="model-form-dialog__image-action"
                  type="button"
                  @click="openImagePreview"
                >
                  <el-icon><ZoomIn /></el-icon>
                </button>
                <button
                  class="model-form-dialog__image-action"
                  type="button"
                  @click="handleImageRemove"
                >
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </div>

            <el-upload
              v-else
              ref="uploadRef"
              v-loading="imageUploading"
              drag
              :accept="ADMIN_MODEL_IMAGE_ACCEPT"
              class="model-form-dialog__upload-drag"
              :disabled="imageUploading"
              :http-request="handleImageUpload"
              :limit="1"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-exceed="handleUploadExceed"
            >
              <el-icon class="model-form-dialog__upload-icon">
                <UploadFilled />
              </el-icon>
              <div class="el-upload__text">
                {{ $t('page.monitoring.content.model.form.dragDropText') }}
                <em>{{
                  $t('page.monitoring.content.model.form.dragDropClick')
                }}</em>
              </div>
            </el-upload>
          </div>
          <p class="model-form-dialog__hint">
            {{ $t('page.monitoring.content.model.form.imageHint') }}
          </p>
        </el-form-item>

        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.description')"
        >
          <el-input
            v-model="form.description"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            maxlength="500"
            show-word-limit
            :placeholder="
              $t('page.monitoring.content.model.form.descriptionPlaceholder')
            "
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.score')"
        >
          <el-input-number
            v-model="form.score"
            class="model-form-dialog__number"
            :min="0"
            :max="5"
            :precision="1"
            :step="0.1"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.callCount')"
        >
          <el-input-number
            v-model="form.callCount"
            class="model-form-dialog__number"
            :min="0"
            :step="1"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.collectCount')"
        >
          <el-input-number
            v-model="form.collectCount"
            class="model-form-dialog__number"
            :min="0"
            :step="1"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.modelCategory')"
        >
          <el-select
            v-model="form.modelCategory"
            clearable
            style="width: 100%"
            :placeholder="
              $t('page.monitoring.content.model.form.categoryPlaceholder')
            "
          >
            <el-option
              :label="$t('page.monitoring.content.model.category.train')"
              :value="ADMIN_MODEL_CATEGORY_TRAIN"
            />
            <el-option
              :label="$t('page.monitoring.content.model.category.infer')"
              :value="ADMIN_MODEL_CATEGORY_INFER"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.sceneTag')"
        >
          <el-input
            v-model="form.sceneTag"
            clearable
            maxlength="100"
            :placeholder="
              $t('page.monitoring.content.model.form.sceneTagPlaceholder')
            "
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.paramsJson')"
        >
          <el-input
            v-model="form.paramsJson"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
            :placeholder="
              $t('page.monitoring.content.model.form.paramsJsonPlaceholder')
            "
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.monitoring.content.model.form.fields.status')"
        >
          <el-radio-group v-model="form.status">
            <el-radio :value="ADMIN_MODEL_STATUS_ON">
              {{ $t('page.monitoring.content.model.status.on') }}
            </el-radio>
            <el-radio :value="ADMIN_MODEL_STATUS_OFF">
              {{ $t('page.monitoring.content.model.status.off') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.monitoring.content.model.form.cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="submitting || imageUploading || detailLoading"
        @click="handleSubmit"
      >
        {{ $t('page.monitoring.content.model.form.submit') }}
      </el-button>
    </template>
  </el-dialog>

  <el-image-viewer
    v-if="imagePreviewVisible"
    teleported
    :url-list="[imagePreviewUrl]"
    @close="closeImagePreview"
  />
</template>

<style lang="scss" scoped>
.model-form-dialog {
  &__form {
    padding-right: 8px;
  }

  &__number {
    width: 240px;
  }

  &__image-picker {
    width: 100%;
  }

  &__image-card {
    position: relative;
    width: 180px;
    height: 120px;
    overflow: hidden;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
  }

  &__image-thumb {
    width: 100%;
    height: 100%;
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
  }

  &__image-card:hover &__image-actions {
    opacity: 1;
  }

  &__image-action {
    display: inline-flex;
    padding: 0;
    color: #fff;
    cursor: pointer;
    background: transparent;
    border: 0;
    font-size: 18px;
  }

  &__upload-drag {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      padding: 24px 16px;
    }
  }

  &__upload-icon {
    margin-bottom: 8px;
    font-size: 36px;
    color: var(--el-color-primary);
  }

  &__hint {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
