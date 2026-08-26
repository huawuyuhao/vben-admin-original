<script lang="ts" setup>
/**
 * 按需引入 Element Plus 组件样式
 */
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/form-item/style/css';
import 'element-plus/es/components/image-viewer/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/loading/style/css';
import 'element-plus/es/components/upload/style/css';

import type { FormInstance, FormRules, UploadFile } from 'element-plus';

import type { CertFileKey, EnterpriseCertForm } from '../data';

import { computed, reactive, ref, watch } from 'vue';

import { isEmpty } from '@vben/utils';
import { $t } from '@vben/locales';

import { Delete, UploadFilled, ZoomIn } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { uploadImageApi } from '#/api/common';

import { ID_CARD_PATTERN, validateCertFile } from '../data';

const props = defineProps<{
  /** 表单初值 */
  modelValue: EnterpriseCertForm;
  /** 是否只读（审核中） */
  readonly?: boolean;
  /** 已认证，可重复申请 */
  canReapply?: boolean;
  /** 是否提交中 */
  submitting?: boolean;
}>();

const emit = defineEmits<{
  reset: [];
  submit: [form: EnterpriseCertForm];
  'update:modelValue': [form: EnterpriseCertForm];
}>();

/**
 * 企业认证申请表单（字段与 POST /auth/enterprise-cert 对齐）
 * 材料先调统一上传接口拿 url，再写入表单供提交
 */
defineOptions({ name: 'MineRegisterEnterpriseApplyForm' });

const formRef = ref<FormInstance>();
const form = reactive<EnterpriseCertForm>({ ...props.modelValue });

/** Upload 组件 file-list（含 url 供拖拽区预览） */
const fileLists = reactive<Record<CertFileKey, UploadFile[]>>({
  idCardFront: [],
  idCardBack: [],
  businessLicense: [],
});

/** 各材料字段是否正在上传 */
const uploadingMap = reactive<Record<CertFileKey, boolean>>({
  idCardFront: false,
  idCardBack: false,
  businessLicense: false,
});

/** 任一材料上传中（用于全局 loading，防止重复上传） */
const isUploading = computed(() =>
  Object.values(uploadingMap).some(Boolean),
);

/** 图片放大预览 */
const previewVisible = ref(false);
const previewUrl = ref('');

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(form, val);
  },
  { deep: true, immediate: true },
);

