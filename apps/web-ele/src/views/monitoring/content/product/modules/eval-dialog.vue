<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  AdminProductEvalId,
  AdminProductEvalItem,
} from '#/types/monitoring/content/product';

import { computed, nextTick, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  blockAdminProductEvalApi,
  deleteAdminProductEvalApi,
  getAdminProductEvalListApi,
} from '#/api/monitoring/content/product';
import { hasApiId } from '#/utils/api-id';

import {
  ADMIN_PRODUCT_EVAL_PAGE_SIZE,
  ADMIN_PRODUCT_EVAL_PAGE_SIZE_OPTIONS,
  type AdminProductEvalGridFormValues,
  buildAdminProductEvalFilterParams,
  canBlockAdminProductEval,
  normalizeAdminProductEvalPage,
  resolveAdminProductEvalStatusLabelKey,
  resolveAdminProductEvalStatusTagType,
  useAdminProductEvalColumns,
  useAdminProductEvalFormSchema,
} from '../data';

defineOptions({ name: 'AdminProductEvalDialog' });

const props = defineProps<{
  /** 预填 / 锁定的产品 ID（从卡片进入时传入） */
  productId?: AdminProductEvalId | null;
  /** 预填产品名称（仅展示标题） */
  productName?: null | string;
}>();

/** 弹窗可见 */
const visible = defineModel<boolean>('visible', { default: false });

/** 操作中的评价 ID */
const actingId = ref<AdminProductEvalId | ''>('');

/** 是否锁定产品 ID（从卡片进入） */
const productLocked = computed(() => hasApiId(props.productId));

/** 弹窗标题 */
const dialogTitle = computed(() => {
  const name = props.productName?.trim();
  if (name) {
    return $t('page.monitoring.content.product.eval.titleForProduct', [name]);
  }
  return $t('page.monitoring.content.product.eval.title');
});

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  formOptions: {
    collapsed: false,
    resetButtonOptions: {
      content: $t('common.reset'),
    },
    schema: useAdminProductEvalFormSchema(),
    showCollapseButton: false,
    submitButtonOptions: {
      content: $t('common.query'),
    },
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useAdminProductEvalColumns({ showProductId: true }),
    height: 'auto',
    keepSource: true,
    maxHeight: 420,
    pagerConfig: {
      pageSize: ADMIN_PRODUCT_EVAL_PAGE_SIZE,
      pageSizes: ADMIN_PRODUCT_EVAL_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async (
          { page },
          formValues?: AdminProductEvalGridFormValues,
        ) => {
          const filters = buildAdminProductEvalFilterParams(
            formValues,
            productLocked.value ? props.productId : null,
          );
          const data = await getAdminProductEvalListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...filters,
          });
          return toVxePageResult(normalizeAdminProductEvalPage(data));
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
  } as VxeTableGridOptions<AdminProductEvalItem>,
});

/**
 * 评价状态文案
 * @param status 状态码
 */
function statusLabel(status?: null | number) {
  const key = resolveAdminProductEvalStatusLabelKey(status);
  return $t(`page.monitoring.content.product.eval.status.${key}`);
}

/**
 * 打开弹窗时初始化筛选并加载
 */
async function initOnOpen() {
  await nextTick();
  const locked = productLocked.value;
  const productIdText = locked ? String(props.productId ?? '') : '';

  gridApi.formApi.updateSchema(
    useAdminProductEvalFormSchema({ productIdDisabled: locked }).map(
      (item) => ({
        ...item,
        ...(item.fieldName === 'productId'
          ? { defaultValue: productIdText }
          : {}),
      }),
    ),
  );
  gridApi.setGridOptions({
    columns: useAdminProductEvalColumns({ showProductId: !locked }),
  });
  await gridApi.formApi.setValues({
    productId: productIdText,
    status: undefined,
  });
  await gridApi.reload();
}

watch(visible, (val) => {
  if (val) {
    void initOnOpen();
  }
});

/**
 * 比较操作中 ID（兼容 number | string）
 * @param current 当前操作 ID
 * @param target 行 ID
 */
function isActing(
  current: AdminProductEvalId | '',
  target?: AdminProductEvalId,
): boolean {
  if (isEmpty(current) || !hasApiId(target)) {
    return false;
  }
  return String(current) === String(target);
}

/**
 * 屏蔽评价
 * @param row 行数据
 */
async function handleBlock(row: AdminProductEvalItem) {
  if (!canBlockAdminProductEval(row.status) || !hasApiId(row.evalId)) {
    return;
  }
  actingId.value = row.evalId;
  try {
    await blockAdminProductEvalApi(row.evalId);
    ElMessage.success($t('page.monitoring.content.product.eval.blockSuccess'));
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
async function handleDelete(row: AdminProductEvalItem) {
  if (!hasApiId(row.evalId)) {
    return;
  }
  actingId.value = row.evalId;
  try {
    await deleteAdminProductEvalApi(row.evalId);
    ElMessage.success($t('page.monitoring.content.product.eval.deleteSuccess'));
    await gridApi.query();
  } catch {
    // 错误提示由接口层处理
  } finally {
    actingId.value = '';
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    class="product-eval-dialog"
    destroy-on-close
    :title="dialogTitle"
    width="960px"
    append-to-body
  >
    <p v-if="productLocked" class="product-eval-dialog__hint">
      {{ $t('page.monitoring.content.product.eval.lockedProductHint') }}
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

      <template #status="{ row }">
        <el-tag
          :type="resolveAdminProductEvalStatusTagType(row.status)"
          size="small"
          effect="plain"
          round
        >
          {{ statusLabel(row.status) }}
        </el-tag>
      </template>

      <template #action="{ row }">
        <el-popconfirm
          v-if="canBlockAdminProductEval(row.status)"
          :title="$t('page.monitoring.content.product.eval.blockConfirm')"
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
              {{ $t('page.monitoring.content.product.eval.block') }}
            </el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm
          :title="$t('page.monitoring.content.product.eval.deleteConfirm')"
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
              {{ $t('page.monitoring.content.product.eval.delete') }}
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </Grid>
  </el-dialog>
</template>

<style lang="scss" scoped>
.product-eval-dialog {
  &__hint {
    margin: 0 0 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
