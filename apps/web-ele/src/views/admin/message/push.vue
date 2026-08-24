<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { messagePushList } from '#/views/_shared/data/admin-message';

defineOptions({ name: 'AdminMessagePush' });

const target = ref('');
const channel = ref('全部');

const filtered = computed(() => {
  let rows = [...messagePushList];
  if (target.value.trim()) {
    rows = rows.filter((r) => r.scope.includes(target.value.trim()));
  }
  if (channel.value !== '全部') {
    rows = rows.filter((r) => r.channel === channel.value);
  }
  return rows;
});

function channelClass(c: string) {
  if (c === '短信') return 'warn';
  if (c === '站内信') return 'info';
  return 'purple';
}

function statusClass(s: string) {
  return s === '已推送' ? 'ok' : 'warn';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 消息管理 / 消息推送</div>
    <header class="head">
      <div>
        <h2>消息推送</h2>
        <p>支持即时、批量与精准推送</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('即时推送（示例）')"
        >
          即时推送
        </button>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('批量推送（示例）')"
        >
          批量推送
        </button>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('精准推送（示例）')"
        >
          精准推送
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          推送对象
          <input v-model="target" placeholder="请输入用户/群组" />
        </label>
        <label>
          渠道
          <select v-model="channel">
            <option>全部</option>
            <option>短信</option>
            <option>站内信</option>
            <option>邮件</option>
          </select>
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              target = '';
              channel = '全部';
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
              <th>推送任务</th>
              <th>对象范围</th>
              <th>渠道</th>
              <th>状态</th>
              <th>推送时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.task }}</td>
              <td>{{ r.scope }}</td>
              <td>
                <span class="tag" :class="channelClass(r.channel)">
                  {{ r.channel }}
                </span>
              </td>
              <td>
                <span class="tag" :class="statusClass(r.status)">
                  ● {{ r.status }}
                </span>
              </td>
              <td>{{ r.time }}</td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`详情 ${r.task}`)"
                >
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 96 条记录 · 每页 10 条</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
