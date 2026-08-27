<script lang="ts" setup>
defineOptions({ name: 'PortalContentPageShell' });

defineProps<{
  /** 页眉副标题 */
  eyebrow: string;
  /** 页面标题 */
  title: string;
  /** 页面描述 */
  desc: string;
}>();
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div class="mine-shell__inner">
        <header class="mine-shell__head">
          <div>
            <p class="mine-shell__eyebrow">{{ eyebrow }}</p>
            <h2>{{ title }}</h2>
            <p class="mine-shell__desc">{{ desc }}</p>
          </div>
          <div v-if="$slots.actions" class="mine-shell__head-actions">
            <slot name="actions" />
          </div>
        </header>

        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../../scss/page-shell.scss';
</style>
