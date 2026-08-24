<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

interface ModelItem {
  id: string;
  letter: string;
  name: string;
  vendor: string;
  series: string;
  type: string;
  tags: string[];
  desc: string;
  rating: number;
  calls: string;
  callsNum: number;
  favorites: number;
  updatedAt: string;
  params: string;
  vram: string;
  speed: string;
  language: string;
  scenarios: string;
  context: string;
  hardware: string;
}

type CompareKey =
  | 'icon'
  | 'series'
  | 'params'
  | 'vram'
  | 'speed'
  | 'language'
  | 'scenarios'
  | 'context'
  | 'type'
  | 'hardware';

const keyword = ref('');
const vendorFilter = ref('全部');
const typeFilter = ref('全部');
const currentPage = ref(1);
const pageSize = ref(5);
const selectedIds = ref<string[]>([]);
const compareOpen = ref(false);
const detailModel = ref<ModelItem | null>(null);
const toast = ref('');

const vendors = [
  '全部',
  '千问',
  'DeepSeek',
  '智谱',
  '月之暗面',
  '视觉生成',
  '实时语音',
];
const types = [
  '全部',
  '问答模型',
  '推理模型',
  '图片理解模型',
  '视频理解模型',
  '语音模型',
];

const allModels: ModelItem[] = [
  {
    id: 'qwen37',
    letter: 'Q',
    name: 'Qwen3.7-Plus',
    vendor: '千问',
    series: 'Qwen（通义千问）3.7 系列',
    type: '问答模型',
    tags: ['问答', '长文本'],
    desc: '阿里通义千问最新大语言模型，支持长文本理解、代码生成与多轮对话，低延迟高准确率。',
    rating: 4.8,
    calls: '128.5K',
    callsNum: 128_500,
    favorites: 3260,
    updatedAt: '2026-08-12',
    params: '720亿',
    vram: '~35-40GB',
    speed: '中等',
    language: '中英双语，复杂推理与指令跟随能力强',
    scenarios: '客服问答、知识库检索、复杂任务编排',
    context: '128K',
    hardware: 'A100 / A800 / H800',
  },
  {
    id: 'ds-r1',
    letter: 'D',
    name: 'DeepSeek-R1-Distill-7B',
    vendor: 'DeepSeek',
    series: 'DeepSeek（深度求索）系列',
    type: '推理模型',
    tags: ['推理', '蒸馏'],
    desc: 'DeepSeek 蒸馏推理模型，擅长数学推理、逻辑分析与代码生成，适合实时应用场景。',
    rating: 4.7,
    calls: '95.2K',
    callsNum: 95_200,
    favorites: 2810,
    updatedAt: '2026-08-08',
    params: '70亿',
    vram: '~14-16GB',
    speed: '快',
    language: '中英双语，强化思维链推理',
    scenarios: '实时应用、代码助手、策略推演',
    context: '4K-8K',
    hardware: 'RTX 3090 / 4090',
  },
  {
    id: 'glm4',
    letter: 'G',
    name: 'GLM-4-Plus',
    vendor: '智谱',
    series: 'GLM（智谱清言）4 系列',
    type: '问答模型',
    tags: ['Agent', '工具调用'],
    desc: '智谱清言增强版，面向企业知识问答与复杂 Agent 任务，工具调用能力出色。',
    rating: 4.6,
    calls: '71.4K',
    callsNum: 71_400,
    favorites: 1980,
    updatedAt: '2026-07-30',
    params: '未知',
    vram: '~24-32GB',
    speed: '中等',
    language: '中英双语，企业知识问答友好',
    scenarios: '企业助手、Agent 编排、报表解读',
    context: '128K',
    hardware: 'A100 / 4090',
  },
  {
    id: 'kimi',
    letter: 'K',
    name: 'Kimi-Long',
    vendor: '月之暗面',
    series: 'Kimi 长上下文系列',
    type: '问答模型',
    tags: ['长上下文', '文档'],
    desc: '超长上下文对话模型，适合文档研读、会议纪要与跨文件问答场景。',
    rating: 4.5,
    calls: '58.9K',
    callsNum: 58_900,
    favorites: 2450,
    updatedAt: '2026-07-22',
    params: '未知',
    vram: '~28-36GB',
    speed: '中等',
    language: '中英双语，长文档理解突出',
    scenarios: '文档研读、会议纪要、跨文件问答',
    context: '200K+',
    hardware: 'A100 / H800',
  },
  {
    id: 'vision',
    letter: 'V',
    name: 'Vision-Pro',
    vendor: '视觉生成',
    series: 'Vision 多模态系列',
    type: '图片理解模型',
    tags: ['图像', 'OCR'],
    desc: '多模态视觉模型，支持图像识别、目标检测、OCR 文字识别与图像理解。',
    rating: 4.6,
    calls: '62.8K',
    callsNum: 62_800,
    favorites: 1670,
    updatedAt: '2026-08-01',
    params: '未知',
    vram: '~16-24GB',
    speed: '快',
    language: '图文理解，支持中英标注',
    scenarios: '质检、OCR、图文检索',
    context: '8K',
    hardware: 'RTX 4090 / A10',
  },
  {
    id: 'video',
    letter: 'O',
    name: 'Omni-Fusion',
    vendor: '视觉生成',
    series: 'Omni 视频理解系列',
    type: '视频理解模型',
    tags: ['视频', '多模态'],
    desc: '视频+文本融合理解模型，适合安防巡检、教学内容解析等场景。',
    rating: 4.4,
    calls: '22.1K',
    callsNum: 22_100,
    favorites: 980,
    updatedAt: '2026-07-15',
    params: '未知',
    vram: '~24-40GB',
    speed: '中等',
    language: '视频片段理解与摘要生成',
    scenarios: '安防巡检、教学解析、内容审核',
    context: '16K',
    hardware: 'A100 / A800',
  },
  {
    id: 'speech',
    letter: 'S',
    name: 'Speech-RT',
    vendor: '实时语音',
    series: 'Speech 实时语音系列',
    type: '语音模型',
    tags: ['ASR', 'TTS'],
    desc: '实时语音识别与合成模型，支持多语种识别、语音情感分析与实时翻译。',
    rating: 4.5,
    calls: '38.1K',
    callsNum: 38_100,
    favorites: 1320,
    updatedAt: '2026-07-28',
    params: '未知',
    vram: '~8-12GB',
    speed: '快',
    language: '多语种识别与合成',
    scenarios: '客服热线、同传字幕、语音助手',
    context: '流式',
    hardware: 'RTX 3080 / 4090',
  },
  {
    id: 'ds-v4',
    letter: 'D',
    name: 'DeepSeek-V4',
    vendor: 'DeepSeek',
    series: 'DeepSeek（深度求索）系列',
    type: '问答模型',
    tags: ['通用', '代码'],
    desc: 'DeepSeek 最新通用模型，兼顾文本对话与代码生成，性价比出色。',
    rating: 4.7,
    calls: '88.0K',
    callsNum: 88_000,
    favorites: 3010,
    updatedAt: '2026-08-10',
    params: '未知',
    vram: '~20-28GB',
    speed: '快',
    language: '中英双语，代码能力强',
    scenarios: '通用对话、编程辅助、知识问答',
    context: '64K',
    hardware: 'RTX 4090 / A100',
  },
  {
    id: 'qwen-vl',
    letter: 'Q',
    name: 'Qwen2.5-VL',
    vendor: '千问',
    series: 'Qwen（通义千问）2.5 系列',
    type: '图片理解模型',
    tags: ['视觉', '多模态'],
    desc: '通义千问视觉语言模型，擅长图表解读、界面理解与图文问答。',
    rating: 4.6,
    calls: '44.3K',
    callsNum: 44_300,
    favorites: 1560,
    updatedAt: '2026-08-05',
    params: '720亿级',
    vram: '~30-40GB',
    speed: '中等',
    language: '图文双语问答',
    scenarios: '图表解读、UI 理解、图文客服',
    context: '32K',
    hardware: 'A100 / H800',
  },
  {
    id: 'reasoner',
    letter: 'R',
    name: 'Reasoner-Max',
    vendor: 'DeepSeek',
    series: 'DeepSeek 强化推理系列',
    type: '推理模型',
    tags: ['推理', '规划'],
    desc: '强化推理链路模型，面向复杂规划、策略推演与科研辅助。',
    rating: 4.8,
    calls: '41.6K',
    callsNum: 41_600,
    favorites: 2100,
    updatedAt: '2026-07-18',
    params: '未知',
    vram: '~24-32GB',
    speed: '中等',
    language: '强化思维链与多步规划',
    scenarios: '科研辅助、策略推演、复杂规划',
    context: '32K',
    hardware: 'A100 / 4090',
  },
  {
    id: 'live',
    letter: 'L',
    name: 'LiveCaption',
    vendor: '实时语音',
    series: 'Speech 实时语音系列',
    type: '语音模型',
    tags: ['字幕', '同传'],
    desc: '直播字幕与同声传译模型，毫秒级延迟，支持热词增强。',
    rating: 4.5,
    calls: '36.7K',
    callsNum: 36_700,
    favorites: 1180,
    updatedAt: '2026-07-09',
    params: '未知',
    vram: '~6-10GB',
    speed: '快',
    language: '多语种同传与字幕',
    scenarios: '直播字幕、会议同传、热词增强',
    context: '流式',
    hardware: 'RTX 3080+',
  },
  {
    id: 'docparse',
    letter: 'F',
    name: 'DocParse-X',
    vendor: '智谱',
    series: '文档解析系列',
    type: '图片理解模型',
    tags: ['文档', '表格'],
    desc: '复杂文档解析模型，支持表格、公式、印章与版面还原。',
    rating: 4.3,
    calls: '27.9K',
    callsNum: 27_900,
    favorites: 890,
    updatedAt: '2026-06-28',
    params: '未知',
    vram: '~12-18GB',
    speed: '中等',
    language: '版面与表格结构化输出',
    scenarios: '票据识别、合同解析、报告抽取',
    context: '16K',
    hardware: 'RTX 4090 / A10',
  },
  {
    id: 'chatglm',
    letter: 'C',
    name: 'ChatGLM4-9B',
    vendor: '智谱',
    series: 'GLM（智谱清言）4 系列',
    type: '问答模型',
    tags: ['轻量', '对话'],
    desc: '轻量级对话模型，适合本地部署与高并发在线问答服务。',
    rating: 4.4,
    calls: '52.1K',
    callsNum: 52_100,
    favorites: 1740,
    updatedAt: '2026-08-03',
    params: '90亿',
    vram: '~18-22GB',
    speed: '快',
    language: '中英对话，轻量部署友好',
    scenarios: '在线问答、本地部署、高并发服务',
    context: '128K',
    hardware: 'RTX 4090 / A6000',
  },
  {
    id: 'qwen25',
    letter: 'Q',
    name: 'Qwen2.5-72B-Instruct',
    vendor: '千问',
    series: 'Qwen（通义千问）2.5 系列',
    type: '推理模型',
    tags: ['指令', '训练类'],
    desc: '通义千问 2.5 指令微调大模型，适合复杂任务与高质量内容生成。',
    rating: 4.7,
    calls: '76.8K',
    callsNum: 76_800,
    favorites: 2890,
    updatedAt: '2026-08-11',
    params: '720亿',
    vram: '~35-40GB',
    speed: '中等',
    language: '中英双语，复杂任务表现稳定',
    scenarios: '复杂任务、内容生成、指令跟随',
    context: '128K',
    hardware: 'A100 / A800 / H800',
  },
  {
    id: 'videotag',
    letter: 'W',
    name: 'VideoTagger',
    vendor: '视觉生成',
    series: '视频理解系列',
    type: '视频理解模型',
    tags: ['标签', '摘要'],
    desc: '视频打标与摘要模型，支持镜头切分、关键帧提取与内容标签生成。',
    rating: 4.2,
    calls: '15.4K',
    callsNum: 15_400,
    favorites: 620,
    updatedAt: '2026-06-20',
    params: '未知',
    vram: '~16-24GB',
    speed: '中等',
    language: '镜头级标签与摘要',
    scenarios: '媒资管理、内容审核、视频检索',
    context: '8K',
    hardware: 'A10 / 4090',
  },
];

