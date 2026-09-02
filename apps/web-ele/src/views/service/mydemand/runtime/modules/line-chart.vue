<script lang="ts" setup>
import type { RuntimeChartPoint } from '../data';

import { nextTick, ref, watch } from 'vue';

import { $t, useI18n } from '@vben/locales';
import {
  useVChart,
  VchartUI,
  type VChartSpec,
  type VchartUIType,
} from '@vben/plugins/vchart';

defineOptions({ name: 'MyDemandRuntimeLineChart' });

const props = defineProps<{
  /** 折线数据点 */
  data: RuntimeChartPoint[];
  /** 空态描述 */
  emptyText?: string;
  /** 加载中 */
  loading?: boolean;
  /** 副标题 */
  hint?: string;
  /** 标题 */
  title: string;
  /** Y 轴是否按百分比 0-100 */
  percentAxis?: boolean;
}>();

const { locale } = useI18n();
const chartRef = ref<VchartUIType>();
const { renderVChart } = useVChart(chartRef);

/**
 * 渲染折线 / 面积图
 */
async function renderChart() {
  await nextTick();
  if (props.data.length === 0) {
    return;
  }

  const yAxis: Record<string, unknown> = {
    orient: 'left',
    type: 'linear',
  };
  if (props.percentAxis) {
    yAxis.min = 0;
    yAxis.max = 100;
  }

  const spec = {
    type: 'area',
    data: [{ id: 'runtimeSeries', values: props.data }],
    xField: 'time',
    yField: 'value',
    seriesField: 'series',
    legends: { visible: true, position: 'top' },
    tooltip: { visible: true },
    axes: [{ orient: 'bottom', type: 'band' }, yAxis],
    area: { style: { fillOpacity: 0.2 } },
    line: { style: { curveType: 'monotone' } },
    point: { visible: false },
  } as unknown as VChartSpec;

  await renderVChart(spec);
}

watch(
  () => [props.data, locale.value, props.percentAxis] as const,
  () => {
    void renderChart();
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <el-card v-loading="loading" class="runtime-chart" shadow="never">
    <template #header>
      <div class="runtime-chart__head">
        <h4>{{ title }}</h4>
        <p v-if="hint">{{ hint }}</p>
      </div>
    </template>
    <el-empty
      v-if="!loading && data.length === 0"
      :description="
        emptyText || $t('page.service.mydemand.runtime.chart.empty')
      "
    />
    <VchartUI v-else ref="chartRef" height="260px" />
  </el-card>
</template>

<style lang="scss" scoped>
.runtime-chart {
  border-radius: 16px;

  &__head {
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
