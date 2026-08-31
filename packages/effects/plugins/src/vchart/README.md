# VisActor VChart Plugin

基于 [VisActor VChart](https://www.visactor.io/vchart) 的图表插件，用法对齐 `@vben/plugins/echarts`。

**约定：后续新页面的图表优先使用本插件，不再新增 ECharts 图表。**

## 导出

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `VchartUI` | 组件 | 图表容器 |
| `useVChart` | 函数 | 组合式渲染 / 更新 |
| `VChartSpec` | 类型 | 图表配置（`ISpec`） |
| `VchartUIType` | 类型 | 容器组件类型 |

## 使用

```vue
<script lang="ts" setup>
import type { VchartUIType } from '@vben/plugins/vchart';

import { onMounted, ref } from 'vue';

import { useVChart, VchartUI } from '@vben/plugins/vchart';

const chartRef = ref<VchartUIType>();
const { renderVChart } = useVChart(chartRef);

onMounted(() => {
  void renderVChart({
    type: 'bar',
    data: [
      {
        id: 'barData',
        values: [
          { type: 'A', value: 10 },
          { type: 'B', value: 20 },
        ],
      },
    ],
    xField: 'type',
    yField: 'value',
  });
});
</script>

<template>
  <VchartUI ref="chartRef" height="280px" />
</template>
```

## 说明

- 暗色主题下默认透明背景，跟随 `@vben/preferences` 的 `isDark`
- 支持窗口 / 容器 resize、keep-alive 激活态
- 官方文档：https://www.visactor.io/
