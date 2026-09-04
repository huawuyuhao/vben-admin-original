<script lang="ts" setup>
import type { PortalBanner } from '#/types/portal/home/banner';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { getPortalBannersApi } from '#/api/portal/home/banner';
import { ensureLoggedIn } from '#/store/common';

import {
  BANNER_INTERVAL_MS,
  hasBannerLink,
  isExternalBannerLink,
  normalizeBannerList,
} from '../data';
import { createHeroEnter } from '../motion';

/**
 * 门户首页轮播图（对接 GET /portal/banners）
 */
defineOptions({ name: 'PortalHomeBannerCarousel' });

const router = useRouter();

/** 列表加载中 */
const loading = ref(true);
/** 可展示的轮播列表 */
const banners = ref<PortalBanner[]>([]);
/** 首屏入场动画 */
const heroMotion = createHeroEnter();

/**
 * 拉取并归一化轮播列表
 */
async function fetchBanners() {
  loading.value = true;
  try {
    const data = await getPortalBannersApi();
    banners.value = normalizeBannerList(data);
  } catch {
    banners.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 点击轮播：有 linkUrl 时外链新开，站内 path 走登录校验后跳转
 * @param item 当前轮播项
 */
function onBannerClick(item: PortalBanner) {
  const link = item.linkUrl?.trim() ?? '';
  if (!hasBannerLink(link) || isEmpty(link)) {
    return;
  }

  if (isExternalBannerLink(link)) {
    window.open(link, '_blank', 'noopener,noreferrer');
    return;
  }

  if (!ensureLoggedIn(link)) {
    return;
  }
  router.push(link);
}

onMounted(fetchBanners);
</script>

<template>
  <section
    v-motion="heroMotion"
    class="home-banner"
    :aria-label="$t('page.portal.home.banner.slideLabel')"
  >
    <div v-if="loading" class="home-banner__skeleton" aria-busy="true">
      <span class="home-banner__skeleton-pulse"></span>
      <p class="home-banner__hint">{{ $t('page.portal.home.banner.loading') }}</p>
    </div>

    <el-carousel
      v-else-if="banners.length > 0"
      class="home-banner__carousel"
      height="100%"
      :interval="BANNER_INTERVAL_MS"
      arrow="hover"
    >
      <el-carousel-item
        v-for="item in banners"
        :key="item.bannerId"
        class="home-banner__item"
      >
        <button
          type="button"
          class="home-banner__slide"
          :class="{ 'home-banner__slide--link': hasBannerLink(item.linkUrl) }"
          :aria-label="item.title || $t('page.portal.home.banner.slideLabel')"
          @click="onBannerClick(item)"
        >
          <img
            class="home-banner__image"
            :src="item.imageUrl"
            :alt="item.title || $t('page.portal.home.banner.slideLabel')"
            loading="lazy"
          />
          <div class="home-banner__mask" aria-hidden="true"></div>
          <div v-if="item.title" class="home-banner__caption">
            <h2 class="home-banner__title">{{ item.title }}</h2>
            <span
              v-if="hasBannerLink(item.linkUrl)"
              class="home-banner__cta"
            >
              {{ $t('page.portal.home.banner.learnMore') }}
            </span>
          </div>
        </button>
      </el-carousel-item>
    </el-carousel>

    <div v-else class="home-banner__empty">
      <p>{{ $t('page.portal.home.banner.empty') }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-banner {
  position: relative;
  width: 100%;
  height: clamp(420px, 58vh, 560px);
  min-height: 420px;
  overflow: hidden;
  background:
    radial-gradient(
      ellipse 80% 60% at 20% 40%,
      rgb(47 107 255 / 18%),
      transparent 55%
    ),
    radial-gradient(
      ellipse 70% 50% at 85% 70%,
      rgb(0 200 83 / 12%),
      transparent 50%
    ),
    linear-gradient(160deg, #0b1220 0%, #152238 48%, #0f1a2e 100%);

  &__carousel {
    width: 100%;
    height: 100%;

    :deep(.el-carousel__container) {
      height: 100%;
    }

    :deep(.el-carousel__arrow) {
      width: 44px;
      height: 44px;
      font-size: 18px;
      color: #fff;
      background: rgb(15 26 46 / 55%);
      border: 1px solid rgb(255 255 255 / 18%);

      &:hover {
        background: rgb(15 26 46 / 78%);
      }
    }

    :deep(.el-carousel__indicators--horizontal) {
      bottom: 22px;
    }

    :deep(.el-carousel__button) {
      width: 28px;
      height: 3px;
      background: rgb(255 255 255 / 45%);
      border-radius: 2px;
      opacity: 1;
    }

    :deep(.el-carousel__indicator.is-active .el-carousel__button) {
      background: #fff;
    }
  }

  &__item {
    height: 100%;
  }

  &__slide {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
    cursor: default;
    outline: none;
    background: transparent;
    border: 0;

    &--link {
      cursor: pointer;
    }
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__mask {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(
        90deg,
        rgb(8 14 28 / 72%) 0%,
        rgb(8 14 28 / 28%) 42%,
        rgb(8 14 28 / 8%) 68%,
        transparent 100%
      ),
      linear-gradient(
        0deg,
        rgb(8 14 28 / 55%) 0%,
        transparent 42%
      );
  }

  &__caption {
    position: absolute;
    right: auto;
    bottom: 72px;
    left: clamp(24px, 6vw, 80px);
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    max-width: min(560px, 78vw);
    text-align: left;
  }

  &__title {
    margin: 0;
    font-size: clamp(28px, 3.6vw, 44px);
    font-weight: 750;
    line-height: 1.25;
    color: #fff;
    letter-spacing: 0.02em;
    text-shadow: 0 8px 28px rgb(0 0 0 / 35%);
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 18px;
    font-size: 14px;
    font-weight: 650;
    color: #0f1a2e;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 10px 28px rgb(0 0 0 / 18%);
  }

  &__skeleton,
  &__empty {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__skeleton-pulse {
    width: 72px;
    height: 72px;
    border: 2px solid rgb(255 255 255 / 18%);
    border-top-color: rgb(255 255 255 / 75%);
    border-radius: 50%;
    animation: home-banner-spin 0.9s linear infinite;
  }

  &__hint,
  &__empty p {
    margin: 0;
    font-size: 14px;
    color: rgb(255 255 255 / 72%);
  }
}

@keyframes home-banner-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .home-banner {
    height: clamp(320px, 52vh, 420px);
    min-height: 320px;

    &__caption {
      bottom: 56px;
      left: 20px;
      max-width: calc(100% - 40px);
    }

    &__title {
      font-size: 24px;
    }

    &__cta {
      height: 36px;
      padding: 0 14px;
      font-size: 13px;
    }

    &__carousel {
      :deep(.el-carousel__arrow) {
        display: none;
      }
    }
  }
}
</style>
