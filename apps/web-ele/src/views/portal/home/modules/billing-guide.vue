<script lang="ts" setup>
import type { PortalBillingInfo } from '#/types/portal/home/billing';

import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';

import { getPortalBillingApi } from '#/api/portal/home/billing';

import ScrollReveal from '../components/scroll-reveal.vue';
import { normalizeBillingList } from '../data';
import { createCardReveal } from '../motion';

/** 带展示要点的计费说明 */
interface BillingCard extends PortalBillingInfo {
  /** 内容按行拆分后的要点 */
  points: string[];
}

/**
 * 门户首页计费说明（对接 GET /portal/billing）
 * 字段：billingId / title / content / sortOrder
 */
defineOptions({ name: 'PortalHomeBillingGuide' });

/** 列表加载中 */
const loading = ref(true);
/** 可展示的计费说明 */
const billings = ref<BillingCard[]>([]);

/**
 * 卡片滚动错落入场配置
 * @param index 卡片下标
 */
function cardMotion(index: number) {
  return createCardReveal(index);
}

/**
 * 将 content 按换行拆成要点；无换行则整段展示
 * @param content 内容
 * @returns 要点列表
 */
function splitContent(content?: string): string[] {
  if (isEmpty(content?.trim())) {
    return [];
  }
  const parts = content!
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [content!.trim()];
}

/**
 * 拉取并归一化计费说明列表
 */
async function fetchBillings() {
  loading.value = true;
  try {
    const data = await getPortalBillingApi();
    billings.value = normalizeBillingList(data).map((item) => ({
      ...item,
      points: splitContent(item.content),
    }));
  } catch {
    billings.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 展示用序号（两位）
 * @param index 从 0 开始的下标
 * @returns 如 01、02
 */
function formatIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

onMounted(fetchBillings);
</script>

<template>
  <section class="home-billing portal-section">
    <ScrollReveal>
      <div class="portal-section-tag">
        {{ $t('page.portal.home.billing.tag') }}
      </div>
      <h2 class="portal-section-title">
        {{ $t('page.portal.home.billing.title') }}
      </h2>
      <p class="portal-section-subtitle">
        {{ $t('page.portal.home.billing.subtitle') }}
      </p>
    </ScrollReveal>

    <div v-if="loading" class="home-billing__state" aria-busy="true">
      <span class="home-billing__spinner"></span>
      <p>{{ $t('page.portal.home.billing.loading') }}</p>
    </div>

    <div v-else-if="billings.length > 0" class="home-billing__grid">
      <article
        v-for="(item, index) in billings"
        :key="item.billingId"
        v-motion="cardMotion(index)"
        class="home-billing__card"
      >
        <div class="home-billing__index" aria-hidden="true">
          {{ formatIndex(index) }}
        </div>
        <h3 class="home-billing__name">{{ item.title }}</h3>
        <ul v-if="item.points.length > 1" class="home-billing__points">
          <li
            v-for="(point, pIndex) in item.points"
            :key="`${item.billingId}-${pIndex}`"
          >
            {{ point }}
          </li>
        </ul>
        <p v-else-if="item.points.length === 1" class="home-billing__content">
          {{ item.points[0] }}
        </p>
      </article>
    </div>

    <div v-else class="home-billing__state">
      <p>{{ $t('page.portal.home.billing.empty') }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-billing {
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 1100px;
    margin: 0 auto;
  }

  &__card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 200px;
    padding: 28px 24px 26px;
    overflow: hidden;
    background: var(--portal-surface, #fff);
    border: 1px solid var(--portal-gray-200);
    border-top: 3px solid var(--portal-primary);
    border-radius: var(--portal-radius-lg, 16px);
    box-shadow: 0 8px 24px rgba(31, 36, 48, 0.04);
  }

  &__index {
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    color: color-mix(in srgb, var(--portal-primary) 22%, transparent);
    letter-spacing: 0.04em;
  }

  &__name {
    margin: 0;
    font-size: 18px;
    font-weight: 750;
    line-height: 1.4;
    color: var(--portal-gray-900);
  }

  &__content {
    margin: 0;
    font-size: 13px;
    line-height: 1.75;
    color: var(--portal-gray-500);
    white-space: pre-wrap;
  }

  &__points {
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      position: relative;
      padding-left: 14px;
      margin-bottom: 8px;
      font-size: 13px;
      line-height: 1.65;
      color: var(--portal-gray-500);

      &::before {
        position: absolute;
        top: 8px;
        left: 0;
        width: 6px;
        height: 6px;
        content: '';
        background: var(--portal-primary);
        border-radius: 50%;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
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
    animation: home-billing-spin 0.9s linear infinite;
  }
}

@keyframes home-billing-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .home-billing {
    &__grid {
      grid-template-columns: 1fr;
      max-width: 560px;
    }
  }
}
</style>
