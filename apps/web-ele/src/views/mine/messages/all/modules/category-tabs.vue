<script lang="ts" setup>
import type { MessageCategoryTab, MessageTypeFilter } from '../data';

import { $t } from '@vben/locales';

import { getMessageTypeI18nKey } from '../data';

defineOptions({ name: 'MineMessagesCategoryTabs' });

defineProps<{
  /** 分类统计 Tab */
  tabs: MessageCategoryTab[];
}>();

const activeType = defineModel<MessageTypeFilter>('activeType', {
  default: '',
});

/**
 * 解析 Tab 标题
 * @param tab 分类项
 * @returns 展示文案
 */
function resolveTabLabel(tab: MessageCategoryTab) {
  if (!tab.messageType) {
    return $t('page.mine.messages.all.types.all');
  }
  return $t(getMessageTypeI18nKey(tab.messageType));
}
</script>

<template>
  <el-card class="msg-category-tabs" shadow="never">
    <el-radio-group v-model="activeType" class="msg-category-tabs__group">
      <el-radio-button
        v-for="tab in tabs"
        :key="tab.key || 'all'"
        :value="tab.key"
      >
        <span class="msg-category-tabs__label">
          {{ resolveTabLabel(tab) }}
          <span class="msg-category-tabs__count">({{ tab.count }})</span>
          <!-- 未读数：内联 el-badge，写法对齐官方「下拉菜单内标记」示例 -->
          <el-badge
            class="msg-category-tabs__badge"
            :hidden="tab.unreadCount <= 0"
            :max="99"
            :show-zero="false"
            type="danger"
            :value="tab.unreadCount"
          />
        </span>
      </el-radio-button>
    </el-radio-group>
  </el-card>
</template>

<style lang="scss" scoped>
.msg-category-tabs {
  margin-bottom: 12px;

  :deep(.el-card__body) {
    padding: 12px 16px;
    overflow-x: auto;
  }

  &__group {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  }

  &__label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  &__count {
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }

  /* 内联徽章：取消默认右上角绝对定位，贴近图一效果 */
  &__badge {
    display: inline-flex;
    line-height: 1;

    :deep(.el-badge__content) {
      position: static;
      top: auto;
      transform: none;
    }
  }
}
</style>
