<script lang="ts" setup>
import type { MyAppItem } from '#/types/service/mydemand/apps';

import { onMounted, ref, watch } from 'vue';

import { Plus, Refresh } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import {
  collectMyAppApi,
  deleteMyAppApi,
  getMyAppListApi,
  toggleMyAppApi,
} from '#/api/service/mydemand/apps';

import {
  APP_PAGE_SIZE,
  type AppCollectFilter,
  type AppStatusFilter,
  type AppTypeFilter,
  isAppCollected,
  isAppEnabled,
  normalizeAppPage,
  parseAppCollectFilter,
  parseAppStatusFilter,
  parseAppTypeFilter,
  resolveMyAppId,
} from './data';
import AppGrid from './modules/app-grid.vue';
import AppPager from './modules/app-pager.vue';
import FilterBar from './modules/filter-bar.vue';
import FormDialog from './modules/form-dialog.vue';
import MaterialDialog from './modules/material-dialog.vue';
import ScheduleDialog from './modules/schedule-dialog.vue';
import VersionDialog from './modules/version-dialog.vue';

/**
 * 门户服务 · 我的应用
 * 对接 /my-application 列表、增删改、启停、收藏、版本、定时任务、素材
 */
defineOptions({ name: 'ServiceMyDemandApps' });

/** 筛选草稿：应用名称 */
const filterAppName = ref('');
/** 筛选草稿：应用类型 */
const filterAppType = ref<AppTypeFilter>('');
/** 筛选草稿：应用状态 */
const filterAppStatus = ref<AppStatusFilter>('');
/** 筛选草稿：是否收藏 */
const filterIsCollect = ref<AppCollectFilter>('');

/** 已生效筛选 */
const appliedAppName = ref('');
const appliedAppType = ref<AppTypeFilter>('');
const appliedAppStatus = ref<AppStatusFilter>('');
const appliedIsCollect = ref<AppCollectFilter>('');

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(APP_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页应用列表 */
const apps = ref<MyAppItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);
/** 正在启停的应用 ID */
const togglingId = ref<null | number>(null);
/** 正在收藏操作的应用 ID */
const collectingId = ref<null | number>(null);

/** 新增 / 编辑表单弹窗 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();
/** 定时任务弹窗 */
const scheduleDialogRef = ref<InstanceType<typeof ScheduleDialog>>();
/** 版本维护弹窗 */
const versionDialogRef = ref<InstanceType<typeof VersionDialog>>();
/** 素材管理抽屉 */
const materialDialogRef = ref<InstanceType<typeof MaterialDialog>>();

/**
 * 拉取当前页应用列表
 */
async function fetchApps() {
  loading.value = true;
  try {
    const data = await getMyAppListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      appName: appliedAppName.value.trim() || undefined,
      appType: parseAppTypeFilter(appliedAppType.value),
      appStatus: parseAppStatusFilter(appliedAppStatus.value),
      isCollect: parseAppCollectFilter(appliedIsCollect.value),
    });
    const page = normalizeAppPage(data);
    apps.value = page.records;
    total.value = page.total;

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    apps.value = [];
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
  void fetchApps();
}

/**
 * 提交查询
 */
function handleSearch() {
  appliedAppName.value = filterAppName.value;
  appliedAppType.value = filterAppType.value;
  appliedAppStatus.value = filterAppStatus.value;
  appliedIsCollect.value = filterIsCollect.value;
  queryFromFirstPage();
}

/**
 * 重置筛选并查询
 */
function handleReset() {
  filterAppName.value = '';
  filterAppType.value = '';
  filterAppStatus.value = '';
  filterIsCollect.value = '';
  appliedAppName.value = '';
  appliedAppType.value = '';
  appliedAppStatus.value = '';
  appliedIsCollect.value = '';
  queryFromFirstPage();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  void fetchApps();
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
function handleEdit(row: MyAppItem) {
  formDialogRef.value?.openEdit(row);
}

/**
 * 删除应用（二次确认由表格 Popconfirm 触发）
 * @param row 列表行
 */
async function handleDelete(row: MyAppItem) {
  const id = resolveMyAppId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.apps.form.invalidId'));
    return;
  }

  try {
    await deleteMyAppApi(id);
    ElMessage.success($t('page.service.mydemand.apps.delete.success'));
    void fetchApps();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 应用启停
 * @param row 列表行
 */
async function handleToggle(row: MyAppItem) {
  const id = resolveMyAppId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.apps.form.invalidId'));
    return;
  }

  const enabled = isAppEnabled(row.appStatus);
  const action = enabled ? 'disable' : 'enable';
  const name = row.appName?.trim() || String(id);
  const successKey = enabled
    ? 'page.service.mydemand.apps.toggle.disableSuccess'
    : 'page.service.mydemand.apps.toggle.enableSuccess';

  togglingId.value = id;
  try {
    await toggleMyAppApi(id, action);
    ElMessage.success($t(successKey, [name]));
    void fetchApps();
  } catch {
    // 错误提示由接口层处理
  } finally {
    togglingId.value = null;
  }
}

/**
 * 收藏 / 取消收藏
 * @param row 列表行
 */
async function handleCollect(row: MyAppItem) {
  const id = resolveMyAppId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.apps.form.invalidId'));
    return;
  }

  const collected = isAppCollected(row.isCollect);
  const action = collected ? 'uncollect' : 'collect';
  const name = row.appName?.trim() || String(id);
  const successKey = collected
    ? 'page.service.mydemand.apps.collectAction.uncollectSuccess'
    : 'page.service.mydemand.apps.collectAction.collectSuccess';

  collectingId.value = id;
  try {
    await collectMyAppApi(id, action);
    ElMessage.success($t(successKey, [name]));
    void fetchApps();
  } catch {
    // 错误提示由接口层处理
  } finally {
    collectingId.value = null;
  }
}

/**
 * 打开版本维护
 * @param row 列表行
 */
function handleVersion(row: MyAppItem) {
  versionDialogRef.value?.open(row);
}

/**
 * 打开定时任务配置
 * @param row 列表行
 */
function handleSchedule(row: MyAppItem) {
  scheduleDialogRef.value?.open(row);
}

/**
 * 打开素材管理
 * @param row 列表行
 */
function handleMaterial(row: MyAppItem) {
  materialDialogRef.value?.open(row);
}

/**
 * 表单提交成功后刷新列表
 */
function handleFormSuccess() {
  void fetchApps();
}

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchApps();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchApps();
});

onMounted(() => {
  void fetchApps();
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
              {{ $t('page.service.mydemand.apps.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.mydemand.apps.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.mydemand.apps.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.service.mydemand.apps.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              {{ $t('page.service.mydemand.apps.add') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:app-name="filterAppName"
          v-model:app-type="filterAppType"
          v-model:app-status="filterAppStatus"
          v-model:is-collect="filterIsCollect"
          @search="handleSearch"
          @reset="handleReset"
        />

        <AppGrid
          :apps="apps"
          :collecting-id="collectingId"
          :loading="loading"
          :toggling-id="togglingId"
          @edit="handleEdit"
          @delete="handleDelete"
          @toggle="handleToggle"
          @collect="handleCollect"
          @version="handleVersion"
          @schedule="handleSchedule"
          @material="handleMaterial"
        />

        <AppPager
          v-if="apps.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />
    <ScheduleDialog ref="scheduleDialogRef" />
    <VersionDialog ref="versionDialogRef" />
    <MaterialDialog ref="materialDialogRef" />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';
</style>
