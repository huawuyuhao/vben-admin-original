<script lang="ts" setup>
/**
 * 登录页左侧品牌介绍区
 */
defineOptions({ name: 'LoginBrandAside' });
</script>

<template>
  <aside class="login-brand">
    <div class="login-brand__tag">电 · 碳 · 算</div>
    <h1 class="login-brand__title">
      随电而算
      <span class="login-brand__green">向绿</span>
      而行
    </h1>
    <p class="login-brand__desc">
      绿电可追溯、算力可调度、碳排可计量。登录后管理需求与供给，未登录也可继续浏览门户服务。
    </p>
    <ul class="login-brand__list">
      <li>短信验证码快捷登录，安全便捷</li>
      <li>需求方 / 供给方一键切换身份</li>
      <li>与门户顶栏、业务菜单无缝衔接</li>
    </ul>
  </aside>
</template>

<style lang="scss" scoped>
.login-brand {
  padding: 12px 8px;
  color: var(--portal-auth-title, #1f2430);

  &__tag {
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

  &__title {
    margin: 0 0 14px;
    font-size: clamp(28px, 3.4vw, 40px);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  &__green {
    background: linear-gradient(120deg, #00c853, #5ae89a);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__desc {
    margin: 0 0 18px;
    font-size: 15px;
    line-height: 1.7;
    color: var(--portal-gray-600, #5c6578);
  }

  &__list {
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 10px;
      font-size: 14px;
      color: var(--portal-gray-700, #3d4659);

      &::before {
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
    }
  }
}

@media (max-width: 900px) {
  .login-brand {
    text-align: center;

    &__list {
      display: none;
    }
  }
}
</style>
