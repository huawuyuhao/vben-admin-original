<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

/** 兼容旧路径：重定向到算力需求列表 */
const router = useRouter();
onMounted(() => {
  router.replace('/service/mydemand/compute');
});
</script>

<template>
  <div class="portal-inner-page">正在进入我的算力需求…</div>
</template>
