<script lang="ts" setup>
import type { AdminProductShelfStatus } from '#/types/monitoring/content/product';

import { Search } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

import { ADMIN_PRODUCT_SHELF_FILTER_OPTIONS } from '../data';

defineOptions({ name: 'AdminProductFilterBar' });

/** 产品名称 */
const productName = defineModel<string>('productName', { default: '' });
/** 上下架状态（空串表示全部） */
const shelfStatus = defineModel<'' | AdminProductShelfStatus>('shelfStatus', {
  default: '',
});

const emit = defineEmits<{
  /** 点击查询 */
  search: [];
  /** 点击重置 */
  reset: [];
  /** 点击刷新 */
  refresh: [];
}>();

defineProps<{
  /** 刷新按钮 loading */
  refreshing?: boolean;
}>();

/**
 * 回车触发搜索
 */
function handleEnter() {
  emit('search');
}
</script>

<template>
  <el-card class="product-filter" shadow="never">
    <div class="product-filter__row">
      <el-input
        v-model="productName"
        class="product-filter__keyword"
        clearable
        :placeholder="$t('page.monitoring.content.product.searchPlaceholder')"
        @keyup.enter="handleEnter"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="shelfStatus"
        class="product-filter__shelf"
        clearable
        :placeholder="$t('page.monitoring.content.product.shelfStatusLabel')"
      >
        <el-option
          v-for="opt in ADMIN_PRODUCT_SHELF_FILTER_OPTIONS"
          :key="String(opt.value)"
          :label="$t(`page.monitoring.content.product.shelfStatus.${opt.labelKey}`)"
          :value="opt.value"
        />
      </el-select>

      <div class="product-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.monitoring.content.home.common.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.monitoring.content.home.common.reset') }}
        </el-button>
        <el-button
          class="mine-shell__action-btn"
          :loading="refreshing"
          @click="emit('refresh')"
        >
          {{ $t('page.monitoring.content.home.common.refresh') }}
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.product-filter {
  margin-bottom: 18px;

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  &__keyword {
    flex: 1;
    min-width: 200px;
  }

  &__shelf {
    width: 160px;
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .product-filter {
    &__shelf {
      width: 100%;
    }

    &__actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
