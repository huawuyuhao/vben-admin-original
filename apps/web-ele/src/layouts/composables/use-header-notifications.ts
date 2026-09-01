import type { NotificationItem } from '@vben/layouts';
import type { MessageItem } from '#/types/mine/messages/all';

import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  deleteMessageApi,
  getMessageListApi,
  markMessageReadApi,
} from '#/api/mine/messages/all';

/** 顶栏下拉最多展示条数 */
const HEADER_MESSAGE_LIMIT = 8;

/** 未读 */
const MESSAGE_READ_UNREAD = 0;

/**
 * 是否未读
 * @param isRead 已读标记
 * @returns 未读返回 true
 */
function isMessageUnread(isRead?: number): boolean {
  return Number(isRead) !== 1;
}

/**
 * 解析消息 ID
 * @param item 消息条目
 * @returns 合法 ID；无效返回 null
 */
function resolveMessageId(item?: null | MessageItem): null | number {
  const id = Number(item?.messageId);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return id;
}

/**
 * 按消息类型生成圆形头像（SVG data URI，免外链）
 * @param messageType 消息类型
 * @returns 头像地址
 */
function buildMessageTypeAvatar(messageType?: number): string {
  const palette: Record<number, { bg: string; label: string }> = {
    1: { bg: '#00c853', label: '需' },
    2: { bg: '#ff9800', label: '认' },
    3: { bg: '#2196f3', label: '账' },
    4: { bg: '#78909c', label: '系' },
  };
  const hit = palette[Number(messageType)] ?? {
    bg: '#6b4cff',
    label: '消',
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <rect width="80" height="80" rx="40" fill="${hit.bg}"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    fill="#fff" font-size="32" font-family="system-ui,sans-serif" font-weight="700">${hit.label}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * 格式化为相对时间文案
 * @param value 原始时间
 * @returns 相对时间或原字符串
 */
function formatMessageRelativeTime(value?: string): string {
  if (!value?.trim()) {
    return '';
  }
  const ts = new Date(value.replace(/-/g, '/')).getTime();
  if (!Number.isFinite(ts)) {
    return value.trim();
  }
  const diffMs = Date.now() - ts;
  if (diffMs < 0) {
    return value.trim();
  }
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) {
    return $t('page.mine.messages.header.justNow');
  }
  if (minutes < 60) {
    return $t('page.mine.messages.header.minutesAgo', [String(minutes)]);
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return $t('page.mine.messages.header.hoursAgo', [String(hours)]);
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return $t('page.mine.messages.header.daysAgo', [String(days)]);
  }
  return value.trim();
}

/**
 * 将消息条目映射为顶栏通知项
 * @param item 消息
 * @returns NotificationItem
 */
function mapMessageToNotification(item: MessageItem): NotificationItem {
  const id = resolveMessageId(item) ?? item.messageId ?? '';
  return {
    id,
    avatar: buildMessageTypeAvatar(item.messageType),
    date: formatMessageRelativeTime(item.createTime),
    isRead: !isMessageUnread(item.isRead),
    message: item.content?.trim() || '',
    title: item.title?.trim() || $t('page.mine.messages.header.untitled'),
    link: '/mine/messages/all',
    messageType: item.messageType,
  };
}

/**
 * 顶栏消息通知：拉取最近消息、已读/删除/清空与跳转全部消息
 * @param options.isLoggedIn 是否已登录
 */
export function useHeaderNotifications(options: {
  isLoggedIn: () => boolean;
  /** 点击单条通知时打开详情（不跳转页面） */
  onOpenDetail?: (item: NotificationItem) => void;
}) {
  const router = useRouter();
  /** 下拉列表 */
  const notifications = ref<NotificationItem[]>([]);
  /** 拉取中 */
  const loading = ref(false);

  /** 铃铛红点：存在未读时显示 */
  const showDot = computed(() =>
    notifications.value.some((item) => !item.isRead),
  );

  /**
   * 拉取最近消息（优先未读，不足再补最新）
   */
  async function fetchNotifications() {
    if (!options.isLoggedIn()) {
      notifications.value = [];
      return;
    }

    loading.value = true;
    try {
      const unreadPage = await getMessageListApi({
        page: 1,
        pageSize: HEADER_MESSAGE_LIMIT,
        isRead: MESSAGE_READ_UNREAD,
      });
      let records = unreadPage.records ?? [];

      if (records.length < HEADER_MESSAGE_LIMIT) {
        const latestPage = await getMessageListApi({
          page: 1,
          pageSize: HEADER_MESSAGE_LIMIT,
        });
        const seen = new Set(
          records
            .map((row) => resolveMessageId(row))
            .filter((id): id is number => id != null),
        );
        for (const row of latestPage.records ?? []) {
          const id = resolveMessageId(row);
          if (id != null && seen.has(id)) {
            continue;
          }
          records.push(row);
          if (id != null) {
            seen.add(id);
          }
          if (records.length >= HEADER_MESSAGE_LIMIT) {
            break;
          }
        }
      }

      notifications.value = records
        .slice(0, HEADER_MESSAGE_LIMIT)
        .map((row) => mapMessageToNotification(row));
    } catch {
      notifications.value = [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * 单条标记已读
   * @param item 通知项
   */
  async function handleRead(item: NotificationItem) {
    const id = Number(item.id);
    if (!Number.isFinite(id) || id <= 0 || item.isRead) {
      return;
    }
    try {
      await markMessageReadApi([id]);
      item.isRead = true;
    } catch {
      // 错误提示由接口层处理
    }
  }

  /**
   * 删除单条
   * @param item 通知项
   */
  async function handleRemove(item: NotificationItem) {
    const id = Number(item.id);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }
    try {
      await deleteMessageApi([id]);
      notifications.value = notifications.value.filter(
        (row) => row.id !== item.id,
      );
      ElMessage.success($t('ui.actionMessage.operationSuccess'));
    } catch {
      // 错误提示由接口层处理
    }
  }

  /**
   * 全部标记为已读（空数组 = 当前用户全部已读）
   */
  async function handleMakeAll() {
    if (notifications.value.length === 0) {
      return;
    }
    try {
      await markMessageReadApi([]);
      notifications.value.forEach((item) => {
        item.isRead = true;
      });
      ElMessage.success($t('page.mine.messages.header.markAllSuccess'));
    } catch {
      // 错误提示由接口层处理
    }
  }

  /**
   * 清空当前下拉列表中的消息（调用删除接口）
   */
  async function handleClear() {
    const ids = notifications.value
      .map((item) => Number(item.id))
      .filter((id) => Number.isFinite(id) && id > 0);
    if (ids.length === 0) {
      notifications.value = [];
      return;
    }

    try {
      await ElMessageBox.confirm(
        $t('page.mine.messages.header.clearConfirm', [String(ids.length)]),
        $t('page.mine.messages.header.clearTitle'),
        {
          type: 'warning',
          confirmButtonText: $t('page.mine.messages.all.actions.delete'),
          cancelButtonText: $t('page.mine.messages.all.actions.cancel'),
        },
      );
    } catch {
      return;
    }

    try {
      await deleteMessageApi(ids);
      notifications.value = [];
      ElMessage.success($t('ui.actionMessage.operationSuccess'));
    } catch {
      // 错误提示由接口层处理
    }
  }

  /**
   * 点击通知：打开详情弹窗（由布局层承接，不跳转页面）
   * @param item 通知项
   */
  function handleClick(item: NotificationItem) {
    options.onOpenDetail?.(item);
  }

  /**
   * 查看全部消息
   */
  function handleViewAll() {
    void router.push('/mine/messages/all');
  }

  watch(
    () => options.isLoggedIn(),
    (loggedIn) => {
      if (loggedIn) {
        void fetchNotifications();
      } else {
        notifications.value = [];
      }
    },
    { immediate: true },
  );

  return {
    notifications,
    loading,
    showDot,
    fetchNotifications,
    handleRead,
    handleRemove,
    handleMakeAll,
    handleClear,
    handleClick,
    handleViewAll,
  };
}
