<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  AdminModelEvalId,
  AdminModelEvalItem,
  AdminModelServiceId,
} from '#/types/monitoring/content/model';

import { computed, nextTick, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  auditAdminModelEvalApi,
  blockAdminModelEvalApi,
  deleteAdminModelEvalApi,
  getAdminModelEvalListApi,
} from '#/api/monitoring/content/model';
import { hasApiId } from '#/utils/api-id';

import {
  ADMIN_MODEL_AUDIT_PASSED,
  ADMIN_MODEL_AUDIT_REJECTED,
  ADMIN_MODEL_EVAL_PAGE_SIZE,
  ADMIN_MODEL_EVAL_PAGE_SIZE_OPTIONS,
  type AdminModelEvalGridFormValues,
  buildAdminModelEvalFilterParams,
  canAuditAdminModelEval,
  normalizeAdminModelEvalPage,
  resolveAdminModelEvalAuditLabelKey,
  resolveAdminModelEvalAuditTagType,
  useAdminModelEvalColumns,
  useAdminModelEvalFormSchema,
} from '../data';

defineOptions({ name: 'AdminModelEvalDialog' });

const props = defineProps<{
  /** 预填 / 锁定的模型 ID（从行操作进入时传入） */
  modelId?: AdminModelServiceId | null;
  /** 预填模型名称（仅展示标题） */
  modelName?: null | string;
}>();

/** 弹窗可见 */
const visible = defineModel<boolean>('visible', { default: false });

/** 操作中的评价 ID */
const actingId = ref<AdminModelEvalId | ''>('');

/** 是否锁定模型 ID（从行进入） */
const modelLocked = computed(() => hasApiId(props.modelId));

/** 弹窗标题 */
const dialogTitle = computed(() => {
  const name = props.modelName?.trim();
  if (name) {
    return $t('page.monitoring.content.model.eval.titleForModel', [name]);
  }
  return $t('page.monitoring.content.model.eval.title');
});

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  formOptions: {
    collapsed: false,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useAdminModelEvalFormSchema(),
    showCollapseButton: false,
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useAdminModelEvalColumns({ showModelId: true }),
    height: 'auto',
    keepSource: true,
    maxHeight: 420,
    pagerConfig: {
      pageSize: ADMIN_MODEL_EVAL_PAGE_SIZE,
      pageSizes: ADMIN_MODEL_EVAL_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues?: AdminModelEvalGridFormValues) => {
          const filters = buildAdminModelEvalFilterParams(
            formValues,
            modelLocked.value ? props.modelId : null,
          );
          const data = await getAdminModelEvalListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...filters,
          });
          return toVxePageResult(normalizeAdminModelEvalPage(data));
        },
      },
    },
    rowConfig: {
      keyField: 'evalId',
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<AdminModelEvalItem>,
});

/**
 * 评价审核状态文案
 * @param status 状态码
 */
function auditLabel(status?: null | number) {
  const key = resolveAdminModelEvalAuditLabelKey(status);
  return $t(`page.monitoring.content.model.eval.status.${key}`);
}

/**
 * 打开弹窗时初始化筛选并加载
 */
async function initOnOpen() {
  await nextTick();
  const locked = modelLocked.value;
  const modelIdText = locked ? String(props.modelId ?? '') : '';

  gridApi.formApi.updateSchema(
    useAdminModelEvalFormSchema({ modelIdDisabled: locked }).map((item) => ({
      ...item,
      ...(item.fieldName === 'modelId' ? { defaultValue: modelIdText } : {}),
    })),
  );
  gridApi.setGridOptions({
    columns: useAdminModelEvalColumns({ showModelId: !locked }),
  });
  await gridApi.formApi.setValues({
    modelId: modelIdText,
    auditStatus: undefined,
  });
  await gridApi.reload();
}

watch(visible, (val) => {
  if (val) {
    void initOnOpen();
  }
});

/**
 * 审核通过
 * @param row 行数据
 */
async function handlePass(row: AdminModelEvalItem) {
  if (!hasApiId(row.evalId) || !canAuditAdminModelEval(row.auditStatus)) {
    return;
  }
  actingId.value = row.evalId!;
  try {
    await auditAdminModelEvalApi(row.evalId!, {
      auditStatus: ADMIN_MODEL_AUDIT_PASSED,
    });
    ElMessage.success($t('page.monitoring.content.model.eval.passSuccess'));
    await gridApi.query();
  } catch {
    // 错误提示由接口层处理
  } finally {
    actingId.value = '';
  }
}

/**
 * 审核驳回
 * @param row 行数据
 */
