<script lang="ts" setup>
import type { UploadFile } from 'element-plus';

import { computed, reactive, ref, watch } from 'vue';

import { ElMessage, ElUpload } from 'element-plus';

import {
  AUTH_HISTORY,
  COMPANY_TYPE_OPTIONS,
  DEFAULT_AUTH_STATUS,
  INDUSTRY_OPTIONS,
  REGION_TREE,
  type AuthStatus,
  createDefaultForm,
} from '#/views/_shared/data/enterprise-auth';

defineOptions({ name: 'MineRegisterEnterprise' });

type TabKey = 'apply' | 'history';
type FileKey = 'idBack' | 'idFront' | 'license';

const activeTab = ref<TabKey>('apply');
const authStatus = ref<AuthStatus>(DEFAULT_AUTH_STATUS);
const submitting = ref(false);

const form = reactive(createDefaultForm());
const errors = reactive<Record<string, string>>({});

const files = reactive<Record<FileKey, string>>({
  idFront: '',
  idBack: '',
  license: '',
});
const fileLists = reactive<Record<FileKey, UploadFile[]>>({
  idFront: [],
  idBack: [],
  license: [],
});

const provinceOptions = Object.keys(REGION_TREE);
const cityOptions = computed(() =>
  form.province ? Object.keys(REGION_TREE[form.province] ?? {}) : [],
);
const districtOptions = computed(() => {
  if (!form.province || !form.city) return [];
  return REGION_TREE[form.province]?.[form.city] ?? [];
});

watch(
  () => form.province,
  () => {
    if (!cityOptions.value.includes(form.city)) {
      form.city = cityOptions.value[0] ?? '';
    }
  },
);
watch(
  () => form.city,
  () => {
    if (!districtOptions.value.includes(form.district)) {
      form.district = districtOptions.value[0] ?? '';
    }
  },
);

const statusMeta = computed(() => {
  switch (authStatus.value) {
    case 'approved': {
      return {
        label: '已认证',
        tagClass: 'success',
        step: 3,
        tip: '企业实名认证已通过，可使用平台完整服务能力。',
        sub: '如企业关键信息变更，请重新提交认证申请。',
      };
    }
    case 'rejected': {
      return {
        label: '已驳回',
        tagClass: 'danger',
        step: 1,
        tip: '认证申请未通过，请根据驳回原因修改后重新提交。',
        sub: '可在「认证历史」中查看详细驳回说明。',
      };
    }
    case 'reviewing': {
      return {
        label: '审核中',
        tagClass: 'warning',
        step: 2,
        tip: '认证申请已提交，预计 1-2 个工作日内完成审核。',
        sub: '审核结果将通过短信和站内信通知您。',
      };
    }
    default: {
      return {
        label: '未提交',
        tagClass: 'info',
        step: 0,
        tip: '请完善企业信息与认证材料后提交申请。',
        sub: '提交后进入平台审核，通过后方可使用完整服务。',
      };
    }
  }
});

const readonly = computed(() => authStatus.value === 'reviewing');

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
  if (!/^[0-9A-Z]{18}$/i.test(form.creditCode.trim())) {
    fail('creditCode', '请输入 18 位统一社会信用代码');
  }
  if (!form.industry) fail('industry', '请选择所属行业');
  if (!form.companyType) fail('companyType', '请选择企业类型');
  if (!form.province || !form.city || !form.district) {
    fail('region', '请选择省 / 市 / 区县');
  }
  if (!form.addressDetail.trim()) fail('addressDetail', '请输入详细地址');
  if (!form.legalName.trim()) fail('legalName', '请输入法人姓名');
  if (!/^\d{17}[\dXx]$/.test(form.legalIdNo.trim())) {
    fail('legalIdNo', '请输入 18 位身份证号码');
  }
  if (!/^1\d{10}$/.test(form.legalPhone.trim())) {
    fail('legalPhone', '请输入正确的手机号');
  }
  if (
    form.legalEmail.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.legalEmail.trim())
  ) {
    fail('legalEmail', '邮箱格式不正确');
  }
  if (!files.idFront) fail('idFront', '请上传法人身份证正面');
  if (!files.idBack) fail('idBack', '请上传法人身份证反面');
  if (!files.license) fail('license', '请上传营业执照');
  return ok;
}

function checkFile(file: File) {
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
    ElMessage.warning('仅支持 jpg / png / jpeg');
    return false;
  }
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.warning('文件大小不能超过 5MB');
    return false;
  }
  return true;
}

