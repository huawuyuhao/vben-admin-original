<script lang="ts" setup>
import type { PortalServiceIntro } from '#/types/portal/home/service';

import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { getPortalServicesApi } from '#/api/portal/home/service';

import ScrollReveal from '../components/scroll-reveal.vue';
import { normalizeServiceList } from '../data';
import { createCardReveal } from '../motion';

/**
 * 门户首页业务服务介绍（对接 GET /portal/services，仅展示不跳转）
 */
defineOptions({ name: 'PortalHomeServiceIntro' });

/** 列表加载中 */
const loading = ref(true);
/** 可展示的服务列表 */
const services = ref<PortalServiceIntro[]>([]);

/**
 * 卡片滚动错落入场配置
 * @param index 卡片下标
 */
function cardMotion(index: number) {
  return createCardReveal(index);
}

/**
 * 拉取并归一化业务服务介绍列表
 */
async function fetchServices() {
  loading.value = true;
  try {
    const data = await getPortalServicesApi();
    services.value = normalizeServiceList(data);
  } catch {
    services.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 判断服务是否有封面图
 * @param imageUrl 图片地址
 * @returns 有有效图片时返回 true
 */
function hasCover(imageUrl?: string): boolean {
  return !isEmpty(imageUrl?.trim());
}

onMounted(fetchServices);
</script>

<template>
  <section class="home-service portal-section alt">
    <ScrollReveal>
      <div class="portal-section-tag">
        {{ $t('page.portal.home.service.tag') }}
      </div>
      <h2 class="portal-section-title">
        {{ $t('page.portal.home.service.title') }}
      </h2>
      <p class="portal-section-subtitle">
        {{ $t('page.portal.home.service.subtitle') }}
      </p>
    </ScrollReveal>

    <div v-if="loading" class="home-service__state" aria-busy="true">
      <span class="home-service__spinner"></span>
      <p>{{ $t('page.portal.home.service.loading') }}</p>
    </div>

    <div v-else-if="services.length > 0" class="home-service__grid">
      <article
        v-for="(item, index) in services"
        :key="item.serviceId"
        v-motion="cardMotion(index)"
        class="home-service__card"
      >
        <div
          class="home-service__visual"
          :class="{ 'home-service__visual--empty': !hasCover(item.imageUrl) }"
        >
          <img
            v-if="hasCover(item.imageUrl)"
            class="home-service__image"
            :src="item.imageUrl"
            :alt="item.title"
            loading="lazy"
          />
          <span v-else class="home-service__placeholder" aria-hidden="true">
            {{ item.title.slice(0, 1) }}
          </span>
        </div>
        <div class="home-service__body">
          <h3 class="home-service__name">{{ item.title }}</h3>
          <p v-if="item.content" class="home-service__content">
            {{ item.content }}
          </p>
        </div>
      </article>
    </div>

    <div v-else class="home-service__state">
      <p>{{ $t('page.portal.home.service.empty') }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-service {
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  &__card {
    overflow: hidden;
    background: var(--portal-surface, #fff);
    border: 1px solid var(--portal-gray-200);
    border-radius: var(--portal-radius-lg, 16px);
    box-shadow: 0 8px 24px rgba(31, 36, 48, 0.04);
  }

  &__visual {
    position: relative;
    height: 168px;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.22),
        transparent 45%
      ),
      linear-gradient(135deg, var(--portal-primary), #4a2fcc 55%, #2f6bff);

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__placeholder {
    font-size: 42px;
    font-weight: 750;
    color: rgba(255, 255, 255, 0.92);
    letter-spacing: 0.04em;
  }

  &__body {
    padding: 20px 22px 24px;
  }

  &__name {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 750;
    color: var(--portal-gray-900);
  }

  &__content {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    font-size: 13px;
    line-height: 1.7;
    color: var(--portal-gray-500);
    -webkit-box-orient: vertical;
  }

  &__state {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    min-height: 160px;
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
    animation: home-service-spin 0.9s linear infinite;
  }
}

@keyframes home-service-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .home-service {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
