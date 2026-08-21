<script lang="ts" setup>
import { reactive, ref } from 'vue';

const active = ref('account');
const agreed = ref(false);
const toast = ref('');

const accountForm = reactive({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  userType: '',
});

const enterpriseForm = reactive({
  companyName: '',
  creditCode: '',
  legalPerson: '',
  contact: '',
  contactPhone: '',
});

const personForm = reactive({
  realName: '',
  idNumber: '',
  phone: '',
});

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function submitAccount() {
  if (!agreed.value) {
    showToast('请先阅读并同意服务协议与隐私政策');
    return;
  }
  showToast('注册提交成功（示例）');
}
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>注册认证</h2>
      <p>包含账号注册、企业用户认证信息提交、个人用户认证信息提交。</p>
    </div>

    <div class="portal-tabs">
      <div
        class="portal-tab"
        :class="{ active: active === 'account' }"
        @click="active = 'account'"
      >
        账号注册
      </div>
      <div
        class="portal-tab"
        :class="{ active: active === 'enterprise' }"
        @click="active = 'enterprise'"
      >
        企业用户认证
      </div>
      <div
        class="portal-tab"
        :class="{ active: active === 'person' }"
        @click="active = 'person'"
      >
        个人用户认证
      </div>
    </div>

    <!-- 账号注册 -->
    <div v-show="active === 'account'" class="portal-form-card">
      <div class="portal-form-group">
        <label class="portal-form-label">
          用户名 <span class="required">*</span>
        </label>
        <input
          v-model="accountForm.username"
          class="portal-form-input"
          type="text"
          placeholder="请输入用户名"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          手机号 <span class="required">*</span>
        </label>
        <div class="portal-form-row">
          <input
            v-model="accountForm.phone"
            class="portal-form-input"
            type="text"
            placeholder="请输入手机号"
          />
          <button
            class="portal-btn portal-btn-outline"
            type="button"
            @click="showToast('验证码已发送（示例）')"
          >
            获取验证码
          </button>
        </div>
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          验证码 <span class="required">*</span>
        </label>
        <input
          v-model="accountForm.code"
          class="portal-form-input"
          type="text"
          placeholder="请输入验证码"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          设置密码 <span class="required">*</span>
        </label>
        <input
          v-model="accountForm.password"
          class="portal-form-input"
          type="password"
          placeholder="请设置密码（8-20位）"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          确认密码 <span class="required">*</span>
        </label>
        <input
          v-model="accountForm.confirmPassword"
          class="portal-form-input"
          type="password"
          placeholder="请再次输入密码"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          用户类型 <span class="required">*</span>
        </label>
        <select v-model="accountForm.userType" class="portal-form-select">
          <option value="">请选择用户类型</option>
          <option value="demand">算力需求用户</option>
          <option value="supply">算力供给用户</option>
          <option value="person">个人用户</option>
        </select>
      </div>
      <label class="portal-form-check">
        <input v-model="agreed" type="checkbox" />
        <span>
          我已阅读并同意
          <a href="#" @click.prevent>《服务协议》</a>
          和
          <a href="#" @click.prevent>《隐私政策》</a>
        </span>
      </label>
      <button
        class="portal-btn portal-btn-primary portal-btn-block"
        type="button"
        @click="submitAccount"
      >
        注 册
      </button>
    </div>

    <!-- 企业用户认证 -->
    <div v-show="active === 'enterprise'" class="portal-form-card">
      <div class="portal-form-group">
        <label class="portal-form-label">
          企业名称 <span class="required">*</span>
        </label>
        <input
          v-model="enterpriseForm.companyName"
          class="portal-form-input"
          type="text"
          placeholder="请输入企业名称"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          统一社会信用代码 <span class="required">*</span>
        </label>
        <input
          v-model="enterpriseForm.creditCode"
          class="portal-form-input"
          type="text"
          placeholder="请输入统一社会信用代码"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          法定代表人 <span class="required">*</span>
        </label>
        <input
          v-model="enterpriseForm.legalPerson"
          class="portal-form-input"
          type="text"
          placeholder="请输入法定代表人"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          联系人 <span class="required">*</span>
        </label>
        <input
          v-model="enterpriseForm.contact"
          class="portal-form-input"
          type="text"
          placeholder="请输入联系人"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          联系电话 <span class="required">*</span>
        </label>
        <input
          v-model="enterpriseForm.contactPhone"
          class="portal-form-input"
          type="text"
          placeholder="请输入联系电话"
        />
      </div>
      <button
        class="portal-btn portal-btn-primary portal-btn-block"
        type="button"
        @click="showToast('企业认证已提交（示例）')"
      >
        提交认证
      </button>
    </div>

    <!-- 个人用户认证 -->
    <div v-show="active === 'person'" class="portal-form-card">
      <div class="portal-form-group">
        <label class="portal-form-label">
          真实姓名 <span class="required">*</span>
        </label>
        <input
          v-model="personForm.realName"
          class="portal-form-input"
          type="text"
          placeholder="请输入真实姓名"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          身份证号 <span class="required">*</span>
        </label>
        <input
          v-model="personForm.idNumber"
          class="portal-form-input"
          type="text"
          placeholder="请输入身份证号"
        />
      </div>
      <div class="portal-form-group">
        <label class="portal-form-label">
          手机号 <span class="required">*</span>
        </label>
        <input
          v-model="personForm.phone"
          class="portal-form-input"
          type="text"
          placeholder="请输入手机号"
        />
      </div>
      <button
        class="portal-btn portal-btn-primary portal-btn-block"
        type="button"
        @click="showToast('个人认证已提交（示例）')"
      >
        提交认证
      </button>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

