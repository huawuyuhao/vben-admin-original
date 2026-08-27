<script lang="ts" setup>
import type { ModelEvaluation } from '#/types/service/model';

import { onMounted, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { formatDate, isEmpty } from '@vben/utils';

import { getModelEvaluationListApi } from '#/api/service/model';

import {
  MODEL_EVAL_PAGE_SIZE,
  MODEL_EVAL_PAGE_SIZE_OPTIONS,
} from '../../data';

defineOptions({ name: 'ServiceModelDetailEvaluations' });

const props = defineProps<{
  /** 模型 ID */
  modelId: number;
  /** 外部刷新令牌（提交评价后递增） */
  refreshToken?: number;
}>();

/** 加载中 */
const loading = ref(false);
/** 评价列表 */
const records = ref<ModelEvaluation[]>([]);
/** 总条数 */
const total = ref(0);
/** 当前页 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(MODEL_EVAL_PAGE_SIZE);
/** 跳过由服务端回写 / 重置页码触发的重复请求 */
const syncingFromServer = ref(false);

/**
 * 格式化评价时间
 * @param time 时间
 * @returns 展示文案
 */
function formatEvalTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return $t('page.service.model.detail.valueEmpty');
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 拉取评价列表
 */
async function fetchEvaluations() {
  if (!props.modelId) {
    records.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    const data = await getModelEvaluationListApi({
      modelId: props.modelId,
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    records.value = data.records || [];
    total.value = Math.max(0, Number(data.total) || 0);
    if (data.current && data.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = data.current;
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
 * 模型切换或评价提交后，回到第一页并刷新
 */
function resetAndFetch() {
  if (currentPage.value !== 1) {
    syncingFromServer.value = true;
    currentPage.value = 1;
    syncingFromServer.value = false;
  }
  void fetchEvaluations();
}

watch(
  () => [props.modelId, props.refreshToken] as const,
  () => {
    resetAndFetch();
  },
);

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchEvaluations();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchEvaluations();
});

onMounted(() => {
  void fetchEvaluations();
});

defineExpose({ refresh: fetchEvaluations });
</script>

<template>
  <el-card class="model-evals" shadow="never">
    <template #header>
      <div class="model-evals__header">
        <span>{{ $t('page.service.model.detail.evalTitle') }}</span>
        <span v-if="total > 0" class="model-evals__total">
          {{ total }}
        </span>
      </div>
    </template>

    <div v-loading="loading">
      <el-empty
        v-if="!loading && records.length === 0"
        :description="$t('page.service.model.detail.evalEmpty')"
      />

      <template v-else>
        <div class="model-evals__list">
          <div
            v-for="item in records"
            :key="item.evalId || `${item.userName}-${item.createTime}`"
            class="model-evals__item"
          >
            <div class="model-evals__item-head">
              <span class="model-evals__user">
                {{
                  item.userName?.trim() ||
                  $t('page.service.model.detail.evalAnonymous')
                }}
              </span>
              <el-rate
                :model-value="Number(item.score) || 0"
                disabled
                :max="5"
                size="small"
              />
              <span class="model-evals__time">
                {{ formatEvalTime(item.createTime) }}
              </span>
            </div>
            <p class="model-evals__content">
              {{
                item.content?.trim() ||
                $t('page.service.model.detail.valueEmpty')
              }}
            </p>
          </div>
        </div>

        <div v-if="total > 0" class="model-evals__pager">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="MODEL_EVAL_PAGE_SIZE_OPTIONS"
            :total="total"
            :disabled="loading"
          />
        </div>
      </template>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.model-evals {
  :deep(.el-card__header) {
    font-size: 15px;
    font-weight: 700;
  }

  &__header {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__total {
    min-width: 22px;
    padding: 0 7px;
    font-size: 12px;
    font-weight: 650;
    line-height: 20px;
    color: hsl(var(--primary));
    text-align: center;
    background: hsl(var(--primary) / 12%);
    border-radius: 999px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__item {
    padding-bottom: 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }
  }

  &__item-head {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
  }

  &__user {
    font-size: 14px;
    font-weight: 700;
    color: hsl(var(--foreground));
  }

  &__time {
    margin-left: auto;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__content {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: hsl(var(--muted-foreground));
    white-space: pre-wrap;
  }

  &__pager {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

@media (max-width: 768px) {
  .model-evals {
    &__pager {
      justify-content: center;
    }
  }
}
</style>
