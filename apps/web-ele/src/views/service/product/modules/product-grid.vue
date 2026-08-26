<script lang="ts" setup>
import type { ProductInfo } from '#/types/service/product';

import { $t } from '@vben/locales';

import ProductCard from './product-card.vue';

defineOptions({ name: 'ServiceProductGrid' });

defineProps<{
  /** 产品列表 */
  products: ProductInfo[];
  /** 加载中 */
  loading?: boolean;
}>();

const emit = defineEmits<{
  /** 查看详情 */
  detail: [item: ProductInfo];
}>();
</script>

<template>
  <div v-loading="loading" class="product-grid-wrap">
    <div
      v-if="loading && products.length === 0"
      class="product-grid product-grid--skel"
    >
      <el-card
        v-for="i in 6"
        :key="i"
        class="product-grid-wrap__skel-col"
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
      class="product-grid-wrap__empty"
      shadow="never"
    >
      <el-empty :description="$t('page.service.product.empty')" />
    </el-card>

    <div v-else class="product-grid">
      <ProductCard
        v-for="item in products"
        :key="item.productId"
        class="product-grid__item"
        :item="item"
        @detail="emit('detail', $event)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-grid-wrap {
  min-height: 240px;

  &__empty {
    :deep(.el-card__body) {
      padding: 24px 16px;
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  &__item {
    min-width: 0;
  }
}

@media (max-width: 1100px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
