<script lang="ts" setup>
import type { EnterpriseStatOverview } from '#/types/admin/enterprise/stats';

import { computed } from 'vue';

import { $t, useI18n } from '@vben/locales';

import { buildOverviewCards } from '../data';

defineOptions({ name: 'AdminEnterpriseStatsOverviewCards' });

const props = defineProps<{
  /** 加载中 */
  loading?: boolean;
  /** 概览数据 */
  overview: EnterpriseStatOverview | null;
}>();

const emit = defineEmits<{
  /** 导出概览 */
  export: [];
}>();

const { locale } = useI18n();

const cards = computed(() => {
  void locale.value;
  return buildOverviewCards(props.overview);
});
</script>

<template>
  <el-card v-loading="loading" class="stats-overview" shadow="never">
    <template #header>
      <div class="stats-overview__head">
        <div>
          <h4>{{ $t('page.admin.enterprise.stats.overview.title') }}</h4>
          <p>{{ $t('page.admin.enterprise.stats.overview.hint') }}</p>
        </div>
        <el-button link type="primary" @click="emit('export')">
          {{ $t('page.admin.enterprise.stats.export.btn') }}
        </el-button>
      </div>
    </template>

    <div class="stats-overview__grid">
      <div
        v-for="card in cards"
        :key="card.key"
        class="stats-overview__item"
      >
        <p class="stats-overview__label">{{ card.label }}</p>
        <div class="stats-overview__value-row">
          <strong>{{ card.value }}</strong>
          <span>{{ card.unit }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.stats-overview {
  border-radius: 16px;

  &__head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;

    h4 {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 700;
      color: hsl(var(--foreground));
    }

    p {
      margin: 0;
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    min-height: 240px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 18px 16px;
    background: hsl(var(--background) / 72%);
    border: 1px solid hsl(var(--border));
    border-radius: 14px;
  }

  &__label {
    margin: 0 0 10px;
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  &__value-row {
    display: flex;
    gap: 8px;
    align-items: baseline;

    strong {
      font-size: 28px;
      font-weight: 750;
      line-height: 1.1;
      color: hsl(var(--foreground));
    }

    span {
      font-size: 13px;
      color: hsl(var(--muted-foreground));
    }
  }
}

@media (max-width: 640px) {
  .stats-overview {
    &__grid {
      grid-template-columns: 1fr;
      min-height: 0;
    }
  }
}
</style>
