<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { type MyAppItem, myApps } from '#/views/_shared/data/my-apps';

const router = useRouter();

const mainTab = ref<'manage' | 'material'>('manage');
const keyword = ref('');
const scope = ref<'all' | 'created' | 'favorited'>('all');
const currentPage = ref(1);
const pageSize = 9;
const jumpPage = ref('');
const toast = ref('');

const filtered = computed(() => {
  let list = [...myApps];
  const key = keyword.value.trim().toLowerCase();
  if (key) {
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(key) ||
        a.desc.includes(key) ||
        a.creator.includes(key),
    );
  }
  if (scope.value === 'created') list = list.filter((a) => a.owned);
  if (scope.value === 'favorited') list = list.filter((a) => a.favorited);
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | '...'> = [1];
  const start = Math.max(2, cur - 2);
  const end = Math.min(total - 1, cur + 2);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
});

watch([keyword, scope, mainTab], () => {
  currentPage.value = 1;
});

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function search() {
  currentPage.value = 1;
  showToast(keyword.value.trim() ? `已搜索：${keyword.value.trim()}` : '已刷新列表');
}

function goCreate() {
  router.push('/service/mydemand/apps/config');
}

function openApp(item: MyAppItem) {
  router.push({
    path: '/service/mydemand/apps/config',
    query: { id: item.id },
  });
}

function goPage(p: number | '...') {
  if (p === '...') return;
  currentPage.value = p;
}

function doJump() {
  const n = Number(jumpPage.value);
  if (!Number.isFinite(n) || n < 1 || n > totalPages.value) {
    showToast(`请输入 1-${totalPages.value} 之间的页码`);
    return;
  }
  currentPage.value = n;
}
</script>

<template>
  <div class="portal-inner-page my-apps-page">
    <div class="crumb">我的需求 / 我的应用</div>

    <div class="main-tabs">
      <button
        type="button"
        class="main-tab"
        :class="{ active: mainTab === 'manage' }"
        @click="mainTab = 'manage'"
      >
        应用管理
      </button>
      <button
        type="button"
        class="main-tab"
        :class="{ active: mainTab === 'material' }"
        @click="mainTab = 'material'"
      >
        素材台账
      </button>
    </div>

    <template v-if="mainTab === 'manage'">
      <div class="toolbar">
        <div class="portal-search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="keyword"
            type="text"
            placeholder="请输入产品名称"
            @keyup.enter="search"
          />
        </div>
        <button
          class="portal-btn portal-btn-primary portal-btn-sm"
          type="button"
          @click="search"
        >
          搜索
        </button>
        <button
          class="portal-btn portal-btn-primary portal-btn-sm"
          type="button"
          @click="goCreate"
        >
          新建
        </button>
        <div class="toolbar-spacer" />
        <div class="scope-nav">
          <button
            type="button"
            class="scope-item"
            :class="{ active: scope === 'created' }"
            @click="scope = scope === 'created' ? 'all' : 'created'"
          >
            <span class="scope-icon">📝</span>
            我的创建
          </button>
          <button
            type="button"
            class="scope-item"
            :class="{ active: scope === 'favorited' }"
            @click="scope = scope === 'favorited' ? 'all' : 'favorited'"
          >
            <span class="scope-icon">⭐</span>
            我的收藏
          </button>
        </div>
      </div>

      <div v-if="filtered.length === 0" class="empty-box">暂无匹配应用</div>

      <div v-else class="app-grid">
        <article
          v-for="item in paged"
          :key="item.id"
          class="app-card"
          @click="openApp(item)"
        >
          <div class="card-side-tags">
            <span class="side-tag">{{ item.category }}</span>
            <span class="side-tag is-domain">{{ item.domain }}</span>
          </div>
          <h4 class="card-title">{{ item.name }}</h4>
          <div class="card-meta">
            <span class="creator">
              创建者: {{ item.creator }}
              <span v-if="item.verified" class="verified" title="已认证">✓</span>
            </span>
            <span class="stats">
              收藏数 {{ item.favorites.toLocaleString() }} · 更新于
              {{ item.updatedAt }}
            </span>
          </div>
          <p class="card-desc">{{ item.desc }}</p>
          <div class="card-footer">
            <span class="ver">{{ item.version }}</span>
            <span class="card-icon">📦</span>
          </div>
        </article>
      </div>

      <div v-if="filtered.length > 0" class="pager">
        <span class="pager-total">共 {{ filtered.length }} 条</span>
        <div class="pager-pages">
          <button
            type="button"
            :disabled="currentPage <= 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
          >
            ‹
          </button>
          <button
            v-for="(p, idx) in pageNumbers"
            :key="`${p}-${idx}`"
            type="button"
            :class="{ active: p === currentPage, ellipsis: p === '...' }"
            :disabled="p === '...'"
            @click="goPage(p)"
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
        <div class="pager-jump">
          前往
          <input v-model="jumpPage" type="text" @keyup.enter="doJump" />
          页
        </div>
      </div>
    </template>

    <template v-else>
      <div class="material-panel">
        <p class="material-tip">
          素材台账用于管理应用训练/推理素材，可在「新建应用 → 应用素材配置」中上传与选择。
        </p>
        <button
          class="portal-btn portal-btn-primary portal-btn-sm"
          type="button"
          @click="goCreate"
        >
          去配置应用素材
        </button>
      </div>
    </template>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.crumb {
  margin-bottom: 8px;
  font-size: 13px;
  color: #9e9e9e;
}

