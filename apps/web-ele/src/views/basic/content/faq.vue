<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

/** 常见问题列表（待对接接口） */
const faqs: never[] = [];

defineOptions({ name: 'ContentFaq' });

const category = ref('全部');
const categories = [
  { name: '全部', count: 86 },
  { name: '产品相关', count: 28 },
  { name: '计费相关', count: 22 },
  { name: '使用教程', count: 18 },
  { name: '账号相关', count: 12 },
  { name: '其他问题', count: 6 },
];
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 常见问题管理</div>
    <header class="head">
      <div>
        <h2>常见问题管理</h2>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">导入</button>
        <button class="btn" type="button">导出</button>
        <button class="btn danger" type="button">批量删除</button>
        <button class="btn primary" type="button" @click="ElMessage.success('新增问题（示例）')">
          + 新增问题
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>86</strong><span>总问题数</span></div>
      <div class="kpi"><strong>68</strong><span>已发布</span></div>
      <div class="kpi"><strong>12</strong><span>待审核</span></div>
      <div class="kpi"><strong>6</strong><span>今日新增</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>问题标题<input placeholder="请输入问题标题关键字" /></label>
        <label>问题分类<select><option>全部</option></select></label>
        <label>状态<select><option>全部</option></select></label>
        <label>是否置顶<select><option>全部</option></select></label>
        <label>发布时间<input type="date" /></label>
        <label>创建人<input placeholder="请输入创建人名称" /></label>
        <label>排序方式<select><option>最新发布优先</option></select></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <strong>问题分类管理</strong>
        <button class="btn primary" type="button">+ 新增分类</button>
      </div>
      <div class="cat-tags">
        <button
          v-for="c in categories"
          :key="c.name"
          type="button"
          class="cat-tag"
          :class="{ active: category === c.name }"
          @click="category = c.name"
        >
          {{ c.name }} ({{ c.count }})
        </button>
      </div>
    </section>

    <section class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>问题标题</th>
              <th>分类</th>
              <th>是否置顶</th>
              <th>浏览量</th>
              <th>有用数</th>
              <th>状态</th>
              <th>创建人</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in faqs" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.title }}</td>
              <td><span class="tag info">{{ r.category }}</span></td>
              <td>{{ r.pinned ? '★' : '☆' }}</td>
              <td>{{ r.views }}</td>
              <td>{{ r.helpful }}</td>
              <td><span class="tag ok">{{ r.status }}</span></td>
              <td>{{ r.creator }}</td>
              <td>{{ r.updated }}</td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link ok">查看</button>
                <button type="button" class="link warn">
                  {{ r.pinned ? '取消置顶' : '置顶' }}
                </button>
                <button type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ faqs.length }} 条，共 86 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.cat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-tag {
  padding: 6px 12px;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 14px;
}

.cat-tag.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}
</style>
