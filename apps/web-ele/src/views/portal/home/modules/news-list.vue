<script lang="ts" setup>
import type { PortalNews } from '#/types/portal/home/news';

import { computed, onMounted, ref } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { getPortalNewsPageApi } from '#/api/portal/home/news';

import ScrollReveal from '../components/scroll-reveal.vue';
import {
  formatNewsDateTime,
  hasNewsNextPage,
  NEWS_PAGE_SIZE,
  normalizeNewsList,
  openNewsDetailWindow,
} from '../data';
import { createCardReveal, createSectionReveal } from '../motion';

/**
 * 首页行业资讯（全宽三列卡片，每页 3 条）
 * 字段：title / summary / coverImage / publishTime / viewCount
 */
defineOptions({ name: 'PortalHomeNewsList' });

/** 当前页码 */
const page = ref(1);
/** 列表加载中 */
const loading = ref(false);
/** 当前页资讯（已过滤） */
const newsList = ref<PortalNews[]>([]);
/** 接口原始返回条数（用于判断是否还有下一页） */
const rawCount = ref(0);
/** 分页器入场 */
const pagerMotion = createSectionReveal(120);

/**
 * 卡片滚动错落入场配置
 * @param index 卡片下标
 */
function cardMotion(index: number) {
  return createCardReveal(index);
}

/** 是否可点下一页 */
const canNext = computed(() =>
  hasNewsNextPage(NEWS_PAGE_SIZE, rawCount.value),
);

/** 是否可点上一页 */
const canPrev = computed(() => page.value > 1);

/**
 * 拉取指定页资讯
 * @param targetPage 目标页码
 */
async function fetchNews(targetPage: number) {
  loading.value = true;
  try {
    const data = await getPortalNewsPageApi({
      page: targetPage,
      pageSize: NEWS_PAGE_SIZE,
    });
    const list = Array.isArray(data) ? data : [];
    rawCount.value = list.length;
    newsList.value = normalizeNewsList(list);
    page.value = targetPage;
  } catch {
    rawCount.value = 0;
    newsList.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 上一页
 */
function goPrev() {
  if (!canPrev.value || loading.value) {
    return;
  }
  void fetchNews(page.value - 1);
}

/**
 * 下一页
 */
function goNext() {
  if (!canNext.value || loading.value) {
    return;
  }
  void fetchNews(page.value + 1);
}

/**
 * 打开资讯详情新窗口
 * @param item 资讯项
 */
function openDetail(item: PortalNews) {
  if (!item.newsId) {
    return;
  }
  openNewsDetailWindow(item.newsId);
}

/**
 * 是否有封面图
 * @param coverImage 封面地址
 * @returns 有图返回 true
 */
function hasCover(coverImage?: string): boolean {
  return !isEmpty(coverImage?.trim());
}

onMounted(() => {
  void fetchNews(1);
});
</script>

<template>
  <section class="home-news portal-section alt">
    <ScrollReveal>
      <div class="portal-section-tag">
        {{ $t('page.portal.home.news.tag') }}
      </div>
      <h2 class="portal-section-title">
        {{ $t('page.portal.home.news.title') }}
      </h2>
      <p class="portal-section-subtitle">
        {{ $t('page.portal.home.news.subtitle') }}
      </p>
    </ScrollReveal>

    <div v-if="loading && newsList.length === 0" class="home-news__state">
      <p>{{ $t('page.portal.home.news.loading') }}</p>
    </div>

    <template v-else-if="newsList.length > 0">
      <div class="home-news__grid">
        <article
          v-for="(item, index) in newsList"
          :key="item.newsId"
          v-motion="cardMotion(index)"
          class="home-news__card"
          role="link"
          tabindex="0"
          @click="openDetail(item)"
          @keydown.enter.prevent="openDetail(item)"
        >
          <div class="home-news__cover">
            <img
              v-if="hasCover(item.coverImage)"
              :src="item.coverImage"
              :alt="item.title"
              loading="lazy"
            />
            <span v-else class="home-news__cover-fallback" aria-hidden="true">
              📰
            </span>
          </div>
          <div class="home-news__body">
            <h3 class="home-news__title">{{ item.title }}</h3>
            <p v-if="item.summary" class="home-news__summary">
              {{ item.summary }}
            </p>
            <div class="home-news__meta">
              <time
                v-if="formatNewsDateTime(item.publishTime)"
                :datetime="item.publishTime"
              >
                {{ formatNewsDateTime(item.publishTime) }}
              </time>
              <span v-if="item.viewCount != null">
                {{
                  $t('page.portal.news.detail.views', [
                    String(item.viewCount),
                  ])
                }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <div
        v-motion="pagerMotion"
        class="home-news__pager"
      >
        <button
          type="button"
          class="home-news__page-btn"
          :disabled="!canPrev || loading"
          @click="goPrev"
        >
          {{ $t('page.portal.home.news.prev') }}
        </button>
        <span class="home-news__page-no">{{ page }}</span>
        <button
          type="button"
          class="home-news__page-btn home-news__page-btn--primary"
          :disabled="!canNext || loading"
          @click="goNext"
        >
          {{ $t('page.portal.home.news.next') }}
        </button>
      </div>
    </template>

    <div v-else class="home-news__state">
      <p>{{ $t('page.portal.home.news.empty') }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-news {
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
    max-width: 1200px;
    margin: 0 auto;
  }

  &__card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    cursor: pointer;
    outline: none;
    background: var(--portal-surface, #fff);
    border: 1px solid var(--portal-gray-200);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgb(31 36 48 / 4%);
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;

    &:hover,
    &:focus-visible {
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
    height: 168px;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 30% 30%,
        rgb(255 255 255 / 22%),
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

    .home-news__card:hover & img {
      transform: scale(1.04);
    }
  }

  &__cover-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 42px;
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    padding: 18px 18px 20px;
  }

  &__title {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 17px;
    font-weight: 750;
    line-height: 1.4;
    color: var(--portal-gray-900);
    white-space: nowrap;
  }

  &__summary {
    display: -webkit-box;
    flex: 1;
    margin: 0;
    overflow: hidden;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    font-size: 13px;
    line-height: 1.7;
    color: var(--portal-gray-500);
    -webkit-box-orient: vertical;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 4px;
    font-size: 12px;
    color: var(--portal-gray-400, #9aa3b5);
  }

  &__pager {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    margin-top: 28px;
  }

  &__page-no {
    min-width: 24px;
    font-size: 14px;
    font-weight: 700;
    color: var(--portal-gray-500);
    text-align: center;
  }

  &__page-btn {
    height: 34px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 650;
    color: var(--portal-gray-600, #5b6475);
    cursor: pointer;
    background: var(--portal-surface, #fff);
    border: 1px solid var(--portal-gray-200);
    border-radius: 10px;
    transition:
      color 0.15s ease,
      border-color 0.15s ease,
      background 0.15s ease;

    &:hover:not(:disabled) {
      color: var(--portal-primary);
      border-color: color-mix(
        in srgb,
        var(--portal-primary) 40%,
        var(--portal-gray-200)
      );
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    &--primary {
      color: #fff;
      background: var(--portal-primary);
      border-color: var(--portal-primary);

      &:hover:not(:disabled) {
        color: #fff;
        filter: brightness(1.05);
      }
    }
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    color: var(--portal-gray-500);

    p {
      margin: 0;
      font-size: 14px;
    }
  }
}

@media (max-width: 1100px) {
  .home-news {
    &__grid {
      grid-template-columns: 1fr;
      max-width: 560px;
    }
  }
}
</style>
