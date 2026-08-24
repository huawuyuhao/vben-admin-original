<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { portalProducts } from '#/views/_shared/data/products';

const router = useRouter();

const keyword = ref('');
const regionFilter = ref('all');
const typeFilter = ref('all');
const currentPage = ref(1);
const pageSize = 6;

const filtered = computed(() => {
  let list = [...portalProducts];
  const key = keyword.value.trim().toLowerCase();
  if (key) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(key) ||
        p.desc.includes(key) ||
        p.region.includes(key),
    );
  }
  if (regionFilter.value !== 'all') {
    list = list.filter((p) => p.region === regionFilter.value);
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

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  const pages: number[] = [];
  const maxShow = Math.min(total, 4);
  let start = Math.max(1, Math.min(cur - 1, total - maxShow + 1));
  for (let i = 0; i < maxShow; i++) pages.push(start + i);
  return pages;
});

watch([keyword, regionFilter, typeFilter], () => {
  currentPage.value = 1;
});

function goDetail(id: string) {
  router.push(`/service/product/${id}`);
}
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>产品服务</h2>
      <p>
        展示已发布算力产品的名称、简介及图片，支持进入详情页。便于用户批量查阅算力产品，快速筛选适配算力需求的资源。
      </p>
    </div>

    <div class="portal-filter-bar">
      <div class="portal-search-box">
        <span class="search-icon">🔍</span>
        <input v-model="keyword" type="text" placeholder="搜索产品名称..." />
      </div>
      <select v-model="regionFilter">
        <option value="all">全部区域</option>
        <option value="贵州">贵州</option>
        <option value="广州">广州</option>
        <option value="惠州">惠州</option>
        <option value="边缘节点">边缘节点</option>
      </select>
      <select v-model="typeFilter">
        <option value="all">全部类型</option>
        <option value="GPU 智算">GPU 智算</option>
        <option value="CPU 通算">CPU 通算</option>
        <option value="边缘算力">边缘算力</option>
        <option value="存储服务">存储服务</option>
      </select>
      <button class="portal-btn portal-btn-primary portal-btn-sm" type="button">
        🔍 查询
      </button>
    </div>

    <div v-if="filtered.length === 0" class="portal-empty">暂无匹配产品</div>

    <div v-else class="portal-product-grid">
      <div
        v-for="item in paged"
        :key="item.id"
        class="portal-product-card"
        @click="goDetail(item.id)"
      >
        <div class="portal-product-img">{{ item.icon }}</div>
        <div class="portal-product-body">
          <h4>{{ item.name }}</h4>
          <p>{{ item.desc }}</p>
          <div class="portal-product-tags">
            <span class="portal-product-tag">{{ item.green }}</span>
            <span class="portal-product-tag price">{{ item.price }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filtered.length > 0" class="portal-pagination">
      <span class="portal-page-info">共 {{ filtered.length }} 条记录</span>
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="currentPage = Math.max(1, currentPage - 1)"
      >
        上一页
      </button>
      <button
        v-for="p in pageNumbers"
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
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.portal-empty {
  padding: 48px 16px;
  font-size: 14px;
  color: var(--portal-gray-500, #9e9e9e);
  text-align: center;
  background: #fff;
  border: 1px dashed var(--portal-gray-300, #e0e0e0);
  border-radius: 12px;
}

.portal-pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.portal-product-card {
  cursor: pointer;
}
</style>
