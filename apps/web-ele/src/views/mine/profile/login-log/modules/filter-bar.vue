<script lang="ts" setup>
import { ref } from 'vue';

import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

import {
  LOGIN_LOG_STATUS_FAIL,
  LOGIN_LOG_STATUS_SUCCESS,
  type LoginLogStatusFilter,
  type LoginLogTimeRange,
} from '../data';

defineOptions({ name: 'MineProfileLoginLogFilterBar' });

/** 用户账号 */
const userName = defineModel<string>('userName', { default: '' });
/** 登录 IP */
const ipaddr = defineModel<string>('ipaddr', { default: '' });
/** 登录地点 */
const loginLocation = defineModel<string>('loginLocation', { default: '' });
/** 登录状态 */
const status = defineModel<LoginLogStatusFilter>('status', { default: '' });
/** 访问时间范围 */
const loginTimeRange = defineModel<LoginLogTimeRange>('loginTimeRange', {
  default: null,
});

const emit = defineEmits<{
  /** 重置筛选 */
  reset: [];
  /** 点击查询 */
  search: [];
}>();

/** 是否展开更多筛选（默认收起，仅展示常用项） */
const expanded = ref(false);

/**
 * 切换筛选栏展开 / 收起
 */
function toggleExpand() {
  expanded.value = !expanded.value;
}
</script>

<template>
  <el-card class="login-log-filter" shadow="never">
    <el-form class="login-log-filter__form" @submit.prevent>
      <div class="login-log-filter__row">
        <el-form-item
          class="login-log-filter__field"
          :label="$t('page.mine.loginLog.filter.userName')"
        >
          <el-input
            v-model="userName"
            class="login-log-filter__input"
            clearable
            :placeholder="$t('page.mine.loginLog.filter.userNamePlaceholder')"
          />
        </el-form-item>

        <el-form-item
          class="login-log-filter__field"
          :label="$t('page.mine.loginLog.filter.ipaddr')"
        >
          <el-input
            v-model="ipaddr"
            class="login-log-filter__input"
            clearable
            :placeholder="$t('page.mine.loginLog.filter.ipaddrPlaceholder')"
          />
        </el-form-item>

        <el-form-item
          class="login-log-filter__field"
          :label="$t('page.mine.loginLog.filter.status')"
        >
          <el-select
            v-model="status"
            class="login-log-filter__select"
            clearable
            :placeholder="$t('page.mine.loginLog.filter.statusAll')"
          >
            <el-option
              :label="$t('page.mine.loginLog.status.success')"
              :value="LOGIN_LOG_STATUS_SUCCESS"
            />
            <el-option
              :label="$t('page.mine.loginLog.status.fail')"
              :value="LOGIN_LOG_STATUS_FAIL"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="login-log-filter__actions">
          <el-button
            class="mine-shell__action-btn"
            type="primary"
            @click="emit('search')"
          >
            {{ $t('page.mine.loginLog.search') }}
          </el-button>
          <el-button class="mine-shell__action-btn" @click="emit('reset')">
            {{ $t('page.mine.loginLog.reset') }}
          </el-button>
          <el-button
            class="mine-shell__action-btn login-log-filter__expand"
            link
            type="primary"
            @click="toggleExpand"
          >
            {{
              expanded
                ? $t('page.mine.loginLog.collapse')
                : $t('page.mine.loginLog.expand')
            }}
            <el-icon class="login-log-filter__expand-icon">
              <ArrowUp v-if="expanded" />
              <ArrowDown v-else />
            </el-icon>
          </el-button>
        </el-form-item>
      </div>

      <div
        class="login-log-filter__extra"
        :class="{ 'is-expanded': expanded }"
      >
        <div class="login-log-filter__extra-inner">
          <div class="login-log-filter__row login-log-filter__row--extra">
            <el-form-item
              class="login-log-filter__field"
              :label="$t('page.mine.loginLog.filter.loginLocation')"
            >
              <el-input
                v-model="loginLocation"
                class="login-log-filter__input"
                clearable
                :placeholder="
                  $t('page.mine.loginLog.filter.loginLocationPlaceholder')
                "
              />
            </el-form-item>

            <el-form-item
              class="login-log-filter__field login-log-filter__field--range"
              :label="$t('page.mine.loginLog.filter.loginTime')"
            >
              <el-date-picker
                v-model="loginTimeRange"
                class="login-log-filter__range"
                clearable
                :end-placeholder="$t('page.mine.loginLog.filter.loginTimeEnd')"
                format="YYYY-MM-DD HH:mm:ss"
                range-separator="-"
                :start-placeholder="
                  $t('page.mine.loginLog.filter.loginTimeStart')
                "
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.login-log-filter {
  margin-bottom: 18px;

  &__form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;
    align-items: center;

    &--extra {
      padding-top: 4px;
    }
  }

  &__extra {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.28s ease;

    &.is-expanded {
      grid-template-rows: 1fr;
    }
  }

  &__extra-inner {
    overflow: hidden;
    min-height: 0;
  }

  &__field {
    margin-right: 0;
    margin-bottom: 8px;

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

    &--range {
      :deep(.el-form-item__content) {
        width: auto;
      }
    }
  }

  &__input {
    width: 160px;
  }

  &__select {
    width: 140px;
  }

  &__range {
    width: 360px;
    max-width: 100%;
  }

  &__actions {
    margin-right: 0;
    margin-bottom: 8px;
    margin-left: auto;

    :deep(.el-form-item__content) {
      display: inline-flex;
      gap: 10px;
      align-items: center;
    }
  }

  &__expand {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  &__expand-icon {
    margin-left: 2px;
  }
}

@media (max-width: 768px) {
  .login-log-filter {
    &__input,
    &__select,
    &__range {
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
        flex-wrap: wrap;
        width: 100%;

        .el-button:not(.login-log-filter__expand) {
          flex: 1;
        }

        .login-log-filter__expand {
          flex: 0 0 100%;
          justify-content: center;
        }
      }
    }
  }
}
</style>
