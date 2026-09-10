<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { RunningTaskItem } from '#/types/service/mydemand/runtime';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  closeRunningTaskApi,
  getRunningTaskListApi,
} from '#/api/service/mydemand/runtime';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  canCloseRunningTask,
  displayRuntimeStatusName,
  formatRuntimePercent,
  getRuntimeStatusTagType,
  normalizeRuntimePage,
  resolveRunningTaskId,
  RUNTIME_PAGE_SIZE,
  useRuntimeColumns,
} from './data';

/**
 * 门户服务 · 应用运行管理
 * 列表统一使用 useVbenVxeGrid（分页 / 工具栏），壳层沿用 page-shell
 */
defineOptions({ name: 'ServiceMyDemandRuntime' });

const router = useRouter();

/** 正在关闭的任务 ID */
const closingId = ref<null | string>(null);

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  gridOptions: {
    columns: useRuntimeColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: RUNTIME_PAGE_SIZE,
      pageSizes: [10, 20, 50],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const data = await getRunningTaskListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
          });
          return toVxePageResult(normalizeRuntimePage(data));
        },
      },
    },
    rowConfig: {
      keyField: 'taskId',
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<RunningTaskItem>,
});

/**
 * 跳转运行详情页
 * @param row 列表行
 */
function handleDetail(row: RunningTaskItem) {
  const id = resolveRunningTaskId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.runtime.invalidId'));
    return;
  }
  void router.push({
    path: '/service/mydemand/runtime/detail',
    query: { id: String(id) },
  });
}

/**
 * 关闭任务
 * @param row 列表行
 */
async function handleClose(row: RunningTaskItem) {
  const id = resolveRunningTaskId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.runtime.invalidId'));
    return;
  }

  closingId.value = id;
  try {
    const result = await closeRunningTaskApi(id);
    const tip = typeof result === 'string' ? result.trim() : '';
    ElMessage.success(
      tip || $t('page.service.mydemand.runtime.close.success'),
    );
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  } finally {
    closingId.value = null;
  }
}
</script>

<template>
  <PageListShell
    :desc="$t('page.service.mydemand.runtime.desc')"
    :eyebrow="$t('page.service.mydemand.runtime.eyebrow')"
    :title="$t('page.service.mydemand.runtime.title')"
  >

    <Grid>
      <template #table-title></template>

      <template #runStatus="{ row }">
        <el-tag
          effect="light"
          round
          size="small"
          :type="getRuntimeStatusTagType(row.runStatus)"
        >
          {{
            displayRuntimeStatusName(
              row,
              $t('page.service.mydemand.runtime.valueEmpty'),
            )
          }}
        </el-tag>
      </template>

      <template #completePercent="{ row }">
        <div class="runtime-progress">
          <el-progress
            :percentage="
              Math.min(100, Math.max(0, Number(row.completePercent) || 0))
            "
            :show-text="false"
            :stroke-width="10"
          />
          <span class="runtime-progress__text">
            {{
              formatRuntimePercent(row.completePercent) ||
              $t('page.service.mydemand.runtime.valueEmpty')
            }}
          </span>
        </div>
      </template>

      <template #action="{ row }">
        <el-button link type="primary" @click="handleDetail(row)">
          {{ $t('page.service.mydemand.runtime.actions.detail') }}
        </el-button>
        <el-popconfirm
          v-if="canCloseRunningTask(row.runStatus)"
          :cancel-button-text="
            $t('page.service.mydemand.runtime.close.cancelBtn')
          "
          :confirm-button-text="
            $t('page.service.mydemand.runtime.close.confirmBtn')
          "
          :title="
            $t('page.service.mydemand.runtime.close.confirm', [
              row.taskName?.trim() ||
                $t('page.service.mydemand.runtime.valueEmpty'),
            ])
          "
          @confirm="handleClose(row)"
        >
          <template #reference>
            <el-button
              link
              type="danger"
              :loading="
                closingId != null && closingId === resolveRunningTaskId(row)
              "
            >
              {{ $t('page.service.mydemand.runtime.actions.close') }}
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </Grid>
  </PageListShell>
</template>

<style lang="scss" scoped>
.runtime-progress {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;

  :deep(.el-progress) {
    flex: 1;
    min-width: 0;
  }

  &__text {
    flex-shrink: 0;
    min-width: 42px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    text-align: right;
  }
}
</style>
