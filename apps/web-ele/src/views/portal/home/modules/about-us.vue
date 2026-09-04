<script lang="ts" setup>
import type { PortalAboutUs } from '#/types/portal/home/about';

import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { getPortalAboutUsApi } from '#/api/portal/home/about';

import ScrollReveal from '../components/scroll-reveal.vue';
import { normalizeAboutList } from '../data';
import { createCardReveal } from '../motion';

/**
 * 门户首页「关于我们」（对接 GET /portal/about-us）
 * 字段：aboutId / title / content / imageUrl / sortOrder
 */
defineOptions({ name: 'PortalHomeAboutUs' });

/** 列表加载中 */
const loading = ref(true);
/** 可展示条目 */
const aboutList = ref<PortalAboutUs[]>([]);

/**
 * 图文块滚动错落入场配置
 * @param index 下标
 */
function cardMotion(index: number) {
  return createCardReveal(index, 140);
}

/**
 * 拉取并归一化关于我们列表
 */
async function fetchAbout() {
  loading.value = true;
  try {
    const data = await getPortalAboutUsApi();
    aboutList.value = normalizeAboutList(data);
  } catch {
    aboutList.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 是否有配图
 * @param imageUrl 图片地址
 * @returns 有图返回 true
 */
function hasImage(imageUrl?: string): boolean {
  return !isEmpty(imageUrl?.trim());
}

onMounted(fetchAbout);
</script>

<template>
  <section class="home-about portal-section alt">
    <ScrollReveal>
      <div class="portal-section-tag">
        {{ $t('page.portal.home.about.tag') }}
      </div>
      <h2 class="portal-section-title">
        {{ $t('page.portal.home.about.title') }}
      </h2>
      <p class="portal-section-subtitle">
        {{ $t('page.portal.home.about.subtitle') }}
      </p>
    </ScrollReveal>

    <div v-if="loading" class="home-about__state" aria-busy="true">
      <span class="home-about__spinner"></span>
      <p>{{ $t('page.portal.home.about.loading') }}</p>
    </div>

    <div v-else-if="aboutList.length > 0" class="home-about__list">
      <article
        v-for="(item, index) in aboutList"
        :key="item.aboutId"
        v-motion="cardMotion(index)"
        class="home-about__block"
        :class="{ 'home-about__block--reverse': index % 2 === 1 }"
      >
        <div
          class="home-about__media"
          :class="{ 'home-about__media--empty': !hasImage(item.imageUrl) }"
        >
          <img
            v-if="hasImage(item.imageUrl)"
            :src="item.imageUrl"
            :alt="item.title"
            loading="lazy"
          />
          <span v-else class="home-about__media-fallback" aria-hidden="true">
            {{ item.title.slice(0, 1) }}
          </span>
        </div>
        <div class="home-about__copy">
          <h3 class="home-about__name">{{ item.title }}</h3>
          <p v-if="item.content" class="home-about__content">
            {{ item.content }}
          </p>
        </div>
      </article>
    </div>

    <div v-else class="home-about__state">
      <p>{{ $t('page.portal.home.about.empty') }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-about {
  &__list {
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-width: 1100px;
    margin: 0 auto;
  }

  &__block {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: 36px;
    align-items: center;
    padding: 24px;
    background: var(--portal-surface, #fff);
    border: 1px solid var(--portal-gray-200);
    border-radius: 20px;
    box-shadow: 0 10px 28px rgb(31 36 48 / 5%);

    &--reverse {
      .home-about__media {
        order: 2;
      }

      .home-about__copy {
        order: 1;
      }
    }
  }

  &__media {
    height: 240px;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 30% 30%,
        rgb(255 255 255 / 22%),
        transparent 45%
      ),
      linear-gradient(135deg, var(--portal-primary), #4a2fcc 55%, #2f6bff);
    border-radius: 14px;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__media-fallback {
    font-size: 56px;
    font-weight: 750;
    color: rgb(255 255 255 / 92%);
  }

  &__copy {
    padding-right: 8px;
  }

  &__name {
    margin: 0 0 14px;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.35;
    color: var(--portal-gray-900);
  }

  &__content {
    margin: 0;
    font-size: 14px;
    line-height: 1.85;
    color: var(--portal-gray-500);
    white-space: pre-wrap;
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
    animation: home-about-spin 0.9s linear infinite;
  }
}

@keyframes home-about-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .home-about {
    &__block,
    &__block--reverse {
      grid-template-columns: 1fr;
      gap: 18px;
      padding: 18px;

      .home-about__media,
      .home-about__copy {
        order: initial;
      }
    }

    &__media {
      height: 180px;
    }

    &__name {
      font-size: 18px;
    }
  }
}
</style>
