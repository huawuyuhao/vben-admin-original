<script lang="ts" setup>
import type { FormInstance, FormRules, UploadProps } from 'element-plus';

import type { CaseInfo, CaseListItem, CaseWriteParams } from '#/types/service/case';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { Delete, UploadFilled, ZoomIn } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { uploadImageApi } from '#/api/common';
import {
  createCaseApi,
  getCaseDetailApi,
  updateCaseApi,
} from '#/api/service/case';

import {
  CASE_IMAGE_ACCEPT,
  CASE_STATUS_DRAFT,
  CASE_STATUS_PUBLISHED,
  CASE_TYPE_GENERAL,
  CASE_TYPE_SMART,
  isAllowedCaseImageFile,
  joinCaseTags,
  normalizeCaseTags,
} from '../data';

defineOptions({ name: 'ServiceCaseFormDialog' });

const emit = defineEmits<{
  /** 保存成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = defineModel<boolean>('visible', { default: false });

/** 模式：新增 / 编辑 */
const mode = ref<'create' | 'edit'>('create');
/** 当前编辑案例 ID */
const editingId = ref<null | number>(null);
/** 提交中 */
const submitting = ref(false);
/** 详情加载中（编辑回填） */
const detailLoading = ref(false);
/** 图片上传中 */
const imageUploading = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  title: '',
  summary: '',
  content: '',
  coverImage: '',
  caseType: CASE_TYPE_GENERAL as number,
  status: CASE_STATUS_PUBLISHED as number,
  tags: [] as string[],
});

/** 图片预览可见 */
const imagePreviewVisible = ref(false);
/** 图片预览地址 */
const imagePreviewUrl = ref('');

const dialogTitle = computed(() =>
  mode.value === 'create'
    ? $t('page.service.case.form.createTitle')
    : $t('page.service.case.form.editTitle'),
);

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  title: [
    {
      required: true,
      message: () => $t('page.service.case.form.titleRequired'),
      trigger: 'blur',
    },
  ],
  content: [
    {
      required: true,
      message: () => $t('page.service.case.form.contentRequired'),
      trigger: 'blur',
    },
  ],
  caseType: [
    {
      required: true,
      message: () => $t('page.service.case.form.caseTypeRequired'),
      trigger: 'change',
    },
  ],
  status: [
    {
      required: true,
      message: () => $t('page.service.case.form.statusRequired'),
      trigger: 'change',
    },
  ],
}));

/**
 * 重置表单
 */
function resetForm() {
  form.title = '';
  form.summary = '';
  form.content = '';
  form.coverImage = '';
  form.caseType = CASE_TYPE_GENERAL;
  form.status = CASE_STATUS_PUBLISHED;
  form.tags = [];
  editingId.value = null;
  imagePreviewVisible.value = false;
  imagePreviewUrl.value = '';
  formRef.value?.clearValidate();
}

/**
 * 用案例数据回填表单（列表项无 content / status，详情可补全）
 * @param data 列表项或详情
 */
