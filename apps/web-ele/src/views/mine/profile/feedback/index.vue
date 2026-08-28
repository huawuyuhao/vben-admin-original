<script lang="ts" setup>
import type { FeedbackItem } from '#/types/mine/profile/feedback';

import { onMounted, ref, watch } from 'vue';

import { Plus, Refresh } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

import { getFeedbackListApi } from '#/api/mine/profile/feedback';

import {
  FEEDBACK_PAGE_SIZE,
  normalizeFeedbackPage,
  parseFeedbackStatusFilter,
  type FeedbackStatusFilter,
} from './data';
import DetailDrawer from './modules/detail-drawer.vue';
import FeedbackPager from './modules/feedback-pager.vue';
import FeedbackTable from './modules/feedback-table.vue';
import FilterBar from './modules/filter-bar.vue';
import SubmitDialog from './modules/submit-dialog.vue';

/**
 * 我的 · 意见反馈
 * 对接 GET /feedback/list、POST /feedback
 */
defineOptions({ name: 'MineProfileFeedback' });

/** 筛选草稿：处理状态 */
const filterStatus = ref<FeedbackStatusFilter>('');
/** 已生效筛选 */
const appliedStatus = ref<FeedbackStatusFilter>('');

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(FEEDBACK_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页记录 */
const records = ref<FeedbackItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);

/** 提交弹窗 */
const submitDialogRef = ref<InstanceType<typeof SubmitDialog>>();
/** 详情抽屉 */
const detailDrawerRef = ref<InstanceType<typeof DetailDrawer>>();

/**
 * 拉取当前页意见反馈
 */
async function fetchFeedbacks() {
  loading.value = true;
  try {
    const data = await getFeedbackListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: parseFeedbackStatusFilter(appliedStatus.value),
    });
    const page = normalizeFeedbackPage(data);
    records.value = page.records;
    total.value = page.total;

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    records.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 回到第一页并查询
 */
function queryFromFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchFeedbacks();
}

/**
 * 提交查询
 */
function handleSearch() {
  appliedStatus.value = filterStatus.value;
  queryFromFirstPage();
}

/**
 * 重置筛选并查询
 */
function handleReset() {
  filterStatus.value = '';
  appliedStatus.value = '';
  queryFromFirstPage();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  void fetchFeedbacks();
}

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
 * 提交成功后刷新列表
 */
function handleSubmitSuccess() {
  queryFromFirstPage();
}

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchFeedbacks();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchFeedbacks();
});

onMounted(() => {
  void fetchFeedbacks();
});
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div class="mine-shell__inner">
        <header class="mine-shell__head">
          <div>
            <p class="mine-shell__eyebrow">
              {{ $t('page.mine.feedback.eyebrow') }}
            </p>
            <h2>{{ $t('page.mine.feedback.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.mine.feedback.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.mine.feedback.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              {{ $t('page.mine.feedback.add') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:status="filterStatus"
          @search="handleSearch"
          @reset="handleReset"
        />

        <FeedbackTable
          :loading="loading"
          :records="records"
          @detail="handleDetail"
        />

        <FeedbackPager
          v-if="records.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>

    <SubmitDialog ref="submitDialogRef" @success="handleSubmitSuccess" />
    <DetailDrawer ref="detailDrawerRef" />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';
</style>
