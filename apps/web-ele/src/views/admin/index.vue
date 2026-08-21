<script lang="ts" setup>
import { ref } from 'vue';

const keyword = ref('');
const typeFilter = ref('all');
const statusFilter = ref('all');
const toast = ref('');

const users = [
  {
    id: 'USR-00001',
    name: '系统管理员',
    type: '系统管理员',
    typeClass: 'portal-badge-info',
    org: '数字化运营部门',
    phone: '138****8888',
    role: '超级管理员',
    status: '正常',
    statusClass: 'portal-badge-success',
  },
  {
    id: 'USR-00002',
    name: '张运营',
    type: '运营用户',
    typeClass: 'portal-badge-warning',
    org: '数字化运营部门',
    phone: '139****6666',
    role: '运营管理员',
    status: '正常',
    statusClass: 'portal-badge-success',
  },
  {
    id: 'USR-00003',
    name: '李调度',
    type: '协同调度人员',
    typeClass: 'portal-badge-gray',
    org: '电力调度中心',
    phone: '137****5555',
    role: '调度员',
    status: '正常',
    statusClass: 'portal-badge-success',
  },
  {
    id: 'USR-00004',
    name: '王需求',
    type: '算力需求用户',
    typeClass: 'portal-badge-success',
    org: '某科技有限公司',
    phone: '136****4444',
    role: '企业用户',
    status: '正常',
    statusClass: 'portal-badge-success',
  },
  {
    id: 'USR-00005',
    name: '赵供给',
    type: '算力供给用户',
    typeClass: 'portal-badge-info',
    org: '某数据中心有限公司',
    phone: '135****3333',
    role: '供给方',
    status: '待认证',
    statusClass: 'portal-badge-warning',
  },
  {
    id: 'USR-00006',
    name: '陈访客',
    type: '访客用户',
    typeClass: 'portal-badge-gray',
    org: '-',
    phone: '-',
    role: '-',
    status: '禁用',
    statusClass: 'portal-badge-danger',
  },
];

const roles = [
  { name: '超级管理员', desc: '系统全权限管理', count: 1 },
  { name: '运营管理员', desc: '日常运营管理', count: 5 },
  { name: '协同调度人员', desc: '电碳算调度与监控', count: 8 },
  { name: '算力需求用户', desc: '提交算力需求', count: 86 },
  { name: '算力供给用户', desc: '提供算力资源', count: 12 },
  { name: '访客用户', desc: '仅浏览公开信息', count: 16 },
];

const orgTree = [
  { name: '南方电网公司', level: 0, count: '', active: true },
  { name: '数字化运营部门', level: 1, count: '14人' },
  { name: '电力调度中心', level: 1, count: '8人' },
  { name: '算力服务部', level: 1, count: '12人' },
  { name: '算力运营组', level: 2, count: '6人' },
  { name: '技术保障组', level: 2, count: '6人' },
];

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>用户管理</h2>
      <p>
        支持新增、删除系统用户，用户分类包含系统管理员、运营用户、企业用户等。支持按用户名称、手机号等信息查询用户信息。
      </p>
    </div>

    <div class="portal-filter-bar">
      <div class="portal-search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="keyword"
          type="text"
          placeholder="用户名称、手机号..."
        />
      </div>
      <select v-model="typeFilter">
        <option value="all">全部用户类型</option>
        <option value="系统管理员">系统管理员</option>
        <option value="运营用户">运营用户</option>
        <option value="企业用户">企业用户</option>
        <option value="算力需求用户">算力需求用户</option>
        <option value="算力供给用户">算力供给用户</option>
      </select>
      <select v-model="statusFilter">
        <option value="all">全部状态</option>
        <option value="正常">正常</option>
        <option value="禁用">禁用</option>
      </select>
      <button
        class="portal-btn portal-btn-primary portal-btn-sm"
        type="button"
        @click="showToast('打开新增用户表单（示例）')"
      >
        + 新增用户
      </button>
    </div>

    <div class="portal-card" style="padding: 0; overflow: hidden; margin-bottom: 20px">
      <table class="portal-data-table">
        <thead>
          <tr>
            <th>用户编号</th>
            <th>用户名称</th>
            <th>用户类型</th>
            <th>所属组织</th>
            <th>手机号</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in users" :key="row.id">
            <td class="portal-col-id">{{ row.id }}</td>
            <td>{{ row.name }}</td>
            <td>
              <span class="portal-badge" :class="row.typeClass">{{ row.type }}</span>
            </td>
            <td>{{ row.org }}</td>
            <td>{{ row.phone }}</td>
            <td>{{ row.role }}</td>
            <td>
              <span class="portal-badge" :class="row.statusClass">
                {{ row.status }}
              </span>
            </td>
            <td>
              <template v-if="row.status === '禁用'">
                <button
                  class="portal-btn-text portal-btn-sm"
                  type="button"
                  @click="showToast('启用用户')"
                >
                  启用
                </button>
              </template>
              <template v-else-if="row.status === '待认证'">
                <button
                  class="portal-btn-text portal-btn-sm"
                  type="button"
                  @click="showToast('审核')"
                >
                  审核
                </button>
                <button
                  class="portal-btn-text portal-btn-sm"
                  type="button"
                  @click="showToast('编辑')"
                >
                  编辑
                </button>
              </template>
              <template v-else>
                <button
                  class="portal-btn-text portal-btn-sm"
                  type="button"
                  @click="showToast('编辑')"
                >
                  编辑
                </button>
                <button
                  class="portal-btn-text portal-btn-sm"
                  type="button"
                  @click="showToast('权限')"
                >
                  权限
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <div style="padding: 16px">
        <div class="portal-pagination">
          <span class="portal-page-info">共 128 条记录</span>
          <button type="button">上一页</button>
          <button class="active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">...</button>
          <button type="button">22</button>
          <button type="button">下一页</button>
        </div>
      </div>
    </div>

    <div class="portal-two-col">
      <div class="portal-card">
        <div class="portal-card-title">
          <span>角色管理</span>
          <button
            class="portal-btn portal-btn-primary portal-btn-sm"
            type="button"
            @click="showToast('新增角色')"
          >
            + 新增角色
          </button>
        </div>
        <table class="portal-data-table">
          <thead>
            <tr>
              <th>角色名称</th>
              <th>职位描述</th>
              <th>用户数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.name">
              <td>{{ role.name }}</td>
              <td>{{ role.desc }}</td>
              <td>{{ role.count }}</td>
              <td>
                <button
                  class="portal-btn-text portal-btn-sm"
                  type="button"
                  @click="showToast(`编辑角色：${role.name}`)"
                >
                  编辑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="portal-card">
        <div class="portal-card-title">
          <span>组织架构</span>
          <button
            class="portal-btn portal-btn-primary portal-btn-sm"
            type="button"
            @click="showToast('新增组织')"
          >
            + 新增组织
          </button>
        </div>
        <div class="org-tree">
          <div
            v-for="(node, idx) in orgTree"
            :key="idx"
            class="org-node"
            :class="{ active: node.active }"
            :style="{ paddingLeft: `${12 + node.level * 24}px` }"
          >
            <span>{{ node.level === 0 ? '📂' : node.level === 1 ? '📁' : '📄' }}</span>
            <span>{{ node.name }}</span>
            <span v-if="node.count" class="portal-badge portal-badge-gray org-count">
              {{ node.count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>

.org-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.org-node {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
}

.org-node.active {
  font-weight: 600;
  color: var(--portal-primary, #6b4cff);
  background: var(--portal-primary-bg, #f0edff);
}

.org-count {
  margin-left: auto;
}
</style>
