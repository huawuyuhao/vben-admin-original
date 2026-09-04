<script lang="ts" setup>
import { ElMessage } from 'element-plus';

defineOptions({ name: 'ContentSettlement' });

/** 结算列表（待对接接口） */
const settlements: never[] = [];

</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 算力结算</div>
    <header class="head">
      <div>
        <h2>算力任务结算信息台账</h2>
      </div>
      <div class="head-actions">
        <button class="btn ok" type="button" @click="ElMessage.success('导出台账（示例）')">
          导出台账
        </button>
        <button class="btn" type="button">打印</button>
        <button class="btn" type="button">高级筛选</button>
        <button class="btn" type="button" @click="ElMessage.success('已刷新')">刷新</button>
      </div>
    </header>

    <div class="kpi-row six">
      <div class="kpi"><strong>186笔</strong><span>累计结算笔数</span></div>
      <div class="kpi"><strong>6,892万</strong><span>累计结算金额</span></div>
      <div class="kpi"><strong>326万</strong><span>累计未收金额</span></div>
      <div class="kpi"><strong>6,280万</strong><span>累计开票金额</span></div>
      <div class="kpi"><strong>128万</strong><span>逾期未收金额</span></div>
      <div class="kpi"><strong>786万</strong><span>累计税额</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>结算单号/合同编号<input /></label>
        <label>客户名称<input /></label>
        <label>算力类型<select><option>全部</option></select></label>
        <label>结算状态<select><option>全部</option></select></label>
        <label>开票状态<select><option>全部</option></select></label>
        <label>
          结算月份
          <input type="month" value="2026-03" />
        </label>
        <label>收款状态<select><option>全部</option></select></label>
        <label>经办人<input /></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
      <div class="quick">
        <button type="button" class="btn">本月</button>
        <button type="button" class="btn">上月</button>
        <button type="button" class="btn">本季度</button>
        <button type="button" class="btn">本年度</button>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <label>
          <input type="checkbox" />
          共 186 条记录，当前页合计：应收金额 1,280,000.00元 | 已收金额 890,000.00元
        </label>
        <span class="count">
          <button class="btn ok" type="button">批量导出</button>
          <button class="btn primary" type="button">批量开票</button>
        </span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>序号</th>
              <th>结算单号</th>
              <th>关联合同号</th>
              <th>合同名称</th>
              <th>客户名称</th>
              <th>客户类型</th>
              <th>算力类型</th>
              <th>结算周期</th>
              <th>结算日期</th>
              <th>应收金额(元)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in settlements" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ idx + 1 }}</td>
              <td>{{ r.no }}</td>
              <td>{{ r.contract }}</td>
              <td>{{ r.contractName }}</td>
              <td>{{ r.customer }}</td>
              <td>{{ r.customerType }}</td>
              <td>
                <span
                  class="tag"
                  :class="
                    r.computeType === 'GPU'
                      ? 'info'
                      : r.computeType === 'CPU'
                        ? 'ok'
                        : 'purple'
                  "
                >
                  {{ r.computeType }}
                </span>
              </td>
              <td>{{ r.period }}</td>
              <td>{{ r.date }}</td>
              <td class="price">{{ r.amount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ settlements.length }} 条，共 186 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.kpi-row.six {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.quick {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.price {
  font-weight: 600;
  color: #303133;
}

@media (max-width: 1200px) {
  .kpi-row.six {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
