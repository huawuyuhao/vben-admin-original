<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { partners } from '#/views/_shared/data/basic-content';

defineOptions({ name: 'ContentPartner' });

const view = ref<'card' | 'list'>('card');
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 合作伙伴管理</div>
    <header class="head">
      <div>
        <h2>合作伙伴展示管理</h2>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">导入</button>
        <button class="btn" type="button">导出</button>
        <button class="btn danger" type="button">批量删除</button>
        <button class="btn primary" type="button" @click="ElMessage.success('新增合作伙伴（示例）')">
          + 新增合作伙伴
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>48</strong><span>总合作伙伴数</span></div>
      <div class="kpi"><strong>8</strong><span>战略合作伙伴</span></div>
      <div class="kpi"><strong>16</strong><span>核心合作伙伴</span></div>
      <div class="kpi"><strong>24</strong><span>普通合作伙伴</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>合作伙伴名称<input placeholder="请输入合作伙伴名称" /></label>
        <label>合作伙伴等级<select><option>全部</option></select></label>
        <label>行业分类<select><option>全部</option></select></label>
        <label>状态<select><option>全部</option></select></label>
        <label>合作开始时间<input type="date" /></label>
        <label>展示位置<select><option>全部</option></select></label>
        <label>排序方式<select><option>排序号优先</option></select></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <div class="view-bar card">
      <div class="view-tabs">
        <button type="button" :class="{ active: view === 'list' }" @click="view = 'list'">
          列表视图
        </button>
        <button type="button" :class="{ active: view === 'card' }" @click="view = 'card'">
          卡片视图
        </button>
      </div>
      <span>每行显示: 3个</span>
    </div>

    <div v-if="view === 'card'" class="partner-grid">
      <article v-for="p in partners" :key="p.id" class="partner-card card">
        <div class="partner-actions">
          <button type="button" class="link">✎</button>
          <button type="button" class="link danger">🗑</button>
        </div>
        <div class="partner-cover" />
        <div class="partner-body">
          <div class="name-row">
            <strong>{{ p.name }}</strong>
            <span class="tag" :class="p.level.includes('战略') ? 'warn' : 'info'">{{
              p.level
            }}</span>
          </div>
          <div class="industry">{{ p.industry }}</div>
          <span class="tag" :class="p.status === '启用' ? 'ok' : 'mute'">{{ p.status }}</span>
          <div class="partner-foot">
            <span>合作时间: {{ p.start }}</span>
            <span>排序: {{ p.sort }}</span>
          </div>
        </div>
      </article>
    </div>

    <section v-else class="card">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>等级</th>
            <th>行业</th>
            <th>状态</th>
            <th>合作时间</th>
            <th>排序</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in partners" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ p.level }}</td>
            <td>{{ p.industry }}</td>
            <td>{{ p.status }}</td>
            <td>{{ p.start }}</td>
            <td>{{ p.sort }}</td>
          </tr>
        </tbody>
      </table>
    </section>
    <div class="pager center">‹ 1 2 ›</div>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.view-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #909399;
  font-size: 13px;
}

.view-tabs {
  display: flex;
  gap: 0;
}

.view-tabs button {
  height: 30px;
  padding: 0 12px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.view-tabs button:first-child {
  border-radius: 4px 0 0 4px;
}

.view-tabs button:last-child {
  border-radius: 0 4px 4px 0;
}

.view-tabs button.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.partner-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.partner-card {
  position: relative;
  padding: 0;
  overflow: hidden;
}

.partner-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: flex;
  gap: 4px;
}

.partner-cover {
  height: 100px;
  background: linear-gradient(135deg, #c0c4cc, #909399);
}

.partner-body {
  padding: 12px;
}

.name-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.industry {
  margin-bottom: 8px;
  color: #909399;
  font-size: 12px;
}

.partner-foot {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}

.pager.center {
  justify-content: center;
}

@media (max-width: 1000px) {
  .partner-grid {
    grid-template-columns: 1fr;
  }
}
</style>
