<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import {
  type CaseListItem,
  type CaseScenario,
  type CaseServiceType,
  caseDataCenters,
  caseListItems,
  caseScenarios,
  caseServiceTypes,
} from '#/views/_shared/data/cases';

const keyword = ref('');
const typeFilter = ref<CaseServiceType | '全部案例'>('全部案例');
const scenarioFilters = ref<CaseScenario[]>([]);
const dataCenterFilters = ref<string[]>([]);
const sortBy = ref<'latest' | 'carbon'>('latest');
const currentPage = ref(1);
const pageSize = 4;
const advancedOpen = ref(false);
const toast = ref('');

const filtered = computed(() => {
  let list = [...caseListItems];
  const key = keyword.value.trim().toLowerCase();
  if (key) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(key) ||
        c.desc.includes(key) ||
        c.tags.some((t) => t.toLowerCase().includes(key)),
    );
  }
  if (typeFilter.value !== '全部案例') {
    list = list.filter((c) => c.type === typeFilter.value);
  }
  if (scenarioFilters.value.length > 0) {
    list = list.filter((c) => scenarioFilters.value.includes(c.scenario));
  }
  if (dataCenterFilters.value.length > 0) {
    list = list.filter((c) => dataCenterFilters.value.includes(c.dataCenter));
  }
  if (sortBy.value === 'latest') {
    list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } else {
    list.sort((a, b) => b.carbonReduction - a.carbonReduction);
  }
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

watch([keyword, typeFilter, scenarioFilters, dataCenterFilters, sortBy], () => {
  currentPage.value = 1;
});

function typeTagClass(type: CaseServiceType) {
  return type === '智算服务' ? 'tag-smart' : 'tag-general';
}

function toggleScenario(s: CaseScenario) {
  const i = scenarioFilters.value.indexOf(s);
  if (i >= 0) scenarioFilters.value.splice(i, 1);
  else scenarioFilters.value.push(s);
}

function toggleDataCenter(dc: string) {
  const i = dataCenterFilters.value.indexOf(dc);
  if (i >= 0) dataCenterFilters.value.splice(i, 1);
  else dataCenterFilters.value.push(dc);
}

function resetFilters() {
  keyword.value = '';
  typeFilter.value = '全部案例';
  scenarioFilters.value = [];
  dataCenterFilters.value = [];
  sortBy.value = 'latest';
}

function refresh() {
  resetFilters();
  showToast('列表已刷新');
}

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function openCase(item: CaseListItem) {
  showToast(`查看案例：${item.title}（示例）`);
}
</script>

<template>
  <div class="portal-inner-page case-center-page">
    <div class="page-head">
      <h2 class="page-title">算力案例资讯</h2>
      <button
        class="portal-btn portal-btn-primary portal-btn-sm"
        type="button"
        @click="showToast('打开新增案例表单（示例）')"
      >
        + 新增案例
      </button>
    </div>

    <div class="case-layout">
      <!-- 左侧筛选 -->
      <aside class="filter-sidebar">
        <h3 class="filter-title">案例筛选</h3>

        <div class="filter-group">
          <div class="filter-group-label">案例类型</div>
          <label
            v-for="t in caseServiceTypes"
            :key="t"
            class="filter-radio"
          >
            <input
              v-model="typeFilter"
              type="radio"
              name="caseType"
              :value="t"
            />
            <span>{{ t }}</span>
          </label>
        </div>

        <div class="filter-group">
          <div class="filter-group-label">应用场景</div>
          <label
            v-for="s in caseScenarios"
            :key="s"
            class="filter-check"
          >
            <input
              type="checkbox"
              :checked="scenarioFilters.includes(s)"
              @change="toggleScenario(s)"
            />
            <span>{{ s }}</span>
          </label>
        </div>

        <div class="filter-group">
          <div class="filter-group-label">数据中心</div>
          <label
            v-for="dc in caseDataCenters"
            :key="dc"
            class="filter-check"
          >
            <input
              type="checkbox"
              :checked="dataCenterFilters.includes(dc)"
              @change="toggleDataCenter(dc)"
            />
            <span>{{ dc }}</span>
          </label>
        </div>
      </aside>

      <!-- 右侧列表 -->
      <main class="case-main">
        <div class="toolbar">
          <div class="portal-search-box search-wide">
            <span class="search-icon">🔍</span>
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索案例名称、描述或标签"
            />
          </div>
          <button
            class="portal-btn portal-btn-outline portal-btn-sm"
            type="button"
            @click="advancedOpen = !advancedOpen"
          >
            ☰ 高级筛选
          </button>
          <button
            class="icon-round-btn"
            type="button"
            title="刷新"
            @click="refresh"
          >
            ↻
          </button>
        </div>

        <div v-if="advancedOpen" class="advanced-panel">
          <select v-model="sortBy" class="portal-form-select adv-select">
            <option value="latest">最新发布</option>
            <option value="carbon">碳减排优先</option>
          </select>
          <button
            class="portal-btn portal-btn-outline portal-btn-sm"
            type="button"
            @click="resetFilters"
          >
            清空筛选
          </button>
        </div>

        <div class="list-head">
          <div class="list-head-left">
            <span class="list-title">算力案例列表</span>
            <span class="count-badge">{{ filtered.length }} 个案例</span>
          </div>
          <select v-model="sortBy" class="sort-select">
            <option value="latest">排序方式：最新发布</option>
            <option value="carbon">排序方式：碳减排优先</option>
          </select>
        </div>

        <div v-if="filtered.length === 0" class="portal-empty">暂无匹配案例</div>

        <div v-else class="case-list">
          <article
            v-for="item in paged"
            :key="item.id"
            class="case-item"
            @click="openCase(item)"
          >
            <div class="case-cover">{{ item.cover }}</div>
            <div class="case-body">
              <div class="case-title-row">
                <h4>{{ item.title }}</h4>
                <span class="type-tag" :class="typeTagClass(item.type)">
                  {{ item.type }}
                </span>
              </div>
              <p class="case-desc">{{ item.desc }}</p>
              <div class="case-meta">
                <span class="meta-item">
                  <i class="meta-icon">🏢</i>{{ item.dataCenter }}
                </span>
                <span class="meta-item">
                  <i class="meta-icon">▦</i>{{ item.scenario }}
                </span>
                <span class="meta-item">
                  <i class="meta-icon">📅</i>{{ item.publishedAt }}
                </span>
                <span class="meta-item carbon">
                  <i class="meta-icon">🌿</i>碳排放降低
                  {{ item.carbonReduction }}%
                </span>
              </div>
            </div>
          </article>
        </div>

        <div v-if="filtered.length > 0" class="portal-pagination">
          <span class="portal-page-info">
            显示 {{ (currentPage - 1) * pageSize + 1 }} 到
            {{ Math.min(currentPage * pageSize, filtered.length) }} 条，共
            {{ filtered.length }} 条记录
          </span>
          <button
            type="button"
            :disabled="currentPage <= 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
          >
            ‹
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            :class="{ active: p === currentPage }"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          <button
            type="button"
            :disabled="currentPage >= totalPages"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
          >
            ›
          </button>
        </div>
      </main>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.case-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

