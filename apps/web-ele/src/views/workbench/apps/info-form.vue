<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

import {
  appMaterials,
  appTypeOptions,
  type AppMaterialRow,
} from '#/views/_shared/data/workbench-apps';

defineOptions({ name: 'WorkbenchAppInfoForm' });

const router = useRouter();

const form = reactive({
  name: '',
  version: 'V1.0',
  type: '',
  sort: 1,
  cronEnabled: false,
  cronFrom: '00:00',
  cronTo: '00:00',
  desc: '',
  syncLocal: '是',
});

const materials = ref<AppMaterialRow[]>([...appMaterials]);
const modelFileName = ref('');

function onPickModel(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    modelFileName.value = file.name;
    ElMessage.success(`已选择模型文件：${file.name}`);
  }
}

function onPickMaterial(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  materials.value.unshift({
    id: `YV-${materials.value.length + 1}`,
    name: file.name.replace(/\.[^.]+$/, ''),
    type: 'AI训练',
    fileName: file.name,
    uploadedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });
  ElMessage.success('素材已添加（示例）');
  input.value = '';
}

function removeMaterial(id: string) {
  materials.value = materials.value.filter((m) => m.id !== id);
}

function cancel() {
  router.push('/workbench/app/info');
}

function create() {
  if (!form.name.trim()) {
    ElMessage.warning('请填写应用名称');
    return;
  }
  ElMessage.success('应用已创建（示例）');
  router.push('/workbench/app/info');
}
</script>

<template>
  <div class="form-page">
    <section class="block">
      <h3>应用基本信息</h3>
      <div class="form-grid">
        <label class="field required">
          <span>应用名称</span>
          <input v-model="form.name" type="text" placeholder="请输入应用名称" />
        </label>
        <label class="field required">
          <span>应用版本</span>
          <input v-model="form.version" type="text" />
        </label>
        <label class="field required">
          <span>应用类型</span>
          <select v-model="form.type">
            <option value="">请选择</option>
            <option v-for="t in appTypeOptions" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>应用排序</span>
          <input v-model.number="form.sort" type="number" min="1" />
        </label>
        <div class="field cron-field">
          <span>定时任务</span>
          <div class="cron-row">
            <label class="switch">
              <input v-model="form.cronEnabled" type="checkbox" />
              <i />
            </label>
            <input v-model="form.cronFrom" type="time" :disabled="!form.cronEnabled" />
            <span>-</span>
            <input v-model="form.cronTo" type="time" :disabled="!form.cronEnabled" />
          </div>
        </div>
        <label class="field full">
          <span>应用描述</span>
          <textarea
            v-model="form.desc"
            rows="4"
            placeholder="请输入应用描述"
          />
        </label>
      </div>
    </section>

    <section class="block">
      <h3>应用模型上传</h3>
      <div class="upload-box">
        <p>拖拽本地文件至此处</p>
        <label class="btn primary file-btn">
          选择文件
          <input type="file" accept=".zip,.xml,.xlsx,.xls" hidden @change="onPickModel" />
        </label>
        <p v-if="modelFileName" class="file-name">已选：{{ modelFileName }}</p>
        <p class="note">
          注：上传的文件支持 zip、XML、excel 格式；且大小在 10GB 以内。
        </p>
      </div>
    </section>

    <section class="block">
      <div class="block-head">
        <h3>应用素材配置</h3>
        <label class="btn primary file-btn">
          上传应用素材
          <input type="file" accept=".zip,.xml,.xlsx,.xls" hidden @change="onPickMaterial" />
        </label>
      </div>
      <p class="note top-note">
        注：上传的文件支持 zip、XML、excel 格式；且大小在 10GB 以内。
      </p>
      <table class="table">
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
          <tr v-for="m in materials" :key="m.id">
            <td>{{ m.id }}</td>
            <td>{{ m.name }}</td>
            <td>{{ m.type }}</td>
            <td>{{ m.fileName }}</td>
            <td>{{ m.uploadedAt }}</td>
            <td class="ops">
              <button type="button" @click="ElMessage.info(`已选择 ${m.name}`)">
                选择
              </button>
              <button type="button" class="danger" @click="removeMaterial(m.id)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div class="footer">
      <div class="sync">
        是否同意同步至本地应用库?
        <label><input v-model="form.syncLocal" type="radio" value="是" /> 是</label>
        <label><input v-model="form.syncLocal" type="radio" value="否" /> 否</label>
      </div>
      <div class="footer-btns">
        <button class="btn" type="button" @click="cancel">取消</button>
        <button class="btn primary" type="button" @click="create">创建</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-page {
  --primary: #409eff;
  max-width: 1100px;
  padding-bottom: 28px;
}

.block {
  margin-bottom: 16px;
  padding: 16px 18px 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.block h3 {
  margin: 0 0 16px;
  padding-left: 10px;
  color: #303133;
  font-size: 15px;
  border-left: 3px solid var(--primary);
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.block-head h3 {
  margin-bottom: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.field.required > span::before {
  content: '*';
  margin-right: 4px;
  color: #f56c6c;
}

.field.full {
  grid-column: 1 / -1;
}

.field input,
.field select,
.field textarea,
.cron-row input[type='time'] {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.field textarea {
  height: auto;
  padding: 8px 10px;
  resize: vertical;
}

.cron-field > span {
  margin-bottom: 6px;
}

.cron-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch i {
  position: absolute;
  inset: 0;
  background: #dcdfe6;
  border-radius: 22px;
  transition: 0.2s;
}

.switch i::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
}

.switch input:checked + i {
  background: var(--primary);
}

.switch input:checked + i::after {
  transform: translateX(18px);
}

.upload-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: #909399;
  background: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
}

.btn {
  height: 34px;
  padding: 0 16px;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn.primary {
  color: #fff;
  background: var(--primary);
  border-color: var(--primary);
}

.file-btn {
  display: inline-flex;
  align-items: center;
}

.file-name {
  margin: 0;
  color: #409eff;
  font-size: 13px;
}

.note {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.top-note {
  margin-bottom: 10px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th,
.table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.table th {
  color: #909399;
  font-weight: 500;
  background: #fafafa;
}

.ops {
  display: flex;
  gap: 10px;
}

.ops button {
  padding: 0;
  color: var(--primary);
  cursor: pointer;
  background: none;
  border: none;
}

.ops .danger {
  color: #f56c6c;
}

.footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding-top: 8px;
}

.sync {
  display: flex;
  gap: 12px;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.footer-btns {
  display: flex;
  gap: 12px;
}

@media (max-width: 800px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
