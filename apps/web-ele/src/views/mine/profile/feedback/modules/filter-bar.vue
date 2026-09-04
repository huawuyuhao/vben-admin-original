<script lang="ts" setup>
import { $t } from '@vben/locales';

import {
  FEEDBACK_STATUS_DONE,
  FEEDBACK_STATUS_PENDING,
  FEEDBACK_STATUS_PROCESSING,
  type FeedbackStatusFilter,
} from '../data';

defineOptions({ name: 'MineProfileFeedbackFilterBar' });

const emit = defineEmits<{
  /** 重置筛选 */
  reset: [];
  /** 点击查询 */
  search: [];
}>();

/** 处理状态 */
const status = defineModel<FeedbackStatusFilter>('status', { default: '' });

</script>

<template>
  <el-card class="feedback-filter" shadow="never">
    <el-form class="feedback-filter__form" @submit.prevent>
      <el-form-item
        class="feedback-filter__field"
        :label="$t('page.mine.feedback.filter.status')"
      >
        <el-select
          v-model="status"
          class="feedback-filter__select"
          clearable
          :placeholder="$t('page.mine.feedback.filter.statusAll')"
        >
          <el-option
            :label="$t('page.mine.feedback.status.pending')"
            :value="String(FEEDBACK_STATUS_PENDING)"
          />
          <el-option
            :label="$t('page.mine.feedback.status.processing')"
            :value="String(FEEDBACK_STATUS_PROCESSING)"
          />
          <el-option
            :label="$t('page.mine.feedback.status.done')"
            :value="String(FEEDBACK_STATUS_DONE)"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="feedback-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.mine.feedback.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.mine.feedback.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.feedback-filter {
  margin-bottom: 18px;

  &__form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;
    align-items: center;
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
  }

  &__select {
    width: 160px;
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
}

@media (max-width: 768px) {
  .feedback-filter {
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
