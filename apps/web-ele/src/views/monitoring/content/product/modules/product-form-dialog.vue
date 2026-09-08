<script lang="ts" setup>
import type {
  FormInstance,
  FormRules,
  UploadInstance,
  UploadProps,
} from 'element-plus';

import type { AdminProductId } from '#/types/monitoring/content/product';
import type { ProductInfo } from '#/types/service/product';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty, isHttpUrl } from '@vben/utils';

import { Delete, UploadFilled, ZoomIn } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { uploadImageApi } from '#/api/common';
import {
  createAdminProductApi,
  updateAdminProductApi,
} from '#/api/monitoring/content/product';

import {
  ADMIN_PRODUCT_IMAGE_ACCEPT,
  isAllowedAdminProductImageFile,
  joinAdminProductTags,
  splitProductTags,
} from '../data';

defineOptions({ name: 'AdminProductFormDialog' });

const emit = defineEmits<{
  /** 保存成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 编辑中的产品 ID；新增时为空 */
const editingId = ref<AdminProductId | null>(null);
/** 提交中 */
const submitting = ref(false);
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
  productName: '',
  description: '',
  imageUrl: '',
  greenPowerRatio: undefined as number | undefined,
  price: undefined as number | undefined,
  recommendLevel: undefined as number | undefined,
  tags: [] as string[],
  enterpriseId: '',
});

/** 是否编辑模式 */
const isEdit = computed(() => editingId.value != null);

