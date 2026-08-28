<script lang="ts" setup>
import type { FavoriteItem } from '#/types/mine/favorites';

import { $t } from '@vben/locales';

import FavoriteCard from './favorite-card.vue';

defineOptions({ name: 'MineFavoriteGrid' });

withDefaults(
  defineProps<{
    /** 列表项默认收藏态（收藏页传 true） */
    collected?: boolean;
    /** 空态文案 */
    emptyDescription?: string;
    /** 加载中 */
    loading?: boolean;
    /** 收藏产品列表 */
    products: FavoriteItem[];
    /** 是否展示「立即使用」 */
    showUseNow?: boolean;
  }>(),
  {
    collected: false,
    emptyDescription: undefined,
    loading: false,
    showUseNow: true,
  },
);

const emit = defineEmits<{
  /** 收藏状态变化 */
  collectChange: [payload: { collected: boolean; productId: number }];
  /** 查看详情 */
  detail: [item: FavoriteItem];
}>();
</script>

<template>
  <div v-loading="loading" class="favorite-grid-wrap">
    <div
      v-if="loading && products.length === 0"
      class="favorite-grid favorite-grid--skel"
    >
      <el-card
        v-for="i in 6"
        :key="i"
        class="favorite-grid-wrap__skel-col"
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
      v-else-if="!loading && products.length === 0"
      class="favorite-grid-wrap__empty"
      shadow="never"
    >
      <el-empty
        :description="
          emptyDescription || $t('page.mine.favorites.empty')
        "
      />
    </el-card>

    <div v-else class="favorite-grid">
      <FavoriteCard
        v-for="item in products"
        :key="item.productId"
        class="favorite-grid__item"
        :item="item"
        :collected="collected || !!item.isCollected"
        :show-use-now="showUseNow"
        @detail="emit('detail', $event)"
        @collect-change="emit('collectChange', $event)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.favorite-grid-wrap {
  min-height: 240px;

  &__empty {
    :deep(.el-card__body) {
      padding: 24px 16px;
    }
  }
}

.favorite-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  &__item {
    min-width: 0;
  }
}

@media (max-width: 1100px) {
  .favorite-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .favorite-grid {
    grid-template-columns: 1fr;
  }
}
</style>
