<script lang="ts" setup>
import { $t } from '@vben/locales';

import {
  SUB_ACCOUNT_STATUS_DISABLED,
  SUB_ACCOUNT_STATUS_ENABLED,
  type SubAccountStatusFilter,
} from '../data';

defineOptions({ name: 'AdminEnterpriseAccountsFilterBar' });

/** 用户名 */
const username = defineModel<string>('username', { default: '' });
/** 部门 */
const department = defineModel<string>('department', { default: '' });
/** 状态 */
const status = defineModel<SubAccountStatusFilter>('status', { default: '' });

const emit = defineEmits<{
  /** 重置筛选 */
  reset: [];
  /** 点击查询 */
  search: [];
}>();
</script>

<template>
  <el-card class="accounts-filter" shadow="never">
    <el-form class="accounts-filter__form" @submit.prevent>
      <el-form-item
        class="accounts-filter__field"
        :label="$t('page.admin.enterprise.accounts.filter.username')"
      >
        <el-input
          v-model="username"
          class="accounts-filter__input"
          clearable
          :placeholder="
            $t('page.admin.enterprise.accounts.filter.usernamePlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        class="accounts-filter__field"
        :label="$t('page.admin.enterprise.accounts.filter.department')"
      >
        <el-input
          v-model="department"
          class="accounts-filter__input"
          clearable
          :placeholder="
            $t('page.admin.enterprise.accounts.filter.departmentPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        class="accounts-filter__field"
        :label="$t('page.admin.enterprise.accounts.filter.status')"
      >
        <el-select
          v-model="status"
          class="accounts-filter__select"
          clearable
          :placeholder="
            $t('page.admin.enterprise.accounts.filter.statusAll')
          "
        >
          <el-option
            :label="$t('page.admin.enterprise.accounts.status.enabled')"
            :value="String(SUB_ACCOUNT_STATUS_ENABLED)"
          />
          <el-option
            :label="$t('page.admin.enterprise.accounts.status.disabled')"
            :value="String(SUB_ACCOUNT_STATUS_DISABLED)"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="accounts-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.admin.enterprise.accounts.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.admin.enterprise.accounts.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.accounts-filter {
  margin-bottom: 18px;

  &__form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;
    align-items: center;
  }

  &__field {
    margin-right: 0;
    margin-bottom: 8px;

    :deep(.el-form-item__label) {
      display: inline-flex;
      align-items: center;
      height: 32px;
      padding-right: 8px;
      line-height: 32px;
    }

    :deep(.el-form-item__content) {
      display: inline-flex;
      align-items: center;
    }
  }

  &__input {
    width: 160px;
  }

  &__select {
    width: 160px;
  }

  &__actions {
    margin-right: 0;
    margin-bottom: 8px;
    margin-left: auto;

    :deep(.el-form-item__content) {
      display: inline-flex;
      gap: 10px;
      align-items: center;
    }
  }
}

@media (max-width: 768px) {
  .accounts-filter {
    &__input,
    &__select {
      width: 100%;
    }

    &__field {
      width: 100%;
    }

    &__actions {
      width: 100%;
      margin-left: 0;

      :deep(.el-form-item__content) {
        display: flex;
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style>
