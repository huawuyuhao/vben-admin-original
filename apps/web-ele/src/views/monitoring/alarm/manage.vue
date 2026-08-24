<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  alarmCategories,
  alarmLevels,
  alarmNotifyRealtime,
  alarmPending,
  alarmRules,
} from '#/views/_shared/data/monitoring-alarm';

defineOptions({ name: 'AlarmManage' });

const mainTab = ref('category');
const subTab = ref('list');

const mainTabs = [
  { key: 'category', label: '告警分类管理' },
  { key: 'level', label: '告警等级管理' },
  { key: 'rules', label: '通用告警规则' },
  { key: 'process', label: '告警处理' },
  { key: 'notify', label: '告警通知' },
];

function levelClass(l: string) {
  if (l === '紧急' || l === '致命') return 'danger';
  if (l === '重要' || l === '警告') return 'warn';
  if (l === '次要') return 'info';
  return 'mute';
}

function statusClass(s: string) {
  if (s === '启用' || s === '已处理') return 'ok';
  if (s === '待处理') return 'warn';
  if (s === '处理中') return 'run';
  if (s === '停用' || s === '已忽略') return 'mute';
  return 'ok';
}

function bizClass(b: string) {
  if (b.includes('算力')) return 'blue';
  if (b.includes('策略')) return 'orange';
  if (b.includes('系统')) return 'gray';
  return 'blue';
}
</script>

<template>
  <div class="page">
    <div class="main-tabs">
      <button
        v-for="t in mainTabs"
        :key="t.key"
        type="button"
        class="main-tab"
        :class="{ active: mainTab === t.key }"
        @click="mainTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 告警分类管理 -->
    <template v-if="mainTab === 'category'">
      <div class="sub-tabs">
        <button
          type="button"
          class="sub-tab"
          :class="{ active: subTab === 'list' }"
          @click="subTab = 'list'"
        >
          分类列表
        </button>
        <button
          type="button"
          class="sub-tab"
          @click="ElMessage.info('分类关联配置（示例）')"
        >
          分类关联配置
        </button>
      </div>
      <section class="card">
        <div class="card-title">
          告警分类管理
          <span class="right">
            <button
              class="btn primary"
              type="button"
              @click="ElMessage.success('新增分类（示例）')"
            >
              + 新增告警分类
            </button>
          </span>
        </div>
        <div class="filter">
          <label>分类名称<input placeholder="请输入分类名称" /></label>
          <label>业务类型<select><option>全部</option></select></label>
          <label>状态<select><option>全部</option></select></label>
          <div class="filter-actions">
            <button class="btn primary" type="button">查询</button>
            <button class="btn" type="button">重置</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>分类名称</th>
              <th>编码</th>
              <th>业务类型</th>
              <th>关联通知规则</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in alarmCategories" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.code }}</td>
              <td><span class="tag" :class="bizClass(r.biz)">{{ r.biz }}</span></td>
              <td>{{ r.rules }}</td>
              <td>
                <span class="status-dot" :class="statusClass(r.status)">{{
                  r.status
                }}</span>
              </td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link danger">删除</button>
                <button type="button" class="link">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pager"><span>共 28 条记录</span></div>
      </section>
    </template>

    <!-- 告警等级管理 -->
    <template v-else-if="mainTab === 'level'">
      <div class="mini-kpis">
        <div class="mk"><strong>6</strong><span>告警等级总数</span></div>
        <div class="mk danger"><strong>2</strong><span>紧急级</span></div>
        <div class="mk warn"><strong>2</strong><span>重要级</span></div>
        <div class="mk info"><strong>2</strong><span>次要/提示</span></div>
      </div>
      <section class="card">
        <div class="card-title">
          告警等级配置
          <span class="right">
            <button class="btn primary" type="button">+ 新增告警等级</button>
          </span>
        </div>
        <div class="filter">
          <label>等级名称<input placeholder="请输入等级名称" /></label>
          <label>业务类型<select><option>全部</option></select></label>
          <label>严重度<select><option>全部</option></select></label>
          <div class="filter-actions">
            <button class="btn primary" type="button">查询</button>
            <button class="btn" type="button">重置</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>等级名称</th>
              <th>编码</th>
              <th>业务类型</th>
              <th>严重度</th>
              <th>颜色标识</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in alarmLevels" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.code }}</td>
              <td><span class="tag" :class="bizClass(r.biz)">{{ r.biz }}</span></td>
              <td><span class="lvl" :class="levelClass(r.severity)">{{ r.severity }}</span></td>
              <td>{{ r.color }}</td>
              <td>
                <span class="status-dot" :class="statusClass(r.status)">{{
                  r.status
                }}</span>
              </td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link danger">删除</button>
                <button type="button" class="link">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pager"><span>共 6 条记录</span></div>
      </section>
    </template>

    <!-- 通用告警规则 -->
    <template v-else-if="mainTab === 'rules'">
      <div class="sub-tabs">
        <button type="button" class="sub-tab active">规则配置</button>
        <button type="button" class="sub-tab">等级升级规则</button>
      </div>
      <section class="card">
        <div class="card-title">
          通用告警规则配置
          <span class="right">
            <button class="btn primary" type="button">+ 新增规则</button>
          </span>
        </div>
        <div class="filter">
          <label>规则名称<input placeholder="请输入规则名称" /></label>
          <label>告警类型<select><option>全部</option></select></label>
          <label>告警等级<select><option>全部</option></select></label>
          <label>状态<select><option>全部</option></select></label>
          <div class="filter-actions">
            <button class="btn primary" type="button">查询</button>
            <button class="btn" type="button">重置</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>规则名称</th>
              <th>告警类型</th>
              <th>触发条件</th>
              <th>告警等级</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in alarmRules" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.name }}</td>
              <td><span class="tag blue">{{ r.type }}</span></td>
              <td>{{ r.condition }}</td>
              <td><span class="lvl" :class="levelClass(r.level)">{{ r.level }}</span></td>
              <td>
                <span class="status-dot" :class="statusClass(r.status)">{{
                  r.status
                }}</span>
              </td>
              <td class="ops">
                <button type="button" class="link">编辑</button>
                <button type="button" class="link danger">删除</button>
                <button type="button" class="link">启停</button>
                <button type="button" class="link">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pager"><span>共 42 条记录</span></div>
      </section>
    </template>

    <!-- 告警处理 -->
    <template v-else-if="mainTab === 'process'">
      <div class="sub-tabs">
        <button type="button" class="sub-tab active">待处理告警</button>
        <button type="button" class="sub-tab">处理记录与责任指派</button>
        <button type="button" class="sub-tab">关联预案与历史案例</button>
      </div>
      <section class="card">
        <div class="card-title">
          待处理告警
          <span class="right">
            <button class="btn primary" type="button">批量处理</button>
            <button class="btn" type="button">查询</button>
          </span>
        </div>
        <div class="filter">
          <label>告警等级<select><option>全部</option></select></label>
          <label>状态<select><option>全部</option></select></label>
          <label>时间范围<input type="date" /><span>—</span><input type="date" /></label>
          <div class="filter-actions">
            <button class="btn primary" type="button">查询</button>
            <button class="btn" type="button">重置</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>告警标题</th>
              <th>分类</th>
              <th>等级</th>
              <th>触发时间</th>
              <th>当前状态</th>
              <th>责任人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in alarmPending" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.title }}</td>
              <td><span class="tag" :class="bizClass(r.category)">{{ r.category }}</span></td>
              <td><span class="lvl" :class="levelClass(r.level)">{{ r.level }}</span></td>
              <td>{{ r.time }}</td>
              <td>
                <span class="status-dot" :class="statusClass(r.status)">{{
                  r.status
                }}</span>
              </td>
              <td>{{ r.owner }}</td>
              <td class="ops">
                <button type="button" class="link">处理</button>
                <button type="button" class="link">详情</button>
                <button type="button" class="link">指派</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pager"><span>共 36 条记录</span></div>
      </section>
    </template>

    <!-- 告警通知 -->
    <template v-else>
      <div class="sub-tabs">
        <button type="button" class="sub-tab active">实时告警</button>
        <button type="button" class="sub-tab">告警总览</button>
        <button type="button" class="sub-tab">推送策略</button>
        <button type="button" class="sub-tab">消息处理</button>
      </div>
      <div class="mini-kpis">
        <div class="mk info"><strong>128</strong><span>今日告警</span></div>
        <div class="mk danger"><strong>12</strong><span>紧急</span></div>
        <div class="mk warn"><strong>9</strong><span>未处理</span></div>
        <div class="mk ok"><strong>119</strong><span>已处理</span></div>
      </div>
      <section class="card">
        <div class="card-title">
          实时告警
          <span class="right">
            <button class="btn" type="button">刷新</button>
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>等级</th>
              <th>类型</th>
              <th>触发时间</th>
              <th>来源</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in alarmNotifyRealtime" :key="r.id">
              <td>{{ r.id }}</td>
              <td><span class="lvl" :class="levelClass(r.level)">{{ r.level }}</span></td>
              <td><span class="tag" :class="bizClass(r.type)">{{ r.type }}</span></td>
              <td>{{ r.time }}</td>
              <td>{{ r.source }}</td>
              <td>
                <span class="status-dot" :class="statusClass(r.status)">{{
                  r.status
                }}</span>
              </td>
              <td><button type="button" class="link">详情</button></td>
            </tr>
          </tbody>
        </table>
        <div class="pager"><span>共 128 条记录</span></div>
      </section>
    </template>
  </div>
