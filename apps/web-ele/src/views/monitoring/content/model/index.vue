<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  AdminModelServiceId,
  AdminModelServiceItem,
} from '#/types/monitoring/content/model';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { ChatDotRound, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  CARD_LIST_VXE_LAYOUTS,
  toVxeCardPageResult,
  useVbenVxeGrid,
} from '#/adapter/vxe-table';
import {
  deleteAdminModelServiceApi,
  getAdminModelServiceListApi,
} from '#/api/monitoring/content/model';
import { hasApiId } from '#/utils/api-id';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  ADMIN_MODEL_PAGE_SIZE,
  ADMIN_MODEL_PAGE_SIZE_OPTIONS,
  type AdminModelGridFormValues,
  buildAdminModelFilterParams,
  normalizeAdminModelPage,
  useAdminModelGridFormSchema,
} from './data';
import DetailDrawer from './modules/detail-drawer.vue';
import EvalDialog from './modules/eval-dialog.vue';
import FormDialog from './modules/form-dialog.vue';
import ModelGrid from './modules/model-grid.vue';

/**
 * 内容管理 · 模型服务管理
 * 查询栏 / 分页用 useVbenVxeGrid；列表区保持 Element Plus 卡片网格
 */
defineOptions({ name: 'MonitoringContentModel' });

/** 当前页卡片数据（与 Vxe pager 同步，不走表格 rows） */
const models = ref<AdminModelServiceItem[]>([]);
/** 列表加载中（骨架 / v-loading） */
const loading = ref(false);

/** 表单弹窗 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();
/** 详情抽屉 */
const detailVisible = ref(false);
const detailItem = ref<AdminModelServiceItem | null>(null);
/** 评价弹窗 */
const evalVisible = ref(false);
const evalModelId = ref<AdminModelServiceId | null>(null);
const evalModelName = ref<null | string>(null);

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid mine-vxe-grid--cards',
  formOptions: {
    collapsed: true,
    collapsedRows: 1,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useAdminModelGridFormSchema(),
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
      pageSize: ADMIN_MODEL_PAGE_SIZE,
      pageSizes: ADMIN_MODEL_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: AdminModelGridFormValues) => {
          loading.value = true;
          try {
            const filters = buildAdminModelFilterParams(formValues);
            const data = await getAdminModelServiceListApi({
              page: page.currentPage,
              pageSize: page.pageSize,
              ...filters,
            });
            const normalized = normalizeAdminModelPage(data);
            models.value = normalized.records;
            return toVxeCardPageResult(normalized);
          } catch {
            models.value = [];
            return toVxeCardPageResult({ total: 0 });
          } finally {
            loading.value = false;
          }
        },
      },
    },
    rowConfig: {
      keyField: 'modelId',
    },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<AdminModelServiceItem>,
});

/**
 * 打开新增弹窗
 */
function handleCreate() {
  formDialogRef.value?.openCreate();
}

/**
 * 打开全局评价管理（不锁定 modelId）
 */
function handleOpenEvalManage() {
  evalModelId.value = null;
  evalModelName.value = null;
  evalVisible.value = true;
}

/**
 * 打开卡片评价管理（锁定 modelId）
 * @param item 模型条目
 */
function handleOpenEval(item: AdminModelServiceItem) {
  evalModelId.value = hasApiId(item.modelId) ? item.modelId! : null;
  evalModelName.value = item.modelName?.trim() || null;
  evalVisible.value = true;
}

/**
 * 打开详情抽屉
 * @param item 模型条目
 */
function handleDetail(item: AdminModelServiceItem) {
  detailItem.value = item;
  detailVisible.value = true;
}

/**
 * 打开编辑弹窗
 * @param item 模型条目
 */
function handleEdit(item: AdminModelServiceItem) {
  formDialogRef.value?.openEdit(item);
}

/**
 * 删除模型（二次确认：卡片内 popconfirm 或页级 MessageBox）
 * @param item 模型条目
 */
async function handleRemove(item: AdminModelServiceItem) {
  if (!hasApiId(item.modelId)) {
    ElMessage.warning($t('page.monitoring.content.model.form.invalidId'));
    return;
  }
  const label = item.modelName?.trim() || String(item.modelId);
  try {
    await deleteAdminModelServiceApi(item.modelId!);
    ElMessage.success(
      $t('page.monitoring.content.model.deleteSuccess', [label]),
    );
    gridApi.query();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 表单保存成功后刷新列表
 */
function handleFormSuccess() {
  gridApi.query();
}
</script>

<template>
  <PageListShell
    :desc="$t('page.monitoring.content.model.desc')"
    :eyebrow="$t('page.monitoring.content.model.eyebrow')"
    :title="$t('page.monitoring.content.model.title')"
  >
    <template #actions>
      <el-button
        class="mine-shell__action-btn"
        :icon="ChatDotRound"
        @click="handleOpenEvalManage"
      >
        {{ $t('page.monitoring.content.model.eval.manage') }}
      </el-button>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('page.monitoring.content.model.add') }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>
      <template #top>
        <ModelGrid
          class="admin-model-list-cards"
          :loading="loading"
          :models="models"
          @detail="handleDetail"
          @edit="handleEdit"
          @remove="handleRemove"
          @evaluate="handleOpenEval"
        />
      </template>
    </Grid>

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />

    <DetailDrawer v-model:visible="detailVisible" :item="detailItem" />

    <EvalDialog
      v-model:visible="evalVisible"
      :model-id="evalModelId"
      :model-name="evalModelName"
    />
  </PageListShell>
</template>

<style lang="scss" scoped>
.admin-model-list-cards {
  width: 100%;
  text-align: left;
}
</style>
