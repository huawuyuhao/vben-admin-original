<script lang="ts" setup>
import { computed } from 'vue';

import { $t } from '@vben/locales';

import { UserEnterType } from '#/types/login';

/**
 * 登录页身份切换 Tab（对应入参 userEnterType：demand / supply）
 */
defineOptions({ name: 'LoginRoleTabs' });

/** 当前选中的身份类型 */
const userEnterType = defineModel<UserEnterType>({ required: true });

/** 身份 Tab 选项（随语言切换刷新文案） */
const tenantRoleOptions = computed(() => [
  { label: $t('page.login.role.demand'), value: UserEnterType.Demand },
  { label: $t('page.login.role.supply'), value: UserEnterType.Supply },
]);
</script>

<template>
  <div class="login-roles">
    <button
      v-for="item in tenantRoleOptions"
      :key="item.value"
      type="button"
      class="login-roles__item"
      :class="{ 'is-active': userEnterType === item.value }"
      @click="userEnterType = item.value"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.login-roles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid var(--portal-gray-200, #e6e8f0);
  border-radius: 10px;

  &__item {
    padding: 11px 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--portal-gray-600, #5c6578);
    cursor: pointer;
    background: var(--portal-gray-50, #f6f7fb);
    border: 0;
    transition:
      background 0.2s ease,
      color 0.2s ease;

    & + & {
      border-left: 1px solid var(--portal-gray-200, #e6e8f0);
    }

    &.is-active {
      color: #fff;
      background: linear-gradient(135deg, #ff9800, #ffb74d);
    }
  }
}
</style>
