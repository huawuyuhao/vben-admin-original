<script lang="ts" setup>
import type { CaseInfo } from '#/types/service/case';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  CASE_TYPE_GENERAL,
  CASE_TYPE_SMART,
  formatCaseViewCount,
  hasCaseCover,
} from '../../data';

defineOptions({ name: 'ServiceCaseRelatedCard' });

const props = defineProps<{
  /** 案例条目 */
  item: CaseInfo;
}>();

const emit = defineEmits<{
  /** 查看详情 */
  detail: [item: CaseInfo];
}>();

/** 类型文案 */
const typeText = computed(() => {
  const type = Number(props.item.caseType);
  if (type === CASE_TYPE_GENERAL) {
    return $t('page.service.case.type.general');
  }
  if (type === CASE_TYPE_SMART) {
    return $t('page.service.case.type.smart');
  }
  return '';
});

/** 类型标签样式 */
const typeTagType = computed(() => {
  const type = Number(props.item.caseType);
  if (type === CASE_TYPE_SMART) {
    return 'warning';
  }
  if (type === CASE_TYPE_GENERAL) {
    return 'success';
  }
  return 'info';
});

/** 浏览量文案 */
const viewText = computed(
  () =>
    formatCaseViewCount(props.item.viewCount) ||
    $t('page.service.case.viewPending'),
);

/**
 * 触发详情
 */
function handleDetail() {
  emit('detail', props.item);
}
</script>

<template>
  <el-card
    class="case-related-card"
    shadow="hover"
    :body-style="{ padding: '0' }"
    @click="handleDetail"
  >
    <div
      class="case-related-card__cover"
      :class="{
        'case-related-card__cover--empty': !hasCaseCover(item.coverImage),
      }"
    >
      <el-image
        v-if="hasCaseCover(item.coverImage)"
        class="case-related-card__img"
        :src="item.coverImage"
        fit="cover"
        lazy
      />
      <span v-else class="case-related-card__letter" aria-hidden="true">
        {{ item.title.slice(0, 1) }}
      </span>
      <el-tag
        v-if="typeText"
        class="case-related-card__type"
        :type="typeTagType"
        effect="dark"
        round
        size="small"
      >
        {{ typeText }}
      </el-tag>
    </div>
    <div class="case-related-card__body">
      <h5 class="case-related-card__name" :title="item.title">
        {{ item.title }}
      </h5>
      <p v-if="item.summary" class="case-related-card__summary">
        {{ item.summary }}
      </p>
      <div class="case-related-card__meta">
        <span>{{ $t('page.service.case.fields.viewCount') }}</span>
        <strong>{{ viewText }}</strong>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.case-related-card {
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &__cover {
    position: relative;
    height: 120px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary) / 12%),
      hsl(190deg 90% 66% / 18%) 55%,
      hsl(var(--primary) / 8%)
    );

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
    font-size: 28px;
    font-weight: 750;
    color: hsl(var(--primary));
  }

  &__type {
    position: absolute;
    top: 8px;
    left: 8px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  }

  &__name {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.4;
    white-space: nowrap;
  }

  &__summary {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    font-size: 12px;
    line-height: 1.55;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
  }

  &__meta {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: hsl(var(--muted-foreground));

    strong {
      font-weight: 700;
      color: hsl(var(--primary));
    }
  }
}
</style>
