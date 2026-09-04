<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  auditLoginLogs,
  auditOpLogs,
} from '#/views/_shared/data/monitoring-system';

defineOptions({ name: 'SysAuditLog' });

const tab = ref<'login' | 'op'>('login');
const userType = ref('全部用户');
const loginStatus = ref('全部状态');
const dept = ref('全部部门');
const ip = ref('');
</script>

<template>
  <div class="page compact">
    <header class="head">
      <div class="title-row">
        <span class="icon-badge">↻</span>
        <div>
          <h2>系统审计日志</h2>
          <p>记录登录与关键操作行为，支撑审计追溯（非全屏内嵌页）。</p>
        </div>
      </div>
    </header>

    <div class="sub-tabs">
      <button
        type="button"
        class="sub-tab"
        :class="{ active: tab === 'login' }"
        @click="tab = 'login'"
      >
        登录日志
      </button>
      <button
        type="button"
        class="sub-tab"
        :class="{ active: tab === 'op' }"
        @click="tab = 'op'"
      >
        操作日志
      </button>
    </div>

    <section class="card filter-card">
      <div class="card-title">查询条件</div>
      <div class="filter">
        <label>
          用户类型
          <select v-model="userType">
            <option>全部用户</option>
            <option>运营人员</option>
            <option>管理员</option>
          </select>
        </label>
        <label>
          登录状态
          <select v-model="loginStatus">
            <option>全部状态</option>
            <option>成功</option>
            <option>失败</option>
          </select>
        </label>
        <label class="date-range">
          时间范围
          <span class="dates">
            <input type="date" />
            <i>—</i>
            <input type="date" />
          </span>
        </label>
        <label>
          组织架构
          <select v-model="dept">
            <option>全部部门</option>
            <option>技术部</option>
            <option>运维部</option>
            <option>数据中心</option>
          </select>
        </label>
        <label>
          IP 地址
          <input v-model="ip" placeholder="请输入 IP 地址（选填）" />
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              userType = '全部用户';
              loginStatus = '全部状态';
              dept = '全部部门';
              ip = '';
              ElMessage.info('已重置');
            "
          >
            重置
          </button>
          <button
            class="btn primary"
            type="button"
            @click="ElMessage.success('查询完成')"
          >
            查询
          </button>
        </div>
      </div>
    </section>

    <section v-if="tab === 'login'" class="card">
      <div class="card-title">
        登录日志列表
        <span class="right">
          <button
            class="btn"
            type="button"
            @click="ElMessage.success('已导出（示例）')"
          >
            导出
          </button>
          <button
            class="btn"
            type="button"
            @click="ElMessage.success('已刷新')"
          >
            ↻
          </button>
        </span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>用户名称</th>
              <th>所属部门</th>
              <th>登录时间</th>
              <th>IP 地址</th>
              <th>登录地点</th>
              <th>登录设备</th>
              <th>登录状态</th>
              <th>失败原因</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in auditLoginLogs" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.user }}</td>
              <td>{{ r.dept }}</td>
              <td>{{ r.time }}</td>
              <td>{{ r.ip }}</td>
              <td>{{ r.location }}</td>
              <td>{{ r.device }}</td>
              <td>
                <span
                  class="pill"
                  :class="r.status === '成功' ? 'ok' : 'danger'"
                >
                  {{ r.status }}
                </span>
              </td>
              <td>{{ r.reason }}</td>
              <td>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.info(`详情 ${r.user}`)"
                >
                  👁
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 {{ auditLoginLogs.length }} 条记录</div>
    </section>

    <section v-else class="card">
      <div class="card-title">操作日志列表</div>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>操作人</th>
            <th>模块</th>
            <th>操作</th>
            <th>时间</th>
            <th>结果</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in auditOpLogs" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.user }}</td>
            <td>{{ r.module }}</td>
            <td>{{ r.action }}</td>
            <td>{{ r.time }}</td>
            <td><span class="pill ok">{{ r.result }}</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.page.compact {
  max-width: 1200px;
}

.title-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.icon-badge {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #fff;
  background: #67c23a;
  border-radius: 50%;
}

.sub-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.sub-tab {
  padding: 10px 0;
  margin-bottom: -1px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
}

.sub-tab.active {
  font-weight: 600;
  color: #409eff;
  border-bottom-color: #409eff;
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
  font-size: 13px;
  color: #606266;
}

.filter input,
.filter select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.dates {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dates i {
  font-style: normal;
  color: #909399;
}

.filter-actions {
  display: flex;
  grid-column: 1 / -1;
  gap: 8px;
  justify-content: flex-end;
}

.table-wrap {
  overflow: auto;
}

table {
  width: 100%;
  min-width: 960px;
}

.pill {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 12px;
}

.pill.ok {
  color: #67c23a;
  background: #f0f9eb;
}

.pill.danger {
  color: #f56c6c;
  background: #fef0f0;
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
  font-size: 13px;
  color: #909399;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 900px) {
  .filter {
    grid-template-columns: 1fr;
  }
}
</style>
