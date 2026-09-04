<script lang="ts" setup>
import type { ModelInfo } from '#/types/service/model';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  canEvaluateModel,
  formatModelCallCount,
  formatModelScore,
  hasModelIcon,
} from '../../data';

defineOptions({ name: 'ServiceModelDetailOverview' });

const props = defineProps<{
  /** 导出中 */
  exporting?: boolean;
  /** 模型详情 */
  model: ModelInfo;
}>();

const emit = defineEmits<{
  /** 打开评价 */
  evaluate: [];
  /** 导出当前模型 */
  export: [];
}>();

/** 评分文案 */
const scoreText = computed(
  () =>
    formatModelScore(props.model.score) ||
    $t('page.service.model.scorePending'),
);

/** 调用量文案 */
const callText = computed(
  () =>
    formatModelCallCount(props.model.callCount) ||
    $t('page.service.model.callPending'),
);
</script>

<template>
  <el-card class="model-overview" shadow="never">
    <div class="model-overview__layout">
      <div
        class="model-overview__cover"
        :class="{
          'model-overview__cover--empty': !hasModelIcon(model.iconUrl),
        }"
      >
        <el-image
          v-if="hasModelIcon(model.iconUrl)"
          class="model-overview__img"
          :src="model.iconUrl"
          fit="cover"
          :preview-src-list="[model.iconUrl!]"
          preview-teleported
        />
        <span v-else class="model-overview__letter" aria-hidden="true">
          {{ model.modelName.slice(0, 1) }}
        </span>
      </div>

      <div class="model-overview__main">
        <div class="model-overview__title-row">
          <h3>{{ model.modelName }}</h3>
        </div>

        <p v-if="model.description" class="model-overview__desc">
          {{ model.description }}
        </p>

        <div class="model-overview__stats">
          <div class="model-overview__stat">
            <span class="model-overview__stat-label">
              {{ $t('page.service.model.fields.score') }}
            </span>
            <div class="model-overview__stat-value">
              <el-rate
                :model-value="Number(model.score) || 0"
                disabled
                allow-half
                :max="5"
              />
              <span>{{ scoreText }}</span>
            </div>
          </div>
          <div class="model-overview__stat">
            <span class="model-overview__stat-label">
              {{ $t('page.service.model.fields.callCount') }}
            </span>
            <span class="model-overview__stat-accent">{{ callText }}</span>
          </div>
        </div>

        <div class="model-overview__bottom">
          <el-button :loading="exporting" @click="emit('export')">
            {{ $t('page.service.model.export.action') }}
          </el-button>
          <el-button
            v-if="canEvaluateModel(model)"
            type="primary"
            @click="emit('evaluate')"
          >
            {{ $t('page.service.model.evaluate.action') }}
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.model-overview {
  margin-bottom: 16px;

  &__layout {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 24px;
    align-items: stretch;
  }

  &__cover {
    position: relative;
    height: 240px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary)),
      hsl(190deg 90% 66%) 55%,
      hsl(var(--primary) / 70%)
    );
    border-radius: calc(var(--el-card-border-radius, 4px) - 2px);

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__img {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__letter {
    font-size: 56px;
    font-weight: 750;
    color: rgb(255 255 255 / 92%);
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  &__title-row {
    h3 {
      margin: 0;
      font-size: 22px;
      font-weight: 750;
      color: hsl(var(--foreground));
    }
  }

  &__desc {
    margin: 0;
    font-size: 14px;
    line-height: 1.75;
    color: hsl(var(--muted-foreground));
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 32px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__stat-label {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__stat-value {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    font-weight: 700;
  }

  &__stat-accent {
    font-size: 22px;
    font-weight: 800;
    color: hsl(var(--primary));
  }

  &__bottom {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: auto;
  }
}

@media (max-width: 900px) {
  .model-overview {
    &__layout {
      grid-template-columns: 1fr;
    }

    &__cover {
      height: 200px;
    }
  }
}
</style>
