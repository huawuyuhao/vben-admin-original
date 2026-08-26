<script lang="ts" setup>
import { computed } from 'vue';

import { createSectionReveal } from '../motion';

/**
 * 首页区块标题滚动入场包装（进入视口后上浮渐显，仅一次）
 */
defineOptions({ name: 'PortalHomeScrollReveal' });

const props = withDefaults(
  defineProps<{
    /** 延迟毫秒 */
    delay?: number;
  }>(),
  {
    delay: 0,
  },
);

/** v-motion 绑定对象 */
const motionProps = computed(() => createSectionReveal(props.delay));
</script>

<template>
  <div v-motion="motionProps" class="home-scroll-reveal">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.home-scroll-reveal {
  width: 100%;
  text-align: center;
  will-change: transform, opacity;

  @media (prefers-reduced-motion: reduce) {
    will-change: auto;
  }
}
</style>
