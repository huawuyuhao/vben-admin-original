<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { portalCases } from '#/views/_shared/data/cases';

const router = useRouter();

/** 首页案例区：前 4 个机房节点 + 后 2 个网络能力 */
const homeCaseNodes = portalCases.slice(0, 4);
const homeCaseNetworks = portalCases.slice(4);

function go(path: string) {
  router.push(path);
}

/** 服务轮播：无实图，用主题色块 + 抽象视觉贴合门户风格 */
const serviceSlides = [
  {
    id: 'green-compute',
    theme: 'theme-purple',
    badge: '绿电智算',
    title: '绿电驱动的普惠算力网络',
    desc: '把可追溯绿电与算力调度打通，让每一次 Token 调用都更低碳、更可计量。',
    points: ['绿电消纳优先调度', '任务级碳足迹溯源', '跨域算力协同优化'],
    metric: { value: '85%+', label: '绿电消纳占比' },
    cta: '了解调度能力',
    link: '/workbench/overview',
  },
  {
    id: 'model-route',
    theme: 'theme-violet',
    badge: '模型路由',
    title: '一套 API，智能分发多模型',
    desc: '统一接入主流大模型，按时延、成本与可用性自动择路，业务侧只需一把 Key。',
    points: ['多模型统一网关', '时延 / 成本双优路由', '故障自动切换'],
    metric: { value: '1 Key', label: '统一调用入口' },
    cta: '查看模型服务',
    link: '/service/model',
  },
  {
    id: 'region-dispatch',
    theme: 'theme-teal',
    badge: '区域调度',
    title: '东数西算，跨域弹性编排',
    desc: '综合电价、负载与碳排因子，生成可解释的区域调度策略，支撑事前校核与事后归因。',
    points: ['多周期任务编排', '策略校核监控', '资源画像可视化'],
    metric: { value: '24', label: '路由节点在线' },
    cta: '进入工作台',
    link: '/workbench/overview',
  },
  {
    id: 'billing',
    theme: 'theme-green',
    badge: '透明计费',
    title: '按需计量，账单清晰可核',
    desc: 'Token、算力时长与绿电溢价分项计量，合同、发票与报表一站闭环。',
    points: ['分项计量对账', '合同与发票协同', '多维经营报表'],
    metric: { value: '按量', label: '弹性结算模式' },
    cta: '查看计费说明',
    link: '/service/product',
  },
];

const SLIDE_DURATION_MS = 5200;

const slideIndex = ref(0);
const slidePaused = ref(false);
/** 进度条重播令牌：换页 / 恢复播放时递增，避免与计时器脱节 */
const progressToken = ref(0);
let slideTimer: ReturnType<typeof setTimeout> | null = null;

const activeSlide = computed(() => serviceSlides[slideIndex.value]!);

function goSlide(i: number) {
  slideIndex.value = (i + serviceSlides.length) % serviceSlides.length;
  progressToken.value += 1;
  if (!slidePaused.value) {
    startSlideTimer();
  }
}

function nextSlide() {
  goSlide(slideIndex.value + 1);
}

function prevSlide() {
  goSlide(slideIndex.value - 1);
}

function startSlideTimer() {
  stopSlideTimer();
  slideTimer = setTimeout(() => {
    slideTimer = null;
    if (!slidePaused.value) {
      // 先翻页；goSlide 内部会再次启动计时并刷新进度条
      slideIndex.value = (slideIndex.value + 1) % serviceSlides.length;
      progressToken.value += 1;
      startSlideTimer();
    }
  }, SLIDE_DURATION_MS);
}

function stopSlideTimer() {
  if (slideTimer) {
    clearTimeout(slideTimer);
    slideTimer = null;
  }
}

watch(slidePaused, (paused) => {
  if (paused) {
    stopSlideTimer();
    return;
  }
  // 恢复时从当前页重新计时，进度条同步重播
  progressToken.value += 1;
  startSlideTimer();
});

onMounted(startSlideTimer);
onUnmounted(stopSlideTimer);

