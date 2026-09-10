<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MyAppItem } from '#/types/service/mydemand/apps';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  CARD_LIST_VXE_LAYOUTS,
  toVxeCardPageResult,
  useVbenVxeGrid,
} from '#/adapter/vxe-table';
import {
  collectMyAppApi,
  deleteMyAppApi,
  getMyAppListApi,
  toggleMyAppApi,
} from '#/api/service/mydemand/apps';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  APP_PAGE_SIZE,
  APP_PAGE_SIZE_OPTIONS,
  type AppGridFormValues,
  buildAppFilterParams,
  isAppCollected,
  isAppEnabled,
  normalizeAppPage,
  resolveMyAppId,
  useAppGridFormSchema,
} from './data';
import AppGrid from './modules/app-grid.vue';
import FormDialog from './modules/form-dialog.vue';
import MaterialDialog from './modules/material-dialog.vue';
import ScheduleDialog from './modules/schedule-dialog.vue';
import VersionDialog from './modules/version-dialog.vue';

/**
 * 门户服务 · 我的应用
 * 查询栏 / 分页用 useVbenVxeGrid；列表区保持 Element Plus 卡片网格
 */
defineOptions({ name: 'ServiceMyDemandApps' });

/** 当前页卡片数据（与 Vxe pager 同步，不走表格 rows） */
const apps = ref<MyAppItem[]>([]);
/** 列表加载中（骨架 / v-loading） */
const loading = ref(false);
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

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid mine-vxe-grid--cards',
  formOptions: {
    collapsed: true,
    collapsedRows: 1,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useAppGridFormSchema(),
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: [],
    height: 'auto',
    keepSource: true,
    layouts: [...CARD_LIST_VXE_LAYOUTS],
    minHeight: 0,
    pagerConfig: {
      pageSize: APP_PAGE_SIZE,
      pageSizes: APP_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: AppGridFormValues) => {
          loading.value = true;
          try {
            const filters = buildAppFilterParams(formValues);
            const data = await getMyAppListApi({
              page: page.currentPage,
              pageSize: page.pageSize,
              ...filters,
            });
            const normalized = normalizeAppPage(data);
            apps.value = normalized.records;
            return toVxeCardPageResult(normalized);
          } catch {
            apps.value = [];
            return toVxeCardPageResult({ total: 0 });
          } finally {
            loading.value = false;
          }
        },
      },
    },
    rowConfig: {
      keyField: 'appId',
    },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<MyAppItem>,
});

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
 * 删除应用（二次确认由 Popconfirm 触发）
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
    gridApi.query();
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
    gridApi.query();
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
    gridApi.query();
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
  gridApi.query();
}
</script>

<template>
  <PageListShell
    :desc="$t('page.service.mydemand.apps.desc')"
    :eyebrow="$t('page.service.mydemand.apps.eyebrow')"
    :title="$t('page.service.mydemand.apps.title')"
  >
    <template #actions>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('page.service.mydemand.apps.add') }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>
      <template #top>
        <AppGrid
          class="apps-list-cards"
          :loading="loading"
          :apps="apps"
          :toggling-id="togglingId"
          :collecting-id="collectingId"
          @edit="handleEdit"
          @delete="handleDelete"
          @toggle="handleToggle"
          @collect="handleCollect"
          @version="handleVersion"
          @schedule="handleSchedule"
          @material="handleMaterial"
        />
      </template>
    </Grid>

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />
    <ScheduleDialog ref="scheduleDialogRef" />
    <VersionDialog ref="versionDialogRef" />
    <MaterialDialog ref="materialDialogRef" />
  </PageListShell>
</template>

<style lang="scss" scoped>
.apps-list-cards {
  width: 100%;
  text-align: left;
}
</style>
