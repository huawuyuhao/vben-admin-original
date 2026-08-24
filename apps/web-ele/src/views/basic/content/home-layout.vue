<script lang="ts" setup>
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import {
  layoutLibrary,
  layoutModules,
} from '#/views/_shared/data/basic-content';

defineOptions({ name: 'ContentHomeLayout' });

const modules = ref(layoutModules.map((m) => ({ ...m })));

function toggle(id: number) {
  const item = modules.value.find((m) => m.id === id);
  if (item) item.enabled = !item.enabled;
}
</script>

<template>
  <div class="page">
    <div class="crumb">首页 / 内容管理 / 首页排版管理 / 模块布局管理</div>
    <header class="head">
      <div>
        <h2>首页自定义模块布局管理</h2>
      </div>
      <div class="head-actions">
        <button class="btn" type="button">预览</button>
        <button class="btn" type="button">恢复默认</button>
        <button class="btn primary" type="button" @click="ElMessage.success('布局已保存')">
          保存布局
        </button>
      </div>
    </header>

    <div class="tips card">
      <strong>布局管理说明</strong>
      <ol>
        <li>拖拽模块可调整上下展示顺序</li>
        <li>点击开关可启用/禁用模块（禁用后不展示）</li>
        <li>点击「编辑」可配置模块内容与样式</li>
        <li>从右侧模块库拖入可新增模块到布局</li>
      </ol>
    </div>

    <div class="layout-grid">
      <section class="card">
        <div class="card-h">当前首页布局（共 {{ modules.length }} 个模块）</div>
        <article v-for="m in modules" :key="m.id" class="mod-item">
          <span class="drag">⠿</span>
          <div class="mod-info">
            <strong>{{ m.name }}</strong>
            <p>{{ m.desc }}</p>
          </div>
          <span class="tag" :class="m.enabled ? 'ok' : 'mute'">
            {{ m.enabled ? '已启用' : '已禁用' }}
          </span>
          <label class="switch">
            <input type="checkbox" :checked="m.enabled" @change="toggle(m.id)" />
          </label>
          <button type="button" class="link">编辑</button>
          <button
            v-if="!m.enabled || m.name.includes('产品') || m.name.includes('新闻')"
            type="button"
            class="link danger"
          >
            移除
          </button>
        </article>
      </section>

      <aside>
        <section class="card">
          <div class="card-h">可选模块库</div>
          <div v-for="l in layoutLibrary" :key="l.name" class="lib-item">
            <strong>{{ l.name }}</strong>
            <span>{{ l.desc }}</span>
          </div>
        </section>
        <section class="card">
          <div class="card-h">全局布局设置</div>
          <label class="field">页面宽度<select><option>1440px</option></select></label>
          <label class="field">模块间距<select><option>40px</option></select></label>
          <label class="field">内容边距<select><option>24px</option></select></label>
          <label class="field switch-row">
            移动端适配
            <input type="checkbox" checked />
          </label>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped src="./shared.css"></style>
<style scoped>
.tips ol {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #606266;
  font-size: 13px;
  line-height: 1.8;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr;
  gap: 12px;
}

.card-h {
  margin-bottom: 12px;
  font-weight: 600;
}

.mod-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.drag {
  color: #c0c4cc;
  cursor: grab;
}

.mod-info {
  flex: 1;
}

.mod-info strong {
  display: block;
  margin-bottom: 4px;
}

.mod-info p {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.lib-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  margin-bottom: 8px;
  background: #f5f7fa;
  border-radius: 6px;
}

.lib-item span {
  color: #909399;
  font-size: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 13px;
}

.field select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.switch-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 1000px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
