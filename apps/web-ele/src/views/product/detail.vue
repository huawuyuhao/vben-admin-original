<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getProductById } from '#/views/_shared/data/products';

const route = useRoute();
const router = useRouter();

const activeTab = ref<'showcase' | 'models' | 'reviews'>('showcase');
const liked = ref(false);
const toast = ref('');

const product = computed(() => {
  const id = String(route.params.id || '');
  return getProductById(id);
});

watch(
  () => route.params.id,
  () => {
    activeTab.value = 'showcase';
    liked.value = false;
  },
);

function goBack() {
  router.push('/service/product');
}

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}

function toggleLike() {
  liked.value = !liked.value;
  showToast(liked.value ? '已加入收藏' : '已取消收藏');
}

function useSku(name: string) {
  showToast(`已选择规格：${name}（示例）`);
}

function starText(rating: number) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return `${'★'.repeat(full)}${'☆'.repeat(empty)}`;
}
</script>

<template>
  <div class="portal-inner-page product-detail-page">
    <div class="detail-top">
      <h2>产品详情</h2>
      <button
        class="portal-btn portal-btn-primary portal-btn-sm"
        type="button"
        @click="goBack"
      >
        返回列表
      </button>
    </div>

    <div v-if="!product" class="portal-empty">
      未找到该产品
      <button
        class="portal-btn portal-btn-outline portal-btn-sm"
        type="button"
        style="margin-left: 12px"
        @click="goBack"
      >
        返回列表
      </button>
    </div>

    <template v-else>
      <section class="overview-card">
        <div class="overview-cover">{{ product.icon }}</div>
        <div class="overview-main">
          <div class="overview-title-row">
            <h3>{{ product.name }}</h3>
            <button
              class="like-btn"
              type="button"
              :class="{ active: liked }"
              :aria-label="liked ? '取消收藏' : '收藏'"
              @click="toggleLike"
            >
              {{ liked ? '♥' : '♡' }}
            </button>
          </div>
          <div class="overview-meta">
            <span class="meta-rating">
              <i>{{ starText(product.rating) }}</i>
              {{ product.rating.toFixed(1) }} 评分
            </span>
            <span>{{ product.usage }}</span>
            <span>收藏 {{ product.favorites }}次</span>
            <span
              v-for="tag in product.tags"
              :key="tag"
              class="meta-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </section>

      <section class="desc-block">
        <p>
          <strong>产品名称：</strong>
          {{ product.name }}
        </p>
        <p>
          <strong>产品描述：</strong>
          {{ product.fullDesc }}
        </p>
      </section>

      <div class="detail-tabs">
        <button
          type="button"
          :class="{ active: activeTab === 'showcase' }"
          @click="activeTab = 'showcase'"
        >
          产品展示
        </button>
        <button
          type="button"
          :class="{ active: activeTab === 'models' }"
          @click="activeTab = 'models'"
        >
          模型信息
        </button>
        <button
          type="button"
          :class="{ active: activeTab === 'reviews' }"
          @click="activeTab = 'reviews'"
        >
          用户评价
        </button>
      </div>

      <section v-if="activeTab === 'showcase'" class="sku-grid">
        <article v-for="sku in product.skus" :key="sku.id" class="sku-card">
          <div class="sku-head">
            <div>
              <div class="sku-title">{{ sku.title }}</div>
              <div class="sku-sub">{{ sku.subtitle }}</div>
            </div>
            <span class="sku-badge">{{ sku.badge }}</span>
          </div>
          <ul class="sku-specs">
            <li>
              <span>💾</span>
              <em>{{ sku.vram }}</em>
            </li>
            <li>
              <span>🧠</span>
              <em>{{ sku.cpu }}</em>
            </li>
            <li>
              <span>📦</span>
              <em>{{ sku.memory }}</em>
            </li>
          </ul>
          <div class="sku-price">
            <strong>{{ sku.priceHour }} / 小时</strong>
            <small>{{ sku.priceSecond }}</small>
            <div class="sku-bill">~ 按秒计费</div>
          </div>
          <button
            class="sku-cta"
            type="button"
            @click="useSku(`${sku.title} ${sku.subtitle}`)"
          >
            🚀 立即使用
          </button>
        </article>
      </section>

      <section v-else-if="activeTab === 'models'" class="info-panel">
        <div v-if="product.models.length === 0" class="panel-empty">
          该产品暂无关联模型信息
        </div>
        <div
          v-for="model in product.models"
          :key="model.name"
          class="info-row"
        >
          <div class="info-name">{{ model.name }}</div>
          <div class="info-meta">
            <span>{{ model.vendor }}</span>
            <span>{{ model.type }}</span>
            <span>上下文 {{ model.context }}</span>
          </div>
          <p>{{ model.note }}</p>
        </div>
      </section>

      <section v-else class="info-panel">
        <div
          v-for="review in product.reviews"
          :key="`${review.user}-${review.time}`"
          class="review-row"
        >
          <div class="review-head">
            <strong>{{ review.user }}</strong>
            <span class="review-stars">{{ starText(review.rating) }}</span>
            <span class="review-time">{{ review.time }}</span>
          </div>
          <p>{{ review.content }}</p>
        </div>
      </section>
    </template>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.product-detail-page {
  --pd-radius: 12px;
}

