<script lang="ts" setup>
import { ElMessage } from 'element-plus';

import { announces } from '#/views/_shared/data/basic-content';

defineOptions({ name: 'ContentAnnounce' });
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 活动公告管理</div>
    <header class="head">
      <div>
        <h2>活动公告管理</h2>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">导入</button>
        <button class="btn" type="button">导出</button>
        <button class="btn danger" type="button">批量删除</button>
        <button class="btn primary" type="button" @click="ElMessage.success('新增公告（示例）')">
          + 新增公告
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>58</strong><span>总公告数</span></div>
      <div class="kpi"><strong>32</strong><span>已发布</span></div>
      <div class="kpi"><strong>8</strong><span>待发布</span></div>
      <div class="kpi"><strong>18</strong><span>已过期</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>公告标题<input placeholder="请输入公告标题关键字" /></label>
        <label>公告类型<select><option>全部</option></select></label>
        <label>发布状态<select><option>全部</option></select></label>
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
        <label><input type="checkbox" /> 共 58 条记录</label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>公告标题</th>
              <th>类型</th>
              <th>是否置顶</th>
              <th>浏览量</th>
              <th>状态</th>
              <th>发布时间</th>
              <th>失效时间</th>
              <th>创建人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in announces" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.title }}</td>
              <td>
                <span class="tag" :class="r.type === '系统公告' ? 'info' : 'warn'">{{
                  r.type
                }}</span>
              </td>
              <td>{{ r.pinned ? '📌' : '☆' }}</td>
              <td>{{ r.views }}</td>
              <td>
                <span class="tag" :class="r.status === '已发布' ? 'ok' : 'info'">{{
                  r.status
                }}</span>
              </td>
              <td>{{ r.publish }}</td>
              <td>{{ r.expire }}</td>
              <td>{{ r.creator }}</td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link ok">查看</button>
                <button type="button" class="link warn">
                  {{ r.status === '已发布' ? '取消置顶' : '立即发布' }}
                </button>
                <button type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ announces.length }} 条，共 58 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
