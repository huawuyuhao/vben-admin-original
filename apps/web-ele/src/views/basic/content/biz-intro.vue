<script lang="ts" setup>
import { ElMessage } from 'element-plus';

import { bizIntros } from '#/views/_shared/data/basic-content';

defineOptions({ name: 'ContentBizIntro' });

function typeClass(t: string) {
  if (t.includes('AI')) return 'purple';
  if (t.includes('存储')) return 'ok';
  if (t.includes('安全')) return 'warn';
  return 'info';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 业务介绍管理</div>
    <header class="head">
      <div>
        <h2>业务介绍内容管理</h2>
        <p>管理门户业务介绍内容与分类展示。</p>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">分类管理</button>
        <button class="btn primary" type="button" @click="ElMessage.success('新增业务介绍（示例）')">
          + 新增业务介绍
        </button>
        <button class="btn" type="button">导出</button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>8</strong><span>总业务介绍数</span></div>
      <div class="kpi"><strong>6</strong><span>已发布</span></div>
      <div class="kpi"><strong>1</strong><span>待审核</span></div>
      <div class="kpi"><strong>1</strong><span>草稿</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>关键词<input placeholder="请输入标题/关键词" /></label>
        <label>业务类型<select><option>全部</option></select></label>
        <label>状态<select><option>全部</option></select></label>
        <label>更新时间<input type="date" /></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <label><input type="checkbox" /> 共 {{ bizIntros.length }} 条记录</label>
        <span class="count"><button class="btn" type="button">批量操作</button></span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>排序</th>
              <th>业务标题</th>
              <th>业务类型</th>
              <th>封面图</th>
              <th>浏览量</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in bizIntros" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.sort }} ↕</td>
              <td>{{ r.title }}</td>
              <td><span class="tag" :class="typeClass(r.type)">{{ r.type }}</span></td>
              <td><div class="thumb" /></td>
              <td>{{ r.views }}</td>
              <td><span class="tag ok">{{ r.status }}</span></td>
              <td>{{ r.updated }}</td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link ok">查看</button>
                <button type="button" class="link warn">下线</button>
                <button type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ bizIntros.length }} 条，共 8 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