function onFileChange(key: FileKey, uploadFile: UploadFile) {
  if (!uploadFile.raw || !checkFile(uploadFile.raw)) {
    fileLists[key] = [];
    files[key] = '';
    return;
  }
  if (files[key]) URL.revokeObjectURL(files[key]);
  files[key] = URL.createObjectURL(uploadFile.raw);
  fileLists[key] = [uploadFile];
  delete errors[key];
}

function removeFile(key: FileKey) {
  if (files[key]) URL.revokeObjectURL(files[key]);
  files[key] = '';
  fileLists[key] = [];
}

function resetForm() {
  Object.assign(form, createDefaultForm());
  removeFile('idFront');
  removeFile('idBack');
  removeFile('license');
  clearErrors();
  ElMessage.info('已重置表单');
}

async function submitForm() {
  if (readonly.value) {
    ElMessage.warning('审核中不可修改，请等待审核结果');
    return;
  }
  if (!validate()) {
    ElMessage.warning('请完善必填项后再提交');
    return;
  }
  submitting.value = true;
  try {
    await new Promise((r) => setTimeout(r, 500));
    authStatus.value = 'reviewing';
    ElMessage.success('认证申请已提交（示例）');
  } finally {
    submitting.value = false;
  }
}

function resultClass(result: string) {
  if (result === '通过') return 'ok';
  if (result === '驳回') return 'bad';
  return 'pending';
}
</script>

