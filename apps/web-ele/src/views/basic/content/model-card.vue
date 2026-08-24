<script lang="ts" setup>
import { ElMessage } from 'element-plus';

import { modelTemplates } from '#/views/_shared/data/basic-content';

defineOptions({ name: 'ContentModelCard' });
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 应用模型卡片管理 / 样式模板列表</div>
    <header class="head">
      <div>
        <h2>样式模板列表</h2>
      </div>
      <div class="head-actions">
        <button class="btn primary" type="button" @click="ElMessage.success('新增模板（示例）')">
          + 新增模板
        </button>
        <button class="btn" type="button">导入模板</button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>模板名称<input placeholder="请输入模板名称" /></label>
        <label>适用场景<select><option>全部</option></select></label>
        <label>状态<select><option>全部</option></select></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <div class="tpl-grid">
      <article v-for="t in modelTemplates" :key="t.id" class="tpl-card card">
        <div class="tpl-status" :class="t.status === '启用中' ? 'ok' : 'mute'">
          {{ t.status }}
        </div>
        <div class="tpl-cover" />
        <div class="tpl-body">
          <div class="tpl-title">
            <strong>{{ t.name }}</strong>
            <span>
              <button type="button" class="link">✎</button>
              <button type="button" class="link danger">🗑</button>
            </span>
          </div>
          <p>{{ t.desc }}</p>
          <div class="tags">
            <span class="tag info">{{ t.scene }}</span>
            <span v-if="t.preset" class="tag ok">系统预设</span>
          </div>
          <div class="tpl-meta">更新于 {{ t.updated }}</div>
          <div class="tpl-foot">
            <span>使用中 {{ t.used }} 个卡片</span>
            <button
              class="btn"
              :class="t.status === '启用中' ? '' : 'primary'"
              type="button"
            >
              {{ t.status === '启用中' ? '禁用' : '启用' }}
            </button>
          </div>
        </div>
      </article>
    </div>
    <div class="pager center">‹ 1 2 ›</div>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.tpl-card {
  position: relative;
  overflow: hidden;
  padding: 0;
}

.tpl-status {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.tpl-status.ok {
  color: #67c23a;
  background: #f0f9eb;
}

.tpl-status.mute {
  color: #909399;
  background: #f4f4f5;
}

.tpl-cover {
  height: 120px;
  background: linear-gradient(135deg, #d9ecff, #a0cfff);
}

.tpl-body {
  padding: 12px;
}

.tpl-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.tpl-body p {
  margin: 0 0 8px;
  color: #909399;
  font-size: 12px;
}

.tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.tpl-meta {
  margin-bottom: 10px;
  color: #c0c4cc;
  font-size: 12px;
}

.tpl-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #606266;
  font-size: 12px;
}

.pager.center {
  justify-content: center;
}

@media (max-width: 1000px) {
  .tpl-grid {
    grid-template-columns: 1fr;
  }
}
</style>
