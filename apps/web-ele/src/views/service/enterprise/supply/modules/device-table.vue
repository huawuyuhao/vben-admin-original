<script lang="ts" setup>
import type { SupplyDeviceItem } from '#/types/service/enterprise/supply';

import { $t } from '@vben/locales';

import {
  formatSupplyDateTime,
  getSupplyStatusI18nKey,
  getSupplyStatusTagType,
} from '../data';

defineOptions({ name: 'EnterpriseSupplyDeviceTable' });

defineProps<{
  /** 列表数据 */
  devices: SupplyDeviceItem[];
  /** 加载中 */
  loading?: boolean;
}>();
</script>

<template>
  <el-card class="supply-table" shadow="never">
    <el-table
      v-loading="loading"
      class="supply-table__inner"
      :data="devices"
      stripe
      :empty-text="$t('page.service.enterprise.supply.empty')"
    >
      <el-table-column
        :label="$t('page.service.enterprise.supply.fields.deviceId')"
        min-width="100"
        prop="deviceId"
      >
        <template #default="{ row }">
          {{ row.deviceId ?? $t('page.service.enterprise.supply.valueEmpty') }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.enterprise.supply.fields.deviceType')"
        min-width="120"
        prop="deviceType"
        show-overflow-tooltip
      />

      <el-table-column
        :label="$t('page.service.enterprise.supply.fields.deviceModel')"
        min-width="140"
        prop="deviceModel"
        show-overflow-tooltip
      />

      <el-table-column
        :label="$t('page.service.enterprise.supply.fields.gpuVendor')"
        min-width="120"
        prop="gpuVendor"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            row.gpuVendor?.trim() ||
            $t('page.service.enterprise.supply.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.enterprise.supply.fields.gpuModel')"
        min-width="120"
        prop="gpuModel"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            row.gpuModel?.trim() ||
            $t('page.service.enterprise.supply.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.service.enterprise.supply.fields.quantity')"
        min-width="80"
        prop="quantity"
      />

      <el-table-column
        align="center"
        :label="$t('page.service.enterprise.supply.fields.status')"
        min-width="110"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getSupplyStatusTagType(row.status)"
          >
            {{
              $t(
                `page.service.enterprise.supply.status.${getSupplyStatusI18nKey(row.status)}`,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.enterprise.supply.fields.submitTime')"
        min-width="160"
        prop="submitTime"
      >
        <template #default="{ row }">
          {{
            formatSupplyDateTime(row.submitTime || row.createTime) ||
            $t('page.service.enterprise.supply.valueEmpty')
          }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.supply-table {
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
