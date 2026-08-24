<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  evalForms,
  formQuestions,
  triggerRules,
} from '#/views/_shared/data/basic-feedback';

defineOptions({ name: 'FeedbackForm' });

const tab = ref<'form' | 'trigger' | 'questions'>('form');
const forms = ref(evalForms.map((f) => ({ ...f })));
const triggers = ref(triggerRules.map((t) => ({ ...t })));
const questions = ref(formQuestions.map((q) => ({ ...q })));

function statusClass(s: string) {
  return s === '启用' ? 'ok' : 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 基础管理 / 用户意见反馈管理 / 评价表单配置</div>
    <header class="head">
      <div>
        <h2>评价表单配置</h2>
        <p>配置评价表单、题目结构与触发时机规则</p>
      </div>
      <div class="head-actions">
        <button
          v-if="tab === 'form'"
          class="btn primary"
          type="button"
          @click="ElMessage.success('新增评价表单（示例）')"
        >
          + 新增表单
        </button>
        <button
          v-else-if="tab === 'trigger'"
          class="btn primary"
          type="button"
          @click="ElMessage.success('新增触发规则（示例）')"
        >
          + 新增触发规则
        </button>
        <button
          v-else
          class="btn primary"
          type="button"
          @click="ElMessage.success('新增题目（示例）')"
        >
          + 新增题目
        </button>
      </div>
    </header>

    <div class="page-tabs card">
      <button type="button" :class="{ active: tab === 'form' }" @click="tab = 'form'">
        评价表单
      </button>
      <button
        type="button"
        :class="{ active: tab === 'questions' }"
        @click="tab = 'questions'"
      >
        题目配置
      </button>
      <button
        type="button"
        :class="{ active: tab === 'trigger' }"
        @click="tab = 'trigger'"
      >
        触发时机管理
      </button>
    </div>

    <template v-if="tab === 'form'">
      <div class="kpi-row">
        <div class="kpi"><strong>{{ forms.length }}</strong><span>表单总数</span></div>
        <div class="kpi">
          <strong>{{ forms.filter((f) => f.status === '启用').length }}</strong>
          <span>启用中</span>
        </div>
        <div class="kpi"><strong>3</strong><span>关联业务场景</span></div>
        <div class="kpi"><strong>1,286</strong><span>累计回收评价</span></div>
      </div>

      <section class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>表单名称</th>
                <th>适用场景</th>
                <th>题目数</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in forms" :key="f.id">
                <td>{{ f.name }}</td>
                <td>{{ f.scene }}</td>
                <td>{{ f.questions }}</td>
                <td>
                  <span class="tag" :class="statusClass(f.status)">{{ f.status }}</span>
                </td>
                <td>{{ f.updated }}</td>
                <td class="ops">
                  <button
                    type="button"
                    class="link"
                    @click="ElMessage.success(`编辑 ${f.name}`)"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    class="link"
                    @click="ElMessage.success(`预览 ${f.name}`)"
                  >
                    预览
                  </button>
                  <button
                    type="button"
                    class="link danger"
                    @click="ElMessage.success(`删除 ${f.name}`)"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <template v-else-if="tab === 'questions'">
      <section class="card">
        <div class="toolbar">
          <strong>默认题目模板</strong>
          <span class="count">共 {{ questions.length }} 题</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>题目标题</th>
                <th>题型</th>
                <th>是否必填</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(q, idx) in questions" :key="q.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ q.title }}</td>
                <td>{{ q.type }}</td>
                <td>
                  <span class="tag" :class="q.required ? 'info' : 'mute'">
                    {{ q.required ? '必填' : '选填' }}
                  </span>
                </td>
                <td class="ops">
                  <button
                    type="button"
                    class="link"
                    @click="ElMessage.success(`编辑题目 ${q.title}`)"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    class="link danger"
                    @click="ElMessage.success(`删除题目 ${q.title}`)"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="card">
        <div class="toolbar">
          <strong>触发时机管理</strong>
          <span class="count">共 {{ triggers.length }} 条规则</span>
        </div>
        <div class="trigger-list">
          <div v-for="t in triggers" :key="t.id" class="trigger-row">
            <div class="trigger-main">
              <div class="trigger-name">{{ t.name }}</div>
              <div class="trigger-desc">
                {{ t.desc }}
                <span class="scene">{{ t.scene }}</span>
              </div>
            </div>
            <label class="switch">
              <input v-model="t.enabled" type="checkbox" />
              <span>{{ t.enabled ? '启用' : '停用' }}</span>
            </label>
            <div class="ops">
              <button
                type="button"
                class="link"
                @click="ElMessage.success(`编辑 ${t.name}`)"
              >
                编辑
              </button>
              <button
                type="button"
                class="link danger"
                @click="ElMessage.success(`删除 ${t.name}`)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.trigger-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trigger-row {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.trigger-main {
  flex: 1;
  min-width: 0;
}

.trigger-name {
  margin-bottom: 4px;
  font-weight: 600;
}

.trigger-desc {
  color: #909399;
  font-size: 13px;
}

.scene {
  margin-left: 8px;
  color: #303133;
  font-weight: 500;
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
</style>
