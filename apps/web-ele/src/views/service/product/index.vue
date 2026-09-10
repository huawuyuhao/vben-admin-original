<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ProductInfo } from '#/types/service/product';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import {
  CARD_LIST_VXE_LAYOUTS,
  toVxeCardPageResult,
  useVbenVxeGrid,
} from '#/adapter/vxe-table';
import { getProductListApi } from '#/api/service/product';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  buildProductFilterParams,
  normalizeProductPage,
  PRODUCT_PAGE_SIZE,
  PRODUCT_PAGE_SIZE_OPTIONS,
  type ProductGridFormValues,
  useProductGridFormSchema,
} from './data';
import ProductGrid from './modules/product-grid.vue';

/**
 * 门户服务 · 产品服务列表
 * 查询栏 / 分页用 useVbenVxeGrid；列表区保持 Element Plus 卡片网格
 */
defineOptions({ name: 'ServiceProduct' });

const router = useRouter();

/** 当前页卡片数据（与 Vxe pager 同步，不走表格 rows） */
const products = ref<ProductInfo[]>([]);
/** 列表加载中（骨架 / v-loading） */
const loading = ref(false);

const [Grid] = useVbenVxeGrid({
  class: 'mine-vxe-grid mine-vxe-grid--cards',
  formOptions: {
    collapsed: true,
    collapsedRows: 1,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useProductGridFormSchema(),
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: [],
    height: 'auto',
    keepSource: true,
    layouts: [...CARD_LIST_VXE_LAYOUTS],
    minHeight: 0,
    pagerConfig: {
      pageSize: PRODUCT_PAGE_SIZE,
      pageSizes: PRODUCT_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: ProductGridFormValues) => {
          loading.value = true;
          try {
            const filters = buildProductFilterParams(formValues);
            const data = await getProductListApi({
              page: page.currentPage,
              pageSize: page.pageSize,
              ...filters,
            });
            const normalized = normalizeProductPage(data);
            products.value = normalized.records;
            // items 置空仅驱动分页 total；卡片在 #top 渲染
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
  } as VxeTableGridOptions<ProductInfo>,
});

/**
 * 进入产品详情
 * @param item 产品
 */
function goDetail(item: ProductInfo) {
  if (!item.productId) {
    return;
  }
  void router.push(`/service/product/${item.productId}`);
}
</script>

<template>
  <PageListShell
    :desc="$t('page.service.product.desc')"
    :eyebrow="$t('page.service.product.eyebrow')"
    :title="$t('page.service.product.title')"
  >
    <Grid>
      <template #table-title></template>
      <template #top>
        <ProductGrid
          class="product-list-cards"
          :loading="loading"
          :products="products"
          @detail="goDetail"
        />
      </template>
    </Grid>
  </PageListShell>
</template>

<style lang="scss" scoped>
.product-list-cards {
  width: 100%;
  text-align: left;
}
</style>
