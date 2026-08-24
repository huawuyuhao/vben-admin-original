<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ElMessage } from 'element-plus';

import {
  MESSAGE_CATEGORY_META,
  type MessageCategory,
  type MineMessage,
  getMessageStats,
  mineMessages as seedMessages,
} from '#/views/_shared/data/mine-messages';

defineOptions({ name: 'MineMessagesIndex' });

const route = useRoute();
const keyword = ref('');
const sortNewest = ref(true);
const page = ref(1);
const pageSize = 6;
const selected = ref<string[]>([]);

const messages = ref<MineMessage[]>(
  seedMessages.map((m) => ({ ...m })),
);

const category = computed<MessageCategory>(() => {
  const c = String(route.meta.messageCategory || 'all') as MessageCategory;
  return c;
});

const stats = computed(() => getMessageStats(messages.value));

const filtered = computed(() => {
  let list = messages.value.filter((m) =>
    category.value === 'deleted' ? !!m.deleted : !m.deleted,
  );
  if (category.value !== 'all' && category.value !== 'deleted') {
    list = list.filter((m) => m.category === category.value);
  }
  const kw = keyword.value.trim();
  if (kw) {
    list = list.filter(
      (m) => m.title.includes(kw) || m.content.includes(kw),
    );
  }
  list = [...list].sort((a, b) =>
    sortNewest.value
      ? b.time.localeCompare(a.time)
      : a.time.localeCompare(b.time),
  );
  return list;
});

const total = computed(() => filtered.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

const pageList = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const allChecked = computed(
  () =>
    pageList.value.length > 0 &&
    pageList.value.every((m) => selected.value.includes(m.id)),
);

watch(category, () => {
  page.value = 1;
  selected.value = [];
  keyword.value = '';
});

watch([keyword, sortNewest], () => {
  page.value = 1;
});

function toggleAll(checked: boolean) {
  if (!checked) {
    selected.value = selected.value.filter(
      (id) => !pageList.value.some((m) => m.id === id),
    );
    return;
  }
  const ids = new Set(selected.value);
  pageList.value.forEach((m) => ids.add(m.id));
  selected.value = [...ids];
}

function toggleOne(id: string, checked: boolean) {
  if (checked) {
    if (!selected.value.includes(id)) selected.value.push(id);
    return;
  }
  selected.value = selected.value.filter((x) => x !== id);
}

function markRead() {
  if (selected.value.length === 0) {
    ElMessage.warning('请先选择消息');
    return;
  }
  messages.value.forEach((m) => {
    if (selected.value.includes(m.id)) m.unread = false;
  });
  ElMessage.success('已标记为已读');
  selected.value = [];
}

function removeSelected() {
  if (selected.value.length === 0) {
    ElMessage.warning('请先选择消息');
    return;
  }
  if (category.value === 'deleted') {
    messages.value = messages.value.filter(
      (m) => !selected.value.includes(m.id),
    );
    ElMessage.success('已彻底删除');
  } else {
    messages.value.forEach((m) => {
      if (selected.value.includes(m.id)) {
        m.deleted = true;
        m.unread = false;
      }
    });
    ElMessage.success('已移入已删除');
  }
  selected.value = [];
}

function categoryLabel(cat: MineMessage['category']) {
  return MESSAGE_CATEGORY_META[cat]?.label ?? cat;
}

function categoryColor(cat: MineMessage['category']) {
  return MESSAGE_CATEGORY_META[cat]?.color ?? '#6b4cff';
}

function categoryIcon(cat: MineMessage['category']) {
  return MESSAGE_CATEGORY_META[cat]?.icon ?? '📩';
}

const summaryCards = computed(() => [
  {
    key: 'all',
    ...MESSAGE_CATEGORY_META.all,
    ...stats.value.all,
  },
  {
    key: 'demand',
    ...MESSAGE_CATEGORY_META.demand,
    ...stats.value.demand,
  },
  {
    key: 'auth',
    ...MESSAGE_CATEGORY_META.auth,
    ...stats.value.auth,
  },
  {
    key: 'system',
    ...MESSAGE_CATEGORY_META.system,
    ...stats.value.system,
  },
]);
</script>

<template>
  <div class="msg-center">
    <header class="msg-center__head">
      <h2>消息中心</h2>
      <p>统一查看需求、认证、子账号与系统通知，支持批量已读与删除。</p>
    </header>

    <div class="summary">
      <div
        v-for="card in summaryCards"
        :key="card.key"
        class="summary-card"
      >
        <div class="summary-icon" :style="{ background: `${card.color}18`, color: card.color }">
          {{ card.icon }}
        </div>
        <div>
          <div class="summary-title">{{ card.label }}</div>
          <div class="summary-num">
            {{ card.total }}
            <small>条 · 未读 {{ card.unread }}</small>
          </div>
        </div>
      </div>
    </div>

    <section class="msg-panel">
      <div class="toolbar">
        <div class="toolbar-left">
          <label class="check">
            <input
              type="checkbox"
              :checked="allChecked"
              @change="toggleAll(($event.target as HTMLInputElement).checked)"
            />
            全选
          </label>
          <button class="tool-btn" type="button" @click="markRead">
            ✓ 标记已读
          </button>
          <button class="tool-btn danger" type="button" @click="removeSelected">
            🗑 删除
          </button>
        </div>
        <div class="toolbar-right">
          <input
            v-model="keyword"
            class="search"
            placeholder="搜索消息内容"
            type="search"
          />
          <select v-model="sortNewest" class="sort">
            <option :value="true">最新优先</option>
            <option :value="false">最早优先</option>
          </select>
        </div>
      </div>

      <div v-if="pageList.length === 0" class="empty">暂无消息</div>

      <div v-else class="list">
        <article
          v-for="item in pageList"
          :key="item.id"
          class="item"
          :class="{ unread: item.unread }"
        >
          <label class="check">
            <input
              type="checkbox"
              :checked="selected.includes(item.id)"
              @change="
                toggleOne(
                  item.id,
                  ($event.target as HTMLInputElement).checked,
                )
              "
            />
          </label>
          <div
            class="item-icon"
            :style="{
              background: `${categoryColor(item.category)}18`,
              color: categoryColor(item.category),
            }"
          >
            {{ categoryIcon(item.category) }}
          </div>
          <div class="item-body">
            <div class="item-top">
              <strong>{{ item.title }}</strong>
              <span
                class="tag"
                :style="{
                  color: categoryColor(item.category),
                  background: `${categoryColor(item.category)}14`,
                }"
              >
                {{ categoryLabel(item.category) }}
              </span>
              <i v-if="item.unread" class="dot"></i>
            </div>
            <p>{{ item.content }}</p>
          </div>
          <time>{{ item.time }}</time>
        </article>
      </div>

      <div class="pager">
        <span>
          显示 {{ total === 0 ? 0 : (page - 1) * pageSize + 1 }} 到
          {{ Math.min(page * pageSize, total) }} 条，共 {{ total }} 条消息
        </span>
        <div class="pages">
          <button
            type="button"
            :disabled="page <= 1"
            @click="page -= 1"
          >
            ‹
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            :class="{ on: p === page }"
            @click="page = p"
          >
            {{ p }}
          </button>
          <button
            type="button"
            :disabled="page >= totalPages"
            @click="page += 1"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.msg-center {
  max-width: 1100px;
  padding: 8px 4px 28px;
}

