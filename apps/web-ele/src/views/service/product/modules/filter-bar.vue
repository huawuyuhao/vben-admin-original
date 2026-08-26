<script lang="ts" setup>
import type { ProductSortField } from '#/types/service/product';

import { Search } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

import {
  PRODUCT_SORT_FIELD_OPTIONS,
  PRODUCT_SORT_ORDER_OPTIONS,
} from '../data';

defineOptions({ name: 'ServiceProductFilterBar' });

/** 关键词（与父级 v-model:keyword 同步） */
const keyword = defineModel<string>('keyword', { default: '' });
/** 排序字段（清空表示默认） */
const sortField = defineModel<null | ProductSortField | string>('sortField', {
  default: '',
});
/** 排序方向 */
const sortOrder = defineModel<'asc' | 'desc' | null | string>('sortOrder', {
  default: '',
});

const emit = defineEmits<{
  /** 点击查询 */
  search: [];
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
        v-model="keyword"
        class="product-filter__keyword"
        clearable
        :placeholder="$t('page.service.product.searchPlaceholder')"
        @keyup.enter="handleEnter"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="sortField"
        class="product-filter__sort-field"
        clearable
        :placeholder="$t('page.service.product.sortFieldLabel')"
      >
        <el-option
          v-for="opt in PRODUCT_SORT_FIELD_OPTIONS"
          :key="opt.value"
          :label="$t(`page.service.product.sortField.${opt.labelKey}`)"
          :value="opt.value"
        />
      </el-select>

      <el-select
        v-model="sortOrder"
        class="product-filter__sort-order"
        clearable
        :placeholder="$t('page.service.product.sortOrderLabel')"
      >
        <el-option
          v-for="opt in PRODUCT_SORT_ORDER_OPTIONS"
          :key="opt.value"
          :label="$t(`page.service.product.sortOrder.${opt.labelKey}`)"
          :value="opt.value"
        />
      </el-select>

      <div class="product-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.service.product.search') }}
        </el-button>
        <el-button
          class="mine-shell__action-btn"
          :loading="refreshing"
          @click="emit('refresh')"
        >
          {{ $t('page.service.product.refresh') }}
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

  &__sort-field,
  &__sort-order {
    width: 140px;
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .product-filter {
    &__sort-field,
    &__sort-order {
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
