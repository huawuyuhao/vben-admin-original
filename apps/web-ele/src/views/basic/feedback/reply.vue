<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { replyQueue } from '#/views/_shared/data/basic-feedback';

defineOptions({ name: 'FeedbackReply' });

const list = ref(replyQueue.map((r) => ({ ...r, replyDraft: r.reply })));
const status = ref('全部');
const keyword = ref('');
const currentId = ref<number | null>(list.value[0]?.id ?? null);

const filtered = computed(() => {
  let rows = [...list.value];
  if (keyword.value.trim()) {
    const k = keyword.value.trim();
    rows = rows.filter(
      (r) => r.user.includes(k) || r.no.includes(k) || r.content.includes(k),
    );
  }
  if (status.value !== '全部') {
    rows = rows.filter((r) => r.status === status.value);
  }
  return rows;
});

const current = computed(
  () => list.value.find((r) => r.id === currentId.value) ?? null,
);

function select(id: number) {
  currentId.value = id;
}

function statusClass(s: string) {
  if (s === '已处理') return 'ok';
  if (s === '处理中') return 'info';
  return 'warn';
}

function priorityClass(p: string) {
  if (p === '高') return 'danger';
  if (p === '中') return 'warn';
  return 'ok';
}

function submitReply(asDone = false) {
  const item = current.value;
  if (!item) return;
  if (!item.replyDraft.trim()) {
    ElMessage.warning('请输入回复内容');
    return;
  }
  item.reply = item.replyDraft.trim();
  item.history = [
    ...item.history,
    {
      time: '2026-03-25 16:00',
      operator: '管理员',
      content: item.reply,
    },
  ];
  item.status = asDone ? '已处理' : '处理中';
  ElMessage.success(asDone ? '已回复并结案（示例）' : '已提交回复（示例）');
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 基础管理 / 用户意见反馈管理 / 反馈消息回复</div>
    <header class="head">
      <div>
        <h2>反馈消息回复</h2>
        <p>查看反馈详情并与用户沟通处理进展</p>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>{{ list.length }}</strong><span>待回复队列</span></div>
      <div class="kpi">
        <strong>{{ list.filter((r) => r.status === '待处理').length }}</strong>
        <span>待处理</span>
      </div>
      <div class="kpi">
        <strong>{{ list.filter((r) => r.status === '处理中').length }}</strong>
        <span>处理中</span>
      </div>
      <div class="kpi">
        <strong>4.8分</strong><span>平均满意度</span>
      </div>
    </div>

    <div class="split">
      <section class="card list-pane">
        <div class="filter compact">
          <label>
            关键字
            <input v-model="keyword" placeholder="编号/用户/内容" />
          </label>
          <label>
            状态
            <select v-model="status">
              <option>全部</option>
              <option>待处理</option>
              <option>处理中</option>
              <option>已处理</option>
            </select>
          </label>
        </div>
        <div class="queue">
          <button
            v-for="r in filtered"
            :key="r.id"
            type="button"
            class="queue-item"
            :class="{ active: r.id === currentId }"
            @click="select(r.id)"
          >
            <div class="queue-top">
              <strong>{{ r.no }}</strong>
              <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
            </div>
            <div class="queue-meta">
              {{ r.user }} ·
              <span class="tag" :class="priorityClass(r.priority)">{{ r.priority }}</span>
              · {{ r.type }}
            </div>
            <div class="queue-content">{{ r.content }}</div>
            <div class="queue-time">{{ r.time }}</div>
          </button>
        </div>
      </section>

      <section v-if="current" class="card detail-pane">
        <h3 class="section-title">反馈详情与回复</h3>
        <div class="info-grid">
          <div><label>反馈编号</label><div>{{ current.no }}</div></div>
          <div><label>用户名称</label><div>{{ current.user }}</div></div>
          <div><label>联系电话</label><div>{{ current.phone }}</div></div>
          <div><label>反馈类型</label><div>{{ current.type }}</div></div>
          <div>
            <label>优先级</label>
            <div>
              <span class="tag" :class="priorityClass(current.priority)">
                {{ current.priority }}
              </span>
            </div>
          </div>
          <div><label>反馈时间</label><div>{{ current.time }}</div></div>
        </div>

        <div class="block">
          <label>反馈内容</label>
          <div class="content-box">{{ current.content }}</div>
        </div>

        <div class="block">
          <label>
            处理信息
            <span class="tag" :class="statusClass(current.status)">
              {{ current.status }}
            </span>
          </label>
          <textarea
            v-model="current.replyDraft"
            rows="5"
            placeholder="请输入回复/处理方案"
          />
        </div>

        <div v-if="current.history.length" class="block">
          <label>历史沟通</label>
          <ul class="history">
            <li v-for="(h, i) in current.history" :key="i">
              <div class="history-meta">{{ h.time }} · {{ h.operator }}</div>
              <div>{{ h.content }}</div>
            </li>
          </ul>
        </div>

        <div class="detail-actions">
          <button class="btn" type="button" @click="submitReply(false)">
            保存回复
          </button>
          <button class="btn primary" type="button" @click="submitReply(true)">
            回复并结案
          </button>
        </div>
      </section>

      <section v-else class="card detail-pane empty">请选择左侧反馈记录</section>
    </div>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.split {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 12px;
  align-items: start;
}

.list-pane,
.detail-pane {
  min-height: 520px;
}

.filter.compact {
  grid-template-columns: 1fr 140px;
  margin-bottom: 12px;
}

.queue {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 560px;
  overflow: auto;
}

.queue-item {
  padding: 12px;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.queue-item.active {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.queue-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.queue-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
  color: #606266;
  font-size: 12px;
}

.queue-content {
  display: -webkit-box;
  overflow: hidden;
  color: #303133;
  font-size: 13px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.queue-time {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}

.section-title {
  margin: 0 0 14px;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.info-grid label {
  display: block;
  margin-bottom: 4px;
  color: #909399;
  font-size: 12px;
}

.block {
  margin-bottom: 14px;
}

.block > label {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  color: #606266;
  font-size: 13px;
}

.content-box,
.block textarea {
  width: 100%;
  padding: 12px;
  color: #303133;
  font-size: 13px;
  line-height: 1.6;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-sizing: border-box;
}

.block textarea {
  resize: vertical;
  background: #fff;
}

.history {
  margin: 0;
  padding: 0;
  list-style: none;
}

.history li {
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
  font-size: 13px;
}

.history-meta {
  margin-bottom: 4px;
  color: #909399;
  font-size: 12px;
}

.detail-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

@media (max-width: 960px) {
  .split {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
