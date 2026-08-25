<script lang="ts" setup>
/**
 * 按需引入 Element Plus 组件样式
 */
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/dialog/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/form-item/style/css';
import 'element-plus/es/components/input/style/css';

import type { FormInstance, FormRules } from 'element-plus';

import type { ResetPasswordForm } from '../data';

import { reactive, ref, watch } from 'vue';

import { ElMessage } from 'element-plus';

import { updatePasswordApi } from '#/api/mine/profile/info';
import { useAuthStore } from '#/store';

import {
  PASSWORD_PATTERN,
  createResetPasswordForm,
} from '../data';

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
const rules: FormRules<ResetPasswordForm> = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        const text = String(value ?? '');
        if (!PASSWORD_PATTERN.test(text)) {
          callback(
            new Error('至少 8 位，需含大小写字母、数字和特殊字符(@$!%*?&)'),
          );
          return;
        }
        if (text === form.oldPassword) {
          callback(new Error('新密码不能与旧密码相同'));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (String(value ?? '') !== form.newPassword) {
          callback(new Error('两次输入的新密码不一致'));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
};

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
    ElMessage.success('密码已修改，请重新登录');
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
    title="重置密码"
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
      <el-form-item label="旧密码" prop="oldPassword" required>
        <el-input
          v-model="form.oldPassword"
          type="password"
          show-password
          placeholder="请输入当前密码"
          autocomplete="current-password"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword" required>
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          placeholder="至少 8 位，含大小写、数字与特殊字符"
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword" required>
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
          autocomplete="new-password"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="reset-pwd-dialog__footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确认修改
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
      color: #3d4659;
    }

    :deep(.el-input__wrapper) {
      min-height: 40px;
      border-radius: 10px;
      box-shadow: 0 0 0 1px #dde1ec inset;

      &:hover {
        box-shadow: 0 0 0 1px #c5cbe0 inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px #6b4cff inset;
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
