<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  profileFields,
  profileOverview,
} from '#/views/_shared/data/admin-personal';

defineOptions({ name: 'AdminPersonalProfile' });

const tab = ref<'overview' | 'manage'>('overview');
const name = ref('');
const phone = ref('');

/** 个人信息管理 Tab：可维护的基础字段 */
const manageSource = profileFields.filter((r) =>
  ['姓名', '手机号', '邮箱'].includes(r.field),
);

const filtered = computed(() => {
  let rows = [...manageSource];
  if (name.value.trim()) {
    rows = rows.filter(
      (r) => r.field === '姓名' && r.value.includes(name.value.trim()),
    );
  }
  if (phone.value.trim()) {
    rows = rows.filter(
      (r) => r.field === '手机号' && r.value.includes(phone.value.trim()),
    );
  }
  return rows;
});

function verifyClass(v: string) {
  return v === '已校验' ? 'ok' : 'warn';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 个人中心 / 个人中心服务 / 个人信息管理</div>
    <header class="head">
      <div>
        <h2>个人信息管理</h2>
        <p>查看个人中心概况，并维护个人基础信息与校验状态</p>
      </div>
    </header>

    <div class="page-tabs card">
      <button
        type="button"
        :class="{ active: tab === 'overview' }"
        @click="tab = 'overview'"
      >
        个人中心
      </button>
      <button
        type="button"
        :class="{ active: tab === 'manage' }"
        @click="tab = 'manage'"
      >
        个人信息管理
      </button>
    </div>

    <template v-if="tab === 'overview'">
      <div class="kpi-row">
        <div class="kpi">
          <strong class="ok-text">{{ profileOverview.accountStatus }}</strong>
          <span>
            账号状态 · {{ profileOverview.verified ? '已认证' : '未认证' }}
          </span>
        </div>
        <div class="kpi">
          <strong class="ok-text">{{ profileOverview.securityLevel }}</strong>
          <span>安全等级</span>
        </div>
        <div class="kpi">
          <strong class="device-text">{{ profileOverview.devices }}</strong>
          <span>登录设备</span>
        </div>
        <div class="kpi">
          <strong class="warn-text">{{ profileOverview.todos }}</strong>
          <span>待办事项</span>
        </div>
      </div>

      <section class="card">
        <div class="toolbar">
          <strong>个人中心</strong>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>字段</th>
                <th>内容</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in profileFields" :key="r.id">
                <td>{{ r.field }}</td>
                <td>
                  <span v-if="r.field === '角色'" class="tag info">
                    {{ r.value }}
                  </span>
                  <template v-else>{{ r.value }}</template>
                </td>
                <td>{{ r.remark }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="card">
        <div class="toolbar">
          <strong>个人信息管理</strong>
          <button
            class="btn primary"
            type="button"
            @click="ElMessage.success('已保存（示例）')"
          >
            保存
          </button>
        </div>
        <div class="filter">
          <label>
            姓名
            <input v-model="name" placeholder="请输入姓名" />
          </label>
          <label>
            手机号
            <input v-model="phone" placeholder="请输入手机号" />
          </label>
          <div class="filter-actions">
            <button
              class="btn"
              type="button"
              @click="
                name = '';
                phone = '';
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
                <th>字段</th>
                <th>当前值</th>
                <th>校验状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in filtered" :key="r.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ r.field }}</td>
                <td>{{ r.value }}</td>
                <td>
                  <span class="tag" :class="verifyClass(r.verify)">
                    ● {{ r.verify }}
                  </span>
                </td>
                <td class="ops">
                  <button
                    type="button"
                    class="link"
                    @click="ElMessage.success(`修改 ${r.field}`)"
                  >
                    修改
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">共 {{ filtered.length }} 条记录</div>
      </section>
    </template>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.ok-text {
  color: #67c23a;
}

.device-text {
  color: #409eff;
}

.warn-text {
  color: #e6a23c;
}
</style>
