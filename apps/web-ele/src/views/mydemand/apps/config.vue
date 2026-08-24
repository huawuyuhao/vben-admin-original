<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  type AppMaterial,
  appTypeOptions,
  defaultMaterials,
  myApps,
} from '#/views/_shared/data/my-apps';

const route = useRoute();
const router = useRouter();

const toast = ref('');
const modelFileName = ref('');
const materials = ref<AppMaterial[]>([...defaultMaterials]);
const syncToPool = ref<'yes' | 'no'>('yes');

const form = reactive({
  name: '',
  version: 'V1.0',
  type: '',
  enabled: false,
  scheduleEnabled: false,
  scheduleStart: '00:00:00',
  scheduleEnd: '00:00:00',
  desc: '',
});

const errors = reactive<Record<string, string>>({});

const isEdit = computed(() => Boolean(route.query.id));
const pageTitle = computed(() =>
  isEdit.value ? '应用配置（编辑）' : '应用配置',
);

onMounted(() => {
  const id = String(route.query.id || '');
  if (!id) return;
  const found = myApps.find((a) => a.id === id);
  if (!found) return;
  form.name = found.name;
  form.version = found.version;
  form.type = found.category;
  form.enabled = found.enabled;
  form.desc = found.desc;
});

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2200);
}

function goBack() {
  router.push('/service/mydemand/apps');
}

function clearErrors() {
  Object.keys(errors).forEach((k) => delete errors[k]);
}

function validate() {
  clearErrors();
  let ok = true;
  if (!form.name.trim()) {
    errors.name = '请输入应用名称';
    ok = false;
  }
  if (!form.version.trim()) {
    errors.version = '请输入应用版本';
    ok = false;
  }
  if (!form.type) {
    errors.type = '请选择应用类型';
    ok = false;
  }
  if (!form.desc.trim()) {
    errors.desc = '请输入应用描述';
    ok = false;
  }
  return ok;
}

function onPickModel(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  modelFileName.value = file.name;
  showToast(`已选择模型文件：${file.name}`);
  input.value = '';
}

function onPickMaterial(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  materials.value.unshift({
    id: `YY-${materials.value.length + 1}`,
    name: file.name.replace(/\.[^.]+$/, ''),
    type: 'AI训练',
    fileName: file.name,
    uploadedAt: ts,
  });
  showToast(`已上传素材：${file.name}`);
  input.value = '';
}

function selectMaterial(row: AppMaterial) {
  showToast(`已选择素材：${row.name}`);
}

function removeMaterial(id: string) {
  materials.value = materials.value.filter((m) => m.id !== id);
  showToast('已删除素材（示例）');
}

function cancel() {
  goBack();
}

function createApp() {
  if (!validate()) {
    showToast('请完善必填项后再提交');
    return;
  }
  const syncText =
    syncToPool.value === 'yes' ? '已同步至系统应用池' : '仅保存至我的应用';
  showToast(
    isEdit.value
      ? `应用已更新，${syncText}（示例）`
      : `应用创建成功，${syncText}（示例）`,
  );
  window.setTimeout(() => goBack(), 900);
}
</script>