const newsPolicy = [
  {
    color: 'var(--portal-primary)',
    title:
      '《关于深入实施"东数西算"工程加快构建全国一体化算力网的实施意见》',
    meta: '2026-07-15 · 发改数据〔2023〕1779号',
  },
  {
    color: 'var(--portal-green)',
    title: '《数据中心绿色低碳发展专项行动计划》',
    meta: '2026-06-20 · 发改环资〔2024〕970号',
  },
  {
    color: 'var(--portal-blue)',
    title: '《加快构建新型电力系统行动方案(2024—2027)》',
    meta: '2026-05-10 · 发改能源〔2024〕1128号',
  },
];

const newsTech = [
  {
    color: 'var(--portal-orange)',
    title: '南方区域算力调度引擎 V2.0 上线',
    meta: '2026-08-01 · 支持多周期任务编排',
  },
  {
    color: 'var(--portal-primary)',
    title: '碳排放因子库动态更新机制发布',
    meta: '2026-07-20 · 任务级碳足迹溯源',
  },
  {
    color: 'var(--portal-green)',
    title: '贵州数据中心绿电消纳比例突破 90%',
    meta: '2026-06-30 · 区域绿电优势凸显',
  },
];
</script>

<template>
  <div>
    <!-- 服务轮播图（需求：门户首页服务轮播） -->
    <section
      class="portal-banner-section portal-banner-section--hero"
      @mouseenter="slidePaused = true"
      @mouseleave="slidePaused = false"
    >
      <div class="portal-banner-carousel portal-banner-carousel--hero">
        <div
          class="portal-banner-track"
          :style="{ transform: `translateX(-${slideIndex * 100}%)` }"
        >
          <article
            v-for="slide in serviceSlides"
            :key="slide.id"
            class="portal-banner-slide"
            :class="slide.theme"
          >
            <div class="portal-banner-decor" aria-hidden="true">
              <span class="orb orb-a"></span>
              <span class="orb orb-b"></span>
              <span class="grid-lines"></span>
            </div>
            <div class="portal-banner-body">
              <div class="portal-banner-copy">
                <span class="portal-banner-badge">{{ slide.badge }}</span>
                <h3>{{ slide.title }}</h3>
                <p>{{ slide.desc }}</p>
                <ul class="portal-banner-points">
                  <li v-for="point in slide.points" :key="point">{{ point }}</li>
                </ul>
                <button
                  class="portal-banner-cta"
                  type="button"
                  @click="go(slide.link)"
                >
                  {{ slide.cta }} →
                </button>
              </div>
              <div class="portal-banner-visual">
                <div class="portal-banner-metric-card">
                  <div class="ring"></div>
                  <div class="metric-value">{{ slide.metric.value }}</div>
                  <div class="metric-label">{{ slide.metric.label }}</div>
                </div>
                <div class="portal-banner-chip-row">
                  <span>电</span>
                  <span>碳</span>
                  <span>算</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <button
          class="portal-banner-nav prev"
          type="button"
          aria-label="上一张"
          @click="prevSlide"
        ></button>
        <button
          class="portal-banner-nav next"
          type="button"
          aria-label="下一张"
          @click="nextSlide"
        ></button>

        <div class="portal-banner-dots">
          <button
            v-for="(slide, i) in serviceSlides"
            :key="slide.id"
            type="button"
            class="portal-banner-dot"
            :class="{ active: i === slideIndex }"
            :aria-label="`切换到 ${slide.badge}`"
            @click="goSlide(i)"
          ></button>
        </div>
        <div class="portal-banner-progress" aria-hidden="true">
          <span :key="`${activeSlide.id}-${progressToken}`"></span>
        </div>
      </div>
    </section>


    <!-- Hero -->
    <section class="portal-hero portal-hero-compact">
      <div class="portal-hero-inner">
        <div class="portal-hero-left">
          <div class="portal-hero-tag">⚡ COMPUTE API · MODEL ROUTING</div>
          <h1 class="portal-hero-title">
            随电而算 向<span class="portal-gradient-green">绿</span>而行<br />
            协同调度
            <span class="portal-gradient-purple">普惠算力</span>
          </h1>
          <p class="portal-hero-subtitle">
            依托绿电追溯与电价感知，按需弹性响应，提供绿色、低碳、普惠的统一
            Token 服务
          </p>
          <div class="portal-hero-cta">
            <button
              class="portal-btn-cta-primary"
              type="button"
              @click="go('/workbench/overview')"
            >
              免费体验 →
            </button>
            <button
              class="portal-btn-cta-outline"
              type="button"
              @click="go('/service/model')"
            >
              查看模型与定价
            </button>
          </div>
          <div class="portal-hero-metrics">
            <div class="portal-hero-metric">
              <div class="num">99.9%</div>
              <div class="label">可用性目标</div>
            </div>
            <div class="portal-hero-metric">
              <div class="num">
                1<span style="font-size: 18px">个</span>
              </div>
              <div class="label">统一 API Key</div>
            </div>
            <div class="portal-hero-metric">
              <div class="num">7 × 24</div>
              <div class="label">节点状态监控</div>
            </div>
          </div>
        </div>
        <div class="portal-hero-right">
          <div class="portal-dashboard-card">
            <div class="portal-dc-header">
              <div class="portal-dc-title">智能调度中枢</div>
              <div class="portal-dc-status">
                <span class="dot"></span> ONLINE
              </div>
            </div>
            <div class="portal-dc-stats">
              <div class="portal-dc-stat">
                <div class="val">
                  2.48<span style="font-size: 14px; color: var(--portal-gray-500)">
                    M
                  </span>
                </div>
                <div class="lbl">今日已调度请求</div>
              </div>
              <div class="portal-dc-stat">
                <div class="val">
                  24<span style="font-size: 14px; color: var(--portal-gray-500)">
                    个
                  </span>
                </div>
                <div class="lbl">路由节点</div>
              </div>
            </div>
            <div class="portal-dc-mini-cards">
              <div class="portal-dc-mini-card green">
                <div class="mc-name">文本推理</div>
                <div class="mc-status">稳定</div>
              </div>
              <div class="portal-dc-mini-card purple">
                <div class="mc-name">视觉生成</div>
                <div class="mc-status">可用</div>
              </div>
              <div class="portal-dc-mini-card blue">
                <div class="mc-name">实时语音</div>
                <div class="mc-status">可用</div>
              </div>
            </div>
            <div class="portal-dc-route-title">模型路由</div>
            <div class="portal-dc-route-item">
              <div class="portal-dc-route-row">
                <span class="portal-dc-route-name">主线路 Qwen3.7-Plus</span>
                <span class="portal-badge portal-badge-success">低延迟</span>
              </div>
              <div class="portal-dc-route-bar">
                <div class="fill purple" style="width: 85%"></div>
              </div>
            </div>
            <div class="portal-dc-route-item">
              <div class="portal-dc-route-row">
                <span class="portal-dc-route-name">备用线路 DeepSeek-V4</span>
                <span class="portal-dc-route-tag">READY · 自动切换</span>
              </div>
              <div class="portal-dc-route-bar">
                <div class="fill teal" style="width: 62%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why -->
    <section class="portal-section">
      <div class="portal-section-tag">WHY THIS PLATFORM</div>
      <h2 class="portal-section-title">用低碳高效的算力，驱动你的 AI 创新</h2>
      <p class="portal-section-subtitle">
        融合电力、碳排与算力数据，打造绿色、经济、智能的算力服务基座
      </p>
      <div class="portal-feature-grid">
        <div class="portal-feature-card" @click="go('/workbench/overview')">
          <div class="portal-feature-icon purple">⚡</div>
          <h3>电价感知调度</h3>
          <p>
            实时感知区域电价与绿电出力状态，自动将计算任务调度至低电价、高绿电占比区域，降低用电综合成本。
          </p>
        </div>
        <div class="portal-feature-card">
          <div class="portal-feature-icon green">🍃</div>
          <h3>碳排精准计量</h3>
          <p>
            从数据中心到算力任务级，实现全链路碳足迹溯源，碳排放因子动态更新，支撑绿色低碳运营决策。
          </p>
        </div>
        <div class="portal-feature-card">
          <div class="portal-feature-icon blue">🌐</div>
          <h3>跨域算力协同</h3>
          <p>
            "3+1+X"算力网络架构，覆盖贵州、广州、惠州三大数据中心及超200个边缘节点，弹性复用闲置算力。
          </p>
        </div>
        <div class="portal-feature-card">
          <div class="portal-feature-icon orange">📊</div>
          <h3>全景监测看板</h3>
          <p>
            算力、电力、碳排放、网络等多维数据实时汇聚，热力图、趋势分析、告警预警一体化展示。
          </p>
        </div>
        <div class="portal-feature-card" @click="go('/service/model')">
          <div class="portal-feature-icon purple">🤖</div>
          <h3>模型市场服务</h3>
          <p>
            支持主流大模型接入，提供模型对比、评价、调用量统计，一个 API Key
            统一调用所有模型服务。
          </p>
        </div>
        <div class="portal-feature-card">
          <div class="portal-feature-icon green">🔒</div>
          <h3>安全合规运营</h3>
          <p>
            遵循国家等保标准与南网安全规范，数据全生命周期管控，保障算力服务安全合规运行。
          </p>
        </div>
      </div>
    </section>

    <!-- Service -->
    <section class="portal-section alt">
      <div class="portal-section-tag">SERVICE OVERVIEW</div>
      <h2 class="portal-section-title">业务服务介绍</h2>
      <p class="portal-section-subtitle">
        从需求提交到算力交付，一站式电碳算协同服务
      </p>
      <div class="portal-flow-strip">
        <span>需求接入</span>
        <i>→</i>
        <span>策略校核</span>
        <i>→</i>
        <span>智能调度</span>
        <i>→</i>
        <span>算力供给</span>
        <i>→</i>
        <span>结算计量</span>
        <i>→</i>
        <span>监测反馈</span>
      </div>
      <div class="portal-feature-grid">
        <div class="portal-feature-card">
          <div class="portal-feature-icon purple">📝</div>
          <h3>算力需求管理</h3>
          <p>
            支持高性能、低价格、低碳等多维偏好提交算力需求，系统智能匹配最优算力中心。
          </p>
        </div>
        <div class="portal-feature-card">
          <div class="portal-feature-icon green">🔄</div>
          <h3>区域算力调度</h3>
          <p>
            基于电价、绿电、碳排等因子生成调度策略，支持事前预警与事后归因，实现跨域算力优化。
          </p>
        </div>
        <div class="portal-feature-card">
          <div class="portal-feature-icon blue">💳</div>
          <h3>算力结算服务</h3>
          <p>在线选配、下单、计费全流程管理，支持商务合同、发票、账单与多维报表。</p>
        </div>
      </div>
    </section>

    <!-- Products -->
    <section class="portal-section">
      <div class="portal-section-tag">PRODUCT</div>
      <h2 class="portal-section-title">产品推荐</h2>
      <p class="portal-section-subtitle">精选算力产品，满足多样化计算需求</p>
      <div class="portal-product-grid">
        <div class="portal-product-card" @click="go('/service/product')">
          <div class="portal-product-img">🖥️</div>
          <div class="portal-product-body">
            <h4>GPU 智算服务</h4>
            <p>高性能 GPU 集群，支持大模型训练与推理，按需弹性扩展。</p>
            <div class="portal-product-tags">
              <span class="portal-product-tag">绿电占比 85%</span>
              <span class="portal-product-tag price">¥2.8/小时起</span>
            </div>
          </div>
        </div>
        <div class="portal-product-card" @click="go('/service/product')">
          <div class="portal-product-img">☁️</div>
          <div class="portal-product-body">
            <h4>通用算力服务</h4>
            <p>CPU 多核实例，适合通算类任务，低成本高可用。</p>
            <div class="portal-product-tags">
              <span class="portal-product-tag">绿电占比 72%</span>
              <span class="portal-product-tag price">¥0.8/小时起</span>
            </div>
          </div>
        </div>
        <div class="portal-product-card" @click="go('/service/product')">
          <div class="portal-product-img">🔗</div>
          <div class="portal-product-body">
            <h4>边缘算力服务</h4>
            <p>200+ 边缘节点，低延迟就近计算，适合实时推理场景。</p>
            <div class="portal-product-tags">
              <span class="portal-product-tag">绿电占比 90%</span>
              <span class="portal-product-tag price">¥1.5/小时起</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cases -->
    <section class="portal-section alt">
      <div class="portal-section-tag">CASE STUDIES</div>
      <h2 class="portal-section-title">落地案例 · 电碳算协同实践</h2>
      <p class="portal-section-subtitle">
        接入南方区域数据中心与算力网络，用真实部署呈现绿电智算与跨域调度能力
      </p>

      <div class="portal-cases-overview">
        <div
          v-for="(item, index) in homeCaseNodes"
          :key="item.title"
          class="portal-cases-node"
          :class="item.iconClass"
        >
          <div class="portal-cases-node-index">
            {{ String(index + 1).padStart(2, '0') }}
          </div>
          <div class="portal-cases-node-main">
            <span class="portal-cases-node-region">{{ item.region }}</span>
            <strong>{{ item.shortName }}</strong>
            <em>{{
              item.badges.find((b) => b.type === 'info')?.text ??
              item.badges[0]?.text
            }}</em>
          </div>
        </div>
      </div>

      <div class="portal-cases-layout">
        <div class="portal-cases-featured">
          <article
            v-for="item in homeCaseNodes"
            :key="item.title"
            class="portal-cases-card"
            @click="go('/service/case')"
          >
            <div class="portal-cases-card-top">
              <div class="portal-feature-icon" :class="item.iconClass">
                {{ item.icon }}
              </div>
              <span class="portal-cases-card-region">{{ item.region }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
            <div class="portal-cases-card-badges">
              <span
                v-for="badge in item.badges"
                :key="badge.text"
                class="portal-badge"
                :class="`portal-badge-${badge.type}`"
              >
                {{ badge.text }}
              </span>
            </div>
          </article>
        </div>

        <aside class="portal-cases-aside">
          <div class="portal-cases-aside-title">网络能力</div>
          <div
            v-for="item in homeCaseNetworks"
            :key="item.title"
            class="portal-cases-aside-item"
            @click="go('/service/case')"
          >
            <div class="portal-feature-icon" :class="item.iconClass">
              {{ item.icon }}
            </div>
            <div>
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
              <div class="portal-cases-card-badges">
                <span
                  v-for="badge in item.badges"
                  :key="badge.text"
                  class="portal-badge"
                  :class="`portal-badge-${badge.type}`"
                >
                  {{ badge.text }}
                </span>
              </div>
            </div>
          </div>
          <button
            class="portal-btn-cta-outline portal-cases-more"
            type="button"
            @click="go('/service/case')"
          >
            进入案例中心 →
          </button>
        </aside>
      </div>
    </section>

    <!-- News -->
    <section class="portal-section">
      <div class="portal-section-tag">INDUSTRY NEWS</div>
      <h2 class="portal-section-title">行业资讯</h2>
      <p class="portal-section-subtitle">电碳算相关政策与技术进展</p>
      <div class="portal-two-col">
        <div class="portal-card">
          <div class="portal-card-title">政策动态</div>
          <div style="display: flex; flex-direction: column; gap: 14px">
            <div
              v-for="(item, index) in newsPolicy"
              :key="item.title"
              style="display: flex; gap: 12px"
              :style="
                index < newsPolicy.length - 1
                  ? {
                      paddingBottom: '14px',
                      borderBottom: '1px solid var(--portal-gray-100)',
                    }
                  : {}
              "
            >
              <div
                :style="{
                  width: '4px',
                  background: item.color,
                  borderRadius: '2px',
                  flexShrink: 0,
                }"
              ></div>
              <div>
                <div
                  style="
                    margin-bottom: 4px;
                    font-size: 14px;
                    font-weight: 600;
                  "
                >
                  {{ item.title }}
                </div>
                <div style="font-size: 12px; color: var(--portal-gray-500)">
                  {{ item.meta }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="portal-card">
          <div class="portal-card-title">技术进展</div>
          <div style="display: flex; flex-direction: column; gap: 14px">
            <div
              v-for="(item, index) in newsTech"
              :key="item.title"
              style="display: flex; gap: 12px"
              :style="
                index < newsTech.length - 1
                  ? {
                      paddingBottom: '14px',
                      borderBottom: '1px solid var(--portal-gray-100)',
                    }
                  : {}
              "
            >
              <div
                :style="{
                  width: '4px',
                  background: item.color,
                  borderRadius: '2px',
                  flexShrink: 0,
                }"
              ></div>
              <div>
                <div
                  style="
                    margin-bottom: 4px;
                    font-size: 14px;
                    font-weight: 600;
                  "
                >
                  {{ item.title }}
                </div>
                <div style="font-size: 12px; color: var(--portal-gray-500)">
                  {{ item.meta }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="portal-section alt">
      <div class="portal-section-tag">PRICING</div>
      <h2 class="portal-section-title">计费说明</h2>
      <p class="portal-section-subtitle">灵活计费模式，按需使用，经济高效</p>
      <div class="portal-three-col">
        <div class="portal-card" style="text-align: center">
          <div style="margin-bottom: 12px; font-size: 32px">⏱️</div>
          <h3 style="margin-bottom: 8px; font-size: 18px; font-weight: 700">
            按量计费
          </h3>
          <p
            style="
              margin-bottom: 12px;
              font-size: 13px;
              color: var(--portal-gray-500);
            "
          >
            按实际使用时长/算力计量，灵活弹性
          </p>
          <div
            style="
              font-size: 24px;
              font-weight: 800;
              color: var(--portal-primary);
            "
          >
            ¥0.8<span style="font-size: 14px; color: var(--portal-gray-500)"
              >/小时起</span
            >
          </div>
        </div>
        <div
          class="portal-card"
          style="
            position: relative;
            text-align: center;
            border: 2px solid var(--portal-primary);
          "
        >
          <div
            style="
              position: absolute;
              top: -12px;
              left: 50%;
              padding: 2px 16px;
              font-size: 12px;
              font-weight: 600;
              color: white;
              background: var(--portal-primary);
              border-radius: 12px;
              transform: translateX(-50%);
            "
          >
            推荐
          </div>
          <div style="margin-bottom: 12px; font-size: 32px">📦</div>
          <h3 style="margin-bottom: 8px; font-size: 18px; font-weight: 700">
            包月套餐
          </h3>
          <p
            style="
              margin-bottom: 12px;
              font-size: 13px;
              color: var(--portal-gray-500);
            "
          >
            预付费包月，享更多优惠
          </p>
          <div
            style="
              font-size: 24px;
              font-weight: 800;
              color: var(--portal-primary);
            "
          >
            ¥499<span style="font-size: 14px; color: var(--portal-gray-500)"
              >/月起</span
            >
          </div>
        </div>
        <div class="portal-card" style="text-align: center">
          <div style="margin-bottom: 12px; font-size: 32px">🏢</div>
          <h3 style="margin-bottom: 8px; font-size: 18px; font-weight: 700">
            企业定制
          </h3>
          <p
            style="
              margin-bottom: 12px;
              font-size: 13px;
              color: var(--portal-gray-500);
            "
          >
            专属算力资源，SLA 保障
          </p>
          <div
            style="
              font-size: 24px;
              font-weight: 800;
              color: var(--portal-primary);
            "
          >
            联系我们
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="portal-section">
      <div class="portal-section-tag">ABOUT US</div>
      <div class="portal-about-section">
        <div class="portal-about-text">
          <h3>关于我们</h3>
          <p>
            电碳算协同运营平台由南方电网电算科技数字工程（广东）有限公司建设运营，是落实国家"东数西算"战略、服务全国一体化算力网的重要抓手。
          </p>
          <p>
            平台依托南方五省区完善的电力调度与市场交易体系、充足的绿色电力资源及全量电力数据资产，为算力需求方和供给方提供普惠易用、绿色安全的算力服务。
          </p>
          <p>
            以电贯通，探索电碳算产业协同路径，实现南方区域算力最优化配置，引导算力负荷汇聚南方五省，释放区域绿电价值。
          </p>
        </div>
        <div class="portal-about-visual">⚡🍃</div>
      </div>
    </section>
  </div>
</template>
