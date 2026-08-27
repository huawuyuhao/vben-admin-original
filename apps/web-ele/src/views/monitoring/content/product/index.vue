<script lang="ts" setup>
import type { AdminProductShelfStatus } from '#/types/monitoring/content/product';
import type { ProductInfo } from '#/types/service/product';

import { ref } from 'vue';

import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

import ContentPageShell from '../home/modules/content-page-shell.vue';

import { useAdminProductList } from './composables/use-admin-product-list';
import FilterBar from './modules/filter-bar.vue';
import ProductDetailDrawer from './modules/product-detail-drawer.vue';
import ProductGrid from './modules/product-grid.vue';
import ProductPager from './modules/product-pager.vue';

defineOptions({ name: 'MonitoringContentProduct' });

const productName = ref('');
const shelfStatus = ref<'' | AdminProductShelfStatus>('');
const detailVisible = ref(false);
const detailItem = ref<null | ProductInfo>(null);

const {
  applyFilters,
  currentPage,
  loading,
  pageSize,
  records,
  refresh,
  resetFilters,
  total,
} = useAdminProductList();

/**
 * 提交筛选查询
 */
function handleSearch() {
  applyFilters(productName.value, shelfStatus.value);
}

/**
 * 重置筛选条件
 */
function handleReset() {
  productName.value = '';
  shelfStatus.value = '';
  resetFilters();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  refresh();
}

/**
 * 打开产品详情抽屉
 * @param item 产品条目
 */
function handleDetail(item: ProductInfo) {
  detailItem.value = item;
  detailVisible.value = true;
}

/**
 * 新增产品（接口未就绪）
 */
function handleAddPending() {
  ElMessage.info(
    $t('page.monitoring.content.home.common.actionPending', [
      $t('page.monitoring.content.product.add'),
    ]),
  );
}
</script>

<template>
  <ContentPageShell
    :eyebrow="$t('page.monitoring.content.product.eyebrow')"
    :title="$t('page.monitoring.content.product.title')"
    :desc="$t('page.monitoring.content.product.desc')"
  >
    <template #actions>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        @click="handleAddPending"
      >
        <el-icon><Plus /></el-icon>
        {{ $t('page.monitoring.content.product.add') }}
      </el-button>
    </template>

    <FilterBar
      v-model:product-name="productName"
      v-model:shelf-status="shelfStatus"
      :refreshing="loading"
      @refresh="handleRefresh"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ProductGrid
      :loading="loading"
      :products="records"
      @detail="handleDetail"
    />

    <ProductPager
      v-if="records.length > 0 || loading || total > 0"
      v-model:page="currentPage"
      v-model:page-size="pageSize"
      :disabled="loading"
      :total="total"
    />

    <ProductDetailDrawer
      v-model:visible="detailVisible"
      :item="detailItem"
    />
  </ContentPageShell>
</template>
