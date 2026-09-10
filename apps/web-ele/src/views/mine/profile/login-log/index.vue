<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  LoginLogExportParams,
  LoginLogItem,
} from '#/types/mine/profile/login-log';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportLoginLogApi,
  getLoginLogListApi,
} from '#/api/mine/profile/login-log';
import { downloadExportFile } from '#/store/common';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  buildLoginLogFilterParams,
  LOGIN_LOG_PAGE_SIZE,
  LOGIN_LOG_PAGE_SIZE_OPTIONS,
  type LoginLogGridFormValues,
  normalizeLoginLogPage,
  useLoginLogColumns,
  useLoginLogGridFormSchema,
} from './data';

/**
 * 我的 · 登录日志
 * 列表统一使用 useVbenVxeGrid（查询栏 / 分页 / 工具栏），壳层沿用 page-shell
 */
defineOptions({ name: 'MineProfileLoginLog' });

/** 导出中 */
const exporting = ref(false);
/** 最近一次查询生效的筛选条件（供导出使用） */
const appliedFilterParams = ref<LoginLogExportParams>({});

const [Grid] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  formOptions: {
    collapsed: true,
    collapsedRows: 1,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useLoginLogGridFormSchema(),
    showCollapseButton: true,
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useLoginLogColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: LOGIN_LOG_PAGE_SIZE,
      pageSizes: LOGIN_LOG_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: LoginLogGridFormValues) => {
          const filters = buildLoginLogFilterParams(formValues);
          appliedFilterParams.value = filters;
          const data = await getLoginLogListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...filters,
          });
          return toVxePageResult(normalizeLoginLogPage(data));
        },
      },
    },
    rowConfig: {
      keyField: 'infoId',
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<LoginLogItem>,
});

/**
 * 按最近一次查询生效的筛选条件导出登录日志
 */
async function handleExport() {
  exporting.value = true;
  try {
    const result = await exportLoginLogApi(appliedFilterParams.value);
    const ok = await downloadExportFile({
      fileUrl: result?.fileUrl,
      fileName: result?.fileName,
    });
    if (!ok) {
      ElMessage.error($t('page.mine.loginLog.export.noUrl'));
      return;
    }
    ElMessage.success($t('page.mine.loginLog.export.success'));
  } catch {
    // 错误提示由接口层 / 下载工具处理
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <PageListShell
    :desc="$t('page.mine.loginLog.desc')"
    :eyebrow="$t('page.mine.loginLog.eyebrow')"
    :title="$t('page.mine.loginLog.title')"
  >
    <template #actions>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Download"
        :loading="exporting"
        @click="handleExport"
      >
        {{ $t('page.mine.loginLog.export.btn') }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>
    </Grid>
  </PageListShell>
</template>