function fillForm(data: CaseInfo | CaseListItem) {
  form.title = data.title || '';
  form.summary = data.summary || '';
  form.content = 'content' in data ? data.content || '' : form.content;
  form.coverImage = data.coverImage || '';
  form.caseType = Number(data.caseType) || CASE_TYPE_GENERAL;
  if ('status' in data && data.status === CASE_STATUS_DRAFT) {
    form.status = CASE_STATUS_DRAFT;
  } else if ('status' in data && data.status != null) {
    form.status = CASE_STATUS_PUBLISHED;
  }
  form.tags = normalizeCaseTags(data.tags);
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
 * 打开编辑弹窗（列表已含 tags；再拉详情补全 content）
 * @param item 列表案例
 */
async function openEdit(item: CaseListItem) {
  if (!item.caseId) {
    return;
  }

  mode.value = 'edit';
  resetForm();
  editingId.value = item.caseId;
  fillForm(item);
  visible.value = true;

  detailLoading.value = true;
  try {
    const detail = await getCaseDetailApi(item.caseId);
    if (detail?.caseId) {
      fillForm({
        ...item,
        ...detail,
        summary: detail.summary ?? item.summary,
        tags: detail.tags?.length ? detail.tags : item.tags,
        createTime: detail.createTime ?? item.createTime,
        viewCount: detail.viewCount ?? item.viewCount,
      });
    }
  } catch {
    // 详情失败时保留列表字段，可继续编辑
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
  if (!isAllowedCaseImageFile(raw)) {
    ElMessage.warning($t('page.service.case.form.imageTypeInvalid'));
    return false;
  }
  if (raw.size / 1024 / 1024 > 5) {
    ElMessage.warning($t('page.service.case.form.imageSizeInvalid'));
    return false;
  }
  return true;
};

/**
 * 超出上传数量限制
 */
const handleUploadExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning($t('page.service.case.form.imageLimit'));
};

/**
 * 自定义上传封面图
 * @param options 上传选项
 */
async function handleImageUpload(options: { file: File }) {
  imageUploading.value = true;
  try {
    const result = await uploadImageApi(options.file);
    const url = String(result?.url ?? '').trim();
    if (isEmpty(url)) {
      ElMessage.error($t('page.service.case.form.uploadFail'));
      return;
    }
    form.coverImage = url;
  } catch {
    form.coverImage = '';
  } finally {
    imageUploading.value = false;
  }
}

/**
 * 移除封面图
 */
function handleImageRemove() {
  form.coverImage = '';
}

/**
 * 打开放大预览
 */
function openImagePreview() {
  if (isEmpty(form.coverImage?.trim())) {
    return;
  }
  imagePreviewUrl.value = form.coverImage.trim();
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
 * @returns CaseWriteParams
 */
function buildWriteParams(): CaseWriteParams {
  return {
    title: form.title.trim(),
    summary: form.summary.trim() || undefined,
    content: form.content.trim(),
    coverImage: form.coverImage.trim() || undefined,
    caseType: Number(form.caseType),
    status: Number(form.status),
    tags: joinCaseTags(form.tags),
  };
}

/**
 * 提交表单
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitting.value = true;
  try {
    const payload = buildWriteParams();

    if (mode.value === 'create') {
      await createCaseApi(payload);
      ElMessage.success($t('page.service.case.form.createSuccess'));
    } else if (editingId.value) {
      await updateCaseApi(editingId.value, payload);
      ElMessage.success($t('page.service.case.form.updateSuccess'));
    }

    visible.value = false;
    emit('success');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate, openEdit });
</script>

<template>
  <el-dialog
    v-model="visible"
    append-to-body
    align-center
    class="case-form-dialog"
    destroy-on-close
    :close-on-click-modal="false"
    width="720px"
    :z-index="4000"
    :title="dialogTitle"
    @closed="resetForm"
  >
    <div v-loading="detailLoading">
      <el-form
        ref="formRef"
        class="case-form-dialog__form"
        label-width="96px"
        :model="form"
        :rules="rules"
      >
        <el-form-item
          :label="$t('page.service.case.form.fields.title')"
          prop="title"
        >
          <el-input
            v-model="form.title"
            clearable
            maxlength="120"
            show-word-limit
            :placeholder="$t('page.service.case.form.titlePlaceholder')"
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.service.case.form.fields.caseType')"
          prop="caseType"
        >
          <el-radio-group v-model="form.caseType">
            <el-radio :value="CASE_TYPE_GENERAL">
              {{ $t('page.service.case.type.general') }}
            </el-radio>
            <el-radio :value="CASE_TYPE_SMART">
              {{ $t('page.service.case.type.smart') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          :label="$t('page.service.case.form.fields.status')"
          prop="status"
        >
          <el-radio-group v-model="form.status">
            <el-radio :value="CASE_STATUS_PUBLISHED">
              {{ $t('page.service.case.detail.statusPublished') }}
            </el-radio>
            <el-radio :value="CASE_STATUS_DRAFT">
              {{ $t('page.service.case.detail.statusDraft') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('page.service.case.form.fields.coverImage')">
          <div class="case-form-dialog__image-picker">
            <div class="case-form-dialog__image-slot">
              <div
                v-if="form.coverImage"
                class="case-form-dialog__image-card"
              >
                <el-image
                  class="case-form-dialog__image-thumb"
                  fit="contain"
                  :src="form.coverImage"
                />
                <div class="case-form-dialog__image-actions">
                  <button
                    class="case-form-dialog__image-action"
                    type="button"
                    @click="openImagePreview"
                  >
                    <el-icon><ZoomIn /></el-icon>
                  </button>
                  <button
                    class="case-form-dialog__image-action"
                    type="button"
                    @click="handleImageRemove"
                  >
                    <el-icon><Delete /></el-icon>
                  </button>
                </div>
              </div>

              <el-upload
                v-else
                v-loading="imageUploading"
                drag
                :accept="CASE_IMAGE_ACCEPT"
                class="case-form-dialog__upload-drag"
                :disabled="imageUploading"
                :http-request="handleImageUpload"
                :limit="1"
                :show-file-list="false"
                :before-upload="beforeUpload"
                :on-exceed="handleUploadExceed"
              >
                <el-icon class="case-form-dialog__upload-icon">
                  <UploadFilled />
                </el-icon>
                <div class="el-upload__text">
                  {{ $t('page.service.case.form.dragDropText') }}
                  <em>{{ $t('page.service.case.form.dragDropClick') }}</em>
                </div>
              </el-upload>
            </div>
            <p class="case-form-dialog__hint">
              {{ $t('page.service.case.form.imageHint') }}
            </p>
          </div>
        </el-form-item>

        <el-form-item :label="$t('page.service.case.form.fields.summary')">
          <el-input
            v-model="form.summary"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="300"
            show-word-limit
            type="textarea"
            :placeholder="$t('page.service.case.form.summaryPlaceholder')"
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.service.case.form.fields.content')"
          prop="content"
        >
          <el-input
            v-model="form.content"
            :autosize="{ minRows: 6, maxRows: 14 }"
            maxlength="10000"
            show-word-limit
            type="textarea"
            :placeholder="$t('page.service.case.form.contentPlaceholder')"
          />
        </el-form-item>

        <el-form-item :label="$t('page.service.case.form.fields.tags')">
          <el-select
            v-model="form.tags"
            allow-create
            default-first-option
            filterable
            multiple
            clearable
            class="case-form-dialog__tags"
            :placeholder="$t('page.service.case.form.tagsPlaceholder')"
          />
          <p class="case-form-dialog__hint">
            {{ $t('page.service.case.form.tagsHint') }}
          </p>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.service.case.form.cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="submitting || imageUploading || detailLoading"
        @click="handleSubmit"
      >
        {{ $t('page.service.case.form.submit') }}
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
.case-form-dialog {
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: hsl(var(--muted) / 35%);
    border: 1px dashed var(--el-border-color);
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
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: #fff;
    cursor: pointer;
    background: rgb(255 255 255 / 18%);
    border: 0;
    border-radius: 50%;
  }

  &__upload-drag {
    width: 100%;
    height: 100%;

    :deep(.el-upload),
    :deep(.el-upload-dragger) {
      width: 100%;
      height: 100%;
    }

    :deep(.el-upload-dragger) {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
  }

  &__upload-icon {
    margin-bottom: 8px;
    font-size: 40px;
    color: var(--el-color-primary);
  }

  &__hint {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }

  &__tags {
    width: 100%;
  }
}
</style>
