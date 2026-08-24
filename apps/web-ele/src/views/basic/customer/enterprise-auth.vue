<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { enterpriseAuths } from '#/views/_shared/data/basic-customer';

defineOptions({ name: 'EnterpriseAuth' });

const no = ref('');
const name = ref('');
const status = ref('全部');
const type = ref('全部');

const filtered = computed(() => {
  let rows = [...enterpriseAuths];
  if (no.value.trim()) rows = rows.filter((r) => r.no.includes(no.value.trim()));
  if (name.value.trim()) {
    rows = rows.filter((r) => r.name.includes(name.value.trim()));
  }
  if (status.value !== '全部') rows = rows.filter((r) => r.status === status.value);
  if (type.value !== '全部') rows = rows.filter((r) => r.type === type.value);
  return rows;
});

function typeClass(t: string) {
  if (t === '初次认证') return 'blue';
  if (t === '续期认证') return 'purple';
  if (t === '变更认证') return 'green';
  return 'orange';
}

function statusClass(s: string) {
  if (s === '待审核') return 'warn';
  if (s === '审核通过') return 'ok';
  if (s === '审核不通过') return 'danger';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>企业客户认证管理</h2>
        <p>审核企业客户初次认证、续期、变更与重新申请。</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" type="button" @click="ElMessage.success('批量续期（示例）')">
          批量续期
        </button>
        <button class="btn primary" type="button" @click="ElMessage.success('批量审核（示例）')">
          批量审核
        </button>
        <button class="btn" type="button" @click="ElMessage.success('导出（示例）')">
          导出
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>申请单号<input v-model="no" /></label>
        <label>企业名称<input v-model="name" /></label>
        <label>
          申请状态
          <select v-model="status">
            <option>全部</option>
            <option>待审核</option>
            <option>审核通过</option>
            <option>审核不通过</option>
            <option>已过期</option>
            <option>已撤销</option>
          </select>
        </label>
        <label>
          认证类型
          <select v-model="type">
            <option>全部</option>
            <option>初次认证</option>
            <option>续期认证</option>
            <option>变更认证</option>
            <option>重新申请</option>
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
        <label><input type="checkbox" /> 全选</label>
        <span class="count">共 {{ filtered.length }} 条记录</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>序号</th>
              <th>申请单号</th>
              <th>企业名称</th>
              <th>统一社会信用代码</th>
              <th>认证类型</th>
              <th>申请日期</th>
              <th>申请状态</th>
              <th>预计完成日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.id }}</td>
              <td>{{ r.no }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.credit }}</td>
              <td><span class="tag" :class="typeClass(r.type)">{{ r.type }}</span></td>
              <td>{{ r.date }}</td>
              <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.due }}</td>
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
      <div class="pager">显示 1 到 {{ filtered.length }} 条，共 86 条记录</div>
    </section>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.filter {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
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
  align-items: center;
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

.tag.orange {
  color: #e6a23c;
  background: #fdf6ec;
}

.tag.warn {
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

@media (max-width: 1100px) {
  .filter {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
