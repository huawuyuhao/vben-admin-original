<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  feedbackCategories,
  priorityRules,
} from '#/views/_shared/data/basic-feedback';

defineOptions({ name: 'FeedbackCategory' });

const categories = ref(feedbackCategories.map((c) => ({ ...c })));
const showModal = ref(false);
const form = ref({
  name: '',
  desc: '',
  priority: '中',
  enabled: true,
});

function openAdd() {
  form.value = { name: '', desc: '', priority: '中', enabled: true };
  showModal.value = true;
}

function save() {
  if (!form.value.name.trim()) {
    ElMessage.warning('请填写类型名称');
    return;
  }
  categories.value.push({
    id: Date.now(),
    name: form.value.name.trim(),
    desc: form.value.desc.trim() || '-',
    priority: form.value.priority,
    enabled: form.value.enabled,
    count: 0,
  });
  showModal.value = false;
  ElMessage.success('已保存反馈类型（示例）');
}

function priorityClass(p: string) {
  if (p === '高') return 'danger';
  if (p === '中') return 'warn';
  return 'ok';
}
</script>

<template>
  <div class="page">
    <div class="crumb">
      首页 / 基础管理 / 用户意见反馈管理 / 用户意见反馈分类配置
    </div>
    <header class="head">
      <div>
        <h2>用户意见反馈分类配置</h2>
        <p>配置反馈类型、默认优先级与启用状态</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" type="button" @click="openAdd">
          + 新增类型
        </button>
      </div>
    </header>

    <section class="card">
      <div class="toolbar">
        <strong>反馈类型列表</strong>
        <span class="count">共 {{ categories.length }} 类</span>
      </div>
      <div class="type-list">
        <div v-for="c in categories" :key="c.id" class="type-row">
          <div class="type-main">
            <div class="type-name">
              {{ c.name }}
              <span class="tag" :class="priorityClass(c.priority)">
                默认{{ c.priority }}优先级
              </span>
            </div>
            <div class="type-desc">{{ c.desc }} · 关联反馈 {{ c.count }} 条</div>
          </div>
          <label class="switch">
            <input v-model="c.enabled" type="checkbox" />
            <span>{{ c.enabled ? '启用' : '停用' }}</span>
          </label>
          <div class="ops">
            <button
              type="button"
              class="link"
              @click="ElMessage.success(`编辑 ${c.name}`)"
            >
              编辑
            </button>
            <button
              type="button"
              class="link danger"
              @click="ElMessage.success(`删除 ${c.name}`)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h3 class="section-title">优先级配置说明</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>优先级</th>
              <th>响应时间要求</th>
              <th>适用场景</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in priorityRules" :key="r.priority">
              <td>
                <span class="tag" :class="priorityClass(r.priority)">
                  {{ r.priority }}
                </span>
              </td>
              <td>{{ r.response }}</td>
              <td>{{ r.scene }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="showModal" class="mask" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-head">
          <strong>新增反馈类型</strong>
          <button type="button" class="link" @click="showModal = false">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <label>
            <span class="req">类型名称</span>
            <input v-model="form.name" placeholder="请输入类型名称" />
          </label>
          <label>
            类型描述
            <input v-model="form.desc" placeholder="请输入类型描述" />
          </label>
          <label>
            <span class="req">优先级</span>
            <select v-model="form.priority">
              <option>高</option>
              <option>中</option>
              <option>低</option>
            </select>
          </label>
          <label class="switch-row">
            状态
            <span class="switch">
              <input v-model="form.enabled" type="checkbox" />
              <span>{{ form.enabled ? '启用' : '停用' }}</span>
            </span>
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
.type-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-row {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.type-main {
  flex: 1;
  min-width: 0;
}

.type-name {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  font-weight: 600;
}

.type-desc {
  color: #909399;
  font-size: 13px;
}

.switch {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
}

.switch input {
  width: 36px;
  height: 18px;
  accent-color: #409eff;
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
}

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

.switch-row {
  flex-direction: row !important;
  align-items: center;
  justify-content: space-between;
}

.req::before {
  margin-right: 4px;
  color: #f56c6c;
  content: '*';
}
</style>
