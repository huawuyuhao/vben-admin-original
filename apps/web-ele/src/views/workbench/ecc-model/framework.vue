<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { frameworkJobs } from '#/views/_shared/data/ecc-model';

defineOptions({ name: 'EccFramework' });

const source = ref('PyTorch JobSpec');
const mapping = ref('标准映射模板 v1');
const rows = ref([...frameworkJobs]);

function convert() {
  rows.value.unshift({
    id: `CV-${String(rows.value.length + 1).padStart(2, '0')}`,
    source: source.value,
    target: '电碳算统一任务模型',
    status: '成功',
    time: new Date().toISOString().slice(0, 16).replace('T', ' '),
  });
  ElMessage.success('框架转换完成（示例）');
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>任务模型框架转换</h2>
        <p>
          将异构训练/推理任务描述转换为电碳算统一任务模型，保留算力、电力、碳排等扩展字段。
        </p>
      </div>
      <button class="btn primary" type="button" @click="convert">执行转换</button>
    </header>

    <section class="card">
      <div class="card-title">转换配置</div>
      <div class="form-row">
        <label>
          源框架
          <select v-model="source">
            <option>PyTorch JobSpec</option>
            <option>K8s Volcano YAML</option>
            <option>TensorFlow Estimator</option>
            <option>自定义 JSON</option>
          </select>
        </label>
        <label>
          映射模板
          <select v-model="mapping">
            <option>标准映射模板 v1</option>
            <option>边缘推理映射 v2</option>
            <option>训练增强映射 v3</option>
          </select>
        </label>
      </div>
      <div class="flow">
        <span>源任务描述</span><i>→</i>
        <span>字段解析</span><i>→</i>
        <span>映射校验</span><i>→</i>
        <span>统一任务模型</span>
      </div>
    </section>

    <section class="card">
      <div class="card-title">转换记录</div>
      <table>
        <thead>
          <tr>
            <th>任务ID</th>
            <th>源框架</th>
            <th>目标模型</th>
            <th>状态</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.source }}</td>
            <td>{{ r.target }}</td>
            <td>
              <span class="badge" :class="r.status === '成功' ? 'ok' : 'danger'">
                {{ r.status }}
              </span>
            </td>
            <td>{{ r.time }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.form-row label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.form-row select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.flow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.flow span {
  padding: 8px 12px;
  color: #409eff;
  font-size: 13px;
  background: #ecf5ff;
  border-radius: 4px;
}

.flow i {
  color: #909399;
  font-style: normal;
}

.badge.danger {
  color: #f56c6c;
  background: #fef0f0;
}
</style>