/** 表单校验规则 */
const rules = computed<FormRules<EnterpriseCertForm>>(() => ({
  enterpriseId: [
    {
      required: true,
      message: $t('page.mine.register.enterprise.form.enterpriseIdRequired'),
      trigger: 'blur',
    },
    {
      validator: (_rule, value: string, callback) => {
        const text = String(value ?? '').trim();
        if (!text) {
          callback();
          return;
        }
        const id = Number(text);
        if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
          callback(
            new Error(
              $t('page.mine.register.enterprise.form.enterpriseIdInvalid'),
            ),
          );
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  legalPersonName: [
    {
      required: true,
      message: $t('page.mine.register.enterprise.form.legalPersonNameRequired'),
      trigger: 'blur',
    },
  ],
  idCardNo: [
    {
      required: true,
      message: $t('page.mine.register.enterprise.form.idCardNoRequired'),
      trigger: 'blur',
    },
    {
      validator: (_rule, value: string, callback) => {
        const text = String(value ?? '').trim();
        if (!text) {
          callback();
          return;
        }
        if (!ID_CARD_PATTERN.test(text)) {
          callback(
            new Error($t('page.mine.register.enterprise.form.idCardNoInvalid')),
          );
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  idCardFront: [
    {
      required: true,
      message: $t('page.mine.register.enterprise.form.idCardFrontRequired'),
      trigger: 'change',
    },
  ],
  idCardBack: [
    {
      required: true,
      message: $t('page.mine.register.enterprise.form.idCardBackRequired'),
      trigger: 'change',
    },
  ],
  businessLicense: [
    {
      required: true,
      message: $t(
        'page.mine.register.enterprise.form.businessLicenseRequired',
      ),
      trigger: 'change',
    },
  ],
}));

/**
 * 同步表单到父组件
 */
function syncModel() {
  emit('update:modelValue', { ...form });
}

/**
 * 释放某字段已占用的 object URL
 * @param key 材料字段
 */
function revokeFileUrls(key: CertFileKey) {
  for (const item of fileLists[key]) {
    if (item.url?.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
  }
}

/**
 * 取材料预览地址
 * @param key 材料字段
 * @returns 预览 URL
 */
function getFileUrl(key: CertFileKey): string {
  return String(fileLists[key][0]?.url || form[key] || '').trim();
}

/**
 * 清除某材料文件
 * @param key 材料字段
 */
function clearFile(key: CertFileKey) {
  revokeFileUrls(key);
  fileLists[key] = [];
  form[key] = '';
  syncModel();
  formRef.value?.clearValidate(key);
}

/**
 * 将原始 File 包装为带预览地址的 UploadFile
 * @param raw 原始文件
 * @returns Upload 文件对象
 */
function toUploadFile(raw: File): UploadFile {
  return {
    name: raw.name,
    percentage: 0,
    raw: raw as UploadFile['raw'],
    size: raw.size,
    status: 'ready',
    uid: Date.now(),
    url: URL.createObjectURL(raw),
  };
}

/**
 * 应用选中的材料文件：本地预览 + 调用统一上传接口写入 url
 * @param key 材料字段
 * @param uploadFile Upload 文件对象
 */
async function applySelectedFile(key: CertFileKey, uploadFile: UploadFile) {
  const raw = uploadFile.raw;
  if (!raw) {
    clearFile(key);
    return;
  }

  if (isUploading.value) {
    ElMessage.warning($t('page.mine.register.enterprise.message.uploadBusy'));
    return;
  }

  const check = validateCertFile(raw);
  if (check !== true) {
    ElMessage.warning(check);
    clearFile(key);
    return;
  }

  revokeFileUrls(key);
  const localUrl = uploadFile.url || URL.createObjectURL(raw);
  const nextFile: UploadFile = {
    ...uploadFile,
    url: localUrl,
  };
  fileLists[key] = [nextFile];
  // 上传完成前先清空业务 url，避免误提交本地地址
  form[key] = '';
  syncModel();

  uploadingMap[key] = true;
  try {
    const result = await uploadImageApi(raw);
    const url = String(result?.url ?? '').trim();
    if (isEmpty(url)) {
      ElMessage.error($t('page.mine.register.enterprise.message.uploadFail'));
      clearFile(key);
      return;
    }
    // 预览优先用服务端 url；无 http 时保留本地 blob
    if (fileLists[key][0]) {
      if (localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localUrl);
      }
      fileLists[key][0] = { ...fileLists[key][0], url };
    }
    form[key] = url;
    syncModel();
    formRef.value?.clearValidate(key);
  } catch {
    // 错误提示由请求拦截器处理
    clearFile(key);
  } finally {
    uploadingMap[key] = false;
  }
}

/**
 * 上传变更回调
 * @param key 材料字段
 * @param uploadFile 当前文件
 */
function onFileChange(key: CertFileKey, uploadFile: UploadFile) {
  if (uploadFile.status === 'fail' || !uploadFile.raw) {
    return;
  }
  void applySelectedFile(key, uploadFile);
}

/**
 * 超出数量限制时替换为最新文件
 * @param key 材料字段
 * @param files 本次选中的原始文件列表
 */
function onFileExceed(key: CertFileKey, files: File[]) {
  const raw = files[0];
  if (!raw) {
    return;
  }
  void applySelectedFile(key, toUploadFile(raw));
}

/**
 * 放大预览
 * @param key 材料字段
 * @param event 点击事件（阻止冒泡打开文件选择）
 */
function onPreviewByKey(key: CertFileKey, event?: Event) {
  event?.preventDefault();
  event?.stopPropagation();
  const url = getFileUrl(key);
  if (isEmpty(url)) {
    return;
  }
  previewUrl.value = url;
  previewVisible.value = true;
}

/**
 * 删除材料（拖拽区内操作按钮）
 * @param key 材料字段
 * @param event 点击事件
 */
function onRemoveByKey(key: CertFileKey, event?: Event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (props.readonly || isUploading.value) {
    return;
  }
  clearFile(key);
}

/**
 * 关闭放大预览
 */
function closePreview() {
  previewVisible.value = false;
  previewUrl.value = '';
}

/** 正面变更 */
function onIdCardFrontChange(file: UploadFile) {
  onFileChange('idCardFront', file);
}
/** 正面超限替换 */
function onIdCardFrontExceed(files: File[]) {
  onFileExceed('idCardFront', files);
}

/** 反面变更 */
function onIdCardBackChange(file: UploadFile) {
  onFileChange('idCardBack', file);
}
/** 反面超限替换 */
function onIdCardBackExceed(files: File[]) {
  onFileExceed('idCardBack', files);
}

/** 营业执照变更 */
function onBusinessLicenseChange(file: UploadFile) {
  onFileChange('businessLicense', file);
}
/** 营业执照超限替换 */
function onBusinessLicenseExceed(files: File[]) {
  onFileExceed('businessLicense', files);
}

/**
 * 重置表单内容与本地预览
 */
function handleReset() {
  clearFile('idCardFront');
  clearFile('idCardBack');
  clearFile('businessLicense');
  form.legalPersonName = '';
  form.idCardNo = '';
  syncModel();
  formRef.value?.clearValidate();
  emit('reset');
}

/**
 * 校验并提交
 */
async function handleSubmit() {
  if (props.readonly) {
    ElMessage.warning($t('page.mine.register.enterprise.message.readonlyHint'));
    return;
  }
  if (isUploading.value) {
    ElMessage.warning($t('page.mine.register.enterprise.message.uploadBusy'));
    return;
  }
  try {
    await formRef.value?.validate();
  } catch {
    ElMessage.warning($t('page.mine.register.enterprise.message.validateFail'));
    return;
  }
  emit('submit', {
    enterpriseId: form.enterpriseId.trim(),
    legalPersonName: form.legalPersonName.trim(),
    idCardNo: form.idCardNo.trim(),
    idCardFront: form.idCardFront,
    idCardBack: form.idCardBack,
    businessLicense: form.businessLicense,
  });
}
</script>

<template>
  <section class="ent-apply">
    <div v-if="readonly" class="ent-apply__banner">
      {{ $t('page.mine.register.enterprise.readonlyBanner') }}
    </div>
    <div v-else-if="canReapply" class="ent-apply__banner ent-apply__banner--info">
      {{ $t('page.mine.register.enterprise.reapplyBanner') }}
    </div>

    <el-form
      ref="formRef"
      class="ent-apply__form"
      label-position="top"
      :model="form"
      :rules="rules"
      @submit.prevent
    >
      <h4 class="ent-apply__section">
        {{ $t('page.mine.register.enterprise.sections.basic') }}
      </h4>

      <div class="ent-apply__grid">
        <el-form-item
          class="ent-apply__field ent-apply__field--full"
          :label="$t('page.mine.register.enterprise.form.enterpriseId')"
          prop="enterpriseId"
        >
          <el-input
            v-model="form.enterpriseId"
            :disabled="readonly"
            :placeholder="
              $t('page.mine.register.enterprise.form.enterpriseIdPlaceholder')
            "
            @change="syncModel"
          />
        </el-form-item>

        <el-form-item
          class="ent-apply__field"
          :label="$t('page.mine.register.enterprise.form.legalPersonName')"
          prop="legalPersonName"
        >
          <el-input
            v-model="form.legalPersonName"
            :disabled="readonly"
            :placeholder="
              $t(
                'page.mine.register.enterprise.form.legalPersonNamePlaceholder',
              )
            "
            @change="syncModel"
          />
        </el-form-item>

        <el-form-item
          class="ent-apply__field"
          :label="$t('page.mine.register.enterprise.form.idCardNo')"
          prop="idCardNo"
        >
          <el-input
            v-model="form.idCardNo"
            :disabled="readonly"
            maxlength="18"
            :placeholder="
              $t('page.mine.register.enterprise.form.idCardNoPlaceholder')
            "
            @change="syncModel"
          />
        </el-form-item>
      </div>

      <h4 class="ent-apply__section">
        {{ $t('page.mine.register.enterprise.sections.materials') }}
      </h4>

      <div
        v-loading="isUploading"
        class="ent-apply__uploads"
        :element-loading-text="
          $t('page.mine.register.enterprise.message.uploading')
        "
      >
        <el-form-item
          class="ent-apply__upload"
          :label="$t('page.mine.register.enterprise.form.idCardFront')"
          prop="idCardFront"
        >
          <el-upload
            accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            :auto-upload="false"
            class="ent-apply__uploader"
            :disabled="readonly || isUploading"
            drag
            :file-list="fileLists.idCardFront"
            :limit="1"
            :show-file-list="false"
            @change="onIdCardFrontChange"
            @exceed="onIdCardFrontExceed"
          >
            <div v-if="getFileUrl('idCardFront')" class="ent-apply__preview">
              <img
                :alt="$t('page.mine.register.enterprise.form.idCardFront')"
                :src="getFileUrl('idCardFront')"
              />
              <div class="ent-apply__preview-mask">
                <el-icon
                  class="ent-apply__preview-btn"
                  @click="onPreviewByKey('idCardFront', $event)"
                >
                  <ZoomIn />
                </el-icon>
                <el-icon
                  v-if="!readonly && !isUploading"
                  class="ent-apply__preview-btn"
                  @click="onRemoveByKey('idCardFront', $event)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
            <template v-else>
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                {{ $t('page.mine.register.enterprise.upload.hint') }}
                <em>{{ $t('page.mine.register.enterprise.upload.hintClick') }}</em>
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                {{ $t('page.mine.register.enterprise.upload.limit') }}
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item
          class="ent-apply__upload"
          :label="$t('page.mine.register.enterprise.form.idCardBack')"
          prop="idCardBack"
        >
          <el-upload
            accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            :auto-upload="false"
            class="ent-apply__uploader"
            :disabled="readonly || isUploading"
            drag
            :file-list="fileLists.idCardBack"
            :limit="1"
            :show-file-list="false"
            @change="onIdCardBackChange"
            @exceed="onIdCardBackExceed"
          >
            <div v-if="getFileUrl('idCardBack')" class="ent-apply__preview">
              <img
                :alt="$t('page.mine.register.enterprise.form.idCardBack')"
                :src="getFileUrl('idCardBack')"
              />
              <div class="ent-apply__preview-mask">
                <el-icon
                  class="ent-apply__preview-btn"
                  @click="onPreviewByKey('idCardBack', $event)"
                >
                  <ZoomIn />
                </el-icon>
                <el-icon
                  v-if="!readonly && !isUploading"
                  class="ent-apply__preview-btn"
                  @click="onRemoveByKey('idCardBack', $event)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
            <template v-else>
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                {{ $t('page.mine.register.enterprise.upload.hint') }}
                <em>{{ $t('page.mine.register.enterprise.upload.hintClick') }}</em>
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                {{ $t('page.mine.register.enterprise.upload.limit') }}
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item
          class="ent-apply__upload ent-apply__upload--full"
          :label="$t('page.mine.register.enterprise.form.businessLicense')"
          prop="businessLicense"
        >
          <el-upload
            accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            :auto-upload="false"
            class="ent-apply__uploader"
            :disabled="readonly || isUploading"
            drag
            :file-list="fileLists.businessLicense"
            :limit="1"
            :show-file-list="false"
            @change="onBusinessLicenseChange"
            @exceed="onBusinessLicenseExceed"
          >
            <div v-if="getFileUrl('businessLicense')" class="ent-apply__preview">
              <img
                :alt="$t('page.mine.register.enterprise.form.businessLicense')"
                :src="getFileUrl('businessLicense')"
              />
              <div class="ent-apply__preview-mask">
                <el-icon
                  class="ent-apply__preview-btn"
                  @click="onPreviewByKey('businessLicense', $event)"
                >
                  <ZoomIn />
                </el-icon>
                <el-icon
                  v-if="!readonly && !isUploading"
                  class="ent-apply__preview-btn"
                  @click="onRemoveByKey('businessLicense', $event)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
            <template v-else>
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                {{ $t('page.mine.register.enterprise.upload.hint') }}
                <em>{{ $t('page.mine.register.enterprise.upload.hintClick') }}</em>
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                {{ $t('page.mine.register.enterprise.upload.limit') }}
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </div>

      <div class="ent-apply__actions">
        <el-button
          :disabled="readonly || submitting || isUploading"
          @click="handleReset"
        >
          {{ $t('page.mine.register.enterprise.actions.reset') }}
        </el-button>
        <el-button
          :disabled="readonly || submitting || isUploading"
          :loading="submitting"
          type="primary"
          @click="handleSubmit"
        >
          {{
            canReapply
              ? $t('page.mine.register.enterprise.actions.reapply')
              : $t('page.mine.register.enterprise.actions.submit')
          }}
        </el-button>
      </div>
    </el-form>

    <el-image-viewer
      v-if="previewVisible"
      teleported
      :url-list="[previewUrl]"
      @close="closePreview"
    />
  </section>
</template>

<style lang="scss" scoped>
.ent-apply {
  padding: 22px 24px;
  background: hsl(var(--card) / 0.92);
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: 0 8px 24px hsl(var(--foreground) / 0.05);
  backdrop-filter: blur(8px);

  &__banner {
    margin-bottom: 16px;
    padding: 10px 12px;
    font-size: 13px;
    color: #b86e00;
    background: #fff8eb;
    border: 1px solid #ffe2a8;
    border-radius: 8px;

    &--info {
      color: hsl(var(--primary));
      background: hsl(var(--primary) / 0.08);
      border-color: hsl(var(--primary) / 0.28);
    }
  }

  &__section {
    margin: 8px 0 16px;
    padding-left: 10px;
    font-size: 15px;
    font-weight: 700;
    color: hsl(var(--foreground));
    border-left: 3px solid hsl(var(--primary));
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 16px;
    margin-bottom: 12px;
  }

  &__field {
    &--full {
      grid-column: 1 / -1;
    }
  }

  &__uploads {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
  }

  &__upload {
    :deep(.el-form-item__content) {
      display: block;
      width: 100%;
      line-height: normal;
    }

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__uploader {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: auto;
      min-height: 180px;
      padding: 20px;
      background: hsl(var(--background));
      border: 1px dashed hsl(var(--primary) / 0.35);
      border-radius: 10px;

      &:hover {
        border-color: hsl(var(--primary));
      }
    }

    :deep(.el-icon--upload) {
      margin-bottom: 8px;
      font-size: 48px;
      color: hsl(var(--primary));
    }

    :deep(.el-upload__text) {
      font-size: 14px;
      color: hsl(var(--foreground));

      em {
        font-style: normal;
        color: hsl(var(--primary));
      }
    }

    :deep(.el-upload__tip) {
      margin-top: 8px;
      font-size: 12px;
      color: hsl(var(--muted-foreground));
      text-align: center;
    }
  }

  &__preview {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 140px;

    img {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
      border-radius: 6px;
    }

    &:hover .ent-apply__preview-mask {
      opacity: 1;
    }
  }

  &__preview-mask {
    position: absolute;
    inset: 0;
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgb(0 0 0 / 45%);
    border-radius: 6px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &__preview-btn {
    font-size: 22px;
    cursor: pointer;
    transition: transform 0.15s ease;

    &:hover {
      transform: scale(1.12);
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 18px;
    border-top: 1px solid hsl(var(--border));
  }
}

@media (max-width: 768px) {
  .ent-apply {
    &__grid,
    &__uploads {
      grid-template-columns: 1fr;
    }

    &__actions {
      flex-direction: column-reverse;

      :deep(.el-button) {
        width: 100%;
        margin: 0;
      }
    }
  }
}
</style>
