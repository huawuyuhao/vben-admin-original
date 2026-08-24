<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

/** 兼容旧入口：我的需求默认进入「我的应用」 */
const router = useRouter();

onMounted(() => {
  router.replace('/service/mydemand/apps');
});
</script>

<template>
  <div class="portal-inner-page">正在进入我的应用…</div>
</template>
