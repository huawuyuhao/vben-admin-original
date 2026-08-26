<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';

import type { ResetPasswordForm } from '../data';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { updatePasswordApi } from '#/api/mine/profile/info';
import { useAuthStore } from '#/store';

import { createResetPasswordForm, PASSWORD_PATTERN } from '../data';

const props = defineProps<{
  /** 是否显示弹窗 */
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [visible: boolean];
}>();

/**
 * 重置密码弹窗（成功后退出并回登录页）
 */
defineOptions({ name: 'MineProfileResetPasswordDialog' });

const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const submitting = ref(false);
const form = reactive<ResetPasswordForm>(createResetPasswordForm());

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      Object.assign(form, createResetPasswordForm());
      formRef.value?.clearValidate();
    }
  },
);

/** 表单校验规则 */
const rules = computed<FormRules<ResetPasswordForm>>(() => ({
  oldPassword: [
    {
      required: true,
      message: $t('page.mine.profile.resetPwd.oldPasswordRequired'),
      trigger: 'blur',
    },
  ],
  newPassword: [
    {
      required: true,
      message: $t('page.mine.profile.resetPwd.newPasswordRequired'),
      trigger: 'blur',
    },
    {
      validator: (_rule, value: string, callback) => {
        const text = String(value ?? '');
        if (!PASSWORD_PATTERN.test(text)) {
          callback(new Error($t('page.mine.profile.resetPwd.passwordRule')));
          return;
        }
        if (text === form.oldPassword) {
          callback(new Error($t('page.mine.profile.resetPwd.sameAsOld')));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: $t('page.mine.profile.resetPwd.confirmPasswordRequired'),
      trigger: 'blur',
    },
    {
      validator: (_rule, value: string, callback) => {
        if (String(value ?? '') !== form.newPassword) {
          callback(new Error($t('page.mine.profile.resetPwd.confirmMismatch')));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
}));

/**
 * 关闭弹窗
 */
function closeDialog() {
  emit('update:modelValue', false);
}

/**
 * 提交重置密码；成功后退出登录并进入登录页
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  submitting.value = true;
  try {
    await updatePasswordApi({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });
    ElMessage.success($t('page.mine.profile.resetPwd.success'));
    closeDialog();
    // 不带 redirect，直接回登录页
    await authStore.logout(false);
  } catch {
    // 错误提示由请求拦截器处理
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="$t('page.mine.profile.resetPwd.title')"
    width="440px"
    align-center
    destroy-on-close
    class="reset-pwd-dialog"
    @close="closeDialog"
  >
    <el-form
      ref="formRef"
      label-position="top"
      require-asterisk-position="right"
      :model="form"
      :rules="rules"
      class="reset-pwd-dialog__form"
      @submit.prevent
    >
      <el-form-item
        :label="$t('page.mine.profile.resetPwd.oldPassword')"
        prop="oldPassword"
        required
      >
        <el-input
          v-model="form.oldPassword"
          type="password"
          show-password
          :placeholder="$t('page.mine.profile.resetPwd.oldPasswordPlaceholder')"
          autocomplete="current-password"
        />
      </el-form-item>
      <el-form-item
        :label="$t('page.mine.profile.resetPwd.newPassword')"
        prop="newPassword"
        required
      >
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          :placeholder="$t('page.mine.profile.resetPwd.newPasswordPlaceholder')"
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item
        :label="$t('page.mine.profile.resetPwd.confirmPassword')"
        prop="confirmPassword"
        required
      >
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          :placeholder="$t('page.mine.profile.resetPwd.confirmPasswordPlaceholder')"
          autocomplete="new-password"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="reset-pwd-dialog__footer">
        <el-button @click="closeDialog">
          {{ $t('page.mine.profile.resetPwd.cancel') }}
        </el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ $t('page.mine.profile.resetPwd.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.reset-pwd-dialog {
  &__form {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    :deep(.el-form-item__label) {
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: hsl(var(--foreground));
    }

    :deep(.el-input__wrapper) {
      min-height: 40px;
      border-radius: 10px;
      box-shadow: 0 0 0 1px hsl(var(--border)) inset;

      &:hover {
        box-shadow: 0 0 0 1px hsl(var(--primary) / 0.35) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px hsl(var(--primary)) inset;
      }
    }
  }

  &__footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;

    :deep(.el-button) {
      min-width: 96px;
      border-radius: 10px;
    }
  }
}
</style>
