<script lang="ts" setup>
import type { RunningTaskItem } from '#/types/service/mydemand/runtime';

import { $t } from '@vben/locales';

import {
  canCloseRunningTask,
  displayRuntimeStatusName,
  formatRuntimeDuration,
  formatRuntimePercent,
  getRuntimeStatusTagType,
  resolveRunningTaskId,
} from '../data';

defineOptions({ name: 'MyDemandRuntimeTaskTable' });

defineProps<{
  /** 正在关闭的任务 ID */
  closingId?: null | string;
  /** 加载中 */
  loading?: boolean;
  /** 列表数据 */
  tasks: RunningTaskItem[];
}>();

const emit = defineEmits<{
  /** 关闭任务（Popconfirm 确认后） */
  close: [row: RunningTaskItem];
  /** 查看运行详情 */
  detail: [row: RunningTaskItem];
}>();

/**
 * 展示空值占位
 * @param value 原始值
 * @returns 展示文案
 */
function displayValue(value?: null | number | string): string {
  if (value == null) {
    return $t('page.service.mydemand.runtime.valueEmpty');
  }
  const text = String(value).trim();
  return text || $t('page.service.mydemand.runtime.valueEmpty');
}
</script>

<template>
  <el-card class="runtime-table" shadow="never">
    <el-table
      v-loading="loading"
      class="runtime-table__inner"
      :data="tasks"
      stripe
      :empty-text="$t('page.service.mydemand.runtime.empty')"
    >
      <el-table-column
        :label="$t('page.service.mydemand.runtime.fields.taskName')"
        min-width="180"
        prop="taskName"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ displayValue(row.taskName) }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.mydemand.runtime.fields.taskId')"
        min-width="120"
        prop="taskId"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ displayValue(row.taskId) }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.service.mydemand.runtime.fields.runStatus')"
        min-width="120"
      >
        <template #default="{ row }">
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
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.service.mydemand.runtime.fields.runTime')"
        min-width="120"
      >
        <template #default="{ row }">
          {{
            formatRuntimeDuration(row.runTime) ||
            $t('page.service.mydemand.runtime.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.service.mydemand.runtime.fields.completePercent')"
        min-width="160"
      >
        <template #default="{ row }">
          <div class="runtime-table__progress">
            <el-progress
              :percentage="
                Math.min(100, Math.max(0, Number(row.completePercent) || 0))
              "
              :show-text="false"
              :stroke-width="10"
            />
            <span class="runtime-table__progress-text">
              {{
                formatRuntimePercent(row.completePercent) ||
                $t('page.service.mydemand.runtime.valueEmpty')
              }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        fixed="right"
        :label="$t('page.service.mydemand.runtime.fields.actions')"
        min-width="160"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="emit('detail', row)">
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
            @confirm="emit('close', row)"
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
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.runtime-table {
  border-radius: 16px;

  &__inner {
    width: 100%;
  }

  &__progress {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;

    :deep(.el-progress) {
      flex: 1;
      max-width: 120px;
    }
  }

  &__progress-text {
    flex-shrink: 0;
    min-width: 42px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    text-align: right;
  }
}
</style>
