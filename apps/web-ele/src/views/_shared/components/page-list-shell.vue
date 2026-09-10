<script lang="ts" setup>
/**
 * 业务列表页外壳：统一 mine-page / mine-shell 边距与背景，
 * 内容区承载 useVbenVxeGrid 查询栏 + 表格 + 分页。
 */
defineOptions({ name: 'PageListShell' });

defineProps<{
  /** 副标题 / 模块眉题 */
  eyebrow?: string;
  /** 页面标题 */
  title?: string;
  /** 描述文案 */
  desc?: string;
}>();
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell mine-shell--list">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div class="mine-shell__inner">
        <header v-if="title || $slots.actions" class="mine-shell__head">
          <div>
            <p v-if="eyebrow" class="mine-shell__eyebrow">
              {{ eyebrow }}
            </p>
            <h2 v-if="title">{{ title }}</h2>
            <p v-if="desc" class="mine-shell__desc">
              {{ desc }}
            </p>
          </div>
          <div v-if="$slots.actions" class="mine-shell__head-actions">
            <slot name="actions"></slot>
          </div>
        </header>

        <div class="mine-shell__list-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
  不可 scoped：.mine-vxe-grid--cards 需命中插槽内 VxeGrid 内部节点，
  否则隐藏表体失效，flex-grow 空壳会在卡片下方露出一条灰条。
-->
<style lang="scss">
@use '../../../scss/page-shell.scss';
</style>
