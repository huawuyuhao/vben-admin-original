<script lang="ts" setup>
import type { RegisterForm } from '#/types/login';

import { Iphone, Key, Lock, OfficeBuilding, User } from '@element-plus/icons-vue';

import { REGISTER_INDUSTRY_OPTIONS } from '../data';

/**
 * 账号注册表单（字段与 POST /auth/register 对齐）
 */
defineOptions({ name: 'LoginRegisterForm' });

/** 表单数据 */
const form = defineModel<RegisterForm>({ required: true });
/** 是否同意用户协议 */
const agreed = defineModel<boolean>('agreed', { required: true });

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
</script>

<template>
  <el-form class="login-form" @submit.prevent="emit('submit')">
    <el-form-item>
      <el-input
        v-model="form.username"
        placeholder="请输入用户名"
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
        placeholder="请输入真实姓名"
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
        placeholder="请输入手机号"
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
        placeholder="请输入短信验证码"
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
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </el-button>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item>
      <el-select
        v-model="form.industryType"
        class="login-form__select"
        clearable
        placeholder="请选择行业属性"
        size="large"
      >
        <template #prefix>
          <el-icon><OfficeBuilding /></el-icon>
        </template>
        <el-option
          v-for="item in REGISTER_INDUSTRY_OPTIONS"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-input
        v-model="form.password"
        placeholder="设置密码（8位+大小写+数字+特殊字符）"
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
        placeholder="再次确认密码"
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
        我已阅读并同意
        <a class="login-form__link" href="javascript:void(0)">《用户协议》</a>
        与
        <a class="login-form__link" href="javascript:void(0)">《隐私政策》</a>
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
