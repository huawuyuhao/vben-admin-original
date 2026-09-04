<script lang="ts" setup>
import type { ProductInfo } from '#/types/service/product';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  formatGreenPowerRatio,
  formatProductDateTime,
  formatProductPrice,
  hasProductImage,
  resolveAdminProductAuditLabelKey,
  resolveAdminProductAuditTagType,
  resolveAdminProductShelfLabelKey,
  resolveAdminProductShelfTagType,
  splitProductTags,
} from '../data';

defineOptions({ name: 'AdminProductCard' });

const props = defineProps<{
  /** 产品条目 */
  item: ProductInfo;
}>();

const emit = defineEmits<{
  /** 查看详情 */
  detail: [item: ProductInfo];
}>();

/** 标签列表 */
const tags = computed(() => splitProductTags(props.item.tags));

/** 价格文案 */
const priceText = computed(
  () =>
    formatProductPrice(props.item.price) ||
    $t('page.monitoring.content.product.pricePending'),
);

/** 绿电占比文案 */
const greenText = computed(() =>
  formatGreenPowerRatio(props.item.greenPowerRatio),
);

/** 发布时间文案 */
const publishText = computed(() =>
  formatProductDateTime(props.item.publishTime),
);

/** 上下架 Tag 类型 */
const shelfTagType = computed(() =>
  resolveAdminProductShelfTagType(props.item.shelfStatus),
);

/** 上下架文案键 */
const shelfLabelKey = computed(() =>
  resolveAdminProductShelfLabelKey(props.item.shelfStatus),
);

/** 审核 Tag 类型 */
const auditTagType = computed(() =>
  resolveAdminProductAuditTagType(props.item.status),
);

/** 审核文案键 */
const auditLabelKey = computed(() =>
  resolveAdminProductAuditLabelKey(props.item.status),
);

/**
 * 触发详情
 */
function handleDetail() {
  emit('detail', props.item);
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

      <el-tag
        class="product-card__shelf"
        :type="shelfTagType"
        effect="dark"
        round
        size="small"
      >
        {{ $t(`page.monitoring.content.product.shelfStatus.${shelfLabelKey}`) }}
      </el-tag>

      <el-tag
        v-if="item.recommendLevel != null"
        class="product-card__level"
        effect="dark"
        round
        size="small"
      >
        {{
          $t('page.monitoring.content.product.recommendLevel', [
            String(item.recommendLevel),
          ])
        }}
      </el-tag>
    </div>

    <div class="product-card__body">
      <div class="product-card__headline">
        <h3 class="product-card__name" :title="item.productName">
          {{ item.productName }}
        </h3>
        <el-tag :type="auditTagType" size="small" effect="plain" round>
          {{ $t(`page.monitoring.content.product.auditStatus.${auditLabelKey}`) }}
        </el-tag>
      </div>

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
        {{ $t('page.monitoring.content.product.greenPower', [greenText]) }}
      </p>

      <p v-if="item.description" class="product-card__desc">
        {{ item.description }}
      </p>

      <p v-if="publishText" class="product-card__meta">
        {{ $t('page.monitoring.content.product.publishTime', [publishText]) }}
      </p>
    </div>

    <template #footer>
      <div class="product-card__foot">
        <span class="product-card__price">{{ priceText }}</span>
        <el-button size="small" @click.stop="handleDetail">
          {{ $t('page.monitoring.content.product.viewDetail') }}
        </el-button>
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

  &__shelf {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 1;
    border: 0;
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

  &__headline {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__name {
    flex: 1;
    min-width: 0;
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

  &__meta {
    margin: 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
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
}
</style>
