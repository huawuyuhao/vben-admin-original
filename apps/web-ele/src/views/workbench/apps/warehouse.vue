<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { ElMessage } from 'element-plus';

import { workbenchApps } from '#/views/_shared/data/workbench-apps';

defineOptions({ name: 'WorkbenchAppWarehouse' });

const keyword = ref('');
const timeField = ref<'创建时间' | '更新时间'>('创建时间');
const timeQuick = ref('全部');
const dateFrom = ref('');
const dateTo = ref('');
const belong = ref('系统通用');
const showMore = ref(false);
const page = ref(1);
const pageSize = 6;

const belongOptions = [
  '全部',
  '角色最高',
  '系统通用',
  '官方创建',
  '用户上传',
];

const timeQuicks = ['全部', '最近', '昨天', '本周', '本月', '全年'];

const list = computed(() => {
  let rows = [...workbenchApps];
  const kw = keyword.value.trim();
  if (kw) {
    rows = rows.filter(
      (a) => a.name.includes(kw) || a.creator.includes(kw) || a.desc.includes(kw),
    );
  }
  if (belong.value === '官方创建' || belong.value === '用户上传') {
    rows = rows.filter((a) => a.belong === belong.value);
  } else if (belong.value === '系统通用') {
    rows = rows.filter(
      (a) => a.belong === '终端通用' || a.belong === '预置垂直',
    );
  }
  return rows;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(list.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return list.value.slice(start, start + pageSize);
});

watch([keyword, belong], () => {
  page.value = 1;
});

function search() {
  page.value = 1;
  ElMessage.success(keyword.value.trim() ? `已查询：${keyword.value}` : '已刷新');
}

function reset() {
  keyword.value = '';
  timeQuick.value = '全部';
  dateFrom.value = '';
  dateTo.value = '';
  belong.value = '全部';
  page.value = 1;
}
</script>

<template>
  <div class="wh-page">
    <div class="filter-bar">
      <div class="search-row">
        <input
          v-model="keyword"
          class="input"
          type="text"
          placeholder="请输入关键字搜索"
          @keyup.enter="search"
        />
        <button class="btn primary" type="button" @click="search">查询</button>
        <button class="btn" type="button" @click="reset">重置</button>
      </div>

      <div class="filter-row">
        <span class="label">时间</span>
        <button
          type="button"
          class="chip"
          :class="{ on: timeField === '创建时间' }"
          @click="timeField = '创建时间'"
        >
          创建时间
        </button>
        <button
          type="button"
          class="chip"
          :class="{ on: timeField === '更新时间' }"
          @click="timeField = '更新时间'"
        >
          更新时间
        </button>
        <button
          v-for="q in timeQuicks"
          :key="q"
          type="button"
          class="chip"
          :class="{ on: timeQuick === q }"
          @click="timeQuick = q"
        >
          {{ q }}
        </button>
        <input v-model="dateFrom" class="date" type="date" />
        <span class="dash">-</span>
        <input v-model="dateTo" class="date" type="date" />
        <button class="btn primary sm" type="button">确定</button>
      </div>

      <div class="filter-row">
        <span class="label">所属类型</span>
        <button
          v-for="b in belongOptions"
          :key="b"
          type="button"
          class="chip"
          :class="{ on: belong === b }"
          @click="belong = b"
        >
          {{ b }}
        </button>
      </div>

      <button class="more" type="button" @click="showMore = !showMore">
        {{ showMore ? '收起' : '更多' }} ▾
      </button>
    </div>

    <div class="actions">
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.info('打开出入库管理（示例）')"
      >
        出入库管理
      </button>
    </div>

    <div class="card-grid">
      <article v-for="item in paged" :key="item.id" class="app-card">
        <div class="card-main">
          <h3>{{ item.name }}</h3>
          <p class="meta">
            创建者: {{ item.creator }}
            <span v-if="item.verified" class="ok">●</span>
          </p>
          <p class="meta">
            访问量 {{ item.visits.toLocaleString() }} · 更新于
            {{ item.updatedAt }}
          </p>
          <p class="desc">{{ item.desc }}</p>
        </div>
        <div class="card-side">
          <button
            type="button"
            class="side-act"
            @click="ElMessage.info(`查看详情：${item.name}`)"
          >
            详情
          </button>
          <button
            type="button"
            class="side-act"
            @click="ElMessage.success(`已触发部署：${item.name}（示例）`)"
          >
            部署
          </button>
          <div class="thumb">🖼</div>
        </div>
      </article>
    </div>

    <div v-if="list.length === 0" class="empty">暂无匹配应用</div>

    <div v-else class="pager">
      <span>共 {{ list.length }} 条</span>
      <div class="pages">
        <button
          type="button"
          :disabled="page <= 1"
          @click="page = Math.max(1, page - 1)"
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
          @click="page = Math.min(totalPages, page + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wh-page {
  --primary: #409eff;

  padding-bottom: 24px;
}

.filter-bar {
  padding: 12px 14px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.input {
  flex: 1;
  max-width: 360px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn {
  height: 34px;
  padding: 0 14px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn.primary {
  color: #fff;
  background: var(--primary);
  border-color: var(--primary);
}

.btn.sm {
  height: 30px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  width: 64px;
  font-size: 13px;
  color: #909399;
}

.chip {
  padding: 2px 8px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  background: none;
  border: none;
}

.chip.on {
  font-weight: 600;
  color: var(--primary);
}

.date {
  height: 30px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.dash {
  color: #c0c4cc;
}

.more {
  font-size: 13px;
  color: #909399;
  cursor: pointer;
  background: none;
  border: none;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.app-card {
  display: grid;
  grid-template-columns: 1fr 96px;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.app-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.meta {
  margin: 0 0 4px;
  font-size: 12px;
  color: #909399;
}

.ok {
  margin-left: 4px;
  color: #e6a23c;
}

.desc {
  display: -webkit-box;
  margin: 10px 0 0;
  overflow: hidden;
  -webkit-line-clamp: 3;
  font-size: 13px;
  line-height: 1.55;
  color: #606266;
  -webkit-box-orient: vertical;
}

.card-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.side-act {
  padding: 2px 0;
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.thumb {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin-top: auto;
  font-size: 28px;
  color: #c0c4cc;
  background: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
}

.empty {
  padding: 48px;
  color: #909399;
  text-align: center;
  background: #fff;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
}

.pager {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
  font-size: 13px;
  color: #606266;
}

.pages {
  display: flex;
  gap: 4px;
}

.pages button {
  min-width: 30px;
  height: 30px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.pages button.on {
  color: #fff;
  background: var(--primary);
  border-color: var(--primary);
}

@media (max-width: 1100px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
