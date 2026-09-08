<script lang="ts" setup>
import type {
  AdminProductEvalId,
  AdminProductEvalItem,
  AdminProductEvalStatus,
} from '#/types/monitoring/content/product';

import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { Refresh, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  blockAdminProductEvalApi,
  deleteAdminProductEvalApi,
  getAdminProductEvalListApi,
} from '#/api/monitoring/content/product';

import {
  ADMIN_PRODUCT_EVAL_PAGE_SIZE,
  ADMIN_PRODUCT_EVAL_PAGE_SIZE_OPTIONS,
  ADMIN_PRODUCT_EVAL_STATUS_FILTER_OPTIONS,
  canBlockAdminProductEval,
  formatProductDateTime,
  resolveAdminProductEvalStatusLabelKey,
  resolveAdminProductEvalStatusTagType,
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

/** 加载中 */
const loading = ref(false);
/** 同步服务端页码时跳过 watch */
const syncingFromServer = ref(false);
/** 操作中的评价 ID */
const actingId = ref<AdminProductEvalId | ''>('');
/** 列表 */
const records = ref<AdminProductEvalItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 当前页 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(ADMIN_PRODUCT_EVAL_PAGE_SIZE);

/** 筛选：产品 ID（可编辑，除非从卡片锁定） */
const filterProductId = ref('');
/** 筛选：状态 */
const filterStatus = ref<'' | AdminProductEvalStatus>('');
/** 已生效筛选 */
const appliedProductId = ref('');
const appliedStatus = ref<'' | AdminProductEvalStatus>('');

/** 是否锁定产品 ID（从卡片进入） */
const productLocked = computed(() => !isEmpty(props.productId));

/** 弹窗标题 */
const dialogTitle = computed(() => {
  const name = props.productName?.trim();
  if (name) {
    return $t('page.monitoring.content.product.eval.titleForProduct', [name]);
  }
  return $t('page.monitoring.content.product.eval.title');
});

/**
 * 格式化展示 ID
 * @param value ID
 */
function formatId(value?: AdminProductEvalId | null): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}

/**
 * 格式化时间
 * @param value 时间字符串
 */
function formatTime(value?: string): string {
  return formatProductDateTime(value) || '—';
}

/**
 * 评价状态文案
 * @param status 状态码
 */
function statusLabel(status?: null | number) {
  const key = resolveAdminProductEvalStatusLabelKey(status);
  return $t(`page.monitoring.content.product.eval.status.${key}`);
}

/**
 * 拉取评价列表
 */
