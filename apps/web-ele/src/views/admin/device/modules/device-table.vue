<script lang="ts" setup>
import type { DeviceItem } from '#/types/admin/device';

import { $t } from '@vben/locales';

import {
  displayDeviceValue,
  formatDeviceDateTime,
  getDeviceOnlineI18nKey,
  getDeviceOnlineTagType,
} from '../data';

defineOptions({ name: 'AdminDeviceTable' });

defineProps<{
  /** 列表数据 */
  devices: DeviceItem[];
  /** 加载中 */
  loading?: boolean;
}>();

const emit = defineEmits<{
  /** 删除 */
  delete: [row: DeviceItem];
  /** 查看详情 */
  detail: [row: DeviceItem];
  /** 编辑 */
  edit: [row: DeviceItem];
}>();
</script>

<template>
  <el-card class="device-table" shadow="never">
    <el-table
      v-loading="loading"
      class="device-table__inner"
      :data="devices"
      stripe
      :empty-text="$t('page.admin.device.empty')"
    >
      <el-table-column
        :label="$t('page.admin.device.fields.deviceName')"
        min-width="140"
        prop="deviceName"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayDeviceValue(
              row.deviceName,
              $t('page.admin.device.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.admin.device.fields.deviceCode')"
        min-width="130"
        prop="deviceCode"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayDeviceValue(
              row.deviceCode,
              $t('page.admin.device.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.admin.device.fields.deviceType')"
        min-width="110"
        prop="deviceType"
        show-overflow-tooltip
      />

      <el-table-column
        :label="$t('page.admin.device.fields.deviceModel')"
        min-width="130"
        prop="deviceModel"
        show-overflow-tooltip
      />

      <el-table-column
        :label="$t('page.admin.device.fields.location')"
        min-width="120"
        prop="location"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayDeviceValue(
              row.location,
              $t('page.admin.device.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.admin.device.fields.onlineStatus')"
        min-width="100"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getDeviceOnlineTagType(row.onlineStatus)"
          >
            {{
              $t(
                `page.admin.device.online.${getDeviceOnlineI18nKey(row.onlineStatus)}`,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.admin.device.fields.createTime')"
        min-width="160"
        prop="createTime"
      >
        <template #default="{ row }">
          {{
            formatDeviceDateTime(row.createTime) ||
            $t('page.admin.device.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        fixed="right"
        :label="$t('page.admin.device.fields.actions')"
        min-width="200"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="emit('detail', row)">
            {{ $t('page.admin.device.actions.detail') }}
          </el-button>
          <el-button link type="primary" @click="emit('edit', row)">
            {{ $t('page.admin.device.actions.edit') }}
          </el-button>
          <el-button link type="danger" @click="emit('delete', row)">
            {{ $t('page.admin.device.actions.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.device-table {
  &__inner {
    width: 100%;
  }

  :deep(.el-card__body) {
    padding: 0;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: hsl(var(--muted) / 35%);
  }
}
</style>
