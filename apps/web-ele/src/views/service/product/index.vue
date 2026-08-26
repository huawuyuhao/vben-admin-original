<script lang="ts" setup>
import type { ProductInfo } from '#/types/service/product';

import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { getProductListApi } from '#/api/service/product';

import {
  PRODUCT_PAGE_SIZE,
  buildProductSortParams,
  normalizeProductPage,
} from './data';
import FilterBar from './modules/filter-bar.vue';
import ProductGrid from './modules/product-grid.vue';
import ProductPager from './modules/product-pager.vue';

/**
 * 门户服务 · 产品服务列表（对接 GET /product/list 扁平分页返参）
 */
defineOptions({ name: 'ServiceProduct' });

const router = useRouter();

/** 搜索关键词 */
const keyword = ref('');
/** 排序字段（price / greenPowerRatio） */
const sortField = ref<null | string>('');
/** 排序方向（asc / desc） */
const sortOrder = ref<null | string>('');
/** 当前页码（对应接口 page / 返参 current） */
const currentPage = ref(1);
/** 每页条数（对应接口 pageSize / 返参 size） */
const pageSize = ref(PRODUCT_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页产品（对应返参 records） */
const products = ref<ProductInfo[]>([]);
/** 总条数（对应返参 total） */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);

/**
 * 拉取当前页产品列表
 */
async function fetchProducts() {
  loading.value = true;
  try {
    const sort = buildProductSortParams(sortField.value, sortOrder.value);
    const data = await getProductListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      ...sort,
    });
    const page = normalizeProductPage(data);
    products.value = page.records;
    total.value = page.total;

    // 仅在服务端 current 与本地不一致时回写页码；pageSize 以前端选项为准
    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    products.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 回到第一页并查询（搜索 / 排序）
 */
function queryFromFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchProducts();
}

/**
 * 提交搜索
 */
function handleSearch() {
  queryFromFirstPage();
}

/**
 * 刷新当前条件
 */
function handleRefresh() {
  void fetchProducts();
}

/**
 * 进入产品详情
 * @param item 产品
 */
function goDetail(item: ProductInfo) {
  if (!item.productId) {
    return;
  }
  router.push(`/service/product/${item.productId}`);
}

watch([sortField, sortOrder], () => {
  queryFromFirstPage();
});

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchProducts();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchProducts();
});

onMounted(() => {
  void fetchProducts();
});
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
            <p class="mine-shell__eyebrow">
              {{ $t('page.service.product.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.product.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.product.desc') }}
            </p>
          </div>
        </header>

        <FilterBar
          v-model:keyword="keyword"
          v-model:sort-field="sortField"
          v-model:sort-order="sortOrder"
          :refreshing="loading"
          @refresh="handleRefresh"
          @search="handleSearch"
        />

        <ProductGrid
          :loading="loading"
          :products="products"
          @detail="goDetail"
        />

        <ProductPager
          v-if="products.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../scss/page-shell.scss';
</style>
