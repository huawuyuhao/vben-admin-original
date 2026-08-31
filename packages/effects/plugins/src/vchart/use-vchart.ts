import type { ISpec, IVChart } from '@visactor/vchart';

import type { Ref } from 'vue';

import type { Nullable } from '@vben/types';

import type VchartUI from './vchart-ui.vue';

import {
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  unref,
  watch,
} from 'vue';

import { usePreferences } from '@vben/preferences';

import {
  tryOnUnmounted,
  useDebounceFn,
  useResizeObserver,
  useTimeoutFn,
  useWindowSize,
} from '@vueuse/core';
import { VChart } from '@visactor/vchart';

type VchartUIType = typeof VchartUI | undefined;

/**
 * VisActor VChart 组合式封装（对齐 useEcharts 用法）
 * 官方文档：https://www.visactor.io/vchart
 * @param chartRef 图表容器组件 ref
 */
function useVChart(chartRef: Ref<VchartUIType>) {
  let chartInstance: IVChart | null = null;
  let cacheSpec: ISpec | null = null;
  /** 图表是否处于激活状态（keep-alive 兼容） */
  const isActiveRef = ref(false);

  const { isDark } = usePreferences();
  const { height, width } = useWindowSize();
  const resizeHandler: () => void = useDebounceFn(resize, 200);

  /**
   * 解析容器 DOM
   * @returns 容器元素或 null
   */
  const getChartEl = (): HTMLElement | null => {
    const refValue = chartRef?.value as unknown;
    if (!refValue) return null;
    if (refValue instanceof HTMLElement) {
      return refValue;
    }
    const maybeComponent = refValue as { $el?: HTMLElement };
    return maybeComponent.$el ?? null;
  };

  onMounted(() => (isActiveRef.value = true));
  onActivated(() => (isActiveRef.value = true));
  onDeactivated(() => (isActiveRef.value = false));
  onBeforeUnmount(() => (isActiveRef.value = false));

  /**
   * 判断容器是否隐藏（宽高为 0）
   * @param el 容器元素
   * @returns 隐藏时返回 true
   */
  const isElHidden = (el: HTMLElement | null): boolean => {
    if (!el) return true;
    return el.offsetHeight === 0 || el.offsetWidth === 0;
  };

  /**
   * 合并主题相关配置（暗色下透明背景）
   * @param spec 原始 spec
   * @returns 合并后的 spec
   */
  function mergeThemeSpec(spec: ISpec): ISpec {
    if (!isDark.value) {
      return spec;
    }
    return {
      ...spec,
      background: 'transparent',
    };
  }

  /**
   * 释放当前图表实例
   */
  function disposeChart() {
    chartInstance?.release();
    chartInstance = null;
  }

  /**
   * 创建并渲染图表
   * @param spec VChart 配置
   * @returns 图表实例；失败返回 null
   */
  function createAndRender(spec: ISpec): IVChart | null {
    const el = getChartEl();
    if (!el) {
      return null;
    }
    disposeChart();
    chartInstance = new VChart(mergeThemeSpec(spec), { dom: el });
    chartInstance.renderSync();
    return chartInstance;
  }

  /**
   * 渲染 / 更新图表
   * @param spec VChart 配置
   * @returns 图表实例
   */
  const renderVChart = (spec: ISpec): Promise<Nullable<IVChart>> => {
    if (!unref(isActiveRef)) {
      return Promise.resolve(null);
    }
    cacheSpec = spec;

    return new Promise((resolve) => {
      nextTick(() => {
        const el = getChartEl();
        if (isElHidden(el)) {
          useTimeoutFn(async () => {
            resolve(await renderVChart(spec));
          }, 30);
          return;
        }

        useTimeoutFn(() => {
          if (!chartInstance) {
            resolve(createAndRender(spec));
            return;
          }
          chartInstance.updateSpecSync(mergeThemeSpec(spec));
          resolve(chartInstance);
        }, 30);
      });
    });
  };

  /**
   * 仅更新配置（未初始化时会自动创建）
   * @param spec VChart 配置
   * @returns 图表实例
   */
  const updateSpec = (spec: ISpec): Promise<IVChart | null> => {
    return renderVChart(spec);
  };

  /**
   * 按容器尺寸自适应
   */
  function resize() {
    const el = getChartEl();
    if (isElHidden(el) || !chartInstance || !el) {
      return;
    }
    chartInstance.resize(el.clientWidth, el.clientHeight);
  }

  watch([width, height], () => {
    resizeHandler?.();
  });

  useResizeObserver(chartRef as never, resizeHandler);

  watch([isDark, isActiveRef], () => {
    if (unref(isActiveRef) && cacheSpec) {
      disposeChart();
      void renderVChart(cacheSpec).then(() => resize());
    }
  });

  tryOnUnmounted(() => {
    disposeChart();
  });

  return {
    isActive: isActiveRef,
    renderVChart,
    resize,
    updateSpec,
    getChartInstance: () => chartInstance,
  };
}

export { useVChart };

export type { VchartUIType };
