<script lang="ts" setup>
import type {
  PortalContentAuditStatusFilter,
  PortalContentEnableStatusFilter,
} from '../data';

import { $t } from '@vben/locales';

import { InfoFilled, Search } from '@element-plus/icons-vue';

defineOptions({ name: 'PortalContentFilterBar' });

defineProps<{
  /** 关键词占位符 i18n 键（相对 page.monitoring.content.home） */
  keywordPlaceholderKey: string;
  /** 刷新 loading */
  loading?: boolean;
  /** 是否展示启用 / 审核状态筛选 */
  showStatusFilters?: boolean;
}>();
const emit = defineEmits<{
  /** 重置 */
  reset: [];
  /** 查询 */
  search: [];
}>();
/** 关键词 */
const keyword = defineModel<string>('keyword', { default: '' });
/** 启用状态（空为全部） */
const enableStatus = defineModel<PortalContentEnableStatusFilter>('enableStatus', {
  default: '',
});
/** 审核状态（空为全部） */
const auditStatus = defineModel<PortalContentAuditStatusFilter>('auditStatus', {
  default: '',
});

/**
 * 回车触发查询
 */
function handleEnter() {
  emit('search');
}
</script>

<template>
  <el-card class="content-filter" shadow="never">
    <el-form class="content-filter__form" @submit.prevent>
      <el-form-item
        class="content-filter__field"
        :label="$t('page.monitoring.content.home.common.filter.keyword')"
      >
        <el-input
          v-model="keyword"
          clearable
          class="content-filter__keyword"
          :placeholder="$t(keywordPlaceholderKey)"
          @keyup.enter="handleEnter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item
        v-if="showStatusFilters"
        class="content-filter__field"
        :label="$t('page.monitoring.content.home.common.filter.enableStatus')"
      >
        <el-select
          v-model="enableStatus"
          clearable
          class="content-filter__select"
          :placeholder="$t('page.monitoring.content.home.common.filter.statusAll')"
        >
          <el-option
            :label="$t('page.monitoring.content.home.common.status.enabled')"
            value="1"
          />
          <el-option
            :label="$t('page.monitoring.content.home.common.status.disabled')"
            value="0"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="showStatusFilters"
        class="content-filter__field"
        :label="$t('page.monitoring.content.home.common.filter.auditStatus')"
      >
        <el-select
          v-model="auditStatus"
          clearable
          class="content-filter__select"
          :placeholder="$t('page.monitoring.content.home.common.filter.auditAll')"
        >
          <el-option
            :label="$t('page.monitoring.content.home.common.audit.pending')"
            value="0"
          />
          <el-option
            :label="$t('page.monitoring.content.home.common.audit.passed')"
            value="1"
          />
          <el-option
            :label="$t('page.monitoring.content.home.common.audit.rejected')"
            value="2"
          />
        </el-select>
      </el-form-item>

      <p class="content-filter__scope-hint">
        <el-icon class="content-filter__scope-icon"><InfoFilled /></el-icon>
        <span>{{ $t('page.monitoring.content.home.common.filter.scopeHint') }}</span>
      </p>

      <el-form-item class="content-filter__actions">
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
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.content-filter {
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

  &__keyword {
    width: 240px;
  }

  &__select {
    width: 140px;
  }

  &__scope-hint {
    display: inline-flex;
    flex: 1;
    gap: 6px;
    align-items: center;
    min-width: 160px;
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }

  &__scope-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--el-color-info);
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
  .content-filter {
    &__keyword,
    &__select {
      width: 100%;
    }

    &__field {
      width: 100%;
    }

    &__scope-hint {
      flex: 1 1 100%;
      min-width: 0;
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
