<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { personAuthKpis, personAuths } from '#/views/_shared/data/basic-customer';

defineOptions({ name: 'PersonAuth' });

const no = ref('');
const name = ref('');
const idNo = ref('');
const status = ref('全部');
const type = ref('全部');

const filtered = computed(() => {
  let rows = [...personAuths];
  if (no.value.trim()) rows = rows.filter((r) => r.no.includes(no.value.trim()));
  if (name.value.trim()) rows = rows.filter((r) => r.name.includes(name.value.trim()));
  if (idNo.value.trim()) rows = rows.filter((r) => r.idNo.includes(idNo.value.trim()));
  if (status.value !== '全部') rows = rows.filter((r) => r.status === status.value);
  if (type.value !== '全部') rows = rows.filter((r) => r.type === type.value);
  return rows;
});

function typeClass(t: string) {
  if (t === '身份证认证') return 'blue';
  if (t === '人脸识别') return 'purple';
  if (t === '银行卡认证') return 'green';
  return 'orange';
}

function statusClass(s: string) {
  if (s === '待审核') return 'warn';
  if (s === '审核通过') return 'ok';
  if (s === '审核不通过') return 'danger';
  if (s === '已过期') return 'expire';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>个人客户认证管理</h2>
        <p>审核个人客户身份、人脸、银行卡与企业员工认证申请。</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" type="button" @click="ElMessage.success('批量审核（示例）')">
          批量审核
        </button>
        <button class="btn" type="button" @click="ElMessage.success('导出（示例）')">
          导出
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div v-for="k in personAuthKpis" :key="k.label" class="kpi">
        <strong>{{ k.value }}</strong>
        <span>{{ k.label }}</span>
        <em :class="k.up ? 'up' : 'down'">{{ k.trend }}</em>
      </div>
    </div>

    <section class="card">
      <div class="filter">
        <label>申请单号<input v-model="no" /></label>
        <label>姓名<input v-model="name" /></label>
        <label>身份证号<input v-model="idNo" /></label>
        <label>
          申请状态
          <select v-model="status">
            <option>全部</option>
            <option>待审核</option>
            <option>审核通过</option>
            <option>审核不通过</option>
            <option>已过期</option>
            <option>已撤回</option>
          </select>
        </label>
        <label>
          认证类型
          <select v-model="type">
            <option>全部</option>
            <option>身份证认证</option>
            <option>人脸识别</option>
            <option>银行卡认证</option>
            <option>企业员工认证</option>
          </select>
        </label>
        <div class="filter-actions">
          <button class="btn primary" type="button">查询</button>
          <button
            class="btn"
            type="button"
            @click="
              no = '';
              name = '';
              idNo = '';
              status = '全部';
              type = '全部';
            "
          >
            重置
          </button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <span class="count">共 10,650 条记录</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>序号</th>
              <th>申请单号</th>
              <th>姓名</th>
              <th>身份证号</th>
              <th>认证类型</th>
              <th>申请日期</th>
              <th>申请状态</th>
              <th>有效期至</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.id }}</td>
              <td>{{ r.no }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.idNo }}</td>
              <td><span class="tag" :class="typeClass(r.type)">{{ r.type }}</span></td>
              <td>{{ r.date }}</td>
              <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.valid }}</td>
              <td class="ops">
                <button type="button" class="link">查看</button>
                <button v-if="r.status === '待审核'" type="button" class="link">审核</button>
                <button v-if="r.status === '待审核'" type="button" class="link">撤销</button>
                <button v-if="r.status === '已过期'" type="button" class="link">续期</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ filtered.length }} 条，共 10,650 条记录</div>
    </section>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.kpi em {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  font-style: normal;
}

.kpi em.up {
  color: #67c23a;
}

.kpi em.down {
  color: #f56c6c;
}

.filter {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
}

.filter label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.filter input,
.filter select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.toolbar {
  display: flex;
  margin-bottom: 12px;
}

.count {
  margin-left: auto;
  color: #909399;
  font-size: 13px;
}

.table-wrap {
  overflow: auto;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.tag.blue {
  color: #409eff;
  background: #ecf5ff;
}

.tag.purple {
  color: #6b4cff;
  background: #f3f0ff;
}

.tag.green,
.tag.ok {
  color: #67c23a;
  background: #f0f9eb;
}

.tag.orange,
.tag.warn,
.tag.expire {
  color: #e6a23c;
  background: #fdf6ec;
}

.tag.danger {
  color: #f56c6c;
  background: #fef0f0;
}

.tag.mute {
  color: #909399;
  background: #f4f4f5;
}

.ops {
  display: flex;
  gap: 8px;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.pager {
  padding-top: 12px;
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 900px) {
  .filter {
    grid-template-columns: 1fr;
  }
}
</style>