@media (max-width: 960px) {
  .case-layout {
    grid-template-columns: 1fr;
  }
}

.filter-sidebar {
  padding: 16px;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eeeeee);
  border-radius: 12px;
}

.filter-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.filter-group {
  margin-bottom: 18px;
}

.filter-group-label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--portal-gray-700, #616161);
}

.filter-radio,
.filter-check {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--portal-gray-700, #616161);
  cursor: pointer;
}

.filter-radio input,
.filter-check input {
  accent-color: var(--portal-primary, #6b4cff);
}

.case-main {
  min-width: 0;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.search-wide {
  flex: 1;
  min-width: 200px;
}

.icon-round-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 16px;
  color: var(--portal-gray-600, #757575);
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--portal-gray-300, #e0e0e0);
  border-radius: 999px;
}

.icon-round-btn:hover {
  color: var(--portal-primary, #6b4cff);
  border-color: var(--portal-primary-light, #8b7aff);
}

.advanced-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: var(--portal-gray-50, #fafafa);
  border-radius: 8px;
}

.adv-select {
  width: auto;
  min-width: 140px;
}

.list-head {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.list-head-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.list-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.count-badge {
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--portal-primary, #6b4cff);
  background: var(--portal-primary-bg, #f0edff);
  border-radius: 999px;
}

.sort-select {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  color: var(--portal-gray-700, #616161);
  background: #fff;
  border: 1px solid var(--portal-gray-300, #e0e0e0);
  border-radius: 8px;
}

.portal-empty {
  padding: 48px 16px;
  font-size: 14px;
  color: var(--portal-gray-500, #9e9e9e);
  text-align: center;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eeeeee);
  border-radius: 12px;
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.case-item {
  display: flex;
  gap: 16px;
  padding: 14px 16px;
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eeeeee);
  border-radius: 12px;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.case-item:hover {
  border-color: var(--portal-primary-light, #8b7aff);
  box-shadow: 0 4px 16px rgb(107 76 255 / 10%);
}

.case-cover {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 88px;
  font-size: 36px;
  background: linear-gradient(135deg, #eef2ff 0%, #f0edff 50%, #e8f8ef 100%);
  border-radius: 10px;
}

.case-body {
  flex: 1;
  min-width: 0;
}

.case-title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.case-title-row h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.type-tag {
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.tag-smart {
  color: #1b7a3d;
  background: #e8f8ef;
}

.tag-general {
  color: #1565c0;
  background: #e3f2fd;
}

.case-desc {
  display: -webkit-box;
  margin: 0 0 10px;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.55;
  color: var(--portal-gray-600, #757575);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.case-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.meta-item {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.meta-item.carbon {
  font-weight: 600;
  color: #1b7a3d;
}

.meta-icon {
  font-style: normal;
}

.portal-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 2000;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
}

@media (max-width: 640px) {
  .case-item {
    flex-direction: column;
  }

  .case-cover {
    width: 100%;
    height: 100px;
  }
}
</style>
