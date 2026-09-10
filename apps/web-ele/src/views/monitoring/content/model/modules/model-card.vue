<script lang="ts" setup>
import type { AdminModelServiceItem } from '#/types/monitoring/content/model';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import { Delete, Edit } from '@element-plus/icons-vue';

import {
  formatAdminModelCount,
  formatAdminModelScore,
  hasAdminModelIcon,
  resolveAdminModelStatusLabelKey,
  resolveAdminModelStatusTagType,
} from '../data';

defineOptions({ name: 'AdminModelServiceCard' });

const props = defineProps<{
  /** 模型条目 */
  item: AdminModelServiceItem;
}>();

const emit = defineEmits<{
  /** 查看详情 */
  detail: [item: AdminModelServiceItem];
  /** 编辑 */
  edit: [item: AdminModelServiceItem];
  /** 删除 */
  remove: [item: AdminModelServiceItem];
  /** 打开评价 */
  evaluate: [item: AdminModelServiceItem];
}>();

/** 展示名称 */
const displayName = computed(
  () => props.item.modelName?.trim() || String(props.item.modelId ?? ''),
);

/** 评分文案 */
const scoreText = computed(
  () =>
    formatAdminModelScore(props.item.score) ||
    $t('page.monitoring.content.model.scorePending'),
);

/** 调用量文案 */
const callText = computed(
  () =>
    formatAdminModelCount(props.item.callCount) ||
    $t('page.monitoring.content.model.callPending'),
);

/** 收藏数文案 */
const collectText = computed(
  () => formatAdminModelCount(props.item.collectCount) || '—',
);

/** 启停 Tag 类型 */
const statusTagType = computed(() =>
  resolveAdminModelStatusTagType(props.item.status),
);

/** 启停文案键 */
const statusLabelKey = computed(() =>
  resolveAdminModelStatusLabelKey(props.item.status),
);

/**
 * 触发详情
 */
function handleDetail() {
  emit('detail', props.item);
}

/**
 * 触发编辑
 */
function handleEdit() {
  emit('edit', props.item);
}

/**
 * 触发删除
 */
function handleRemove() {
  emit('remove', props.item);
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
    shadow="hover"
    :body-style="{ padding: '0' }"
    @click="handleDetail"
  >
    <div
      class="model-card__cover"
      :class="{ 'model-card__cover--empty': !hasAdminModelIcon(item.iconUrl) }"
    >
      <el-image
        v-if="hasAdminModelIcon(item.iconUrl)"
        class="model-card__img"
        :src="item.iconUrl"
        fit="cover"
        lazy
      />
      <span v-else class="model-card__letter" aria-hidden="true">
        {{ displayName.slice(0, 1) }}
      </span>

      <el-tag
        class="model-card__status"
        :type="statusTagType"
        effect="dark"
        round
        size="small"
      >
        {{ $t(`page.monitoring.content.model.status.${statusLabelKey}`) }}
      </el-tag>
    </div>

    <div class="model-card__body">
      <div class="model-card__headline">
        <h3 class="model-card__name" :title="displayName">
          {{ displayName }}
        </h3>
        <el-tag
          v-if="item.modelCategory"
          size="small"
          type="info"
          effect="plain"
          round
        >
          {{ item.modelCategory }}
        </el-tag>
      </div>

      <div v-if="item.sceneTag" class="model-card__tags">
        <el-tag size="small" type="info" effect="plain" round>
          {{ item.sceneTag }}
        </el-tag>
      </div>

      <p v-if="item.description" class="model-card__desc">
        {{ item.description }}
      </p>

      <div class="model-card__meta">
        <div class="model-card__meta-item">
          <span class="model-card__meta-label">
            {{ $t('page.monitoring.content.model.fields.score') }}
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
            {{ $t('page.monitoring.content.model.fields.callCount') }}
          </span>
          <span class="model-card__meta-value model-card__meta-value--accent">
            {{ callText }}
          </span>
        </div>
        <div class="model-card__meta-item">
          <span class="model-card__meta-label">
            {{ $t('page.monitoring.content.model.fields.collectCount') }}
          </span>
          <span class="model-card__meta-value">{{ collectText }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="model-card__foot">
        <el-button size="small" @click.stop="handleDetail">
          {{ $t('page.monitoring.content.model.viewDetail') }}
        </el-button>
        <el-button size="small" type="primary" @click.stop="handleEvaluate">
          {{ $t('page.monitoring.content.model.eval.cardAction') }}
        </el-button>
        <el-button
          circle
          plain
          size="small"
          type="primary"
          :title="$t('page.monitoring.content.model.actions.edit')"
          @click.stop="handleEdit"
        >
          <el-icon><Edit /></el-icon>
        </el-button>
        <el-popconfirm
          :title="
            $t('page.monitoring.content.model.deleteConfirm', [displayName])
          "
          width="260"
          :confirm-button-text="$t('common.confirm')"
          :cancel-button-text="$t('common.cancel')"
          confirm-button-type="danger"
          @confirm="handleRemove"
        >
          <template #reference>
            <el-button
              circle
              plain
              size="small"
              type="danger"
              :title="$t('page.monitoring.content.model.actions.delete')"
              @click.stop
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-popconfirm>
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

  &__cover {
    position: relative;
    height: 152px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary)),
      hsl(250deg 100% 76%) 55%,
      hsl(190deg 90% 66%)
    );

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__status {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;
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
    transform: scale(1.04);
  }

  &__letter {
    font-size: 40px;
    font-weight: 750;
    color: rgb(255 255 255 / 92%);
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
  }

  &__headline {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__name {
    flex: 1;
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: 750;
    line-height: 1.4;
    color: hsl(var(--foreground));
    white-space: nowrap;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
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
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
