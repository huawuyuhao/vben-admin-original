<script lang="ts" setup>
import type { CaseListItem } from '#/types/service/case';

import { computed } from 'vue';

import { Delete, Edit } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

import {
  CASE_TYPE_GENERAL,
  CASE_TYPE_SMART,
  formatCaseDateTime,
  formatCaseViewCount,
  hasCaseCover,
  normalizeCaseTags,
} from '../data';

defineOptions({ name: 'ServiceCaseCard' });

const props = defineProps<{
  /** 案例列表条目 */
  item: CaseListItem;
}>();

const emit = defineEmits<{
  /** 查看详情 */
  detail: [item: CaseListItem];
  /** 编辑 */
  edit: [item: CaseListItem];
  /** 删除（Popconfirm 确认后） */
  remove: [item: CaseListItem];
}>();

/** 案例类型文案 */
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

/** 标签列表 */
const tags = computed(() => normalizeCaseTags(props.item.tags));

/** 浏览量文案 */
const viewText = computed(
  () =>
    formatCaseViewCount(props.item.viewCount) ||
    $t('page.service.case.viewPending'),
);

/** 创建时间文案 */
const createText = computed(() => formatCaseDateTime(props.item.createTime));

/** 删除确认文案 */
const deleteConfirmTitle = computed(() =>
  $t('page.service.case.deleteConfirm', [
    props.item.title?.trim() || String(props.item.caseId),
  ]),
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
</script>

<template>
  <el-card
    class="case-card"
    shadow="hover"
    :body-style="{ padding: '0' }"
    @click="handleDetail"
  >
    <div
      class="case-card__cover"
      :class="{ 'case-card__cover--empty': !hasCaseCover(item.coverImage) }"
    >
      <el-image
        v-if="hasCaseCover(item.coverImage)"
        class="case-card__img"
        :src="item.coverImage"
        fit="cover"
        lazy
      />
      <span v-else class="case-card__letter" aria-hidden="true">
        {{ item.title.slice(0, 1) }}
      </span>

      <el-tag
        v-if="typeText"
        class="case-card__type"
        :type="typeTagType"
        effect="dark"
        round
        size="small"
      >
        {{ typeText }}
      </el-tag>
    </div>

    <div class="case-card__body">
      <h3 class="case-card__title" :title="item.title">
        {{ item.title }}
      </h3>

      <p v-if="item.summary" class="case-card__summary">
        {{ item.summary }}
      </p>

      <div v-if="tags.length" class="case-card__tags">
        <el-tag
          v-for="tag in tags"
          :key="tag"
          effect="plain"
          round
          size="small"
        >
          {{ tag }}
        </el-tag>
      </div>

      <div class="case-card__meta">
        <div class="case-card__meta-item">
          <span class="case-card__meta-label">
            {{ $t('page.service.case.fields.viewCount') }}
          </span>
          <span class="case-card__meta-value">{{ viewText }}</span>
        </div>
        <div v-if="createText" class="case-card__meta-item">
          <span class="case-card__meta-label">
            {{ $t('page.service.case.fields.createTime') }}
          </span>
          <span class="case-card__meta-time">{{ createText }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="case-card__foot">
        <el-button size="small" @click.stop="handleDetail">
          {{ $t('page.service.case.viewDetail') }}
        </el-button>
        <el-button
          circle
          plain
          size="small"
          type="primary"
          :title="$t('page.service.case.actions.edit')"
          @click.stop="handleEdit"
        >
          <el-icon><Edit /></el-icon>
        </el-button>
        <el-popconfirm
          :title="deleteConfirmTitle"
          width="240"
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
              :title="$t('page.service.case.actions.delete')"
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
.case-card {
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
    height: 168px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary) / 12%),
      hsl(190 90% 66% / 18%) 55%,
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
    color: hsl(var(--primary));
  }

  &__type {
    position: absolute;
    top: 12px;
    left: 12px;
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
  }

  &__title {
    margin: 0;
    overflow: hidden;
    font-size: 16px;
    font-weight: 750;
    line-height: 1.4;
    color: hsl(var(--foreground));
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__summary {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    font-size: 13px;
    line-height: 1.65;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
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
    color: hsl(var(--primary));
  }

  &__meta-time {
    overflow: hidden;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__foot {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }
}
</style>
