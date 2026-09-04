<script lang="ts" setup>
import type {
  DemandDiskPayload,
  DemandFeeResult,
  ProductImageItem,
  ProductSpecItem,
} from '#/types/service/product/order';

import { $t } from '@vben/locales';

import {
  DISK_USAGE_SYSTEM,
  formatFee,
} from '../data';

defineProps<{
  demandName: string;
  disks: DemandDiskPayload[];
  fee: DemandFeeResult | null;
  feeLoading?: boolean;
  instanceName: string;
  networkBandwidth: number;
  quantity: number;
  region?: string;
  selectedImage: null | ProductImageItem;
  selectedModelCount: number;
  selectedSpec: null | ProductSpecItem;
}>();

/**
 * 磁盘用途文案
 * @param usage 用途码
 */
function diskUsageLabel(usage: number) {
  return usage === DISK_USAGE_SYSTEM
    ? $t('page.service.product.order.disk.system')
    : $t('page.service.product.order.disk.data');
}
</script>

<template>
  <div class="order-confirm">
    <el-card class="order-confirm__card" shadow="never">
      <template #header>
        <div class="order-confirm__card-head">
          <h3>{{ $t('page.service.product.order.confirm.title') }}</h3>
          <p>{{ $t('page.service.product.order.confirm.desc') }}</p>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item
          :label="$t('page.service.product.order.confirm.demandName')"
        >
          {{ demandName || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.product.order.confirm.instanceName')"
        >
          {{ instanceName || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.product.order.confirm.specCode')"
        >
          {{ selectedSpec?.specCode || fee?.specCode || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.product.order.confirm.quantity')"
        >
          {{ quantity }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.product.order.confirm.image')"
        >
          {{
            selectedImage?.imageName ||
            selectedImage?.version ||
            (selectedImage?.imageId
              ? `Image #${selectedImage.imageId}`
              : '—')
          }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.product.order.confirm.region')"
        >
          {{ region || selectedSpec?.region || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.product.order.confirm.bandwidth')"
        >
          {{ networkBandwidth }} Mbps
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.product.order.confirm.models')"
        >
          {{
            $t('page.service.product.order.confirm.modelCount', [
              selectedModelCount,
            ])
          }}
        </el-descriptions-item>
      </el-descriptions>

      <h4 class="order-confirm__sub">
        {{ $t('page.service.product.order.confirm.diskTitle') }}
      </h4>
      <el-table :data="disks" size="small">
        <el-table-column
          :label="$t('page.service.product.order.disk.usage')"
          width="120"
        >
          <template #default="{ row }">
            {{ diskUsageLabel(row.diskUsage) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="diskType"
          :label="$t('page.service.product.order.disk.type')"
        />
        <el-table-column
          :label="$t('page.service.product.order.disk.capacity')"
          width="120"
        >
          <template #default="{ row }"> {{ row.capacityGb }} GB </template>
        </el-table-column>
        <el-table-column
          prop="quantity"
          :label="$t('page.service.product.order.disk.quantity')"
          width="100"
        />
      </el-table>
    </el-card>

    <el-card v-loading="feeLoading" class="order-confirm__card" shadow="never">
      <template #header>
        <div class="order-confirm__card-head">
          <h3>{{ $t('page.service.product.order.confirm.feeTitle') }}</h3>
          <p>{{ $t('page.service.product.order.confirm.feeDesc') }}</p>
        </div>
      </template>

      <div class="order-confirm__fee-grid">
        <div class="order-confirm__fee-item">
          <span>{{ $t('page.service.product.order.confirm.configFee') }}</span>
          <strong>
            ¥{{ formatFee(fee?.configFee) }}
            <small>/h</small>
          </strong>
        </div>
        <div class="order-confirm__fee-item">
          <span>{{ $t('page.service.product.order.confirm.networkFee') }}</span>
          <strong>
            ¥{{ formatFee(fee?.networkFee) }}
            <small>/GB</small>
          </strong>
        </div>
        <div class="order-confirm__fee-item order-confirm__fee-item--total">
          <span>{{ $t('page.service.product.order.confirm.totalFee') }}</span>
          <strong>
            ¥{{ formatFee(fee?.totalFee) }}
            <small>/h</small>
          </strong>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.order-confirm {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__card {
    border-radius: 14px;

    :deep(.el-card__header) {
      padding: 16px 20px 12px;
    }

    :deep(.el-card__body) {
      padding: 8px 20px 20px;
    }
  }

  &__card-head {
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 650;
      line-height: 1.4;
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.5;
      color: hsl(var(--muted-foreground));
    }
  }

  &__sub {
    margin: 20px 0 10px;
    font-size: 14px;
    font-weight: 600;
  }

  &__fee-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  &__fee-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 12px;

    span {
      font-size: 13px;
      color: hsl(var(--muted-foreground));
    }

    strong {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--el-color-primary);

      small {
        margin-left: 2px;
        font-size: 13px;
        font-weight: 400;
        color: hsl(var(--muted-foreground));
      }
    }

    &--total {
      background: var(--el-color-primary-light-9);

      strong {
        font-size: 26px;
      }
    }
  }
}

@media (max-width: 768px) {
  .order-confirm {
    &__fee-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
