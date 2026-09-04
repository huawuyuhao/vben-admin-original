<script lang="ts" setup>
import { ElMessage } from 'element-plus';

defineOptions({ name: 'ContentCase' });

/** 案例列表（待对接接口） */
const cases: never[] = [];

</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 案例中心 / 案例内容管理</div>
    <header class="head">
      <div>
        <h2>案例内容管理</h2>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">导入</button>
        <button class="btn" type="button">导出</button>
        <button class="btn danger" type="button">批量删除</button>
        <button class="btn primary" type="button" @click="ElMessage.success('新增案例（示例）')">
          + 新增案例
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>128</strong><span>总案例数</span></div>
      <div class="kpi"><strong>96</strong><span>已发布</span></div>
      <div class="kpi"><strong>16</strong><span>待审核</span></div>
      <div class="kpi"><strong>16</strong><span>草稿</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>案例标题<input placeholder="请输入案例标题关键字" /></label>
        <label>一级分类<select><option>全部</option></select></label>
        <label>二级分类<select><option>全部</option></select></label>
        <label>状态<select><option>全部</option></select></label>
        <label>发布时间<input type="date" /></label>
        <label>客户名称<input placeholder="请输入客户名称" /></label>
        <label>是否推荐<select><option>全部</option></select></label>
        <label>排序方式<select><option>最新发布优先</option></select></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <label><input type="checkbox" /> 共 128 条记录</label>
        <span class="count"><button class="btn" type="button">批量操作</button></span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>案例标题</th>
              <th>封面图</th>
              <th>分类</th>
              <th>客户名称</th>
              <th>是否推荐</th>
              <th>浏览量</th>
              <th>状态</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in cases" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.title }}</td>
              <td><div class="thumb"></div></td>
              <td><span class="tag info">{{ r.category }}</span></td>
              <td>{{ r.customer }}</td>
              <td>{{ r.recommend ? '★' : '☆' }}</td>
              <td>{{ r.views }}</td>
              <td>
                <span class="tag" :class="r.status === '已发布' ? 'ok' : 'warn'">{{
                  r.status
                }}</span>
              </td>
              <td>{{ r.publish }}</td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link ok">查看</button>
                <button
                  type="button"
                  class="link"
                  :class="r.status === '已发布' ? 'warn' : 'purple'"
                >
                  {{ r.status === '已发布' ? '下线' : '审核' }}
                </button>
                <button type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ cases.length }} 条，共 128 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
