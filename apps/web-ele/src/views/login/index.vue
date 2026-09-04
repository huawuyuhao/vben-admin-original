<script lang="ts" setup>
import { $t } from '@vben/locales';

import { useLoginPage } from './data';
import AccountForm from './modules/account-form.vue';
import BrandAside from './modules/brand-aside.vue';
import ForgotForm from './modules/forgot-form.vue';
import RegisterForm from './modules/register-form.vue';
import RoleTabs from './modules/role-tabs.vue';
import SmsForm from './modules/sms-form.vue';

/**
 * 门户登录 / 注册页入口
 */
defineOptions({ name: 'PortalAuth' });

const {
  accountForm,
  agreed,
  countdown,
  forgotForm,
  handleSubmit,
  loading,
  mode,
  pageMeta,
  registerForm,
  sendCode,
  setMode,
  showRoleTabs,
  smsForm,
  smsLoading,
  userEnterType,
} = useLoginPage();
</script>

<template>
  <div class="portal-auth">
    <div class="portal-auth__bg" aria-hidden="true">
      <span class="portal-auth__orb portal-auth__orb--a"></span>
      <span class="portal-auth__orb portal-auth__orb--b"></span>
      <span class="portal-auth__orb portal-auth__orb--c"></span>
      <span class="portal-auth__grid"></span>
    </div>

    <div class="portal-auth__stage">
      <BrandAside />

      <div class="portal-auth__card">
        <div class="portal-auth__head">
          <div>
            <h2>{{ pageMeta.title }}</h2>
            <p>{{ pageMeta.hint }}</p>
          </div>
          <el-button
            v-if="mode === 'sms'"
            class="portal-auth__switch"
            link
            type="primary"
            @click="setMode('account')"
          >
            {{ $t('page.login.mode.accountLogin') }}
          </el-button>
          <el-button
            v-else-if="mode === 'account'"
            class="portal-auth__switch"
            link
            type="primary"
            @click="setMode('sms')"
          >
            {{ $t('page.login.mode.smsLogin') }}
          </el-button>
          <el-button
            v-else
            class="portal-auth__switch"
            link
            type="primary"
            @click="setMode('sms')"
          >
            {{ $t('page.login.mode.backToLogin') }}
          </el-button>
        </div>

        <RoleTabs v-if="showRoleTabs" v-model="userEnterType" />

        <SmsForm
          v-if="mode === 'sms'"
          v-model="smsForm"
          v-model:agreed="agreed"
          :countdown="countdown"
          :loading="loading"
          :sms-loading="smsLoading"
          :submit-text="pageMeta.submit"
          @send-code="sendCode"
          @submit="handleSubmit"
        />

        <AccountForm
          v-else-if="mode === 'account'"
          v-model="accountForm"
          v-model:agreed="agreed"
          :loading="loading"
          :submit-text="pageMeta.submit"
          @submit="handleSubmit"
        />

        <RegisterForm
          v-else-if="mode === 'register'"
          v-model="registerForm"
          v-model:agreed="agreed"
          :countdown="countdown"
          :loading="loading"
          :sms-loading="smsLoading"
          :submit-text="pageMeta.submit"
          @send-code="sendCode"
          @submit="handleSubmit"
        />

        <ForgotForm
          v-else
          v-model="forgotForm"
          v-model:agreed="agreed"
          :countdown="countdown"
          :loading="loading"
          :sms-loading="smsLoading"
          :submit-text="pageMeta.submit"
          @send-code="sendCode"
          @submit="handleSubmit"
        />

        <div class="portal-auth__footer">
          <el-button
            v-if="mode !== 'register'"
            link
            type="primary"
            @click="setMode('register')"
          >
            {{ $t('page.login.footer.registerNow') }}
          </el-button>
          <el-button v-else link type="primary" @click="setMode('sms')">
            {{ $t('page.login.footer.hasAccount') }}
          </el-button>
          <el-button
            v-if="mode !== 'forgot'"
            link
            type="primary"
            @click="setMode('forgot')"
          >
            {{ $t('page.login.footer.forgotPassword') }}
          </el-button>
          <el-button v-else link type="primary" @click="setMode('account')">
            {{ $t('page.login.mode.backToAccountLogin') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.portal-auth {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--portal-header-height, 50px));
  padding: 40px 24px;
  overflow: hidden;
  background: var(--portal-auth-bg, #f5f4fb);

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(48px);
    will-change: transform, opacity;

    &--a {
      top: -10%;
      left: -6%;
      width: 440px;
      height: 440px;
      background: radial-gradient(
        circle,
        var(--portal-auth-orb-a, rgb(107 76 255 / 38%)),
        transparent 70%
      );
      animation: portal-auth-orb-a 16s ease-in-out infinite;
    }

    &--b {
      right: -8%;
      bottom: -12%;
      width: 480px;
      height: 480px;
      background: radial-gradient(
        circle,
        var(--portal-auth-orb-b, rgb(0 200 83 / 24%)),
        transparent 70%
      );
      animation: portal-auth-orb-b 20s ease-in-out infinite;
    }

    &--c {
      top: 34%;
      left: 40%;
      width: 300px;
      height: 300px;
      background: radial-gradient(
        circle,
        var(--portal-auth-orb-c, rgb(33 150 243 / 18%)),
        transparent 70%
      );
      animation: portal-auth-orb-c 13s ease-in-out infinite;
    }
  }

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(
        var(--portal-auth-grid, rgb(107 76 255 / 4.5%)) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        var(--portal-auth-grid, rgb(107 76 255 / 4.5%)) 1px,
        transparent 1px
      );
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse at center, #000 28%, transparent 76%);
    animation: portal-auth-grid-pulse 8s ease-in-out infinite;
  }

  &__stage {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 40px;
    align-items: center;
    width: min(980px, 100%);
  }

  &__card {
    padding: 32px 34px 26px;
    background: var(--portal-auth-card, rgb(255 255 255 / 88%));
    border: 1px solid var(--portal-auth-border, rgb(107 76 255 / 10%));
    border-radius: 16px;
    box-shadow:
      0 20px 50px rgb(67 56 120 / 10%),
      0 2px 8px rgb(0 0 0 / 3%);
    backdrop-filter: blur(16px);
  }

  &__head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 750;
      color: var(--portal-auth-title, #1f2430);
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      color: var(--portal-auth-hint, #8a94a6);
    }
  }

  &__switch {
    flex-shrink: 0;
    margin-top: 4px;
    font-size: 13px;
    font-weight: 600;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    margin-top: 18px;

    :deep(.el-button) {
      padding: 0;
      font-size: 13px;
      font-weight: 600;
    }
  }
}

