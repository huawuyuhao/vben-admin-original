<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { personArchives, personKpis } from '#/views/_shared/data/basic-customer';

defineOptions({ name: 'PersonArchive' });

const name = ref('');
const idNo = ref('');
const phone = ref('');
const status = ref('全部');
const auth = ref('全部');

const filtered = computed(() => {
  let rows = [...personArchives];
  if (name.value.trim()) rows = rows.filter((r) => r.name.includes(name.value.trim()));
  if (idNo.value.trim()) rows = rows.filter((r) => r.idNo.includes(idNo.value.trim()));
  if (phone.value.trim()) {
    rows = rows.filter((r) => r.phone.includes(phone.value.trim()));
  }
  if (status.value !== '全部') rows = rows.filter((r) => r.status === status.value);
  if (auth.value !== '全部') rows = rows.filter((r) => r.auth === auth.value);
  return rows;
});

function statusClass(s: string) {
  if (s === '活跃') return 'ok';
  if (s === '沉降') return 'warn';
  return 'danger';
}

function authClass(a: string) {
  if (a === '已认证') return 'ok';
  if (a === '待认证') return 'warn';
  if (a === '未通过') return 'danger';
  return 'expire';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>个人客户档案管理</h2>
        <p>管理个人客户资料、状态与认证信息。</p>
      </div>
      <div class="head-actions">
        <button class="btn" type="button" @click="ElMessage.success('导入（示例）')">
          导入
        </button>
        <button class="btn" type="button" @click="ElMessage.success('导出（示例）')">
          导出
        </button>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新增个人客户（示例）')"
        >
          + 新增个人客户
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div v-for="k in personKpis" :key="k.label" class="kpi">
        <strong>{{ k.value }}</strong>
        <span>{{ k.label }}</span>
        <em :class="k.up ? 'up' : 'down'">{{ k.trend }}</em>
      </div>
    </div>

    <section class="card">
      <div class="filter">
        <label>姓名<input v-model="name" /></label>
        <label>身份证号<input v-model="idNo" /></label>
        <label>手机号<input v-model="phone" /></label>
        <label>
          客户状态
          <select v-model="status">
            <option>全部</option>
            <option>活跃</option>
            <option>沉降</option>
            <option>黑名单</option>
          </select>
        </label>
        <label>
          认证状态
          <select v-model="auth">
            <option>全部</option>
            <option>已认证</option>
            <option>待认证</option>
            <option>未通过</option>
            <option>已过期</option>
          </select>
        </label>
        <div class="filter-actions">
          <button class="btn primary" type="button">查询</button>
          <button
            class="btn"
            type="button"
            @click="
              name = '';
              idNo = '';
              phone = '';
              status = '全部';
              auth = '全部';
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
        <button class="btn" type="button" @click="ElMessage.info('加入黑名单（示例）')">
          加入黑名单
        </button>
        <button class="btn" type="button" @click="ElMessage.info('偏好设置')">
          偏好设置
        </button>
        <span class="count">共 12,580 条记录</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>序号</th>
              <th>姓名</th>
              <th>身份证号</th>
              <th>手机号</th>
              <th>邮箱</th>
              <th>客户状态</th>
              <th>认证状态</th>
              <th>注册日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.id }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.idNo }}</td>
              <td>{{ r.phone }}</td>
              <td>{{ r.email }}</td>
              <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
              <td><span class="tag" :class="authClass(r.auth)">{{ r.auth }}</span></td>
              <td>{{ r.date }}</td>
              <td class="ops">
                <button type="button" class="link">查看</button>
                <button type="button" class="link">编辑</button>
                <button
                  v-if="r.status === '黑名单'"
                  type="button"
                  class="link"
                >
                  移除黑名单
                </button>
                <button v-else type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ filtered.length }} 条，共 12,580 条记录</div>
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
  flex-wrap: wrap;
  gap: 8px;
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

.tag.ok {
  color: #67c23a;
  background: #f0f9eb;
}

.tag.warn {
  color: #e6a23c;
  background: #fdf6ec;
}

.tag.danger {
  color: #f56c6c;
  background: #fef0f0;
}

.tag.expire {
  color: #e6a23c;
  background: #fdf6ec;
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

.link.danger {
  color: #f56c6c;
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
