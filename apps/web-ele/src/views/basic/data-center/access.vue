<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  changeLogs,
  infraAssets,
  itAssets,
  locationTree,
  monitorPoints,
} from '#/views/_shared/data/basic-data-center';

defineOptions({ name: 'DcAccess' });

const tab = ref<'infra' | 'it' | 'location' | 'relation' | 'monitor' | 'change'>('infra');
const infraCategory = ref('全部');
const itType = ref('全部');
const monitorStatus = ref('全部');

const infraCategories = ['供配电', '制冷', '消防'];

const filteredInfra = computed(() => {
  if (infraCategory.value === '全部') return infraAssets;
  return infraAssets.filter((r) => r.category === infraCategory.value);
});

const filteredIt = computed(() => {
  if (itType.value === '全部') return itAssets;
  return itAssets.filter((r) => r.type === itType.value);
});

const filteredMonitor = computed(() => {
  if (monitorStatus.value === '全部') return monitorPoints;
  return monitorPoints.filter((r) => r.status === monitorStatus.value);
});

const assetRelations = computed(() =>
  infraAssets.slice(0, 4).map((infra, i) => ({
    id: i + 1,
    infraCode: infra.code,
    infraName: infra.name,
    itCode: itAssets[i]?.code ?? '-',
    itName: itAssets[i]?.name ?? '-',
    location: infra.location,
    relation: '供电/制冷',
  })),
);

