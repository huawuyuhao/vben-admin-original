<script lang="ts" setup>
import { Download, Search } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

defineOptions({ name: 'ServiceModelFilterBar' });

/** 关键词（与父级 v-model:keyword 同步） */
const keyword = defineModel<string>('keyword', { default: '' });

const emit = defineEmits<{
  /** 点击对比 */
  compare: [];
  /** 进入导出勾选 / 确认导出 */
  export: [];
  /** 取消导出勾选 */
  exportCancel: [];
  /** 本页全选导出 */
  exportSelectAll: [];
  /** 点击刷新 */
  refresh: [];
  /** 点击查询 */
  search: [];
}>();

defineProps<{
  /** 已选对比数量 */
  compareCount?: number;
  /** 是否禁用对比 */
  compareDisabled?: boolean;
  /** 已选导出数量 */
  exportCount?: number;
  /** 是否处于导出勾选模式 */
  exportSelecting?: boolean;
  /** 导出按钮 loading */
  exporting?: boolean;
  /** 刷新按钮 loading */
  refreshing?: boolean;
}>();

/**
 * 回车触发搜索
 */
function handleEnter() {
  emit('search');
}
</script>

<template>
  <el-card class="model-filter" shadow="never">
    <div class="model-filter__row">
      <el-input
        v-model="keyword"
        class="model-filter__keyword"
        clearable
        :disabled="exportSelecting"
        :placeholder="$t('page.service.model.searchPlaceholder')"
        @keyup.enter="handleEnter"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <div class="model-filter__actions">
        <template v-if="exportSelecting">
          <span class="model-filter__export-tip">
            {{ $t('page.service.model.export.tip') }}
          </span>
          <el-button
            class="mine-shell__action-btn"
            @click="emit('exportSelectAll')"
          >
            {{ $t('page.service.model.export.selectAll') }}
          </el-button>
          <el-button
            class="mine-shell__action-btn"
            type="primary"
            :icon="Download"
            :loading="exporting"
            :disabled="!exportCount"
            @click="emit('export')"
          >
            {{
              $t('page.service.model.export.confirm', [
                String(exportCount || 0),
              ])
            }}
          </el-button>
          <el-button
            class="mine-shell__action-btn"
            @click="emit('exportCancel')"
          >
            {{ $t('page.service.model.export.cancel') }}
          </el-button>
        </template>

        <template v-else>
          <el-button
            class="mine-shell__action-btn"
            type="primary"
            @click="emit('search')"
          >
            {{ $t('page.service.model.search') }}
          </el-button>
          <el-button
            class="mine-shell__action-btn"
            :loading="refreshing"
            @click="emit('refresh')"
          >
            {{ $t('page.service.model.refresh') }}
          </el-button>
          <el-button
            class="mine-shell__action-btn"
            type="success"
            :disabled="compareDisabled"
            @click="emit('compare')"
          >
            {{
              $t('page.service.model.compare.action', [
                String(compareCount || 0),
              ])
            }}
          </el-button>
          <el-button
            class="mine-shell__action-btn"
            :icon="Download"
            @click="emit('export')"
          >
            {{ $t('page.service.model.export.action') }}
          </el-button>
        </template>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.model-filter {
  margin-bottom: 18px;

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  &__keyword {
    flex: 1;
    min-width: 200px;
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  &__export-tip {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }
}

@media (max-width: 768px) {
  .model-filter {
    &__actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }

    &__export-tip {
      width: 100%;
    }
  }
}
</style>