async function handleReject(row: AdminModelEvalItem) {
  if (!hasApiId(row.evalId) || !canAuditAdminModelEval(row.auditStatus)) {
    return;
  }
  actingId.value = row.evalId!;
  try {
    await auditAdminModelEvalApi(row.evalId!, {
      auditStatus: ADMIN_MODEL_AUDIT_REJECTED,
    });
    ElMessage.success($t('page.monitoring.content.model.eval.rejectSuccess'));
    await gridApi.query();
  } catch {
    // 错误提示由接口层处理
  } finally {
    actingId.value = '';
  }
}

/**
 * 屏蔽评价
 * @param row 行数据
 */
async function handleBlock(row: AdminModelEvalItem) {
  if (!hasApiId(row.evalId)) {
    return;
  }
  actingId.value = row.evalId!;
  try {
    await blockAdminModelEvalApi(row.evalId!);
    ElMessage.success($t('page.monitoring.content.model.eval.blockSuccess'));
    await gridApi.query();
  } catch {
    // 错误提示由接口层处理
  } finally {
    actingId.value = '';
  }
}

/**
 * 删除评价
 * @param row 行数据
 */
async function handleDelete(row: AdminModelEvalItem) {
  if (!hasApiId(row.evalId)) {
    return;
  }
  actingId.value = row.evalId!;
  try {
    await deleteAdminModelEvalApi(row.evalId!);
    ElMessage.success($t('page.monitoring.content.model.eval.deleteSuccess'));
    await gridApi.query();
  } catch {
    // 错误提示由接口层处理
  } finally {
    actingId.value = '';
  }
}

/**
 * 比较操作中 ID（兼容 number | string）
 * @param current 当前操作 ID
 * @param target 行 ID
 */
function isActing(
  current: AdminModelEvalId | '',
  target?: AdminModelEvalId,
): boolean {
  if (isEmpty(current) || !hasApiId(target)) {
    return false;
  }
  return String(current) === String(target);
}
</script>

<template>
  <el-dialog
    v-model="visible"
    class="model-eval-dialog"
    destroy-on-close
    :title="dialogTitle"
    width="1000px"
    append-to-body
  >
    <p v-if="modelLocked" class="model-eval-dialog__hint">
      {{ $t('page.monitoring.content.model.eval.lockedModelHint') }}
    </p>

    <Grid>
      <template #table-title></template>

      <template #score="{ row }">
        <el-rate
          :model-value="Number(row.score) || 0"
          disabled
          show-score
          text-color="var(--el-color-warning)"
        />
      </template>

      <template #auditStatus="{ row }">
        <el-tag
          :type="resolveAdminModelEvalAuditTagType(row.auditStatus)"
          size="small"
          effect="plain"
          round
        >
          {{ auditLabel(row.auditStatus) }}
        </el-tag>
      </template>

      <template #action="{ row }">
        <el-popconfirm
          v-if="canAuditAdminModelEval(row.auditStatus)"
          :title="$t('page.monitoring.content.model.eval.passConfirm')"
          :disabled="isActing(actingId, row.evalId)"
          @confirm="handlePass(row)"
        >
          <template #reference>
            <el-button
              link
              type="success"
              size="small"
              :loading="isActing(actingId, row.evalId)"
            >
              {{ $t('page.monitoring.content.model.eval.pass') }}
            </el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm
          v-if="canAuditAdminModelEval(row.auditStatus)"
          :title="$t('page.monitoring.content.model.eval.rejectConfirm')"
          :disabled="isActing(actingId, row.evalId)"
          @confirm="handleReject(row)"
        >
          <template #reference>
            <el-button
              link
              type="warning"
              size="small"
              :loading="isActing(actingId, row.evalId)"
            >
              {{ $t('page.monitoring.content.model.eval.reject') }}
            </el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm
          :title="$t('page.monitoring.content.model.eval.blockConfirm')"
          :disabled="isActing(actingId, row.evalId)"
          @confirm="handleBlock(row)"
        >
          <template #reference>
            <el-button
              link
              type="warning"
              size="small"
              :loading="isActing(actingId, row.evalId)"
            >
              {{ $t('page.monitoring.content.model.eval.block') }}
            </el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm
          :title="$t('page.monitoring.content.model.eval.deleteConfirm')"
          :disabled="isActing(actingId, row.evalId)"
          @confirm="handleDelete(row)"
        >
          <template #reference>
            <el-button
              link
              type="danger"
              size="small"
              :loading="isActing(actingId, row.evalId)"
            >
              {{ $t('page.monitoring.content.model.eval.delete') }}
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </Grid>
  </el-dialog>
</template>

<style lang="scss" scoped>
.model-eval-dialog {
  &__hint {
    margin: 0 0 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
