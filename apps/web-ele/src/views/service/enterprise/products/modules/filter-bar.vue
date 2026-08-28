<script lang="ts" setup>
import { $t } from '@vben/locales';

import {
  PRODUCT_SHELF_OFF,
  PRODUCT_SHELF_ON,
  type ProductShelfFilter,
} from '../data';

defineOptions({ name: 'EnterpriseProductsFilterBar' });

/** 产品名称筛选 */
const productName = defineModel<string>('productName', { default: '' });
/** 上下架状态筛选（与父级 v-model:shelfStatus 同步） */
const shelfStatus = defineModel<ProductShelfFilter>('shelfStatus', {
  default: '',
});

const emit = defineEmits<{
  /** 重置筛选 */
  reset: [];
  /** 点击查询 */
  search: [];
}>();
</script>

<template>
  <el-card class="products-filter" shadow="never">
    <el-form class="products-filter__form" @submit.prevent>
      <el-form-item
        class="products-filter__field"
        :label="$t('page.service.enterprise.products.filter.productName')"
      >
        <el-input
          v-model="productName"
          class="products-filter__input"
          clearable
          :placeholder="
            $t('page.service.enterprise.products.filter.productNamePlaceholder')
          "
          @keyup.enter="emit('search')"
        />
      </el-form-item>

      <el-form-item
        class="products-filter__field"
        :label="$t('page.service.enterprise.products.filter.shelfStatus')"
      >
        <el-select
          v-model="shelfStatus"
          clearable
          class="products-filter__select"
          :placeholder="
            $t('page.service.enterprise.products.filter.shelfStatusAll')
          "
        >
          <el-option
            :label="$t('page.service.enterprise.products.shelf.on')"
            :value="String(PRODUCT_SHELF_ON)"
          />
          <el-option
            :label="$t('page.service.enterprise.products.shelf.off')"
            :value="String(PRODUCT_SHELF_OFF)"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="products-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.service.enterprise.products.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.service.enterprise.products.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.products-filter {
  margin-bottom: 18px;

  &__form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;
    align-items: center;
  }

  &__field {
    margin-right: 0;
    margin-bottom: 0;

    :deep(.el-form-item__label) {
      display: inline-flex;
      align-items: center;
      height: 32px;
      padding-right: 8px;
      line-height: 32px;
    }

    :deep(.el-form-item__content) {
      display: inline-flex;
      align-items: center;
    }
  }

  &__input {
    width: 200px;
  }

  &__select {
    width: 160px;
  }

  &__actions {
    margin-right: 0;
    margin-bottom: 0;
    margin-left: auto;

    :deep(.el-form-item__content) {
      display: inline-flex;
      gap: 10px;
      align-items: center;
    }
  }
}

@media (max-width: 768px) {
  .products-filter {
    &__input,
    &__select {
      width: 100%;
    }

    &__field {
      width: 100%;
    }

    &__actions {
      width: 100%;
      margin-left: 0;

      :deep(.el-form-item__content) {
        display: flex;
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style>
