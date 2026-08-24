<script lang="ts" setup>
import { computed, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { IconifyIcon } from '@vben/icons';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'PortalAuth' });

type AuthMode = 'account' | 'forgot' | 'register' | 'sms';
type UserRole = 'demand' | 'supply';

const route = useRoute();
const router = useRouter();

const mode = ref<AuthMode>('sms');
const role = ref<UserRole>('demand');
const agreed = ref(false);
const loading = ref(false);
const countdown = ref(0);
let timer: null | ReturnType<typeof setInterval> = null;

const smsForm = reactive({ phone: '', code: '' });
const accountForm = reactive({ account: '', password: '' });
const registerForm = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
});
const forgotForm = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
});

const pageMeta = computed(() => {
  switch (mode.value) {
    case 'account': {
      return {
        title: '账号登录',
        hint: '使用已注册账号与密码进入平台',
        submit: '登 录',
      };
    }
    case 'forgot': {
      return {
        title: '找回密码',
        hint: '通过手机验证码重置登录密码',
        submit: '重置密码',
      };
    }
    case 'register': {
      return {
        title: '账号注册',
        hint: '设置密码后即可使用账号密码登录',
        submit: '完 成 注 册',
      };
    }
    default: {
      return {
        title: '欢迎回来',
        hint: '未注册手机号验证通过后将自动注册',
        submit: '注册 / 登录',
      };
    }
  }
});

function syncModeFromRoute() {
  const name = String(route.name || '');
  if (name === 'Register' || route.path === '/register') {
    mode.value = 'register';
    return;
  }
  if (name === 'ForgotPassword' || route.path === '/forgot-password') {
    mode.value = 'forgot';
    return;
  }
  const q = String(route.query.mode || '');
  if (q === 'account' || q === 'sms' || q === 'register' || q === 'forgot') {
    mode.value = q;
    return;
  }
  mode.value = 'sms';
}

watch(
  () => [route.name, route.path, route.query.mode],
  () => syncModeFromRoute(),
  { immediate: true },
);

function setMode(next: AuthMode) {
  mode.value = next;
  if (next === 'register') {
    router.replace({ name: 'Register' });
    return;
  }
  if (next === 'forgot') {
    router.replace({ name: 'ForgotPassword' });
    return;
  }
  router.replace({
    name: 'Login',
    query: next === 'account' ? { mode: 'account' } : undefined,
  });
}

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onUnmounted(clearTimer);

function isPhone(phone: string) {
  return /^1\d{10}$/.test(phone.trim());
}

function phoneForCode() {
  if (mode.value === 'sms') return smsForm.phone;
  if (mode.value === 'register') return registerForm.phone;
  if (mode.value === 'forgot') return forgotForm.phone;
  return '';
}

function sendCode() {
  const phone = phoneForCode();
  if (!isPhone(phone)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }
  if (countdown.value > 0) return;
  ElMessage.success('验证码已发送（示例：123456）');
  countdown.value = 60;
  clearTimer();
  timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) clearTimer();
  }, 1000);
}

function finish(msg: string) {
  ElMessage.success(msg);
  const redirect = String(route.query.redirect || '');
  router.push(redirect || '/service/product');
}

