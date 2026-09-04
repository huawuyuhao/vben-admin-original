<script lang="ts" setup>
import type { RegisterForm } from '#/types/login';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import { Iphone, Key, Lock, OfficeBuilding, User } from '@element-plus/icons-vue';

import { getRegisterIndustryOptions } from '../data';

/**
 * 账号注册表单（字段与 POST /auth/register 对齐）
 * 密码等校验在提交时由页面逻辑用 ElMessage 提示，避免错误文案挤占行高
 */
defineOptions({ name: 'LoginRegisterForm' });

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
const form = defineModel<RegisterForm>({ required: true });
/** 是否同意用户协议 */
const agreed = defineModel<boolean>('agreed', { required: true });

/** 行业属性下拉选项（value 为接口枚举） */
const industryOptions = computed(() => getRegisterIndustryOptions());
</script>

<template>
  <el-form class="login-form" @submit.prevent="emit('submit')">
    <el-form-item>
      <el-input
        v-model="form.username"
        :placeholder="$t('page.login.form.usernamePlaceholder')"
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
        v-model="form.realName"
        :placeholder="$t('page.login.form.realNamePlaceholder')"
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
      <el-select
        v-model="form.industryType"
        class="login-form__select"
        clearable
        :placeholder="$t('page.login.form.industryPlaceholder')"
        size="large"
      >
        <template #prefix>
          <el-icon><OfficeBuilding /></el-icon>
        </template>
        <el-option
          v-for="item in industryOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-input
        v-model="form.password"
        :placeholder="$t('page.login.form.setPasswordPlaceholder')"
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
        :placeholder="$t('page.login.form.confirmPasswordPlaceholder')"
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
        {{ $t('page.login.form.and') }}
        <a class="login-form__link" href="javascript:void(0)">{{
          $t('page.login.form.privacyPolicy')
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
