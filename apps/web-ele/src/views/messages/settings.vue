<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'MineMessagesSettings' });

const saving = ref(false);
const form = reactive({
  demand: true,
  auth: true,
  subaccount: true,
  system: true,
  sms: false,
  email: true,
});

async function save() {
  saving.value = true;
  try {
    await new Promise((r) => setTimeout(r, 400));
    ElMessage.success('消息设置已保存（示例）');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="msg-settings">
    <header>
      <h2>消息设置</h2>
      <p>配置各类消息的站内提醒与推送偏好。</p>
    </header>

    <section class="card">
      <h3>站内消息接收</h3>
      <label class="row">
        <input v-model="form.demand" type="checkbox" />
        需求消息
      </label>
      <label class="row">
        <input v-model="form.auth" type="checkbox" />
        认证消息
      </label>
      <label class="row">
        <input v-model="form.subaccount" type="checkbox" />
        企业子账号消息
      </label>
      <label class="row">
        <input v-model="form.system" type="checkbox" />
        系统消息
      </label>
    </section>

    <section class="card">
      <h3>额外通知渠道</h3>
      <label class="row">
        <input v-model="form.sms" type="checkbox" />
        短信通知（重要消息）
      </label>
      <label class="row">
        <input v-model="form.email" type="checkbox" />
        邮件通知
      </label>
    </section>

    <button class="btn" :disabled="saving" type="button" @click="save">
      {{ saving ? '保存中…' : '保存设置' }}
    </button>
  </div>
</template>

<style scoped>
.msg-settings {
  max-width: 720px;
  padding: 8px 4px 28px;
}

header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 750;
  color: #1f2430;
}

header p {
  margin: 8px 0 18px;
  font-size: 13px;
  color: #8a94a6;
}

.card {
  padding: 18px 20px;
  margin-bottom: 14px;
  background: #fff;
  border: 1px solid rgba(107, 76, 255, 0.08);
  border-radius: 12px;
}

.card h3 {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2430;
}

.row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #3d4659;
  cursor: pointer;
}

.row:last-child {
  margin-bottom: 0;
}

.row input {
  accent-color: #6b4cff;
}

.btn {
  height: 40px;
  padding: 0 22px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #6b4cff, #8b7aff);
  border: 0;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(107, 76, 255, 0.25);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
