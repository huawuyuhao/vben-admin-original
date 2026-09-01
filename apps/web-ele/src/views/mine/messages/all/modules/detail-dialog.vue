<script lang="ts" setup>
import type { MessageItem } from '#/types/mine/messages/all';

import { ref } from 'vue';

import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import { getMessageDetailApi } from '#/api/mine/messages/all';

import {
  displayMessageValue,
  formatMessageDateTime,
  getMessageTypeI18nKey,
  getMessageTypeTagType,
  isMessageUnread,
  resolveMessageId,
} from '../data';

defineOptions({ name: 'MineMessagesDetailDialog' });

const emit = defineEmits<{
  /** 详情打开后若曾为未读，通知父级刷新 */
  read: [messageId: number];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 详情加载中 */
const loading = ref(false);
/** 当前详情 */
const current = ref<MessageItem | null>(null);

/**
 * 打开详情弹窗并拉取最新详情
 * @param row 列表行
 */
async function open(row: MessageItem) {
  const id = resolveMessageId(row);
  if (id == null) {
    ElMessage.warning($t('page.mine.messages.all.form.invalidId'));
    return;
  }

  const wasUnread = isMessageUnread(row.isRead);
  visible.value = true;
  loading.value = true;
  current.value = { ...row };

  try {
    const detail = await getMessageDetailApi(id);
    if (detail) {
      current.value = detail;
    }
    if (wasUnread) {
      emit('read', id);
    }
  } catch {
    // 错误提示由接口层处理；保留列表行兜底展示
  } finally {
    loading.value = false;
  }
}

/**
 * 关闭弹窗
 */
function handleClosed() {
  current.value = null;
}

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    class="msg-detail-dialog"
    destroy-on-close
    :title="$t('page.mine.messages.all.detail.title')"
    width="560px"
    @closed="handleClosed"
  >
    <div v-loading="loading" class="msg-detail-dialog__body">
      <template v-if="current">
        <div class="msg-detail-dialog__block">
          <p class="msg-detail-dialog__label">
            {{ $t('page.mine.messages.all.fields.title') }}
          </p>
          <p class="msg-detail-dialog__value msg-detail-dialog__value--strong">
            {{
              displayMessageValue(
                current.title,
                $t('page.mine.messages.all.valueEmpty'),
              )
            }}
          </p>
        </div>

        <div class="msg-detail-dialog__meta">
          <div class="msg-detail-dialog__block">
            <p class="msg-detail-dialog__label">
              {{ $t('page.mine.messages.all.fields.messageType') }}
            </p>
            <el-tag
              effect="light"
              round
              size="small"
              :type="getMessageTypeTagType(current.messageType)"
            >
              {{ $t(getMessageTypeI18nKey(current.messageType)) }}
            </el-tag>
          </div>

          <div class="msg-detail-dialog__block">
            <p class="msg-detail-dialog__label">
              {{ $t('page.mine.messages.all.fields.isRead') }}
            </p>
            <el-tag
              effect="plain"
              round
              size="small"
              :type="isMessageUnread(current.isRead) ? 'danger' : 'info'"
            >
              {{
                isMessageUnread(current.isRead)
                  ? $t('page.mine.messages.all.readStatus.unread')
                  : $t('page.mine.messages.all.readStatus.read')
              }}
            </el-tag>
          </div>
        </div>

        <div class="msg-detail-dialog__block">
          <p class="msg-detail-dialog__label">
            {{ $t('page.mine.messages.all.fields.createTime') }}
          </p>
          <p class="msg-detail-dialog__value">
            {{
              displayMessageValue(
                formatMessageDateTime(current.createTime),
                $t('page.mine.messages.all.valueEmpty'),
              )
            }}
          </p>
        </div>

        <div
          v-if="current.readTime"
          class="msg-detail-dialog__block"
        >
          <p class="msg-detail-dialog__label">
            {{ $t('page.mine.messages.all.fields.readTime') }}
          </p>
          <p class="msg-detail-dialog__value">
            {{
              displayMessageValue(
                formatMessageDateTime(current.readTime),
                $t('page.mine.messages.all.valueEmpty'),
              )
            }}
          </p>
        </div>

        <div class="msg-detail-dialog__block">
          <p class="msg-detail-dialog__label">
            {{ $t('page.mine.messages.all.fields.content') }}
          </p>
          <div class="msg-detail-dialog__content">
            {{
              displayMessageValue(
                current.content,
                $t('page.mine.messages.all.valueEmpty'),
              )
            }}
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <el-button type="primary" @click="visible = false">
        {{ $t('page.mine.messages.all.detail.close') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.msg-detail-dialog {
  &__body {
    min-height: 120px;
  }

  &__meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 4px;
  }

  &__block {
    margin-bottom: 16px;
  }

  &__label {
    margin: 0 0 6px;
    color: hsl(var(--muted-foreground));
    font-size: 12px;
  }

  &__value {
    margin: 0;
    color: hsl(var(--foreground));
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;

    &--strong {
      font-size: 16px;
      font-weight: 650;
    }
  }

  &__content {
    padding: 12px 14px;
    color: hsl(var(--foreground));
    font-size: 14px;
    line-height: 1.7;
    word-break: break-word;
    white-space: pre-wrap;
    background: hsl(var(--muted) / 0.45);
    border-radius: 8px;
  }
}
</style>
