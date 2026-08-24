<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { enterpriseArchives } from '#/views/_shared/data/basic-customer';

defineOptions({ name: 'EnterpriseArchive' });

const name = ref('');
const credit = ref('');
const industry = ref('全部');
const grade = ref('全部');
const auth = ref('全部');
const page = ref(1);
const pageSize = 5;

const filtered = computed(() => {
  let rows = [...enterpriseArchives];
  if (name.value.trim()) {
    rows = rows.filter((r) => r.name.includes(name.value.trim()));
  }
  if (credit.value.trim()) {
    rows = rows.filter((r) => r.credit.includes(credit.value.trim()));
  }
  if (industry.value !== '全部') {
    rows = rows.filter((r) => r.industry === industry.value);
  }
  if (grade.value !== '全部') {
    rows = rows.filter((r) => r.grade === grade.value);
  }
  if (auth.value !== '全部') {
    rows = rows.filter((r) => r.auth === auth.value);
  }
  return rows;
});

const paged = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

function reset() {
  name.value = '';
  credit.value = '';
  industry.value = '全部';
  grade.value = '全部';
  auth.value = '全部';
  page.value = 1;
}

function gradeClass(g: string) {
  if (g === 'VIP客户') return 'vip';
  if (g === '高级客户') return 'premium';
  if (g === '标准客户') return 'std';
  return 'basic';
}

function authClass(a: string) {
  if (a === '已认证') return 'ok';
  if (a === '待认证') return 'warn';
  if (a === '未通过') return 'danger';
  return 'expire';
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>企业客户档案管理</h2>
        <p>客户管理 / 企业客户档案管理 / 企业客户档案列表</p>
      </div>
      <div class="head-actions">
        <button class="btn" type="button" @click="ElMessage.success('导入（示例）')">
          导入
        </button>
        <button class="btn" type="button" @click="ElMessage.success('导出（示例）')">
          导出
        </button>
        <button
          class="btn primary"
          type="button"
          @click="ElMessage.success('新增企业客户（示例）')"
        >
          + 新增企业客户
        </button>
      </div>
    </header>

    <section class="card filter-card">
      <div class="filter">
        <label>企业名称<input v-model="name" /></label>
        <label>统一社会信用代码<input v-model="credit" /></label>
        <label>
          所属行业
          <select v-model="industry">
            <option>全部</option>
            <option>能源</option>
            <option>制造业</option>
            <option>建筑业</option>
          </select>
        </label>
        <label>
          客户等级
          <select v-model="grade">
            <option>全部</option>
            <option>VIP客户</option>
            <option>高级客户</option>
            <option>标准客户</option>
            <option>基础客户</option>
          </select>
        </label>
        <label>
          认证状态
          <select v-model="auth">
            <option>全部</option>
            <option>已认证</option>
            <option>待认证</option>
            <option>未通过</option>
            <option>已过期</option>
          </select>
        </label>
        <div class="filter-actions">
          <button class="btn primary" type="button" @click="page = 1">查询</button>
          <button class="btn" type="button" @click="reset">重置</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="toolbar">
        <label><input type="checkbox" /> 全选</label>
        <button class="btn" type="button" @click="ElMessage.warning('删除（示例）')">
          删除
        </button>
        <button class="btn" type="button" @click="ElMessage.info('加入黑名单（示例）')">
          加入黑名单
        </button>
        <span class="count">共 {{ filtered.length }} 条记录</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>序号</th>
              <th>企业名称</th>
              <th>统一社会信用代码</th>
              <th>法人代表</th>
              <th>联系方式</th>
              <th>所属行业</th>
              <th>客户等级</th>
              <th>认证状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paged" :key="r.id">
              <td><input type="checkbox" /></td>
              <td>{{ r.id }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.credit }}</td>
              <td>{{ r.legal }}</td>
              <td>{{ r.phone }}</td>
              <td>{{ r.industry }}</td>
              <td><span class="tag" :class="gradeClass(r.grade)">{{ r.grade }}</span></td>
              <td><span class="auth" :class="authClass(r.auth)">{{ r.auth }}</span></td>
              <td class="ops">
                <button type="button" class="link">查看</button>
                <button type="button" class="link">编辑</button>
                <button type="button" class="link danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pager">
        显示 1 到 {{ paged.length }} 条，共 {{ filtered.length }} 条记录
      </div>
    </section>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.filter {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
}

.filter label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #606266;
  font-size: 13px;
}

.filter input,
.filter select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.count {
  margin-left: auto;
  color: #909399;
  font-size: 13px;
}

.table-wrap {
  overflow: auto;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.tag.vip {
  color: #409eff;
  background: #ecf5ff;
}

.tag.premium {
  color: #6b4cff;
  background: #f3f0ff;
}

.tag.std {
  color: #67c23a;
  background: #f0f9eb;
}

.tag.basic {
  color: #909399;
  background: #f4f4f5;
}

.auth.ok {
  color: #67c23a;
}

.auth.warn {
  color: #e6a23c;
}

.auth.danger {
  color: #f56c6c;
}

.auth.expire {
  color: #b88230;
}

.ops {
  display: flex;
  gap: 8px;
}

.link {
  padding: 0;
  color: #409eff;
  cursor: pointer;
  background: none;
  border: none;
}

.link.danger {
  color: #f56c6c;
}

.pager {
  padding-top: 12px;
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 900px) {
  .filter {
    grid-template-columns: 1fr;
  }
}
</style>
