<script lang="ts" setup>
/**
 * 按需引入 Element Plus 组件样式
 */
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/form-item/style/css';
import 'element-plus/es/components/image-viewer/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/upload/style/css';

import type { FormInstance, FormRules, UploadFile } from 'element-plus';

import type { PersonalCertFileKey, PersonalCertForm } from '../data';

import { computed, reactive, ref, watch } from 'vue';

import { isEmpty } from '@vben/utils';
import { $t } from '@vben/locales';

import { Delete, UploadFilled, ZoomIn } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  ID_CARD_PATTERN,
  PHONE_PATTERN,
  readFileAsDataUrl,
  validatePersonalCertFile,
} from '../data';

const props = defineProps<{
  /** 表单初值 */
  modelValue: PersonalCertForm;
  /** 是否只读（审核中） */
  readonly?: boolean;
  /** 已认证，可重复申请 */
  canReapply?: boolean;
  /** 是否提交中 */
  submitting?: boolean;
}>();

const emit = defineEmits<{
  reset: [];
  submit: [form: PersonalCertForm];
  'update:modelValue': [form: PersonalCertForm];
}>();

/**
 * 个人认证申请表单（字段与 POST /auth/personal-cert 对齐）
 * 材料上传：UI 已就绪，服务端上传接口待文档接入后再替换本地占位逻辑
 */
defineOptions({ name: 'MineRegisterPersonApplyForm' });

const formRef = ref<FormInstance>();
const form = reactive<PersonalCertForm>({ ...props.modelValue });