@keyframes portal-auth-orb-a {
  0%,
  100% {
    opacity: 0.48;
    transform: translate3d(0, 0, 0) scale(1);
  }

  35% {
    opacity: 0.78;
    transform: translate3d(48px, 36px, 0) scale(1.1);
  }

  70% {
    opacity: 0.36;
    transform: translate3d(-28px, 56px, 0) scale(0.92);
  }
}

@keyframes portal-auth-orb-b {
  0%,
  100% {
    opacity: 0.42;
    transform: translate3d(0, 0, 0) scale(1);
  }

  40% {
    opacity: 0.7;
    transform: translate3d(-52px, -40px, 0) scale(1.08);
  }

  75% {
    opacity: 0.32;
    transform: translate3d(36px, -24px, 0) scale(0.94);
  }
}

@keyframes portal-auth-orb-c {
  0%,
  100% {
    opacity: 0.38;
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    opacity: 0.66;
    transform: translate3d(28px, -44px, 0) scale(1.14);
  }
}

@keyframes portal-auth-grid-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 0.95;
  }
}

@media (prefers-reduced-motion: reduce) {
  .portal-auth {
    &__orb,
    &__grid {
      animation: none;
    }
  }
}

@media (max-width: 900px) {
  .portal-auth {
    &__stage {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
}

@media (max-width: 480px) {
  .portal-auth {
    padding: 24px 14px;

    &__card {
      padding: 24px 18px 20px;
    }
  }
}
</style>
