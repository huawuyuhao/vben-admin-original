<script lang="ts" setup>
import { ElMessage } from 'element-plus';

import {
  messageCategories,
  messageTemplates,
} from '#/views/_shared/data/admin-message';

defineOptions({ name: 'AdminMessageConfig' });

function statusClass(s: string) {
  return s === '启用' ? 'ok' : 'mute';
}

function categoryClass(c: string) {
  if (c.includes('需求')) return 'info';
  if (c.includes('认证')) return 'ok';
  return 'purple';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 消息管理 / 消息配置</div>
    <header class="head">
      <div>
        <h2>消息配置</h2>
        <p>维护消息分类与消息模板</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新增分类（示例）')"
        >
          + 新增分类
        </button>
        <button
          class="btn"
          type="button"
          @click="ElMessage.success('新增模板（示例）')"
        >
          + 新增模板
        </button>
      </div>
    </header>

    <section class="card">
      <div class="toolbar">
        <strong>消息分类与模板</strong>
        <span class="count">共 {{ messageCategories.length }} 条</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>分类名称</th>
              <th>编码</th>
              <th>说明</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in messageCategories" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.code }}</td>
              <td>{{ r.desc }}</td>
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <strong>消息模板管理</strong>
        <span class="count">共 {{ messageTemplates.length }} 条</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>模板名称</th>
              <th>业务分类</th>
              <th>标题</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in messageTemplates" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.name }}</td>
              <td>
                <span class="tag" :class="categoryClass(r.category)">
                  {{ r.category }}
                </span>
              </td>
              <td>{{ r.title }}</td>
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
                  class="link warn"
                  @click="ElMessage.success(`禁用 ${r.name}`)"
                >
                  禁用
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
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
