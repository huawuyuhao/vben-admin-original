<script setup lang="ts">
interface Props {
  /** 容器高度 */
  height?: string;
  /** 容器宽度 */
  width?: string;
}

withDefaults(defineProps<Props>(), {
  height: '300px',
  width: '100%',
});
</script>

<template>
  <div v-bind="$attrs" :style="{ height, width }"></div>
</template>
