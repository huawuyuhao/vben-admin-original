<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { monitorTasks } from '#/views/_shared/data/ecc-model';

defineOptions({ name: 'EccMonitor' });

const keyword = ref('');
const status = ref('');

const filtered = computed(() => {
  let list = [...monitorTasks];
  if (keyword.value.trim()) {
    const kw = keyword.value.trim();
    list = list.filter((i) => i.name.includes(kw) || i.id.includes(kw));
  }
  if (status.value) list = list.filter((i) => i.status === status.value);
  return list;
});

function statusClass(s: string) {
  if (s === '运行中') return 'run';
  if (s === '已完成') return 'ok';
  if (s === '告警') return 'danger';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>智算任务运行状态综合监测</h2>
        <p>综合监测任务算力占用、电力负荷、碳排强度与执行进度，支持异常任务快速定位。</p>
      </div>
      <button class="btn" type="button" @click="ElMessage.success('已刷新')">
        刷新
      </button>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>5</strong><span>监测任务</span></div>
      <div class="kpi"><strong>2</strong><span>运行中</span></div>
      <div class="kpi warn"><strong>1</strong><span>告警</span></div>
      <div class="kpi"><strong>66%</strong><span>平均算力占用</span></div>
    </div>

    <div class="filter card">
      <input v-model="keyword" placeholder="任务名称/ID" />
      <select v-model="status">
        <option value="">全部状态</option>
        <option>运行中</option>
        <option>排队中</option>
        <option>告警</option>
        <option>已完成</option>
      </select>
    </div>

    <section class="card">
      <div class="card-title">任务监测列表</div>
      <table>
        <thead>
          <tr>
            <th>任务ID</th>
            <th>名称</th>
            <th>状态</th>
            <th>算力占用</th>
            <th>电力</th>
            <th>碳排强度</th>
            <th>进度</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.name }}</td>
            <td>
              <span class="badge" :class="statusClass(r.status)">{{ r.status }}</span>
            </td>
            <td>{{ r.compute }}</td>
            <td>{{ r.power }}</td>
            <td>{{ r.carbon }}</td>
            <td>
              <div class="prog">
                <i :style="{ width: `${r.progress}%` }"></i>
                <em>{{ r.progress }}%</em>
              </div>
            </td>
            <td>
              <button
                type="button"
                class="link"
                @click="ElMessage.info(`查看 ${r.name}`)"
              >
                详情
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.filter {
  display: flex;
  gap: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.filter input,
.filter select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.prog {
  position: relative;
  width: 90px;
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
}

.prog i {
  display: block;
  height: 100%;
  background: #409eff;
  border-radius: 4px;
}

.prog em {
  position: absolute;
  top: -16px;
  right: 0;
  font-size: 11px;
  font-style: normal;
  color: #909399;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.badge.danger {
  color: #f56c6c;
  background: #fef0f0;
}
</style>
