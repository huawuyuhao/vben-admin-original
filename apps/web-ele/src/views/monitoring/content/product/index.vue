<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AdminProductId } from '#/types/monitoring/content/product';
import type { ProductInfo } from '#/types/service/product';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  CARD_LIST_VXE_LAYOUTS,
  toVxeCardPageResult,
  useVbenVxeGrid,
} from '#/adapter/vxe-table';
import {
  deleteAdminProductApi,
  getAdminProductListApi,
  updateAdminProductShelfApi,
} from '#/api/monitoring/content/product';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  ADMIN_PRODUCT_PAGE_SIZE,
  ADMIN_PRODUCT_PAGE_SIZE_OPTIONS,
  type AdminProductGridFormValues,
  buildAdminProductFilterParams,
  normalizeAdminProductPage,
  useAdminProductGridFormSchema,
} from './data';
import ProductAuditDialog from './modules/product-audit-dialog.vue';
import ProductDetailDrawer from './modules/product-detail-drawer.vue';
import ProductFormDialog from './modules/product-form-dialog.vue';
import ProductGrid from './modules/product-grid.vue';

/**
 * 内容管理 · 算力产品管理
 * 查询栏 / 分页用 useVbenVxeGrid；列表区保持 Element Plus 卡片网格
 */
defineOptions({ name: 'MonitoringContentProduct' });

/** 当前页卡片数据（与 Vxe pager 同步，不走表格 rows） */
const products = ref<ProductInfo[]>([]);
/** 列表加载中（骨架 / v-loading） */
const loading = ref(false);

const detailVisible = ref(false);
const detailItem = ref<null | ProductInfo>(null);

/** 正在上下架的产品 ID */
const shelfActingId = ref<AdminProductId | null>(null);
const formDialogRef = ref<InstanceType<typeof ProductFormDialog>>();
const auditDialogRef = ref<InstanceType<typeof ProductAuditDialog>>();

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid mine-vxe-grid--cards',
  formOptions: {
    collapsed: true,
    collapsedRows: 1,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useAdminProductGridFormSchema(),
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
      pageSize: ADMIN_PRODUCT_PAGE_SIZE,
      pageSizes: ADMIN_PRODUCT_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: AdminProductGridFormValues) => {
          loading.value = true;
          try {
            const filters = buildAdminProductFilterParams(formValues);
            const data = await getAdminProductListApi({
              page: page.currentPage,
              pageSize: page.pageSize,
              ...filters,
            });
            const normalized = normalizeAdminProductPage(data);
            products.value = normalized.records;
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
 * 打开提交审核弹窗
 * @param item 产品条目
 */
function handleSubmitAudit(item: ProductInfo) {
  auditDialogRef.value?.open(item);
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
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 表单保存成功后刷新列表
 */
function handleFormSuccess() {
  gridApi.query();
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
    gridApi.query();
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
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  } finally {
    shelfActingId.value = null;
  }
}
</script>

<template>
  <PageListShell
    :desc="$t('page.monitoring.content.product.desc')"
    :eyebrow="$t('page.monitoring.content.product.eyebrow')"
    :title="$t('page.monitoring.content.product.title')"
  >
    <template #actions>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        {{ $t('page.monitoring.content.product.add') }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>
      <template #top>
        <ProductGrid
          class="admin-product-list-cards"
          :loading="loading"
          :products="products"
          :shelf-acting-id="shelfActingId"
          @detail="handleDetail"
          @shelf-on="handleShelfOn"
          @shelf-off="handleShelfOff"
          @edit="handleEdit"
          @remove="handleRemove"
          @submit-audit="handleSubmitAudit"
        />
      </template>
    </Grid>

    <ProductDetailDrawer
      v-model:visible="detailVisible"
      :item="detailItem"
    />

    <ProductFormDialog ref="formDialogRef" @success="handleFormSuccess" />

    <ProductAuditDialog
      ref="auditDialogRef"
      @success="handleFormSuccess"
    />
  </PageListShell>
</template>

<style lang="scss" scoped>
.admin-product-list-cards {
  width: 100%;
  text-align: left;
}
</style>
