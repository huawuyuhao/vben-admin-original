<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  preWarningAlerts,
  preWarningRules,
} from '#/views/_shared/data/strategy-algo';

defineOptions({ name: 'StrategyPreWarning' });

const level = ref('');
const status = ref('');

const filtered = computed(() => {
  let list = [...preWarningAlerts];
  if (level.value) list = list.filter((i) => i.level === level.value);
  if (status.value) list = list.filter((i) => i.status === status.value);
  return list;
});

function levelClass(l: string) {
  if (l === '高') return 'high';
  if (l === '中') return 'mid';
  return 'low';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>事前预警算法</h2>
        <p>
          基于策略校核规则与运行态势，在任务执行前预测算力、电价、碳排等风险并提前预警。
        </p>
      </div>
      <button
        class="btn primary"
        type="button"
        @click="ElMessage.success('已触发全量预警扫描（示例）')"
      >
        执行预警扫描
      </button>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>4</strong><span>预警规则</span></div>
      <div class="kpi warn"><strong>3</strong><span>启用中</span></div>
      <div class="kpi"><strong>22</strong><span>近 7 日命中</span></div>
      <div class="kpi"><strong>1</strong><span>待处理预警</span></div>
    </div>

    <section class="card">
      <div class="card-title">预警规则配置</div>
      <table>
        <thead>
          <tr>
            <th>规则ID</th>
            <th>名称</th>
            <th>适用范围</th>
            <th>阈值条件</th>
            <th>级别</th>
            <th>近7日命中</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in preWarningRules" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.scope }}</td>
            <td>{{ r.threshold }}</td>
            <td><span class="prio" :class="levelClass(r.level)">{{ r.level }}</span></td>
            <td>{{ r.hits }}</td>
            <td>
              <span class="badge" :class="r.status === '启用' ? 'run' : 'mute'">
                {{ r.status }}
              </span>
            </td>
            <td>
              <button type="button" class="link" @click="ElMessage.info(`编辑 ${r.name}`)">
                编辑
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <div class="card-title">
        预警事件
        <span class="right">
          <select v-model="level">
            <option value="">全部级别</option>
            <option>高</option>
            <option>中</option>
          </select>
          <select v-model="status">
            <option value="">全部状态</option>
            <option>待处理</option>
            <option>已确认</option>
            <option>已忽略</option>
          </select>
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>预警ID</th>
            <th>时间</th>
            <th>规则</th>
            <th>对象</th>
            <th>级别</th>
            <th>预测说明</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtered" :key="a.id">
            <td>{{ a.id }}</td>
            <td>{{ a.time }}</td>
            <td>{{ a.rule }}</td>
            <td>{{ a.target }}</td>
            <td><span class="prio" :class="levelClass(a.level)">{{ a.level }}</span></td>
            <td>{{ a.forecast }}</td>
            <td>
              <span class="badge" :class="a.status === '待处理' ? 'warn' : 'ok'">
                {{ a.status }}
              </span>
            </td>
            <td>
              <button type="button" class="link" @click="ElMessage.success('已确认预警')">
                确认
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

.card-title select {
  height: 30px;
  margin-left: 8px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.prio {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.prio.high {
  color: #fff;
  background: #f56c6c;
}

.prio.mid {
  color: #fff;
  background: #e6a23c;
}

.prio.low {
  color: #fff;
  background: #67c23a;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.badge.warn {
  color: #e6a23c;
  background: #fdf6ec;
}
</style>
