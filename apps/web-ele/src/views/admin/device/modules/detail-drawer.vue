<script lang="ts" setup>
import type { DeviceItem } from '#/types/admin/device';

import { ref } from 'vue';

import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import { getDeviceDetailApi } from '#/api/admin/device';

import {
  displayDeviceValue,
  formatDeviceDate,
  formatDeviceDateTime,
  getDeviceOnlineI18nKey,
  getDeviceOnlineTagType,
} from '../data';

defineOptions({ name: 'AdminDeviceDetailDrawer' });

/** 抽屉可见 */
const visible = ref(false);
/** 加载中 */
const loading = ref(false);
/** 详情数据 */
const detail = ref<DeviceItem | null>(null);

/**
 * 打开详情抽屉并拉取详情
 * @param row 列表行（兜底展示）
 */
async function open(row: DeviceItem) {
  const id = Number(row.deviceId);
  if (!Number.isFinite(id) || id <= 0) {
    ElMessage.warning($t('page.admin.device.form.invalidId'));
    return;
  }

  detail.value = row;
  visible.value = true;
  loading.value = true;
  try {
    const data = await getDeviceDetailApi(id);
    if (data) {
      detail.value = data;
    }
  } catch {
    // 保留列表行兜底
  } finally {
    loading.value = false;
  }
}

/**
 * 关闭抽屉
 */
function handleClose() {
  visible.value = false;
  detail.value = null;
}

/**
 * 展示字段值
 * @param value 原始值
 */
function display(value?: null | number | string) {
  return displayDeviceValue(value, $t('page.admin.device.valueEmpty'));
}

defineExpose({ open });
</script>

<template>
  <el-drawer
    v-model="visible"
    class="device-detail"
    destroy-on-close
    size="480px"
    :title="$t('page.admin.device.detail.title')"
    @close="handleClose"
  >
    <div v-loading="loading" class="device-detail__body">
      <el-descriptions
        v-if="detail"
        border
        :column="1"
        size="small"
      >
        <el-descriptions-item
          :label="$t('page.admin.device.fields.deviceName')"
        >
          {{ display(detail.deviceName) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.deviceCode')"
        >
          {{ display(detail.deviceCode) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.deviceType')"
        >
          {{ display(detail.deviceType) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.deviceModel')"
        >
          {{ display(detail.deviceModel) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.onlineStatus')"
        >
          <el-tag
            effect="light"
            round
            size="small"
            :type="getDeviceOnlineTagType(detail.onlineStatus)"
          >
            {{
              $t(
                `page.admin.device.online.${getDeviceOnlineI18nKey(detail.onlineStatus)}`,
              )
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.gpuVendor')"
        >
          {{ display(detail.gpuVendor) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.gpuModel')"
        >
          {{ display(detail.gpuModel) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.cpuModel')"
        >
          {{ display(detail.cpuModel) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.cpuCores')"
        >
          {{ display(detail.cpuCores) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.memorySize')"
        >
          {{
            detail.memorySize == null
              ? $t('page.admin.device.valueEmpty')
              : `${detail.memorySize} GB`
          }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.storageSize')"
        >
          {{
            detail.storageSize == null
              ? $t('page.admin.device.valueEmpty')
              : `${detail.storageSize} GB`
          }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.storageType')"
        >
          {{ display(detail.storageType) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.location')"
        >
          {{ display(detail.location) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.rackNumber')"
        >
          {{ display(detail.rackNumber) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.position')"
        >
          {{ display(detail.position) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.purchaseDate')"
        >
          {{
            formatDeviceDate(detail.purchaseDate) ||
            $t('page.admin.device.valueEmpty')
          }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.warrantyExpiry')"
        >
          {{
            formatDeviceDate(detail.warrantyExpiry) ||
            $t('page.admin.device.valueEmpty')
          }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('page.admin.device.fields.remark')">
          {{ display(detail.remark) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.createTime')"
        >
          {{
            formatDeviceDateTime(detail.createTime) ||
            $t('page.admin.device.valueEmpty')
          }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.admin.device.fields.updateTime')"
        >
          {{
            formatDeviceDateTime(detail.updateTime) ||
            $t('page.admin.device.valueEmpty')
          }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
.device-detail {
  &__body {
    min-height: 160px;
  }
}
</style>