const compareRows: Array<{ key: CompareKey; label: string }> = [
  { key: 'icon', label: '模型图标' },
  { key: 'series', label: '模型系列' },
  { key: 'params', label: '参数量' },
  { key: 'vram', label: '显存需求' },
  { key: 'speed', label: '推理速度' },
  { key: 'language', label: '语言能力' },
  { key: 'scenarios', label: '适用场景' },
  { key: 'context', label: '上下文长度' },
  { key: 'type', label: '模型类型' },
  { key: 'hardware', label: '典型硬件推荐' },
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
        m.desc.includes(key) ||
        m.tags.some((t) => t.includes(key)),
    );
  }
  if (vendorFilter.value !== '全部') {
    list = list.filter((m) => m.vendor === vendorFilter.value);
  }
  if (typeFilter.value !== '全部') {
    list = list.filter((m) => m.type === typeFilter.value);
  }
  list.sort((a, b) => b.callsNum - a.callsNum);
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredModels.value.length / pageSize.value)),
);

const pagedModels = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredModels.value.slice(start, start + pageSize.value);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  const pages: number[] = [];
  const maxShow = Math.min(total, 5);
  const start = Math.max(1, Math.min(cur - 1, total - maxShow + 1));
  for (let i = 0; i < maxShow; i++) pages.push(start + i);
  return pages;
});

