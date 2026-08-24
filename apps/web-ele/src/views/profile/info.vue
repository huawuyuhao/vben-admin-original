<script lang="ts" setup>
import type { UploadFile } from 'element-plus';

import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage, ElUpload } from 'element-plus';

import {
  CERT_TYPE_OPTIONS,
  LEGAL_CERT_TYPE_OPTIONS,
  createDefaultProfile,
} from '#/views/_shared/data/profile-info';

defineOptions({ name: 'MineProfileInfo' });

type TabKey = 'basic' | 'realtime' | 'security';

const router = useRouter();
const activeTab = ref<TabKey>('basic');
const saving = ref(false);

const profile = reactive(createDefaultProfile());
const form = reactive(createDefaultProfile());
const errors = reactive<Record<string, string>>({});
const licenseList = ref<UploadFile[]>([]);
const pwdForm = reactive({
  oldPwd: '',
  newPwd: '',
  confirmPwd: '',
});

function onChangePassword() {
  if (!pwdForm.oldPwd || !pwdForm.newPwd || !pwdForm.confirmPwd) {
    ElMessage.warning('请完整填写密码信息');
    return;
  }
  if (pwdForm.newPwd !== pwdForm.confirmPwd) {
    ElMessage.warning('两次输入的新密码不一致');
    return;
  }
  ElMessage.success('密码已修改（示例）');
  pwdForm.oldPwd = '';
  pwdForm.newPwd = '';
  pwdForm.confirmPwd = '';
}

function clearErrors() {
  Object.keys(errors).forEach((k) => delete errors[k]);
}

function validate() {
  clearErrors();
  let ok = true;
  const fail = (key: string, msg: string) => {
    errors[key] = msg;
    ok = false;
  };
  if (!form.companyName.trim()) fail('companyName', '请输入企业名称');
  if (!form.certType) fail('certType', '请选择证件类型');
  if (!form.orgCode.trim()) fail('orgCode', '请输入组织机构代码');
  if (!form.contact.trim()) fail('contact', '请输入联系方式');
  if (!form.legalName.trim()) fail('legalName', '请输入法人姓名');
  if (!form.legalCertType) fail('legalCertType', '请选择法人证件类型');
  if (!form.legalCertNo.trim()) fail('legalCertNo', '请输入法人证件号码');
  return ok;
}

function onLicenseChange(file: UploadFile) {
  if (!file.raw) return;
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.raw.type)) {
    ElMessage.warning('仅支持 jpg / png');
    licenseList.value = [];
    return;
  }
  if (file.raw.size / 1024 / 1024 > 5) {
    ElMessage.warning('文件不能超过 5MB');
    licenseList.value = [];
    return;
  }
  if (form.licenseUrl) URL.revokeObjectURL(form.licenseUrl);
  form.licenseUrl = URL.createObjectURL(file.raw);
  licenseList.value = [file];
}

function removeLicense() {
  if (form.licenseUrl) URL.revokeObjectURL(form.licenseUrl);
  form.licenseUrl = '';
  licenseList.value = [];
}

