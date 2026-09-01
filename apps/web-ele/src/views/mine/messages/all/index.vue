<script lang="ts" setup>
import type { MessageItem } from '#/types/mine/messages/all';

import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Refresh } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  deleteMessageApi,
  getMessageListApi,
  getMessageStatisticsApi,
  markMessageReadApi,
} from '#/api/mine/messages/all';

import {
  MESSAGE_PAGE_SIZE,
  buildMessageCategoryTabs,
  normalizeMessagePage,
  parseMessageReadFilter,
  parseMessageTypeFilter,
  type MessageCategoryTab,
  type MessageReadFilter,
  type MessageTypeFilter,
} from './data';
import CategoryTabs from './modules/category-tabs.vue';
import DetailDialog from './modules/detail-dialog.vue';
import FilterBar from './modules/filter-bar.vue';
import MessagePager from './modules/message-pager.vue';
import MessageTable from './modules/message-table.vue';

/**
 * 我的 · 消息通知 · 全部消息
 * 对接 /message/list、/message/{id}、/message/read、/message/delete、/message/statistics
 */
defineOptions({ name: 'MineMessagesAll' });

const route = useRoute();
const router = useRouter();

/** 当前分类 Tab（空串=全部） */
const activeType = ref<MessageTypeFilter>('');
/** 已读筛选 */
const readStatus = ref<MessageReadFilter>('');

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(MESSAGE_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 批量操作中 */
const acting = ref(false);
/** 当前页消息 */
const records = ref<MessageItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 分类统计 Tab */
const categoryTabs = ref<MessageCategoryTab[]>(buildMessageCategoryTabs([]));
/** 已选消息 ID */
const selectedIds = ref<number[]>([]);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);

/** 表格 */
const tableRef = ref<InstanceType<typeof MessageTable>>();
/** 详情弹窗 */
const detailDialogRef = ref<InstanceType<typeof DetailDialog>>();

/**
 * 拉取分类统计
 */
async function fetchStatistics() {
  try {
    const stats = await getMessageStatisticsApi();
    categoryTabs.value = buildMessageCategoryTabs(stats);
  } catch {
    categoryTabs.value = buildMessageCategoryTabs([]);
  }
}

/**
 * 拉取当前页消息列表
 */
async function fetchMessages() {
  loading.value = true;
  try {
    const data = await getMessageListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      messageType: parseMessageTypeFilter(activeType.value),
      isRead: parseMessageReadFilter(readStatus.value),
    });
    const page = normalizeMessagePage(data);
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
 * 同时刷新列表与统计
 */
async function refreshAll() {
  await Promise.all([fetchMessages(), fetchStatistics()]);
}

/**
 * 回到第一页并查询
 */
function queryFromFirstPage() {
  selectedIds.value = [];
  tableRef.value?.clearSelection();
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchMessages();
}

/**
 * 刷新当前页与统计
 */
function handleRefresh() {
  void refreshAll();
}

/**
 * 分类 Tab 切换
 */
function handleTypeChange() {
  queryFromFirstPage();
}

/**
 * 已读筛选变化
 */
function handleReadSearch() {
  queryFromFirstPage();
}

/**
 * 勾选变化
 * @param ids 已选消息 ID
 */
function handleSelectionChange(ids: number[]) {
  selectedIds.value = ids;
}

/**
 * 打开详情
 * @param row 列表行
 */
function handleDetail(row: MessageItem) {
  void detailDialogRef.value?.open(row);
}

/**
 * 查看未读详情后标记已读并刷新
 * @param messageId 消息 ID
 */
async function handleDetailRead(messageId: number) {
  try {
    await markMessageReadApi([messageId]);
    void refreshAll();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 批量标记已读
 */
async function handleMarkRead() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning($t('page.mine.messages.all.tips.selectFirst'));
    return;
  }

  acting.value = true;
  try {
    await markMessageReadApi([...selectedIds.value]);
    ElMessage.success($t('page.mine.messages.all.tips.markReadSuccess'));
    selectedIds.value = [];
    tableRef.value?.clearSelection();
    void refreshAll();
  } catch {
    // 错误提示由接口层处理
  } finally {
    acting.value = false;
  }
}

/**
 * 批量删除
 */
async function handleDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning($t('page.mine.messages.all.tips.selectFirst'));
    return;
  }

  try {
    await ElMessageBox.confirm(
      $t('page.mine.messages.all.tips.deleteConfirm', [
        String(selectedIds.value.length),
      ]),
      $t('page.mine.messages.all.tips.deleteTitle'),
      {
        type: 'warning',
        confirmButtonText: $t('page.mine.messages.all.actions.delete'),
        cancelButtonText: $t('page.mine.messages.all.actions.cancel'),
      },
    );
  } catch {
    return;
  }

  acting.value = true;
  try {
    const ids = [...selectedIds.value];
    await deleteMessageApi(ids);
    ElMessage.success($t('ui.actionMessage.operationSuccess'));
    selectedIds.value = [];
    tableRef.value?.clearSelection();

    const remain = Math.max(0, total.value - ids.length);
    const maxPage = Math.max(1, Math.ceil(remain / pageSize.value));
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage;
    }
    void refreshAll();
  } catch {
    // 错误提示由接口层处理
  } finally {
    acting.value = false;
  }
}

watch(activeType, () => {
  handleTypeChange();
});

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchMessages();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchMessages();
});

/**
 * 处理顶栏通知跳转携带的 messageId，打开详情后清掉 query
 */
async function handleEntryQuery() {
  const messageId = Number(route.query.messageId);
  if (!Number.isFinite(messageId) || messageId <= 0) {
    return;
  }
  await nextTick();
  void detailDialogRef.value?.open({ messageId });
  await router.replace({ path: route.path });
}

onMounted(() => {
  void refreshAll().then(() => {
    void handleEntryQuery();
  });
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
              {{ $t('page.mine.messages.all.eyebrow') }}
            </p>
            <h2>{{ $t('page.mine.messages.all.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.mine.messages.all.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.mine.messages.all.refresh') }}
            </el-button>
          </div>
        </header>

        <CategoryTabs v-model:active-type="activeType" :tabs="categoryTabs" />

        <FilterBar
          v-model:read-status="readStatus"
          :acting="acting"
          :selected-count="selectedIds.length"
          @mark-read="handleMarkRead"
          @remove="handleDelete"
          @search="handleReadSearch"
        />

        <MessageTable
          ref="tableRef"
          :loading="loading"
          :records="records"
          @detail="handleDetail"
          @selection-change="handleSelectionChange"
        />

        <MessagePager
          v-if="records.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>

    <DetailDialog ref="detailDialogRef" @read="handleDetailRead" />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';
</style>