const compareModels = computed(() =>
  allModels.filter((m) => selectedIds.value.includes(m.id)),
);

watch([keyword, vendorFilter, typeFilter, pageSize], () => {
  currentPage.value = 1;
});

watch(filteredModels, (list) => {
  const valid = new Set(list.map((m) => m.id));
  selectedIds.value = selectedIds.value.filter((id) => valid.has(id));
});

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function toggleSelect(id: string) {
  const i = selectedIds.value.indexOf(id);
  if (i >= 0) {
    selectedIds.value.splice(i, 1);
    return;
  }
  if (selectedIds.value.length >= 4) {
    showToast('最多同时对比 4 个模型');
    return;
  }
  selectedIds.value.push(id);
}

function clearOrQuickSelect() {
  if (selectedIds.value.length > 0) {
    selectedIds.value = [];
    return;
  }
  for (const m of pagedModels.value.slice(0, 2)) {
    if (!selectedIds.value.includes(m.id)) selectedIds.value.push(m.id);
  }
}

function openCompare() {
  if (selectedIds.value.length < 2) {
    showToast('请至少选择 2 个模型再打开对比视图');
    return;
  }
  compareOpen.value = true;
}

function openDetail(model: ModelItem) {
  detailModel.value = model;
}

function closeDetail() {
  detailModel.value = null;
}

