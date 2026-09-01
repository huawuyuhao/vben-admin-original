<script lang="ts" setup>
import type { MessageReadFilter } from '../data';

import { Delete, Check } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

defineOptions({ name: 'MineMessagesFilterBar' });

const readStatus = defineModel<MessageReadFilter>('readStatus', {
  default: '',
});

defineProps<{
  /** 已选条数 */
  selectedCount: number;
  /** 批量操作进行中 */
  acting?: boolean;
}>();

const emit = defineEmits<{
  /** 已读筛选变化 */
  search: [];
  /** 标记已读 */
  markRead: [];
  /** 删除 */
  remove: [];
}>();

/**
 * 已读筛选变更后触发查询
 */
function handleReadChange() {
  emit('search');
}
</script>

<template>
  <el-card class="msg-filter-bar" shadow="never">
    <div class="msg-filter-bar__row">
      <div class="msg-filter-bar__left">
        <span class="msg-filter-bar__label">
          {{ $t('page.mine.messages.all.filter.readStatus') }}
        </span>
        <el-radio-group
          v-model="readStatus"
          size="default"
          @change="handleReadChange"
        >
          <el-radio-button value="">
            {{ $t('page.mine.messages.all.filter.readAll') }}
          </el-radio-button>
          <el-radio-button value="0">
            {{ $t('page.mine.messages.all.filter.unread') }}
          </el-radio-button>
          <el-radio-button value="1">
            {{ $t('page.mine.messages.all.filter.read') }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="msg-filter-bar__actions">
        <span v-if="selectedCount > 0" class="msg-filter-bar__selected">
          {{
            $t('page.mine.messages.all.selectedCount', [String(selectedCount)])
          }}
        </span>
        <el-button
          :disabled="selectedCount === 0 || acting"
          :icon="Check"
          :loading="acting"
          @click="emit('markRead')"
        >
          {{ $t('page.mine.messages.all.actions.markRead') }}
        </el-button>
        <el-button
          :disabled="selectedCount === 0 || acting"
          :icon="Delete"
          :loading="acting"
          type="danger"
          plain
          @click="emit('remove')"
        >
          {{ $t('page.mine.messages.all.actions.delete') }}
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.msg-filter-bar {
  margin-bottom: 12px;

  :deep(.el-card__body) {
    padding: 12px 16px;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    justify-content: space-between;
  }

  &__left {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  &__label {
    color: hsl(var(--foreground));
    font-size: 13px;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__selected {
    margin-right: 4px;
    color: hsl(var(--muted-foreground));
    font-size: 13px;
  }
}
</style>
