<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'WorkbenchAppBasic' });

const saving = ref(false);
const form = reactive({
  defaultVersion: 'V1.0',
  defaultType: '训练类',
  allowUserUpload: true,
  autoAudit: false,
  syncLocalDefault: true,
  maxModelSizeGb: 10,
  maxMaterialSizeGb: 10,
  allowedFormats: 'zip,xml,xlsx,xls',
  shelfNeedAudit: true,
  warehouseNotify: true,
});

async function save() {
  saving.value = true;
  try {
    await new Promise((r) => setTimeout(r, 400));
    ElMessage.success('应用基础配置已保存（示例）');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="basic-page">
    <header>
      <h2>应用基础配置</h2>
      <p>配置应用默认版本、上传限制、审核与同步策略等全局规则。</p>
    </header>

    <section class="card">
      <h3>默认信息</h3>
      <div class="grid">
        <label>
          <span>默认版本号</span>
          <input v-model="form.defaultVersion" type="text" />
        </label>
        <label>
          <span>默认应用类型</span>
          <select v-model="form.defaultType">
            <option>训练类</option>
            <option>推理类</option>
            <option>分析类</option>
            <option>渲染类</option>
          </select>
        </label>
        <label>
          <span>允许用户上传</span>
          <input v-model="form.allowUserUpload" type="checkbox" />
        </label>
        <label>
          <span>新建后自动提交审核</span>
          <input v-model="form.autoAudit" type="checkbox" />
        </label>
      </div>
    </section>

    <section class="card">
      <h3>上传与格式</h3>
      <div class="grid">
        <label>
          <span>模型包大小上限 (GB)</span>
          <input v-model.number="form.maxModelSizeGb" type="number" min="1" />
        </label>
        <label>
          <span>素材包大小上限 (GB)</span>
          <input v-model.number="form.maxMaterialSizeGb" type="number" min="1" />
        </label>
        <label class="full">
          <span>允许格式（逗号分隔）</span>
          <input v-model="form.allowedFormats" type="text" />
        </label>
      </div>
    </section>

    <section class="card">
      <h3>上架与出入库</h3>
      <div class="grid">
        <label>
          <span>上架需审核</span>
          <input v-model="form.shelfNeedAudit" type="checkbox" />
        </label>
        <label>
          <span>默认同步本地应用库</span>
          <input v-model="form.syncLocalDefault" type="checkbox" />
        </label>
        <label>
          <span>出入库变更通知</span>
          <input v-model="form.warehouseNotify" type="checkbox" />
        </label>
      </div>
    </section>

    <button class="btn" type="button" :disabled="saving" @click="save">
      {{ saving ? '保存中…' : '保存配置' }}
    </button>
  </div>
</template>

<style scoped>
.basic-page {
  max-width: 880px;
  padding-bottom: 28px;
}

header {
  margin-bottom: 16px;
}

header h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

header p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.card {
  margin-bottom: 14px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.card h3 {
  margin: 0 0 14px;
  padding-left: 10px;
  font-size: 15px;
  border-left: 3px solid #409eff;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
}

.grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.grid label.full {
  grid-column: 1 / -1;
}

.grid input[type='text'],
.grid input[type='number'],
.grid select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn {
  height: 36px;
  padding: 0 22px;
  color: #fff;
  cursor: pointer;
  background: #409eff;
  border: none;
  border-radius: 4px;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
