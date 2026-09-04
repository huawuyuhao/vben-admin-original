<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type CategoryNode,
  categoryTree as seedTree,
  workbenchApps,
} from '#/views/_shared/data/workbench-apps';

defineOptions({ name: 'WorkbenchAppCategories' });

const tree = ref<CategoryNode[]>(
  seedTree.map((n) => ({
    ...n,
    children: n.children?.map((c) => ({ ...c })),
  })),
);
const expanded = ref<string[]>(['c-power', 'c-edu']);
const checked = ref<string[]>(['c-power']);
const activeLabel = ref('电力');
const page = ref(1);
const pageSize = 4;
const newCategory = ref('');

const apps = computed(() =>
  workbenchApps.filter((a) => a.category === activeLabel.value),
);

const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return apps.value.slice(start, start + pageSize);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(apps.value.length / pageSize)),
);

function toggleExpand(id: string) {
  if (expanded.value.includes(id)) {
    expanded.value = expanded.value.filter((x) => x !== id);
  } else {
    expanded.value = [...expanded.value, id];
  }
}

function selectNode(node: CategoryNode) {
  activeLabel.value = node.label;
  page.value = 1;
  if (!checked.value.includes(node.id)) {
    checked.value = [...checked.value, node.id];
  }
}

function toggleCheck(id: string, e: Event) {
  e.stopPropagation();
  if (checked.value.includes(id)) {
    checked.value = checked.value.filter((x) => x !== id);
  } else {
    checked.value = [...checked.value, id];
  }
}

function addCategory() {
  const label = newCategory.value.trim();
  if (!label) {
    ElMessage.warning('请输入分类名称');
    return;
  }
  tree.value.push({ id: `c-${Date.now()}`, label });
  newCategory.value = '';
  ElMessage.success('分类已新增（示例）');
}
</script>

<template>
  <div class="cat-page">
    <aside class="tree-panel">
      <div class="add-box">
        <input v-model="newCategory" type="text" placeholder="新分类名称" />
        <button class="btn primary" type="button" @click="addCategory">
          新增分类
        </button>
      </div>
      <div class="tree-title">企业类型</div>
      <ul class="tree">
        <li v-for="node in tree" :key="node.id">
          <div
            class="node"
            :class="{ on: activeLabel === node.label }"
            @click="selectNode(node)"
          >
            <button
              v-if="node.children?.length"
              type="button"
              class="exp"
              @click.stop="toggleExpand(node.id)"
            >
              {{ expanded.includes(node.id) ? '−' : '+' }}
            </button>
            <span v-else class="exp ghost"></span>
            <input
              type="checkbox"
              :checked="checked.includes(node.id)"
              @click="toggleCheck(node.id, $event)"
            />
            {{ node.label }}
          </div>
          <ul v-if="node.children && expanded.includes(node.id)" class="sub">
            <li
              v-for="child in node.children"
              :key="child.id"
              class="node"
              :class="{ on: activeLabel === child.label }"
              @click="selectNode(child)"
            >
              <span class="exp ghost"></span>
              <input
                type="checkbox"
                :checked="checked.includes(child.id)"
                @click="toggleCheck(child.id, $event)"
              />
              {{ child.label }}
            </li>
          </ul>
        </li>
      </ul>
    </aside>

    <section class="card">
      <div class="card-head">
        <h3>分类应用 · {{ activeLabel }}</h3>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.info('添加应用（示例）')"
        >
          添加应用
        </button>
      </div>

      <div class="app-grid">
        <article v-for="a in paged" :key="a.id" class="app-card">
          <div>
            <div class="title-row">
              <h4>{{ a.name }}</h4>
              <span class="badge">{{ a.tags[0] || '应用' }}</span>
            </div>
            <p class="meta">创建者: {{ a.creator }}</p>
            <p class="meta">
              收藏数: {{ a.favorites.toLocaleString() }} · 更新于:
              {{ a.updatedAt }}
            </p>
            <p class="desc">{{ a.desc }}</p>
          </div>
          <div class="thumb">🖼</div>
        </article>
        <div v-if="paged.length === 0" class="empty">该分类下暂无应用</div>
      </div>

      <div v-if="apps.length > 0" class="pager">
        <span>共 {{ apps.length }} 条</span>
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
    </section>
  </div>
</template>

<style scoped>
.cat-page {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 14px;
  padding-bottom: 24px;
}

.tree-panel,
.card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.tree-panel {
  padding: 12px;
}

.add-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.add-box input {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.tree-title {
  margin-bottom: 8px;
  font-weight: 600;
}

.tree,
.sub {
  padding: 0;
  margin: 0;
  list-style: none;
}

.sub {
  padding-left: 12px;
}

.node {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 7px 4px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-radius: 4px;
}

.node.on,
.node:hover {
  color: #409eff;
  background: #ecf5ff;
}

.exp {
  width: 18px;
  height: 18px;
  padding: 0;
  line-height: 16px;
  color: #909399;
  cursor: pointer;
  background: none;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
}

.exp.ghost {
  display: inline-block;
  border-color: transparent;
}

.card {
  min-width: 0;
  padding: 14px 16px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-head h3 {
  margin: 0;
  font-size: 15px;
}

.btn {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn.primary {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.app-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.app-card {
  display: grid;
  grid-template-columns: 1fr 72px;
  gap: 10px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.title-row {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.app-card h4 {
  margin: 0;
  font-size: 16px;
}

.badge {
  flex-shrink: 0;
  padding: 1px 8px;
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  border-radius: 10px;
}

.meta {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
}

.desc {
  display: -webkit-box;
  margin: 8px 0 0;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
  -webkit-box-orient: vertical;
}

.thumb {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  color: #c0c4cc;
  background: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
}

.empty {
  grid-column: 1 / -1;
  padding: 28px;
  color: #909399;
  text-align: center;
}

.pager {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 14px;
  font-size: 13px;
  color: #606266;
}

.pages {
  display: flex;
  gap: 4px;
}

.pages button {
  min-width: 28px;
  height: 28px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.pages button.on {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

@media (max-width: 1000px) {
  .cat-page,
  .app-grid {
    grid-template-columns: 1fr;
  }
}
</style>
