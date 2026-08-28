<script lang="ts" setup>
import type { FeedbackItem } from '#/types/mine/profile/feedback';

import { computed, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  displayFeedbackValue,
  formatFeedbackDateTime,
  getFeedbackStatusI18nKey,
  getFeedbackStatusTagType,
  parseFeedbackImageUrls,
} from '../data';

defineOptions({ name: 'MineProfileFeedbackDetailDrawer' });

/** 抽屉可见 */
const visible = ref(false);
/** 当前详情 */
const current = ref<FeedbackItem | null>(null);

/** 图片列表 */
const imageUrls = computed(() => parseFeedbackImageUrls(current.value?.images));

/**
 * 打开详情抽屉
 * @param row 列表行
 */
function open(row: FeedbackItem) {
  current.value = row;
  visible.value = true;
}

/**
 * 关闭抽屉
 */
function handleClose() {
  visible.value = false;
}

defineExpose({ open });
</script>

<template>
  <el-drawer
    v-model="visible"
    class="feedback-detail-drawer"
    destroy-on-close
    size="460px"
    :title="$t('page.mine.feedback.detail.title')"
    @closed="current = null"
  >
    <template v-if="current">
      <div class="feedback-detail-drawer__block">
        <p class="feedback-detail-drawer__label">
          {{ $t('page.mine.feedback.fields.feedbackId') }}
        </p>
        <p class="feedback-detail-drawer__value">
          {{
            displayFeedbackValue(
              current.feedbackId,
              $t('page.mine.feedback.valueEmpty'),
            )
          }}
        </p>
      </div>

      <div class="feedback-detail-drawer__block">
        <p class="feedback-detail-drawer__label">
          {{ $t('page.mine.feedback.fields.status') }}
        </p>
        <el-tag
          effect="light"
          round
          size="small"
          :type="getFeedbackStatusTagType(current.status)"
        >
          {{
            $t(
              `page.mine.feedback.status.${getFeedbackStatusI18nKey(current.status)}`,
            )
          }}
        </el-tag>
      </div>

      <div class="feedback-detail-drawer__block">
        <p class="feedback-detail-drawer__label">
          {{ $t('page.mine.feedback.fields.content') }}
        </p>
        <p
          class="feedback-detail-drawer__value feedback-detail-drawer__value--wrap"
        >
          {{
            displayFeedbackValue(
              current.content,
              $t('page.mine.feedback.valueEmpty'),
            )
          }}
        </p>
      </div>

      <div class="feedback-detail-drawer__block">
        <p class="feedback-detail-drawer__label">
          {{ $t('page.mine.feedback.fields.images') }}
        </p>
        <div v-if="imageUrls.length > 0" class="feedback-detail-drawer__images">
          <el-image
            v-for="(url, index) in imageUrls"
            :key="`${current.feedbackId}-detail-${index}`"
            class="feedback-detail-drawer__thumb"
            fit="cover"
            :initial-index="index"
            lazy
            :preview-src-list="imageUrls"
            preview-teleported
            :src="url"
          />
        </div>
        <p v-else class="feedback-detail-drawer__value">
          {{ $t('page.mine.feedback.valueEmpty') }}
        </p>
      </div>

      <div class="feedback-detail-drawer__block">
        <p class="feedback-detail-drawer__label">
          {{ $t('page.mine.feedback.fields.replyContent') }}
        </p>
        <p
          class="feedback-detail-drawer__value feedback-detail-drawer__value--wrap"
        >
          {{
            displayFeedbackValue(
              current.replyContent,
              $t('page.mine.feedback.valueEmpty'),
            )
          }}
        </p>
      </div>

      <div class="feedback-detail-drawer__block">
        <p class="feedback-detail-drawer__label">
          {{ $t('page.mine.feedback.fields.replyTime') }}
        </p>
        <p class="feedback-detail-drawer__value">
          {{
            formatFeedbackDateTime(current.replyTime) ||
            $t('page.mine.feedback.valueEmpty')
          }}
        </p>
      </div>

      <div class="feedback-detail-drawer__block">
        <p class="feedback-detail-drawer__label">
          {{ $t('page.mine.feedback.fields.createTime') }}
        </p>
        <p class="feedback-detail-drawer__value">
          {{
            formatFeedbackDateTime(current.createTime) ||
            $t('page.mine.feedback.valueEmpty')
          }}
        </p>
      </div>
    </template>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.mine.feedback.detail.close') }}
      </el-button>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
.feedback-detail-drawer {
  &__block {
    margin-bottom: 18px;
  }

  &__label {
    margin: 0 0 8px;
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  &__value {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: hsl(var(--foreground));
    word-break: break-word;

    &--wrap {
      white-space: pre-wrap;
    }
  }

  &__images {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__thumb {
    display: block;
    width: 140px;
    height: 80px;
    overflow: hidden;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    cursor: zoom-in;

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
