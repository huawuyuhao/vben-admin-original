<script lang="ts" setup>
import { reactive, ref } from 'vue';

const toast = ref('');

const form = reactive({
  name: '张运营',
  phone: '139****6666',
  email: 'zhangyy@csg.cn',
  org: '数字化运营部门',
  userType: '运营用户',
});

const original = { ...form };

const loginLogs = [
  { device: '🟢 Web 浏览器 · Chrome', time: '2026-08-20 15:30' },
  { device: '🟢 Web 浏览器 · Chrome', time: '2026-08-19 09:12' },
  { device: '🟡 移动端 · 微信', time: '2026-08-18 18:45' },
  { device: '🟢 Web 浏览器 · Edge', time: '2026-08-17 10:00' },
];

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function save() {
  showToast('保存成功（示例）');
}

function reset() {
  Object.assign(form, original);
  showToast('已重置');
}
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>个人信息</h2>
      <p>展示用户个人姓名、手机号等基础信息，保障信息准确性与安全性。</p>
    </div>

    <div class="portal-profile-grid">
      <div class="portal-card">
        <div class="portal-card-title">基本信息</div>
        <div class="portal-form-group">
          <label class="portal-form-label">
            用户名称 <span class="required">*</span>
          </label>
          <input v-model="form.name" class="portal-form-input" type="text" />
        </div>
        <div class="portal-form-group">
          <label class="portal-form-label">
            手机号 <span class="required">*</span>
          </label>
          <input v-model="form.phone" class="portal-form-input" type="text" />
        </div>
        <div class="portal-form-group">
          <label class="portal-form-label">邮箱</label>
          <input v-model="form.email" class="portal-form-input" type="text" />
        </div>
        <div class="portal-form-group">
          <label class="portal-form-label">所属组织</label>
          <input
            v-model="form.org"
            class="portal-form-input"
            type="text"
            disabled
          />
        </div>
        <div class="portal-form-group">
          <label class="portal-form-label">用户类型</label>
          <select v-model="form.userType" class="portal-form-select" disabled>
            <option value="运营用户">运营用户</option>
          </select>
        </div>
        <div class="portal-form-actions">
          <button
            class="portal-btn portal-btn-primary"
            type="button"
            @click="save"
          >
            保存修改
          </button>
          <button
            class="portal-btn portal-btn-outline"
            type="button"
            @click="reset"
          >
            重置
          </button>
        </div>
      </div>

      <div>
        <div class="portal-card" style="margin-bottom: 20px">
          <div class="portal-card-title">服务数据统计</div>
          <div class="portal-mini-stat-grid">
            <div class="portal-mini-stat purple">
              <div class="num">156</div>
              <div class="lbl">累计提交需求</div>
            </div>
            <div class="portal-mini-stat green">
              <div class="num">142</div>
              <div class="lbl">已完成任务</div>
            </div>
            <div class="portal-mini-stat blue">
              <div class="num">8</div>
              <div class="lbl">在运应用</div>
            </div>
            <div class="portal-mini-stat orange">
              <div class="num">¥8.6K</div>
              <div class="lbl">本月消费</div>
            </div>
          </div>
        </div>

        <div class="portal-card">
          <div class="portal-card-title">最近登录日志</div>
          <div class="portal-login-log">
            <div
              v-for="(log, idx) in loginLogs"
              :key="idx"
              class="portal-login-log-item"
            >
              <span>{{ log.device }}</span>
              <span class="time">{{ log.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