function toggleSelectFromDetail() {
  if (!detailModel.value) return;
  toggleSelect(detailModel.value.id);
}

function cellValue(model: ModelItem, key: CompareKey) {
  if (key === 'icon') return model.letter;
  return model[key];
}
</script>

<template>
  <div class="portal-inner-page model-service-page">
    <div class="portal-page-title">
      <h2>模型服务</h2>
      <p>按供应商与类型筛选模型，支持多选对比，帮助快速完成选型决策。</p>
    </div>

    <div class="model-toolbar">
      <div class="model-search">
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索模型名称、供应商、类型..."
        />
      </div>

      <div class="model-filter-row">
        <span class="filter-label">模型供应商</span>
        <div class="filter-chips">
          <button
            v-for="item in vendors"
            :key="item"
            type="button"
            class="filter-chip"
            :class="{ active: vendorFilter === item }"
            @click="vendorFilter = item"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <div class="model-filter-row">
        <span class="filter-label">模型类型</span>
        <div class="filter-chips">
          <button
            v-for="item in types"
            :key="item"
            type="button"
            class="filter-chip"
            :class="{ active: typeFilter === item }"
            @click="typeFilter = item"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </div>

    <div class="model-list-head">
      <div class="list-head-left">
        <span>
          共找到
          <strong>{{ filteredModels.length }}</strong>
          个模型
        </span>
        <label class="select-summary">
          <input
            type="checkbox"
            :checked="selectedIds.length > 0"
            @change="clearOrQuickSelect"
          />
          已选择 {{ selectedIds.length }} 个
        </label>
      </div>
      <button
        class="portal-btn portal-btn-primary portal-btn-sm"
        type="button"
        @click="openCompare"
      >
        模型对比视图
      </button>
    </div>

    <div v-if="filteredModels.length === 0" class="portal-empty">
      未找到匹配的模型，请调整筛选条件
    </div>

    <div v-else class="model-list">
      <article
        v-for="item in pagedModels"
        :key="item.id"
        class="model-row"
        :class="{ selected: selectedIds.includes(item.id) }"
      >
        <label class="model-check">
          <input
            type="checkbox"
            :checked="selectedIds.includes(item.id)"
            @change="toggleSelect(item.id)"
          />
        </label>

        <div class="model-main">
          <div class="model-title-row">
            <div class="model-avatar">{{ item.letter }}</div>
            <div class="model-title-block">
              <h3>{{ item.name }}</h3>
              <div class="model-submeta">
                <span>{{ item.updatedAt }} 更新</span>
                <span>收藏 {{ item.favorites }}</span>
                <span>⭐ {{ item.rating.toFixed(1) }}</span>
                <span>调用 {{ item.calls }}</span>
              </div>
            </div>
          </div>
          <p class="model-desc">{{ item.desc }}</p>
          <div class="model-tags">
            <span v-for="tag in item.tags" :key="tag" class="model-tag">
              {{ tag }}
            </span>
            <span class="model-tag muted">{{ item.vendor }}</span>
            <span class="model-tag muted">{{ item.type }}</span>
          </div>
        </div>

        <div class="model-side">
          <div class="model-thumb" aria-hidden="true">{{ item.letter }}</div>
          <div class="model-side-actions">
            <button
              class="portal-btn portal-btn-primary portal-btn-sm"
              type="button"
              @click="openDetail(item)"
            >
              查看详情
            </button>
            <button
              class="portal-btn portal-btn-outline portal-btn-sm"
              type="button"
              @click="toggleSelect(item.id)"
            >
              {{ selectedIds.includes(item.id) ? '取消选择' : '加入对比' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="filteredModels.length > 0" class="model-pagination">
      <span class="page-info">共 {{ filteredModels.length }} 条</span>
      <select v-model.number="pageSize" class="page-size">
        <option :value="5">5 条/页</option>
        <option :value="10">10 条/页</option>
        <option :value="15">15 条/页</option>
      </select>
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

    <div
      v-if="compareOpen"
      class="compare-mask"
      @click.self="compareOpen = false"
    >
      <div class="compare-panel" role="dialog" aria-modal="true">
        <div class="compare-header">
          <button
            class="portal-btn portal-btn-primary portal-btn-sm"
            type="button"
            @click="compareOpen = false"
          >
            ← 返回列表
          </button>
          <span>已选中（{{ compareModels.length }}）款模型</span>
        </div>
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th>对比维度</th>
                <th v-for="m in compareModels" :key="m.id">{{ m.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in compareRows" :key="row.key">
                <td class="dim">{{ row.label }}</td>
                <td v-for="m in compareModels" :key="`${m.id}-${row.key}`">
                  <div v-if="row.key === 'icon'" class="compare-icon">
                    {{ m.letter }}
                  </div>
                  <template v-else>
                    {{ cellValue(m, row.key) }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-if="detailModel"
      class="compare-mask"
      @click.self="closeDetail"
    >
      <div class="detail-panel" role="dialog" aria-modal="true">
        <div class="detail-header">
          <div class="detail-header-main">
            <div class="detail-avatar">{{ detailModel.letter }}</div>
            <div>
              <h3>{{ detailModel.name }}</h3>
              <p>{{ detailModel.series }}</p>
            </div>
          </div>
          <button
            class="detail-close"
            type="button"
            aria-label="关闭"
            @click="closeDetail"
          >
            ×
          </button>
        </div>

        <div class="detail-body">
          <p class="detail-desc">{{ detailModel.desc }}</p>

          <div class="detail-tags">
            <span
              v-for="tag in detailModel.tags"
              :key="tag"
              class="model-tag"
            >
              {{ tag }}
            </span>
            <span class="model-tag muted">{{ detailModel.vendor }}</span>
            <span class="model-tag muted">{{ detailModel.type }}</span>
          </div>

          <div class="detail-stats">
            <div class="detail-stat">
              <span class="label">评分</span>
              <strong>⭐ {{ detailModel.rating.toFixed(1) }}</strong>
            </div>
            <div class="detail-stat">
              <span class="label">调用量</span>
              <strong>{{ detailModel.calls }}</strong>
            </div>
            <div class="detail-stat">
              <span class="label">收藏</span>
              <strong>{{ detailModel.favorites }}</strong>
            </div>
            <div class="detail-stat">
              <span class="label">更新时间</span>
              <strong>{{ detailModel.updatedAt }}</strong>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">参数量</span>
              <span>{{ detailModel.params }}</span>
            </div>
            <div class="detail-item">
              <span class="label">显存需求</span>
              <span>{{ detailModel.vram }}</span>
            </div>
            <div class="detail-item">
              <span class="label">推理速度</span>
              <span>{{ detailModel.speed }}</span>
            </div>
            <div class="detail-item">
              <span class="label">上下文长度</span>
              <span>{{ detailModel.context }}</span>
            </div>
            <div class="detail-item full">
              <span class="label">语言能力</span>
              <span>{{ detailModel.language }}</span>
            </div>
            <div class="detail-item full">
              <span class="label">适用场景</span>
              <span>{{ detailModel.scenarios }}</span>
            </div>
            <div class="detail-item full">
              <span class="label">典型硬件推荐</span>
              <span>{{ detailModel.hardware }}</span>
            </div>
          </div>
        </div>

        <div class="detail-footer">
          <button
            class="portal-btn portal-btn-outline portal-btn-sm"
            type="button"
            @click="closeDetail"
          >
            关闭
          </button>
          <button
            class="portal-btn portal-btn-primary portal-btn-sm"
            type="button"
            @click="toggleSelectFromDetail"
          >
            {{
              selectedIds.includes(detailModel.id) ? '取消对比' : '加入对比'
            }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.model-service-page {
  --ms-radius: 12px;
}

.model-toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: var(--ms-radius);
}

.model-search {
  position: relative;
  display: flex;
  align-items: center;
}

.model-search .search-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  pointer-events: none;
  opacity: 0.7;
}

.model-search input {
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  padding: 0 14px 0 36px;
  font-size: 14px;
  color: var(--portal-gray-800, #333);
  background: var(--portal-gray-50, #fafafa);
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: 8px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.model-search input:focus {
  border-color: var(--portal-primary, #6b4cff);
  box-shadow: 0 0 0 3px var(--portal-primary-bg, #f0edff);
}

.model-filter-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.filter-label {
  flex-shrink: 0;
  width: 72px;
  padding-top: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--portal-gray-600, #757575);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  height: 30px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--portal-gray-700, #616161);
  cursor: pointer;
  background: var(--portal-gray-50, #fafafa);
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: 999px;
  transition: all 0.15s;
}

.filter-chip:hover {
  color: var(--portal-primary, #6b4cff);
  border-color: var(--portal-primary-light, #8b7aff);
}

.filter-chip.active {
  color: #fff;
  background: var(--portal-primary, #6b4cff);
  border-color: var(--portal-primary, #6b4cff);
}

.model-list-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.list-head-left {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  font-size: 13px;
  color: var(--portal-gray-600, #757575);
}

.list-head-left strong {
  color: var(--portal-primary, #6b4cff);
}

.select-summary {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.model-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 160px;
  gap: 14px;
  align-items: stretch;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: var(--ms-radius);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.model-row:hover,
.model-row.selected {
  border-color: color-mix(in srgb, var(--portal-primary, #6b4cff) 45%, #fff);
  box-shadow: 0 8px 24px rgb(107 76 255 / 8%);
}

.model-check {
  display: flex;
  align-items: flex-start;
  padding-top: 8px;
  cursor: pointer;
}

.model-main {
  min-width: 0;
}

.model-title-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.model-avatar,
.model-thumb,
.compare-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--portal-primary, #6b4cff);
  background: var(--portal-primary-bg, #f0edff);
  border-radius: 10px;
}

.model-avatar {
  width: 42px;
  height: 42px;
  font-size: 18px;
}

.model-title-block h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.model-submeta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.model-desc {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--portal-gray-600, #757575);
}

.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.model-tag {
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--portal-primary, #6b4cff);
  background: var(--portal-primary-bg, #f0edff);
  border-radius: 4px;
}

.model-tag.muted {
  color: var(--portal-gray-600, #757575);
  background: var(--portal-gray-100, #f5f5f5);
}

.model-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

.model-thumb {
  width: 100%;
  height: 84px;
  font-size: 28px;
  border: 1px dashed
    color-mix(in srgb, var(--portal-primary, #6b4cff) 25%, #fff);
}

.model-side-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.portal-empty {
  padding: 48px 16px;
  font-size: 14px;
  color: var(--portal-gray-500, #9e9e9e);
  text-align: center;
  background: #fff;
  border: 1px dashed var(--portal-gray-300, #e0e0e0);
  border-radius: var(--ms-radius);
}

.model-pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
}

.model-pagination .page-info {
  margin-right: auto;
  font-size: 13px;
  color: var(--portal-gray-500, #9e9e9e);
}

.model-pagination .page-size,
.model-pagination button {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  color: var(--portal-gray-700, #616161);
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: 6px;
}

.model-pagination button.active {
  color: #fff;
  background: var(--portal-primary, #6b4cff);
  border-color: var(--portal-primary, #6b4cff);
}

.model-pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.compare-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(20 16 40 / 45%);
  backdrop-filter: blur(2px);
}

.compare-panel {
  display: flex;
  flex-direction: column;
  width: min(1100px, 100%);
  max-height: min(86vh, 820px);
  overflow: hidden;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 64px rgb(40 20 90 / 22%);
}

.compare-header {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--portal-gray-800, #333);
  border-bottom: 1px solid var(--portal-gray-100, #f5f5f5);
}

.compare-table-wrap {
  padding: 0 0 12px;
  overflow: auto;
}

.compare-table {
  width: 100%;
  font-size: 13px;
  border-collapse: collapse;
}

.compare-table th,
.compare-table td {
  padding: 12px 16px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--portal-gray-100, #f5f5f5);
}

.compare-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 700;
  color: var(--portal-gray-800, #333);
  background: var(--portal-primary-bg, #f0edff);
}

.compare-table tbody tr:nth-child(even) td {
  background: #fafafa;
}

.compare-table .dim {
  width: 120px;
  font-weight: 600;
  color: var(--portal-gray-600, #757575);
  white-space: nowrap;
}

.compare-icon {
  width: 48px;
  height: 48px;
  font-size: 20px;
}

.detail-panel {
  display: flex;
  flex-direction: column;
  width: min(720px, 100%);
  max-height: min(86vh, 760px);
  overflow: hidden;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 64px rgb(40 20 90 / 22%);
}

.detail-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--portal-gray-100, #f5f5f5);
}

.detail-header-main {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.detail-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 20px;
  font-weight: 700;
  color: var(--portal-primary, #6b4cff);
  background: var(--portal-primary-bg, #f0edff);
  border-radius: 12px;
}

.detail-header-main h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.detail-header-main p {
  margin: 0;
  font-size: 13px;
  color: var(--portal-gray-500, #9e9e9e);
}

.detail-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 22px;
  line-height: 1;
  color: var(--portal-gray-500, #9e9e9e);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
}

.detail-close:hover {
  color: var(--portal-gray-800, #333);
  background: var(--portal-gray-100, #f5f5f5);
}

.detail-body {
  padding: 16px 20px;
  overflow: auto;
}

.detail-desc {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--portal-gray-700, #616161);
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.detail-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--portal-gray-50, #fafafa);
  border: 1px solid var(--portal-gray-100, #f5f5f5);
  border-radius: 10px;
}

.detail-stat .label,
.detail-item .label {
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.detail-stat strong {
  font-size: 14px;
  color: var(--portal-gray-900, #212121);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #fff;
  border: 1px solid var(--portal-gray-100, #f5f5f5);
  border-radius: 10px;
}

.detail-item.full {
  grid-column: 1 / -1;
}

.detail-item span:last-child {
  font-size: 13px;
  line-height: 1.6;
  color: var(--portal-gray-800, #333);
}

.detail-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 20px 18px;
  border-top: 1px solid var(--portal-gray-100, #f5f5f5);
}

.portal-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 2100;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
}

@media (max-width: 900px) {
  .model-row {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .model-side {
    flex-direction: row;
    grid-column: 2;
    align-items: center;
  }

  .model-thumb {
    width: 96px;
    height: 64px;
  }

  .model-side-actions {
    flex: 1;
    flex-direction: row;
  }

  .model-filter-row {
    flex-direction: column;
    gap: 8px;
  }

  .filter-label {
    width: auto;
    padding-top: 0;
  }

  .detail-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