/** 弹窗标题 */
const dialogTitle = computed(() =>
  isEdit.value
    ? $t('page.monitoring.content.product.form.editTitle')
    : $t('page.monitoring.content.product.form.createTitle'),
);

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  productName: [
    {
      required: true,
      message: $t('page.monitoring.content.product.form.productNameRequired'),
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
const displayImageUrl = computed(() => resolveImageUrl(form.imageUrl));

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
  form.productName = '';
  form.description = '';
  form.imageUrl = '';
  form.greenPowerRatio = undefined;
  form.price = undefined;
  form.recommendLevel = undefined;
  form.tags = [];
  form.enterpriseId = '';
  imagePreviewVisible.value = false;
  imagePreviewUrl.value = '';
  formRef.value?.clearValidate();
  clearUploadFiles();
}

/**
 * 用列表行回填表单
 * @param row 产品条目
 */
function fillForm(row: ProductInfo) {
  form.productName = row.productName?.trim() || '';
  form.description = row.description?.trim() || '';
  form.imageUrl = row.imageUrl?.trim() || '';
  form.greenPowerRatio =
    row.greenPowerRatio == null ? undefined : Number(row.greenPowerRatio);
  form.price = row.price == null ? undefined : Number(row.price);
  form.recommendLevel =
    row.recommendLevel == null ? undefined : Number(row.recommendLevel);
  form.tags = splitProductTags(row.tags);
  form.enterpriseId =
    row.enterpriseId === null || row.enterpriseId === undefined
      ? ''
      : String(row.enterpriseId);
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
 * 打开编辑弹窗
 * @param row 产品条目
 */
function openEdit(row: ProductInfo) {
  editingId.value = row.productId;
  fillForm(row);
  visible.value = true;
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
  if (!isAllowedAdminProductImageFile(raw)) {
    ElMessage.warning(
      $t('page.monitoring.content.product.form.imageTypeInvalid'),
    );
    return false;
  }
  if (raw.size / 1024 / 1024 > 5) {
    ElMessage.warning(
      $t('page.monitoring.content.product.form.imageSizeInvalid'),
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
    ElMessage.warning($t('page.monitoring.content.product.form.imageLimit'));
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
      ElMessage.error($t('page.monitoring.content.product.form.uploadFail'));
      clearUploadFiles();
      return;
    }
    form.imageUrl = url;
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
function buildWriteParams() {
  const enterpriseText = form.enterpriseId.trim();
  return {
    productName: form.productName.trim(),
    description: form.description.trim() || undefined,
    imageUrl: form.imageUrl.trim() || undefined,
    greenPowerRatio:
      form.greenPowerRatio == null ? undefined : Number(form.greenPowerRatio),
    price: form.price == null ? undefined : Number(form.price),
    recommendLevel:
      form.recommendLevel == null ? undefined : Number(form.recommendLevel),
    tags: joinAdminProductTags(form.tags),
    enterpriseId: enterpriseText || undefined,
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
      await updateAdminProductApi(editingId.value, payload);
      ElMessage.success($t('page.monitoring.content.product.form.editSuccess'));
    } else {
      await createAdminProductApi(payload);
      ElMessage.success(
        $t('page.monitoring.content.product.form.createSuccess'),
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
    class="product-form-dialog"
    destroy-on-close
    :title="dialogTitle"
    width="720px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      class="product-form-dialog__form"
      label-width="120px"
      :model="form"
      :rules="rules"
      @submit.prevent
    >
      <el-form-item
        :label="$t('page.monitoring.content.product.form.fields.productName')"
        prop="productName"
      >
        <el-input
          v-model="form.productName"
          maxlength="100"
          show-word-limit
          :placeholder="
            $t('page.monitoring.content.product.form.productNamePlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        :label="$t('page.monitoring.content.product.form.fields.description')"
        prop="description"
      >
        <el-input
          v-model="form.description"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6 }"
          maxlength="500"
          show-word-limit
          :placeholder="
            $t('page.monitoring.content.product.form.descriptionPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        :label="$t('page.monitoring.content.product.form.fields.imageUrl')"
      >
        <div class="product-form-dialog__image-picker">
          <div
            v-if="displayImageUrl"
            class="product-form-dialog__image-card"
          >
            <el-image
              class="product-form-dialog__image-thumb"
              fit="contain"
              :src="displayImageUrl"
            />
            <div class="product-form-dialog__image-actions">
              <button
                class="product-form-dialog__image-action"
                type="button"
                @click="openImagePreview"
              >
                <el-icon><ZoomIn /></el-icon>
              </button>
              <button
                class="product-form-dialog__image-action"
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
            :accept="ADMIN_PRODUCT_IMAGE_ACCEPT"
            class="product-form-dialog__upload-drag"
            :disabled="imageUploading"
            :http-request="handleImageUpload"
            :limit="1"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-exceed="handleUploadExceed"
          >
            <el-icon class="product-form-dialog__upload-icon">
              <UploadFilled />
            </el-icon>
            <div class="el-upload__text">
              {{ $t('page.monitoring.content.product.form.dragDropText') }}
              <em>{{ $t('page.monitoring.content.product.form.dragDropClick') }}</em>
            </div>
          </el-upload>
        </div>
        <p class="product-form-dialog__hint">
          {{ $t('page.monitoring.content.product.form.imageHint') }}
        </p>
      </el-form-item>

      <el-form-item
        :label="$t('page.monitoring.content.product.form.fields.price')"
      >
        <el-input-number
          v-model="form.price"
          class="product-form-dialog__number"
          :min="0"
          :precision="2"
          controls-position="right"
          :placeholder="$t('page.monitoring.content.product.form.pricePlaceholder')"
        />
      </el-form-item>

      <el-form-item
        :label="
          $t('page.monitoring.content.product.form.fields.greenPowerRatio')
        "
      >
        <el-input-number
          v-model="form.greenPowerRatio"
          class="product-form-dialog__number"
          :min="0"
          :max="100"
          :precision="2"
          controls-position="right"
          :placeholder="
            $t('page.monitoring.content.product.form.greenPowerPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        :label="
          $t('page.monitoring.content.product.form.fields.recommendLevel')
        "
      >
        <el-input-number
          v-model="form.recommendLevel"
          class="product-form-dialog__number"
          :min="0"
          :step="1"
          controls-position="right"
          :placeholder="
            $t('page.monitoring.content.product.form.recommendPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        :label="$t('page.monitoring.content.product.form.fields.tags')"
      >
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          :placeholder="$t('page.monitoring.content.product.form.tagsPlaceholder')"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item
        :label="$t('page.monitoring.content.product.form.fields.enterpriseId')"
      >
        <el-input
          v-model="form.enterpriseId"
          clearable
          :placeholder="
            $t('page.monitoring.content.product.form.enterpriseIdPlaceholder')
          "
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.monitoring.content.product.form.cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="submitting || imageUploading"
        @click="handleSubmit"
      >
        {{ $t('page.monitoring.content.product.form.submit') }}
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
.product-form-dialog {
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
