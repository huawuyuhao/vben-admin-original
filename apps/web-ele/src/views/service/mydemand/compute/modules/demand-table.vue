<script lang="ts" setup>
import type { ComputeDemandItem } from '#/types/service/mydemand/compute';

import { $t } from '@vben/locales';

import {
  canDeleteComputeDemand,
  canEditComputeDemand,
  canResubmitComputeDemand,
  formatComputeDateTime,
  getComputeStatusI18nKey,
  getComputeStatusTagType,
  getComputeTypeI18nKey,
  isComputeDemandDone,
} from '../data';

defineOptions({ name: 'MyDemandComputeTable' });

defineProps<{
  /** 列表数据 */
  demands: ComputeDemandItem[];
  /** 加载中 */
  loading?: boolean;
  /** 正在复制的需求 ID */
  copyingId?: null | number;
}>();

const emit = defineEmits<{
  /** 复制历史需求 */
  copy: [row: ComputeDemandItem];
  /** 删除（Popconfirm 确认后） */
  delete: [row: ComputeDemandItem];
  /** 查看详情 */
  detail: [row: ComputeDemandItem];
  /** 编辑 */
  edit: [row: ComputeDemandItem];
  /** 重新提交（审核不通过） */
  resubmit: [row: ComputeDemandItem];
}>();
</script>

<template>
  <el-card class="compute-table" shadow="never">
    <el-table
      v-loading="loading"
      class="compute-table__inner"
      :data="demands"
      stripe
      :empty-text="$t('page.service.mydemand.compute.empty')"
    >
      <el-table-column
        :label="$t('page.service.mydemand.compute.fields.demandNo')"
        min-width="160"
        prop="demandNo"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            row.demandNo?.trim() ||
            $t('page.service.mydemand.compute.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.mydemand.compute.fields.demandName')"
        min-width="160"
        prop="demandName"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            row.demandName?.trim() ||
            $t('page.service.mydemand.compute.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.service.mydemand.compute.fields.demandType')"
        min-width="110"
      >
        <template #default="{ row }">
          {{
            $t(
              `page.service.mydemand.compute.type.${getComputeTypeI18nKey(row.demandType)}`,
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.mydemand.compute.fields.resourceSpec')"
        min-width="140"
        prop="resourceSpec"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            row.resourceSpec?.trim() ||
            $t('page.service.mydemand.compute.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.service.mydemand.compute.fields.status')"
        min-width="120"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getComputeStatusTagType(row.status)"
          >
            {{
              $t(
                `page.service.mydemand.compute.status.${getComputeStatusI18nKey(row.status)}`,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.mydemand.compute.fields.submitTime')"
        min-width="160"
        prop="submitTime"
      >
        <template #default="{ row }">
          {{
            formatComputeDateTime(row.submitTime || row.createTime) ||
            $t('page.service.mydemand.compute.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        fixed="right"
        :label="$t('page.service.mydemand.compute.fields.actions')"
        width="320"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="emit('detail', row)">
            {{ $t('page.service.mydemand.compute.actions.detail') }}
          </el-button>

          <el-button
            v-if="canEditComputeDemand(row.status)"
            link
            type="primary"
            @click="emit('edit', row)"
          >
            {{ $t('page.service.mydemand.compute.actions.edit') }}
          </el-button>

          <el-button
            v-if="canResubmitComputeDemand(row.status)"
            link
            type="warning"
            @click="emit('resubmit', row)"
          >
            {{ $t('page.service.mydemand.compute.actions.resubmit') }}
          </el-button>

          <el-button
            link
            type="primary"
            :loading="copyingId === row.demandId"
            @click="emit('copy', row)"
          >
            {{ $t('page.service.mydemand.compute.actions.copy') }}
          </el-button>

          <el-button
            v-if="isComputeDemandDone(row.status)"
            link
            type="success"
            @click="emit('detail', row)"
          >
            {{ $t('page.service.mydemand.compute.actions.result') }}
          </el-button>

          <el-popconfirm
            v-if="canDeleteComputeDemand(row.status)"
            width="260"
            :cancel-button-text="
              $t('page.service.mydemand.compute.delete.cancelBtn')
            "
            :confirm-button-text="
              $t('page.service.mydemand.compute.delete.confirmBtn')
            "
            :title="
              $t('page.service.mydemand.compute.delete.confirm', [
                row.demandName?.trim() ||
                  row.demandNo?.trim() ||
                  String(row.demandId ?? '') ||
                  $t('page.service.mydemand.compute.valueEmpty'),
              ])
            "
            @confirm="emit('delete', row)"
          >
            <template #reference>
              <el-button link type="danger">
                {{ $t('page.service.mydemand.compute.actions.delete') }}
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.compute-table {
  &__inner {
    width: 100%;
  }

  :deep(.el-card__body) {
    padding: 0;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: hsl(var(--muted) / 0.35);
  }
}
</style>
