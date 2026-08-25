<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { caseListItems, portalCases } from '#/views/_shared/data/cases';
import { portalProducts } from '#/views/_shared/data/products';
import { ensureLoggedIn } from '#/store/common';

const router = useRouter();

/**
 * 门户内跳转：未登录先去登录页，不进入业务路由
 * @param path 目标路径
 */
function go(path: string) {
  if (!ensureLoggedIn(path)) {
    return;
  }
  router.push(path);
}

/** 服务轮播（保持不动） */
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
    link: '/workbench/panorama/global',
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
    link: '/workbench/panorama/global',
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
const progressToken = ref(0);
let slideTimer: ReturnType<typeof setTimeout> | null = null;

const activeSlide = computed(() => serviceSlides[slideIndex.value]!);

function goSlide(i: number) {
  slideIndex.value = (i + serviceSlides.length) % serviceSlides.length;
  progressToken.value += 1;
  if (!slidePaused.value) startSlideTimer();
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
  progressToken.value += 1;
  startSlideTimer();
});

onMounted(startSlideTimer);
onUnmounted(stopSlideTimer);

/** 热门产品推荐 */
const productTabs = ['智算产品', '通算产品', '边缘算力'] as const;
const activeProductTab = ref<(typeof productTabs)[number]>('智算产品');

const hotProducts = computed(() => {
  const list = portalProducts.filter((p) => {
    if (activeProductTab.value === '智算产品') return p.type.includes('智算');
    if (activeProductTab.value === '通算产品') return p.type.includes('通算') || p.type.includes('CPU');
    return p.type.includes('边缘') || p.tags.some((t) => t.includes('边缘'));
  });
  const source = list.length >= 6 ? list : portalProducts;
  return source.slice(0, 6);
});

/** 业务服务（三卡片，仅介绍） */
const businessServices = [
  {
    icon: '🖥️',
    title: '算力产品',
    desc: '绿色低碳智算产品，液冷散热与智能能耗管理显著降低 PUE，为模型训练与推理提供可持续绿色算力底座。',
  },
  {
    icon: '🧱',
    title: '裸金属',
    desc: '独占物理服务器，无虚拟化损耗，支持自定义系统与加速卡，适合大规模训练与高性能计算场景。',
  },
  {
    icon: '☁️',
    title: '云服务',
    desc: '按需开通、弹性伸缩的云主机与容器算力，覆盖通算、推理与开发测试，支持按量与包月计费。',
  },
];

/** 计算说明 */
const billingCards = [
  {
    icon: '⏱️',
    title: '计费透明，统筹细节',
    points: ['单项计价：按 Token / 时长 / 规格分项计量', '结算方式：按量、包月与企业定制可选'],
  },
  {
    icon: '📊',
    title: '账单清晰，对账便捷',
    points: ['多维报表：任务、资源、碳排一站汇总', '发票协同：合同、账单与开票流程打通'],
  },
  {
    icon: '🍃',
    title: '绿电溢价，可核可溯',
    points: ['碳足迹：任务级碳排放因子动态核算', '绿电消纳：消纳占比与溢价分项可查'],
  },
];

/** 行业资讯 */
const newsItems = [
  {
    date: '07-15',
    year: '2026',
    title: '深入实施“东数西算”工程加快构建全国一体化算力网',
    summary: '推动算力、电力与碳排数据协同，支撑区域绿电消纳与跨域调度能力建设。',
  },
  {
    date: '06-20',
    year: '2026',
    title: '数据中心绿色低碳发展专项行动计划发布',
    summary: '明确 PUE 约束与绿电使用目标，引导智算中心向低碳高效方向转型。',
  },
  {
    date: '05-10',
    year: '2026',
    title: '加快构建新型电力系统行动方案推进落实',
    summary: '电碳算协同成为负荷侧调节与绿电消纳的重要抓手。',
  },
  {
    date: '04-28',
    year: '2026',
    title: '南方区域算力调度引擎能力升级',
    summary: '支持多周期任务编排、策略校核与任务级碳足迹溯源。',
  },
];

