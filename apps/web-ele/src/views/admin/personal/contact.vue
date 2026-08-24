<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { contactList } from '#/views/_shared/data/admin-personal';

defineOptions({ name: 'AdminPersonalContact' });

const phone = ref('');
const code = ref('');
const list = ref(contactList.map((c) => ({ ...c })));

function statusClass(s: string) {
  return s === '已验证' ? 'ok' : 'warn';
}

function sendCode() {
  if (!phone.value.trim()) {
    ElMessage.warning('请输入新手机号');
    return;
  }
  ElMessage.success('验证码已发送（示例）');
}

function save() {
  if (!phone.value.trim() || !code.value.trim()) {
    ElMessage.warning('请填写手机号与验证码');
    return;
  }
  ElMessage.success('联系信息已更新（示例）');
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 个人中心 / 个人中心服务 / 联系信息更新</div>
    <header class="head">
      <div>
        <h2>联系信息更新</h2>
        <p>更新并验证手机号、邮箱等联系方式</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" type="button" @click="sendCode">
          发送验证码
        </button>
        <button class="btn primary" type="button" @click="save">保存</button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          手机号
          <input v-model="phone" placeholder="请输入新手机号" />
        </label>
        <label>
          验证码
          <input v-model="code" placeholder="请输入验证码" />
        </label>
        <div class="filter-actions">
          <button
            class="btn"
            type="button"
            @click="
              phone = '';
              code = '';
            "
          >
            重置
          </button>
          <button class="btn primary" type="button" @click="save">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <span class="count">共 {{ list.length }} 条记录</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>联系方式</th>
              <th>验证状态</th>
              <th>最近验证</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in list" :key="r.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ r.type }} {{ r.value }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">
                  ● {{ r.status }}
                </span>
              </td>
              <td>{{ r.lastVerify }}</td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`更新 ${r.type}`)"
                >
                  更新
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`验证 ${r.type}`)"
                >
                  验证
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">共 {{ list.length }} 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
