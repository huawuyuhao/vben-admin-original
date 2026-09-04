<script lang="ts" setup>
import type { EnterpriseAlertStatItem } from '#/types/admin/enterprise/stats';

import { nextTick, ref, watch } from 'vue';

import { $t, useI18n } from '@vben/locales';
import {
  useVChart,
  type VChartSpec,
  VchartUI,
  type VchartUIType,
} from '@vben/plugins/vchart';

import { buildAlertLevelPie, buildAlertTotalSeries } from '../data';

defineOptions({ name: 'AdminEnterpriseStatsAlertChart' });

const props = defineProps<{
  data: EnterpriseAlertStatItem[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  export: [];
}>();

const { locale } = useI18n();
const barRef = ref<VchartUIType>();
const pieRef = ref<VchartUIType>();
const { renderVChart: renderBar } = useVChart(barRef);
const { renderVChart: renderPie } = useVChart(pieRef);

/**
 * 渲染告警柱状图与等级饼图
 */
async function renderCharts() {
  await nextTick();
  const barValues = buildAlertTotalSeries(props.data);
  const pieValues = buildAlertLevelPie(props.data);

  const barSpec = {
    type: 'bar',
    data: [{ id: 'alertTotal', values: barValues }],
    xField: 'date',
    yField: 'value',
    legends: { visible: false },
    tooltip: { visible: true },
    axes: [
      { orient: 'bottom', type: 'band' },
      { orient: 'left', type: 'linear' },
    ],
  } as unknown as VChartSpec;

  const pieSpec = {
    type: 'pie',
    data: [{ id: 'alertLevel', values: pieValues }],
    categoryField: 'type',
    valueField: 'value',
    legends: { visible: true, position: 'right' },
    tooltip: { visible: true },
    label: { visible: true },
  } as unknown as VChartSpec;

  await Promise.all([renderBar(barSpec), renderPie(pieSpec)]);
}

watch(
  () => [props.data, locale.value] as const,
  () => {
    void renderCharts();
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <el-card v-loading="loading" class="stats-chart" shadow="never">
    <template #header>
      <div class="stats-chart__head">
        <div>
          <h4>{{ $t('page.admin.enterprise.stats.charts.alert.title') }}</h4>
          <p>{{ $t('page.admin.enterprise.stats.charts.alert.hint') }}</p>
        </div>
        <el-button link type="primary" @click="emit('export')">
          {{ $t('page.admin.enterprise.stats.export.btn') }}
        </el-button>
      </div>
    </template>
    <el-empty
      v-if="!loading && data.length === 0"
      :description="$t('page.admin.enterprise.stats.empty')"
    />
    <div v-else class="stats-chart__alert-grid">
      <div>
        <p class="stats-chart__sub">
          {{ $t('page.admin.enterprise.stats.charts.alert.barTitle') }}
        </p>
        <VchartUI ref="barRef" height="260px" />
      </div>
      <div>
        <p class="stats-chart__sub">
          {{ $t('page.admin.enterprise.stats.charts.alert.pieTitle') }}
        </p>
        <VchartUI ref="pieRef" height="260px" />
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.stats-chart {
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

  &__alert-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__sub {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }
}

@media (max-width: 900px) {
  .stats-chart {
    &__alert-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
