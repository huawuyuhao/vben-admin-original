<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

defineOptions({ name: 'ContentAbout' });

const section = ref('公司介绍');
const sections = [
  { key: '公司介绍', desc: '企业简介、发展历程等' },
  { key: '版本历史', desc: '产品版本迭代记录' },
  { key: '团队介绍', desc: '核心团队成员介绍' },
  { key: '联系方式', desc: '联系我们、地址信息' },
];

const versions = [
  { ver: 'v2.1', time: '2026-03-10', user: '管理员', content: '更新企业简介与发展历程', status: '已发布' },
  { ver: 'v2.0', time: '2026-01-15', user: '管理员', content: '重构关于我们页面结构', status: '历史版本' },
  { ver: 'v1.0', time: '2025-12-01', user: '管理员', content: '首次发布', status: '历史版本' },
];
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 关于我们管理</div>
    <header class="head">
      <div>
        <h2>关于我们内容管理</h2>
      </div>
      <div class="head-actions">
        <button class="btn primary" type="button" @click="ElMessage.success('新增内容（示例）')">
          + 新增内容
        </button>
        <button class="btn" type="button">导出</button>
      </div>
    </header>

    <div class="section-cards">
      <button
        v-for="s in sections"
        :key="s.key"
        type="button"
        class="section-card"
        :class="{ active: section === s.key }"
        @click="section = s.key"
      >
        <strong>{{ s.key }}</strong>
        <span>{{ s.desc }}</span>
      </button>
    </div>

    <div class="about-grid">
      <section class="card">
        <div class="card-h">内容编辑</div>
        <label class="field">内容标题<input value="关于我们" /></label>
        <label class="field">内容类型<select><option>公司介绍</option></select></label>
        <div class="field">
          发布状态
          <div class="radios">
            <label><input type="radio" checked name="pub" /> 提交审核后发布</label>
            <label><input type="radio" name="pub" /> 存为草稿</label>
          </div>
        </div>
        <label class="field">
          内容详情
          <textarea rows="8">企业简介：电碳算协同运营平台致力于电力、碳排与算力一体化运营。

发展历程：
2018 成立
2022 上线区域调度
2026 发布协同运营端</textarea>
        </label>
        <div class="form-actions">
          <button class="btn" type="button">取消</button>
          <button class="btn" type="button">预览</button>
          <button class="btn primary" type="button" @click="ElMessage.success('已保存并提交审核')">
            保存并提交审核
          </button>
        </div>
      </section>

      <aside>
        <section class="card">
          <div class="card-h">发布信息</div>
          <p>当前状态：<span class="tag ok">已发布</span></p>
          <p>创建时间：2025-12-01</p>
          <p>最近更新：2026-03-10</p>
          <p>更新人：管理员</p>
          <p>浏览量：5,678 次</p>
        </section>
        <section class="card">
          <div class="card-h">SEO 设置</div>
          <label class="field">页面标题<input value="关于我们 - 电碳算协同运营平台" /></label>
          <label class="field">页面关键词<input value="算力服务,云计算" /></label>
          <label class="field">页面描述<textarea rows="3">电碳算协同运营平台简介</textarea></label>
        </section>
        <section class="card">
          <div class="card-h">封面设置</div>
          <div class="cover" />
          <button class="btn" type="button">更换封面</button>
          <p class="hint">推荐尺寸 1200*300px，支持 JPG/PNG</p>
        </section>
      </aside>
    </div>

    <section class="card">
      <div class="toolbar">
        <strong>版本历史</strong>
        <button type="button" class="link count">查看全部</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>版本号</th>
            <th>更新时间</th>
            <th>更新人</th>
            <th>更新内容</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in versions" :key="v.ver">
            <td>{{ v.ver }}</td>
            <td>{{ v.time }}</td>
            <td>{{ v.user }}</td>
            <td>{{ v.content }}</td>
            <td>
              <span class="tag" :class="v.status === '已发布' ? 'ok' : 'mute'">{{ v.status }}</span>
            </td>
            <td class="ops">
              <button type="button" class="link">查看</button>
              <button type="button" class="link">恢复</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.section-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.section-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.section-card.active {
  border-color: #409eff;
  box-shadow: 0 0 0 1px #409eff inset;
}

.section-card strong {
  font-size: 14px;
}

.section-card span {
  color: #909399;
  font-size: 12px;
}

.about-grid {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 12px;
  margin-bottom: 12px;
}

.card-h {
  margin-bottom: 12px;
  font-weight: 600;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  color: #606266;
  font-size: 13px;
}

.field input,
.field select,
.field textarea {
  padding: 8px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.radios {
  display: flex;
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.cover {
  height: 100px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #d9ecff, #a0cfff);
  border-radius: 6px;
}

.hint {
  margin: 8px 0 0;
  color: #909399;
  font-size: 12px;
}

aside p {
  margin: 0 0 8px;
  color: #606266;
  font-size: 13px;
}

@media (max-width: 1000px) {
  .section-cards,
  .about-grid {
    grid-template-columns: 1fr;
  }
}
</style>
