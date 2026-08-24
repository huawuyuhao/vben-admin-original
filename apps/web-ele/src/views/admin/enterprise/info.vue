<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import {
  type EnterpriseAuthStatus,
  type EnterpriseInfo,
  defaultEnterpriseInfo,
  industryOptions,
} from '#/views/_shared/data/enterprise-center';

/** 模拟：当前登录为企业主账号，可编辑 */
const isMainAccount = ref(true);

const saved = reactive<EnterpriseInfo>({ ...defaultEnterpriseInfo });
const form = reactive<EnterpriseInfo>({ ...defaultEnterpriseInfo });
const editing = ref(false);
const toast = ref('');
const errors = reactive<Record<string, string>>({});

const authTip = computed(() => {
  const map: Record<EnterpriseAuthStatus, string> = {
    已认证: '企业已完成认证，关键信息变更后需重新提交审核。',
    待审核: '企业认证资料审核中，请耐心等待。',
    未认证: '企业尚未认证，请完善信息后提交认证。',
    需重新认证: '关键信息已变更，请重新提交企业认证审核。',
  };
  return map[form.authStatus];
});

function authClass(s: EnterpriseAuthStatus) {
  if (s === '已认证') return 'portal-badge-success';
  if (s === '待审核') return 'portal-badge-warning';
  if (s === '需重新认证') return 'portal-badge-danger';
  return 'portal-badge-gray';
}

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2600);
}

function clearErrors() {
  Object.keys(errors).forEach((k) => {
    delete errors[k];
  });
}

function startEdit() {
  if (!isMainAccount.value) {
    showToast('仅企业主账号可修改企业基础信息');
    return;
  }
  Object.assign(form, saved);
  clearErrors();
  editing.value = true;
}

function cancelEdit() {
  Object.assign(form, saved);
  clearErrors();
  editing.value = false;
}

function validate(): boolean {
  clearErrors();
  let ok = true;

  if (!form.orgName.trim()) {
    errors.orgName = '企业名称不能为空';
    ok = false;
  }
  if (!form.legalPerson.trim()) {
    errors.legalPerson = '法人姓名不能为空';
    ok = false;
  }
  if (!form.contactName.trim()) {
    errors.contactName = '联系人不能为空';
    ok = false;
  }
  if (!/^1\d{10}$/.test(form.phone.trim())) {
    errors.phone = '手机号需为 11 位数字且以 1 开头';
    ok = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = '邮箱格式不正确';
    ok = false;
  }
  if (!form.address.trim()) {
    errors.address = '企业地址不能为空';
    ok = false;
  }
  if (!form.industry) {
    errors.industry = '请选择所属行业';
    ok = false;
  }

  return ok;
}

function save() {
  if (!validate()) {
    showToast('请修正表单中的错误后再保存');
    return;
  }

  const nameChanged = form.orgName.trim() !== saved.orgName;
  Object.assign(saved, {
    ...form,
    creditCode: saved.creditCode,
    registerName: form.orgName.trim(),
  });

  if (nameChanged) {
    saved.authStatus = '需重新认证';
    form.authStatus = '需重新认证';
    showToast('该信息已变更，需重新认证审核');
  } else {
    showToast('保存成功');
  }

  Object.assign(form, saved);
  editing.value = false;
}

function printInfo() {
  window.print();
}

function submitReAuth() {
  form.authStatus = '待审核';
  saved.authStatus = '待审核';
  saved.lastAuditAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  form.lastAuditAt = saved.lastAuditAt;
  showToast('已提交企业认证审核（示例）');
}
</script>

