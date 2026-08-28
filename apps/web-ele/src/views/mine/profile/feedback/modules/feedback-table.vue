<script lang="ts" setup>
import type { FeedbackItem } from '#/types/mine/profile/feedback';

import { $t } from '@vben/locales';

import {
  displayFeedbackValue,
  formatFeedbackDateTime,
  getFeedbackStatusI18nKey,
  getFeedbackStatusTagType,
  parseFeedbackImageUrls,
} from '../data';

defineOptions({ name: 'MineProfileFeedbackTable' });

defineProps<{
  /** 加载中 */
  loading?: boolean;
  /** 列表数据 */
  records: FeedbackItem[];
}>();

const emit = defineEmits<{
  /** 查看详情 */
  detail: [row: FeedbackItem];
}>();

/** 列表缩略图最多展示张数，超出显示 +N */
const LIST_THUMB_VISIBLE = 3;

/**
 * 解析行内图片 URL 列表
 * @param row 列表行
 * @returns 可预览地址
 */
function getRowImages(row: FeedbackItem): string[] {
  return parseFeedbackImageUrls(row.images);
}
</script>

<template>
  <el-card class="feedback-table" shadow="never">
    <el-table
      v-loading="loading"
      class="feedback-table__inner"
      :data="records"
      stripe
      :empty-text="$t('page.mine.feedback.empty')"
    >
      <el-table-column
        :label="$t('page.mine.feedback.fields.feedbackId')"
        min-width="90"
        prop="feedbackId"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayFeedbackValue(
              row.feedbackId,
              $t('page.mine.feedback.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.feedback.fields.content')"
        min-width="180"
        prop="content"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayFeedbackValue(
              row.content,
              $t('page.mine.feedback.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        header-align="center"
        :label="$t('page.mine.feedback.fields.images')"
        min-width="280"
      >
        <template #default="{ row }">
          <div
            v-if="getRowImages(row).length > 0"
            class="feedback-table__images"
          >
            <el-image
              v-for="(url, index) in getRowImages(row).slice(
                0,
                LIST_THUMB_VISIBLE,
              )"
              :key="`${row.feedbackId}-${index}`"
              class="feedback-table__thumb"
              fit="cover"
              :initial-index="index"
              lazy
              :preview-src-list="getRowImages(row)"
              preview-teleported
              :src="url"
            />
            <span
              v-if="getRowImages(row).length > LIST_THUMB_VISIBLE"
              class="feedback-table__more"
            >
              +{{ getRowImages(row).length - LIST_THUMB_VISIBLE }}
            </span>
          </div>
          <span v-else class="feedback-table__placeholder">
            {{ $t('page.mine.feedback.valueEmpty') }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.mine.feedback.fields.status')"
        min-width="100"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getFeedbackStatusTagType(row.status)"
          >
            {{
              $t(
                `page.mine.feedback.status.${getFeedbackStatusI18nKey(row.status)}`,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.feedback.fields.replyContent')"
        min-width="160"
        prop="replyContent"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayFeedbackValue(
              row.replyContent,
              $t('page.mine.feedback.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.feedback.fields.replyTime')"
        min-width="170"
        prop="replyTime"
      >
        <template #default="{ row }">
          {{
            formatFeedbackDateTime(row.replyTime) ||
            $t('page.mine.feedback.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.feedback.fields.createTime')"
        min-width="170"
        prop="createTime"
      >
        <template #default="{ row }">
          {{
            formatFeedbackDateTime(row.createTime) ||
            $t('page.mine.feedback.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        fixed="right"
        :label="$t('page.mine.feedback.fields.actions')"
        min-width="100"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="emit('detail', row)">
            {{ $t('page.mine.feedback.actions.detail') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.feedback-table {
  &__inner {
    width: 100%;
  }

  &__images {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    padding: 6px 0;
  }

  &__thumb {
    display: block;
    width: 120px;
    height: 68px;
    overflow: hidden;
    border-radius: 6px;
    cursor: zoom-in;

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
    }
  }

  &__more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 68px;
    padding: 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.08);
    border-radius: 6px;
  }

  &__placeholder {
    color: hsl(var(--muted-foreground));
  }

  :deep(.el-card__body) {
    padding: 0;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: hsl(var(--muted) / 0.35);
  }
}
</style>