<template>
  <div class="ent-auth">
    <header class="ent-auth__title">
      <h2>企业用户认证</h2>
      <p>
        完成企业实名认证后，可使用平台完整服务能力，包括算力供需撮合、电碳算协同调度等。
      </p>
    </header>

    <!-- 认证状态 -->
    <section class="ent-card">
      <div class="ent-status__head">
        <h3>认证状态</h3>
        <span class="ent-tag" :class="statusMeta.tagClass">
          {{ statusMeta.label }}
        </span>
      </div>

      <div class="ent-steps">
        <div
          class="ent-step"
          :class="{
            done: statusMeta.step > 0,
            active: statusMeta.step === 0,
          }"
        >
          <div class="ent-step__node">
            {{ statusMeta.step > 0 ? '✓' : '1' }}
          </div>
          <div class="ent-step__label">填写企业信息</div>
        </div>
        <div class="ent-step__line" :class="{ done: statusMeta.step > 0 }"></div>
        <div
          class="ent-step"
          :class="{
            done: statusMeta.step > 1,
            active: statusMeta.step === 1,
          }"
        >
          <div class="ent-step__node">
            {{ statusMeta.step > 1 ? '✓' : '2' }}
          </div>
          <div class="ent-step__label">上传认证材料</div>
        </div>
        <div class="ent-step__line" :class="{ done: statusMeta.step > 1 }"></div>
        <div
          class="ent-step"
          :class="{
            done: statusMeta.step > 2,
            active: statusMeta.step === 2,
          }"
        >
          <div class="ent-step__node">
            {{ statusMeta.step > 2 ? '✓' : '3' }}
          </div>
          <div class="ent-step__label">平台审核</div>
        </div>
        <div class="ent-step__line" :class="{ done: statusMeta.step > 2 }"></div>
        <div
          class="ent-step"
          :class="{
            done: statusMeta.step > 3,
            active: statusMeta.step === 3,
          }"
        >
          <div class="ent-step__node">
            {{ statusMeta.step > 3 ? '✓' : '4' }}
          </div>
          <div class="ent-step__label">认证完成</div>
        </div>
      </div>

      <p class="ent-status__tip">{{ statusMeta.tip }}</p>
      <p class="ent-status__sub">{{ statusMeta.sub }}</p>
    </section>

    <div class="ent-tabs">
      <button
        type="button"
        :class="{ active: activeTab === 'apply' }"
        @click="activeTab = 'apply'"
      >
        认证申请
      </button>
      <button
        type="button"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        认证历史
      </button>
    </div>

    <!-- 认证申请 -->
    <section v-show="activeTab === 'apply'" class="ent-card">
      <div v-if="readonly" class="ent-banner">
        当前处于审核中，表单为只读预览。审核结束后可再次编辑提交。
      </div>

      <h4 class="ent-section">企业基础信息</h4>
      <div class="ent-grid">
        <label class="ent-field full">
          <span class="lab"><i>*</i>企业名称</span>
          <input
            v-model="form.companyName"
            class="ctl"
            :class="{ err: errors.companyName }"
            :disabled="readonly"
            placeholder="请输入与营业执照一致的企业全称"
          />
          <span v-if="errors.companyName" class="msg">{{
            errors.companyName
          }}</span>
        </label>

        <label class="ent-field full">
          <span class="lab"><i>*</i>统一社会信用代码</span>
          <input
            v-model="form.creditCode"
            class="ctl"
            :class="{ err: errors.creditCode }"
            :disabled="readonly"
            maxlength="18"
            placeholder="请输入 18 位统一社会信用代码"
          />
          <span v-if="errors.creditCode" class="msg">{{
            errors.creditCode
          }}</span>
        </label>

        <label class="ent-field">
          <span class="lab"><i>*</i>所属行业</span>
          <select
            v-model="form.industry"
            class="ctl"
            :class="{ err: errors.industry }"
            :disabled="readonly"
          >
            <option disabled value="">请选择所属行业</option>
            <option v-for="item in INDUSTRY_OPTIONS" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <span v-if="errors.industry" class="msg">{{ errors.industry }}</span>
        </label>

        <label class="ent-field">
          <span class="lab"><i>*</i>企业类型</span>
          <select
            v-model="form.companyType"
            class="ctl"
            :class="{ err: errors.companyType }"
            :disabled="readonly"
          >
            <option disabled value="">请选择企业类型</option>
            <option
              v-for="item in COMPANY_TYPE_OPTIONS"
              :key="item"
              :value="item"
            >
              {{ item }}
            </option>
          </select>
          <span v-if="errors.companyType" class="msg">{{
            errors.companyType
          }}</span>
        </label>

        <div class="ent-field full">
          <span class="lab"><i>*</i>企业地址</span>
          <div class="region">
            <select v-model="form.province" class="ctl" :disabled="readonly">
              <option disabled value="">省</option>
              <option v-for="p in provinceOptions" :key="p" :value="p">
                {{ p }}
              </option>
            </select>
            <select v-model="form.city" class="ctl" :disabled="readonly">
              <option disabled value="">市</option>
              <option v-for="c in cityOptions" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
            <select v-model="form.district" class="ctl" :disabled="readonly">
              <option disabled value="">区/县</option>
              <option v-for="d in districtOptions" :key="d" :value="d">
                {{ d }}
              </option>
            </select>
          </div>
          <input
            v-model="form.addressDetail"
            class="ctl mt"
            :class="{ err: errors.addressDetail || errors.region }"
            :disabled="readonly"
            placeholder="请输入详细地址（街道、门牌号等）"
          />
          <span v-if="errors.region || errors.addressDetail" class="msg">
            {{ errors.region || errors.addressDetail }}
          </span>
        </div>

        <label class="ent-field full">
          <span class="lab">企业简介</span>
          <textarea
            v-model="form.introduction"
            class="ctl area"
            :disabled="readonly"
            placeholder="请简要介绍企业规模、主营业务、核心优势等"
            rows="4"
          ></textarea>
        </label>
      </div>

      <h4 class="ent-section">法定代表人信息</h4>
      <div class="ent-grid">
        <label class="ent-field">
          <span class="lab"><i>*</i>法人姓名</span>
          <input
            v-model="form.legalName"
            class="ctl"
            :class="{ err: errors.legalName }"
            :disabled="readonly"
            placeholder="请输入与身份证一致的法定代表人姓名"
          />
          <span v-if="errors.legalName" class="msg">{{ errors.legalName }}</span>
        </label>
        <label class="ent-field">
          <span class="lab"><i>*</i>法人身份证号码</span>
          <input
            v-model="form.legalIdNo"
            class="ctl"
            :class="{ err: errors.legalIdNo }"
            :disabled="readonly"
            maxlength="18"
            placeholder="请输入 18 位身份证号码"
          />
          <span v-if="errors.legalIdNo" class="msg">{{ errors.legalIdNo }}</span>
        </label>
        <label class="ent-field">
          <span class="lab"><i>*</i>法人联系电话</span>
          <input
            v-model="form.legalPhone"
            class="ctl"
            :class="{ err: errors.legalPhone }"
            :disabled="readonly"
            maxlength="11"
            placeholder="请输入法定代表人手机号码"
          />
          <span v-if="errors.legalPhone" class="msg">{{
            errors.legalPhone
          }}</span>
        </label>
        <label class="ent-field">
          <span class="lab">法人邮箱</span>
          <input
            v-model="form.legalEmail"
            class="ctl"
            :class="{ err: errors.legalEmail }"
            :disabled="readonly"
            placeholder="请输入法定代表人邮箱"
          />
          <span v-if="errors.legalEmail" class="msg">{{
            errors.legalEmail
          }}</span>
        </label>
      </div>

      <h4 class="ent-section">认证材料上传</h4>
      <div class="upload-grid">
        <div class="upload-item">
          <div class="lab"><i>*</i>法人身份证正面</div>
          <ElUpload
            :auto-upload="false"
            :disabled="readonly"
            :file-list="fileLists.idFront"
            :limit="1"
            :on-change="(f) => onFileChange('idFront', f)"
            :on-remove="() => removeFile('idFront')"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            class="uploader"
            drag
          >
            <div v-if="files.idFront" class="preview">
              <img :src="files.idFront" alt="身份证正面" />
            </div>
            <div v-else class="placeholder">
              <span class="plus">+</span>
              <p>点击或拖拽上传</p>
              <small>支持 jpg、png、jpeg，不超过 5MB</small>
            </div>
          </ElUpload>
          <span v-if="errors.idFront" class="msg">{{ errors.idFront }}</span>
        </div>

        <div class="upload-item">
          <div class="lab"><i>*</i>法人身份证反面</div>
          <ElUpload
            :auto-upload="false"
            :disabled="readonly"
            :file-list="fileLists.idBack"
            :limit="1"
            :on-change="(f) => onFileChange('idBack', f)"
            :on-remove="() => removeFile('idBack')"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            class="uploader"
            drag
          >
            <div v-if="files.idBack" class="preview">
              <img :src="files.idBack" alt="身份证反面" />
            </div>
            <div v-else class="placeholder">
              <span class="plus">+</span>
              <p>点击或拖拽上传</p>
              <small>支持 jpg、png、jpeg，不超过 5MB</small>
            </div>
          </ElUpload>
          <span v-if="errors.idBack" class="msg">{{ errors.idBack }}</span>
        </div>

        <div class="upload-item full">
          <div class="lab"><i>*</i>营业执照</div>
          <ElUpload
            :auto-upload="false"
            :disabled="readonly"
            :file-list="fileLists.license"
            :limit="1"
            :on-change="(f) => onFileChange('license', f)"
            :on-remove="() => removeFile('license')"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            class="uploader"
            drag
          >
            <div v-if="files.license" class="preview">
              <img :src="files.license" alt="营业执照" />
            </div>
            <div v-else class="placeholder">
              <span class="plus">+</span>
              <p>上传营业执照正本或副本照片，信息需清晰可见</p>
              <small>支持 jpg、png、jpeg，不超过 5MB</small>
            </div>
          </ElUpload>
          <span v-if="errors.license" class="msg">{{ errors.license }}</span>
        </div>
      </div>

      <div class="actions">
        <button
          class="btn ghost"
          :disabled="readonly || submitting"
          type="button"
          @click="resetForm"
        >
          重置
        </button>
        <button
          class="btn primary"
          :disabled="readonly || submitting"
          type="button"
          @click="submitForm"
        >
          {{ submitting ? '提交中…' : '提交认证申请' }}
        </button>
      </div>
    </section>

    <!-- 认证历史 -->
    <section v-show="activeTab === 'history'" class="ent-card">
      <div v-if="AUTH_HISTORY.length === 0" class="empty">暂无认证历史记录</div>
      <div v-else class="history">
        <article v-for="item in AUTH_HISTORY" :key="item.id" class="history-item">
          <div class="history-top">
            <div>
              <strong>{{ item.applyNo }}</strong>
              <span class="name">{{ item.companyName }}</span>
            </div>
            <span class="result" :class="resultClass(item.result)">
              {{ item.result }}
            </span>
          </div>
          <div class="history-meta">
            <span>提交时间：{{ item.submittedAt }}</span>
            <span>完成时间：{{ item.finishedAt }}</span>
          </div>
          <p>{{ item.remark }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ent-auth {
  max-width: 960px;
  padding: 8px 4px 32px;
}

.ent-auth__title h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 750;
  color: #1f2430;
}

