<script lang="ts" setup>
import type { SupplyDeviceItem } from '#/types/service/enterprise/supply';

import { onMounted, ref, watch } from 'vue';

import { Download, Plus, Refresh } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { downloadFileFromUrl } from '@vben/utils';
import { ElMessage } from 'element-plus';

import {
  exportSupplyDeviceApi,
  getSupplyDeviceListApi,
} from '#/api/service/enterprise/supply';

import {
  SUPPLY_PAGE_SIZE,
  normalizeSupplyPage,
  parseSupplyStatusFilter,
  resolveSupplyExportDownloadUrl,
  type SupplyStatusFilter,
} from './data';
import DevicePager from './modules/device-pager.vue';
import DeviceTable from './modules/device-table.vue';
import FilterBar from './modules/filter-bar.vue';
import FormDialog from './modules/form-dialog.vue';

/**
 * 门户服务 · 我的算力供给
 * 对接 GET/POST /supply/device、POST /supply/device/export
 */
defineOptions({ name: 'ServiceEnterpriseSupply' });

/** 受理状态筛选草稿 */
const statusFilter = ref<SupplyStatusFilter>('');
/** 已生效的受理状态（点击查询后应用） */
const appliedStatus = ref<SupplyStatusFilter>('');
/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(SUPPLY_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 导出中 */
const exporting = ref(false);
/** 悬停导出按钮时显示提示 */
const exportHintVisible = ref(false);
/** 当前页设备列表 */
const devices = ref<SupplyDeviceItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);
/** 新增表单弹窗引用 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();

/**
 * 拉取当前页设备清单
 */
async function fetchDevices() {
  loading.value = true;
  try {
    const data = await getSupplyDeviceListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: parseSupplyStatusFilter(appliedStatus.value),
    });
    const page = normalizeSupplyPage(data);
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
  appliedStatus.value = statusFilter.value;
  queryFromFirstPage();
}

/**
 * 重置筛选并查询
 */
function handleReset() {
  statusFilter.value = '';
  appliedStatus.value = '';
  queryFromFirstPage();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  void fetchDevices();
}

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
 * 按当前受理状态筛选导出清单（后端返回 fileUrl）
 */
async function handleExport() {
  exporting.value = true;
  try {
    const result = await exportSupplyDeviceApi({
      status: parseSupplyStatusFilter(appliedStatus.value),
    });
    const downloadUrl = resolveSupplyExportDownloadUrl(result?.fileUrl);
    if (!downloadUrl) {
      ElMessage.error($t('page.service.enterprise.supply.export.noUrl'));
      return;
    }
    await downloadFileFromUrl({
      source: downloadUrl,
      fileName: result?.fileName?.trim() || undefined,
    });
    ElMessage.success($t('page.service.enterprise.supply.export.success'));
  } catch {
    // 错误提示由接口层处理
  } finally {
    exporting.value = false;
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
              {{ $t('page.service.enterprise.supply.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.enterprise.supply.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.enterprise.supply.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
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
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.service.enterprise.supply.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              {{ $t('page.service.enterprise.supply.add') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:status="statusFilter"
          @search="handleSearch"
          @reset="handleReset"
        />

        <DeviceTable :devices="devices" :loading="loading" />

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
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';

.supply-page {
  &__export-tip {
    color: hsl(var(--muted-foreground));
    font-size: 13px;
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
