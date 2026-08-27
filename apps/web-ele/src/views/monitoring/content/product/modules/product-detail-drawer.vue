<script lang="ts" setup>
import type { ProductInfo } from '#/types/service/product';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  formatGreenPowerRatio,
  formatProductDateTime,
  formatProductPrice,
  hasProductImage,
  splitProductTags,
  resolveAdminProductAuditLabelKey,
  resolveAdminProductAuditTagType,
  resolveAdminProductShelfLabelKey,
  resolveAdminProductShelfTagType,
} from '../data';

defineOptions({ name: 'AdminProductDetailDrawer' });

const visible = defineModel<boolean>('visible', { default: false });

const props = defineProps<{
  /** 当前查看的产品 */
  item?: null | ProductInfo;
}>();

/** 标签列表 */
const tags = computed(() => splitProductTags(props.item?.tags));

/** 价格文案 */
const priceText = computed(() => {
  if (!props.item) {
    return '—';
  }
  return (
    formatProductPrice(props.item.price) ||
    $t('page.monitoring.content.product.pricePending')
  );
});

/** 绿电占比文案 */
const greenText = computed(() => {
  if (!props.item) {
    return '—';
  }
  return formatGreenPowerRatio(props.item.greenPowerRatio) || '—';
});

/**
 * 格式化可选时间字段
 * @param value 时间字符串
 * @returns 展示文案
 */
function formatTime(value?: string): string {
  return formatProductDateTime(value) || '—';
}

/**
 * 格式化可选 ID 字段
 * @param value 数值 ID
 * @returns 展示文案
 */
function formatId(value?: number | string): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}
</script>

<template>
  <el-drawer
    v-model="visible"
    class="product-detail-drawer"
    destroy-on-close
    :size="480"
    :title="$t('page.monitoring.content.product.detailTitle')"
  >
    <template v-if="item">
      <div
        class="product-detail-drawer__cover"
        :class="{
          'product-detail-drawer__cover--empty': !hasProductImage(item.imageUrl),
        }"
      >
        <el-image
          v-if="hasProductImage(item.imageUrl)"
          class="product-detail-drawer__img"
          :src="item.imageUrl"
          fit="cover"
        />
        <span v-else class="product-detail-drawer__letter" aria-hidden="true">
          {{ item.productName.slice(0, 1) }}
        </span>
      </div>

      <h3 class="product-detail-drawer__name">{{ item.productName }}</h3>

      <div v-if="tags.length > 0" class="product-detail-drawer__tags">
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

      <el-descriptions :column="1" border class="product-detail-drawer__desc">
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.productId')"
        >
          {{ formatId(item.productId) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.description')"
        >
          {{ item.description || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.price')"
        >
          {{ priceText }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.greenPowerRatio')"
        >
          {{ greenText }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.recommendLevel')"
        >
          {{
            item.recommendLevel != null
              ? $t('page.monitoring.content.product.recommendLevel', [
                  String(item.recommendLevel),
                ])
              : '—'
          }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.shelfStatus')"
        >
          <el-tag
            :type="resolveAdminProductShelfTagType(item.shelfStatus)"
            size="small"
            round
          >
            {{
              $t(
                `page.monitoring.content.product.shelfStatus.${resolveAdminProductShelfLabelKey(item.shelfStatus)}`,
              )
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.auditStatus')"
        >
          <el-tag
            :type="resolveAdminProductAuditTagType(item.status)"
            size="small"
            round
          >
            {{
              $t(
                `page.monitoring.content.product.auditStatus.${resolveAdminProductAuditLabelKey(item.status)}`,
              )
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.enterpriseId')"
        >
          {{ formatId(item.enterpriseId) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.publishTime')"
        >
          {{ formatTime(item.publishTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.home.common.fields.createTime')"
        >
          {{ formatTime(item.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.home.common.fields.updateTime')"
        >
          {{ formatTime(item.updateTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.product.fields.tenantId')"
        >
          {{ item.tenantId || '—' }}
        </el-descriptions-item>
      </el-descriptions>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
.product-detail-drawer {
  &__cover {
    height: 180px;
    margin-bottom: 16px;
    overflow: hidden;
    border-radius: 12px;
    background: linear-gradient(
      145deg,
      hsl(var(--primary)),
      hsl(250 100% 76%) 55%,
      hsl(190 90% 66%)
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
  }

  &__letter {
    font-size: 48px;
    font-weight: 750;
    color: rgba(255, 255, 255, 0.92);
  }

  &__name {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 750;
    line-height: 1.4;
    color: hsl(var(--foreground));
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }

  &__desc {
    :deep(.el-descriptions__label) {
      width: 120px;
    }
  }
}
</style>