</template>

<style scoped>
@import '../../workbench/task-schedule/shared.css';

.main-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.main-tab {
  padding: 12px 16px;
  margin-bottom: -1px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
}

.main-tab.active {
  color: #409eff;
  font-weight: 600;
  border-bottom-color: #409eff;
}

.sub-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.sub-tab {
  padding: 8px 0;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
}

.sub-tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  margin-bottom: 14px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
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
  min-width: 140px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.tag.blue {
  color: #409eff;
  background: #ecf5ff;
}

.tag.orange {
  color: #e6a23c;
  background: #fdf6ec;
}

.tag.gray {
  color: #909399;
  background: #f4f4f5;
}

.lvl.danger {
  color: #f56c6c;
}

.lvl.warn {
  color: #e6a23c;
}

.lvl.info {
  color: #409eff;
}

.lvl.mute {
  color: #909399;
}

.status-dot {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
}

.status-dot::before {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  content: '';
}

.status-dot.ok::before {
  background: #67c23a;
}

.status-dot.warn::before {
  background: #e6a23c;
}

.status-dot.run::before {
  background: #409eff;
}

.status-dot.mute::before {
  background: #c0c4cc;
}

.ops {
  display: flex;
  flex-wrap: wrap;
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

.mini-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.mk {
  padding: 14px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.mk strong {
  display: block;
  font-size: 22px;
}

.mk span {
  color: #909399;
  font-size: 12px;
}

.mk.danger strong {
  color: #f56c6c;
}

.mk.warn strong {
  color: #e6a23c;
}

.mk.info strong {
  color: #409eff;
}

.mk.ok strong {
  color: #67c23a;
}

@media (max-width: 900px) {
  .main-tabs {
    flex-wrap: wrap;
  }

  .mini-kpis {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
