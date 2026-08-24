<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { orgList } from '#/views/_shared/data/admin-org';

defineOptions({ name: 'AdminOrgMaintain' });

const name = ref('');
const status = ref('全部');
const showModal = ref(false);
const form = ref({
  name: '',
  code: '',
  parent: '总部',
  status: '启用',
});

const filtered = computed(() => {
  let rows = [...orgList];
  if (name.value.trim()) {
    rows = rows.filter((r) => r.name.includes(name.value.trim()));
  }
  if (status.value !== '全部') {
    rows = rows.filter((r) => r.status === status.value);
  }
  return rows;
});

function statusClass(s: string) {
  return s === '启用' ? 'ok' : 'mute';
}

function openAdd() {
  form.value = { name: '', code: '', parent: '总部', status: '启用' };
  showModal.value = true;
}

function save() {
  if (!form.value.name.trim() || !form.value.code.trim()) {
    ElMessage.warning('请填写组织名称与编号');
    return;
  }
  showModal.value = false;
  ElMessage.success('已新增组织（示例）');
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 组织管理 / 组织维护</div>
    <header class="head">
      <div>
        <h2>组织维护</h2>
        <p>维护组织节点、上下级关系与启用状态</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" type="button" @click="openAdd">
          + 新增组织
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          组织名称
          <input v-model="name" placeholder="请输入组织名称" />
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>启用</option>
            <option>停用</option>
          </select>
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              name = '';
              status = '全部';
            "
          >
            重置
          </button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <span class="count">共 {{ filtered.length }} 条记录</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>组织名称</th>
              <th>编号</th>
              <th>上级组织</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.code }}</td>
              <td>{{ r.parent }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">
                  ● {{ r.status }}
                </span>
              </td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`编辑 ${r.name}`)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="link danger"
                  @click="ElMessage.success(`删除 ${r.name}`)"
                >
                  删除
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`详情 ${r.name}`)"
                >
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 42 条记录 · 每页 10 条</div>
    </section>

    <div v-if="showModal" class="mask" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-head">
          <strong>新增组织</strong>
          <button type="button" class="link" @click="showModal = false">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <label>
            <span class="req">组织名称</span>
            <input v-model="form.name" placeholder="请输入组织名称" />
          </label>
          <label>
            <span class="req">编号</span>
            <input v-model="form.code" placeholder="如 ORG-HD-001" />
          </label>
          <label>
            上级组织
            <select v-model="form.parent">
              <option>总部</option>
              <option>华东算力运营中心</option>
              <option>华南运营分部</option>
            </select>
          </label>
          <label>
            状态
            <select v-model="form.status">
              <option>启用</option>
              <option>停用</option>
            </select>
          </label>
        </div>
        <div class="modal-foot">
          <button class="btn" type="button" @click="showModal = false">
            取消
          </button>
          <button class="btn primary" type="button" @click="save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal {
  width: min(480px, 92vw);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.modal-head,
.modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #ebeef5;
}

.modal-foot {
  gap: 8px;
  justify-content: flex-end;
  border-bottom: none;
  border-top: 1px solid #ebeef5;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.modal-body label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.modal-body input,
.modal-body select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.req::before {
  margin-right: 4px;
  color: #f56c6c;
  content: '*';
}
</style>
