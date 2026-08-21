<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

interface ModelItem {
  letter: string;
  name: string;
  vendor: string;
  type: string;
  desc: string;
  rating: number;
  calls: string;
  callsNum: number;
}

const keyword = ref('');
const typeFilter = ref('all');
const sortBy = ref('calls');
const currentPage = ref(1);
const pageSize = 6;
const compareList = ref<string[]>([]);
const toast = ref('');

const allModels: ModelItem[] = [
  {
    letter: 'Q',
    name: 'Qwen3.7-Plus',
    vendor: '通义千问',
    type: '文本推理',
    desc: '阿里通义千问最新大语言模型，支持长文本理解、代码生成与多轮对话，低延迟高准确率。',
    rating: 4.8,
    calls: '128.5K',
    callsNum: 128_500,
  },
  {
    letter: 'D',
    name: 'DeepSeek-V4',
    vendor: '深度求索',
    type: '文本推理',
    desc: 'DeepSeek 最新推理模型，擅长数学推理、逻辑分析与代码生成，支持超长上下文窗口。',
    rating: 4.7,
    calls: '95.2K',
    callsNum: 95_200,
  },
  {
    letter: 'V',
    name: 'Vision-Pro',
    vendor: '视觉生成',
    type: '视觉生成',
    desc: '多模态视觉模型，支持图像识别、目标检测、OCR 文字识别与图像生成等视觉任务。',
    rating: 4.6,
    calls: '62.8K',
    callsNum: 62_800,
  },
  {
    letter: 'S',
    name: 'Speech-RT',
    vendor: '实时语音',
    type: '实时语音',
    desc: '实时语音识别与合成模型，支持多语种识别、语音情感分析与实时翻译，毫秒级响应。',
    rating: 4.5,
    calls: '38.1K',
    callsNum: 38_100,
  },
  {
    letter: 'M',
    name: 'MultiModal-GPT',
    vendor: '多模态',
    type: '多模态',
    desc: '支持文本、图像、音频多模态输入的通用大模型，跨模态理解与生成能力强大。',
    rating: 4.4,
    calls: '25.6K',
    callsNum: 25_600,
  },
  {
    letter: 'C',
    name: 'Code-Assistant',
    vendor: '代码生成',
    type: '文本推理',
    desc: '专业代码生成模型，支持 30+ 编程语言，代码补全、Bug 修复、单元测试生成一体化。',
    rating: 4.7,
    calls: '45.3K',
    callsNum: 45_300,
  },
  {
    letter: 'G',
    name: 'GLM-4-Plus',
    vendor: '智谱 AI',
    type: '文本推理',
    desc: '智谱清言增强版，面向企业知识问答与复杂 Agent 任务，工具调用能力出色。',
    rating: 4.6,
    calls: '71.4K',
    callsNum: 71_400,
  },
  {
    letter: 'K',
    name: 'Kimi-Long',
    vendor: '月之暗面',
    type: '文本推理',
    desc: '超长上下文对话模型，适合文档研读、会议纪要与跨文件问答场景。',
    rating: 4.5,
    calls: '58.9K',
    callsNum: 58_900,
  },
  {
    letter: 'I',
    name: 'ImageGen-2',
    vendor: '视觉生成',
    type: '视觉生成',
    desc: '高清文生图模型，支持风格迁移、局部重绘与批量出图。',
    rating: 4.3,
    calls: '33.2K',
    callsNum: 33_200,
  },
  {
    letter: 'A',
    name: 'AudioSense',
    vendor: '实时语音',
    type: '实时语音',
    desc: '工业级音频理解模型，支持声纹识别、噪声抑制与关键词检测。',
    rating: 4.2,
    calls: '19.7K',
    callsNum: 19_700,
  },
  {
    letter: 'O',
    name: 'Omni-Fusion',
    vendor: '多模态',
    type: '多模态',
    desc: '视频+文本融合理解模型，适合安防巡检、教学内容解析等场景。',
    rating: 4.4,
    calls: '22.1K',
    callsNum: 22_100,
  },
  {
    letter: 'R',
    name: 'Reasoner-Max',
    vendor: '深度求索',
    type: '文本推理',
    desc: '强化推理链路模型，面向复杂规划、策略推演与科研辅助。',
    rating: 4.8,
    calls: '41.6K',
    callsNum: 41_600,
  },
  {
    letter: 'T',
    name: 'Translate-Pro',
    vendor: '通义千问',
    type: '文本推理',
    desc: '专业翻译模型，覆盖 50+ 语种，支持术语库与领域定制。',
    rating: 4.5,
    calls: '54.0K',
    callsNum: 54_000,
  },
  {
    letter: 'P',
    name: 'Portrait-AI',
    vendor: '视觉生成',
    type: '视觉生成',
    desc: '人像精修与虚拟试衣模型，适合电商与数字人内容生产。',
    rating: 4.1,
    calls: '16.8K',
    callsNum: 16_800,
  },
  {
    letter: 'N',
    name: 'NerveTTS',
    vendor: '实时语音',
    type: '实时语音',
    desc: '高自然度语音合成，支持多音色克隆与情感可控朗读。',
    rating: 4.6,
    calls: '29.4K',
    callsNum: 29_400,
  },
  {
    letter: 'F',
    name: 'DocParse-X',
    vendor: '多模态',
    type: '多模态',
    desc: '复杂文档解析模型，支持表格、公式、印章与版面还原。',
    rating: 4.3,
    calls: '27.9K',
    callsNum: 27_900,
  },
  {
    letter: 'B',
    name: 'BizAnalyst',
    vendor: '智谱 AI',
    type: '文本推理',
    desc: '面向经营分析的行业模型，自动生成指标解读与经营建议。',
    rating: 4.4,
    calls: '18.5K',
    callsNum: 18_500,
  },
  {
    letter: 'E',
    name: 'EdgeVision',
    vendor: '视觉生成',
    type: '视觉生成',
    desc: '边缘侧轻量视觉模型，适合终端部署与低功耗推理。',
    rating: 4.0,
    calls: '12.3K',
    callsNum: 12_300,
  },
  {
    letter: 'L',
    name: 'LiveCaption',
    vendor: '实时语音',
    type: '实时语音',
    desc: '直播字幕与同声传译模型，毫秒级延迟，支持热词增强。',
    rating: 4.5,
    calls: '36.7K',
    callsNum: 36_700,
  },
  {
    letter: 'U',
    name: 'UniAgent',
    vendor: '多模态',
    type: '多模态',
    desc: '通用智能体底座，支持工具编排、任务拆解与多步执行。',
    rating: 4.6,
    calls: '48.2K',
    callsNum: 48_200,
  },
  {
    letter: 'H',
    name: 'HealthQA',
    vendor: '通义千问',
    type: '文本推理',
    desc: '医疗健康问答模型，强调安全边界与循证回答风格。',
    rating: 4.2,
    calls: '14.9K',
    callsNum: 14_900,
  },
  {
    letter: 'W',
    name: 'WeatherSense',
    vendor: '多模态',
    type: '多模态',
    desc: '气象图文理解模型，支持卫星云图解读与预警摘要生成。',
    rating: 4.1,
    calls: '9.6K',
    callsNum: 9600,
  },
  {
    letter: 'Y',
    name: 'YieldOpt',
    vendor: '代码生成',
    type: '文本推理',
    desc: '面向算力调度的优化模型，辅助策略参数搜索与仿真评估。',
    rating: 4.3,
    calls: '21.0K',
    callsNum: 21_000,
  },
  {
    letter: 'Z',
    name: 'ZeroShot-VL',
    vendor: '视觉生成',
    type: '视觉生成',
    desc: '零样本视觉分类模型，开箱即用，支持自定义标签库。',
    rating: 4.4,
    calls: '17.2K',
    callsNum: 17_200,
  },
];

