<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { orgChangeHistory } from '#/views/_shared/data/admin-org';

defineOptions({ name: 'AdminOrgHistory' });

const org = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const filtered = computed(() => {
  let rows = [...orgChangeHistory];
  if (org.value.trim()) {
    rows = rows.filter((r) => r.org.includes(org.value.trim()));
  }
  return rows;
});

function actionClass(a: string) {
  if (a === '新增') return 'ok';
  if (a === '编辑') return 'warn';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 系统管理 / 组织管理 / 组织架构变更历史</div>
    <header class="head">
      <div>
        <h2>组织架构变更历史</h2>
        <p>查询组织新增、编辑、停用等变更记录</p>
      </div>
      <div class="head-actions">
        <button
          class="btn"
          type="button"
          @click="ElMessage.success('导出（示例）')"
        >
          导出
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          组织
          <input v-model="org" placeholder="请输入组织" />
        </label>
        <label>
          开始日期
          <input v-model="dateFrom" type="date" />
        </label>
        <label>
          结束日期
          <input v-model="dateTo" type="date" />
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              org = '';
              dateFrom = '';
              dateTo = '';
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
              <th>组织</th>
              <th>操作类型</th>
              <th>操作人</th>
              <th>变更时间</th>
              <th>说明</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in filtered" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.org }}</td>
              <td>
                <span class="tag" :class="actionClass(r.action)">
                  {{ r.action }}
                </span>
              </td>
              <td>{{ r.operator }}</td>
              <td>{{ r.time }}</td>
              <td>{{ r.remark }}</td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`详情 ${r.org}`)"
                >
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 126 条记录 · 每页 10 条</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
