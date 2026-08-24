<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { banners } from '#/views/_shared/data/basic-content';

defineOptions({ name: 'ContentBanner' });

const keyword = ref('');
const status = ref('全部');

const filtered = computed(() => {
  let rows = [...banners];
  if (keyword.value.trim()) {
    rows = rows.filter((r) => r.name.includes(keyword.value.trim()));
  }
  if (status.value !== '全部') {
    rows = rows.filter((r) => r.status === status.value);
  }
  return rows;
});

function statusClass(s: string) {
  if (s === '已发布') return 'ok';
  if (s === '待上线') return 'info';
  return 'warn';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 轮播图管理</div>
    <header class="head">
      <div>
        <h2>轮播图管理</h2>
        <p>管理首页轮播图内容，支持排序、定时发布、范围配置等功能</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" type="button" @click="ElMessage.success('新增轮播图（示例）')">
          + 新增轮播图
        </button>
        <button class="btn" type="button" @click="ElMessage.success('导出（示例）')">导出</button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>轮播图名称<input v-model="keyword" placeholder="请输入轮播图名称" /></label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>已发布</option>
            <option>待上线</option>
            <option>待审核</option>
          </select>
        </label>
        <label>发布时间<input type="date" /></label>
        <div class="filter-actions">
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <span>共 {{ filtered.length }} 条记录</span>
        <span class="count">
          <button class="btn" type="button">批量操作</button>
          <button class="btn" type="button" @click="ElMessage.success('已刷新')">↻</button>
        </span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>排序</th>
              <th>预览图</th>
              <th>轮播图名称</th>
              <th>跳转链接</th>
              <th>状态</th>
              <th>发布时间</th>
              <th>下线时间</th>
              <th>展示范围</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.sort }} ↕</td>
              <td><div class="thumb" /></td>
              <td>{{ r.name }}</td>
              <td>{{ r.link }}</td>
              <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.publish }}</td>
              <td>{{ r.offline }}</td>
              <td>{{ r.scope }}</td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link">预览</button>
                <button v-if="r.status === '已发布'" type="button" class="link warn">下线</button>
                <button type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ filtered.length }} 条，共 {{ filtered.length }} 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
