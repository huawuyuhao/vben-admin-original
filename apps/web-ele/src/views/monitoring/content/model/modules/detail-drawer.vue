<script lang="ts" setup>
import type { AdminModelServiceItem } from '#/types/monitoring/content/model';

import { $t } from '@vben/locales';

import {
  displayAdminModelValue,
  formatAdminModelCount,
  formatAdminModelDateTime,
  formatAdminModelScore,
  hasAdminModelIcon,
  resolveAdminModelStatusLabelKey,
  resolveAdminModelStatusTagType,
} from '../data';

defineOptions({ name: 'AdminModelDetailDrawer' });

defineProps<{
  /** 当前查看的模型 */
  item?: AdminModelServiceItem | null;
}>();

const visible = defineModel<boolean>('visible', { default: false });

/**
 * 格式化可选时间字段
 * @param value 时间字符串
 * @returns 展示文案
 */
function formatTime(value?: string): string {
  return formatAdminModelDateTime(value) || '—';
}

/**
 * 格式化可选 ID 字段
 * @param value 数值 / 字符串 ID
 * @returns 展示文案
 */
function formatId(value?: number | string): string {
  return displayAdminModelValue(value, '—');
}
</script>

<template>
  <el-drawer
    v-model="visible"
    class="model-detail-drawer"
    destroy-on-close
    :size="480"
    :title="$t('page.monitoring.content.model.detailTitle')"
  >
    <template v-if="item">
      <div
        class="model-detail-drawer__cover"
        :class="{
          'model-detail-drawer__cover--empty': !hasAdminModelIcon(item.iconUrl),
        }"
      >
        <el-image
          v-if="hasAdminModelIcon(item.iconUrl)"
          class="model-detail-drawer__img"
          :src="item.iconUrl"
          fit="cover"
        />
        <span v-else class="model-detail-drawer__letter" aria-hidden="true">
          {{ (item.modelName || '?').slice(0, 1) }}
        </span>
      </div>

      <h3 class="model-detail-drawer__name">
        {{ item.modelName || $t('page.monitoring.content.model.valueEmpty') }}
      </h3>

      <el-descriptions :column="1" border class="model-detail-drawer__desc">
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.modelId')"
        >
          {{ formatId(item.modelId) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.description')"
        >
          {{ item.description || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.modelCategory')"
        >
          {{ item.modelCategory || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.sceneTag')"
        >
          {{ item.sceneTag || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.score')"
        >
          {{ formatAdminModelScore(item.score) || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.callCount')"
        >
          {{ formatAdminModelCount(item.callCount) || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.collectCount')"
        >
          {{ formatAdminModelCount(item.collectCount) || '—' }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.status')"
        >
          <el-tag
            :type="resolveAdminModelStatusTagType(item.status)"
            size="small"
            round
          >
            {{
              $t(
                `page.monitoring.content.model.status.${resolveAdminModelStatusLabelKey(item.status)}`,
              )
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.paramsJson')"
        >
          <pre
            v-if="item.paramsJson?.trim()"
            class="model-detail-drawer__params"
            >{{ item.paramsJson }}</pre
          >
          <span v-else>—</span>
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.createTime')"
        >
          {{ formatTime(item.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.updateTime')"
        >
          {{ formatTime(item.updateTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.model.fields.tenantId')"
        >
          {{ item.tenantId || '—' }}
        </el-descriptions-item>
      </el-descriptions>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
.model-detail-drawer {
  &__cover {
    height: 180px;
    margin-bottom: 16px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary)),
      hsl(250deg 100% 76%) 55%,
      hsl(190deg 90% 66%)
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
    font-size: 48px;
    font-weight: 750;
    color: rgb(255 255 255 / 92%);
  }

  &__name {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 750;
    line-height: 1.4;
    color: hsl(var(--foreground));
  }

  &__desc {
    :deep(.el-descriptions__label) {
      width: 120px;
    }
  }

  &__params {
    margin: 0;
    max-height: 200px;
    overflow: auto;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