async function handleSubmit() {
  if (mode.value !== 'account' && !agreed.value) {
    ElMessage.warning('请先阅读并同意《用户协议》');
    return;
  }

  loading.value = true;
  try {
    if (mode.value === 'sms') {
      if (!isPhone(smsForm.phone)) {
        ElMessage.warning('请输入正确的手机号');
        return;
      }
      if (!smsForm.code.trim()) {
        ElMessage.warning('请输入短信验证码');
        return;
      }
      finish(
        role.value === 'demand'
          ? '登录成功（算力需求方）'
          : '登录成功（算力供给方）',
      );
      return;
    }

    if (mode.value === 'account') {
      if (!accountForm.account.trim() || !accountForm.password.trim()) {
        ElMessage.warning('请输入账号和密码');
        return;
      }
      finish('登录成功');
      return;
    }

    if (mode.value === 'register') {
      if (!isPhone(registerForm.phone)) {
        ElMessage.warning('请输入正确的手机号');
        return;
      }
      if (!registerForm.code.trim()) {
        ElMessage.warning('请输入短信验证码');
        return;
      }
      if (registerForm.password.length < 6) {
        ElMessage.warning('密码至少 6 位');
        return;
      }
      if (registerForm.password !== registerForm.confirmPassword) {
        ElMessage.warning('两次输入的密码不一致');
        return;
      }
      finish('注册成功，已为您登录');
      return;
    }

    if (!isPhone(forgotForm.phone)) {
      ElMessage.warning('请输入正确的手机号');
      return;
    }
    if (!forgotForm.code.trim()) {
      ElMessage.warning('请输入短信验证码');
      return;
    }
    if (forgotForm.password.length < 6) {
      ElMessage.warning('新密码至少 6 位');
      return;
    }
    if (forgotForm.password !== forgotForm.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致');
      return;
    }
    ElMessage.success('密码已重置，请使用新密码登录');
    setMode('account');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="portal-auth portal-app">
    <div class="portal-auth__bg" aria-hidden="true">
      <span class="orb orb-a"></span>
      <span class="orb orb-b"></span>
      <span class="orb orb-c"></span>
      <span class="grid"></span>
    </div>

    <div class="portal-auth__stage">
      <aside class="portal-auth__brand">
        <div class="portal-auth__tag">电 · 碳 · 算</div>
        <h1>
          随电而算
          <span class="g-green">向绿</span>
          而行
        </h1>
        <p>
          绿电可追溯、算力可调度、碳排可计量。登录后管理需求与供给，未登录也可继续浏览门户服务。
        </p>
        <ul>
          <li>短信登录即注册，开箱即用</li>
          <li>需求方 / 供给方一键切换身份</li>
          <li>与门户顶栏、业务菜单无缝衔接</li>
        </ul>
      </aside>

      <div class="portal-auth__card">
        <div class="portal-auth__head">
          <div>
            <h2>{{ pageMeta.title }}</h2>
            <p>{{ pageMeta.hint }}</p>
          </div>
          <button
            v-if="mode === 'sms'"
            class="portal-auth__switch"
            type="button"
            @click="setMode('account')"
          >
            账号登录
          </button>
          <button
            v-else-if="mode === 'account'"
            class="portal-auth__switch"
            type="button"
            @click="setMode('sms')"
          >
            短信登录
          </button>
          <button
            v-else
            class="portal-auth__switch"
            type="button"
            @click="setMode('sms')"
          >
            返回登录
          </button>
        </div>

        <div
          v-if="mode === 'sms' || mode === 'register'"
          class="portal-auth__roles"
        >
          <button
            type="button"
            :class="{ active: role === 'demand' }"
            @click="role = 'demand'"
          >
            算力需求下单
          </button>
          <button
            type="button"
            :class="{ active: role === 'supply' }"
            @click="role = 'supply'"
          >
            算力资源供给
          </button>
        </div>

        <!-- 短信登录 -->
        <form
          v-if="mode === 'sms'"
          class="portal-auth__form"
          @submit.prevent="handleSubmit"
        >
          <label class="field">
            <IconifyIcon class="ico" icon="mdi:cellphone" />
            <input
              v-model="smsForm.phone"
              maxlength="11"
              placeholder="请输入手机号"
              type="tel"
            />
          </label>
          <label class="field field--code">
            <IconifyIcon class="ico" icon="mdi:lock-outline" />
            <input
              v-model="smsForm.code"
              maxlength="6"
              placeholder="请输入短信验证码"
              type="text"
            />
            <button
              class="code-btn"
              :disabled="countdown > 0"
              type="button"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </label>
          <label class="agree">
            <input v-model="agreed" type="checkbox" />
            <span>
              我已阅读并同意
              <a href="javascript:void(0)">《用户协议》</a>
            </span>
          </label>
          <button class="submit" :disabled="loading" type="submit">
            {{ pageMeta.submit }}
          </button>
        </form>

        <!-- 账号登录 -->
        <form
          v-else-if="mode === 'account'"
          class="portal-auth__form"
          @submit.prevent="handleSubmit"
        >
          <label class="field">
            <IconifyIcon class="ico" icon="mdi:account-outline" />
            <input
              v-model="accountForm.account"
              placeholder="请输入账号 / 手机号"
              type="text"
            />
          </label>
          <label class="field">
            <IconifyIcon class="ico" icon="mdi:lock-outline" />
            <input
              v-model="accountForm.password"
              placeholder="请输入密码"
              type="password"
            />
          </label>
          <button class="submit" :disabled="loading" type="submit">
            {{ pageMeta.submit }}
          </button>
        </form>

        <!-- 注册 -->
        <form
          v-else-if="mode === 'register'"
          class="portal-auth__form"
          @submit.prevent="handleSubmit"
        >
          <label class="field">
            <IconifyIcon class="ico" icon="mdi:cellphone" />
            <input
              v-model="registerForm.phone"
              maxlength="11"
              placeholder="请输入手机号"
              type="tel"
            />
          </label>
          <label class="field field--code">
            <IconifyIcon class="ico" icon="mdi:lock-outline" />
            <input
              v-model="registerForm.code"
              maxlength="6"
              placeholder="请输入短信验证码"
              type="text"
            />
            <button
              class="code-btn"
              :disabled="countdown > 0"
              type="button"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </label>
          <label class="field">
            <IconifyIcon class="ico" icon="mdi:key-outline" />
            <input
              v-model="registerForm.password"
              placeholder="设置登录密码（至少 6 位）"
              type="password"
            />
          </label>
          <label class="field">
            <IconifyIcon class="ico" icon="mdi:key-outline" />
            <input
              v-model="registerForm.confirmPassword"
              placeholder="再次确认密码"
              type="password"
            />
          </label>
          <label class="agree">
            <input v-model="agreed" type="checkbox" />
            <span>
              我已阅读并同意
              <a href="javascript:void(0)">《用户协议》</a>
            </span>
          </label>
          <button class="submit" :disabled="loading" type="submit">
            {{ pageMeta.submit }}
          </button>
        </form>

        <!-- 找回密码 -->
        <form v-else class="portal-auth__form" @submit.prevent="handleSubmit">
          <label class="field">
            <IconifyIcon class="ico" icon="mdi:cellphone" />
            <input
              v-model="forgotForm.phone"
              maxlength="11"
              placeholder="请输入手机号"
              type="tel"
            />
          </label>
          <label class="field field--code">
            <IconifyIcon class="ico" icon="mdi:lock-outline" />
            <input
              v-model="forgotForm.code"
              maxlength="6"
              placeholder="请输入短信验证码"
              type="text"
            />
            <button
              class="code-btn"
              :disabled="countdown > 0"
              type="button"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </label>
          <label class="field">
            <IconifyIcon class="ico" icon="mdi:key-outline" />
            <input
              v-model="forgotForm.password"
              placeholder="设置新密码（至少 6 位）"
              type="password"
            />
          </label>
          <label class="field">
            <IconifyIcon class="ico" icon="mdi:key-outline" />
            <input
              v-model="forgotForm.confirmPassword"
              placeholder="再次确认新密码"
              type="password"
            />
          </label>
          <label class="agree">
            <input v-model="agreed" type="checkbox" />
            <span>
              我已阅读并同意
              <a href="javascript:void(0)">《用户协议》</a>
            </span>
          </label>
          <button class="submit" :disabled="loading" type="submit">
            {{ pageMeta.submit }}
          </button>
        </form>

        <div class="portal-auth__footer">
          <button
            v-if="mode !== 'register'"
            type="button"
            @click="setMode('register')"
          >
            立即注册
          </button>
          <button v-else type="button" @click="setMode('sms')">
            已有账号？去登录
          </button>
          <button
            v-if="mode !== 'forgot'"
            type="button"
            @click="setMode('forgot')"
          >
            找回密码
          </button>
          <button v-else type="button" @click="setMode('account')">
            返回账号登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portal-auth {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--portal-header-height, 50px));
  padding: 40px 24px;
  overflow: hidden;
  background: #f5f4fb;
}

