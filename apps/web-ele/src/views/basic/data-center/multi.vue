<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { multiDcList, multiDcResource } from '#/views/_shared/data/basic-data-center';

defineOptions({ name: 'DcMulti' });

const tab = ref<'info' | 'resource'>('info');
const nameFilter = ref('');
const regionFilter = ref('全部');
const statusFilter = ref('全部');

const filtered = computed(() => {
  let rows = [...multiDcList];
  if (nameFilter.value.trim()) {
    rows = rows.filter((r) => r.name.includes(nameFilter.value.trim()));
  }
  if (regionFilter.value !== '全部') {
    rows = rows.filter((r) => r.region.includes(regionFilter.value));
  }
  if (statusFilter.value !== '全部') {
    rows = rows.filter((r) => r.status === statusFilter.value);
  }
  return rows;
});

function statusClass(s: string) {
  if (s === '运行中') return 'ok';
  if (s === '维护中') return 'warn';
  if (s === '待机') return 'info';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 多数据中心管理</div>
    <header class="head">
      <div>
        <h2>多数据中心管理</h2>
        <p>统一管理多个数据中心的基线信息与跨中心资源统筹</p>
      </div>
    </header>

    <div class="page-tabs card">
      <button type="button" :class="{ active: tab === 'info' }" @click="tab = 'info'">
        多数据中心基础信息
      </button>
      <button type="button" :class="{ active: tab === 'resource' }" @click="tab = 'resource'">
        跨数据中心资源统筹管理
      </button>
    </div>

    <!-- 基础信息 -->
    <template v-if="tab === 'info'">
      <section class="card">
        <div class="section-head">
          <h3 class="section-title">多数据中心基础信息</h3>
          <button class="btn primary" type="button" @click="ElMessage.success('新增数据中心（示例）')">
            + 新增数据中心
          </button>
        </div>
        <div class="filter">
          <label>名称<input v-model="nameFilter" placeholder="请输入数据中心名称" /></label>
          <label>
            区域
            <select v-model="regionFilter">
              <option>全部</option>
              <option>西南</option>
              <option>华南</option>
              <option>华东</option>
            </select>
          </label>
          <label>
            状态
            <select v-model="statusFilter">
              <option>全部</option>
              <option>运行中</option>
              <option>维护中</option>
              <option>待机</option>
            </select>
          </label>
          <div class="filter-actions">
            <button class="btn primary" type="button">查询</button>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>名称</th>
                <th>编号</th>
                <th>区域</th>
                <th>层级</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filtered" :key="r.id">
                <td>{{ r.name }}</td>
                <td>{{ r.code }}</td>
                <td>{{ r.region }}</td>
                <td><span class="tag purple">{{ r.level }}</span></td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('查看详情（示例）')">
                    详情
                  </button>
                  <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">
                    编辑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">显示 1 到 {{ filtered.length }} 条，共 {{ filtered.length }} 条记录</div>
      </section>
    </template>

    <!-- 资源统筹 -->
    <template v-if="tab === 'resource'">
      <div class="stat-cards">
        <div class="stat-card">
          <strong>824</strong>
          <span>服务器总数</span>
        </div>
        <div class="stat-card">
          <strong>1,380</strong>
          <span>GPU总数</span>
        </div>
        <div class="stat-card">
          <strong>6.1 MW</strong>
          <span>总电力容量</span>
        </div>
        <div class="stat-card">
          <strong>5.3 MW</strong>
          <span>总制冷容量</span>
        </div>
      </div>

      <section class="card">
        <h3 class="section-title">跨中心资源统筹表</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>数据中心</th>
                <th>服务器</th>
                <th>CPU</th>
                <th>GPU</th>
                <th>内存</th>
                <th>存储</th>
                <th>电力</th>
                <th>制冷</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in multiDcResource" :key="r.id">
                <td>{{ r.name }}</td>
                <td>{{ r.servers }}</td>
                <td>{{ r.cpu }}</td>
                <td>{{ r.gpu }}</td>
                <td>{{ r.mem }}</td>
                <td>{{ r.storage }}</td>
                <td>{{ r.power }}</td>
                <td>{{ r.cooling }}</td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('资源调度（示例）')">
                    调度
                  </button>
                  <button type="button" class="link" @click="ElMessage.success('查看详情（示例）')">
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.page-tabs {
  display: flex;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.page-tabs button {
  flex: 1;
  height: 40px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: none;
  border-right: 1px solid #ebeef5;
}

.page-tabs button:last-child {
  border-right: none;
}

.page-tabs button.active {
  font-weight: 500;
  color: #409eff;
  background: #ecf5ff;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  margin: 0;
  font-size: 14px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.stat-card {
  padding: 20px;
  text-align: center;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.stat-card strong {
  display: block;
  margin-bottom: 6px;
  font-size: 26px;
  color: #409eff;
}

.stat-card span {
  font-size: 13px;
  color: #909399;
}

@media (max-width: 1100px) {
  .stat-cards {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
