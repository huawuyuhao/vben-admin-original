<script lang="ts" setup>
import { ElMessage } from 'element-plus';

import { contracts } from '#/views/_shared/data/basic-content';

defineOptions({ name: 'ContentContract' });

function typeClass(t: string) {
  if (t.includes('GPU')) return 'info';
  if (t.includes('CPU')) return 'ok';
  return 'purple';
}

function statusClass(s: string) {
  if (s === '执行中') return 'ok';
  if (s === '待生效') return 'info';
  return 'mute';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 算力合同</div>
    <header class="head">
      <div>
        <h2>算力任务合同数据维护</h2>
      </div>
      <div class="head-actions">
        <button class="btn primary" type="button" @click="ElMessage.success('新增合同（示例）')">
          + 新增
        </button>
        <button class="btn" type="button">导入</button>
        <button class="btn" type="button">批量导入</button>
        <button class="btn" type="button">导出</button>
        <button class="btn" type="button">批量导出</button>
        <button class="btn danger" type="button">批量删除</button>
      </div>
    </header>

    <div class="kpi-row five">
      <div class="kpi"><strong>156</strong><span>总合同数</span></div>
      <div class="kpi"><strong>24</strong><span>待生效</span></div>
      <div class="kpi"><strong>98</strong><span>执行中</span></div>
      <div class="kpi"><strong>32</strong><span>已完成</span></div>
      <div class="kpi"><strong>2</strong><span>已逾期</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>合同编号/名称<input placeholder="请输入合同编号或名称" /></label>
        <label>算力类型<select><option>全部</option></select></label>
        <label>合同状态<select><option>全部</option></select></label>
        <label>客户名称<input placeholder="请输入客户名称" /></label>
        <label>签订日期范围<input type="date" /></label>
        <label>合同金额范围（元）
          <span class="range"><input placeholder="最低" /><i>—</i><input placeholder="最高" /></span>
        </label>
        <label>联系人/联系电话<input placeholder="请输入联系人或电话" /></label>
        <label>附件状态<select><option>全部</option></select></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <label><input type="checkbox" /> 共 156 条记录</label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>合同编号</th>
              <th>合同名称</th>
              <th>算力类型</th>
              <th>客户名称</th>
              <th>联系人</th>
              <th>联系电话</th>
              <th>合同金额</th>
              <th>签订日期</th>
              <th>到期日期</th>
              <th>合同状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in contracts" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.no }}</td>
              <td>{{ r.name }}</td>
              <td><span class="tag" :class="typeClass(r.type)">{{ r.type }}</span></td>
              <td>{{ r.customer }}</td>
              <td>{{ r.contact }}</td>
              <td>{{ r.phone }}</td>
              <td class="price">{{ r.amount }}</td>
              <td>{{ r.sign }}</td>
              <td>{{ r.expire }}</td>
              <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ contracts.length }} 条，共 156 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.kpi-row.five {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.range {
  display: flex;
  gap: 6px;
  align-items: center;
}

.range i {
  font-style: normal;
  color: #909399;
}

.price {
  color: #f56c6c;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .kpi-row.five {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
