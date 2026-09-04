<script lang="ts" setup>
import type { EnterprisePowerUsageStatItem } from '#/types/admin/enterprise/stats';

import { nextTick, ref, watch } from 'vue';

import { $t, useI18n } from '@vben/locales';
import {
  useVChart,
  type VChartSpec,
  VchartUI,
  type VchartUIType,
} from '@vben/plugins/vchart';

import { buildPowerUsageSeries } from '../data';

defineOptions({ name: 'AdminEnterpriseStatsPowerUsageChart' });

const props = defineProps<{
  data: EnterprisePowerUsageStatItem[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  export: [];
}>();

const { locale } = useI18n();
const chartRef = ref<VchartUIType>();
const { renderVChart } = useVChart(chartRef);

/**
 * 渲染用电量面积图
 */
async function renderChart() {
  await nextTick();
  const values = buildPowerUsageSeries(props.data);
  const spec = {
    type: 'area',
    data: [{ id: 'powerUsage', values }],
    xField: 'date',
    yField: 'value',
    seriesField: 'series',
    legends: { visible: true, position: 'top' },
    tooltip: { visible: true },
    axes: [
      { orient: 'bottom', type: 'band' },
      { orient: 'left', type: 'linear' },
    ],
    area: { style: { fillOpacity: 0.25 } },
    line: { style: { curveType: 'monotone' } },
  } as unknown as VChartSpec;
  await renderVChart(spec);
}

watch(
  () => [props.data, locale.value] as const,
  () => {
    void renderChart();
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <el-card v-loading="loading" class="stats-chart" shadow="never">
    <template #header>
      <div class="stats-chart__head">
        <div>
          <h4>{{ $t('page.admin.enterprise.stats.charts.powerUsage.title') }}</h4>
          <p>{{ $t('page.admin.enterprise.stats.charts.powerUsage.hint') }}</p>
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
    <VchartUI v-else ref="chartRef" height="280px" />
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
}
</style>