.msg-center__head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 750;
  color: #1f2430;
}

.msg-center__head p {
  margin: 8px 0 18px;
  font-size: 13px;
  color: #8a94a6;
}

.summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: #fff;
  border: 1px solid rgba(107, 76, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(67, 56, 120, 0.04);
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 20px;
  border-radius: 12px;
}

.summary-title {
  font-size: 13px;
  color: #8a94a6;
}

.summary-num {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 750;
  color: #1f2430;
}

.summary-num small {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #8a94a6;
}

.msg-panel {
  padding: 16px 18px 12px;
  background: #fff;
  border: 1px solid rgba(107, 76, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(67, 56, 120, 0.05);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.check {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: #3d4659;
  cursor: pointer;
}

.tool-btn {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  color: #3d4659;
  cursor: pointer;
  background: #f5f6fa;
  border: 1px solid #e4e7ef;
  border-radius: 8px;
}

.tool-btn.danger {
  color: #c62828;
  background: #fdecea;
  border-color: #f8c9c5;
}

.search {
  width: 200px;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  border: 1px solid #dde1ec;
  border-radius: 8px;
  outline: none;
}

.search:focus,
.sort:focus {
  border-color: #6b4cff;
}

.sort {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  border: 1px solid #dde1ec;
  border-radius: 8px;
  outline: none;
  background: #fff;
}

.empty {
  padding: 48px 0;
  color: #8a94a6;
  text-align: center;
}

.list {
  display: flex;
  flex-direction: column;
}

.item {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 4px;
  border-bottom: 1px solid #f0f2f7;
}

.item:last-child {
  border-bottom: none;
}

.item.unread .item-body strong {
  color: #1f2430;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 18px;
  border-radius: 50%;
}

.item-top {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.item-body strong {
  font-size: 14px;
  color: #3d4659;
}

.item-body p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #8a94a6;
}

.tag {
  padding: 1px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.dot {
  width: 7px;
  height: 7px;
  background: #f44336;
  border-radius: 50%;
}

time {
  font-size: 12px;
  color: #a0a8b8;
  white-space: nowrap;
}

.pager {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  margin-top: 4px;
  font-size: 13px;
  color: #8a94a6;
  border-top: 1px solid #f0f2f7;
}

.pages {
  display: flex;
  gap: 6px;
}

.pages button {
  min-width: 30px;
  height: 30px;
  font-size: 13px;
  color: #3d4659;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e4e7ef;
  border-radius: 6px;
}

.pages button.on {
  color: #fff;
  background: #6b4cff;
  border-color: #6b4cff;
}

.pages button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 900px) {
  .summary {
    grid-template-columns: 1fr 1fr;
  }

  .item {
    grid-template-columns: auto 1fr;
  }

  .item-icon,
  time {
    display: none;
  }
}

@media (max-width: 560px) {
  .summary {
    grid-template-columns: 1fr;
  }
}
</style>
