<script lang="ts" setup>
import type { ProductInfo } from '#/types/service/product';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { getProductDetailApi } from '#/api/service/product';

import { parseProductRouteId } from '../data';
import InfoCard from './modules/info-card.vue';
import OverviewCard from './modules/overview-card.vue';

/**
 * 门户服务 · 产品详情（对接 GET /product/{id}）
 */
defineOptions({ name: 'ServiceProductDetail' });

const route = useRoute();
const router = useRouter();

/** 详情加载中 */
const loading = ref(false);
/** 加载失败 / 无数据 */
const loadError = ref(false);
/** 产品详情 */
const product = ref<null | ProductInfo>(null);

/** 路由中的产品 ID */
const productId = computed(() => parseProductRouteId(route.params.id));

/**
 * 返回产品列表
 */
function goBack() {
  router.push('/service/product');
}

/**
 * 拉取产品详情
 */
async function fetchDetail() {
  if (Number.isNaN(productId.value)) {
    product.value = null;
    loadError.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  loadError.value = false;
  try {
    const data = await getProductDetailApi(productId.value);
    product.value = data ?? null;
    if (!data?.productId) {
      loadError.value = true;
    }
  } catch {
    product.value = null;
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void fetchDetail();
});

watch(productId, () => {
  void fetchDetail();
});
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div class="mine-shell__inner">
        <header class="mine-shell__head">
          <div>
            <p class="mine-shell__eyebrow">
              {{ $t('page.service.product.detail.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.product.detail.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.product.detail.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button class="mine-shell__action-btn" @click="goBack">
              {{ $t('page.service.product.detail.back') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :loading="loading"
              @click="fetchDetail"
            >
              {{ $t('page.service.product.refresh') }}
            </el-button>
          </div>
        </header>

        <div v-loading="loading">
          <el-card
            v-if="loading && !product"
            shadow="never"
            class="product-detail__state"
          >
            <el-skeleton animated :rows="6" />
          </el-card>

          <el-card
            v-else-if="loadError || !product"
            shadow="never"
            class="product-detail__state"
          >
            <el-empty :description="$t('page.service.product.detail.empty')">
              <el-button type="primary" @click="goBack">
                {{ $t('page.service.product.detail.back') }}
              </el-button>
            </el-empty>
          </el-card>

          <template v-else>
            <OverviewCard :product="product" />
            <InfoCard :product="product" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';

.product-detail {
  &__state {
    min-height: 240px;

    :deep(.el-card__body) {
      padding: 32px 24px;
    }
  }
}
</style>
