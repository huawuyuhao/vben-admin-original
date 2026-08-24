<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'DcInfo' });

interface DcInfoRow {
  id: string;
  name: string;
  code: string;
  region: string;
  level: string;
  cabinets: number;
  pue: number;
  status: string;
  updatedAt: string;
}

const rows: DcInfoRow[] = [
  {
    id: '1',
    name: '华东一号数据中心',
    code: 'DC-HD-001',
    region: '上海',
    level: 'Tier III',
    cabinets: 1280,
    pue: 1.32,
    status: '运行中',
    updatedAt: '2026-08-20 14:30',
  },
  {
    id: '2',
    name: '华北智算中心',
    code: 'DC-HB-002',
    region: '北京',
    level: 'Tier IV',
    cabinets: 960,
    pue: 1.28,
    status: '运行中',
    updatedAt: '2026-08-19 09:15',
  },
  {
    id: '3',
    name: '西南边缘节点',
    code: 'DC-XN-003',
    region: '成都',
    level: 'Tier II',
    cabinets: 320,
    pue: 1.45,
    status: '维护中',
    updatedAt: '2026-08-18 16:42',
  },
  {
    id: '4',
    name: '华南灾备中心',
    code: 'DC-HN-004',
    region: '深圳',
    level: 'Tier III',
    cabinets: 640,
    pue: 1.35,
    status: '运行中',
    updatedAt: '2026-08-17 11:08',
  },
  {
    id: '5',
    name: '西北绿电数据中心',
    code: 'DC-XB-005',
    region: '西安',
    level: 'Tier III',
    cabinets: 512,
    pue: 1.22,
    status: '待上线',
    updatedAt: '2026-08-16 08:55',
  },
];

const keyword = ref('');
const region = ref('全部');
const status = ref('全部');

const filtered = computed(() => {
  let list = [...rows];
  if (keyword.value.trim()) {
    const k = keyword.value.trim();
    list = list.filter((r) => r.name.includes(k) || r.code.includes(k));
  }
  if (region.value !== '全部') {
    list = list.filter((r) => r.region === region.value);
  }
  if (status.value !== '全部') {
    list = list.filter((r) => r.status === status.value);
  }
  return list;
});

function statusClass(s: string) {
  if (s === '运行中') return 'ok';
  if (s === '维护中') return 'warn';
  if (s === '待上线') return 'info';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / 数据中心信息管理</div>
    <header class="head">
      <div>
        <h2>数据中心信息管理</h2>
        <p>维护数据中心档案信息，包括区域、等级、机柜规模与 PUE 能效指标。</p>
      </div>
      <div class="head-actions">
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新增数据中心档案（示例）')"
        >
          + 新增档案
        </button>
        <button class="btn" type="button" @click="ElMessage.success('导出（示例）')">
          导出
        </button>
      </div>
    </header>

    <section class="card">
      <div class="filter">
        <label>
          名称/编码
          <input v-model="keyword" placeholder="请输入名称或编码" />
        </label>
        <label>
          区域
          <select v-model="region">
            <option>全部</option>
            <option>上海</option>
            <option>北京</option>
            <option>成都</option>
            <option>深圳</option>
            <option>西安</option>
          </select>
        </label>
        <label>
          状态
          <select v-model="status">
            <option>全部</option>
            <option>运行中</option>
            <option>维护中</option>
            <option>待上线</option>
          </select>
        </label>
        <div class="filter-actions">
          <button class="btn primary" type="button">查询</button>
          <button
            class="btn"
            type="button"
            @click="
              keyword = '';
              region = '全部';
              status = '全部';
            "
          >
            重置
          </button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <span>共 {{ filtered.length }} 条记录</span>
        <span class="count">
          <button class="btn" type="button" @click="ElMessage.success('已刷新')">↻</button>
        </span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>编码</th>
              <th>区域</th>
              <th>等级</th>
              <th>机柜数</th>
              <th>PUE</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ r.name }}</td>
              <td>{{ r.code }}</td>
              <td>{{ r.region }}</td>
              <td>{{ r.level }}</td>
              <td>{{ r.cabinets }}</td>
              <td>{{ r.pue }}</td>
              <td>
                <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td>{{ r.updatedAt }}</td>
              <td class="ops">
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`查看 ${r.name}（示例）`)"
                >
                  详情
                </button>
                <button
                  type="button"
                  class="link"
                  @click="ElMessage.success(`编辑 ${r.name}（示例）`)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="link danger"
                  @click="ElMessage.success(`删除 ${r.name}（示例）`)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ filtered.length }} 条，共 {{ filtered.length }} 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
