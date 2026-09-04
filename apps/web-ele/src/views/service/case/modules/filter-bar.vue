<script lang="ts" setup>
import { $t } from '@vben/locales';

import { InfoFilled, Search } from '@element-plus/icons-vue';

import {
  CASE_TYPE_GENERAL,
  CASE_TYPE_SMART,
  type CaseTypeFilter,
} from '../data';

defineOptions({ name: 'ServiceCaseFilterBar' });

const emit = defineEmits<{
  /** 重置筛选 */
  reset: [];
  /** 点击查询 */
  search: [];
}>();
/** 标签名称（与父级 v-model:tagName 同步，走接口） */
const tagName = defineModel<string>('tagName', { default: '' });
/** 案例类型（与父级 v-model:caseType 同步，前端筛当前页） */
const caseType = defineModel<CaseTypeFilter>('caseType', { default: '' });

/**
 * 回车触发搜索
 */
function handleEnter() {
  emit('search');
}
</script>

<template>
  <el-card class="case-filter" shadow="never">
    <el-form class="case-filter__form" @submit.prevent>
      <el-form-item
        class="case-filter__field"
        :label="$t('page.service.case.filter.tagName')"
      >
        <el-input
          v-model="tagName"
          class="case-filter__tag"
          clearable
          :placeholder="$t('page.service.case.searchPlaceholder')"
          @keyup.enter="handleEnter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item
        class="case-filter__field"
        :label="$t('page.service.case.filter.caseType')"
      >
        <el-select
          v-model="caseType"
          clearable
          class="case-filter__select"
          :placeholder="$t('page.service.case.filter.typeAll')"
        >
          <el-option
            :label="$t('page.service.case.type.general')"
            :value="String(CASE_TYPE_GENERAL)"
          />
          <el-option
            :label="$t('page.service.case.type.smart')"
            :value="String(CASE_TYPE_SMART)"
          />
        </el-select>
      </el-form-item>

      <p class="case-filter__scope-hint">
        <el-icon class="case-filter__scope-icon"><InfoFilled /></el-icon>
        <span>{{ $t('page.service.case.filter.scopeHint') }}</span>
      </p>

      <el-form-item class="case-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.service.case.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.service.case.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.case-filter {
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

  &__tag {
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
  .case-filter {
    &__tag,
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
