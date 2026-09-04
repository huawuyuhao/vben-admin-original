<script lang="ts" setup>
import type { ProductInfo } from '#/types/service/product';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  formatProductDateTime,
  PRODUCT_STATUS_ENABLED,
} from '../../data';

defineOptions({ name: 'ServiceProductDetailInfo' });

const props = defineProps<{
  /** 产品详情 */
  product: ProductInfo;
}>();

/**
 * 上下架状态文案
 */
const shelfText = computed(() => {
  const status = Number(props.product.shelfStatus);
  if (status === PRODUCT_STATUS_ENABLED) {
    return $t('page.service.product.detail.shelfOn');
  }
  if (status === 0) {
    return $t('page.service.product.detail.shelfOff');
  }
  return $t('page.service.product.detail.valueEmpty');
});

/**
 * 审核状态文案
 */
const auditText = computed(() => {
  const status = Number(props.product.status);
  switch (status) {
    case 0: {
      return $t('page.service.product.detail.auditPending');
    }
    case 1: {
      return $t('page.service.product.detail.auditPass');
    }
    case 2: {
      return $t('page.service.product.detail.auditReject');
    }
    default: {
      return $t('page.service.product.detail.valueEmpty');
    }
  }
});

/** 发布时间 */
const publishText = computed(
  () =>
    formatProductDateTime(props.product.publishTime) ||
    $t('page.service.product.detail.valueEmpty'),
);

/** 创建时间 */
const createText = computed(
  () =>
    formatProductDateTime(props.product.createTime) ||
    $t('page.service.product.detail.valueEmpty'),
);
</script>

<template>
  <el-card class="product-info" shadow="never">
    <template #header>
      <span>{{ $t('page.service.product.detail.infoTitle') }}</span>
    </template>

    <el-descriptions :column="2" border>
      <el-descriptions-item
        :label="$t('page.service.product.detail.fields.productId')"
      >
        {{ product.productId }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.product.detail.fields.productName')"
      >
        {{ product.productName }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.product.detail.fields.enterpriseId')"
      >
        {{
          product.enterpriseId ??
          $t('page.service.product.detail.valueEmpty')
        }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.product.detail.fields.recommendLevel')"
      >
        {{
          product.recommendLevel ??
          $t('page.service.product.detail.valueEmpty')
        }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.product.detail.fields.shelfStatus')"
      >
        {{ shelfText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.product.detail.fields.status')"
      >
        {{ auditText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.product.detail.fields.publishTime')"
      >
        {{ publishText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.product.detail.fields.createTime')"
      >
        {{ createText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.product.detail.fields.description')"
        :span="2"
      >
        {{
          product.description?.trim() ||
          $t('page.service.product.detail.valueEmpty')
        }}
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style lang="scss" scoped>
.product-info {
  :deep(.el-card__header) {
    font-size: 15px;
    font-weight: 700;
  }
}
</style>
