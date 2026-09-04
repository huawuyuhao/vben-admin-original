<script lang="ts" setup>
import type { PortalProductRecommend } from '#/types/portal/home/product';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { getPortalProductsRecommendApi } from '#/api/portal/home/product';
import { ensureLoggedIn } from '#/store/common';

import ScrollReveal from '../components/scroll-reveal.vue';
import {
  formatGreenPowerRatio,
  formatProductPrice,
  normalizeProductRecommendList,
  splitProductTags,
} from '../data';
import { createCardReveal } from '../motion';

/**
 * 首页推荐产品（对接 GET /portal/products/recommend）
 */
defineOptions({ name: 'PortalHomeProductRecommend' });

const router = useRouter();

/** 列表加载中 */
const loading = ref(true);
/** 推荐产品列表 */
const products = ref<PortalProductRecommend[]>([]);

/**
 * 卡片滚动错落入场配置
 * @param index 卡片下标
 */
function cardMotion(index: number) {
  return createCardReveal(index);
}

/**
 * 拉取并归一化推荐产品
 */
async function fetchProducts() {
  loading.value = true;
  try {
    const data = await getPortalProductsRecommendApi();
    products.value = normalizeProductRecommendList(data);
  } catch {
    products.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 门户内跳转（需登录）
 * @param path 目标路径
 */
function go(path: string) {
  if (!ensureLoggedIn(path)) {
    return;
  }
  router.push(path);
}

/**
 * 进入产品详情
 * @param item 产品
 */
function openProduct(item: PortalProductRecommend) {
  if (!item.productId) {
    return;
  }
  go(`/service/product/${item.productId}`);
}

/**
 * 是否有产品图
 * @param imageUrl 图片地址
 * @returns 有图返回 true
 */
function hasImage(imageUrl?: string): boolean {
  return !isEmpty(imageUrl?.trim());
}

onMounted(fetchProducts);
</script>

<template>
  <section class="home-product portal-section">
    <ScrollReveal>
      <div class="home-product__head">
        <div>
          <div class="portal-section-tag">
            {{ $t('page.portal.home.product.tag') }}
          </div>
          <h2 class="portal-section-title home-product__title">
            {{ $t('page.portal.home.product.title') }}
          </h2>
          <p class="portal-section-subtitle home-product__subtitle">
            {{ $t('page.portal.home.product.subtitle') }}
          </p>
        </div>
        <button
          class="portal-btn-text"
          type="button"
          @click="go('/service/product')"
        >
          {{ $t('page.portal.home.product.viewAll') }}
        </button>
      </div>
    </ScrollReveal>

    <div v-if="loading" class="home-product__state" aria-busy="true">
      <span class="home-product__spinner"></span>
      <p>{{ $t('page.portal.home.product.loading') }}</p>
    </div>

    <div v-else-if="products.length > 0" class="home-product__grid">
      <article
        v-for="(item, index) in products"
        :key="item.productId"
        v-motion="cardMotion(index)"
        class="home-product__card"
        @click="openProduct(item)"
      >
        <div
          class="home-product__cover"
          :class="{ 'home-product__cover--empty': !hasImage(item.imageUrl) }"
        >
          <img
            v-if="hasImage(item.imageUrl)"
            :src="item.imageUrl"
            :alt="item.productName"
            loading="lazy"
          />
          <span v-else aria-hidden="true">{{ item.productName.slice(0, 1) }}</span>
          <span
            v-if="item.recommendLevel != null"
            class="home-product__level"
          >
            {{
              $t('page.portal.home.product.recommendLevel', [
                String(item.recommendLevel),
              ])
            }}
          </span>
        </div>

        <div class="home-product__body">
          <h3 class="home-product__name">{{ item.productName }}</h3>

          <div
            v-if="splitProductTags(item.tags).length > 0"
            class="home-product__tags"
          >
            <span
              v-for="tag in splitProductTags(item.tags)"
              :key="`${item.productId}-${tag}`"
              class="home-product__tag"
            >
              {{ tag }}
            </span>
          </div>

          <p
            v-if="formatGreenPowerRatio(item.greenPowerRatio)"
            class="home-product__green"
          >
            {{
              $t('page.portal.home.product.greenPower', [
                formatGreenPowerRatio(item.greenPowerRatio),
              ])
            }}
          </p>

          <p v-if="item.description" class="home-product__desc">
            {{ item.description }}
          </p>

          <div class="home-product__foot">
            <span class="home-product__price">
              {{
                formatProductPrice(item.price) ||
                $t('page.portal.home.product.pricePending')
              }}
            </span>
            <button
              class="home-product__try"
              type="button"
              @click.stop="openProduct(item)"
            >
              {{ $t('page.portal.home.product.tryNow') }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="home-product__state">
      <p>{{ $t('page.portal.home.product.empty') }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-product {
  &__head {
    display: flex;
    gap: 20px;
    align-items: flex-end;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto 28px;
    text-align: left;
  }

  &__title {
    margin-bottom: 0;
    text-align: left;
  }

  &__subtitle {
    margin-top: 8px;
    margin-bottom: 0;
    text-align: left;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  &__card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    cursor: pointer;
    background: var(--portal-surface, #fff);
    border: 1px solid var(--portal-gray-200);
    border-radius: var(--portal-radius-lg, 16px);
    box-shadow: 0 8px 24px rgb(31 36 48 / 4%);
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;

    &:hover {
      border-color: color-mix(
        in srgb,
        var(--portal-primary) 32%,
        var(--portal-gray-200)
      );
      box-shadow: 0 14px 32px rgb(107 76 255 / 10%);
      transform: translateY(-3px);
    }
  }

  &__cover {
    position: relative;
    height: 160px;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 30% 30%,
        rgb(255 255 255 / 20%),
        transparent 45%
      ),
      linear-gradient(135deg, var(--portal-primary), #4a2fcc 55%, #2f6bff);

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }

    .home-product__card:hover & img {
      transform: scale(1.04);
    }

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 42px;
      font-weight: 750;
      color: rgb(255 255 255 / 92%);
    }
  }

  &__level {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: rgb(15 26 46 / 55%);
    border-radius: 999px;
    backdrop-filter: blur(4px);
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    padding: 18px 18px 20px;
  }

  &__name {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 17px;
    font-weight: 750;
    line-height: 1.4;
    color: var(--portal-gray-900);
    white-space: nowrap;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__tag {
    padding: 2px 8px;
    font-size: 12px;
    color: var(--portal-primary);
    background: var(--portal-primary-bg, #f0edff);
    border-radius: 6px;
  }

  &__green {
    margin: 0;
    font-size: 12px;
    font-weight: 650;
    color: var(--portal-green, #00c853);
  }

  &__desc {
    display: -webkit-box;
    flex: 1;
    margin: 0;
    overflow: hidden;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    font-size: 13px;
    line-height: 1.65;
    color: var(--portal-gray-500);
    -webkit-box-orient: vertical;
  }

  &__foot {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }

  &__price {
    font-size: 18px;
    font-weight: 800;
    color: var(--portal-primary);
  }

  &__try {
    height: 32px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    background: var(--portal-green, #00c853);
    border: 0;
    border-radius: 8px;

    &:hover {
      filter: brightness(1.05);
    }
  }

  &__state {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    color: var(--portal-gray-500);

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  &__spinner {
    width: 36px;
    height: 36px;
    border: 2px solid var(--portal-gray-200);
    border-top-color: var(--portal-primary);
    border-radius: 50%;
    animation: home-product-spin 0.9s linear infinite;
  }
}

@keyframes home-product-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .home-product {
    &__head {
      flex-direction: column;
      align-items: flex-start;
    }

    &__grid {
      grid-template-columns: 1fr;
      max-width: 560px;
    }
  }
}
</style>
