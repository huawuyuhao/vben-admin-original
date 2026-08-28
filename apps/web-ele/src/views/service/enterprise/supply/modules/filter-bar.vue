<script lang="ts" setup>
import { $t } from '@vben/locales';

import {
  SUPPLY_STATUS_PENDING,
  SUPPLY_STATUS_VIEWED,
  type SupplyStatusFilter,
} from '../data';

defineOptions({ name: 'EnterpriseSupplyFilterBar' });

/** 受理状态筛选（与父级 v-model:status 同步） */
const status = defineModel<SupplyStatusFilter>('status', { default: '' });

const emit = defineEmits<{
  /** 重置筛选 */
  reset: [];
  /** 点击查询 */
  search: [];
}>();
</script>

<template>
  <el-card class="supply-filter" shadow="never">
    <el-form class="supply-filter__form" @submit.prevent>
      <el-form-item
        class="supply-filter__field"
        :label="$t('page.service.enterprise.supply.filter.status')"
      >
        <el-select
          v-model="status"
          clearable
          class="supply-filter__select"
          :placeholder="$t('page.service.enterprise.supply.filter.statusAll')"
        >
          <el-option
            :label="$t('page.service.enterprise.supply.status.pending')"
            :value="String(SUPPLY_STATUS_PENDING)"
          />
          <el-option
            :label="$t('page.service.enterprise.supply.status.viewed')"
            :value="String(SUPPLY_STATUS_VIEWED)"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="supply-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.service.enterprise.supply.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.service.enterprise.supply.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.supply-filter {
  margin-bottom: 18px;

  &__form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;
    align-items: center;
  }

  &__field {
    margin-right: 0;
    margin-bottom: 0;

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

  &__select {
    width: 160px;
  }

  &__actions {
    margin-right: 0;
    margin-bottom: 0;
    margin-left: auto;

    :deep(.el-form-item__content) {
      display: inline-flex;
      gap: 10px;
      align-items: center;
    }
  }
}

@media (max-width: 768px) {
  .supply-filter {
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
