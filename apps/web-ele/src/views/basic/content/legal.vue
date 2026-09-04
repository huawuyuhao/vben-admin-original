<script lang="ts" setup>
import { ElMessage } from 'element-plus';

defineOptions({ name: 'ContentLegal' });

/** 法律条款列表（待对接接口） */
const legalTerms: never[] = [];

</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 法律条款管理</div>
    <header class="head">
      <div>
        <h2>法律条款与协议管理</h2>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">导入</button>
        <button class="btn" type="button">导出</button>
        <button class="btn danger" type="button">批量删除</button>
        <button class="btn primary" type="button" @click="ElMessage.success('新增条款（示例）')">
          + 新增条款
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>12</strong><span>总条款数</span></div>
      <div class="kpi"><strong>6</strong><span>生效中</span></div>
      <div class="kpi"><strong>2</strong><span>待生效</span></div>
      <div class="kpi"><strong>4</strong><span>已过期</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>条款标题<input placeholder="请输入条款标题关键字" /></label>
        <label>条款类型<select><option>全部</option></select></label>
        <label>状态<select><option>全部</option></select></label>
        <label>是否强制同意<select><option>全部</option></select></label>
        <label>生效时间<input type="date" /></label>
        <label>适用平台<select><option>全部</option></select></label>
        <label>排序方式<select><option>最新发布优先</option></select></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>条款标题</th>
              <th>类型</th>
              <th>版本号</th>
              <th>强制同意</th>
              <th>生效时间</th>
              <th>失效时间</th>
              <th>状态</th>
              <th>适用平台</th>
              <th>签署人数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in legalTerms" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.title }}</td>
              <td>
                <span class="tag" :class="r.type === '隐私政策' ? 'warn' : 'info'">{{
                  r.type
                }}</span>
              </td>
              <td>{{ r.version }}</td>
              <td>{{ r.force ? '✓' : '-' }}</td>
              <td>{{ r.effect }}</td>
              <td>{{ r.expire }}</td>
              <td>
                <span class="tag" :class="r.status === '生效中' ? 'ok' : 'info'">{{
                  r.status
                }}</span>
              </td>
              <td>{{ r.platform }}</td>
              <td>{{ r.signs }}</td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link">查看</button>
                <button type="button" class="link">历史版本</button>
                <button type="button" class="link">签署记录</button>
                <button v-if="r.status === '待生效'" type="button" class="link ok">
                  立即生效
                </button>
                <button type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ legalTerms.length }} 条，共 12 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
