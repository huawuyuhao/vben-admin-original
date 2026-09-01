<script lang="ts" setup>
import type { FavoriteItem } from '#/types/mine/favorites/products';

import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { getFavoritesListApi } from '#/api/mine/favorites/products';

import {
  FAVORITES_PAGE_SIZE,
  normalizeFavoritesPage,
} from './data';
import FavoriteGrid from './modules/favorite-grid.vue';
import FavoritePager from './modules/favorite-pager.vue';

/**
 * 我的 · 我的收藏 · 我的产品（对接 GET /product/collect/list）
 */
defineOptions({ name: 'MineFavoritesProducts' });

const router = useRouter();

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(FAVORITES_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页收藏产品 */
const products = ref<FavoriteItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);

/**
 * 拉取收藏产品分页列表
 */
async function fetchFavorites() {
  loading.value = true;
  try {
    const data = await getFavoritesListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    const page = normalizeFavoritesPage(data);
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
 * @param item 收藏条目
 */
function goDetail(item: FavoriteItem) {
  if (!item.productId) {
    return;
  }
  router.push(`/service/product/${item.productId}`);
}

/**
 * 取消收藏后从当前页移除；空页则回退上一页
 * @param payload 收藏状态变化
 */
function handleCollectChange(payload: {
  collected: boolean;
  productId: number;
}) {
  if (payload.collected) {
    return;
  }
  products.value = products.value.filter(
    (item) => item.productId !== payload.productId,
  );
  total.value = Math.max(0, total.value - 1);
  if (products.value.length === 0 && currentPage.value > 1) {
    currentPage.value -= 1;
    return;
  }
  if (products.value.length === 0) {
    void fetchFavorites();
  }
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
              {{ $t('page.mine.favorites.products.eyebrow') }}
            </p>
            <h2>{{ $t('page.mine.favorites.products.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.mine.favorites.products.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.mine.favorites.products.refresh') }}
            </el-button>
          </div>
        </header>

        <FavoriteGrid
          collected
          :loading="loading"
          :products="products"
          :empty-description="$t('page.mine.favorites.products.empty')"
          @detail="goDetail"
          @collect-change="handleCollectChange"
        />

        <FavoritePager
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
