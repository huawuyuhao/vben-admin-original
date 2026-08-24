<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  type AppTagItem,
  appTags as seedTags,
  categoryTree,
  workbenchApps,
} from '#/views/_shared/data/workbench-apps';

defineOptions({ name: 'WorkbenchAppTags' });

const tags = ref<AppTagItem[]>(seedTags.map((t) => ({ ...t })));
const activeCategory = ref('电力');
const newTagName = ref('');
const newTagGroup = ref<'应用标签' | '素材标签'>('应用标签');

const appTags = computed(() => tags.value.filter((t) => t.group === '应用标签'));
const materialTags = computed(() =>
  tags.value.filter((t) => t.group === '素材标签'),
);

const categoryApps = computed(() =>
  workbenchApps.filter((a) => a.category === activeCategory.value),
);

function addTag() {
  const name = newTagName.value.trim();
  if (!name) {
    ElMessage.warning('请输入标签名称');
    return;
  }
  tags.value.push({
    id: `t-${Date.now()}`,
    name,
    group: newTagGroup.value,
    color: newTagGroup.value === '应用标签' ? 'blue' : 'green',
  });
  newTagName.value = '';
  ElMessage.success('标签已新增（示例）');
}

function removeTag(id: string) {
  tags.value = tags.value.filter((t) => t.id !== id);
}
</script>

<template>
  <div class="tags-page">
    <aside class="tree-panel">
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.info('新增分类请前往「应用分类」菜单')"
      >
        新增分类
      </button>
      <div class="tree-title">
        <label><input type="checkbox" checked /> 企业类型</label>
      </div>
      <ul class="tree">
        <li
          v-for="node in categoryTree"
          :key="node.id"
          :class="{ on: activeCategory === node.label }"
          @click="activeCategory = node.label"
        >
          <span class="plus">+</span>
          {{ node.label }}
        </li>
      </ul>
    </aside>

    <div class="main">
      <section class="card">
        <div class="card-head">
          <h3>标签管理</h3>
          <div class="add-row">
            <select v-model="newTagGroup">
              <option value="应用标签">应用标签</option>
              <option value="素材标签">素材标签</option>
            </select>
            <input v-model="newTagName" type="text" placeholder="标签名称" />
            <button class="btn primary" type="button" @click="addTag">
              新增标签
            </button>
          </div>
        </div>

        <div class="tag-group">
          <h4>应用标签</h4>
          <div class="tag-list">
            <span v-for="t in appTags" :key="t.id" class="pill blue">
              {{ t.name }}
              <button type="button" @click="removeTag(t.id)">×</button>
            </span>
          </div>
        </div>
        <div class="tag-group">
          <h4>素材标签</h4>
          <div class="tag-list">
            <span v-for="t in materialTags" :key="t.id" class="pill green">
              {{ t.name }}
              <button type="button" @click="removeTag(t.id)">×</button>
            </span>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <h3>分类应用 · {{ activeCategory }}</h3>
          <button
            class="btn primary"
            type="button"
            @click="ElMessage.info('添加应用（示例）')"
          >
            添加应用
          </button>
        </div>
        <div class="app-grid">
          <article v-for="a in categoryApps" :key="a.id" class="app-card">
            <div>
              <h4>
                {{ a.name }}
                <span v-if="a.verified" class="ok">●</span>
              </h4>
              <p class="meta">创建者: {{ a.creator }}</p>
              <p class="meta">
                收藏数: {{ a.favorites.toLocaleString() }} · 更新于:
                {{ a.updatedAt }}
              </p>
              <p class="desc">{{ a.desc }}</p>
            </div>
            <div class="thumb">🖼</div>
          </article>
          <div v-if="categoryApps.length === 0" class="empty">
            该分类下暂无应用
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tags-page {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 14px;
  padding-bottom: 24px;
}

.tree-panel {
  padding: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.tree-title {
  margin: 12px 0 8px;
  color: #303133;
  font-weight: 600;
}

.tree {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tree li {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 6px;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
}

.tree li.on,
.tree li:hover {
  color: #409eff;
  background: #ecf5ff;
}

.plus {
  color: #909399;
  font-family: monospace;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.card {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.card-head {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-head h3 {
  margin: 0;
  font-size: 15px;
}

.add-row {
  display: flex;
  gap: 8px;
}

.add-row input,
.add-row select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn {
  height: 32px;
  padding: 0 12px;
  color: #606266;
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

.tag-group {
  margin-bottom: 12px;
}

.tag-group h4 {
  margin: 0 0 8px;
  color: #909399;
  font-size: 13px;
  font-weight: 500;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 999px;
}

.pill.blue {
  color: #409eff;
  background: #ecf5ff;
}

.pill.green {
  color: #67c23a;
  background: #f0f9eb;
}

.pill button {
  padding: 0;
  color: inherit;
  cursor: pointer;
  background: none;
  border: none;
  opacity: 0.7;
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

.app-card h4 {
  margin: 0 0 6px;
  font-size: 16px;
}

.ok {
  color: #e6a23c;
}

.meta {
  margin: 0 0 2px;
  color: #909399;
  font-size: 12px;
}

.desc {
  margin: 8px 0 0;
  color: #606266;
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
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

@media (max-width: 1000px) {
  .tags-page,
  .app-grid {
    grid-template-columns: 1fr;
  }
}
</style>
