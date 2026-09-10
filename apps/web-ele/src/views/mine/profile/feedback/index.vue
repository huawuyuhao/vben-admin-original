<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FeedbackItem } from '#/types/mine/profile/feedback';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Plus } from '@element-plus/icons-vue';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getFeedbackListApi } from '#/api/mine/profile/feedback';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  FEEDBACK_LIST_THUMB_VISIBLE,
  FEEDBACK_PAGE_SIZE,
  FEEDBACK_PAGE_SIZE_OPTIONS,
  type FeedbackStatusFilter,
  getFeedbackStatusI18nKey,
  getFeedbackStatusTagType,
  normalizeFeedbackPage,
  parseFeedbackImageUrls,
  parseFeedbackStatusFilter,
  useFeedbackColumns,
  useFeedbackGridFormSchema,
} from './data';
import DetailDrawer from './modules/detail-drawer.vue';
import SubmitDialog from './modules/submit-dialog.vue';

/**
 * 我的 · 意见反馈
 * 列表统一使用 useVbenVxeGrid（查询栏 / 分页 / 工具栏）
 */
defineOptions({ name: 'MineProfileFeedback' });

/** 提交弹窗 */
const submitDialogRef = ref<InstanceType<typeof SubmitDialog>>();
/** 详情抽屉 */
const detailDrawerRef = ref<InstanceType<typeof DetailDrawer>>();

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  formOptions: {
    schema: useFeedbackGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useFeedbackColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: FEEDBACK_PAGE_SIZE,
      pageSizes: FEEDBACK_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const data = await getFeedbackListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            status: parseFeedbackStatusFilter(
              formValues?.status as FeedbackStatusFilter | undefined,
            ),
          });
          return toVxePageResult(normalizeFeedbackPage(data));
        },
      },
    },
    rowConfig: {
      keyField: 'feedbackId',
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<FeedbackItem>,
});

/**
 * 打开提交弹窗
 */
function handleCreate() {
  submitDialogRef.value?.open();
}

/**
 * 打开详情抽屉
 * @param row 列表行
 */
function handleDetail(row: FeedbackItem) {
  detailDrawerRef.value?.open(row);
}

/**
 * 提交成功后回到第一页并刷新
 */
function handleSubmitSuccess() {
  gridApi.reload();
}

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
  <PageListShell
    :desc="$t('page.mine.feedback.desc')"
    :eyebrow="$t('page.mine.feedback.eyebrow')"
    :title="$t('page.mine.feedback.title')"
  >
    <template #actions>
      <el-button
        class="mine-shell__action-btn"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('page.mine.feedback.add') }}
      </el-button>
    </template>

    <Grid>
      <template #table-title></template>

      <template #images="{ row }">
        <div
          v-if="getRowImages(row).length > 0"
          class="feedback-grid__images"
        >
          <el-image
            v-for="(url, index) in getRowImages(row).slice(
              0,
              FEEDBACK_LIST_THUMB_VISIBLE,
            )"
            :key="`${row.feedbackId}-${index}`"
            class="feedback-grid__thumb"
            fit="cover"
            :initial-index="index"
            lazy
            :preview-src-list="getRowImages(row)"
            preview-teleported
            :src="url"
          />
          <span
            v-if="getRowImages(row).length > FEEDBACK_LIST_THUMB_VISIBLE"
            class="feedback-grid__more"
          >
            +{{ getRowImages(row).length - FEEDBACK_LIST_THUMB_VISIBLE }}
          </span>
        </div>
        <span v-else class="feedback-grid__placeholder">
          {{ $t('page.mine.feedback.valueEmpty') }}
        </span>
      </template>

      <template #status="{ row }">
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

      <template #action="{ row }">
        <el-button link type="primary" @click="handleDetail(row)">
          {{ $t('page.mine.feedback.actions.detail') }}
        </el-button>
      </template>
    </Grid>
  </PageListShell>

  <SubmitDialog ref="submitDialogRef" @success="handleSubmitSuccess" />
  <DetailDrawer ref="detailDrawerRef" />
</template>

<style lang="scss" scoped>
.feedback-grid {
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
    cursor: zoom-in;
    border-radius: 6px;

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
    background: hsl(var(--primary) / 8%);
    border-radius: 6px;
  }

  &__placeholder {
    color: hsl(var(--muted-foreground));
  }
}
</style>
