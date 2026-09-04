<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  apiInterfaces,
  apiLogs,
  authClients,
  maskRules,
} from '#/views/_shared/data/basic-data-center';

defineOptions({ name: 'DcApi' });

const tab = ref<'api' | 'auth' | 'log' | 'security'>('api');
const apiKeyword = ref('');
const logCode = ref('全部');

const filteredApis = computed(() => {
  if (!apiKeyword.value.trim()) return apiInterfaces;
  return apiInterfaces.filter((r) => r.name.includes(apiKeyword.value.trim()));
});

const filteredLogs = computed(() => {
  if (logCode.value === '全部') return apiLogs;
  return apiLogs.filter((r) => String(r.code) === logCode.value);
});

function statusClass(s: string) {
  if (s === '已发布' || s === '正常' || s === '启用') return 'ok';
  if (s === '测试中') return 'info';
  if (s === '已过期' || s === '已禁用' || s === '停用') return 'warn';
  return 'mute';
}

function codeClass(c: number) {
  if (c >= 200 && c < 300) return 'ok';
  if (c >= 400) return 'danger';
  return 'warn';
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 数据中心管理 / API服务</div>
    <header class="head">
      <div>
        <h2>API服务</h2>
        <p>统一管理接口生命周期、调用日志、数据安全策略和调用授权</p>
      </div>
      <div class="head-actions">
        <span class="service-badge">● 服务正常</span>
      </div>
    </header>

    <div class="page-tabs card">
      <button type="button" :class="{ active: tab === 'api' }" @click="tab = 'api'">
        接口管理与测试
      </button>
      <button type="button" :class="{ active: tab === 'log' }" @click="tab = 'log'">
        调用日志
      </button>
      <button type="button" :class="{ active: tab === 'security' }" @click="tab = 'security'">
        数据安全管理
      </button>
      <button type="button" :class="{ active: tab === 'auth' }" @click="tab = 'auth'">
        授权管理
      </button>
    </div>

    <!-- 接口管理与测试 -->
    <template v-if="tab === 'api'">
      <section class="card">
        <div class="filter">
          <label>接口名称<input v-model="apiKeyword" placeholder="请输入接口名称" /></label>
          <label>请求方式<select><option>全部</option><option>GET</option><option>POST</option><option>PUT</option></select></label>
          <label>状态<select><option>全部</option><option>已发布</option><option>测试中</option></select></label>
          <div class="filter-actions">
            <button class="btn primary" type="button">查询</button>
          </div>
        </div>
      </section>
      <section class="card">
        <div class="toolbar">
          <button class="btn primary" type="button" @click="ElMessage.success('新增接口（示例）')">
            + 新增接口
          </button>
          <span class="count">共 {{ filteredApis.length }} 条</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>接口名称</th>
                <th>路径</th>
                <th>方式</th>
                <th>版本</th>
                <th>状态</th>
                <th>累计调用</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredApis" :key="r.id">
                <td>{{ r.name }}</td>
                <td><code class="path">{{ r.path }}</code></td>
                <td><span class="tag info">{{ r.method }}</span></td>
                <td>{{ r.version }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td>{{ r.calls }}</td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('测试接口（示例）')">
                    测试
                  </button>
                  <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">
                    编辑
                  </button>
                  <button type="button" class="link warn" @click="ElMessage.success('下线（示例）')">
                    下线
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 调用日志 -->
    <template v-if="tab === 'log'">
      <div class="kpi-row">
        <div class="kpi"><strong>281,800</strong><span>今日调用总量</span></div>
        <div class="kpi"><strong>99.2%</strong><span>成功率</span></div>
        <div class="kpi"><strong>28ms</strong><span>平均耗时</span></div>
        <div class="kpi"><strong>12</strong><span>异常调用</span></div>
      </div>
      <section class="card">
        <div class="filter">
          <label>调用路径<input placeholder="请输入路径" /></label>
          <label>调用方<input placeholder="请输入用户名" /></label>
          <label>
            状态码
            <select v-model="logCode">
              <option>全部</option>
              <option>200</option>
              <option>201</option>
              <option>403</option>
              <option>500</option>
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
                <th>调用方</th>
                <th>路径</th>
                <th>方式</th>
                <th>IP</th>
                <th>状态码</th>
                <th>耗时</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredLogs" :key="r.id">
                <td>{{ r.time }}</td>
                <td>{{ r.user }}</td>
                <td><code class="path">{{ r.path }}</code></td>
                <td>{{ r.method }}</td>
                <td>{{ r.ip }}</td>
                <td><span class="tag" :class="codeClass(r.code)">{{ r.code }}</span></td>
                <td>{{ r.cost }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">显示 1 到 {{ filteredLogs.length }} 条，共 {{ filteredLogs.length }} 条记录</div>
      </section>
    </template>

    <!-- 数据安全管理 -->
    <template v-if="tab === 'security'">
      <section class="card">
        <div class="toolbar">
          <button class="btn primary" type="button" @click="ElMessage.success('新增脱敏规则（示例）')">
            + 新增脱敏规则
          </button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>规则名称</th>
                <th>字段</th>
                <th>脱敏类型</th>
                <th>描述</th>
                <th>关联接口</th>
                <th>更新时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in maskRules" :key="r.id">
                <td>{{ r.name }}</td>
                <td><code class="path">{{ r.field }}</code></td>
                <td>{{ r.type }}</td>
                <td>{{ r.desc }}</td>
                <td>{{ r.apis }}</td>
                <td>{{ r.updated }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">
                    编辑
                  </button>
                  <button type="button" class="link danger" @click="ElMessage.success('删除（示例）')">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 授权管理 -->
    <template v-if="tab === 'auth'">
      <section class="card">
        <div class="toolbar">
          <button class="btn primary" type="button" @click="ElMessage.success('新增授权（示例）')">
            + 新增授权
          </button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>调用方</th>
                <th>账号</th>
                <th>联系人</th>
                <th>联系电话</th>
                <th>创建时间</th>
                <th>更新时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in authClients" :key="r.id">
                <td>{{ r.caller }}</td>
                <td>{{ r.account }}</td>
                <td>{{ r.contact }}</td>
                <td>{{ r.phone }}</td>
                <td>{{ r.created }}</td>
                <td>{{ r.updated }}</td>
                <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
                <td class="ops">
                  <button type="button" class="link" @click="ElMessage.success('编辑（示例）')">
                    编辑
                  </button>
                  <button type="button" class="link warn" @click="ElMessage.success('续期（示例）')">
                    续期
                  </button>
                  <button type="button" class="link danger" @click="ElMessage.success('禁用（示例）')">
                    禁用
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
.service-badge {
  padding: 6px 12px;
  font-size: 13px;
  color: #67c23a;
  background: #f0f9eb;
  border: 1px solid #c2e7b0;
  border-radius: 4px;
}

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

.path {
  padding: 2px 6px;
  font-size: 12px;
  color: #606266;
  background: #f4f4f5;
  border-radius: 3px;
}
</style>