async function fetchList() {
  loading.value = true;
  try {
    const productIdText = appliedProductId.value.trim();
    const data = await getAdminProductEvalListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      productId: productIdText || undefined,
      status: appliedStatus.value === '' ? undefined : appliedStatus.value,
    });
    records.value = Array.isArray(data.records) ? data.records : [];
    total.value = Math.max(0, Number(data.total) || 0);
    const serverCurrent = Math.max(1, Number(data.current) || 1);
    if (serverCurrent !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = serverCurrent;
      syncingFromServer.value = false;
    }
  } catch {
    records.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 重置筛选草稿并应用
 */
function resetFilters() {
  filterProductId.value = productLocked.value
    ? String(props.productId ?? '')
    : '';
  filterStatus.value = '';
  appliedProductId.value = filterProductId.value;
  appliedStatus.value = '';
  currentPage.value = 1;
  void fetchList();
}

/**
 * 应用筛选并查第一页
 */
function handleSearch() {
  appliedProductId.value = productLocked.value
    ? String(props.productId ?? '')
    : filterProductId.value.trim();
  appliedStatus.value = filterStatus.value;
  currentPage.value = 1;
  void fetchList();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  void fetchList();
}

/**
 * 打开弹窗时初始化筛选并加载
 */
function initOnOpen() {
  filterProductId.value = productLocked.value
    ? String(props.productId ?? '')
    : '';
  filterStatus.value = '';
  appliedProductId.value = filterProductId.value;
  appliedStatus.value = '';
  currentPage.value = 1;
  pageSize.value = ADMIN_PRODUCT_EVAL_PAGE_SIZE;
  void fetchList();
}

watch(visible, (val) => {
  if (val) {
    initOnOpen();
  }
});

watch(pageSize, () => {
  if (!visible.value || syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchList();
});

watch(currentPage, () => {
  if (!visible.value || syncingFromServer.value) {
    return;
  }
  void fetchList();
});

/**
 * 屏蔽评价
 * @param row 行数据
 */
async function handleBlock(row: AdminProductEvalItem) {
  if (!canBlockAdminProductEval(row.status)) {
    return;
  }
  actingId.value = row.evalId;
  try {
    await blockAdminProductEvalApi(row.evalId);
    ElMessage.success($t('page.monitoring.content.product.eval.blockSuccess'));
    await fetchList();
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
  actingId.value = row.evalId;
  try {
    await deleteAdminProductEvalApi(row.evalId);
    ElMessage.success($t('page.monitoring.content.product.eval.deleteSuccess'));
    if (records.value.length <= 1 && currentPage.value > 1) {
      currentPage.value -= 1;
      return;
    }
    await fetchList();
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
    <div class="product-eval-dialog__toolbar">
      <el-form inline class="product-eval-dialog__filters" @submit.prevent>
        <el-form-item
          :label="$t('page.monitoring.content.product.eval.productIdLabel')"
        >
          <el-input
            v-model="filterProductId"
            clearable
            :disabled="productLocked"
            :placeholder="
              $t('page.monitoring.content.product.eval.productIdPlaceholder')
            "
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item
          :label="$t('page.monitoring.content.product.eval.statusLabel')"
        >
          <el-select
            v-model="filterStatus"
            style="width: 140px"
            :placeholder="$t('page.monitoring.content.product.eval.status.all')"
          >
            <el-option
              v-for="opt in ADMIN_PRODUCT_EVAL_STATUS_FILTER_OPTIONS"
              :key="String(opt.value)"
              :label="
                $t(`page.monitoring.content.product.eval.status.${opt.labelKey}`)
              "
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">
            <el-icon><Search /></el-icon>
            {{ $t('page.monitoring.content.product.eval.search') }}
          </el-button>
          <el-button :disabled="loading" @click="resetFilters">
            {{ $t('page.monitoring.content.product.eval.reset') }}
          </el-button>
          <el-button :loading="loading" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            {{ $t('page.monitoring.content.product.eval.refresh') }}
          </el-button>
        </el-form-item>
      </el-form>
      <p v-if="productLocked" class="product-eval-dialog__hint">
        {{ $t('page.monitoring.content.product.eval.lockedProductHint') }}
      </p>
    </div>

    <el-table
      v-loading="loading"
      class="product-eval-dialog__table"
      :data="records"
      row-key="evalId"
      stripe
      border
      max-height="420"
    >
      <template #empty>
        <el-empty
          :description="$t('page.monitoring.content.product.eval.empty')"
          :image-size="72"
        />
      </template>

      <el-table-column
        :label="$t('page.monitoring.content.product.eval.fields.evalId')"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ formatId(row.evalId) }}
        </template>
      </el-table-column>

      <el-table-column
        v-if="!productLocked"
        :label="$t('page.monitoring.content.product.eval.fields.productId')"
        min-width="120"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ formatId(row.productId) }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.monitoring.content.product.eval.fields.userId')"
        min-width="100"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ formatId(row.userId) }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.monitoring.content.product.eval.fields.score')"
        width="140"
        align="center"
      >
        <template #default="{ row }">
          <el-rate
            :model-value="Number(row.score) || 0"
            disabled
            show-score
            text-color="var(--el-color-warning)"
          />
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.monitoring.content.product.eval.fields.content')"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ row.content?.trim() || '—' }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.monitoring.content.product.eval.fields.status')"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="resolveAdminProductEvalStatusTagType(row.status)"
            size="small"
            effect="plain"
            round
          >
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.monitoring.content.product.eval.fields.createTime')"
        width="160"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column
        fixed="right"
        :label="$t('page.monitoring.content.product.eval.fields.actions')"
        width="160"
        align="center"
      >
        <template #default="{ row }">
          <el-popconfirm
            v-if="canBlockAdminProductEval(row.status)"
            :title="$t('page.monitoring.content.product.eval.blockConfirm')"
            :disabled="actingId === row.evalId"
            @confirm="handleBlock(row)"
          >
            <template #reference>
              <el-button
                link
                type="warning"
                size="small"
                :loading="actingId === row.evalId"
              >
                {{ $t('page.monitoring.content.product.eval.block') }}
              </el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm
            :title="$t('page.monitoring.content.product.eval.deleteConfirm')"
            :disabled="actingId === row.evalId"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button
                link
                type="danger"
                size="small"
                :loading="actingId === row.evalId"
              >
                {{ $t('page.monitoring.content.product.eval.delete') }}
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div
      v-if="records.length > 0 || loading || total > 0"
      class="product-eval-dialog__pager"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        layout="total, sizes, prev, pager, next"
        :disabled="loading"
        :page-sizes="ADMIN_PRODUCT_EVAL_PAGE_SIZE_OPTIONS"
        :total="total"
      />
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.product-eval-dialog {
  &__toolbar {
    margin-bottom: 12px;
  }

  &__filters {
    margin-bottom: 0;

    :deep(.el-form-item) {
      margin-bottom: 8px;
    }
  }

  &__hint {
    margin: 0 0 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__table {
    width: 100%;
  }

  &__pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
