<script lang="ts" setup>
import type {
  AdminProductId,
  AdminProductShelfStatus,
} from '#/types/monitoring/content/product';
import type { ProductInfo } from '#/types/service/product';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  deleteAdminProductApi,
  updateAdminProductShelfApi,
} from '#/api/monitoring/content/product';

import ContentPageShell from '../home/modules/content-page-shell.vue';
import { useAdminProductList } from './composables/use-admin-product-list';
import FilterBar from './modules/filter-bar.vue';
import ProductDetailDrawer from './modules/product-detail-drawer.vue';
import ProductFormDialog from './modules/product-form-dialog.vue';
import ProductGrid from './modules/product-grid.vue';
import ProductPager from './modules/product-pager.vue';

defineOptions({ name: 'MonitoringContentProduct' });

const productName = ref('');
const shelfStatus = ref<'' | AdminProductShelfStatus>('');
const detailVisible = ref(false);
const detailItem = ref<null | ProductInfo>(null);

/** 正在上下架的产品 ID */
const shelfActingId = ref<AdminProductId | null>(null);
const formDialogRef = ref<InstanceType<typeof ProductFormDialog>>();

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
 * 打开新增产品弹窗
 */
function handleAdd() {
  formDialogRef.value?.openCreate();
}

/**
 * 打开编辑产品弹窗
 * @param item 产品条目
 */
function handleEdit(item: ProductInfo) {
  formDialogRef.value?.openEdit(item);
}

/**
 * 提交审核（接口未就绪，仅预留入口）
 * @param item 产品条目
 */
function handleSubmitAudit(_item: ProductInfo) {
  ElMessage.info($t('page.monitoring.content.product.submitAuditPending'));
}

/**
 * 删除产品
 * @param item 产品条目
 */
async function handleRemove(item: ProductInfo) {
  try {
    await deleteAdminProductApi(item.productId);
    ElMessage.success(
      $t('page.monitoring.content.product.deleteSuccess', [item.productName]),
    );
    refresh();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 表单保存成功后刷新列表
 */
function handleFormSuccess() {
  refresh();
}

/**
 * 上架产品
 * @param item 产品条目
 */
async function handleShelfOn(item: ProductInfo) {
  shelfActingId.value = item.productId;
  try {
    await updateAdminProductShelfApi(item.productId, { action: 'shelf' });
    ElMessage.success(
      $t('page.monitoring.content.product.shelfOnSuccess', [item.productName]),
    );
    refresh();
  } catch {
    // 错误提示由接口层处理
  } finally {
    shelfActingId.value = null;
  }
}

/**
 * 下架产品
 * @param item 产品条目
 */
async function handleShelfOff(item: ProductInfo) {
  shelfActingId.value = item.productId;
  try {
    await updateAdminProductShelfApi(item.productId, { action: 'unshelf' });
    ElMessage.success(
      $t('page.monitoring.content.product.shelfOffSuccess', [item.productName]),
    );
    refresh();
  } catch {
    // 错误提示由接口层处理
  } finally {
    shelfActingId.value = null;
  }
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
        @click="handleAdd"
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
      :shelf-acting-id="shelfActingId"
      @detail="handleDetail"
      @shelf-on="handleShelfOn"
      @shelf-off="handleShelfOff"
      @edit="handleEdit"
      @remove="handleRemove"
      @submit-audit="handleSubmitAudit"
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

    <ProductFormDialog ref="formDialogRef" @success="handleFormSuccess" />
  </ContentPageShell>
</template>
