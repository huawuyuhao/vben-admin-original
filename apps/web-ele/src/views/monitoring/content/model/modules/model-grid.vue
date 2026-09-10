<script lang="ts" setup>
import type { AdminModelServiceItem } from '#/types/monitoring/content/model';

import { $t } from '@vben/locales';

import ModelCard from './model-card.vue';

defineOptions({ name: 'AdminModelServiceGrid' });

defineProps<{
  /** 加载中 */
  loading?: boolean;
  /** 模型列表 */
  models: AdminModelServiceItem[];
}>();

const emit = defineEmits<{
  /** 查看详情 */
  detail: [item: AdminModelServiceItem];
  /** 编辑 */
  edit: [item: AdminModelServiceItem];
  /** 删除 */
  remove: [item: AdminModelServiceItem];
  /** 打开评价 */
  evaluate: [item: AdminModelServiceItem];
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
              style="width: 100%; height: 152px"
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
      <el-empty :description="$t('page.monitoring.content.model.empty')" />
    </el-card>

    <div v-else class="model-grid">
      <ModelCard
        v-for="item in models"
        :key="String(item.modelId)"
        class="model-grid__item"
        :item="item"
        @detail="emit('detail', $event)"
        @edit="emit('edit', $event)"
        @remove="emit('remove', $event)"
        @evaluate="emit('evaluate', $event)"
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
