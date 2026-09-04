<script lang="ts" setup>
import type { PortalNews } from '#/types/portal/home/news';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { getPortalNewsDetailApi } from '#/api/portal/home/news';

import { formatNewsDateTime } from '../../home/data';

/**
 * 门户行业资讯详情（公开页，无侧栏；通常由首页新窗口打开）
 */
defineOptions({ name: 'PortalNewsDetail' });

const route = useRoute();

/** 详情加载中 */
const loading = ref(true);
/** 加载失败 */
const loadError = ref(false);
/** 资讯详情 */
const detail = ref<null | PortalNews>(null);

/** 路由中的资讯 ID */
const newsId = computed(() => {
  const raw = route.params.id;
  const id = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isFinite(id) && id > 0 ? id : Number.NaN;
});

/**
 * 是否有封面图
 * @param coverImage 封面地址
 * @returns 有图返回 true
 */
function hasCover(coverImage?: string): boolean {
  return !isEmpty(coverImage?.trim());
}

/**
 * 正文是否像 HTML（含标签）
 * @param content 正文
 * @returns 像 HTML 返回 true
 */
function isHtmlContent(content?: string): boolean {
  return !!content && /<\/?[a-z][\s\S]*>/i.test(content);
}

/**
 * 拉取资讯详情
 */
async function fetchDetail() {
  if (Number.isNaN(newsId.value)) {
    detail.value = null;
    loadError.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  loadError.value = false;
  try {
    const data = await getPortalNewsDetailApi(newsId.value);
    detail.value = data ?? null;
    if (!data?.newsId) {
      loadError.value = true;
    }
  } catch {
    detail.value = null;
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchDetail);
watch(newsId, fetchDetail);
</script>

<template>
  <div class="news-detail">
    <div class="news-detail__shell">
      <div v-if="loading" class="news-detail__state" aria-busy="true">
        <span class="news-detail__spinner"></span>
        <p>{{ $t('page.portal.news.detail.loading') }}</p>
      </div>

      <div v-else-if="loadError || !detail" class="news-detail__state">
        <p>{{ $t('page.portal.news.detail.empty') }}</p>
      </div>

      <article v-else class="news-detail__article">
        <header class="news-detail__header">
          <p class="news-detail__eyebrow">
            {{ $t('page.portal.news.detail.eyebrow') }}
          </p>
          <h1 class="news-detail__title">{{ detail.title }}</h1>
          <div class="news-detail__meta">
            <span v-if="detail.publishTime">
              {{ formatNewsDateTime(detail.publishTime) }}
            </span>
            <span v-if="detail.viewCount != null">
              {{
                $t('page.portal.news.detail.views', [String(detail.viewCount)])
              }}
            </span>
          </div>
        </header>

        <div
          v-if="hasCover(detail.coverImage)"
          class="news-detail__cover"
        >
          <img :src="detail.coverImage" :alt="detail.title" />
        </div>

        <p v-if="detail.summary" class="news-detail__summary">
          {{ detail.summary }}
        </p>

        <div
          v-if="detail.content && isHtmlContent(detail.content)"
          class="news-detail__content"
          v-html="detail.content"
        ></div>
        <div
          v-else-if="detail.content"
          class="news-detail__content news-detail__content--plain"
        >
          {{ detail.content }}
        </div>
        <p v-else class="news-detail__empty-body">
          {{ $t('page.portal.news.detail.noContent') }}
        </p>
      </article>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.news-detail {
  min-height: calc(100vh - var(--portal-header-height, 50px));
  padding: 32px 20px 64px;
  background:
    radial-gradient(
      ellipse 70% 40% at 10% 0%,
      rgb(107 76 255 / 8%),
      transparent 55%
    ),
    radial-gradient(
      ellipse 50% 35% at 90% 10%,
      rgb(47 107 255 / 6%),
      transparent 50%
    ),
    var(--portal-bg, #f8f9fc);

  &__shell {
    max-width: 860px;
    margin: 0 auto;
  }

  &__state {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    justify-content: center;
    min-height: 320px;
    color: var(--portal-gray-500);

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  &__spinner {
    width: 40px;
    height: 40px;
    border: 2px solid var(--portal-gray-200);
    border-top-color: var(--portal-primary);
    border-radius: 50%;
    animation: news-detail-spin 0.9s linear infinite;
  }

  &__article {
    padding: 36px 40px 48px;
    background: var(--portal-surface, #fff);
    border: 1px solid var(--portal-gray-200);
    border-radius: 20px;
    box-shadow: 0 12px 36px rgb(31 36 48 / 6%);
  }

  &__header {
    margin-bottom: 28px;
  }

  &__eyebrow {
    margin: 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--portal-primary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__title {
    margin: 0 0 16px;
    font-size: clamp(26px, 3.2vw, 34px);
    font-weight: 800;
    line-height: 1.35;
    color: var(--portal-gray-900);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 13px;
    color: var(--portal-gray-400, #9aa3b5);
  }

  &__cover {
    margin-bottom: 28px;
    overflow: hidden;
    border-radius: 14px;

    img {
      display: block;
      width: 100%;
      max-height: 420px;
      object-fit: cover;
    }
  }

  &__summary {
    padding: 14px 16px;
    margin: 0 0 28px;
    font-size: 15px;
    line-height: 1.7;
    color: var(--portal-gray-600, #5b6475);
    background: var(--portal-primary-bg, #f0edff);
    border-left: 3px solid var(--portal-primary);
    border-radius: 0 10px 10px 0;
  }

  &__content {
    font-size: 15px;
    line-height: 1.85;
    color: var(--portal-gray-700, #3d4656);

    :deep(p) {
      margin: 0 0 1em;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
    }

    :deep(h2),
    :deep(h3) {
      margin: 1.4em 0 0.6em;
      color: var(--portal-gray-900);
    }

    &--plain {
      white-space: pre-wrap;
    }
  }

  &__empty-body {
    margin: 0;
    font-size: 14px;
    color: var(--portal-gray-400);
  }
}

@keyframes news-detail-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .news-detail {
    padding: 20px 12px 48px;

    &__article {
      padding: 24px 18px 32px;
    }
  }
}
</style>
