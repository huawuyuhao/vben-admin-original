<script lang="ts" setup>
import type { ProductCollectInfo, ProductInfo } from '#/types/service/product';

import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { getProductCollectListApi } from '#/api/service/product';
import {
  PRODUCT_PAGE_SIZE,
  normalizeProductPage,
} from '#/views/service/product/data';
import ProductGrid from '#/views/service/product/modules/product-grid.vue';
import ProductPager from '#/views/service/product/modules/product-pager.vue';

/**
 * 我的 · 我的收藏（对接 GET /product/collect/list）
 */
defineOptions({ name: 'MineProfileFavorites' });

const router = useRouter();

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(PRODUCT_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页收藏产品 */
const products = ref<ProductCollectInfo[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);

/**
 * 拉取收藏分页列表
 */
async function fetchFavorites() {
  loading.value = true;
  try {
    const data = await getProductCollectListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    const page = normalizeProductPage(data);
    // 收藏列表默认视为已收藏
    products.value = page.records.map((item) => ({
      ...item,
      isCollected: item.isCollected ?? true,
    }));
    total.value = page.total;

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
 * 刷新当前页
 */
function handleRefresh() {
  void fetchFavorites();
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

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchFavorites();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchFavorites();
});

onMounted(() => {
  void fetchFavorites();
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
              {{ $t('page.mine.favorites.eyebrow') }}
            </p>
            <h2>{{ $t('page.mine.favorites.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.mine.favorites.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.mine.favorites.refresh') }}
            </el-button>
          </div>
        </header>

        <ProductGrid
          :loading="loading"
          :products="products"
          :empty-description="$t('page.mine.favorites.empty')"
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
@use '../../../../scss/page-shell.scss';
</style>