<template>
  <div class="portal-inner-page enterprise-info-page">
    <div class="page-head">
      <div class="portal-page-title">
        <h2>企业信息管理</h2>
        <p>
          维护企业基础信息，支持在线编辑与格式校验；修改企业名称等关键字段需重新提交认证审核。
        </p>
      </div>
      <div class="head-actions no-print">
        <button
          class="portal-btn portal-btn-outline portal-btn-sm"
          type="button"
          @click="printInfo"
        >
          打印
        </button>
        <template v-if="!editing">
          <button
            class="portal-btn portal-btn-primary portal-btn-sm"
            type="button"
            @click="startEdit"
          >
            编辑信息
          </button>
        </template>
        <template v-else>
          <button
            class="portal-btn portal-btn-outline portal-btn-sm"
            type="button"
            @click="cancelEdit"
          >
            取消
          </button>
          <button
            class="portal-btn portal-btn-primary portal-btn-sm"
            type="button"
            @click="save"
          >
            保存
          </button>
        </template>
      </div>
    </div>

    <div class="auth-banner" :class="authClass(form.authStatus)">
      <div class="auth-main">
        <span class="portal-badge" :class="authClass(form.authStatus)">
          {{ form.authStatus }}
        </span>
        <div>
          <strong>企业认证状态</strong>
          <p>{{ authTip }}</p>
        </div>
      </div>
      <div class="auth-meta">
        <span>最近审核：{{ form.lastAuditAt || '—' }}</span>
        <button
          v-if="form.authStatus === '需重新认证' || form.authStatus === '未认证'"
          class="portal-btn portal-btn-primary portal-btn-sm no-print"
          type="button"
          @click="submitReAuth"
        >
          提交认证审核
        </button>
      </div>
    </div>

    <div v-if="!isMainAccount" class="hint-bar no-print">
      当前为子账号，仅可查看企业信息；修改需使用企业主账号。
    </div>

    <!-- 基础信息 -->
    <section class="portal-card section-card">
      <h3 class="section-title">基础信息</h3>
      <div class="form-grid">
        <div class="portal-form-group">
          <label class="portal-form-label">
            企业名称 <span class="required">*</span>
          </label>
          <input
            v-model="form.orgName"
            class="portal-form-input"
            type="text"
            :disabled="!editing"
            placeholder="请输入企业名称"
          />
          <p v-if="errors.orgName" class="field-error">{{ errors.orgName }}</p>
          <p v-else-if="editing" class="field-hint">
            修改企业名称后需重新提交认证审核
          </p>
        </div>

        <div class="portal-form-group">
          <label class="portal-form-label">注册名称</label>
          <input
            class="portal-form-input"
            type="text"
            :value="form.registerName"
            disabled
          />
        </div>

        <div class="portal-form-group">
          <label class="portal-form-label">
            法人姓名 <span class="required">*</span>
          </label>
          <input
            v-model="form.legalPerson"
            class="portal-form-input"
            type="text"
            :disabled="!editing"
            placeholder="请输入法人姓名"
          />
          <p v-if="errors.legalPerson" class="field-error">
            {{ errors.legalPerson }}
          </p>
        </div>

        <div class="portal-form-group">
          <label class="portal-form-label">统一社会信用代码</label>
          <input
            class="portal-form-input"
            type="text"
            :value="form.creditCode"
            disabled
          />
          <p class="field-hint">统一社会信用代码不可修改</p>
        </div>

        <div class="portal-form-group">
          <label class="portal-form-label">算力客户类型</label>
          <input
            class="portal-form-input"
            type="text"
            :value="form.customerType"
            disabled
          />
        </div>

        <div class="portal-form-group">
          <label class="portal-form-label">
            所属行业 <span class="required">*</span>
          </label>
          <select
            v-model="form.industry"
            class="portal-form-select"
            :disabled="!editing"
          >
            <option v-for="item in industryOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <p v-if="errors.industry" class="field-error">{{ errors.industry }}</p>
        </div>

        <div class="portal-form-group full">
          <label class="portal-form-label">
            企业地址 <span class="required">*</span>
          </label>
          <input
            v-model="form.address"
            class="portal-form-input"
            type="text"
            :disabled="!editing"
            placeholder="请输入企业地址"
          />
          <p v-if="errors.address" class="field-error">{{ errors.address }}</p>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="portal-card section-card">
      <h3 class="section-title">联系方式</h3>
      <div class="form-grid">
        <div class="portal-form-group">
          <label class="portal-form-label">
            联系人 <span class="required">*</span>
          </label>
          <input
            v-model="form.contactName"
            class="portal-form-input"
            type="text"
            :disabled="!editing"
            placeholder="请输入联系人"
          />
          <p v-if="errors.contactName" class="field-error">
            {{ errors.contactName }}
          </p>
        </div>

        <div class="portal-form-group">
          <label class="portal-form-label">
            手机号 <span class="required">*</span>
          </label>
          <input
            v-model="form.phone"
            class="portal-form-input"
            type="text"
            maxlength="11"
            :disabled="!editing"
            placeholder="请输入 11 位手机号"
          />
          <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
        </div>

        <div class="portal-form-group">
          <label class="portal-form-label">
            邮箱 <span class="required">*</span>
          </label>
          <input
            v-model="form.email"
            class="portal-form-input"
            type="text"
            :disabled="!editing"
            placeholder="name@example.com"
          />
          <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
        </div>
      </div>
    </section>

    <!-- 服务与合同概览（只读） -->
    <section class="portal-card section-card">
      <h3 class="section-title">服务与合同概览</h3>
      <div class="overview-grid">
        <div class="overview-item">
          <span class="label">供给方名称</span>
          <strong>{{ form.supplierName }}</strong>
        </div>
        <div class="overview-item">
          <span class="label">算力资源数量</span>
          <strong>{{ form.resourceCount }}</strong>
        </div>
        <div class="overview-item">
          <span class="label">接入状态</span>
          <strong>{{ form.accessStatus }}</strong>
        </div>
        <div class="overview-item">
          <span class="label">合同主体名称</span>
          <strong>{{ form.contractSubject }}</strong>
        </div>
        <div class="overview-item">
          <span class="label">合同状态</span>
          <strong>{{ form.contractStatus }}</strong>
        </div>
        <div class="overview-item">
          <span class="label">认证信息状态</span>
          <strong>{{ form.authStatus }}</strong>
        </div>
      </div>
    </section>

    <div v-if="toast" class="portal-toast no-print">{{ toast }}</div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.head-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  padding-top: 4px;
}

