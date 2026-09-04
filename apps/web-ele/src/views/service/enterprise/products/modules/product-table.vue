<script lang="ts" setup>
import type { SupplyProductItem } from '#/types/service/enterprise/products';

import { $t } from '@vben/locales';

import {
  displayProductValue,
  formatProductDateTime,
  getProductResourceI18nKey,
  getProductResourceTagType,
  getProductShelfI18nKey,
  getProductShelfTagType,
  isProductOnShelf,
} from '../data';

defineOptions({ name: 'EnterpriseProductsTable' });

defineProps<{
  /** 加载中 */
  loading?: boolean;
  /** 正在监测资源状态的产品 ID */
  monitoringId?: null | number;
  /** 列表数据 */
  products: SupplyProductItem[];
  /** 正在上下架的产品 ID */
  shelvingId?: null | number;
}>();

const emit = defineEmits<{
  /** 删除（Popconfirm 确认后） */
  delete: [row: SupplyProductItem];
  /** 编辑 */
  edit: [row: SupplyProductItem];
  /** 刷新资源状态 */
  monitor: [row: SupplyProductItem];
  /** 上架 / 下架（Popconfirm 确认后） */
  shelf: [row: SupplyProductItem];
}>();
</script>

<template>
  <el-card class="products-table" shadow="never">
    <el-table
      v-loading="loading"
      class="products-table__inner"
      :data="products"
      stripe
      :empty-text="$t('page.service.enterprise.products.empty')"
    >
      <el-table-column
        :label="$t('page.service.enterprise.products.fields.productName')"
        min-width="140"
        prop="productName"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayProductValue(
              row.productName,
              $t('page.service.enterprise.products.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.enterprise.products.fields.description')"
        min-width="360"
        prop="description"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayProductValue(
              row.description,
              $t('page.service.enterprise.products.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.service.enterprise.products.fields.shelfStatus')"
        width="100"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getProductShelfTagType(row.shelfStatus)"
          >
            {{
              $t(
                `page.service.enterprise.products.shelf.${getProductShelfI18nKey(row.shelfStatus)}`,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.service.enterprise.products.fields.resourceStatus')"
        width="100"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getProductResourceTagType(row.resourceStatus)"
          >
            {{
              $t(
                `page.service.enterprise.products.resource.${getProductResourceI18nKey(row.resourceStatus)}`,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.enterprise.products.fields.createTime')"
        width="168"
        prop="createTime"
      >
        <template #default="{ row }">
          {{
            formatProductDateTime(row.createTime) ||
            $t('page.service.enterprise.products.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.enterprise.products.fields.updateTime')"
        width="168"
        prop="updateTime"
      >
        <template #default="{ row }">
          {{
            formatProductDateTime(row.updateTime) ||
            $t('page.service.enterprise.products.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        fixed="right"
        :label="$t('page.service.enterprise.products.fields.actions')"
        width="260"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="emit('edit', row)">
            {{ $t('page.service.enterprise.products.actions.edit') }}
          </el-button>
          <el-popconfirm
            width="240"
            :cancel-button-text="
              $t('page.service.enterprise.products.shelfAction.cancelBtn')
            "
            :confirm-button-text="
              $t('page.service.enterprise.products.shelfAction.confirmBtn')
            "
            :title="
              $t(
                isProductOnShelf(row.shelfStatus)
                  ? 'page.service.enterprise.products.shelfAction.unshelfConfirm'
                  : 'page.service.enterprise.products.shelfAction.shelfConfirm',
                [
                  row.productName?.trim() ||
                    String(row.supplyProductId ?? '') ||
                    $t('page.service.enterprise.products.valueEmpty'),
                ],
              )
            "
            @confirm="emit('shelf', row)"
          >
            <template #reference>
              <el-button
                link
                type="primary"
                :loading="shelvingId === row.supplyProductId"
              >
                {{
                  isProductOnShelf(row.shelfStatus)
                    ? $t('page.service.enterprise.products.actions.unshelf')
                    : $t('page.service.enterprise.products.actions.shelf')
                }}
              </el-button>
            </template>
          </el-popconfirm>
          <el-button
            link
            type="primary"
            :loading="monitoringId === row.supplyProductId"
            @click="emit('monitor', row)"
          >
            {{ $t('page.service.enterprise.products.actions.monitor') }}
          </el-button>
          <el-popconfirm
            width="240"
            confirm-button-type="danger"
            :cancel-button-text="
              $t('page.service.enterprise.products.delete.cancelBtn')
            "
            :confirm-button-text="
              $t('page.service.enterprise.products.delete.confirmBtn')
            "
            :title="
              $t('page.service.enterprise.products.delete.confirm', [
                row.productName?.trim() ||
                  String(row.supplyProductId ?? '') ||
                  $t('page.service.enterprise.products.valueEmpty'),
              ])
            "
            @confirm="emit('delete', row)"
          >
            <template #reference>
              <el-button link type="danger">
                {{ $t('page.service.enterprise.products.actions.delete') }}
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.products-table {
  &__inner {
    width: 100%;
  }

  :deep(.el-card__body) {
    padding: 0;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: hsl(var(--muted) / 35%);
  }
}
</style>
