<script lang="ts" setup>
import type { LoginLogItem } from '#/types/mine/profile/login-log';

import { $t } from '@vben/locales';

import {
  displayLoginLogValue,
  formatLoginLogDateTime,
  getLoginLogStatusI18nKey,
  getLoginLogStatusTagType,
} from '../data';

defineOptions({ name: 'MineProfileLoginLogTable' });

defineProps<{
  /** 加载中 */
  loading?: boolean;
  /** 列表数据 */
  records: LoginLogItem[];
}>();
</script>

<template>
  <el-card class="login-log-table" shadow="never">
    <el-table
      v-loading="loading"
      class="login-log-table__inner"
      :data="records"
      stripe
      :empty-text="$t('page.mine.loginLog.empty')"
    >
      <el-table-column
        :label="$t('page.mine.loginLog.fields.infoId')"
        min-width="90"
        prop="infoId"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayLoginLogValue(
              row.infoId,
              $t('page.mine.loginLog.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.loginLog.fields.userName')"
        min-width="120"
        prop="userName"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayLoginLogValue(
              row.userName,
              $t('page.mine.loginLog.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.loginLog.fields.ipaddr')"
        min-width="130"
        prop="ipaddr"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayLoginLogValue(
              row.ipaddr,
              $t('page.mine.loginLog.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.loginLog.fields.loginLocation')"
        min-width="130"
        prop="loginLocation"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayLoginLogValue(
              row.loginLocation,
              $t('page.mine.loginLog.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.loginLog.fields.browser')"
        min-width="110"
        prop="browser"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayLoginLogValue(
              row.browser,
              $t('page.mine.loginLog.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.loginLog.fields.os')"
        min-width="110"
        prop="os"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayLoginLogValue(row.os, $t('page.mine.loginLog.valueEmpty'))
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.mine.loginLog.fields.status')"
        min-width="100"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getLoginLogStatusTagType(row.status)"
          >
            {{
              $t(
                `page.mine.loginLog.status.${getLoginLogStatusI18nKey(row.status)}`,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.loginLog.fields.msg')"
        min-width="140"
        prop="msg"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayLoginLogValue(row.msg, $t('page.mine.loginLog.valueEmpty'))
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.loginLog.fields.loginTime')"
        min-width="170"
        prop="loginTime"
      >
        <template #default="{ row }">
          {{
            formatLoginLogDateTime(row.loginTime) ||
            $t('page.mine.loginLog.valueEmpty')
          }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.login-log-table {
  &__inner {
    width: 100%;
  }

  :deep(.el-card__body) {
    padding: 0;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: hsl(var(--muted) / 0.35);
  }
}
</style>
