<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MessageItem } from '#/types/mine/messages/all';
import { type ApiId, parseRouteApiId } from '#/utils/api-id';

import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { Check, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import { toVxePageResult, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMessageApi,
  getMessageListApi,
  getMessageStatisticsApi,
  markMessageReadApi,
} from '#/api/mine/messages/all';
import PageListShell from '#/views/_shared/components/page-list-shell.vue';

import {
  buildMessageCategoryTabs,
  displayMessageValue,
  getMessageTypeI18nKey,
  getMessageTypeTagType,
  isMessageUnread,
  MESSAGE_PAGE_SIZE,
  MESSAGE_PAGE_SIZE_OPTIONS,
  type MessageCategoryTab,
  type MessageReadFilter,
  type MessageTypeFilter,
  normalizeMessagePage,
  parseMessageReadFilter,
  parseMessageTypeFilter,
  resolveMessageId,
  useMessageColumns,
  useMessageGridFormSchema,
} from './data';
import CategoryTabs from './modules/category-tabs.vue';
import DetailDialog from './modules/detail-dialog.vue';

/**
 * 我的 · 消息通知 · 全部消息
 * 分类 Tabs 保留；表格 / 分页 / 阅读状态筛选迁至 useVbenVxeGrid
 */
defineOptions({ name: 'MineMessagesAll' });

const route = useRoute();
const router = useRouter();

/** 当前分类 Tab（空串=全部） */
const activeType = ref<MessageTypeFilter>('');
/** 批量操作中 */
const acting = ref(false);
/** 分类统计 Tab */
const categoryTabs = ref<MessageCategoryTab[]>(buildMessageCategoryTabs([]));
/** 已选消息 ID */
const selectedIds = ref<number[]>([]);
/** 详情弹窗 */
const detailDialogRef = ref<InstanceType<typeof DetailDialog>>();

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid',
  formOptions: {
    schema: useMessageGridFormSchema(),
    submitOnChange: true,
  },
  gridEvents: {
    checkboxAll: () => {
      syncSelectedIds();
    },
    checkboxChange: () => {
      syncSelectedIds();
    },
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      reserve: false,
    },
    columns: useMessageColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: MESSAGE_PAGE_SIZE,
      pageSizes: MESSAGE_PAGE_SIZE_OPTIONS,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          selectedIds.value = [];
          const data = await getMessageListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            messageType: parseMessageTypeFilter(activeType.value),
            isRead: parseMessageReadFilter(
              (formValues?.isRead as MessageReadFilter | undefined) ?? '',
            ),
          });
          return toVxePageResult(normalizeMessagePage(data));
        },
      },
    },
    rowConfig: {
      keyField: 'messageId',
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<MessageItem>,
});

/**
 * 从表格勾选同步已选消息 ID
 */
function syncSelectedIds() {
  const rows =
    (gridApi.grid?.getCheckboxRecords?.() as MessageItem[] | undefined) ?? [];
  selectedIds.value = rows
    .map((row) => resolveMessageId(row))
    .filter((id): id is ApiId => id != null);
}

/**
 * 清空表格勾选与本地已选
 */
function clearSelection() {
  gridApi.grid?.clearCheckboxRow?.();
  selectedIds.value = [];
}

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
 * 同时刷新列表与统计
 */
async function refreshAll() {
  await Promise.all([gridApi.query(), fetchStatistics()]);
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
async function handleDetailRead(messageId: ApiId) {
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
    clearSelection();
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
    await deleteMessageApi([...selectedIds.value]);
    ElMessage.success($t('ui.actionMessage.operationSuccess'));
    clearSelection();
    await fetchStatistics();
    gridApi.reload();
  } catch {
    // 错误提示由接口层处理
  } finally {
    acting.value = false;
  }
}

/**
 * 处理顶栏通知跳转携带的 messageId，打开详情后清掉 query
 */
async function handleEntryQuery() {
  const messageId = parseRouteApiId(route.query.messageId);
  if (messageId == null) {
    return;
  }
  await nextTick();
  void detailDialogRef.value?.open({ messageId });
  await router.replace({ path: route.path });
}

watch(activeType, () => {
  clearSelection();
  gridApi.reload();
});

onMounted(() => {
  void fetchStatistics().then(() => {
    void handleEntryQuery();
  });
});
</script>

<template>
  <PageListShell
    :desc="$t('page.mine.messages.all.desc')"
    :eyebrow="$t('page.mine.messages.all.eyebrow')"
    :title="$t('page.mine.messages.all.title')"
  >
    <CategoryTabs v-model:active-type="activeType" :tabs="categoryTabs" />

    <Grid>
      <template #table-title></template>

      <template #toolbar-actions>
        <div class="msg-grid__batch">
          <span v-if="selectedIds.length > 0" class="msg-grid__selected">
            {{
              $t('page.mine.messages.all.selectedCount', [
                String(selectedIds.length),
              ])
            }}
          </span>
          <el-button
            :disabled="selectedIds.length === 0 || acting"
            :icon="Check"
            :loading="acting"
            @click="handleMarkRead"
          >
            {{ $t('page.mine.messages.all.actions.markRead') }}
          </el-button>
          <el-button
            :disabled="selectedIds.length === 0 || acting"
            :icon="Delete"
            :loading="acting"
            plain
            type="danger"
            @click="handleDelete"
          >
            {{ $t('page.mine.messages.all.actions.delete') }}
          </el-button>
        </div>
      </template>

      <template #title="{ row }">
        <div class="msg-grid__title-cell">
          <i
            v-if="isMessageUnread(row.isRead)"
            class="msg-grid__unread-dot"
            aria-hidden="true"
          ></i>
          <span
            class="msg-grid__title"
            :class="{ 'msg-grid__title--unread': isMessageUnread(row.isRead) }"
          >
            {{
              displayMessageValue(
                row.title,
                $t('page.mine.messages.all.valueEmpty'),
              )
            }}
          </span>
        </div>
      </template>

      <template #messageType="{ row }">
        <el-tag
          effect="light"
          round
          size="small"
          :type="getMessageTypeTagType(row.messageType)"
        >
          {{ $t(getMessageTypeI18nKey(row.messageType)) }}
        </el-tag>
      </template>

      <template #isRead="{ row }">
        <el-tag
          effect="plain"
          round
          size="small"
          :type="isMessageUnread(row.isRead) ? 'danger' : 'info'"
        >
          {{
            isMessageUnread(row.isRead)
              ? $t('page.mine.messages.all.readStatus.unread')
              : $t('page.mine.messages.all.readStatus.read')
          }}
        </el-tag>
      </template>

      <template #action="{ row }">
        <el-button link type="primary" @click="handleDetail(row)">
          {{ $t('page.mine.messages.all.actions.detail') }}
        </el-button>
      </template>
    </Grid>
  </PageListShell>

  <DetailDialog ref="detailDialogRef" @read="handleDetailRead" />
</template>

<style lang="scss" scoped>
.msg-grid {
  &__batch {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__selected {
    margin-right: 4px;
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  &__title-cell {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    max-width: 100%;
  }

  &__unread-dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    background: var(--el-color-danger);
    border-radius: 50%;
  }

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--unread {
      font-weight: 650;
      color: hsl(var(--foreground));
    }
  }
}
</style>