async function onSave() {
  if (!validate()) {
    ElMessage.warning('请完善必填项');
    return;
  }
  saving.value = true;
  try {
    await new Promise((r) => setTimeout(r, 400));
    Object.assign(profile, { ...form });
    ElMessage.success('保存成功（示例）');
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  Object.assign(form, { ...profile });
  clearErrors();
  ElMessage.info('已取消修改');
}

function goAuth() {
  router.push('/mine/register/enterprise');
}

function editPhone() {
  ElMessage.info('修改手机号功能待对接');
}
</script>

<template>
  <div class="pi">
    <h2 class="pi-title">我的信息中心</h2>

    <section class="pi-banner">
      <div class="pi-banner__label">
        <span class="dot">👤</span>
        个人信息
      </div>
      <div class="pi-banner__card">
        <div class="avatar">{{ profile.username.slice(0, 1).toUpperCase() }}</div>
        <div class="cols">
          <div>
            <div class="row">
              <span class="k">用户名</span>
              <span>{{ profile.username }}</span>
            </div>
            <div class="row">
              <span class="k">账号 ID</span>
              <span>{{ profile.accountId }}</span>
            </div>
            <div class="row">
              <span class="k">注册时间</span>
              <span>{{ profile.registeredAt }}</span>
            </div>
          </div>
          <div>
            <div class="row">
              <span class="k">实名认证</span>
              <span class="v">
                <em
                  class="st"
                  :class="{
                    ok: profile.realNameStatus === '已认证',
                    warn: profile.realNameStatus === '审核中',
                  }"
                >
                  {{ profile.realNameStatus }}
                </em>
                <button class="link" type="button" @click="goAuth">修改</button>
              </span>
            </div>
            <div class="row">
              <span class="k">手机号码</span>
              <span class="v">
                {{ profile.phone }}
                <button class="link" type="button" @click="editPhone">
                  修改
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="pi-panel">
      <div class="tabs">
        <button
          type="button"
          :class="{ on: activeTab === 'basic' }"
          @click="activeTab = 'basic'"
        >
          基础信息
        </button>
        <button
          type="button"
          :class="{ on: activeTab === 'security' }"
          @click="activeTab = 'security'"
        >
          安全设置
        </button>
        <button
          type="button"
          :class="{ on: activeTab === 'realtime' }"
          @click="activeTab = 'realtime'"
        >
          实名认证
        </button>
      </div>

      <div v-show="activeTab === 'basic'">
        <div class="grid">
          <label class="field">
            <span class="lab">企业名称</span>
            <input
              v-model="form.companyName"
              class="ctl"
              :class="{ err: errors.companyName }"
              placeholder="请输入"
            />
            <span v-if="errors.companyName" class="msg">{{
              errors.companyName
            }}</span>
          </label>
          <label class="field">
            <span class="lab">法人姓名</span>
            <input
              v-model="form.legalName"
              class="ctl"
              :class="{ err: errors.legalName }"
              placeholder="请输入"
            />
            <span v-if="errors.legalName" class="msg">{{
              errors.legalName
            }}</span>
          </label>

          <label class="field">
            <span class="lab">证件类型</span>
            <select
              v-model="form.certType"
              class="ctl"
              :class="{ err: errors.certType }"
            >
              <option disabled value="">请选择</option>
              <option
                v-for="item in CERT_TYPE_OPTIONS"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
            <span v-if="errors.certType" class="msg">{{ errors.certType }}</span>
          </label>
          <label class="field">
            <span class="lab">法人证件类型</span>
            <select
              v-model="form.legalCertType"
              class="ctl"
              :class="{ err: errors.legalCertType }"
            >
              <option disabled value="">请选择</option>
              <option
                v-for="item in LEGAL_CERT_TYPE_OPTIONS"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
            <span v-if="errors.legalCertType" class="msg">{{
              errors.legalCertType
            }}</span>
          </label>

          <label class="field">
            <span class="lab">组织机构代码</span>
            <input
              v-model="form.orgCode"
              class="ctl"
              :class="{ err: errors.orgCode }"
              placeholder="请输入"
            />
            <span v-if="errors.orgCode" class="msg">{{ errors.orgCode }}</span>
          </label>
          <label class="field">
            <span class="lab">法人证件号码</span>
            <input
              v-model="form.legalCertNo"
              class="ctl"
              :class="{ err: errors.legalCertNo }"
              placeholder="请输入"
            />
            <span v-if="errors.legalCertNo" class="msg">{{
              errors.legalCertNo
            }}</span>
          </label>

          <label class="field">
            <span class="lab">联系方式</span>
            <input
              v-model="form.contact"
              class="ctl"
              :class="{ err: errors.contact }"
              placeholder="请输入"
            />
            <span v-if="errors.contact" class="msg">{{ errors.contact }}</span>
          </label>

          <div class="field full">
            <span class="lab">营业执照</span>
            <ElUpload
              :auto-upload="false"
              :file-list="licenseList"
              :limit="1"
              :on-change="onLicenseChange"
              :on-remove="removeLicense"
              :show-file-list="false"
              accept=".jpg,.jpeg,.png"
              class="license"
              drag
            >
              <div v-if="form.licenseUrl" class="preview">
                <img :src="form.licenseUrl" alt="营业执照" />
              </div>
              <div v-else class="ph">
                <div class="box">营业执照</div>
                <span class="add">添加营业执照</span>
              </div>
            </ElUpload>
          </div>
        </div>

        <div class="actions">
          <button
            class="btn primary"
            :disabled="saving"
            type="button"
            @click="onSave"
          >
            {{ saving ? '保存中…' : '确定' }}
          </button>
          <button class="btn ghost" type="button" @click="onCancel">
            取消
          </button>
        </div>
      </div>

      <div v-show="activeTab === 'security'" class="sec-form">
        <div class="grid">
          <label class="field">
            <span class="lab">原密码</span>
            <input
              v-model="pwdForm.oldPwd"
              class="ctl"
              type="password"
              placeholder="请输入原密码"
              autocomplete="current-password"
            />
          </label>
          <label class="field">
            <span class="lab">新密码</span>
            <input
              v-model="pwdForm.newPwd"
              class="ctl"
              type="password"
              placeholder="请输入新密码"
              autocomplete="new-password"
            />
          </label>
          <label class="field">
            <span class="lab">确认密码</span>
            <input
              v-model="pwdForm.confirmPwd"
              class="ctl"
              type="password"
              placeholder="请再次输入新密码"
              autocomplete="new-password"
            />
          </label>
        </div>
        <div class="form-actions">
          <button class="btn primary" type="button" @click="onChangePassword">
            修改密码
          </button>
          <button
            class="btn ghost"
            type="button"
            @click="
              pwdForm.oldPwd = '';
              pwdForm.newPwd = '';
              pwdForm.confirmPwd = '';
            "
          >
            重置
          </button>
        </div>
      </div>

      <div v-show="activeTab === 'realtime'" class="tip">
        <p>
          当前实名状态：
          <strong>{{ profile.realNameStatus }}</strong>
          。完整认证材料请在「注册认证」中提交。
        </p>
        <div class="tip-btns">
          <button
            class="btn primary"
            type="button"
            @click="router.push('/mine/register/enterprise')"
          >
            企业用户认证
          </button>
          <button
            class="btn ghost"
            type="button"
            @click="router.push('/mine/register/person')"
          >
            个人用户认证
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pi {
  max-width: 980px;
  padding: 8px 4px 32px;
}