.main-tabs {
  display: flex;
  margin-bottom: 16px;
  border-bottom: 2px solid #eeeeee;
}

.main-tab {
  padding: 10px 18px;
  margin-bottom: -2px;
  font-size: 14px;
  font-weight: 500;
  color: #757575;
  cursor: pointer;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
}

.main-tab.active {
  font-weight: 700;
  color: #409eff;
  border-bottom-color: #409eff;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-spacer {
  flex: 1;
  min-width: 8px;
}

.scope-nav {
  display: flex;
  gap: 8px;
}

.scope-item {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  color: #616161;
  cursor: pointer;
  background: #fff;
  border: 1px solid #eeeeee;
  border-radius: 8px;
}

.scope-item.active {
  color: #409eff;
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.scope-icon {
  font-style: normal;
}

.empty-box {
  padding: 48px 16px;
  font-size: 14px;
  color: #9e9e9e;
  text-align: center;
  background: #fff;
  border: 1px solid #eeeeee;
  border-radius: 12px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 1100px) {
  .app-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .app-grid {
    grid-template-columns: 1fr;
  }
}

.app-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  padding: 16px 48px 14px 16px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.app-card:hover {
  border-color: #b3d8ff;
  box-shadow: 0 4px 16px rgb(64 158 255 / 12%);
}

.card-side-tags {
  position: absolute;
  top: 12px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.side-tag {
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #1565c0;
  letter-spacing: 1px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  background: #e3f2fd;
  border-radius: 4px;
}

.side-tag.is-domain {
  color: #6a1b9a;
  background: #f3e5f5;
}

.card-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #212121;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #9e9e9e;
}

.creator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.verified {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: #ff9800;
  border-radius: 50%;
}

.card-desc {
  display: -webkit-box;
  flex: 1;
  margin: 0 0 10px;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.55;
  color: #757575;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ver {
  font-size: 12px;
  color: #bdbdbd;
}

.card-icon {
  font-size: 22px;
  opacity: 0.55;
}

.pager {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
}

.pager-total {
  font-size: 13px;
  color: #757575;
}

.pager-pages {
  display: flex;
  gap: 4px;
  align-items: center;
}

.pager-pages button {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  color: #616161;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.pager-pages button.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.pager-pages button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.pager-pages button.ellipsis {
  background: transparent;
  border: none;
}

.pager-jump {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: #757575;
}

.pager-jump input {
  width: 48px;
  height: 28px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.material-panel {
  padding: 40px 24px;
  text-align: center;
  background: #fff;
  border: 1px solid #eeeeee;
  border-radius: 12px;
}

.material-tip {
  margin: 0 0 16px;
  font-size: 14px;
  color: #757575;
}

.toast {
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
</style>
