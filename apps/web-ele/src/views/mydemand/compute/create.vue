<script lang="ts" setup>
/**
 * 新建算力需求 — 四步向导
 * 1 选择应用 → 2 选择数据 → 3 偏好配置 → 4 确认提交
 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  type PreferOption,
  type WizardApp,
  type WizardMaterial,
  preferOptions,
  wizardApps,
  wizardMaterials,
} from '#/views/_shared/data/compute-demands';

const router = useRouter();
const step = ref(1);
const toast = ref('');

const onlyFav = ref(false);
const selectedAppId = ref(wizardApps[0]?.id || '');
const dataSource = ref<'local' | 'material'>('material');
const selectedMaterialId = ref(wizardMaterials[0]?.id || '');
const localFileName = ref('');
const preferKey = ref<'time' | 'price' | 'carbon'>('time');
const timeUnlimited = ref(true);
const timeStart = ref('');
const timeEnd = ref('');

const form = ref({
  name: '',
  version: '',
  type: 'AI训练',
  preferLabel: '',
  schedule: '未开启',
  desc: '',
  modelFile: '',
});

const steps = [
  { n: 1, label: '① 上传/选择应用' },
  { n: 2, label: '② 上传/选择数据' },
  { n: 3, label: '③ 偏好配置' },
  { n: 4, label: '④ 提交算力需求' },
];

const appList = computed(() =>
  onlyFav.value ? wizardApps.filter((a) => a.favorited) : wizardApps,
);

const selectedApp = computed(
  () => wizardApps.find((a) => a.id === selectedAppId.value) || null,
);

const selectedMaterial = computed(
  () => wizardMaterials.find((m) => m.id === selectedMaterialId.value) || null,
);

const selectedPrefer = computed(
  () => preferOptions.find((p) => p.key === preferKey.value) as PreferOption,
);

function tip(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2200);
}

function goBack() {
  if (step.value > 1) {
    step.value -= 1;
    return;
  }
  router.push('/service/mydemand/compute');
}

function selectApp(app: WizardApp) {
  selectedAppId.value = app.id;
}

function selectMaterial(row: WizardMaterial) {
  selectedMaterialId.value = row.id;
}

function onLocalFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  localFileName.value = file.name;
  tip(`已选择本地文件：${file.name}`);
  input.value = '';
}

function fillStep4() {
  const app = selectedApp.value;
  const prefer = selectedPrefer.value;
  form.value = {
    name: app?.name || '',
    version: app?.version || 'V1.0',
    type: selectedMaterial.value?.type || 'AI训练',
    preferLabel: prefer?.title || '时间优先',
    schedule: timeUnlimited.value
      ? '未开启'
      : `${timeStart.value || '--'} ~ ${timeEnd.value || '--'}`,
    desc: app?.desc || '',
    modelFile: localFileName.value || `${app?.name || 'model'}.zip`,
  };
}

function next() {
  if (step.value === 1) {
    if (!selectedAppId.value) return tip('请先选择一个应用');
    step.value = 2;
    return;
  }
  if (step.value === 2) {
    if (dataSource.value === 'material' && !selectedMaterialId.value) {
      return tip('请选择应用素材数据');
    }
    if (dataSource.value === 'local' && !localFileName.value) {
      return tip('请上传本地数据文件');
    }
    step.value = 3;
    return;
  }
  if (step.value === 3) {
    if (!timeUnlimited.value && (!timeStart.value || !timeEnd.value)) {
      return tip('请填写期望完成时间，或勾选无限制');
    }
    fillStep4();
    step.value = 4;
  }
}

function goCreateApp() {
  router.push('/service/mydemand/apps');
}

function removeModelFile() {
  form.value.modelFile = '';
  tip('已删除模型文件（示例）');
}

function submit() {
  if (!form.value.name.trim()) return tip('请填写应用名称');
  tip('算力需求已提交，等待运营端审核（示例）');
  window.setTimeout(() => router.push('/service/mydemand/compute'), 1000);
}
</script>

<template>
  <div class="portal-inner-page demand-create">
    <div class="flow-head">
      <div>
        <h2>产品服务流程 —— 从 AI 需求到训练只需四步</h2>
        <div class="steps">
          <div
            v-for="s in steps"
            :key="s.n"
            class="step"
            :class="{ on: step === s.n, done: step > s.n }"
          >
            {{ s.label }}
          </div>
        </div>
      </div>
      <button type="button" @click="goBack">返回</button>
    </div>

    <!-- 步骤1：选择应用 -->
    <section v-if="step === 1" class="panel">
      <div class="panel-head">
        <h3>应用信息</h3>
        <button
          type="button"
          class="fav-btn"
          :class="{ on: onlyFav }"
          @click="onlyFav = !onlyFav"
        >
          ★ 我的收藏
        </button>
      </div>
      <div class="app-grid">
        <article
          v-for="app in appList"
          :key="app.id"
          class="app-card"
          :class="{ selected: selectedAppId === app.id }"
          @click="selectApp(app)"
        >
          <div class="side-tags">
            <span>{{ app.category }}</span>
            <span>{{ app.domain }}</span>
          </div>
          <div v-if="selectedAppId === app.id" class="check">✓</div>
          <h4>{{ app.name }}</h4>
          <div class="icon">📦</div>
          <p>{{ app.desc }}</p>
        </article>
      </div>
      <div class="bottom">
        <button class="primary lg" type="button" @click="next">下一步</button>
        <p class="hint">
          没有想要的，
          <a href="javascript:;" @click="goCreateApp">创建应用 &gt;</a>
        </p>
      </div>
    </section>

    <!-- 步骤2：选择数据 -->
    <section v-if="step === 2" class="panel">
      <h3>应用数据</h3>
      <div class="radios">
        <label>
          <input v-model="dataSource" type="radio" value="local" />
          本地上传
        </label>
        <label>
          <input v-model="dataSource" type="radio" value="material" />
          应用素材数据
        </label>
      </div>

      <div v-if="dataSource === 'local'" class="upload-box">
        <label class="upload">
          <input type="file" @change="onLocalFile" />
          <div>
            <p>拖拽或点击上传本地数据文件</p>
            <p v-if="localFileName" class="picked">
              已选择：{{ localFileName }}
            </p>
          </div>
        </label>
      </div>

      <div v-else class="table-wrap">
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
            <tr
              v-for="row in wizardMaterials"
              :key="row.id"
              :class="{ on: selectedMaterialId === row.id }"
            >
              <td>{{ row.id }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.fileName }}</td>
              <td>{{ row.uploadedAt }}</td>
              <td>
                <button
                  type="button"
                  class="link"
                  @click="selectMaterial(row)"
                >
                  {{ selectedMaterialId === row.id ? '已选择' : '选择' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom">
        <button class="primary lg" type="button" @click="next">下一步</button>
      </div>
    </section>

    <!-- 步骤3：偏好配置 -->
    <section v-if="step === 3" class="panel">
      <h3>应用信息</h3>
      <div v-if="selectedApp" class="info-card">
        <div class="ic">📄</div>
        <div>
          <div class="name">
            {{ selectedApp.name }}
            <span class="ver">{{ selectedApp.version }}</span>
          </div>
          <div class="meta">
            {{ selectedApp.owner }}
            <span class="pill">{{ selectedApp.category }}</span>
          </div>
          <p>{{ selectedApp.desc }}</p>
        </div>
      </div>

      <h3>应用数据</h3>
      <div class="info-card">
        <div class="ic">🗂</div>
        <div>
          <div class="name">
            {{
              dataSource === 'local'
                ? localFileName
                : selectedMaterial?.fileName
            }}
          </div>
          <div class="meta">
            {{ dataSource === 'local' ? '本地上传' : selectedMaterial?.type }}
          </div>
          <p>
            解析结果：
            {{
              dataSource === 'local'
                ? '待解析'
                : `${selectedMaterial?.imageCount || 0} 张图片`
            }}
          </p>
        </div>
      </div>

      <h3>偏好设置</h3>
      <div class="time-row">
        <span>期望完成时间</span>
        <input
          v-model="timeStart"
          type="datetime-local"
          :disabled="timeUnlimited"
        />
        <span>至</span>
        <input
          v-model="timeEnd"
          type="datetime-local"
          :disabled="timeUnlimited"
        />
        <label class="chk">
          <input v-model="timeUnlimited" type="checkbox" />
          无限制
        </label>
      </div>

      <div class="prefer-grid">
        <article
          v-for="p in preferOptions"
          :key="p.key"
          class="prefer-card"
          :class="{ on: preferKey === p.key }"
          @click="preferKey = p.key"
        >
          <div class="p-icon">{{ p.icon }}</div>
          <h4>{{ p.title }}</h4>
          <ul>
            <li>预计费用：{{ p.cost }} 元</li>
            <li>预计时长：{{ p.minutes }} 分钟</li>
            <li>预计碳排放：{{ p.carbonKg }} 千克</li>
          </ul>
        </article>
      </div>
      <p class="more-link">推荐类型不满足需求，至云服务产品选择更多配置……</p>

      <div class="bottom">
        <button class="primary lg" type="button" @click="next">下一步</button>
      </div>
    </section>

    <!-- 步骤4：确认提交 -->
    <section v-if="step === 4" class="panel">
      <h3>应用基本信息</h3>
      <div class="form-grid">
        <div class="field">
          <label>应用名称 <i>*</i></label>
          <input v-model="form.name" type="text" />
        </div>
        <div class="field">
          <label>应用版本 <i>*</i></label>
          <input v-model="form.version" type="text" />
        </div>
        <div class="field">
          <label>应用类型 <i>*</i></label>
          <select v-model="form.type">
            <option>AI训练</option>
            <option>文本训练</option>
            <option>推理类</option>
          </select>
        </div>
        <div class="field">
          <label>偏好设置 <i>*</i></label>
          <input v-model="form.preferLabel" type="text" readonly />
        </div>
        <div class="field">
          <label>定时任务</label>
          <input v-model="form.schedule" type="text" readonly />
        </div>
        <div class="field full">
          <label>应用描述 <i>*</i></label>
          <textarea v-model="form.desc" rows="3" />
        </div>
      </div>

      <h3>应用模型上传</h3>
      <div class="file-row">
        <span>📎 {{ form.modelFile || '未上传' }}</span>
        <button type="button" class="link" @click="removeModelFile">
          删除文件
        </button>
      </div>
      <p class="note">
        注：上传文件支持 zip、xml、excel 等格式；大小建议不超过 2GB。
      </p>

      <h3>应用素材配置</h3>
      <p class="note">
        注：上传文件支持 zip、xml、excel 等格式；大小建议不超过 2GB。
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
            <tr
              v-for="row in wizardMaterials.slice(0, 2)"
              :key="row.id"
              :class="{ on: selectedMaterialId === row.id }"
            >
              <td>{{ row.id }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.fileName }}</td>
              <td>{{ row.uploadedAt }}</td>
              <td>
                <button
                  type="button"
                  class="link"
                  @click="selectMaterial(row)"
                >
                  选择
                </button>
                <button
                  type="button"
                  class="link danger"
                  @click="tip(`删除素材：${row.name}`)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom row">
        <button type="button" @click="router.push('/service/mydemand/compute')">
          取消
        </button>
        <button class="primary" type="button" @click="submit">提交</button>
      </div>
    </section>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.flow-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 18px;
  margin-bottom: 14px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
}

.flow-head h2 {
  margin: 0 0 12px;
  font-size: 16px;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.step {
  padding: 6px 14px;
  font-size: 13px;
  color: #757575;
  background: #f5f5f5;
  border-radius: 999px;
}

.step.on {
  color: #fff;
  background: #409eff;
}

.step.done {
  color: #1565c0;
  background: #e3f2fd;
}

.panel {
  padding: 18px 20px;
  margin-bottom: 14px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
}

.panel h3 {
  margin: 0 0 14px;
  font-size: 15px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-head h3 {
  margin: 0;
}

.fav-btn {
  height: 32px;
  padding: 0 12px;
  color: #757575;
  cursor: pointer;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.fav-btn.on {
  color: #f9a825;
  background: #fffde7;
  border-color: #ffe082;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 960px) {
  .app-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.app-card {
  position: relative;
  min-height: 160px;
  padding: 14px 40px 14px 14px;
  cursor: pointer;
  background: #f7f8fa;
  border: 1px solid transparent;
  border-radius: 10px;
}

.app-card.selected {
  background: #eef6ff;
  border-color: #90caf9;
}

.side-tags {
  position: absolute;
  top: 10px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-tags span {
  padding: 2px 5px;
  font-size: 11px;
  color: #1565c0;
  writing-mode: vertical-rl;
  background: #e3f2fd;
  border-radius: 4px;
}

.check {
  position: absolute;
  top: 10px;
  right: 36px;
  width: 22px;
  height: 22px;
  font-size: 12px;
  line-height: 22px;
  color: #fff;
  text-align: center;
  background: #212121;
  border-radius: 50%;
}

.app-card h4 {
  margin: 0 0 8px;
  font-size: 15px;
}

.app-card .icon {
  position: absolute;
  right: 48px;
  bottom: 48px;
  font-size: 28px;
  opacity: 0.35;
}

.app-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #757575;
}

.bottom {
  margin-top: 20px;
  text-align: center;
}

.bottom.row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

button.primary {
  height: 32px;
  padding: 0 16px;
  color: #fff;
  cursor: pointer;
  background: #409eff;
  border: 1px solid #409eff;
  border-radius: 6px;
}

button.primary.lg {
  height: 40px;
  min-width: 160px;
  font-size: 15px;
}

.hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: #9e9e9e;
}

.hint a {
  color: #409eff;
  text-decoration: none;
}

.radios {
  display: flex;
  gap: 20px;
  margin-bottom: 14px;
  font-size: 14px;
}

.upload-box {
  margin-bottom: 12px;
}

.upload {
  display: block;
  padding: 36px;
  text-align: center;
  cursor: pointer;
  background: #f7f9fc;
  border: 1px dashed #c0d4ef;
  border-radius: 10px;
}

.upload input {
  display: none;
}

.picked {
  margin-top: 8px;
  color: #409eff;
}

.table-wrap {
  overflow: auto;
  border: 1px solid #eee;
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
  background: #fafafa;
}

tr.on {
  background: #e0ffff;
}

.link {
  margin-right: 8px;
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.link.danger {
  color: #f44336;
}

.info-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  margin-bottom: 16px;
  background: #f7f8fa;
  border-radius: 10px;
}

.ic {
  font-size: 28px;
}

.info-card .name {
  margin-bottom: 4px;
  font-weight: 700;
}

.ver {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #9e9e9e;
}

.meta {
  margin-bottom: 6px;
  font-size: 12px;
  color: #757575;
}

.pill {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 8px;
  color: #00897b;
  background: #e0f2f1;
  border-radius: 999px;
}

.info-card p {
  margin: 0;
  font-size: 13px;
  color: #757575;
}

.time-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
  font-size: 13px;
}

.time-row input[type='datetime-local'] {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.chk {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.prefer-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 900px) {
  .prefer-grid {
    grid-template-columns: 1fr;
  }
}

.prefer-card {
  padding: 16px;
  cursor: pointer;
  background: #fafafa;
  border: 2px solid transparent;
  border-radius: 10px;
}

.prefer-card.on {
  background: #eef6ff;
  border-color: #409eff;
}

.p-icon {
  margin-bottom: 8px;
  font-size: 28px;
}

.prefer-card h4 {
  margin: 0 0 10px;
}

.prefer-card ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #616161;
}

.more-link {
  margin: 12px 0 0;
  font-size: 13px;
  color: #409eff;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  margin-bottom: 18px;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
}

.field label i {
  font-style: normal;
  color: #f44336;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.file-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f5f5f5;
  border-radius: 8px;
}

.note {
  margin: 0 0 12px;
  font-size: 12px;
  color: #9e9e9e;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 4000;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
}
</style>