.pi-title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 750;
  color: #1f2430;
}

.pi-banner {
  margin-bottom: 16px;
}

.pi-banner__label {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2430;
}

.pi-banner__label .dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  color: #fff;
  background: #00c853;
  border-radius: 50%;
}

.pi-banner__card {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 18px 20px;
  background: linear-gradient(120deg, #f0edff, #eef6ff);
  border: 1px solid rgba(107, 76, 255, 0.12);
  border-radius: 12px;
}

.avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #6b4cff, #8b7aff);
  border-radius: 50%;
}

.cols {
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1fr;
  gap: 6px 28px;
}

.row {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 28px;
  font-size: 13px;
  color: #1f2430;
}

.k {
  width: 72px;
  color: #8a94a6;
}

.v {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.st {
  font-style: normal;
  font-weight: 600;
  color: #8a94a6;
}

.st.ok {
  color: #00c853;
}

.st.warn {
  color: #ff9800;
}

.link {
  padding: 0;
  font-size: 13px;
  color: #6b4cff;
  cursor: pointer;
  background: none;
  border: 0;
}

.pi-panel {
  padding: 8px 20px 22px;
  background: #fff;
  border: 1px solid rgba(107, 76, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(67, 56, 120, 0.05);
}

.tabs {
  display: flex;
  gap: 28px;
  margin-bottom: 18px;
  border-bottom: 1px solid #e8ebf2;
}

.tabs button {
  position: relative;
  padding: 12px 2px;
  font-size: 14px;
  font-weight: 600;
  color: #8a94a6;
  cursor: pointer;
  background: none;
  border: 0;
}

.tabs button.on {
  color: #6b4cff;
}

.tabs button.on::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  content: '';
  background: #6b4cff;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

.lab {
  font-size: 13px;
  font-weight: 600;
  color: #3d4659;
}

.ctl {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  color: #1f2430;
  outline: none;
  background: #fff;
  border: 1px solid #dde1ec;
  border-radius: 8px;
}

.ctl:focus {
  border-color: #6b4cff;
  box-shadow: 0 0 0 3px rgba(107, 76, 255, 0.12);
}

.ctl.err {
  border-color: #f44336;
}

.msg {
  font-size: 12px;
  color: #f44336;
}

.license {
  width: 220px;
}

.license :deep(.el-upload),
.license :deep(.el-upload-dragger) {
  width: 100%;
}

.license :deep(.el-upload-dragger) {
  padding: 0;
  background: #fafbff;
  border: 1px dashed #c9c5f0;
  border-radius: 10px;
}

.ph {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  padding: 16px;
}

.box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 80px;
  font-size: 13px;
  font-weight: 600;
  color: #6b4cff;
  background: linear-gradient(160deg, #f5f2ff, #eef6ff);
  border: 1px solid rgba(107, 76, 255, 0.2);
  border-radius: 6px;
}

.add {
  font-size: 13px;
  color: #6b4cff;
}

.preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  padding: 10px;
}

.preview img {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
}

.btn {
  min-width: 100px;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn.primary {
  color: #fff;
  background: linear-gradient(135deg, #6b4cff, #8b7aff);
  border: 0;
  box-shadow: 0 8px 18px rgba(107, 76, 255, 0.25);
}

.btn.ghost {
  color: #6b4cff;
  background: #fff;
  border: 1px solid rgba(107, 76, 255, 0.45);
}

.sec-form {
  max-width: 640px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.tip {
  padding: 8px 0;
}

.tip p {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #5c6578;
}

.tip-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 768px) {
  .cols,
  .grid {
    grid-template-columns: 1fr;
  }

  .pi-banner__card {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
