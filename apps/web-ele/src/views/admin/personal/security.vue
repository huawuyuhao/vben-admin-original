<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  activeSessions,
  loginRecords,
  passwordChecks,
} from '#/views/_shared/data/admin-personal';

defineOptions({ name: 'AdminPersonalSecurity' });

const tab = ref<'password' | 'logout' | 'records'>('password');
const oldPwd = ref('');
const newPwd = ref('');
const confirmPwd = ref('');

const sessions = ref(activeSessions.map((s) => ({ ...s })));

const dateStart = ref('');
const dateEnd = ref('');
const statusFilter = ref('全部');
const queryTick = ref(0);

const filteredRecords = computed(() => {
  void queryTick.value;
  return loginRecords.filter((r) => {
    if (statusFilter.value !== '全部' && r.status !== statusFilter.value) {
      return false;
    }
    if (dateStart.value && r.time.slice(0, 10) < dateStart.value) {
      return false;
    }
    if (dateEnd.value && r.time.slice(0, 10) > dateEnd.value) {
      return false;
    }
    return true;
  });
});

function resultClass(r: string) {
  return r === '通过' || r === '成功' || r === '活跃' ? 'ok' : 'danger';
}

function updatePassword() {
  if (!oldPwd.value || !newPwd.value || !confirmPwd.value) {
    ElMessage.warning('请完整填写密码信息');
    return;
  }
  if (newPwd.value !== confirmPwd.value) {
    ElMessage.warning('两次输入的新密码不一致');
    return;
  }
  ElMessage.success('密码已修改（示例）');
}

function logoutAll() {
  sessions.value = [];
  ElMessage.success('已退出全部登录（示例）');
}

function logoutOne(id: number) {
  sessions.value = sessions.value.filter((s) => s.id !== id);
  ElMessage.success('已退出该会话（示例）');
}

function resetRecordsFilter() {
  dateStart.value = '';
  dateEnd.value = '';
  statusFilter.value = '全部';
  queryTick.value += 1;
}

function searchRecords() {
  queryTick.value += 1;
  ElMessage.success('已查询（示例）');
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 个人中心 / 个人中心服务 / 账户安全管理</div>
    <header class="head">
      <div>
        <h2>账户安全管理</h2>
        <p>修改登录密码、安全退出与登录记录查询</p>
      </div>
    </header>

    <div class="page-tabs card">
      <button
        type="button"
        :class="{ active: tab === 'password' }"
        @click="tab = 'password'"
      >
        登录密码修改
      </button>
      <button
        type="button"
        :class="{ active: tab === 'logout' }"
        @click="tab = 'logout'"
      >
        安全退出登录
      </button>
      <button
        type="button"
        :class="{ active: tab === 'records' }"
        @click="tab = 'records'"
      >
        登录记录查询
      </button>
    </div>

    <template v-if="tab === 'password'">
      <section class="card">
        <div class="toolbar">
          <strong>登录密码修改</strong>
          <button class="btn primary" type="button" @click="updatePassword">
            修改密码
          </button>
        </div>
        <div class="filter">
          <label>
            旧密码
            <input v-model="oldPwd" type="password" placeholder="请输入旧密码" />
          </label>
          <label>
            新密码
            <input v-model="newPwd" type="password" placeholder="请输入新密码" />
          </label>
          <label>
            确认密码
            <input
              v-model="confirmPwd"
              type="password"
              placeholder="请再次输入"
            />
          </label>
          <div class="filter-actions">
            <button
              class="btn"
              type="button"
              @click="
                oldPwd = '';
                newPwd = '';
                confirmPwd = '';
              "
            >
              重置
            </button>
            <button class="btn primary" type="button" @click="updatePassword">
              查询
            </button>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>校验项</th>
                <th>结果</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in passwordChecks" :key="r.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ r.item }}</td>
                <td>
                  <span class="tag" :class="resultClass(r.result)">
                    ● {{ r.result }}
                  </span>
                </td>
                <td>{{ r.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">共 1 条记录</div>
      </section>
    </template>

    <template v-else-if="tab === 'logout'">
      <section class="card">
        <div class="toolbar">
          <strong>安全退出登录</strong>
          <button class="btn primary" type="button" @click="logoutAll">
            退出登录
          </button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>当前会话</th>
                <th>设备</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sessions.length === 0">
                <td colspan="5" class="empty">暂无活跃会话</td>
              </tr>
              <tr v-for="(r, idx) in sessions" :key="r.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ r.session }}</td>
                <td>{{ r.device }}</td>
                <td>
                  <span class="tag" :class="resultClass(r.status)">
                    ● {{ r.status }}
                  </span>
                </td>
                <td class="ops">
                  <button
                    type="button"
                    class="link danger-link"
                    @click="logoutOne(r.id)"
                  >
                    退出
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">共 {{ sessions.length }} 条记录</div>
      </section>
    </template>

    <template v-else>
      <section class="card">
        <div class="toolbar">
          <strong>登录记录查询</strong>
          <button
            class="btn primary"
            type="button"
            @click="ElMessage.success('已导出（示例）')"
          >
            导出
          </button>
        </div>
        <div class="filter">
          <label>
            时间范围
            <span class="date-range">
              <input v-model="dateStart" type="date" />
              <span>-</span>
              <input v-model="dateEnd" type="date" />
            </span>
          </label>
          <label>
            状态
            <select v-model="statusFilter">
              <option>全部</option>
              <option>成功</option>
              <option>失败</option>
            </select>
          </label>
          <div class="filter-actions">
            <button class="btn" type="button" @click="resetRecordsFilter">
              重置
            </button>
            <button class="btn primary" type="button" @click="searchRecords">
              查询
            </button>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="toolbar">
          <span class="count">共 {{ filteredRecords.length }} 条记录</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>登录时间</th>
                <th>IP地址</th>
                <th>设备</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in filteredRecords" :key="r.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ r.time }}</td>
                <td>{{ r.ip }}</td>
                <td>{{ r.device }}</td>
                <td>
                  <span class="tag" :class="resultClass(r.status)">
                    ● {{ r.status }}
                  </span>
                </td>
                <td class="ops">
                  <button
                    type="button"
                    class="link"
                    @click="ElMessage.info(`详情：${r.time} / ${r.ip}`)"
                  >
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">共 {{ filteredRecords.length }} 条记录</div>
      </section>
    </template>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.danger-link {
  color: #f56c6c !important;
}

.empty {
  padding: 24px;
  color: #909399;
  text-align: center;
}

.date-range {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.date-range input {
  width: 140px;
}
</style>
