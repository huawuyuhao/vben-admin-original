<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

import {
  type AppBelongType,
  type AppShelfStatus,
  type WorkbenchAppItem,
  workbenchApps,
} from '#/views/_shared/data/workbench-apps';

defineOptions({ name: 'WorkbenchAppInfo' });

const router = useRouter();

const shelfTabs: AppShelfStatus[] = [
  '全部应用',
  '未上架',
  '审核中',
  '已上架',
  '素材合集',
];
const activeShelf = ref<AppShelfStatus>('已上架');
const keyword = ref('');
const timeField = ref<'创建时间' | '更新时间'>('创建时间');
const timeQuick = ref('全部');
const dateFrom = ref('');
const dateTo = ref('');
const belong = ref<AppBelongType>('终端通用');
const showMore = ref(false);
const selected = ref<string[]>(['wa-1', 'wa-4']);
const page = ref(1);
const pageSize = 6;

const belongOptions: AppBelongType[] = [
  '全部',
  '预置垂直',
  '终端通用',
  '官方创建',
  '用户上传',
];
const timeQuicks = ['全部', '最近', '今天', '本周', '本月', '最早'];

const list = ref<WorkbenchAppItem[]>(
  workbenchApps.map((a) => ({ ...a })),
);

const filtered = computed(() => {
  let rows = [...list.value];
  if (activeShelf.value === '素材合集') {
    return [];
  }
  if (activeShelf.value !== '全部应用') {
    rows = rows.filter((a) => a.shelf === activeShelf.value);
  }
  if (belong.value !== '全部') {
    rows = rows.filter((a) => a.belong === belong.value);
  }
  const kw = keyword.value.trim();
  if (kw) {
    rows = rows.filter(
      (a) => a.name.includes(kw) || a.creator.includes(kw) || a.desc.includes(kw),
    );
  }
  return rows;
});

const total = computed(() =>
  activeShelf.value === '素材合集' ? 1000 : filtered.value.length,
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

watch([activeShelf, keyword, belong], () => {
  page.value = 1;
});

function toggleSelect(id: string) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((x) => x !== id);
  } else {
    selected.value = [...selected.value, id];
  }
}

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

function goCreate() {
  router.push('/workbench/app/info/form');
}
</script>

<template>
  <div class="app-info-page">
    <div class="tabs">
      <button
        v-for="t in shelfTabs"
        :key="t"
        type="button"
        class="tab"
        :class="{ active: activeShelf === t }"
        @click="activeShelf = t"
      >
        {{ t }}
      </button>
    </div>

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

      <div v-if="showMore" class="filter-row">
        <span class="label">说明</span>
        <span class="hint">更多筛选项为示例占位，可按业务继续扩展。</span>
      </div>
    </div>

    <div class="actions">
      <button class="btn primary" type="button" @click="goCreate">
        新建应用
      </button>
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.info('打开应用排序（示例）')"
      >
        应用排序
      </button>
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.success(`已申请下架 ${selected.length} 项（示例）`)"
      >
        申请下架
      </button>
    </div>

    <div v-if="activeShelf === '素材合集'" class="empty">
      素材合集入口示例：请前往「应用信息编辑」配置素材，或在「应用出入库配置」中管理。
    </div>

    <div v-else-if="paged.length === 0" class="empty">暂无匹配应用</div>

    <div v-else class="card-grid">
      <article
        v-for="item in paged"
        :key="item.id"
        class="app-card"
        :class="{ selected: selected.includes(item.id) }"
        @click="toggleSelect(item.id)"
      >
        <button
          class="check"
          type="button"
          :class="{ on: selected.includes(item.id) }"
          @click.stop="toggleSelect(item.id)"
        >
          ✓
        </button>
        <div class="card-main">
          <h3>{{ item.name }}</h3>
          <p class="meta">
            创建者: {{ item.creator }}
            <span v-if="item.verified" class="ok">●</span>
          </p>
          <p class="meta">
            收藏数: {{ item.favorites.toLocaleString() }} · 更新于:
            {{ item.updatedAt }}
          </p>
          <p class="desc">{{ item.desc }}</p>
        </div>
        <div class="card-side">
          <span class="side-tag">训练</span>
          <span class="side-tag infer">推理</span>
          <div class="thumb">🖼</div>
        </div>
      </article>
    </div>

    <div v-if="activeShelf !== '素材合集' && filtered.length > 0" class="pager">
      <span>共 {{ total }} 条</span>
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
.app-info-page {
  --primary: #409eff;

  padding: 4px 2px 24px;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 14px;
  border-bottom: 1px solid #ebeef5;
}

.tab {
  padding: 10px 16px;
  margin-bottom: -1px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
}

.tab.active {
  font-weight: 600;
  color: var(--primary);
  border-bottom-color: var(--primary);
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
  padding: 0 10px;
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
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
  cursor: pointer;
  background: none;
  border: none;
}

.hint {
  font-size: 13px;
  color: #909399;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.app-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 110px;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: box-shadow 0.15s;
}

.app-card:hover,
.app-card.selected {
  border-color: #b3d8ff;
  box-shadow: 0 4px 16px rgb(64 158 255 / 12%);
}

.check {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  color: transparent;
  cursor: pointer;
  background: #f2f3f5;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
}

.check.on {
  color: #fff;
  background: #303133;
  border-color: #303133;
}

.card-main h3 {
  padding-right: 28px;
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

.side-tag {
  padding: 2px 8px;
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  border-radius: 4px;
}

.side-tag.infer {
  color: #67c23a;
  background: #f0f9eb;
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
