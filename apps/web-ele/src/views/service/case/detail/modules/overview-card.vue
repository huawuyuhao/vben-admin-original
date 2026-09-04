<script lang="ts" setup>
import type { CaseInfo } from '#/types/service/case';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  CASE_TYPE_GENERAL,
  CASE_TYPE_SMART,
  formatCaseViewCount,
  hasCaseCover,
  normalizeCaseTags,
} from '../../data';

defineOptions({ name: 'ServiceCaseDetailOverview' });

const props = withDefaults(
  defineProps<{
    /** 当前选中的关联筛选标签 */
    activeTag?: string;
    /** 案例详情 */
    caseItem: CaseInfo;
  }>(),
  {
    activeTag: '',
  },
);

const emit = defineEmits<{
  /** 点击标签，用于筛选关联案例 */
  tagSelect: [tag: string];
}>();

/** 标签列表 */
const tags = computed(() => normalizeCaseTags(props.caseItem.tags));

/** 案例类型文案 */
const typeText = computed(() => {
  const type = Number(props.caseItem.caseType);
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
  const type = Number(props.caseItem.caseType);
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
    formatCaseViewCount(props.caseItem.viewCount) ||
    $t('page.service.case.viewPending'),
);

/**
 * 点击标签筛选关联案例
 * @param tag 标签名
 */
function handleTagClick(tag: string) {
  emit('tagSelect', tag);
}
</script>

<template>
  <el-card class="case-overview" shadow="never">
    <div class="case-overview__layout">
      <div
        class="case-overview__cover"
        :class="{
          'case-overview__cover--empty': !hasCaseCover(caseItem.coverImage),
        }"
      >
        <el-image
          v-if="hasCaseCover(caseItem.coverImage)"
          class="case-overview__img"
          :src="caseItem.coverImage"
          fit="cover"
          :preview-src-list="[caseItem.coverImage!]"
          preview-teleported
        />
        <span v-else class="case-overview__letter" aria-hidden="true">
          {{ caseItem.title.slice(0, 1) }}
        </span>
      </div>

      <div class="case-overview__main">
        <div class="case-overview__title-row">
          <h3>{{ caseItem.title }}</h3>
          <el-tag
            v-if="typeText"
            :type="typeTagType"
            effect="plain"
            round
          >
            {{ typeText }}
          </el-tag>
        </div>

        <p v-if="caseItem.summary" class="case-overview__summary">
          {{ caseItem.summary }}
        </p>

        <div v-if="tags.length" class="case-overview__tags">
          <el-tag
            v-for="tag in tags"
            :key="tag"
            class="case-overview__tag"
            :effect="activeTag === tag ? 'dark' : 'plain'"
            :type="activeTag === tag ? 'success' : 'info'"
            round
            size="small"
            @click="handleTagClick(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>

        <div class="case-overview__stats">
          <div class="case-overview__stat">
            <span class="case-overview__stat-label">
              {{ $t('page.service.case.fields.viewCount') }}
            </span>
            <span class="case-overview__stat-accent">{{ viewText }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.case-overview {
  margin-bottom: 16px;

  &__layout {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }

  &__cover {
    width: 100%;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary) / 12%),
      hsl(190deg 90% 66% / 18%) 55%,
      hsl(var(--primary) / 8%)
    );
    border-radius: 12px;

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
    color: hsl(var(--primary));
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 22px;
      font-weight: 750;
      line-height: 1.35;
      color: hsl(var(--foreground));
    }
  }

  &__summary {
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: hsl(var(--muted-foreground));
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__tag {
    cursor: pointer;
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 4px;
  }

  &__stat {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__stat-label {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  &__stat-accent {
    font-size: 15px;
    font-weight: 700;
    color: hsl(var(--primary));
  }
}

@media (max-width: 768px) {
  .case-overview {
    &__layout {
      grid-template-columns: 1fr;
    }
  }
}
</style>
