<script lang="ts" setup>
import type { DeviceItem } from '#/types/admin/device';

import { onMounted, ref, watch } from 'vue';

import { Plus, Refresh } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { ElMessage, ElMessageBox } from 'element-plus';

import { deleteDeviceApi, getDeviceListApi } from '#/api/admin/device';

import {
  DEVICE_PAGE_SIZE,
  normalizeDevicePage,
  parseDeviceOnlineFilter,
  type DeviceOnlineFilter,
} from './data';
import DetailDrawer from './modules/detail-drawer.vue';
import DevicePager from './modules/device-pager.vue';
import DeviceTable from './modules/device-table.vue';
import FilterBar from './modules/filter-bar.vue';
import FormDialog from './modules/form-dialog.vue';

/**
 * 管理 · 设备管理
 * 对接 GET/POST /device、GET/PUT/DELETE /device/{id}
 */
defineOptions({ name: 'AdminDevice' });

/** 筛选草稿：设备编号 */
const filterDeviceCode = ref('');
/** 筛选草稿：设备名称 */
const filterDeviceName = ref('');
/** 筛选草稿：设备类型 */
const filterDeviceType = ref('');
/** 筛选草稿：在线状态 */
const filterOnlineStatus = ref<DeviceOnlineFilter>('');

/** 已生效筛选 */
const appliedDeviceCode = ref('');
const appliedDeviceName = ref('');
const appliedDeviceType = ref('');
const appliedOnlineStatus = ref<DeviceOnlineFilter>('');

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(DEVICE_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页设备列表 */
const devices = ref<DeviceItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);

/** 新增 / 编辑表单弹窗 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();
/** 详情抽屉 */
const detailDrawerRef = ref<InstanceType<typeof DetailDrawer>>();

/**
 * 拉取当前页设备列表
 */
async function fetchDevices() {
  loading.value = true;
  try {
    const data = await getDeviceListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      deviceCode: appliedDeviceCode.value.trim() || undefined,
      deviceName: appliedDeviceName.value.trim() || undefined,
      deviceType: appliedDeviceType.value.trim() || undefined,
      onlineStatus: parseDeviceOnlineFilter(appliedOnlineStatus.value),
    });
    const page = normalizeDevicePage(data);
    devices.value = page.records;
    total.value = page.total;

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    devices.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 回到第一页并查询
 */
function queryFromFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchDevices();
}

/**
 * 提交查询
 */
function handleSearch() {
  appliedDeviceCode.value = filterDeviceCode.value;
  appliedDeviceName.value = filterDeviceName.value;
  appliedDeviceType.value = filterDeviceType.value;
  appliedOnlineStatus.value = filterOnlineStatus.value;
  queryFromFirstPage();
}

/**
 * 重置筛选并查询
 */
function handleReset() {
  filterDeviceCode.value = '';
  filterDeviceName.value = '';
  filterDeviceType.value = '';
  filterOnlineStatus.value = '';
  appliedDeviceCode.value = '';
  appliedDeviceName.value = '';
  appliedDeviceType.value = '';
  appliedOnlineStatus.value = '';
  queryFromFirstPage();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  void fetchDevices();
}

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
function handleEdit(row: DeviceItem) {
  void formDialogRef.value?.openEdit(row);
}

/**
 * 打开详情抽屉
 * @param row 列表行
 */
function handleDetail(row: DeviceItem) {
  void detailDrawerRef.value?.open(row);
}

/**
 * 删除设备（二次确认）
 * @param row 列表行
 */
async function handleDelete(row: DeviceItem) {
  const id = Number(row.deviceId);
  if (!Number.isFinite(id) || id <= 0) {
    ElMessage.warning($t('page.admin.device.form.invalidId'));
    return;
  }

  const name =
    row.deviceName?.trim() ||
    row.deviceCode?.trim() ||
    String(id);

  try {
    await ElMessageBox.confirm(
      $t('page.admin.device.delete.confirm', [name]),
      $t('page.admin.device.delete.title'),
      {
        type: 'warning',
        confirmButtonText: $t('page.admin.device.delete.confirmBtn'),
        cancelButtonText: $t('page.admin.device.delete.cancelBtn'),
      },
    );
  } catch {
    return;
  }

  try {
    await deleteDeviceApi(id);
    ElMessage.success($t('page.admin.device.delete.success'));
    void fetchDevices();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 表单提交成功后刷新列表
 */
function handleFormSuccess() {
  void fetchDevices();
}

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchDevices();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchDevices();
});

onMounted(() => {
  void fetchDevices();
});
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div class="mine-shell__inner">
        <header class="mine-shell__head">
          <div>
            <p class="mine-shell__eyebrow">
              {{ $t('page.admin.device.eyebrow') }}
            </p>
            <h2>{{ $t('page.admin.device.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.admin.device.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.admin.device.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              {{ $t('page.admin.device.add') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:device-code="filterDeviceCode"
          v-model:device-name="filterDeviceName"
          v-model:device-type="filterDeviceType"
          v-model:online-status="filterOnlineStatus"
          @search="handleSearch"
          @reset="handleReset"
        />

        <DeviceTable
          :devices="devices"
          :loading="loading"
          @detail="handleDetail"
          @edit="handleEdit"
          @delete="handleDelete"
        />

        <DevicePager
          v-if="devices.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />
    <DetailDrawer ref="detailDrawerRef" />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../scss/page-shell.scss';
</style>