.detail-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.detail-top h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.overview-card {
  display: flex;
  gap: 18px;
  padding: 20px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: var(--pd-radius);
}

.overview-cover {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  font-size: 52px;
  background: linear-gradient(
    135deg,
    var(--portal-primary-bg, #f0edff),
    #e8f8ef
  );
  border-radius: 14px;
}

.overview-main {
  flex: 1;
  min-width: 0;
}

.overview-title-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.overview-title-row h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--portal-gray-900, #212121);
}

.like-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 20px;
  color: var(--portal-gray-400, #bdbdbd);
  cursor: pointer;
  background: var(--portal-gray-50, #fafafa);
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: 50%;
}

.like-btn.active {
  color: #e53935;
  background: #fff5f5;
  border-color: #ffcdd2;
}

.overview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
  font-size: 13px;
  color: var(--portal-gray-600, #757575);
}

.meta-rating i {
  margin-right: 4px;
  font-style: normal;
  color: #f5a623;
}

.meta-tag {
  padding: 2px 8px;
  font-size: 12px;
  color: var(--portal-gray-600, #757575);
  background: var(--portal-gray-100, #f5f5f5);
  border-radius: 999px;
}

.desc-block {
  padding: 16px 18px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: var(--pd-radius);
}

.desc-block p {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--portal-gray-700, #616161);
}

.desc-block p:last-child {
  margin-bottom: 0;
}

.desc-block strong {
  color: var(--portal-gray-900, #212121);
}

.detail-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--portal-gray-200, #eee);
}

.detail-tabs button {
  position: relative;
  height: 42px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--portal-gray-600, #757575);
  cursor: pointer;
  background: transparent;
  border: none;
}

.detail-tabs button.active {
  color: var(--portal-primary, #6b4cff);
}

.detail-tabs button.active::after {
  position: absolute;
  right: 12px;
  bottom: -1px;
  left: 12px;
  height: 2px;
  content: '';
  background: var(--portal-primary, #6b4cff);
  border-radius: 2px;
}

.sku-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.sku-card {
  display: flex;
  flex-direction: column;
  padding: 18px;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: var(--pd-radius);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.sku-card:hover {
  border-color: color-mix(in srgb, var(--portal-primary, #6b4cff) 35%, #fff);
  box-shadow: 0 10px 28px rgb(107 76 255 / 8%);
}

.sku-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.sku-title {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--portal-gray-900, #212121);
}

.sku-sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--portal-gray-500, #9e9e9e);
}

.sku-badge {
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #1b8a4a;
  background: #e8f8ef;
  border-radius: 999px;
}

.sku-specs {
  padding: 0;
  margin: 0 0 16px;
  list-style: none;
}

.sku-specs li {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--portal-gray-700, #616161);
}

.sku-specs em {
  font-style: normal;
}

.sku-price {
  margin-top: auto;
  margin-bottom: 12px;
}

.sku-price strong {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #1b8a4a;
}

.sku-price small {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.sku-bill {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #1b8a4a;
}

.sku-cta {
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #2bb673, #1b8a4a);
  border: none;
  border-radius: 999px;
}

.sku-cta:hover {
  filter: brightness(1.05);
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row,
.review-row {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid var(--portal-gray-200, #eee);
  border-radius: var(--pd-radius);
}

.info-name {
  margin-bottom: 6px;
  font-size: 16px;
  font-weight: 700;
}

.info-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.info-row p,
.review-row p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--portal-gray-700, #616161);
}

.review-head {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.review-stars {
  color: #f5a623;
}

.review-time {
  margin-left: auto;
  font-size: 12px;
  color: var(--portal-gray-500, #9e9e9e);
}

.panel-empty,
.portal-empty {
  padding: 40px 16px;
  font-size: 14px;
  color: var(--portal-gray-500, #9e9e9e);
  text-align: center;
  background: #fff;
  border: 1px dashed var(--portal-gray-300, #e0e0e0);
  border-radius: var(--pd-radius);
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
}

@media (max-width: 1100px) {
  .sku-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .overview-card {
    flex-direction: column;
  }

  .overview-cover {
    width: 100%;
    height: 140px;
  }

  .sku-grid {
    grid-template-columns: 1fr;
  }
}
</style>