/** 业态分布 */
const bizTiles = [
  '人工智能',
  '混合云',
  '金融行业',
  '科研教育',
  '工业制造',
  '智慧能源',
  '媒体渲染',
  '政务服务',
  '边缘物联',
];

/** 合作案例 */
const coopCases = caseListItems.slice(0, 3);

/** 业态分布节点补充文案 */
const bizHint = portalCases.slice(0, 3);
</script>

<template>
  <div>
    <!-- 服务轮播图（保持不动） -->
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

    <!-- 热门产品推荐 -->
    <section class="portal-section">
      <div class="home-block-head">
        <div>
          <div class="portal-section-tag">HOT PRODUCTS</div>
          <h2 class="portal-section-title home-title-left">热门产品推荐</h2>
        </div>
        <div class="home-head-actions">
          <div class="home-filter-tabs">
            <button
              v-for="tab in productTabs"
              :key="tab"
              type="button"
              class="home-filter-tab"
              :class="{ active: activeProductTab === tab }"
              @click="activeProductTab = tab"
            >
              {{ tab }}
            </button>
          </div>
          <button
            class="portal-btn-text"
            type="button"
            @click="go('/service/product')"
          >
            全部 >
          </button>
        </div>
      </div>

      <div class="portal-product-grid home-product-grid">
        <article
          v-for="item in hotProducts"
          :key="item.id"
          class="portal-product-card home-product-card"
          @click="go(`/service/product/${item.id}`)"
        >
          <div class="portal-product-img">{{ item.icon }}</div>
          <div class="portal-product-body">
            <h4>{{ item.name }}</h4>
            <div class="portal-product-tags">
              <span class="portal-product-tag">{{ item.type }}</span>
              <span class="portal-product-tag">{{ item.region }}</span>
            </div>
            <p class="home-product-meta">
              {{ item.green }} · {{ item.usage }}
            </p>
            <p>{{ item.desc }}</p>
            <div class="home-product-foot">
              <span class="home-product-price">{{ item.price }}</span>
              <button
                class="home-try-btn"
                type="button"
                @click.stop="go(`/service/product/${item.id}`)"
              >
                立即试用
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 业务服务 -->
    <section class="portal-section alt home-biz-service">
      <div class="portal-section-tag">BUSINESS SERVICE</div>
      <h2 class="portal-section-title">业务服务</h2>
      <p class="portal-section-subtitle">
        业务服务，仅展示介绍，不支持点击跳转
      </p>
      <div class="home-biz-service-grid">
        <article
          v-for="item in businessServices"
          :key="item.title"
          class="home-biz-service-card"
        >
          <div class="home-biz-service-visual">
            <span>{{ item.icon }}</span>
          </div>
          <div class="home-biz-service-body">
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- 计算说明 -->
    <section class="portal-section">
      <div class="portal-section-tag">BILLING GUIDE</div>
      <h2 class="portal-section-title">计算说明</h2>
      <p class="portal-section-subtitle">计费透明、账单可核、绿电可溯</p>
      <div class="home-billing-grid">
        <article
          v-for="item in billingCards"
          :key="item.title"
          class="home-billing-card"
        >
          <div class="home-billing-icon">{{ item.icon }}</div>
          <h3>{{ item.title }}</h3>
          <ul>
            <li v-for="point in item.points" :key="point">{{ point }}</li>
          </ul>
        </article>
      </div>
      <div class="home-center-cta">
        <button
          class="portal-btn-cta-primary"
          type="button"
          @click="go('/service/product')"
        >
          完整计算说明
        </button>
      </div>
    </section>

    <!-- 行业资讯 + 业态分布 -->
    <section class="portal-section alt">
      <div class="home-split">
        <div class="home-news">
          <div class="home-split-head">
            <h3>行业资讯</h3>
            <button
              class="portal-btn-text"
              type="button"
              @click="go('/service/case')"
            >
              更多 >
            </button>
          </div>
          <article
            v-for="item in newsItems"
            :key="item.title"
            class="home-news-item"
          >
            <div class="home-news-date">
              <strong>{{ item.date }}</strong>
              <span>{{ item.year }}</span>
            </div>
            <div class="home-news-main">
              <h4>{{ item.title }}</h4>
              <p>{{ item.summary }}</p>
            </div>
            <div class="home-news-thumb" aria-hidden="true">📰</div>
          </article>
        </div>

        <div class="home-dist">
          <div class="home-split-head">
            <h3>业态分布</h3>
          </div>
          <div class="home-dist-grid">
            <div v-for="tile in bizTiles" :key="tile" class="home-dist-tile">
              {{ tile }}
            </div>
          </div>
          <button
            class="home-dist-cta"
            type="button"
            @click="go('/service/enterprise/supply')"
          >
            我有算力资源，请进入 >>
          </button>
          <div class="home-dist-hint">
            <span v-for="n in bizHint" :key="n.title">{{
              n.shortName ?? n.title
            }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 合作案例 -->
    <section class="portal-section home-coop">
      <div class="portal-section-tag">CASES</div>
      <h2 class="portal-section-title">合作案例</h2>
      <p class="portal-section-subtitle">电碳算协同落地实践</p>
      <div class="home-coop-grid">
        <article
          v-for="item in coopCases"
          :key="item.id"
          class="home-coop-card"
          @click="go('/service/case')"
        >
          <div class="home-coop-top">
            <span class="home-coop-icon">{{ item.cover }}</span>
            <h3>{{ item.title }}</h3>
          </div>
          <p>{{ item.desc }}</p>
          <button class="portal-btn-text" type="button">
            了解更多产品案例 >>
          </button>
        </article>
      </div>
    </section>

    <!-- 关于我们 -->
    <section class="portal-section alt">
      <div class="portal-about-section home-about">
        <div class="portal-about-text">
          <h3>关于我们</h3>
          <p>
            电碳算协同运营平台由南方电网电算科技数字工程（广东）有限公司建设运营，是落实国家“东数西算”战略、服务全国一体化算力网的重要抓手。
          </p>
          <p>
            平台依托南方五省区完善的电力调度与市场交易体系、充足的绿色电力资源及全量电力数据资产，为算力需求方和供给方提供普惠易用、绿色安全的算力服务。
          </p>
          <button
            class="portal-btn-cta-primary"
            type="button"
            @click="go('/service/case')"
          >
            立即了解 →
          </button>
        </div>
        <div class="portal-about-visual">⚡🍃</div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-block-head {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto 28px;
}

.portal-section > .portal-section-tag {
  display: table;
  margin-right: auto;
  margin-left: auto;
}

.home-title-left {
  margin-bottom: 0;
  text-align: left;
}

.home-head-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.home-filter-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--portal-gray-100, #f5f6fa);
  border-radius: 999px;
}