.ent-auth__title p {
  margin: 8px 0 20px;
  font-size: 13px;
  line-height: 1.6;
  color: #8a94a6;
}

.ent-card {
  padding: 22px 24px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid rgba(107, 76, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(67, 56, 120, 0.05);
}

.ent-status__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.ent-status__head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.ent-tag {
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.ent-tag.warning {
  color: #b86e00;
  background: #fff4e0;
}

.ent-tag.success {
  color: #0a7a3c;
  background: #e8f8ef;
}

.ent-tag.danger {
  color: #c62828;
  background: #fdecea;
}

.ent-tag.info {
  color: #5c6578;
  background: #f1f3f8;
}

.ent-steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.ent-step {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 96px;
  text-align: center;
}

.ent-step__node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 14px;
  font-weight: 700;
  color: #8a94a6;
  background: #f1f3f8;
  border-radius: 50%;
}

.ent-step.done .ent-step__node {
  color: #fff;
  background: #00c853;
}

.ent-step.active .ent-step__node {
  color: #fff;
  background: #6b4cff;
  box-shadow: 0 0 0 4px rgba(107, 76, 255, 0.16);
}

.ent-step__label {
  font-size: 13px;
  font-weight: 600;
  color: #5c6578;
}

.ent-step.active .ent-step__label,
.ent-step.done .ent-step__label {
  color: #1f2430;
}

.ent-step__line {
  flex: 1;
  height: 2px;
  margin-top: 15px;
  background: #e6e8f0;
}

.ent-step__line.done {
  background: #00c853;
}

.ent-status__tip {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2430;
}

.ent-status__sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8a94a6;
}

