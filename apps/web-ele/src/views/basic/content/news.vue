<script lang="ts" setup>
import { ElMessage } from 'element-plus';

import { newsList } from '#/views/_shared/data/basic-content';

defineOptions({ name: 'ContentNews' });

function catClass(c: string) {
  if (c === '行业动态') return 'info';
  if (c === '技术解析') return 'purple';
  if (c === '案例分享') return 'ok';
  return 'danger';
}

function statusClass(s: string) {
  if (s === '已发布') return 'ok';
  if (s === '待审核') return 'warn';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 行业资讯管理</div>
    <header class="head">
      <div>
        <h2>行业资讯管理</h2>
        <p>管理行业资讯内容，支持分类管理、富文本编辑、跳转链接配置</p>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">分类管理</button>
        <button class="btn primary" type="button" @click="ElMessage.success('新增资讯（示例）')">
          + 新增资讯
        </button>
        <button class="btn" type="button">导出</button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>资讯标题<input placeholder="请输入资讯标题关键字" /></label>
        <label>资讯分类<select><option>全部</option></select></label>
        <label>状态<select><option>全部</option></select></label>
        <label>发布时间<input type="date" /></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <label><input type="checkbox" /> 共 86 条记录</label>
        <span class="count"><button class="btn" type="button">批量操作</button></span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>资讯标题</th>
              <th>分类</th>
              <th>封面图</th>
              <th>作者</th>
              <th>浏览量</th>
              <th>状态</th>
              <th>发布时间</th>
              <th>跳转链接</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in newsList" :key="r.id">
              <td><input type="checkbox" /></td>
              <td><button type="button" class="link">{{ r.title }}</button></td>
              <td><span class="tag" :class="catClass(r.category)">{{ r.category }}</span></td>
              <td><div class="thumb" /></td>
              <td>{{ r.author }}</td>
              <td>{{ r.views }}</td>
              <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.publish }}</td>
              <td><button type="button" class="link">{{ r.link }}</button></td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link">查看</button>
                <button v-if="r.status === '已发布'" type="button" class="link warn">下线</button>
                <button v-if="r.status === '草稿'" type="button" class="link">提交审核</button>
                <button type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ newsList.length }} 条，共 86 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