const filteredModels = computed(() => {
  let list = [...allModels];
  const key = keyword.value.trim().toLowerCase();

  if (key) {
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(key) ||
        m.vendor.toLowerCase().includes(key) ||
        m.type.includes(key) ||
        m.desc.includes(key),
    );
  }
  if (typeFilter.value !== 'all') {
    list = list.filter((m) => m.type === typeFilter.value);
  }
  if (sortBy.value === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  } else {
    list.sort((a, b) => b.callsNum - a.callsNum);
  }
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredModels.value.length / pageSize)),
);

const pagedModels = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredModels.value.slice(start, start + pageSize);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  const pages: number[] = [];
  const maxShow = Math.min(total, 4);
  let start = Math.max(1, Math.min(cur - 1, total - maxShow + 1));
  for (let i = 0; i < maxShow; i++) pages.push(start + i);
  return pages;
});

watch([keyword, typeFilter, sortBy], () => {
  currentPage.value = 1;
});

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function toggleCompare(name: string) {
  const i = compareList.value.indexOf(name);
  if (i >= 0) {
    compareList.value.splice(i, 1);
    return;
  }
  if (compareList.value.length >= 3) {
    showToast('最多同时对比 3 个模型');
    return;
  }
  compareList.value.push(name);
}

function openCompare() {
  if (compareList.value.length < 2) {
    showToast('请至少选择 2 个模型再对比');
    return;
  }
  showToast(`开始对比：${compareList.value.join('、')}`);
}
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>模型服务</h2>
      <p>
        模型服务资讯模块通过清晰的模型信息展示、多维度的对比功能以及真实的用户评价反馈，帮助用户全面了解模型特性与性能表现，有效支持模型选择与决策。
      </p>
    </div>

    <div class="portal-filter-bar">
      <div class="portal-search-box">
        <span class="search-icon">🔍</span>
        <input v-model="keyword" type="text" placeholder="搜索模型名称、类型..." />
      </div>
      <select v-model="typeFilter">
        <option value="all">全部类型</option>
        <option value="文本推理">文本推理</option>
        <option value="视觉生成">视觉生成</option>
        <option value="实时语音">实时语音</option>
        <option value="多模态">多模态</option>
      </select>
      <select v-model="sortBy">
        <option value="calls">排序：调用量</option>
        <option value="rating">排序：评分</option>
        <option value="name">排序：最新</option>
      </select>
      <button class="portal-btn portal-btn-outline portal-btn-sm" type="button" @click="openCompare">
        📊 对比模型
        <template v-if="compareList.length"> ({{ compareList.length }})</template>
      </button>
      <button
        class="portal-btn portal-btn-primary portal-btn-sm"
        type="button"
        @click="showToast('打开新增模型表单（示例）')"
      >
        + 新增模型
      </button>
    </div>

    <div v-if="filteredModels.length === 0" class="portal-empty">
      未找到匹配的模型，请调整筛选条件
    </div>

    <div v-else class="portal-model-grid">
      <div v-for="item in pagedModels" :key="item.name" class="portal-model-card">
        <div class="portal-model-header">
          <div class="portal-model-icon">{{ item.letter }}</div>
          <div>
            <div class="portal-model-name">{{ item.name }}</div>
            <div class="portal-model-ver">{{ item.vendor }} · {{ item.type }}</div>
          </div>
        </div>
        <p class="portal-model-desc">{{ item.desc }}</p>
        <div class="portal-model-meta">
          <div class="portal-model-rate">⭐ {{ item.rating.toFixed(1) }}</div>
          <div class="portal-model-calls">调用量 {{ item.calls }}</div>
        </div>
        <div class="portal-model-actions">
          <button
            class="portal-btn portal-btn-primary portal-btn-sm"
            type="button"
            @click="showToast(`查看详情：${item.name}`)"
          >
            查看详情
          </button>
          <button
            class="portal-btn portal-btn-outline portal-btn-sm"
            type="button"
            @click="toggleCompare(item.name)"
          >
            {{ compareList.includes(item.name) ? '取消对比' : '加入对比' }}
          </button>
          <button
            class="portal-btn-text portal-btn-sm"
            type="button"
            @click="showToast(`评价模型：${item.name}`)"
          >
            评价
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredModels.length > 0" class="portal-pagination">
      <span class="portal-page-info">共 {{ filteredModels.length }} 条记录</span>
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="currentPage = Math.max(1, currentPage - 1)"
      >
        上一页
      </button>
      <button
        v-for="p in pageNumbers"
        :key="p"
        type="button"
        :class="{ active: p === currentPage }"
        @click="currentPage = p"
      >
        {{ p }}
      </button>
      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
      >
        下一页
      </button>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>

.portal-empty {
  padding: 48px 16px;
  font-size: 14px;
  color: var(--portal-gray-500, #9e9e9e);
  text-align: center;
  background: #fff;
  border: 1px dashed var(--portal-gray-300, #e0e0e0);
  border-radius: 12px;
}

.portal-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 2000;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
}

.portal-pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
