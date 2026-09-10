<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SupplyProductItem } from '#/types/service/enterprise/products';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSupplyProductApi,
  getSupplyProductListApi,
  getSupplyProductResourceStatusApi,
  shelfSupplyProductApi,
} from '#/api/service/enterprise/products';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  buildProductFilterParams,
  getProductResourceI18nKey,
  isProductOnShelf,
  normalizeProductPage,
  PRODUCT_PAGE_SIZE,
  PRODUCT_PAGE_SIZE_OPTIONS,
  type ProductGridFormValues,
  resolveSupplyProductId,
  useProductColumns,
  useProductGridFormSchema,
} from './data';
import FormDialog from './modules/form-dialog.vue';

/**
 * 门户服务 · 我的算力产品
 * 列表统一使用 useVbenVxeGrid（查询栏 / 分页 / 工具栏），壳层沿用 page-shell
 */
defineOptions({ name: 'ServiceEnterpriseProducts' });

/** 正在上下架的产品 ID */
const shelvingId = ref<null | number>(null);
/** 正在监测资源状态的产品 ID */
const monitoringId = ref<null | number>(null);

/** 新增 / 编辑表单弹窗 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  formOptions: {
    collapsed: false,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useProductGridFormSchema(),
    showCollapseButton: false,
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useProductColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: PRODUCT_PAGE_SIZE,
      pageSizes: PRODUCT_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: ProductGridFormValues) => {
          const filters = buildProductFilterParams(formValues);
          const data = await getSupplyProductListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...filters,
          });
          return toVxePageResult(normalizeProductPage(data));
        },
      },
    },
    rowConfig: {
      keyField: 'supplyProductId',
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<SupplyProductItem>,
});

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
 * 删除产品（二次确认由 Popconfirm 触发）
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
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 上架 / 下架（二次确认由 Popconfirm 触发）
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
    gridApi.query();
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
    if (status != null) {
      row.resourceStatus = status;
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
  gridApi.query();
}
</script>

<template>
  <PageListShell
    :desc="$t('page.service.enterprise.products.desc')"
    :eyebrow="$t('page.service.enterprise.products.eyebrow')"
    :title="$t('page.service.enterprise.products.title')"
  >
    <template #actions>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('page.service.enterprise.products.add') }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>

      <template #action="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">
          {{ $t('page.service.enterprise.products.actions.edit') }}
        </el-button>
        <el-popconfirm
          width="240"
          :cancel-button-text="
            $t('page.service.enterprise.products.shelfAction.cancelBtn')
          "
          :confirm-button-text="
            $t('page.service.enterprise.products.shelfAction.confirmBtn')
          "
          :title="
            $t(
              isProductOnShelf(row.shelfStatus)
                ? 'page.service.enterprise.products.shelfAction.unshelfConfirm'
                : 'page.service.enterprise.products.shelfAction.shelfConfirm',
              [
                row.productName?.trim() ||
                  String(row.supplyProductId ?? '') ||
                  $t('page.service.enterprise.products.valueEmpty'),
              ],
            )
          "
          @confirm="handleShelf(row)"
        >
          <template #reference>
            <el-button
              link
              type="primary"
              :loading="shelvingId === row.supplyProductId"
            >
              {{
                isProductOnShelf(row.shelfStatus)
                  ? $t('page.service.enterprise.products.actions.unshelf')
                  : $t('page.service.enterprise.products.actions.shelf')
              }}
            </el-button>
          </template>
        </el-popconfirm>
        <el-button
          link
          type="primary"
          :loading="monitoringId === row.supplyProductId"
          @click="handleMonitor(row)"
        >
          {{ $t('page.service.enterprise.products.actions.monitor') }}
        </el-button>
        <el-popconfirm
          width="240"
          confirm-button-type="danger"
          :cancel-button-text="
            $t('page.service.enterprise.products.delete.cancelBtn')
          "
          :confirm-button-text="
            $t('page.service.enterprise.products.delete.confirmBtn')
          "
          :title="
            $t('page.service.enterprise.products.delete.confirm', [
              row.productName?.trim() ||
                String(row.supplyProductId ?? '') ||
                $t('page.service.enterprise.products.valueEmpty'),
            ])
          "
          @confirm="handleDelete(row)"
        >
          <template #reference>
            <el-button link type="danger">
              {{ $t('page.service.enterprise.products.actions.delete') }}
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </Grid>

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />
  </PageListShell>
</template>