function statusClass(s: string) {
  if (s === '运行' || s === '正常' || s === '启用' || s === '已完成') return 'ok';
  if (s === '维护' || s === '告警' || s === '进行中') return 'warn';
  if (s === '待机' || s === '停用') return 'mute';
  return 'info';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 基础接入管理</div>
    <header class="head">
      <div>
        <h2>基础接入管理</h2>
        <p>管理数据中心基础设施和IT资产台账、位置体系、资产关联、运行监测与变更历史</p>
      </div>
    </header>

    <div class="page-tabs card">
      <button type="button" :class="{ active: tab === 'infra' }" @click="tab = 'infra'">
        基础设施台账
      </button>
      <button type="button" :class="{ active: tab === 'it' }" @click="tab = 'it'">
        IT资产台账
      </button>
      <button type="button" :class="{ active: tab === 'location' }" @click="tab = 'location'">
        位置体系
      </button>
      <button type="button" :class="{ active: tab === 'relation' }" @click="tab = 'relation'">
        资产关联
      </button>
      <button type="button" :class="{ active: tab === 'monitor' }" @click="tab = 'monitor'">
        运行监测
      </button>
      <button type="button" :class="{ active: tab === 'change' }" @click="tab = 'change'">
        变更历史
      </button>
    </div>

    <!-- 基础设施台账 -->
    <template v-if="tab === 'infra'">
      <div class="tree-table card">
        <aside class="tree-panel">
          <div class="tree-title">资产分类</div>
          <ul class="tree">
            <li :class="{ active: infraCategory === '全部' }" @click="infraCategory = '全部'">
              全部资产
            </li>
            <li
              v-for="c in infraCategories"
              :key="c"
              :class="{ active: infraCategory === c }"
              @click="infraCategory = c"
            >
              {{ c }}
            </li>
          </ul>
        </aside>
        <div class="table-panel">
          <div class="toolbar">
            <button class="btn primary" type="button" @click="ElMessage.success('新增基础设施（示例）')">
              + 新增
            </button>
            <span class="count">共 {{ filteredInfra.length }} 条</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>资产编号</th>
                  <th>名称</th>
                  <th>分类</th>
                  <th>类型</th>
                  <th>型号</th>
                  <th>额定值</th>
                  <th>实时值</th>
                  <th>位置</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in filteredInfra" :key="r.id">
                  <td>{{ r.code }}</td>
                  <td>{{ r.name }}</td>
                  <td>{{ r.category }}</td>
                  <td>{{ r.type }}</td>
                  <td>{{ r.model }}</td>
                  <td>{{ r.rated }}</td>
                  <td>{{ r.realtime }}</td>
                  <td>{{ r.location }}</td>
                  <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                  <td class="ops">
                    <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">编辑</button>
                    <button type="button" class="link" @click="ElMessage.success('详情（示例）')">详情</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- IT资产台账 -->
    <template v-if="tab === 'it'">
      <div class="tree-table card">
        <aside class="tree-panel">
          <div class="tree-title">设备类型</div>
          <ul class="tree">
            <li :class="{ active: itType === '全部' }" @click="itType = '全部'">全部设备</li>
            <li :class="{ active: itType === 'GPU服务器' }" @click="itType = 'GPU服务器'">GPU服务器</li>
            <li :class="{ active: itType === '通用服务器' }" @click="itType = '通用服务器'">通用服务器</li>
            <li :class="{ active: itType === '网络设备' }" @click="itType = '网络设备'">网络设备</li>
            <li :class="{ active: itType === '存储' }" @click="itType = '存储'">存储</li>
          </ul>
        </aside>
        <div class="table-panel">
          <div class="toolbar">
            <button class="btn primary" type="button" @click="ElMessage.success('新增IT资产（示例）')">
              + 新增
            </button>
            <span class="count">共 {{ filteredIt.length }} 条</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>资产编号</th>
                  <th>名称</th>
                  <th>类型</th>
                  <th>型号</th>
                  <th>厂商</th>
                  <th>CPU</th>
                  <th>内存</th>
                  <th>功率</th>
                  <th>机架</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in filteredIt" :key="r.id">
                  <td>{{ r.code }}</td>
                  <td>{{ r.name }}</td>
                  <td>{{ r.type }}</td>
                  <td>{{ r.model }}</td>
                  <td>{{ r.vendor }}</td>
                  <td>{{ r.cpu }}</td>
                  <td>{{ r.mem }}</td>
                  <td>{{ r.power }}</td>
                  <td>{{ r.rack }}</td>
                  <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                  <td class="ops">
                    <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">编辑</button>
                    <button type="button" class="link" @click="ElMessage.success('详情（示例）')">详情</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- 位置体系 -->
    <template v-if="tab === 'location'">
      <section class="card">
        <div class="toolbar">
          <button class="btn primary" type="button" @click="ElMessage.success('新增区域（示例）')">
            + 新增区域
          </button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>位置名称</th>
                <th>物理位置</th>
                <th>功能分区</th>
                <th>状态</th>
                <th>备注</th>
                <th>创建时间</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in locationTree" :key="r.id">
                <td><span class="tree-indent">{{ r.name }}</span></td>
                <td>{{ r.physical }}</td>
                <td>{{ r.functional }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td>{{ r.remark }}</td>
                <td>{{ r.created }}</td>
                <td>{{ r.updated }}</td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">编辑</button>
                  <button type="button" class="link danger" @click="ElMessage.success('删除（示例）')">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 资产关联 -->
    <template v-if="tab === 'relation'">
      <section class="card">
        <div class="toolbar">
          <button class="btn primary" type="button" @click="ElMessage.success('新增关联（示例）')">
            + 新增关联
          </button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>基础设施编号</th>
                <th>基础设施名称</th>
                <th>IT资产编号</th>
                <th>IT资产名称</th>
                <th>位置</th>
                <th>关联类型</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in assetRelations" :key="r.id">
                <td>{{ r.infraCode }}</td>
                <td>{{ r.infraName }}</td>
                <td>{{ r.itCode }}</td>
                <td>{{ r.itName }}</td>
                <td>{{ r.location }}</td>
                <td>{{ r.relation }}</td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">编辑</button>
                  <button type="button" class="link danger" @click="ElMessage.success('解除（示例）')">解除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 运行监测 -->
    <template v-if="tab === 'monitor'">
      <div class="monitor-cards">
        <div class="monitor-card">
          <strong>22.5℃</strong>
          <span>平均温度</span>
          <em class="tag ok">正常</em>
        </div>
        <div class="monitor-card">
          <strong>45%</strong>
          <span>平均湿度</span>
          <em class="tag ok">正常</em>
        </div>
        <div class="monitor-card">
          <strong>87.3%</strong>
          <span>GPU利用率</span>
          <em class="tag warn">告警</em>
        </div>
        <div class="monitor-card">
          <strong>1.42</strong>
          <span>实时PUE</span>
          <em class="tag ok">正常</em>
        </div>
      </div>
      <section class="card">
        <div class="filter">
          <label>监测点<input placeholder="请输入名称" /></label>
          <label>类型<select><option>全部</option><option>电力</option><option>环境</option><option>算力</option></select></label>
          <label>
            状态
            <select v-model="monitorStatus">
              <option>全部</option>
              <option>正常</option>
              <option>告警</option>
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
                <th>时间</th>
                <th>编号</th>
                <th>名称</th>
                <th>类型</th>
                <th>指标</th>
                <th>数值</th>
                <th>位置</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredMonitor" :key="r.id">
                <td>{{ r.time }}</td>
                <td>{{ r.code }}</td>
                <td>{{ r.name }}</td>
                <td>{{ r.type }}</td>
                <td>{{ r.metric }}</td>
                <td>{{ r.value }}</td>
                <td>{{ r.location }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 变更历史 -->
    <template v-if="tab === 'change'">
      <div class="kpi-row kpi-row-6">
        <div class="kpi"><strong>156</strong><span>变更总数</span></div>
        <div class="kpi"><strong>42</strong><span>本月变更</span></div>
        <div class="kpi"><strong>128</strong><span>已完成</span></div>
        <div class="kpi"><strong>8</strong><span>进行中</span></div>
        <div class="kpi"><strong>12</strong><span>配置变更</span></div>
        <div class="kpi"><strong>5</strong><span>维护变更</span></div>
      </div>
      <section class="card">
        <div class="filter">
          <label>资产编号<input placeholder="请输入资产编号" /></label>
          <label>变更类型<select><option>全部</option><option>配置变更</option><option>维护</option><option>网络变更</option></select></label>
          <label>状态<select><option>全部</option><option>已完成</option><option>进行中</option></select></label>
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
                <th>变更单号</th>
                <th>资产编号</th>
                <th>资产名称</th>
                <th>变更类型</th>
                <th>来源</th>
                <th>变更前</th>
                <th>变更后</th>
                <th>状态</th>
                <th>操作人</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in changeLogs" :key="r.id">
                <td>{{ r.no }}</td>
                <td>{{ r.assetCode }}</td>
                <td>{{ r.assetName }}</td>
                <td>{{ r.changeType }}</td>
                <td>{{ r.source }}</td>
                <td>{{ r.before }}</td>
                <td>{{ r.after }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td>{{ r.operator }}</td>
                <td>{{ r.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">显示 1 到 {{ changeLogs.length }} 条，共 {{ changeLogs.length }} 条记录</div>
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
  overflow-x: auto;
}

.page-tabs button {
  flex-shrink: 0;
  height: 40px;
  padding: 0 16px;
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: none;
  border-right: 1px solid #ebeef5;
}

.page-tabs button.active {
  color: #409eff;
  font-weight: 500;
  background: #ecf5ff;
}

.tree-table {
  display: flex;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.tree-panel {
  flex-shrink: 0;
  width: 180px;
  padding: 14px;
  border-right: 1px solid #ebeef5;
}

.tree-title {
  margin-bottom: 10px;
  color: #909399;
  font-size: 12px;
}

.tree {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tree li {
  padding: 8px 10px;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
}

.tree li:hover {
  background: #f5f7fa;
}

.tree li.active {
  color: #409eff;
  background: #ecf5ff;
}

.table-panel {
  flex: 1;
  min-width: 0;
  padding: 14px;
}

.tree-indent {
  padding-left: 8px;
}

.monitor-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.monitor-card {
  position: relative;
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.monitor-card strong {
  display: block;
  margin-bottom: 4px;
  font-size: 22px;
}

.monitor-card span {
  color: #909399;
  font-size: 13px;
}

.monitor-card em {
  position: absolute;
  top: 14px;
  right: 14px;
  font-style: normal;
}

.kpi-row-6 {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

@media (max-width: 1100px) {
  .monitor-cards,
  .kpi-row-6 {
    grid-template-columns: 1fr 1fr;
  }

  .tree-table {
    flex-direction: column;
  }

  .tree-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
  }
}
</style>