.home-filter-tab {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--portal-gray-500);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 999px;
}

.home-filter-tab.active {
  color: var(--portal-primary);
  background: var(--portal-surface, #fff);
  box-shadow: 0 2px 8px rgba(107, 76, 255, 0.12);
}

.home-product-grid {
  max-width: 1200px;
  margin: 0 auto;
  grid-template-columns: repeat(3, 1fr);
}

.home-product-card {
  display: flex;
  flex-direction: column;
}

.home-product-meta {
  margin: 8px 0 6px;
  font-size: 12px;
  color: var(--portal-gray-400, #9aa3b5);
}

.home-product-foot {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
}

.home-product-price {
  font-size: 16px;
  font-weight: 800;
  color: var(--portal-primary);
}

.home-try-btn {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: var(--portal-green, #00c853);
  border: 0;
  border-radius: 8px;
}

.home-biz-service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.home-biz-service-card {
  overflow: hidden;
  background: var(--portal-surface, #fff);
  border: 1px solid var(--portal-gray-200);
  border-radius: var(--portal-radius-lg, 16px);
  box-shadow: 0 8px 24px rgba(31, 36, 48, 0.04);
}

.home-biz-service-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  font-size: 56px;
  background:
    radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.2),
      transparent 45%
    ),
    linear-gradient(135deg, var(--portal-primary), #4a2fcc 55%, #2f6bff);
}

.home-biz-service-body {
  padding: 20px 22px 24px;
}

.home-biz-service-body h3 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 750;
  color: var(--portal-gray-900);
}

.home-biz-service-body p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--portal-gray-500);
}

