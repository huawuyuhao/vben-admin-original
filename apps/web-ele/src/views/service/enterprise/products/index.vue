<script lang="ts" setup>
import type { SupplyProductItem } from '#/types/service/enterprise/products';

import { onMounted, ref, watch } from 'vue';

import { Plus, Refresh } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import {
  deleteSupplyProductApi,
  getSupplyProductListApi,
  getSupplyProductResourceStatusApi,
  shelfSupplyProductApi,
} from '#/api/service/enterprise/products';

import {
  PRODUCT_PAGE_SIZE,
  getProductResourceI18nKey,
  isProductOnShelf,
  normalizeProductPage,
  parseProductShelfFilter,
  resolveSupplyProductId,
  type ProductShelfFilter,
} from './data';
import FilterBar from './modules/filter-bar.vue';
import FormDialog from './modules/form-dialog.vue';
import ProductPager from './modules/product-pager.vue';
import ProductTable from './modules/product-table.vue';

/**
 * 门户服务 · 我的算力产品
 * 对接 GET/POST /supply/product、PUT/DELETE /supply/product/{id}、
 * PUT /shelf、GET /resource-status
 */
defineOptions({ name: 'ServiceEnterpriseProducts' });

/** 筛选草稿：产品名称 */
const filterProductName = ref('');
/** 筛选草稿：上下架状态 */
const filterShelfStatus = ref<ProductShelfFilter>('');

/** 已生效筛选 */
const appliedProductName = ref('');
const appliedShelfStatus = ref<ProductShelfFilter>('');

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(PRODUCT_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页产品列表 */
const products = ref<SupplyProductItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);
/** 正在上下架的产品 ID */
const shelvingId = ref<null | number>(null);
/** 正在监测资源状态的产品 ID */
const monitoringId = ref<null | number>(null);

/** 新增 / 编辑表单弹窗 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();

/**
 * 拉取当前页产品列表
 */
async function fetchProducts() {
  loading.value = true;
  try {
    const data = await getSupplyProductListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      productName: appliedProductName.value.trim() || undefined,
      shelfStatus: parseProductShelfFilter(appliedShelfStatus.value),
    });
    const page = normalizeProductPage(data);
    products.value = page.records;
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
 * 回到第一页并查询
 */
function queryFromFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchProducts();
}

/**
 * 提交查询
 */
function handleSearch() {
  appliedProductName.value = filterProductName.value;
  appliedShelfStatus.value = filterShelfStatus.value;
  queryFromFirstPage();
}

/**
 * 重置筛选并查询
 */
function handleReset() {
  filterProductName.value = '';
  filterShelfStatus.value = '';
  appliedProductName.value = '';
  appliedShelfStatus.value = '';
  queryFromFirstPage();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  void fetchProducts();
}

/**
 * 打开新增弹窗
 */
function handleCreate() {
  formDialogRef.value?.openCreate();
}

/**
 * 打开编辑弹窗
 * @param row 列表行
 */
function handleEdit(row: SupplyProductItem) {
  formDialogRef.value?.openEdit(row);
}

/**
 * 删除产品（二次确认由表格 Popconfirm 触发）
 * @param row 列表行
 */
async function handleDelete(row: SupplyProductItem) {
  const id = resolveSupplyProductId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.enterprise.products.form.invalidId'));
    return;
  }

  try {
    await deleteSupplyProductApi(id);
    ElMessage.success($t('page.service.enterprise.products.delete.success'));
    void fetchProducts();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 上架 / 下架（二次确认由表格 Popconfirm 触发）
 * @param row 列表行
 */
async function handleShelf(row: SupplyProductItem) {
  const id = resolveSupplyProductId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.enterprise.products.form.invalidId'));
    return;
  }

  const onShelf = isProductOnShelf(row.shelfStatus);
  const action = onShelf ? 'unshelf' : 'shelf';
  const name = row.productName?.trim() || String(id);
  const successKey = onShelf
    ? 'page.service.enterprise.products.shelfAction.unshelfSuccess'
    : 'page.service.enterprise.products.shelfAction.shelfSuccess';

  shelvingId.value = id;
  try {
    await shelfSupplyProductApi(id, action);
    ElMessage.success($t(successKey, [name]));
    void fetchProducts();
  } catch {
    // 错误提示由接口层处理
  } finally {
    shelvingId.value = null;
  }
}

/**
 * 监测并刷新单条资源状态
 * @param row 列表行
 */
async function handleMonitor(row: SupplyProductItem) {
  const id = resolveSupplyProductId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.enterprise.products.form.invalidId'));
    return;
  }

  monitoringId.value = id;
  try {
    const result = await getSupplyProductResourceStatusApi(id);
    const status = result?.resourceStatus;
    const target = products.value.find((item) => item.supplyProductId === id);
    if (target && status != null) {
      target.resourceStatus = status;
    }
    ElMessage.success(
      $t('page.service.enterprise.products.monitor.success', [
        $t(
          `page.service.enterprise.products.resource.${getProductResourceI18nKey(status)}`,
        ),
      ]),
    );
  } catch {
    // 错误提示由接口层处理
  } finally {
    monitoringId.value = null;
  }
}

/**
 * 表单提交成功后刷新列表
 */
function handleFormSuccess() {
  void fetchProducts();
}

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
              {{ $t('page.service.enterprise.products.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.enterprise.products.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.enterprise.products.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.service.enterprise.products.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              {{ $t('page.service.enterprise.products.add') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:product-name="filterProductName"
          v-model:shelf-status="filterShelfStatus"
          @search="handleSearch"
          @reset="handleReset"
        />

        <ProductTable
          :loading="loading"
          :monitoring-id="monitoringId"
          :products="products"
          :shelving-id="shelvingId"
          @edit="handleEdit"
          @delete="handleDelete"
          @shelf="handleShelf"
          @monitor="handleMonitor"
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

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';
</style>
