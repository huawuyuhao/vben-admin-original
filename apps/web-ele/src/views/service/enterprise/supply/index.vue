<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  SupplyDeviceExportParams,
  SupplyDeviceItem,
} from '#/types/service/enterprise/supply';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Download, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportSupplyDeviceApi,
  getSupplyDeviceListApi,
} from '#/api/service/enterprise/supply';
import { downloadExportFile } from '#/store/common';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  buildSupplyFilterParams,
  normalizeSupplyPage,
  SUPPLY_PAGE_SIZE,
  SUPPLY_PAGE_SIZE_OPTIONS,
  type SupplyGridFormValues,
  useSupplyColumns,
  useSupplyGridFormSchema,
} from './data';
import FormDialog from './modules/form-dialog.vue';

/**
 * 门户服务 · 我的算力供给
 * 列表统一使用 useVbenVxeGrid（查询栏 / 分页 / 工具栏），壳层沿用 page-shell
 */
defineOptions({ name: 'ServiceEnterpriseSupply' });

/** 导出中 */
const exporting = ref(false);
/** 悬停导出按钮时显示提示 */
const exportHintVisible = ref(false);
/** 最近一次查询生效的筛选条件（供导出使用） */
const appliedFilterParams = ref<SupplyDeviceExportParams>({});
/** 新增表单弹窗引用 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  formOptions: {
    collapsed: false,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useSupplyGridFormSchema(),
    showCollapseButton: false,
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useSupplyColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: SUPPLY_PAGE_SIZE,
      pageSizes: SUPPLY_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: SupplyGridFormValues) => {
          const filters = buildSupplyFilterParams(formValues);
          appliedFilterParams.value = filters;
          const data = await getSupplyDeviceListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...filters,
          });
          return toVxePageResult(normalizeSupplyPage(data));
        },
      },
    },
    rowConfig: {
      keyField: 'deviceId',
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<SupplyDeviceItem>,
});

/**
 * 打开新增设备弹窗
 */
function handleCreate() {
  formDialogRef.value?.openCreate();
}

/**
 * 显示导出提示
 */
function showExportHint() {
  exportHintVisible.value = true;
}

/**
 * 隐藏导出提示
 */
function hideExportHint() {
  exportHintVisible.value = false;
}

/**
 * 按当前受理状态筛选导出清单
 */
async function handleExport() {
  exporting.value = true;
  try {
    const formValues = (await gridApi.formApi?.getValues()) as
      | SupplyGridFormValues
      | undefined;
    const filters =
      Object.keys(appliedFilterParams.value).length > 0
        ? appliedFilterParams.value
        : buildSupplyFilterParams(formValues);

    const result = await exportSupplyDeviceApi(filters);
    const ok = await downloadExportFile({
      fileUrl: result?.fileUrl,
      fileName: result?.fileName,
    });
    if (!ok) {
      ElMessage.error($t('page.service.enterprise.supply.export.noUrl'));
      return;
    }
    ElMessage.success($t('page.service.enterprise.supply.export.success'));
  } catch {
    // 错误提示由接口层 / 下载工具处理
  } finally {
    exporting.value = false;
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
    :desc="$t('page.service.enterprise.supply.desc')"
    :eyebrow="$t('page.service.enterprise.supply.eyebrow')"
    :title="$t('page.service.enterprise.supply.title')"
  >
    <template #actions>
      <Transition name="supply-export-tip">
        <span v-if="exportHintVisible" class="supply-page__export-tip">
          {{ $t('page.service.enterprise.supply.export.hint') }}
        </span>
      </Transition>
      <el-button
        class="mine-shell__action-btn"
        :icon="Download"
        :loading="exporting"
        @click="handleExport"
        @mouseenter="showExportHint"
        @mouseleave="hideExportHint"
        @focus="showExportHint"
        @blur="hideExportHint"
      >
        {{ $t('page.service.enterprise.supply.export.action') }}
      </el-button>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('page.service.enterprise.supply.add') }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>
    </Grid>

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />
  </PageListShell>
</template>

<style lang="scss" scoped>
.supply-page {
  &__export-tip {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
    white-space: nowrap;
  }
}

.supply-export-tip {
  &-enter-active,
  &-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(8px);
  }
}
</style>
