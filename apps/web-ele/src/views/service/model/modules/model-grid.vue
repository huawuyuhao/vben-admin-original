<script lang="ts" setup>
import type { ModelInfo } from '#/types/service/model';

import { $t } from '@vben/locales';

import ModelCard from './model-card.vue';

defineOptions({ name: 'ServiceModelGrid' });

withDefaults(
  defineProps<{
    /** 已选对比 ID 集合 */
    compareIds?: number[];
    /** 对比上限 */
    compareMax?: number;
    /** 空态文案 */
    emptyDescription?: string;
    /** 已选导出 ID 集合 */
    exportIds?: number[];
    /** 是否处于导出勾选模式 */
    exportSelecting?: boolean;
    /** 加载中 */
    loading?: boolean;
    /** 模型列表 */
    models: ModelInfo[];
  }>(),
  {
    compareIds: () => [],
    compareMax: 5,
    emptyDescription: undefined,
    exportIds: () => [],
    exportSelecting: false,
    loading: false,
  },
);

const emit = defineEmits<{
  /** 对比勾选变化 */
  compareChange: [payload: { checked: boolean; modelId: number }];
  /** 查看详情 */
  detail: [item: ModelInfo];
  /** 打开评价 */
  evaluate: [item: ModelInfo];
  /** 导出勾选变化 */
  exportChange: [payload: { checked: boolean; modelId: number }];
}>();
</script>

<template>
  <div v-loading="loading" class="model-grid-wrap">
    <div
      v-if="loading && models.length === 0"
      class="model-grid model-grid--skel"
    >
      <el-card
        v-for="i in 6"
        :key="i"
        class="model-grid-wrap__skel-col"
        shadow="never"
        :body-style="{ padding: '0' }"
      >
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item
              variant="image"
              style="width: 100%; height: 188px"
            />
            <div style="padding: 14px">
              <el-skeleton-item variant="h3" style="width: 60%" />
              <el-skeleton-item variant="text" style="margin-top: 10px" />
              <el-skeleton-item variant="text" style="width: 40%" />
            </div>
          </template>
        </el-skeleton>
      </el-card>
    </div>

    <el-card
      v-else-if="!loading && models.length === 0"
      class="model-grid-wrap__empty"
      shadow="never"
    >
      <el-empty
        :description="emptyDescription || $t('page.service.model.empty')"
      />
    </el-card>

    <div v-else class="model-grid">
      <ModelCard
        v-for="item in models"
        :key="item.modelId"
        class="model-grid__item"
        :item="item"
        :compare-checked="compareIds.includes(item.modelId)"
        :compare-disabled="compareIds.length >= compareMax"
        :export-selecting="exportSelecting"
        :export-checked="exportIds.includes(item.modelId)"
        @detail="emit('detail', $event)"
        @evaluate="emit('evaluate', $event)"
        @compare-change="emit('compareChange', $event)"
        @export-change="emit('exportChange', $event)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.model-grid-wrap {
  min-height: 240px;

  &__empty {
    :deep(.el-card__body) {
      padding: 24px 16px;
    }
  }
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  &__item {
    min-width: 0;
  }
}

@media (max-width: 1100px) {
  .model-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .model-grid {
    grid-template-columns: 1fr;
  }
}
</style>
