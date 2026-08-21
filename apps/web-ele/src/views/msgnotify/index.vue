<script lang="ts" setup>
import { computed, ref } from 'vue';

const activeTab = ref('all');
const toast = ref('');

const allMessages = [
  {
    icon: '📋',
    title: '算力需求审核通过通知',
    content:
      '您的算力需求 TASK-20260820-001 已通过审核，已自动生成算力任务并进入调度队列。',
    time: '2026-08-20 10:30',
    unread: true,
    category: 'demand',
  },
  {
    icon: '🔐',
    title: '企业认证审核通过',
    content: '您的企业认证申请已通过审核，您现在可以正常使用平台全部功能。',
    time: '2026-08-19 16:00',
    unread: true,
    category: 'auth',
  },
  {
    icon: '⚙️',
    title: '系统维护通知',
    content:
      '平台将于 2026-08-22 02:00-04:00 进行例行维护，期间部分服务可能不可用。',
    time: '2026-08-18 09:00',
    unread: false,
    category: 'system',
  },
  {
    icon: '✅',
    title: '算力任务完成通知',
    content: '您的算力任务 TASK-20260819-012 已完成，可查看结果和下载。',
    time: '2026-08-19 18:30',
    unread: false,
    category: 'demand',
  },
  {
    icon: '👤',
    title: '新建企业子账号通知',
    content: '管理员为您的企业创建了新的子账号 user-002，可登录平台使用。',
    time: '2026-08-17 14:00',
    unread: false,
    category: 'auth',
  },
];

const messages = computed(() => {
  if (activeTab.value === 'all') return allMessages;
  return allMessages.filter((m) => m.category === activeTab.value);
});

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>消息通知</h2>
      <p>
        展示消息详情，分类包含需求消息、认证消息、新建企业子账号消息、系统消息等。
      </p>
    </div>

    <div class="portal-msg-toolbar">
      <div class="portal-tabs">
        <div
          class="portal-tab"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          全部 (12)
        </div>
        <div
          class="portal-tab"
          :class="{ active: activeTab === 'demand' }"
          @click="activeTab = 'demand'"
        >
          需求消息 (5)
        </div>
        <div
          class="portal-tab"
          :class="{ active: activeTab === 'auth' }"
          @click="activeTab = 'auth'"
        >
          认证消息 (3)
        </div>
        <div
          class="portal-tab"
          :class="{ active: activeTab === 'system' }"
          @click="activeTab = 'system'"
        >
          系统消息 (4)
        </div>
      </div>
      <div class="portal-msg-actions">
        <button
          class="portal-btn portal-btn-outline portal-btn-sm"
          type="button"
          @click="showToast('已标记已读')"
        >
          标记已读
        </button>
        <button
          class="portal-btn portal-btn-outline portal-btn-sm"
          type="button"
          @click="showToast('已删除选中消息')"
        >
          删除
        </button>
      </div>
    </div>

    <div class="portal-msg-list">
      <div
        v-for="msg in messages"
        :key="msg.title"
        class="portal-msg-item"
        :class="{ unread: msg.unread }"
      >
        <span class="portal-msg-icon">{{ msg.icon }}</span>
        <div class="portal-msg-body">
          <div class="portal-msg-title">{{ msg.title }}</div>
          <div class="portal-msg-content">{{ msg.content }}</div>
          <div class="portal-msg-time">{{ msg.time }}</div>
        </div>
        <span
          class="portal-badge"
          :class="msg.unread ? 'portal-badge-info' : 'portal-badge-gray'"
        >
          {{ msg.unread ? '未读' : '已读' }}
        </span>
      </div>
      <div v-if="messages.length === 0" class="portal-msg-empty">
        暂无该类消息
      </div>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>

.portal-msg-empty {
  padding: 40px 16px;
  font-size: 13px;
  color: var(--portal-gray-500, #9e9e9e);
  text-align: center;
}
</style>