.portal-auth__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.portal-auth__bg .orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.55;
}

.orb-a {
  top: -8%;
  left: -4%;
  width: 420px;
  height: 420px;
  background: radial-gradient(
    circle,
    rgba(107, 76, 255, 0.35),
    transparent 70%
  );
}

.orb-b {
  right: -6%;
  bottom: -10%;
  width: 460px;
  height: 460px;
  background: radial-gradient(
    circle,
    rgba(0, 200, 83, 0.22),
    transparent 70%
  );
}

.orb-c {
  top: 35%;
  left: 42%;
  width: 280px;
  height: 280px;
  background: radial-gradient(
    circle,
    rgba(33, 150, 243, 0.16),
    transparent 70%
  );
}

.portal-auth__bg .grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(107, 76, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(107, 76, 255, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
}

.portal-auth__stage {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 40px;
  align-items: center;
  width: min(980px, 100%);
}

.portal-auth__brand {
  padding: 12px 8px;
  color: #1f2430;
}

.portal-auth__tag {
  display: inline-flex;
  padding: 4px 12px;
  margin-bottom: 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--portal-primary, #6b4cff);
  background: var(--portal-primary-bg, #f0edff);
  border-radius: 999px;
}

.portal-auth__brand h1 {
  margin: 0 0 14px;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.portal-auth__brand .g-green {
  background: linear-gradient(120deg, #00c853, #5ae89a);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.portal-auth__brand p {
  margin: 0 0 18px;
  font-size: 15px;
  line-height: 1.7;
  color: #5c6578;
}

.portal-auth__brand ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.portal-auth__brand li {
  position: relative;
  padding-left: 18px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #3d4659;
}

.portal-auth__brand li::before {
  position: absolute;
  top: 8px;
  left: 0;
  width: 8px;
  height: 8px;
  content: '';
  background: var(--portal-primary, #6b4cff);
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(107, 76, 255, 0.15);
}

.portal-auth__card {
  padding: 32px 34px 26px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(107, 76, 255, 0.1);
  border-radius: 16px;
  box-shadow:
    0 20px 50px rgba(67, 56, 120, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(16px);
}

.portal-auth__head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.portal-auth__head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 750;
  color: #1f2430;
}

.portal-auth__head p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8a94a6;
}

.portal-auth__switch {
  flex-shrink: 0;
  padding: 0;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--portal-primary, #6b4cff);
  cursor: pointer;
  background: none;
  border: 0;
}

.portal-auth__roles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #e6e8f0;
  border-radius: 10px;
}

.portal-auth__roles button {
  padding: 11px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #5c6578;
  cursor: pointer;
  background: #f6f7fb;
  border: 0;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.portal-auth__roles button + button {
  border-left: 1px solid #e6e8f0;
}

.portal-auth__roles button.active {
  color: #fff;
  background: linear-gradient(135deg, #ff9800, #ffb74d);
}

.portal-auth__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 46px;
  padding: 0 14px;
  background: #fff;
  border: 1px solid #dde1ec;
  border-radius: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field:focus-within {
  border-color: var(--portal-primary, #6b4cff);
  box-shadow: 0 0 0 3px rgba(107, 76, 255, 0.12);
}

.field .ico {
  flex-shrink: 0;
  font-size: 18px;
  color: #9aa3b2;
}

.field input {
  flex: 1;
  width: 100%;
  height: 100%;
  font-size: 14px;
  color: #1f2430;
  outline: none;
  background: transparent;
  border: 0;
}

.field input::placeholder {
  color: #b0b8c6;
}

.field--code {
  padding-right: 8px;
}

.code-btn {
  flex-shrink: 0;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--portal-primary, #6b4cff);
  white-space: nowrap;
  cursor: pointer;
  background: none;
  border: 0;
}

.code-btn:disabled {
  color: #b0b8c6;
  cursor: not-allowed;
}

.agree {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.5;
  color: #6b7280;
  cursor: pointer;
}

.agree input {
  width: 14px;
  height: 14px;
  margin-top: 3px;
  accent-color: var(--portal-primary, #6b4cff);
}

.agree a {
  color: var(--portal-primary, #6b4cff);
  text-decoration: none;
}

.submit {
  height: 46px;
  margin-top: 6px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    var(--portal-primary, #6b4cff),
    #8b7aff
  );
  border: 0;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(107, 76, 255, 0.28);
  transition: transform 0.15s ease, filter 0.15s ease;
}

.submit:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-1px);
}

.submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.portal-auth__footer {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
}

.portal-auth__footer button {
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--portal-primary, #6b4cff);
  cursor: pointer;
  background: none;
  border: 0;
}

@media (max-width: 900px) {
  .portal-auth__stage {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .portal-auth__brand {
    text-align: center;
  }

  .portal-auth__brand ul {
    display: none;
  }
}

@media (max-width: 480px) {
  .portal-auth {
    padding: 24px 14px;
  }

  .portal-auth__card {
    padding: 24px 18px 20px;
  }
}
</style>
