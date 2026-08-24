<script lang="ts" setup>
import { portalCases } from '#/views/_shared/data/cases';
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>案例中心</h2>
      <p>展示接入的数据中心、算力网简介，侧面呈现系统的电碳算协同能力。</p>
    </div>

    <div class="portal-feature-grid">
      <div v-for="item in portalCases" :key="item.title" class="portal-feature-card">
        <div class="portal-feature-icon" :class="item.iconClass">
          {{ item.icon }}
        </div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
        <div class="case-badges">
          <span
            v-for="badge in item.badges"
            :key="badge.text"
            class="portal-badge"
            :class="`portal-badge-${badge.type}`"
          >
            {{ badge.text }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.case-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
</style>