.ent-tabs {
  display: flex;
  gap: 28px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e8ebf2;
}

.ent-tabs button {
  position: relative;
  padding: 10px 2px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #8a94a6;
  cursor: pointer;
  background: none;
  border: 0;
}

.ent-tabs button.active {
  color: #6b4cff;
}

.ent-tabs button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  content: '';
  background: #6b4cff;
}

.ent-banner {
  padding: 10px 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #b86e00;
  background: #fff8eb;
  border: 1px solid #ffe2a8;
  border-radius: 8px;
}

.ent-section {
  padding-left: 10px;
  margin: 8px 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2430;
  border-left: 3px solid #6b4cff;
}

.ent-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
  margin-bottom: 22px;
}

.ent-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ent-field.full {
  grid-column: 1 / -1;
}

.lab {
  font-size: 13px;
  font-weight: 600;
  color: #3d4659;
}

.lab i {
  margin-right: 4px;
  font-style: normal;
  color: #f44336;
}

.ctl {
  width: 100%;
  padding: 10px 12px;
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

.ctl:disabled {
  color: #6b7280;
  cursor: not-allowed;
  background: #f5f6fa;
}

.ctl.err {
  border-color: #f44336;
}

.ctl.area {
  min-height: 96px;
  line-height: 1.6;
  resize: vertical;
}

.ctl.mt {
  margin-top: 8px;
}

.region {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.msg {
  font-size: 12px;
  color: #f44336;
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.upload-item.full {
  grid-column: 1 / -1;
}

.uploader {
  width: 100%;
}

.uploader :deep(.el-upload),
.uploader :deep(.el-upload-dragger) {
  width: 100%;
}

.uploader :deep(.el-upload-dragger) {
  padding: 0;
  background: #fafbff;
  border: 1px dashed #c9c5f0;
  border-radius: 10px;
}

.uploader :deep(.el-upload-dragger:hover) {
  border-color: #6b4cff;
}

.placeholder {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  padding: 20px;
  color: #8a94a6;
}

.plus {
  font-size: 28px;
  font-weight: 300;
  color: #6b4cff;
}

.placeholder p {
  margin: 4px 0 0;
  font-size: 13px;
}

.placeholder small {
  font-size: 12px;
  color: #b0b8c6;
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
  max-height: 160px;
  object-fit: contain;
  border-radius: 6px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 18px;
  margin-top: 16px;
  border-top: 1px solid #eef0f5;
}

.btn {
  min-width: 108px;
  height: 40px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn.ghost {
  color: #3d4659;
  background: #fff;
  border: 1px solid #d5dae6;
}

.btn.primary {
  color: #fff;
  background: linear-gradient(135deg, #6b4cff, #8b7aff);
  border: 0;
  box-shadow: 0 8px 18px rgba(107, 76, 255, 0.25);
}

.empty {
  padding: 40px 0;
  color: #8a94a6;
  text-align: center;
}

.history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 14px 16px;
  background: #fafbff;
  border: 1px solid #eef0f5;
  border-radius: 10px;
}

.history-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-top .name {
  margin-left: 10px;
  font-size: 13px;
  color: #5c6578;
}

.result {
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.result.pending {
  color: #b86e00;
  background: #fff4e0;
}

.result.ok {
  color: #0a7a3c;
  background: #e8f8ef;
}

.result.bad {
  color: #c62828;
  background: #fdecea;
}

.history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: #8a94a6;
}

.history-item p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #3d4659;
}

@media (max-width: 768px) {
  .ent-grid,
  .upload-grid,
  .region {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
