<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { getDeviceTypeListApi } from '#/api/admin/device';

import {
  DEVICE_ONLINE_OFFLINE,
  DEVICE_ONLINE_ONLINE,
  type DeviceOnlineFilter,
} from '../data';

defineOptions({ name: 'AdminDeviceFilterBar' });

const emit = defineEmits<{
  /** 重置筛选 */
  reset: [];
  /** 点击查询 */
  search: [];
}>();
/** 设备编号 */
const deviceCode = defineModel<string>('deviceCode', { default: '' });
/** 设备名称 */
const deviceName = defineModel<string>('deviceName', { default: '' });
/** 设备类型 */
const deviceType = defineModel<string>('deviceType', { default: '' });
/** 在线状态 */
const onlineStatus = defineModel<DeviceOnlineFilter>('onlineStatus', {
  default: '',
});

/** 设备类型选项加载中 */
const typeLoading = ref(false);
/** 设备类型选项 */
const deviceTypeOptions = ref<string[]>([]);

/**
 * 拉取设备类型下拉选项
 */
async function fetchDeviceTypes() {
  typeLoading.value = true;
  try {
    const list = await getDeviceTypeListApi();
    deviceTypeOptions.value = Array.isArray(list)
      ? list.map((item) => String(item).trim()).filter(Boolean)
      : [];
  } catch {
    deviceTypeOptions.value = [];
  } finally {
    typeLoading.value = false;
  }
}

onMounted(() => {
  void fetchDeviceTypes();
});
</script>

<template>
  <el-card class="device-filter" shadow="never">
    <el-form class="device-filter__form" @submit.prevent>
      <el-form-item
        class="device-filter__field"
        :label="$t('page.admin.device.filter.deviceCode')"
      >
        <el-input
          v-model="deviceCode"
          class="device-filter__input"
          clearable
          :placeholder="$t('page.admin.device.filter.deviceCodePlaceholder')"
        />
      </el-form-item>

      <el-form-item
        class="device-filter__field"
        :label="$t('page.admin.device.filter.deviceName')"
      >
        <el-input
          v-model="deviceName"
          class="device-filter__input"
          clearable
          :placeholder="$t('page.admin.device.filter.deviceNamePlaceholder')"
        />
      </el-form-item>

      <el-form-item
        class="device-filter__field"
        :label="$t('page.admin.device.filter.deviceType')"
      >
        <el-select
          v-model="deviceType"
          class="device-filter__select"
          clearable
          :loading="typeLoading"
          :placeholder="$t('page.admin.device.filter.deviceTypeAll')"
        >
          <el-option
            v-for="item in deviceTypeOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        class="device-filter__field"
        :label="$t('page.admin.device.filter.onlineStatus')"
      >
        <el-select
          v-model="onlineStatus"
          class="device-filter__select"
          clearable
          :placeholder="$t('page.admin.device.filter.onlineStatusAll')"
        >
          <el-option
            :label="$t('page.admin.device.online.online')"
            :value="String(DEVICE_ONLINE_ONLINE)"
          />
          <el-option
            :label="$t('page.admin.device.online.offline')"
            :value="String(DEVICE_ONLINE_OFFLINE)"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="device-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.admin.device.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.admin.device.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.device-filter {
  margin-bottom: 18px;

  &__form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;
    align-items: center;
  }

  &__field {
    margin-right: 0;
    margin-bottom: 8px;

    :deep(.el-form-item__label) {
      display: inline-flex;
      align-items: center;
      height: 32px;
      padding-right: 8px;
      line-height: 32px;
    }

    :deep(.el-form-item__content) {
      display: inline-flex;
      align-items: center;
    }
  }

  &__input {
    width: 160px;
  }

  &__select {
    width: 160px;
  }

  &__actions {
    margin-right: 0;
    margin-bottom: 8px;
    margin-left: auto;

    :deep(.el-form-item__content) {
      display: inline-flex;
      gap: 10px;
      align-items: center;
    }
  }
}

@media (max-width: 768px) {
  .device-filter {
    &__input,
    &__select {
      width: 100%;
    }

    &__field {
      width: 100%;
    }

    &__actions {
      width: 100%;
      margin-left: 0;

      :deep(.el-form-item__content) {
        display: flex;
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style>
