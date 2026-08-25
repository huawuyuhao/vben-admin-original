import type {
  AccountLoginForm,
  AuthMode,
  AuthPageMeta,
  ForgotForm,
  RegisterForm,
  SmsLoginForm,
  TenantRoleOption,
} from '#/types/login';

import { computed, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { isEmpty } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { useLoginStore } from '#/store/login';
import { LoginType, UserEnterType } from '#/types/login';

/** 中国大陆手机号正则 */
const PHONE_REGEXP = /^1\d{10}$/;

/** 短信验证码倒计时秒数 */
const SMS_COUNTDOWN_SECONDS = 60;

/** 密码最短长度 */
const MIN_PASSWORD_LENGTH = 6;

/**
 * 登录页身份 Tab 选项（对应入参 userEnterType）
 */
export const TENANT_ROLE_OPTIONS: TenantRoleOption[] = [
  { label: '算力需求下单', value: UserEnterType.Demand },
  { label: '算力资源供给', value: UserEnterType.Supply },
];

/**
 * 登录 / 注册页组合式逻辑（表单状态、校验、提交、模式切换等）
 */
export function useLoginPage() {
  const route = useRoute();
  const router = useRouter();
  const loginStore = useLoginStore();

  /** 当前认证模式：短信 / 账号 / 注册 / 找回密码 */
  const mode = ref<AuthMode>('sms');
  /** 是否已勾选用户协议 */
  const agreed = ref(false);
  /** 短信验证码倒计时剩余秒数 */
  const countdown = ref(0);
  /** 倒计时定时器句柄 */
  let timer: null | ReturnType<typeof setInterval> = null;

  /** 短信登录表单 */
  const smsForm = reactive<SmsLoginForm>({ phone: '', code: '' });
  /** 账号密码登录表单 */
  const accountForm = reactive<AccountLoginForm>({ account: '', password: '' });
  /** 注册表单 */
  const registerForm = reactive<RegisterForm>({
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  /** 找回密码表单 */
  const forgotForm = reactive<ForgotForm>({
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
  });

  /** 当前选中的身份选项卡（与角色 Tab 同步） */
  const userEnterType = computed({
    get: () => loginStore.userEnterType,
    set: (value: UserEnterType) => loginStore.setUserEnterType(value),
  });

  /** 登录按钮 loading */
  const loading = computed(() => loginStore.loginLoading);
  /** 发送验证码 loading */
  const smsLoading = computed(() => loginStore.smsLoading);

  /**
   * 根据当前模式计算卡片标题、提示与提交文案
   */
  const pageMeta = computed<AuthPageMeta>(() => {
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

  /**
   * 是否展示租户身份 Tab（短信 / 账号登录、注册时展示）
   */
  const showRoleTabs = computed(
    () =>
      mode.value === 'sms' ||
      mode.value === 'account' ||
      mode.value === 'register',
  );

  /**
   * 校验是否为合法手机号
   * @param phone 手机号
   */
  function isPhone(phone: string): boolean {
    return PHONE_REGEXP.test(phone.trim());
  }

  /**
   * 清除短信倒计时定时器
   */
  function clearTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  /**
   * 启动短信验证码倒计时
   */
  function startCountdown() {
    countdown.value = SMS_COUNTDOWN_SECONDS;
    clearTimer();
    timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        clearTimer();
      }
    }, 1000);
  }

  /**
   * 根据路由同步认证模式（仅注册 / 找回密码走独立路由；短信与账号登录纯本地切换）
   */
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
    // 登录路由：不读 URL 参数；从注册/找回返回时落到短信登录
    if (mode.value === 'register' || mode.value === 'forgot') {
      mode.value = 'sms';
    }
  }

  /**
   * 切换认证模式
   * 短信 ↔ 账号仅改本地 mode（v-if），避免改 URL 导致闪烁；注册 / 找回仍进独立路由
   * @param next 目标模式
   */
  function setMode(next: AuthMode) {
    mode.value = next;
    if (next === 'register') {
      if (route.name !== 'Register') {
        router.replace({ name: 'Register' });
      }
      return;
    }
    if (next === 'forgot') {
      if (route.name !== 'ForgotPassword') {
        router.replace({ name: 'ForgotPassword' });
      }
      return;
    }
    // sms / account：回到登录路由但不带 query
    if (route.name !== 'Login') {
      router.replace({ name: 'Login' });
    }
  }

  /**
   * 取当前模式下用于发短信的手机号
   */
  function phoneForCode(): string {
    if (mode.value === 'sms') return smsForm.phone;
    if (mode.value === 'register') return registerForm.phone;
    if (mode.value === 'forgot') return forgotForm.phone;
    return '';
  }

  /**
   * 发送短信验证码
   */
  async function sendCode() {
    const phone = phoneForCode();
    if (!isPhone(phone)) {
      ElMessage.warning('请输入正确的手机号');
      return;
    }
    if (countdown.value > 0 || smsLoading.value) {
      return;
    }
    try {
      await loginStore.sendSmsCode(phone.trim());
      ElMessage.success('验证码已发送');
      startCountdown();
    } catch {
      // 错误提示由请求拦截器统一处理
    }
  }

  /**
   * 登录成功后的跳转
   * @param msg 成功提示文案
   */
  function finish(msg: string) {
    ElMessage.success(msg);
    const redirect = String(route.query.redirect || '');
    const target = redirect ? decodeURIComponent(redirect) : '/service/product';
    router.push(target);
  }

  /**
   * 提交短信登录
   */
  async function submitSmsLogin() {
    if (!agreed.value) {
      ElMessage.warning('请先阅读并同意《用户协议》');
      return;
    }
    if (!isPhone(smsForm.phone)) {
      ElMessage.warning('请输入正确的手机号');
      return;
    }
    if (isEmpty(smsForm.code.trim())) {
      ElMessage.warning('请输入短信验证码');
      return;
    }
    await loginStore.login({
      username: smsForm.phone.trim(),
      password: smsForm.code.trim(),
      captcha: smsForm.code.trim(),
      loginType: LoginType.Sms,
      userEnterType: userEnterType.value,
    });
    finish(
      userEnterType.value === UserEnterType.Demand
        ? '登录成功（算力需求方）'
        : '登录成功（算力供给方）',
    );
  }

  /**
   * 提交账号密码登录
   */
  async function submitAccountLogin() {
    if (!agreed.value) {
      ElMessage.warning('请先阅读并同意《用户协议》');
      return;
    }
    if (isEmpty(accountForm.account.trim()) || isEmpty(accountForm.password)) {
      ElMessage.warning('请输入账号和密码');
      return;
    }
    await loginStore.login({
      username: accountForm.account.trim(),
      password: accountForm.password,
      loginType: LoginType.Password,
      userEnterType: userEnterType.value,
    });
    finish('登录成功');
  }

  /**
   * 提交注册（注册接口文档未完善，暂以短信登录接口完成自动注册）
   */
  async function submitRegister() {
    if (!agreed.value) {
      ElMessage.warning('请先阅读并同意《用户协议》');
      return;
    }
    if (!isPhone(registerForm.phone)) {
      ElMessage.warning('请输入正确的手机号');
      return;
    }
    if (isEmpty(registerForm.code.trim())) {
      ElMessage.warning('请输入短信验证码');
      return;
    }
    if (registerForm.password.length < MIN_PASSWORD_LENGTH) {
      ElMessage.warning(`密码至少 ${MIN_PASSWORD_LENGTH} 位`);
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致');
      return;
    }
    await loginStore.login({
      username: registerForm.phone.trim(),
      password: registerForm.password,
      captcha: registerForm.code.trim(),
      loginType: LoginType.Sms,
      userEnterType: userEnterType.value,
    });
    finish('注册成功，已为您登录');
  }

  /**
   * 提交找回密码（重置接口文档未完善，先做前端校验与提示）
   */
  async function submitForgot() {
    if (!agreed.value) {
      ElMessage.warning('请先阅读并同意《用户协议》');
      return;
    }
    if (!isPhone(forgotForm.phone)) {
      ElMessage.warning('请输入正确的手机号');
      return;
    }
    if (isEmpty(forgotForm.code.trim())) {
      ElMessage.warning('请输入短信验证码');
      return;
    }
    if (forgotForm.password.length < MIN_PASSWORD_LENGTH) {
      ElMessage.warning(`新密码至少 ${MIN_PASSWORD_LENGTH} 位`);
      return;
    }
    if (forgotForm.password !== forgotForm.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致');
      return;
    }
    ElMessage.success('密码已重置，请使用新密码登录');
    setMode('account');
  }

  /**
   * 统一提交入口
   */
  async function handleSubmit() {
    try {
      if (mode.value === 'sms') {
        await submitSmsLogin();
        return;
      }
      if (mode.value === 'account') {
        await submitAccountLogin();
        return;
      }
      if (mode.value === 'register') {
        await submitRegister();
        return;
      }
      await submitForgot();
    } catch {
      // 错误提示由请求拦截器统一处理
    }
  }

  watch(
    () => [route.name, route.path],
    () => syncModeFromRoute(),
    { immediate: true },
  );

  onUnmounted(clearTimer);

  return {
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
  };
}
