<script lang="ts" setup>
import type { ProductInfo } from '#/types/service/product';

import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Star, StarFilled } from '@element-plus/icons-vue';

import { useProductActions } from '../composables/use-product-actions';
import {
  formatGreenPowerRatio,
  formatProductPrice,
  hasProductImage,
  splitProductTags,
} from '../data';

defineOptions({ name: 'ServiceProductCard' });

const props = withDefaults(
  defineProps<{
    /** 初始是否已收藏（收藏页为 true） */
    collected?: boolean;
    /** 产品条目 */
    item: ProductInfo;
    /** 是否展示「立即使用」 */
    showUseNow?: boolean;
  }>(),
  {
    collected: false,
    showUseNow: true,
  },
);

const emit = defineEmits<{
  /** 收藏状态变化 */
  collectChange: [payload: { collected: boolean; productId: number }];
  /** 查看详情 */
  detail: [item: ProductInfo];
}>();

const { isCollecting, isUsing, toggleCollect, useNow } = useProductActions();

/** 本地收藏态（优先 props，其次接口 isCollected） */
const collected = ref(!!props.collected || !!props.item.isCollected);

watch(
  () => [props.collected, props.item.isCollected] as const,
  ([forced, fromApi]) => {
    collected.value = !!forced || !!fromApi;
  },
);

/** 标签列表 */
const tags = computed(() => splitProductTags(props.item.tags));

/** 价格文案 */
const priceText = computed(
  () =>
    formatProductPrice(props.item.price) ||
    $t('page.service.product.pricePending'),
);

/** 绿电占比文案 */
const greenText = computed(() =>
  formatGreenPowerRatio(props.item.greenPowerRatio),
);

/**
 * 触发详情
 */
function handleDetail() {
  emit('detail', props.item);
}

/**
 * 切换收藏
 */
async function handleCollect() {
  const next = await toggleCollect(props.item.productId, collected.value);
  if (next === null) {
    return;
  }
  collected.value = next;
  // 同步到条目，避免列表刷新前状态丢失
  props.item.isCollected = next;
  emit('collectChange', {
    productId: props.item.productId,
    collected: next,
  });
}

/**
 * 立即使用
 */
async function handleUseNow() {
  await useNow(props.item);
}
</script>

<template>
  <el-card
    class="product-card"
    shadow="hover"
    :body-style="{ padding: '0' }"
    @click="handleDetail"
  >
    <div
      class="product-card__cover"
      :class="{ 'product-card__cover--empty': !hasProductImage(item.imageUrl) }"
    >
      <el-image
        v-if="hasProductImage(item.imageUrl)"
        class="product-card__img"
        :src="item.imageUrl"
        fit="cover"
        lazy
      />
      <span v-else class="product-card__letter" aria-hidden="true">
        {{ item.productName.slice(0, 1) }}
      </span>

      <el-button
        class="product-card__collect"
        circle
        size="small"
        :loading="isCollecting(item.productId)"
        :title="
          collected
            ? $t('page.service.product.collect.cancel')
            : $t('page.service.product.collect.do')
        "
        @click.stop="handleCollect"
      >
        <el-icon :class="{ 'is-collected': collected }">
          <StarFilled v-if="collected" />
          <Star v-else />
        </el-icon>
      </el-button>

      <el-tag
        v-if="item.recommendLevel != null"
        class="product-card__level"
        effect="dark"
        round
        size="small"
      >
        {{
          $t('page.service.product.recommendLevel', [
            String(item.recommendLevel),
          ])
        }}
      </el-tag>
    </div>

    <div class="product-card__body">
      <h3 class="product-card__name" :title="item.productName">
        {{ item.productName }}
      </h3>

      <div v-if="tags.length > 0" class="product-card__tags">
        <el-tag
          v-for="tag in tags"
          :key="`${item.productId}-${tag}`"
          size="small"
          type="info"
          effect="plain"
          round
        >
          {{ tag }}
        </el-tag>
      </div>

      <p v-if="greenText" class="product-card__green">
        {{ $t('page.service.product.greenPower', [greenText]) }}
      </p>

      <p v-if="item.description" class="product-card__desc">
        {{ item.description }}
      </p>
    </div>

    <template #footer>
      <div class="product-card__foot">
        <span class="product-card__price">{{ priceText }}</span>
        <div class="product-card__actions">
          <el-button size="small" @click.stop="handleDetail">
            {{ $t('page.service.product.viewDetail') }}
          </el-button>
          <el-button
            v-if="showUseNow"
            type="success"
            size="small"
            :loading="isUsing(item.productId)"
            @click.stop="handleUseNow"
          >
            {{ $t('page.service.product.useNow.action') }}
          </el-button>
        </div>
      </div>
    </template>
  </el-card>
</template>

<style lang="scss" scoped>
.product-card {
  height: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :deep(.el-card__footer) {
    padding: 12px 16px 16px;
    border-top: 1px solid var(--el-card-border-color);
  }

  &__cover {
    position: relative;
    height: 152px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary)),
      hsl(250deg 100% 76%) 55%,
      hsl(190deg 90% 66%)
    );

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

    :deep(img) {
      transition: transform 0.35s ease;
    }
  }

  &:hover &__img :deep(img) {
    transform: scale(1.04);
  }

  &__letter {
    font-size: 40px;
    font-weight: 750;
    color: rgb(255 255 255 / 92%);
  }

  &__collect {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 1;
    background: rgb(255 255 255 / 92%) !important;
    border: 0;

    .is-collected {
      color: #e6a23c;
    }
  }

  &__level {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgb(15 26 46 / 55%) !important;
    border: 0;
    backdrop-filter: blur(4px);
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }

  &__name {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: 750;
    line-height: 1.4;
    color: hsl(var(--foreground));
    white-space: nowrap;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__green {
    margin: 0;
    font-size: 12px;
    font-weight: 650;
    color: hsl(145deg 70% 36%);
  }

  &__desc {
    display: -webkit-box;
    flex: 1;
    margin: 0;
    overflow: hidden;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    font-size: 13px;
    line-height: 1.65;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
  }

  &__foot {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  &__price {
    font-size: 17px;
    font-weight: 800;
    color: hsl(var(--primary));
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }
}
</style>
