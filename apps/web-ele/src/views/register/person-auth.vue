<script lang="ts" setup>
import type { UploadFile } from 'element-plus';

import { computed, reactive, ref, watch } from 'vue';

import { ElMessage, ElUpload } from 'element-plus';

import {
  REGION_TREE,
  type AuthStatus,
} from '#/views/_shared/data/enterprise-auth';
import {
  DEFAULT_PERSON_AUTH_STATUS,
  OCCUPATION_OPTIONS,
  PERSON_AUTH_HISTORY,
  createDefaultPersonForm,
  parseIdCard,
} from '#/views/_shared/data/person-auth';

defineOptions({ name: 'MineRegisterPerson' });

type TabKey = 'apply' | 'history';
type FileKey = 'idBack' | 'idFront';

const activeTab = ref<TabKey>('apply');
const authStatus = ref<AuthStatus>(DEFAULT_PERSON_AUTH_STATUS);
const submitting = ref(false);

const form = reactive(createDefaultPersonForm());
const errors = reactive<Record<string, string>>({});

const files = reactive<Record<FileKey, string>>({
  idFront: '',
  idBack: '',
});
const fileLists = reactive<Record<FileKey, UploadFile[]>>({
  idFront: [],
  idBack: [],
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

watch(
  () => form.idLongTerm,
  (longTerm) => {
    if (longTerm) form.idValidTo = '';
  },
);

const statusMeta = computed(() => {
  switch (authStatus.value) {
    case 'approved': {
      return {
        label: '已认证',
        tagClass: 'success',
        step: 3,
        tip: '个人实名认证已通过，可使用平台完整服务能力。',
        sub: '如身份信息变更，请重新提交认证申请。',
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
        label: '未认证',
        tagClass: 'info',
        step: 0,
        tip: '请填写个人信息并上传身份证件，提交后进入平台审核。',
        sub: '认证通过后方可合规参与平台相关业务。',
      };
    }
  }
});

const readonly = computed(() => authStatus.value === 'reviewing');

function clearErrors() {
  Object.keys(errors).forEach((k) => delete errors[k]);
}

function onIdNoBlur() {
  const parsed = parseIdCard(form.idNo);
  form.gender = parsed.gender;
  form.birthday = parsed.birthday;
  form.age = parsed.age;
  if (parsed.gender) delete errors.idNo;
}

function validate() {
  clearErrors();
  let ok = true;
  const fail = (key: string, msg: string) => {
    errors[key] = msg;
    ok = false;
  };

  if (!form.realName.trim()) fail('realName', '请输入真实姓名');
  if (!/^1\d{10}$/.test(form.phone.trim())) {
    fail('phone', '请输入正确的手机号');
  }
  if (!/^\d{17}[\dXx]$/.test(form.idNo.trim())) {
    fail('idNo', '请输入 18 位身份证号码');
  }
  if (!form.idValidFrom) fail('idValidFrom', '请选择证件有效期起');
  if (!form.idLongTerm && !form.idValidTo) {
    fail('idValidTo', '请选择证件有效期止，或勾选长期有效');
  }
  if (
    !form.idLongTerm &&
    form.idValidFrom &&
    form.idValidTo &&
    form.idValidTo < form.idValidFrom
  ) {
    fail('idValidTo', '有效期截止日不能早于起始日');
  }
  if (!files.idFront) fail('idFront', '请上传身份证国徽面');
  if (!files.idBack) fail('idBack', '请上传身份证人像面');
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
  Object.assign(form, createDefaultPersonForm());
  removeFile('idFront');
  removeFile('idBack');
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
  <div class="person-auth">
    <header class="person-auth__title">
      <div>
        <h2>个人用户认证</h2>
        <p>
          完成个人实名认证后，可享受平台完整功能，并合规参与算力供需、电碳算协同等相关业务。
        </p>
      </div>
      <span class="person-tag" :class="statusMeta.tagClass">
        {{ statusMeta.label }}
      </span>
    </header>

    <section class="person-card">
      <div class="person-steps">
        <div
          class="person-step"
          :class="{
            done: statusMeta.step > 0,
            active: statusMeta.step === 0,
          }"
        >
          <div class="person-step__node">
            {{ statusMeta.step > 0 ? '✓' : '1' }}
          </div>
          <div class="person-step__label">填写个人信息</div>
        </div>
        <div
          class="person-step__line"
          :class="{ done: statusMeta.step > 0 }"
        ></div>
        <div
          class="person-step"
          :class="{
            done: statusMeta.step > 1,
            active: statusMeta.step === 1,
          }"
        >
          <div class="person-step__node">
            {{ statusMeta.step > 1 ? '✓' : '2' }}
          </div>
          <div class="person-step__label">上传身份证件</div>
        </div>
        <div
          class="person-step__line"
          :class="{ done: statusMeta.step > 1 }"
        ></div>
        <div
          class="person-step"
          :class="{
            done: statusMeta.step > 2,
            active: statusMeta.step === 2,
          }"
        >
          <div class="person-step__node">
            {{ statusMeta.step > 2 ? '✓' : '3' }}
          </div>
          <div class="person-step__label">平台审核</div>
        </div>
        <div
          class="person-step__line"
          :class="{ done: statusMeta.step > 2 }"
        ></div>
        <div
          class="person-step"
          :class="{
            done: statusMeta.step > 3,
            active: statusMeta.step === 3,
          }"
        >
          <div class="person-step__node">
            {{ statusMeta.step > 3 ? '✓' : '4' }}
          </div>
          <div class="person-step__label">认证完成</div>
        </div>
      </div>
      <p class="person-status__tip">{{ statusMeta.tip }}</p>
      <p class="person-status__sub">{{ statusMeta.sub }}</p>
    </section>

    <div class="person-tabs">
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

    <section v-show="activeTab === 'apply'" class="person-card">
      <div v-if="readonly" class="person-banner">
        当前处于审核中，表单为只读预览。审核结束后可再次编辑提交。
      </div>

      <h4 class="person-section">个人基础信息</h4>
      <div class="person-grid">
        <label class="person-field">
          <span class="lab"><i>*</i>姓名</span>
          <input
            v-model="form.realName"
            class="ctl"
            :class="{ err: errors.realName }"
            :disabled="readonly"
            placeholder="请输入与身份证一致的真实姓名"
          />
          <span v-if="errors.realName" class="msg">{{ errors.realName }}</span>
        </label>

        <label class="person-field">
          <span class="lab"><i>*</i>联系电话</span>
          <div class="phone-row">
            <select
              v-model="form.phoneCode"
              class="ctl code"
              :disabled="readonly"
            >
              <option value="+86">+86 中国</option>
            </select>
            <input
              v-model="form.phone"
              class="ctl"
              :class="{ err: errors.phone }"
              :disabled="readonly"
              maxlength="11"
              placeholder="请输入手机号码"
            />
          </div>
          <span v-if="errors.phone" class="msg">{{ errors.phone }}</span>
        </label>

        <label class="person-field full">
          <span class="lab"><i>*</i>身份证号码</span>
          <input
            v-model="form.idNo"
            class="ctl"
            :class="{ err: errors.idNo }"
            :disabled="readonly"
            maxlength="18"
            placeholder="请输入 18 位身份证号码"
            @blur="onIdNoBlur"
          />
          <span v-if="errors.idNo" class="msg">{{ errors.idNo }}</span>
        </label>

        <label class="person-field">
          <span class="lab">性别</span>
          <input
            v-model="form.gender"
            class="ctl"
            disabled
            placeholder="系统自动识别"
          />
        </label>
        <label class="person-field">
          <span class="lab">出生日期</span>
          <input
            v-model="form.birthday"
            class="ctl"
            disabled
            placeholder="系统自动识别"
          />
        </label>
        <label class="person-field">
          <span class="lab">年龄</span>
          <input
            v-model="form.age"
            class="ctl"
            disabled
            placeholder="系统自动识别"
          />
        </label>

        <div class="person-field full">
          <span class="lab"><i>*</i>身份证有效期</span>
          <div class="valid-row">
            <input
              v-model="form.idValidFrom"
              class="ctl"
              :class="{ err: errors.idValidFrom }"
              :disabled="readonly"
              type="date"
            />
            <span class="sep">至</span>
            <input
              v-model="form.idValidTo"
              class="ctl"
              :class="{ err: errors.idValidTo }"
              :disabled="readonly || form.idLongTerm"
              type="date"
            />
            <label class="long-term">
              <input
                v-model="form.idLongTerm"
                :disabled="readonly"
                type="checkbox"
              />
              长期有效
            </label>
          </div>
          <span v-if="errors.idValidFrom || errors.idValidTo" class="msg">
            {{ errors.idValidFrom || errors.idValidTo }}
          </span>
        </div>

        <label class="person-field">
          <span class="lab">职业（选填）</span>
          <select v-model="form.occupation" class="ctl" :disabled="readonly">
            <option value="">请选择职业</option>
            <option
              v-for="item in OCCUPATION_OPTIONS"
              :key="item"
              :value="item"
            >
              {{ item }}
            </option>
          </select>
        </label>

        <div class="person-field full">
          <span class="lab">联系地址（选填）</span>
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
            :disabled="readonly"
            placeholder="请输入详细地址（街道、门牌号等）"
          />
        </div>
      </div>

      <h4 class="person-section">认证材料上传</h4>
      <div class="upload-grid">
        <div class="upload-item">
          <div class="lab"><i>*</i>身份证正面（国徽面）</div>
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
              <img :src="files.idFront" alt="身份证国徽面" />
            </div>
            <div v-else class="placeholder">
              <span class="plus">+</span>
              <p>上传国徽面，图案需清晰</p>
              <small>支持 jpg、png、jpeg，不超过 5MB</small>
            </div>
          </ElUpload>
          <span v-if="errors.idFront" class="msg">{{ errors.idFront }}</span>
        </div>

        <div class="upload-item">
          <div class="lab"><i>*</i>身份证反面（人像面）</div>
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
              <img :src="files.idBack" alt="身份证人像面" />
            </div>
            <div v-else class="placeholder">
              <span class="plus">+</span>
              <p>上传人像面，姓名与证件号需清晰</p>
              <small>支持 jpg、png、jpeg，不超过 5MB</small>
            </div>
          </ElUpload>
          <span v-if="errors.idBack" class="msg">{{ errors.idBack }}</span>
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

    <section v-show="activeTab === 'history'" class="person-card">
      <div v-if="PERSON_AUTH_HISTORY.length === 0" class="empty">
        暂无认证历史记录
      </div>
      <div v-else class="history">
        <article
          v-for="item in PERSON_AUTH_HISTORY"
          :key="item.id"
          class="history-item"
        >
          <div class="history-top">
            <div>
              <strong>{{ item.applyNo }}</strong>
              <span class="name">{{ item.realName }}</span>
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
.person-auth {
  max-width: 960px;
  padding: 8px 4px 32px;
}