/** Upload 组件 file-list（含 url 供拖拽区预览） */
const fileLists = reactive<Record<PersonalCertFileKey, UploadFile[]>>({
  idCardFront: [],
  idCardBack: [],
});

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
const rules = computed<FormRules<PersonalCertForm>>(() => ({
  realName: [
    {
      required: true,
      message: $t('page.mine.register.person.form.realNameRequired'),
      trigger: 'blur',
    },
  ],
  phone: [
    {
      required: true,
      message: $t('page.mine.register.person.form.phoneRequired'),
      trigger: 'blur',
    },
    {
      validator: (_rule, value: string, callback) => {
        const text = String(value ?? '').trim();
        if (!text) {
          callback();
          return;
        }
        if (!PHONE_PATTERN.test(text)) {
          callback(
            new Error($t('page.mine.register.person.form.phoneInvalid')),
          );
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  idCardNo: [
    {
      required: true,
      message: $t('page.mine.register.person.form.idCardNoRequired'),
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
            new Error($t('page.mine.register.person.form.idCardNoInvalid')),
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
      message: $t('page.mine.register.person.form.idCardFrontRequired'),
      trigger: 'change',
    },
  ],
  idCardBack: [
    {
      required: true,
      message: $t('page.mine.register.person.form.idCardBackRequired'),
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
function revokeFileUrls(key: PersonalCertFileKey) {
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
function getFileUrl(key: PersonalCertFileKey): string {
  return String(fileLists[key][0]?.url || form[key] || '').trim();
}

/**
 * 清除某材料文件
 * @param key 材料字段
 */
function clearFile(key: PersonalCertFileKey) {
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
 * 应用选中的材料文件
 * TODO: 上传接口文档到位后，改为调用上传接口，将返回 URL 写入表单字段
 * @param key 材料字段
 * @param uploadFile Upload 文件对象
 */
async function applySelectedFile(
  key: PersonalCertFileKey,
  uploadFile: UploadFile,
) {
  const raw = uploadFile.raw;
  if (!raw) {
    clearFile(key);
    return;
  }

  const check = validatePersonalCertFile(raw);
  if (check !== true) {
    ElMessage.warning(check);
    clearFile(key);
    return;
  }

  revokeFileUrls(key);
  const nextFile: UploadFile = {
    ...uploadFile,
    url: uploadFile.url || URL.createObjectURL(raw),
  };
  fileLists[key] = [nextFile];

  try {
    // 暂无上传接口：先用 Data URL 占位，便于联调提交；正式环境须换真实 URL
    const dataUrl = await readFileAsDataUrl(raw);
    if (isEmpty(dataUrl)) {
      ElMessage.warning($t('page.mine.register.person.message.fileReadFail'));
      clearFile(key);
      return;
    }
    form[key] = dataUrl;
    syncModel();
    formRef.value?.clearValidate(key);
  } catch {
    ElMessage.warning($t('page.mine.register.person.message.fileReadFail'));
    clearFile(key);
  }
}

/**
 * 上传变更回调
 * @param key 材料字段
 * @param uploadFile 当前文件
 */
function onFileChange(key: PersonalCertFileKey, uploadFile: UploadFile) {
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
function onFileExceed(key: PersonalCertFileKey, files: File[]) {
  const raw = files[0];
  if (!raw) {
    return;
  }
  void applySelectedFile(key, toUploadFile(raw));
}

/**
 * 放大预览
 * @param key 材料字段
 * @param event 点击事件
 */
function onPreviewByKey(key: PersonalCertFileKey, event?: Event) {
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
 * 删除材料
 * @param key 材料字段
 * @param event 点击事件
 */
function onRemoveByKey(key: PersonalCertFileKey, event?: Event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (props.readonly) {
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

/**
 * 重置表单
 */
function handleReset() {
  clearFile('idCardFront');
  clearFile('idCardBack');
  form.realName = '';
  form.phone = '';
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
    ElMessage.warning($t('page.mine.register.person.message.readonlyHint'));
    return;
  }
  try {
    await formRef.value?.validate();
  } catch {
    ElMessage.warning($t('page.mine.register.person.message.validateFail'));
    return;
  }
  emit('submit', {
    realName: form.realName.trim(),
    phone: form.phone.trim(),
    idCardNo: form.idCardNo.trim(),
    idCardFront: form.idCardFront,
    idCardBack: form.idCardBack,
  });
}
</script>

<template>
  <section class="person-apply">
    <div v-if="readonly" class="person-apply__banner">
      {{ $t('page.mine.register.person.readonlyBanner') }}
    </div>
    <div
      v-else-if="canReapply"
      class="person-apply__banner person-apply__banner--info"
    >
      {{ $t('page.mine.register.person.reapplyBanner') }}
    </div>
    <div class="person-apply__banner person-apply__banner--muted">
      {{ $t('page.mine.register.person.uploadPendingTip') }}
    </div>

    <el-form
      ref="formRef"
      class="person-apply__form"
      label-position="top"
      :model="form"
      :rules="rules"
      @submit.prevent
    >
      <h4 class="person-apply__section">
        {{ $t('page.mine.register.person.sections.basic') }}
      </h4>

      <div class="person-apply__grid">
        <el-form-item
          class="person-apply__field"
          :label="$t('page.mine.register.person.form.realName')"
          prop="realName"
        >
          <el-input
            v-model="form.realName"
            :disabled="readonly"
            :placeholder="
              $t('page.mine.register.person.form.realNamePlaceholder')
            "
            @change="syncModel"
          />
        </el-form-item>

        <el-form-item
          class="person-apply__field"
          :label="$t('page.mine.register.person.form.phone')"
          prop="phone"
        >
          <el-input
            v-model="form.phone"
            :disabled="readonly"
            maxlength="11"
            :placeholder="$t('page.mine.register.person.form.phonePlaceholder')"
            @change="syncModel"
          />
        </el-form-item>

        <el-form-item
          class="person-apply__field person-apply__field--full"
          :label="$t('page.mine.register.person.form.idCardNo')"
          prop="idCardNo"
        >
          <el-input
            v-model="form.idCardNo"
            :disabled="readonly"
            maxlength="18"
            :placeholder="
              $t('page.mine.register.person.form.idCardNoPlaceholder')
            "
            @change="syncModel"
          />
        </el-form-item>
      </div>

      <h4 class="person-apply__section">
        {{ $t('page.mine.register.person.sections.materials') }}
      </h4>

      <div class="person-apply__uploads">
        <el-form-item
          class="person-apply__upload"
          :label="$t('page.mine.register.person.form.idCardFront')"
          prop="idCardFront"
        >
          <el-upload
            accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            :auto-upload="false"
            class="person-apply__uploader"
            :disabled="readonly"
            drag
            :file-list="fileLists.idCardFront"
            :limit="1"
            :show-file-list="false"
            @change="onIdCardFrontChange"
            @exceed="onIdCardFrontExceed"
          >
            <div v-if="getFileUrl('idCardFront')" class="person-apply__preview">
              <img
                :alt="$t('page.mine.register.person.form.idCardFront')"
                :src="getFileUrl('idCardFront')"
              />
              <div class="person-apply__preview-mask">
                <el-icon
                  class="person-apply__preview-btn"
                  @click="onPreviewByKey('idCardFront', $event)"
                >
                  <ZoomIn />
                </el-icon>
                <el-icon
                  v-if="!readonly"
                  class="person-apply__preview-btn"
                  @click="onRemoveByKey('idCardFront', $event)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
            <template v-else>
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                {{ $t('page.mine.register.person.upload.hint') }}
                <em>{{ $t('page.mine.register.person.upload.hintClick') }}</em>
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                {{ $t('page.mine.register.person.upload.limit') }}
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item
          class="person-apply__upload"
          :label="$t('page.mine.register.person.form.idCardBack')"
          prop="idCardBack"
        >
          <el-upload
            accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            :auto-upload="false"
            class="person-apply__uploader"
            :disabled="readonly"
            drag
            :file-list="fileLists.idCardBack"
            :limit="1"
            :show-file-list="false"
            @change="onIdCardBackChange"
            @exceed="onIdCardBackExceed"
          >
            <div v-if="getFileUrl('idCardBack')" class="person-apply__preview">
              <img
                :alt="$t('page.mine.register.person.form.idCardBack')"
                :src="getFileUrl('idCardBack')"
              />
              <div class="person-apply__preview-mask">
                <el-icon
                  class="person-apply__preview-btn"
                  @click="onPreviewByKey('idCardBack', $event)"
                >
                  <ZoomIn />
                </el-icon>
                <el-icon
                  v-if="!readonly"
                  class="person-apply__preview-btn"
                  @click="onRemoveByKey('idCardBack', $event)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
            <template v-else>
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                {{ $t('page.mine.register.person.upload.hint') }}
                <em>{{ $t('page.mine.register.person.upload.hintClick') }}</em>
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                {{ $t('page.mine.register.person.upload.limit') }}
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </div>

      <div class="person-apply__actions">
        <el-button :disabled="readonly || submitting" @click="handleReset">
          {{ $t('page.mine.register.person.actions.reset') }}
        </el-button>
        <el-button
          :disabled="readonly || submitting"
          :loading="submitting"
          type="primary"
          @click="handleSubmit"
        >
          {{
            canReapply
              ? $t('page.mine.register.person.actions.reapply')
              : $t('page.mine.register.person.actions.submit')
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
.person-apply {
  padding: 22px 24px;
  background: hsl(var(--card) / 0.92);
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: 0 8px 24px hsl(var(--foreground) / 0.05);
  backdrop-filter: blur(8px);

  &__banner {
    margin-bottom: 12px;
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

    &--muted {
      color: hsl(var(--muted-foreground));
      background: hsl(var(--muted) / 0.35);
      border-color: hsl(var(--border));
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

    &:hover .person-apply__preview-mask {
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
  .person-apply {
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
