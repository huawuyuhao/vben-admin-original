<script lang="ts" setup>
import type { ProductImageItem } from '#/types/service/product/order';

import { computed, onMounted, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { getProductImageListApi } from '#/api/service/product/order';

import {
  BANDWIDTH_MAX,
  BANDWIDTH_MIN,
} from '../data';

const props = defineProps<{
  /** 网络带宽 Mbps */
  networkBandwidth: number;
  /** 已选镜像 ID */
  imageId?: null | number;
  /** 地域 */
  region?: string;
}>();

const emit = defineEmits<{
  'update:imageId': [null | number];
  'update:networkBandwidth': [number];
  'update:region': [string];
  'image-change': [null | ProductImageItem];
}>();

const loading = ref(false);
/** 镜像类型筛选：空=全部 */
const imageTypeFilter = ref<'' | number>('');
const images = ref<ProductImageItem[]>([]);

/** 按操作系统类型分组 */
const osGroups = computed(() => {
  const map = new Map<string, ProductImageItem[]>();
  for (const item of images.value) {
    const key = item.osType?.trim() || $t('page.service.product.order.network.osOther');
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()].map(([osType, list]) => ({ osType, list }));
});

/** 当前选中镜像 */
const selectedImage = computed(
  () => images.value.find((item) => item.imageId === props.imageId) ?? null,
);

/**
 * 拉取镜像列表
 */
async function fetchImages() {
  loading.value = true;
  try {
    const type =
      imageTypeFilter.value === '' ? undefined : Number(imageTypeFilter.value);
    const data = await getProductImageListApi(type);
    images.value = Array.isArray(data) ? data : [];
  } catch {
    images.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 选择镜像
 * @param item 镜像
 */
function selectImage(item: ProductImageItem) {
  emit('update:imageId', item.imageId);
  emit('image-change', item);
}

/**
 * 镜像类型文案
 * @param type 类型码
 */
function imageTypeLabel(type?: number) {
  if (type === 1) return $t('page.service.product.order.network.imageTypePublic');
  if (type === 2) return $t('page.service.product.order.network.imageTypePrivate');
  if (type === 3) return $t('page.service.product.order.network.imageTypeCloud');
  return $t('page.service.product.order.network.imageTypeUnknown');
}

watch(imageTypeFilter, () => {
  void fetchImages();
});

onMounted(() => {
  void fetchImages();
});

defineExpose({ selectedImage, fetchImages });
</script>

<template>
  <div class="order-network" v-loading="loading">
    <el-card class="order-network__card" shadow="never">
      <template #header>
        <div class="order-network__card-head">
          <h3>{{ $t('page.service.product.order.network.imageTitle') }}</h3>
          <p>{{ $t('page.service.product.order.network.imageDesc') }}</p>
        </div>
      </template>

      <div class="order-network__type-tabs">
        <el-radio-group v-model="imageTypeFilter">
          <el-radio-button :value="''">
            {{ $t('page.service.product.order.network.imageTypeAll') }}
          </el-radio-button>
          <el-radio-button :value="1">
            {{ $t('page.service.product.order.network.imageTypePublic') }}
          </el-radio-button>
          <el-radio-button :value="2">
            {{ $t('page.service.product.order.network.imageTypePrivate') }}
          </el-radio-button>
          <el-radio-button :value="3">
            {{ $t('page.service.product.order.network.imageTypeCloud') }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <el-empty
        v-if="!loading && images.length === 0"
        :description="$t('page.service.product.order.network.imageEmpty')"
      />

      <div v-else class="order-network__os-groups">
        <section
          v-for="group in osGroups"
          :key="group.osType"
          class="order-network__os-group"
        >
          <h4 class="order-network__os-title">{{ group.osType }}</h4>
          <div class="order-network__image-grid">
            <button
              v-for="item in group.list"
              :key="item.imageId"
              type="button"
              class="order-network__image-card"
              :class="{
                'order-network__image-card--active': imageId === item.imageId,
              }"
              @click="selectImage(item)"
            >
              <div class="order-network__image-name">
                {{ item.imageName || item.version || `Image #${item.imageId}` }}
              </div>
              <div class="order-network__image-meta">
                <el-tag size="small" effect="plain" round>
                  {{ imageTypeLabel(item.imageType) }}
                </el-tag>
                <span v-if="item.version">{{ item.version }}</span>
                <span v-if="item.imageSize != null">
                  {{ item.imageSize }} GB
                </span>
              </div>
              <p v-if="item.description" class="order-network__image-desc">
                {{ item.description }}
              </p>
            </button>
          </div>
        </section>
      </div>
    </el-card>

    <el-card class="order-network__card" shadow="never">
      <template #header>
        <div class="order-network__card-head">
          <h3>{{ $t('page.service.product.order.network.bandwidthTitle') }}</h3>
          <p>{{ $t('page.service.product.order.network.bandwidthDesc') }}</p>
        </div>
      </template>

      <div class="order-network__bandwidth">
        <el-form label-position="top">
          <el-form-item :label="$t('page.service.product.order.network.region')">
            <el-input
              :model-value="region"
              clearable
              maxlength="64"
              :placeholder="
                $t('page.service.product.order.network.regionPlaceholder')
              "
              @update:model-value="(v: string) => emit('update:region', v)"
            />
          </el-form-item>

          <el-form-item
            :label="$t('page.service.product.order.network.bandwidth')"
          >
            <div class="order-network__slider-row">
              <el-slider
                class="order-network__slider"
                :model-value="networkBandwidth"
                :min="BANDWIDTH_MIN"
                :max="BANDWIDTH_MAX"
                :marks="{
                  1: '1',
                  50: '50',
                  100: '100',
                  200: '200',
                }"
                @update:model-value="
                  (v: number | number[]) =>
                    emit(
                      'update:networkBandwidth',
                      Array.isArray(v) ? Number(v[0]) || BANDWIDTH_MIN : v,
                    )
                "
              />
              <el-input-number
                :model-value="networkBandwidth"
                :min="BANDWIDTH_MIN"
                :max="BANDWIDTH_MAX"
                controls-position="right"
                @update:model-value="
                  (v: number | undefined) =>
                    emit(
                      'update:networkBandwidth',
                      Number(v) || BANDWIDTH_MIN,
                    )
                "
              />
              <span class="order-network__unit">Mbps</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.order-network {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__card {
    border-radius: 14px;

    :deep(.el-card__header) {
      padding: 16px 20px 12px;
    }

    :deep(.el-card__body) {
      padding: 8px 20px 20px;
    }
  }

  &__card-head {
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 650;
      line-height: 1.4;
    }

    p {
      margin: 6px 0 0;
      color: hsl(var(--muted-foreground));
      font-size: 13px;
      line-height: 1.5;
    }
  }

  &__type-tabs {
    margin-bottom: 16px;
  }

  &__os-groups {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__os-title {
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 600;
  }

  &__image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }

  &__image-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    text-align: left;
    cursor: pointer;
    background: hsl(var(--background));
    border: 1px solid var(--el-border-color);
    border-radius: 12px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary-light-5);
    }

    &--active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 1px var(--el-color-primary);
    }
  }

  &__image-name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }

  &__image-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    color: hsl(var(--muted-foreground));
    font-size: 12px;
  }

  &__image-desc {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    color: hsl(var(--muted-foreground));
    font-size: 12px;
    line-height: 1.5;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__slider-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    width: 100%;
  }

  &__slider {
    flex: 1;
    min-width: 200px;
    max-width: 480px;
    margin: 0 12px 18px 0;
  }

  &__unit {
    color: hsl(var(--muted-foreground));
    font-size: 13px;
  }
}
</style>
