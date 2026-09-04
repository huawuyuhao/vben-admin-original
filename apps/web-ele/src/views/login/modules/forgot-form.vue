<script lang="ts" setup>
import type { ForgotForm } from '#/types/login';

import { $t } from '@vben/locales';

import { Iphone, Key, Lock } from '@element-plus/icons-vue';

/**
 * 找回密码表单
 */
defineOptions({ name: 'LoginForgotForm' });

defineProps<{
  /** 短信倒计时剩余秒数 */
  countdown: number;
  /** 提交 loading */
  loading?: boolean;
  /** 发送验证码 loading */
  smsLoading?: boolean;
  /** 提交按钮文案 */
  submitText: string;
}>();
const emit = defineEmits<{
  /** 点击获取验证码 */
  sendCode: [];
  /** 提交表单 */
  submit: [];
}>();
/** 表单数据 */
const form = defineModel<ForgotForm>({ required: true });
/** 是否同意用户协议 */
const agreed = defineModel<boolean>('agreed', { required: true });

</script>

<template>
  <el-form class="login-form" @submit.prevent="emit('submit')">
    <el-form-item>
      <el-input
        v-model="form.phone"
        maxlength="11"
        :placeholder="$t('page.login.form.phonePlaceholder')"
        size="large"
        clearable
      >
        <template #prefix>
          <el-icon><Iphone /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item>
      <el-input
        v-model="form.code"
        maxlength="6"
        :placeholder="$t('page.login.form.smsCodePlaceholder')"
        size="large"
        clearable
      >
        <template #prefix>
          <el-icon><Lock /></el-icon>
        </template>
        <template #suffix>
          <el-button
            class="login-form__code-btn"
            :disabled="countdown > 0"
            :loading="smsLoading"
            link
            native-type="button"
            type="primary"
            @click.stop="emit('sendCode')"
          >
            {{
              countdown > 0
                ? $t('page.login.form.codeCountdown', [countdown])
                : $t('page.login.form.getCode')
            }}
          </el-button>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item>
      <el-input
        v-model="form.password"
        :placeholder="$t('page.login.form.newPasswordPlaceholder')"
        show-password
        size="large"
        type="password"
      >
        <template #prefix>
          <el-icon><Key /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item>
      <el-input
        v-model="form.confirmPassword"
        :placeholder="$t('page.login.form.confirmNewPasswordPlaceholder')"
        show-password
        size="large"
        type="password"
      >
        <template #prefix>
          <el-icon><Key /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item class="login-form__agree">
      <el-checkbox v-model="agreed">
        {{ $t('page.login.form.agreePrefix') }}
        <a class="login-form__link" href="javascript:void(0)">{{
          $t('page.login.form.userAgreement')
        }}</a>
      </el-checkbox>
    </el-form-item>

    <el-button
      class="login-form__submit"
      :loading="loading"
      native-type="submit"
      size="large"
      type="primary"
    >
      {{ submitText }}
    </el-button>
  </el-form>
</template>

<style lang="scss" scoped>
@use '../scss/common.scss';
</style>
