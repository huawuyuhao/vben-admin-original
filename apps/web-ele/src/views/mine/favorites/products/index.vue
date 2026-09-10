<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FavoriteItem } from '#/types/mine/favorites/products';
import type { ProductId } from '#/types/service/product';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import {
  CARD_LIST_VXE_LAYOUTS,
  toVxeCardPageResult,
  useVbenVxeGrid,
} from '#/adapter/vxe-table';
import { getFavoritesListApi } from '#/api/mine/favorites/products';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  FAVORITES_PAGE_SIZE,
  FAVORITES_PAGE_SIZE_OPTIONS,
  normalizeFavoritesPage,
} from './data';
import FavoriteGrid from './modules/favorite-grid.vue';

/**
 * 我的 · 我的收藏 · 我的产品
 * 分页 / 工具栏用 useVbenVxeGrid；列表区保持 Element Plus 卡片网格
 */
defineOptions({ name: 'MineFavoritesProducts' });

const router = useRouter();

/** 当前页卡片数据（与 Vxe pager 同步，不走表格 rows） */
const products = ref<FavoriteItem[]>([]);
/** 列表加载中（骨架 / v-loading） */
const loading = ref(false);

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid mine-vxe-grid--cards',
  gridOptions: {
    columns: [],
    height: 'auto',
    keepSource: true,
    layouts: [...CARD_LIST_VXE_LAYOUTS],
    minHeight: 0,
    pagerConfig: {
      pageSize: FAVORITES_PAGE_SIZE,
      pageSizes: FAVORITES_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          loading.value = true;
          try {
            const data = await getFavoritesListApi({
              page: page.currentPage,
              pageSize: page.pageSize,
            });
            const normalized = normalizeFavoritesPage(data);
            // 收藏列表默认视为已收藏
            products.value = normalized.records.map((item) => ({
              ...item,
              isCollected: item.isCollected ?? true,
            }));
            return toVxeCardPageResult(normalized);
          } catch {
            products.value = [];
            return toVxeCardPageResult({ total: 0 });
          } finally {
            loading.value = false;
          }
        },
      },
    },
    rowConfig: {
      keyField: 'productId',
    },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<FavoriteItem>,
});

/**
 * 进入产品详情
 * @param item 收藏条目
 */
function goDetail(item: FavoriteItem) {
  if (!item.productId) {
    return;
  }
  void router.push(`/service/product/${item.productId}`);
}

/**
 * 取消收藏后刷新列表
 * @param payload 收藏状态变化
 */
function handleCollectChange(payload: {
  collected: boolean;
  productId: ProductId;
}) {
  if (payload.collected) {
    return;
  }
  gridApi.query();
}
</script>

<template>
  <PageListShell
    :desc="$t('page.mine.favorites.products.desc')"
    :eyebrow="$t('page.mine.favorites.products.eyebrow')"
    :title="$t('page.mine.favorites.products.title')"
  >

    <Grid>
      <template #table-title></template>
      <template #top>
        <FavoriteGrid
          class="favorite-list-cards"
          collected
          :loading="loading"
          :products="products"
          @detail="goDetail"
          @collect-change="handleCollectChange"
        />
      </template>
    </Grid>
  </PageListShell>
</template>

<style lang="scss" scoped>
.favorite-list-cards {
  width: 100%;
  text-align: left;
}
</style>
