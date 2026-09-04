<script lang="ts" setup>
import type { TableInstance } from 'element-plus';

import type { MessageItem } from '#/types/mine/messages/all';

import { nextTick, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  displayMessageValue,
  formatMessageDateTime,
  getMessageTypeI18nKey,
  getMessageTypeTagType,
  isMessageUnread,
  resolveMessageId,
} from '../data';

defineOptions({ name: 'MineMessagesTable' });

const props = defineProps<{
  /** 加载中 */
  loading?: boolean;
  /** 列表数据 */
  records: MessageItem[];
}>();

const emit = defineEmits<{
  /** 查看详情 */
  detail: [row: MessageItem];
  /** 勾选变化 */
  selectionChange: [ids: number[]];
}>();

/** 表格实例 */
const tableRef = ref<TableInstance>();

/**
 * 勾选行变化时回传消息 ID 列表
 * @param rows 已选行
 */
function handleSelectionChange(rows: MessageItem[]) {
  const ids = rows
    .map((row) => resolveMessageId(row))
    .filter((id): id is number => id != null);
  emit('selectionChange', ids);
}

/**
 * 清空表格勾选
 */
function clearSelection() {
  tableRef.value?.clearSelection();
}

/**
 * 列表数据变化时清空勾选，避免跨页残留
 */
watch(
  () => props.records,
  async () => {
    await nextTick();
    clearSelection();
    emit('selectionChange', []);
  },
);

defineExpose({ clearSelection });
</script>

<template>
  <el-card class="msg-table" shadow="never">
    <el-table
      ref="tableRef"
      v-loading="loading"
      class="msg-table__inner"
      :data="records"
      row-key="messageId"
      stripe
      :empty-text="$t('page.mine.messages.all.empty')"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        align="center"
        header-align="center"
        type="selection"
        width="48"
      />

      <el-table-column
        :label="$t('page.mine.messages.all.fields.title')"
        min-width="200"
        prop="title"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <div class="msg-table__title-cell">
            <i
              v-if="isMessageUnread(row.isRead)"
              class="msg-table__unread-dot"
              aria-hidden="true"
            ></i>
            <span
              class="msg-table__title"
              :class="{ 'msg-table__title--unread': isMessageUnread(row.isRead) }"
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
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.messages.all.fields.messageType')"
        min-width="120"
        prop="messageType"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getMessageTypeTagType(row.messageType)"
          >
            {{ $t(getMessageTypeI18nKey(row.messageType)) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.messages.all.fields.content')"
        min-width="240"
        prop="content"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayMessageValue(
              row.content,
              $t('page.mine.messages.all.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.messages.all.fields.isRead')"
        min-width="90"
        prop="isRead"
      >
        <template #default="{ row }">
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
      </el-table-column>

      <el-table-column
        :label="$t('page.mine.messages.all.fields.createTime')"
        min-width="160"
        prop="createTime"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayMessageValue(
              formatMessageDateTime(row.createTime),
              $t('page.mine.messages.all.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        fixed="right"
        header-align="center"
        :label="$t('page.mine.messages.all.fields.actions')"
        width="100"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="emit('detail', row)">
            {{ $t('page.mine.messages.all.actions.detail') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.msg-table {
  &__inner {
    width: 100%;
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
