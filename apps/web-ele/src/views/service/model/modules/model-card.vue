<script lang="ts" setup>
import type { ModelInfo } from '#/types/service/model';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  formatModelCallCount,
  formatModelScore,
  hasModelIcon,
} from '../data';

defineOptions({ name: 'ServiceModelCard' });

const props = withDefaults(
  defineProps<{
    /** 是否可选对比 */
    compareChecked?: boolean;
    /** 是否禁用勾选（已达上限且未选中） */
    compareDisabled?: boolean;
    /** 是否勾选导出 */
    exportChecked?: boolean;
    /** 是否处于导出勾选模式 */
    exportSelecting?: boolean;
    /** 模型条目 */
    item: ModelInfo;
  }>(),
  {
    compareChecked: false,
    compareDisabled: false,
    exportChecked: false,
    exportSelecting: false,
  },
);

const emit = defineEmits<{
  /** 对比勾选变化 */
  compareChange: [payload: { checked: boolean; modelId: number }];
  /** 查看详情 */
  detail: [item: ModelInfo];
  /** 打开评价 */
  evaluate: [item: ModelInfo];
  /** 导出勾选变化 */
  exportChange: [payload: { checked: boolean; modelId: number }];
}>();

/** 评分文案 */
const scoreText = computed(
  () =>
    formatModelScore(props.item.score) ||
    $t('page.service.model.scorePending'),
);

/** 调用量文案 */
const callText = computed(
  () =>
    formatModelCallCount(props.item.callCount) ||
    $t('page.service.model.callPending'),
);

/**
 * 触发详情
 */
function handleDetail() {
  emit('detail', props.item);
}

/**
 * 切换对比勾选
 * @param checked 是否勾选
 */
function handleCompareChange(checked: boolean | string | number) {
  emit('compareChange', {
    modelId: props.item.modelId,
    checked: !!checked,
  });
}

/**
 * 切换导出勾选
 * @param checked 是否勾选
 */
function handleExportChange(checked: boolean | string | number) {
  emit('exportChange', {
    modelId: props.item.modelId,
    checked: !!checked,
  });
}

/**
 * 触发评价
 */
function handleEvaluate() {
  emit('evaluate', props.item);
}
</script>

<template>
  <el-card
    class="model-card"
    :class="{ 'model-card--exporting': exportSelecting }"
    shadow="hover"
    :body-style="{ padding: '0' }"
    @click="handleDetail"
  >
    <div class="model-card__head">
      <el-checkbox
        v-if="!exportSelecting"
        class="model-card__check model-card__check--compare"
        :model-value="compareChecked"
        :disabled="compareDisabled && !compareChecked"
        @click.stop
        @change="handleCompareChange"
      >
        {{ $t('page.service.model.compare.select') }}
      </el-checkbox>

      <el-checkbox
        v-else
        class="model-card__check model-card__check--export"
        :model-value="exportChecked"
        @click.stop
        @change="handleExportChange"
      >
        {{ $t('page.service.model.export.select') }}
      </el-checkbox>

      <div
        class="model-card__icon"
        :class="{ 'model-card__icon--empty': !hasModelIcon(item.iconUrl) }"
      >
        <el-image
          v-if="hasModelIcon(item.iconUrl)"
          class="model-card__img"
          :src="item.iconUrl"
          fit="cover"
          lazy
        />
        <span v-else class="model-card__letter" aria-hidden="true">
          {{ item.modelName.slice(0, 1) }}
        </span>
      </div>
    </div>

    <div class="model-card__body">
      <h3 class="model-card__name" :title="item.modelName">
        {{ item.modelName }}
      </h3>

      <p v-if="item.description" class="model-card__desc">
        {{ item.description }}
      </p>

      <div class="model-card__meta">
        <div class="model-card__meta-item">
          <span class="model-card__meta-label">
            {{ $t('page.service.model.fields.score') }}
          </span>
          <el-rate
            :model-value="Number(item.score) || 0"
            disabled
            allow-half
            :max="5"
            size="small"
          />
          <span class="model-card__meta-value">{{ scoreText }}</span>
        </div>
        <div class="model-card__meta-item">
          <span class="model-card__meta-label">
            {{ $t('page.service.model.fields.callCount') }}
          </span>
          <span class="model-card__meta-value model-card__meta-value--accent">
            {{ callText }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="model-card__foot">
        <el-button size="small" @click.stop="handleDetail">
          {{ $t('page.service.model.viewDetail') }}
        </el-button>
        <el-button size="small" type="primary" @click.stop="handleEvaluate">
          {{ $t('page.service.model.evaluate.action') }}
        </el-button>
      </div>
    </template>
  </el-card>
</template>

<style lang="scss" scoped>
.model-card {
  height: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :deep(.el-card__footer) {
    padding: 12px 16px 16px;
    border-top: 1px solid var(--el-card-border-color);
  }

  &__head {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 188px;
    padding: 24px 20px 16px;
    background: linear-gradient(
      145deg,
      hsl(var(--primary) / 12%),
      hsl(190 90% 66% / 18%) 55%,
      hsl(var(--primary) / 8%)
    );
  }

  &__check {
    position: absolute;
    top: 12px;
    z-index: 1;
    height: auto;
    margin: 0;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 999px;

    :deep(.el-checkbox__label) {
      padding-left: 6px;
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }

    &--compare {
      left: 12px;
    }

    &--export {
      right: 12px;
      left: auto;
      background: hsl(var(--primary) / 12%);
      box-shadow: 0 0 0 1px hsl(var(--primary) / 28%);

      :deep(.el-checkbox__label) {
        color: hsl(var(--primary));
        font-weight: 650;
      }
    }
  }

  &--exporting {
    outline: 1px solid hsl(var(--primary) / 22%);
  }

  &__icon {
    width: 120px;
    height: 120px;
    overflow: hidden;
    background: hsl(var(--background));
    border-radius: 22px;
    box-shadow: 0 10px 28px hsl(var(--foreground) / 10%);

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(
        145deg,
        hsl(var(--primary)),
        hsl(190 90% 66%)
      );
    }
  }

  &__img {
    display: block;
    width: 100%;
    height: 100%;

    :deep(img) {
      transition: transform 0.35s ease;
    }
  }

  &:hover &__img :deep(img) {
    transform: scale(1.05);
  }

  &__letter {
    font-size: 42px;
    font-weight: 750;
    color: rgba(255, 255, 255, 0.94);
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
  }

  &__name {
    margin: 0;
    overflow: hidden;
    font-size: 16px;
    font-weight: 750;
    line-height: 1.4;
    color: hsl(var(--foreground));
    text-overflow: ellipsis;
    white-space: nowrap;
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
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
  }

  &__meta-item {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  &__meta-label {
    flex-shrink: 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__meta-value {
    font-size: 13px;
    font-weight: 700;
    color: hsl(var(--foreground));

    &--accent {
      color: hsl(var(--primary));
    }
  }

  &__foot {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }
}
</style>