.home-billing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto 28px;
}

.home-billing-card {
  padding: 28px 24px;
  background: var(--portal-surface, #fff);
  border: 1px solid var(--portal-gray-200);
  border-top: 3px solid var(--portal-primary);
  border-radius: var(--portal-radius-lg, 16px);
}

.home-billing-icon {
  margin-bottom: 14px;
  font-size: 32px;
}

.home-billing-card h3 {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 750;
  color: var(--portal-gray-900);
}

.home-billing-card ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.home-billing-card li {
  position: relative;
  padding-left: 14px;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--portal-gray-500);
}

.home-billing-card li::before {
  position: absolute;
  top: 8px;
  left: 0;
  width: 6px;
  height: 6px;
  content: '';
  background: var(--portal-primary);
  border-radius: 50%;
}

.home-center-cta {
  display: flex;
  justify-content: center;
}

.home-split {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 28px;
  max-width: 1200px;
  margin: 0 auto;
}

.home-split-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.home-split-head h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--portal-gray-900);
}

.home-news-item {
  display: grid;
  grid-template-columns: 64px 1fr 56px;
  gap: 14px;
  align-items: start;
  padding: 16px 0;
  border-bottom: 1px solid var(--portal-gray-100, #eef0f5);
}

.home-news-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.home-news-date strong {
  font-size: 18px;
  font-weight: 800;
  color: var(--portal-primary);
}

.home-news-date span {
  font-size: 12px;
  color: var(--portal-gray-400, #9aa3b5);
}

.home-news-main h4 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: var(--portal-gray-900);
}

.home-news-main p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--portal-gray-500);
}

.home-news-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  font-size: 22px;
  background: var(--portal-primary-bg, #f0edff);
  border-radius: 10px;
}

.home-dist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.home-dist-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--portal-primary), #4a2fcc);
  border-radius: 12px;
}

.home-dist-cta {
  width: 100%;
  height: 44px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(90deg, #00c853, #2f6bff);
  border: 0;
  border-radius: 12px;
}

.home-dist-hint {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.home-dist-hint span {
  padding: 4px 10px;
  font-size: 12px;
  color: var(--portal-primary);
  background: var(--portal-primary-bg, #f0edff);
  border-radius: 999px;
}

.home-coop {
  background:
    radial-gradient(
      circle at 10% 20%,
      rgba(107, 76, 255, 0.08),
      transparent 40%
    ),
    radial-gradient(
      circle at 90% 80%,
      rgba(0, 200, 83, 0.08),
      transparent 40%
    ),
    #fff;
}

.home-coop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.home-coop-card {
  padding: 24px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(107, 76, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(31, 36, 48, 0.06);
  backdrop-filter: blur(8px);
  transition: transform 0.2s;
}

.home-coop-card:hover {
  transform: translateY(-3px);
}

.home-coop-top {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.home-coop-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 18px;
  background: var(--portal-primary-bg, #f0edff);
  border-radius: 10px;
}

.home-coop-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  color: var(--portal-gray-900);
}

.home-coop-card p {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--portal-gray-500);
}

.home-about {
  padding: 28px;
  background: var(--portal-surface, #fff);
  border: 1px solid var(--portal-gray-200);
  border-radius: 20px;
  box-shadow: 0 10px 28px rgba(31, 36, 48, 0.05);
}

@media (max-width: 1100px) {
  .home-product-grid,
  .home-biz-service-grid,
  .home-billing-grid,
  .home-coop-grid,
  .home-split {
    grid-template-columns: 1fr;
  }

  .home-block-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .home-title-left {
    text-align: left;
  }

  .home-dist-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .home-product-grid {
    grid-template-columns: 1fr;
  }

  .home-news-item {
    grid-template-columns: 56px 1fr;
  }

  .home-news-thumb {
    display: none;
  }

  .home-dist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
