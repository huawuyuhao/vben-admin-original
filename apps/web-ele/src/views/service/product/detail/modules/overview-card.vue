<script lang="ts" setup>
import type { ProductInfo } from '#/types/service/product';

import { computed, ref, watch } from 'vue';

import { Star, StarFilled } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

import {
  formatGreenPowerRatio,
  formatProductPrice,
  hasProductImage,
  splitProductTags,
} from '../../data';
import { useProductActions } from '../../composables/use-product-actions';

defineOptions({ name: 'ServiceProductDetailOverview' });

const props = withDefaults(
  defineProps<{
    /** 初始是否已收藏 */
    collected?: boolean;
    /** 产品详情 */
    product: ProductInfo;
  }>(),
  { collected: false },
);

const emit = defineEmits<{
  /** 收藏状态变化 */
  collectChange: [collected: boolean];
}>();

const { isCollecting, isUsing, toggleCollect, useNow } = useProductActions();

/** 本地收藏态（来自详情 isCollected） */
const collected = ref(!!props.collected || !!props.product.isCollected);

watch(
  () => [props.collected, props.product.isCollected] as const,
  ([forced, fromApi]) => {
    collected.value = !!forced || !!fromApi;
  },
);

/** 标签列表 */
const tags = computed(() => splitProductTags(props.product.tags));

/** 价格文案 */
const priceText = computed(
  () =>
    formatProductPrice(props.product.price) ||
    $t('page.service.product.pricePending'),
);

/** 绿电占比文案 */
const greenText = computed(() =>
  formatGreenPowerRatio(props.product.greenPowerRatio),
);

/**
 * 切换收藏
 */
async function handleCollect() {
  const next = await toggleCollect(props.product.productId, collected.value);
  if (next === null) {
    return;
  }
  collected.value = next;
  props.product.isCollected = next;
  emit('collectChange', next);
}

/**
 * 立即使用
 */
async function handleUseNow() {
  await useNow(props.product);
}
</script>

<template>
  <el-card class="product-overview" shadow="never">
    <div class="product-overview__layout">
      <div
        class="product-overview__cover"
        :class="{
          'product-overview__cover--empty': !hasProductImage(product.imageUrl),
        }"
      >
        <el-image
          v-if="hasProductImage(product.imageUrl)"
          class="product-overview__img"
          :src="product.imageUrl"
          fit="cover"
          :preview-src-list="[product.imageUrl!]"
          preview-teleported
        />
        <span v-else class="product-overview__letter" aria-hidden="true">
          {{ product.productName.slice(0, 1) }}
        </span>
      </div>

      <div class="product-overview__main">
        <div class="product-overview__title-row">
          <h3>{{ product.productName }}</h3>
          <el-tag
            v-if="product.recommendLevel != null"
            type="warning"
            effect="plain"
            round
          >
            {{
              $t('page.service.product.recommendLevel', [
                String(product.recommendLevel),
              ])
            }}
          </el-tag>
          <el-button
            class="product-overview__collect"
            circle
            :loading="isCollecting(product.productId)"
            :title="
              collected
                ? $t('page.service.product.collect.cancel')
                : $t('page.service.product.collect.do')
            "
            @click="handleCollect"
          >
            <el-icon :class="{ 'is-collected': collected }">
              <StarFilled v-if="collected" />
              <Star v-else />
            </el-icon>
          </el-button>
        </div>

        <div v-if="tags.length > 0" class="product-overview__tags">
          <el-tag
            v-for="tag in tags"
            :key="`${product.productId}-${tag}`"
            size="small"
            type="info"
            effect="plain"
            round
          >
            {{ tag }}
          </el-tag>
        </div>

        <p v-if="greenText" class="product-overview__green">
          {{ $t('page.service.product.greenPower', [greenText]) }}
        </p>

        <p v-if="product.description" class="product-overview__desc">
          {{ product.description }}
        </p>

        <div class="product-overview__bottom">
          <div class="product-overview__price">{{ priceText }}</div>
          <el-button
            type="success"
            :loading="isUsing(product.productId)"
            @click="handleUseNow"
          >
            {{ $t('page.service.product.useNow.action') }}
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.product-overview {
  margin-bottom: 16px;

  &__layout {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 24px;
    align-items: stretch;
  }

  &__cover {
    position: relative;
    height: 220px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary)),
      hsl(250 100% 76%) 55%,
      hsl(190 90% 66%)
    );
    border-radius: calc(var(--el-card-border-radius, 4px) - 2px);

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__img {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__letter {
    font-size: 56px;
    font-weight: 750;
    color: rgba(255, 255, 255, 0.92);
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 22px;
      font-weight: 750;
      color: hsl(var(--foreground));
    }
  }

  &__collect {
    margin-left: auto;

    .is-collected {
      color: #e6a23c;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__green {
    margin: 0;
    font-size: 13px;
    font-weight: 650;
    color: hsl(145 70% 36%);
  }

  &__desc {
    margin: 0;
    font-size: 14px;
    line-height: 1.75;
    color: hsl(var(--muted-foreground));
  }

  &__bottom {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }

  &__price {
    font-size: 28px;
    font-weight: 800;
    color: hsl(var(--primary));
  }
}

@media (max-width: 900px) {
  .product-overview {
    &__layout {
      grid-template-columns: 1fr;
    }

    &__cover {
      height: 180px;
    }

    &__collect {
      margin-left: 0;
    }
  }
}
</style>
