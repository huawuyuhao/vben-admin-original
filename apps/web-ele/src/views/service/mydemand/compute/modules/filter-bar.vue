<script lang="ts" setup>
import { $t } from '@vben/locales';

import {
  COMPUTE_STATUS_OPTIONS,
  type ComputeStatusFilter,
  type ComputeTimeRange,
  getComputeStatusI18nKey,
} from '../data';

defineOptions({ name: 'MyDemandComputeFilterBar' });

const emit = defineEmits<{
  /** 重置筛选 */
  reset: [];
  /** 点击查询 */
  search: [];
}>();
/** 需求编号 */
const demandNo = defineModel<string>('demandNo', { default: '' });
/** 状态筛选 */
const status = defineModel<ComputeStatusFilter>('status', { default: '' });
/** 创建/提交时间范围 */
const timeRange = defineModel<ComputeTimeRange>('timeRange', {
  default: null,
});

</script>

<template>
  <el-card class="compute-filter" shadow="never">
    <el-form class="compute-filter__form" @submit.prevent>
      <el-form-item
        class="compute-filter__field"
        :label="$t('page.service.mydemand.compute.filter.demandNo')"
      >
        <el-input
          v-model="demandNo"
          class="compute-filter__input"
          clearable
          :placeholder="
            $t('page.service.mydemand.compute.filter.demandNoPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        class="compute-filter__field"
        :label="$t('page.service.mydemand.compute.filter.status')"
      >
        <el-select
          v-model="status"
          class="compute-filter__select"
          clearable
          :placeholder="$t('page.service.mydemand.compute.filter.statusAll')"
        >
          <el-option
            v-for="item in COMPUTE_STATUS_OPTIONS"
            :key="item"
            :label="
              $t(
                `page.service.mydemand.compute.status.${getComputeStatusI18nKey(item)}`,
              )
            "
            :value="String(item)"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        class="compute-filter__field compute-filter__field--range"
        :label="$t('page.service.mydemand.compute.filter.timeRange')"
      >
        <el-date-picker
          v-model="timeRange"
          class="compute-filter__range"
          clearable
          :end-placeholder="
            $t('page.service.mydemand.compute.filter.timeEnd')
          "
          format="YYYY-MM-DD HH:mm:ss"
          range-separator="-"
          :start-placeholder="
            $t('page.service.mydemand.compute.filter.timeStart')
          "
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>

      <el-form-item class="compute-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.service.mydemand.compute.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.service.mydemand.compute.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.compute-filter {
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

  &__input {
    width: 180px;
  }

  &__select {
    width: 160px;
  }

  &__range {
    width: 360px;
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
  .compute-filter {
    &__input,
    &__select,
    &__range {
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
