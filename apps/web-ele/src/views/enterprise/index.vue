<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

/** 兼容旧入口：企业服务默认进入「我的算力供给」 */
const router = useRouter();

onMounted(() => {
  router.replace('/service/enterprise/supply');
});
</script>

<template>
  <div class="portal-inner-page">正在进入企业服务…</div>
</template>
