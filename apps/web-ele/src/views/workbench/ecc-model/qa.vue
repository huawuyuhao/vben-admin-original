<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { qaFaq } from '#/views/_shared/data/ecc-model';

defineOptions({ name: 'EccQa' });

const input = ref('');
const listRef = ref<HTMLElement | null>(null);
const messages = ref<Array<{ role: 'user' | 'bot'; text: string }>>([
  {
    role: 'bot',
    text: '你好，我是电碳算知识库助手。可以问我调度策略、碳排测算、算力预测等问题。',
  },
]);

function answerOf(q: string) {
  const hit = qaFaq.find((f) => q.includes(f.q.slice(0, 4)) || f.q.includes(q));
  if (hit) return hit.a;
  if (q.includes('碳')) {
    return '碳排预测需结合区域碳强度、任务用电曲线与绿电占比，可在「智算任务碳排预测」中试算。';
  }
  if (q.includes('算力') || q.includes('GPU')) {
    return '训练/推理算力需求可分别使用对应预测页，输入模型规模与并行策略后即可得到建议卡数。';
  }
  return '已检索知识库：建议补充任务类型、区域与时间窗口，以便给出更精确建议。（示例回复）';
}

async function send(text?: string) {
  const q = (text ?? input.value).trim();
  if (!q) return;
  messages.value.push({ role: 'user', text: q });
  input.value = '';
  await nextTick();
  messages.value.push({ role: 'bot', text: answerOf(q) });
  await nextTick();
  listRef.value?.scrollTo({ top: listRef.value.scrollHeight, behavior: 'smooth' });
}
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h2>电碳算知识库智能问答</h2>
        <p>基于电碳算领域知识库，提供策略、预测与计量相关智能问答（示例）。</p>
      </div>
    </header>

    <div class="qa-layout">
      <aside class="card faq">
        <div class="card-title">热门问题</div>
        <button
          v-for="f in qaFaq"
          :key="f.q"
          type="button"
          class="faq-item"
          @click="send(f.q)"
        >
          {{ f.q }}
        </button>
      </aside>

      <section class="card chat">
        <div ref="listRef" class="messages">
          <div
            v-for="(m, i) in messages"
            :key="i"
            class="bubble"
            :class="m.role"
          >
            {{ m.text }}
          </div>
        </div>
        <div class="composer">
          <input
            v-model="input"
            type="text"
            placeholder="请输入你的问题…"
            @keyup.enter="send()"
          />
          <button class="btn primary" type="button" @click="send()">发送</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import '../task-schedule/shared.css';

.qa-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
  min-height: 520px;
}

.faq-item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 8px;
  color: #606266;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.faq-item:hover {
  color: #409eff;
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.chat {
  display: flex;
  flex-direction: column;
  min-height: 520px;
}

.messages {
  flex: 1;
  max-height: 440px;
  overflow: auto;
  padding: 8px 4px 16px;
}

.bubble {
  max-width: 80%;
  margin-bottom: 10px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 8px;
}

.bubble.bot {
  color: #303133;
  background: #f5f7fa;
}

.bubble.user {
  margin-left: auto;
  color: #fff;
  background: #409eff;
}

.composer {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.composer input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

@media (max-width: 900px) {
  .qa-layout {
    grid-template-columns: 1fr;
  }
}
</style>
