<script lang="ts" setup>
import type { PortalSearchResultItem } from '#/types/search';

import { computed } from 'vue';

import { ArrowRight } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

import {
  SEARCH_TYPE_TAG_TYPE,
  searchTypeI18nKey,
} from '../data';

defineOptions({ name: 'PortalSearchResultItem' });

const props = defineProps<{
  /** 搜索结果项 */
  item: PortalSearchResultItem;
}>();

const emit = defineEmits<{
  /** 点击跳转详情 */
  select: [item: PortalSearchResultItem];
}>();

/** 类型标签文案 */
const typeLabel = computed(() =>
  $t(`page.search.type.${searchTypeI18nKey(props.item.type)}`),
);

/** 类型标签色 */
const tagType = computed(
  () => SEARCH_TYPE_TAG_TYPE[props.item.type] ?? 'info',
);

/**
 * 触发选中跳转
 */
function handleSelect() {
  emit('select', props.item);
}
</script>

<template>
  <button class="portal-search-item" type="button" @click="handleSelect">
    <div class="portal-search-item__main">
      <div class="portal-search-item__title-row">
        <el-tag
          class="portal-search-item__tag"
          effect="light"
          size="small"
          :type="tagType"
        >
          {{ typeLabel }}
        </el-tag>
        <span class="portal-search-item__name" :title="item.name">
          {{ item.name }}
        </span>
      </div>
      <p
        v-if="item.description"
        class="portal-search-item__desc"
        :title="item.description"
      >
        {{ item.description }}
      </p>
    </div>
    <el-icon class="portal-search-item__arrow"><ArrowRight /></el-icon>
  </button>
</template>

<style lang="scss" scoped>
.portal-search-item {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  margin: 0;
  overflow: hidden;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 10px;
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;

  &:hover,
  &:focus-visible {
    background: hsl(var(--primary) / 8%);
    outline: none;
  }

  &:hover &__arrow {
    opacity: 1;
    transform: translateX(2px);
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  &__tag {
    flex-shrink: 0;
  }

  &__name {
    overflow: hidden;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    display: -webkit-box;
    margin: 4px 0 0;
    overflow: hidden;
    color: hsl(var(--muted-foreground));
    font-size: 12px;
    line-height: 1.45;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__arrow {
    flex-shrink: 0;
    color: hsl(var(--primary));
    font-size: 14px;
    opacity: 0.35;
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }
}
</style>
