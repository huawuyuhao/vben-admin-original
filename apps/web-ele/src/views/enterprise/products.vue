<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import {
  type ProductShelfStatus,
  enterpriseProducts,
} from '#/views/_shared/data/enterprise';

const keyword = ref('');
const statusFilter = ref('all');
const typeFilter = ref('all');
const currentPage = ref(1);
const pageSize = 4;
const toast = ref('');

const filtered = computed(() => {
  let list = [...enterpriseProducts];
  const key = keyword.value.trim().toLowerCase();
  if (key) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(key) ||
        p.tags.some((t) => t.toLowerCase().includes(key)) ||
        p.desc.includes(key),
    );
  }
  if (statusFilter.value !== 'all') {
    list = list.filter((p) => p.status === statusFilter.value);
  }
  if (typeFilter.value !== 'all') {
    list = list.filter((p) => p.type === typeFilter.value);
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

watch([keyword, statusFilter, typeFilter], () => {
  currentPage.value = 1;
});

function statusClass(s: ProductShelfStatus) {
  if (s === '已上架') return 'status-on';
  if (s === '已下架') return 'status-off';
  return 'status-review';
}

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}
</script>

<template>
  <div class="portal-inner-page enterprise-products-page">
    <div class="portal-page-title">
      <h2>我的算力产品</h2>
      <p>管理已接入设备上架的算力产品，支持检索、筛选与维护产品信息。</p>
    </div>

    <div class="portal-filter-bar">
      <div class="portal-search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索产品名称、标签"
        />
      </div>
      <select v-model="statusFilter">
        <option value="all">全部状态</option>
        <option value="已上架">已上架</option>
        <option value="已下架">已下架</option>
        <option value="审核中">审核中</option>
      </select>
      <select v-model="typeFilter">
        <option value="all">全部类型</option>
        <option value="智算服务">智算服务</option>
        <option value="通算服务">通算服务</option>
      </select>
      <div class="filter-spacer" />
      <button
        class="portal-btn portal-btn-primary portal-btn-sm"
        type="button"
        @click="showToast('打开新增算力产品表单（示例）')"
      >
        + 新增算力产品
      </button>
    </div>

    <div v-if="filtered.length === 0" class="portal-empty">暂无匹配产品</div>

    <div v-else class="ep-grid">
      <article v-for="item in paged" :key="item.id" class="ep-card">
        <div class="ep-cover">
          <span class="ep-cover-icon">{{ item.cover }}</span>
          <span class="ep-status" :class="statusClass(item.status)">
            {{ item.status }}
          </span>
        </div>
        <div class="ep-body">
          <h4>{{ item.name }}</h4>
          <div class="ep-tags">
            <span v-for="tag in item.tags" :key="tag" class="ep-tag">
              {{ tag }}
            </span>
          </div>
          <p>{{ item.desc }}</p>
          <div class="ep-footer">
            <div class="ep-price">
              <span class="label">参考价格</span>
              <strong>{{ item.price }}</strong>
            </div>
            <div class="ep-actions">
              <button
                class="icon-btn"
                type="button"
                title="编辑"
                @click="showToast(`编辑：${item.name}`)"
              >
                ✎
              </button>
              <button
                class="icon-btn"
                type="button"
                title="查看"
                @click="showToast(`查看：${item.name}`)"
              >
                👁
              </button>
            </div>
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

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.filter-spacer {
  flex: 1;
  min-width: 8px;
}

.portal-empty {
  padding: 48px 16px;
  font-size: 14px;
  color: var(--portal-gray-500, #9e9e9e);
  text-align: center;
}

.ep-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 960px) {
  .ep-grid {
    grid-template-columns: 1fr;
  }
}

.ep-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eeeeee);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.ep-cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  background:
    linear-gradient(135deg, #e8f1ff 0%, #f0edff 50%, #e8f8ef 100%);
}

.ep-cover-icon {
  font-size: 42px;
  line-height: 1;
}

.ep-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.status-on {
  color: #1b7a3d;
  background: #e8f8ef;
}

.status-off {
  color: #616161;
  background: #eeeeee;
}

.status-review {
  color: #b26a00;
  background: #fff4e0;
}

.ep-body {
  padding: 14px 16px 16px;
}

.ep-body h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.ep-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.ep-tag {
  padding: 2px 8px;
  font-size: 12px;
  color: var(--portal-primary-dark, #4a2fcc);
  background: var(--portal-primary-bg, #f0edff);
  border-radius: 999px;
}

.ep-body p {
  display: -webkit-box;
  margin: 0 0 14px;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.55;
  color: var(--portal-gray-600, #757575);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ep-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--portal-gray-100, #f5f5f5);
}

.ep-price .label {
  display: block;
  margin-bottom: 2px;
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.ep-price strong {
  font-size: 15px;
  font-weight: 700;
  color: var(--portal-primary, #6b4cff);
}

.ep-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 14px;
  color: var(--portal-gray-600, #757575);
  cursor: pointer;
  background: var(--portal-gray-50, #fafafa);
  border: 1px solid var(--portal-gray-200, #eeeeee);
  border-radius: 999px;
}

.icon-btn:hover {
  color: var(--portal-primary, #6b4cff);
  border-color: var(--portal-primary-light, #8b7aff);
  background: var(--portal-primary-bg, #f0edff);
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
</style>
