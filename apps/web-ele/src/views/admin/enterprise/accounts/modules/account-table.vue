<script lang="ts" setup>
import type { SubAccountItem } from '#/types/admin/enterprise/accounts';

import { $t } from '@vben/locales';

import {
  displaySubAccountValue,
  formatSubAccountDateTime,
  formatSubAccountExpireDate,
  getSubAccountStatusI18nKey,
  getSubAccountStatusTagType,
  isSubAccountExpired,
} from '../data';

defineOptions({ name: 'AdminEnterpriseAccountsTable' });

defineProps<{
  /** 列表数据 */
  accounts: SubAccountItem[];
  /** 加载中 */
  loading?: boolean;
}>();

const emit = defineEmits<{
  /** 删除 */
  delete: [row: SubAccountItem];
  /** 编辑 */
  edit: [row: SubAccountItem];
  /** 分配权限 */
  permission: [row: SubAccountItem];
  /** 重置密码 */
  resetPassword: [row: SubAccountItem];
}>();
</script>

<template>
  <el-card class="accounts-table" shadow="never">
    <el-table
      v-loading="loading"
      class="accounts-table__inner"
      :data="accounts"
      stripe
      :empty-text="$t('page.admin.enterprise.accounts.empty')"
    >
      <el-table-column
        :label="$t('page.admin.enterprise.accounts.fields.username')"
        min-width="120"
        prop="username"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displaySubAccountValue(
              row.username,
              $t('page.admin.enterprise.accounts.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.admin.enterprise.accounts.fields.realName')"
        min-width="110"
        prop="realName"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displaySubAccountValue(
              row.realName,
              $t('page.admin.enterprise.accounts.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.admin.enterprise.accounts.fields.department')"
        min-width="120"
        prop="department"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displaySubAccountValue(
              row.department,
              $t('page.admin.enterprise.accounts.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.admin.enterprise.accounts.fields.phone')"
        min-width="120"
        prop="phone"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displaySubAccountValue(
              row.phone,
              $t('page.admin.enterprise.accounts.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.admin.enterprise.accounts.fields.status')"
        min-width="100"
        prop="status"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getSubAccountStatusTagType(row.status)"
          >
            {{
              $t(
                `page.admin.enterprise.accounts.status.${getSubAccountStatusI18nKey(row.status)}`,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.admin.enterprise.accounts.fields.expireDate')"
        min-width="130"
        prop="expireDate"
      >
        <template #default="{ row }">
          <div class="accounts-table__expire">
            <span>
              {{
                displaySubAccountValue(
                  formatSubAccountExpireDate(row.expireDate),
                  $t('page.admin.enterprise.accounts.valueEmpty'),
                )
              }}
            </span>
            <el-tag
              v-if="isSubAccountExpired(row.expireDate)"
              effect="plain"
              round
              size="small"
              type="danger"
            >
              {{ $t('page.admin.enterprise.accounts.expired') }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.admin.enterprise.accounts.fields.createTime')"
        min-width="150"
        prop="createTime"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displaySubAccountValue(
              formatSubAccountDateTime(row.createTime),
              $t('page.admin.enterprise.accounts.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        fixed="right"
        :label="$t('page.admin.enterprise.accounts.fields.actions')"
        min-width="280"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="emit('edit', row)">
            {{ $t('page.admin.enterprise.accounts.actions.edit') }}
          </el-button>
          <el-button link type="primary" @click="emit('permission', row)">
            {{ $t('page.admin.enterprise.accounts.actions.permission') }}
          </el-button>
          <el-button link type="primary" @click="emit('resetPassword', row)">
            {{ $t('page.admin.enterprise.accounts.actions.resetPassword') }}
          </el-button>
          <el-popconfirm
            width="260"
            confirm-button-type="danger"
            :cancel-button-text="
              $t('page.admin.enterprise.accounts.delete.cancelBtn')
            "
            :confirm-button-text="
              $t('page.admin.enterprise.accounts.delete.confirmBtn')
            "
            :title="
              $t('page.admin.enterprise.accounts.delete.confirm', [
                row.username?.trim() ||
                  row.realName?.trim() ||
                  String(row.subAccountId ?? '') ||
                  $t('page.admin.enterprise.accounts.valueEmpty'),
              ])
            "
            @confirm="emit('delete', row)"
          >
            <template #reference>
              <el-button link type="danger">
                {{ $t('page.admin.enterprise.accounts.actions.delete') }}
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.accounts-table {
  &__inner {
    width: 100%;
  }

  &__expire {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
}
</style>