<template>
  <div class="portal-inner-page app-config-page">
    <div class="top-bar">
      <div>
        <div class="crumb">我的需求 / 我的应用 / 应用配置</div>
        <h2 class="page-title">{{ pageTitle }}</h2>
      </div>
      <button
        class="portal-btn portal-btn-outline portal-btn-sm"
        type="button"
        @click="goBack"
      >
        返回
      </button>
    </div>

    <section class="section-card">
      <h3 class="section-title">应用基本信息</h3>
      <div class="form-grid">
        <div class="field">
          <label class="label">应用名称 <span class="req">*</span></label>
          <input
            v-model="form.name"
            class="input"
            type="text"
            placeholder="请输入应用名称"
          />
          <p v-if="errors.name" class="err">{{ errors.name }}</p>
        </div>
        <div class="field">
          <label class="label">应用版本 <span class="req">*</span></label>
          <input
            v-model="form.version"
            class="input"
            type="text"
            placeholder="如 V1.0"
          />
          <p v-if="errors.version" class="err">{{ errors.version }}</p>
        </div>
        <div class="field">
          <label class="label">应用类型 <span class="req">*</span></label>
          <select v-model="form.type" class="input">
            <option value="">请选择</option>
            <option v-for="t in appTypeOptions" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
          <p v-if="errors.type" class="err">{{ errors.type }}</p>
        </div>
        <div class="field">
          <label class="label">应用启停</label>
          <label class="switch">
            <input v-model="form.enabled" type="checkbox" />
            <span class="slider" />
            <span class="switch-text">{{ form.enabled ? '开启' : '关闭' }}</span>
          </label>
        </div>
        <div class="field full">
          <label class="label">定时任务</label>
          <div class="schedule">
            <label class="switch">
              <input v-model="form.scheduleEnabled" type="checkbox" />
              <span class="slider" />
              <span class="switch-text">
                {{ form.scheduleEnabled ? '开启' : '关闭' }}
              </span>
            </label>
            <input
              v-model="form.scheduleStart"
              class="input time"
              type="text"
              :disabled="!form.scheduleEnabled"
              placeholder="00:00:00"
            />
            <span>-</span>
            <input
              v-model="form.scheduleEnd"
              class="input time"
              type="text"
              :disabled="!form.scheduleEnabled"
              placeholder="00:00:00"
            />
          </div>
        </div>
        <div class="field full">
          <label class="label">应用描述 <span class="req">*</span></label>
          <textarea
            v-model="form.desc"
            class="input textarea"
            rows="4"
            placeholder="请输入应用描述"
          />
          <p v-if="errors.desc" class="err">{{ errors.desc }}</p>
        </div>
      </div>
    </section>

    <section class="section-card">
      <h3 class="section-title">应用模型上传</h3>
      <label class="upload-zone">
        <input
          class="file-input"
          type="file"
          accept=".zip,.xml,.xlsx,.xls,.json"
          @change="onPickModel"
        />
        <div class="upload-inner">
          <div class="upload-icon">☁</div>
          <p>拖拽本地文件至此处，或</p>
          <span class="pick-btn">选择文件</span>
          <p v-if="modelFileName" class="picked">已选择：{{ modelFileName }}</p>
        </div>
      </label>
      <p class="note">
        注：上传文件支持 zip、xml、excel、json 等格式；单文件大小建议不超过
        2GB。
      </p>
    </section>

    <section class="section-card">
      <div class="section-head">
        <h3 class="section-title">应用素材配置</h3>
        <label class="upload-btn">
          上传应用素材
          <input
            class="file-input"
            type="file"
            accept=".zip,.xml,.xlsx,.xls,.json,.txt"
            @change="onPickMaterial"
          />
        </label>
      </div>
      <p class="note">
        注：上传文件支持 zip、xml、excel、json 等格式；单文件大小建议不超过
        2GB。
      </p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>素材名称</th>
              <th>素材类型</th>
              <th>素材附件</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="materials.length === 0">
              <td colspan="6" class="empty">暂无素材，请先上传</td>
            </tr>
            <tr v-for="row in materials" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.fileName }}</td>
              <td>{{ row.uploadedAt }}</td>
              <td>
                <button class="link" type="button" @click="selectMaterial(row)">
                  选择
                </button>
                <button
                  class="link danger"
                  type="button"
                  @click="removeMaterial(row.id)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="footer-bar">
      <div class="sync-row">
        <span>是否同意同步至系统应用池？</span>
        <label class="radio">
          <input v-model="syncToPool" type="radio" value="yes" />
          是
        </label>
        <label class="radio">
          <input v-model="syncToPool" type="radio" value="no" />
          否
        </label>
      </div>
      <div class="actions">
        <button
          class="portal-btn portal-btn-outline portal-btn-sm"
          type="button"
          @click="cancel"
        >
          取消
        </button>
        <button
          class="portal-btn portal-btn-primary portal-btn-sm"
          type="button"
          @click="createApp"
        >
          {{ isEdit ? '保存' : '创建' }}
        </button>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.top-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.crumb {
  margin-bottom: 4px;
  font-size: 13px;
  color: #9e9e9e;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #212121;
}

.section-card {
  padding: 18px 20px 14px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #eeeeee;
  border-radius: 12px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: #212121;
}

.section-head {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.section-head .section-title {
  margin-bottom: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
}

.field.full {
  grid-column: 1 / -1;
}

@media (max-width: 800px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #616161;
}

.req {
  color: #f44336;
}

.input {
  width: 100%;
  padding: 9px 12px;
  font-size: 14px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
}

.input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgb(64 158 255 / 12%);
}

.input:disabled {
  color: #9e9e9e;
  background: #f5f5f5;
}

.textarea {
  min-height: 96px;
  resize: vertical;
}

.err {
  margin: 6px 0 0;
  font-size: 12px;
  color: #f44336;
}

.switch {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
}

.switch input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.slider {
  position: relative;
  width: 40px;
  height: 22px;
  background: #cfd8dc;
  border-radius: 999px;
  transition: background 0.2s;
}

.slider::after {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  content: '';
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.switch input:checked + .slider {
  background: #409eff;
}

.switch input:checked + .slider::after {
  transform: translateX(18px);
}

.switch-text {
  font-size: 13px;
  color: #757575;
}

.schedule {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.time {
  width: 120px;
}

.upload-zone {
  display: block;
  cursor: pointer;
  background: #f7f9fc;
  border: 1px dashed #c0d4ef;
  border-radius: 10px;
}

.upload-zone:hover {
  background: #f0f7ff;
  border-color: #409eff;
}

.file-input {
  display: none;
}

.upload-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 36px 16px;
  font-size: 14px;
  color: #757575;
}

.upload-icon {
  font-size: 28px;
  line-height: 1;
  color: #90caf9;
}

.pick-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 14px;
  font-size: 13px;
  color: #fff;
  pointer-events: none;
  background: #409eff;
  border-radius: 6px;
}

.picked {
  margin: 4px 0 0;
  font-size: 13px;
  color: #409eff;
}

.note {
  margin: 10px 0 0;
  font-size: 12px;
  color: #9e9e9e;
}

.upload-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  overflow: hidden;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  background: #409eff;
  border-radius: 6px;
}

.upload-btn .file-input {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  opacity: 0;
}

.table-wrap {
  margin-top: 12px;
  overflow: hidden;
  border: 1px solid #eeeeee;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px 12px;
  font-size: 13px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  font-weight: 600;
  color: #616161;
  background: #fafafa;
}

tr:last-child td {
  border-bottom: none;
}

.empty {
  padding: 24px !important;
  color: #9e9e9e;
  text-align: center;
}

.link {
  margin-right: 10px;
  padding: 0;
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.link.danger {
  color: #f44336;
}

.footer-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 16px;
}

.sync-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  font-size: 14px;
  color: #616161;
}

.radio {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 10px;
}

.toast {
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
</style>
