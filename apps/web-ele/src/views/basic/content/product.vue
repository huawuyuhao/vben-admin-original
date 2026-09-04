<script lang="ts" setup>
import { ElMessage } from 'element-plus';

defineOptions({ name: 'ContentProduct' });

/** 算力产品列表（待对接接口） */
const products: never[] = [];

function typeClass(t: string) {
  if (t.includes('GPU')) return 'info';
  if (t.includes('CPU')) return 'ok';
  return 'purple';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 算力产品管理</div>
    <header class="head">
      <div>
        <h2>算力产品管理</h2>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">导入</button>
        <button class="btn" type="button">导出</button>
        <button class="btn warn" type="button">批量下架</button>
        <button class="btn primary" type="button" @click="ElMessage.success('新增产品（示例）')">
          + 新增产品
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <div class="kpi"><strong>48</strong><span>总产品数</span></div>
      <div class="kpi"><strong>32</strong><span>上线中</span></div>
      <div class="kpi"><strong>8</strong><span>待上线</span></div>
      <div class="kpi"><strong>8</strong><span>已下架</span></div>
    </div>

    <section class="card">
      <div class="filter">
        <label>产品名称/关键词<input /></label>
        <label>产品类型<select><option>全部</option></select></label>
        <label>上架状态<select><option>全部</option></select></label>
        <label>价格区间（元/小时）
          <span class="range"><input placeholder="最低" /><i>—</i><input placeholder="最高" /></span>
        </label>
        <label>上架日期范围<input type="date" /></label>
        <div class="filter-actions">
          <button class="btn" type="button">重置</button>
          <button class="btn primary" type="button">查询</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <label><input type="checkbox" /> 共 48 条记录</label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>产品名称</th>
              <th>产品类型</th>
              <th>规格配置</th>
              <th>售价（元/小时）</th>
              <th>库存状态</th>
              <th>上架状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in products" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.name }}</td>
              <td><span class="tag" :class="typeClass(r.type)">{{ r.type }}</span></td>
              <td>{{ r.spec }}</td>
              <td class="price">{{ r.price }}</td>
              <td>
                <span class="tag" :class="r.stock.includes('充足') ? 'ok' : 'warn'">{{
                  r.stock
                }}</span>
              </td>
              <td>
                <span class="tag" :class="r.status === '上线中' ? 'ok' : 'info'">{{
                  r.status
                }}</span>
              </td>
              <td>{{ r.created }}</td>
              <td class="ops">
                <button type="button" class="link">详情</button>
                <button type="button" class="link">编辑</button>
                <button type="button" class="link warn">
                  {{ r.status === '上线中' ? '下架' : '上架' }}
                </button>
                <button type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">显示 1 到 {{ products.length }} 条，共 48 条记录</div>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
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
  font-weight: 600;
  color: #f56c6c;
}

.btn.warn {
  color: #e6a23c;
  border-color: #f5dab1;
}
</style>