.person-auth__title {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.person-auth__title h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 750;
  color: #1f2430;
}

.person-auth__title p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #8a94a6;
}

.person-tag {
  flex-shrink: 0;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.person-tag.warning {
  color: #b86e00;
  background: #fff4e0;
}

.person-tag.success {
  color: #0a7a3c;
  background: #e8f8ef;
}

.person-tag.danger {
  color: #c62828;
  background: #fdecea;
}

.person-tag.info {
  color: #5c6578;
  background: #f1f3f8;
}

.person-card {
  padding: 22px 24px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid rgba(107, 76, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(67, 56, 120, 0.05);
}

.person-steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.person-step {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 96px;
  text-align: center;
}

.person-step__node {
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

.person-step.done .person-step__node {
  color: #fff;
  background: #00c853;
}

.person-step.active .person-step__node {
  color: #fff;
  background: #6b4cff;
  box-shadow: 0 0 0 4px rgba(107, 76, 255, 0.16);
}

.person-step__label {
  font-size: 13px;
  font-weight: 600;
  color: #5c6578;
}

.person-step.active .person-step__label,
.person-step.done .person-step__label {
  color: #1f2430;
}

.person-step__line {
  flex: 1;
  height: 2px;
  margin-top: 15px;
  background: #e6e8f0;
}

.person-step__line.done {
  background: #00c853;
}

.person-status__tip {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2430;
}

.person-status__sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8a94a6;
}

.person-tabs {
  display: flex;
  gap: 28px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e8ebf2;
}

.person-tabs button {
  position: relative;
  padding: 10px 2px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #8a94a6;
  cursor: pointer;
  background: none;
  border: 0;
}

.person-tabs button.active {
  color: #6b4cff;
}

.person-tabs button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  content: '';
  background: #6b4cff;
}

.person-banner {
  padding: 10px 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #b86e00;
  background: #fff8eb;
  border: 1px solid #ffe2a8;
  border-radius: 8px;
}

.person-section {
  padding-left: 10px;
  margin: 8px 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2430;
  border-left: 3px solid #6b4cff;
}

.person-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
  margin-bottom: 22px;
}

.person-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.person-field.full {
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

.ctl.mt {
  margin-top: 8px;
}

.phone-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px;
}

.valid-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.valid-row .ctl {
  flex: 1;
  min-width: 140px;
}

.valid-row .sep {
  color: #8a94a6;
}

.long-term {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: #3d4659;
  white-space: nowrap;
  cursor: pointer;
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
  .person-auth__title {
    flex-direction: column;
  }

  .person-grid,
  .upload-grid,
  .region,
  .phone-row {
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