.auth-banner {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eeeeee);
  border-radius: 12px;
}

.auth-banner.portal-badge-success {
  background: #f3faf5;
  border-color: #c8e6c9;
}

.auth-banner.portal-badge-warning {
  background: #fff8e8;
  border-color: #ffe0a3;
}

.auth-banner.portal-badge-danger {
  background: #fff5f5;
  border-color: #ffcdd2;
}

.auth-banner.portal-badge-gray {
  background: #fafafa;
}

.auth-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.auth-main strong {
  display: block;
  margin-bottom: 2px;
  font-size: 14px;
}

.auth-main p {
  margin: 0;
  font-size: 13px;
  color: var(--portal-gray-600, #757575);
}

.auth-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.hint-bar {
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #b26a00;
  background: #fff8e8;
  border-radius: 8px;
}

.section-card {
  padding: 18px 20px 8px;
  margin-bottom: 16px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 20px;
}

.form-grid .full {
  grid-column: 1 / -1;
}

@media (max-width: 800px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.field-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--portal-red, #f44336);
}

.field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding-bottom: 12px;
}

@media (max-width: 900px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.overview-item {
  padding: 12px 14px;
  background: var(--portal-gray-50, #fafafa);
  border-radius: 10px;
}

.overview-item .label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.overview-item strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--portal-gray-900, #212121);
}

.portal-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 2000;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
}

@media print {
  .no-print {
    display: none !important;
  }

  .enterprise-info-page {
    background: #fff;
  }

  .section-card,
  .auth-banner {
    box-shadow: none;
    break-inside: avoid;
  }
}
</style>
