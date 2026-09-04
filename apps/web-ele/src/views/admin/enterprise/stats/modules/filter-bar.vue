<script lang="ts" setup>
import { computed } from 'vue';

import { $t } from '@vben/locales';

import { getCurrentStatYear } from '../data';

defineOptions({ name: 'AdminEnterpriseStatsFilterBar' });

const emit = defineEmits<{
  /** 重置 */
  reset: [];
  /** 查询 */
  search: [];
}>();
/** 年份 */
const year = defineModel<null | number>('year', { default: null });
/** 月份 1-12，空表示全年 */
const month = defineModel<null | number>('month', { default: null });
/** 日（告警维度可选） */
const day = defineModel<null | number>('day', { default: null });

/** 年份选项：近 6 年 */
const yearOptions = computed(() => {
  const current = getCurrentStatYear();
  return Array.from({ length: 6 }, (_, i) => current - i);
});

/** 月份选项 */
const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    label: $t('page.admin.enterprise.stats.filter.monthOption', [i + 1]),
    value: i + 1,
  })),
);

/** 日选项（随月份天数变化，简化为 1-31） */
const dayOptions = computed(() =>
  Array.from({ length: 31 }, (_, i) => ({
    label: $t('page.admin.enterprise.stats.filter.dayOption', [i + 1]),
    value: i + 1,
  })),
);
</script>

<template>
  <el-card class="stats-filter" shadow="never">
    <el-form class="stats-filter__form" @submit.prevent>
      <el-form-item
        class="stats-filter__field"
        :label="$t('page.admin.enterprise.stats.filter.year')"
      >
        <el-select
          v-model="year"
          class="stats-filter__select"
          clearable
          :placeholder="$t('page.admin.enterprise.stats.filter.yearAll')"
        >
          <el-option
            v-for="y in yearOptions"
            :key="y"
            :label="String(y)"
            :value="y"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        class="stats-filter__field"
        :label="$t('page.admin.enterprise.stats.filter.month')"
      >
        <el-select
          v-model="month"
          class="stats-filter__select"
          clearable
          :placeholder="$t('page.admin.enterprise.stats.filter.monthAll')"
        >
          <el-option
            v-for="item in monthOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        class="stats-filter__field"
        :label="$t('page.admin.enterprise.stats.filter.day')"
      >
        <el-select
          v-model="day"
          class="stats-filter__select"
          clearable
          :placeholder="$t('page.admin.enterprise.stats.filter.dayHint')"
        >
          <el-option
            v-for="item in dayOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="stats-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.admin.enterprise.stats.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.admin.enterprise.stats.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.stats-filter {
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
  }

  &__select {
    width: 140px;
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
  .stats-filter {
    &__select {
      width: 100%;
    }

    &__field,
    &__actions {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>
