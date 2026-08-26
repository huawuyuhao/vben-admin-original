<script lang="ts" setup>
import type { AccountLoginForm } from '#/types/login';

import { Lock, User } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

/**
 * 账号密码登录表单
 */
defineOptions({ name: 'LoginAccountForm' });

/** 表单数据 */
const form = defineModel<AccountLoginForm>({ required: true });
/** 是否同意用户协议 */
const agreed = defineModel<boolean>('agreed', { required: true });

defineProps<{
  /** 提交 loading */
  loading?: boolean;
  /** 提交按钮文案 */
  submitText: string;
}>();

const emit = defineEmits<{
  /** 提交表单 */
  submit: [];
}>();
</script>

<template>
  <el-form class="login-form" @submit.prevent="emit('submit')">
    <el-form-item>
      <el-input
        v-model="form.account"
        :placeholder="$t('page.login.form.accountPlaceholder')"
        size="large"
        clearable
      >
        <template #prefix>
          <el-icon><User /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item>
      <el-input
        v-model="form.password"
        :placeholder="$t('page.login.form.passwordPlaceholder')"
        show-password
        size="large"
        type="password"
      >
        <template #prefix>
          <el-icon><Lock /></el-icon>
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
