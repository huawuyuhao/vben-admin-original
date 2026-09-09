<script lang="ts" setup>
import type { CaseListItem } from '#/types/monitoring/content/case';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  CASE_TYPE_GENERAL,
  CASE_TYPE_SMART,
  formatCaseDateTime,
  formatCaseViewCount,
  hasCaseCover,
  isCaseListDraft,
  normalizeCaseTags,
  resolveCaseAuditLabelKey,
  resolveCaseAuditTagType,
} from '../data';

defineOptions({ name: 'AdminCaseDetailDrawer' });

const props = defineProps<{
  /** 当前查看的案例 */
  item?: CaseListItem | null;
}>();

const visible = defineModel<boolean>('visible', { default: false });

/** 标签列表 */
const tags = computed(() => normalizeCaseTags(props.item?.tags));

/** 案例类型文案 */
const typeText = computed(() => {
  const type = Number(props.item?.caseType);
  if (type === CASE_TYPE_GENERAL) {
    return $t('page.monitoring.content.case.type.general');
  }
  if (type === CASE_TYPE_SMART) {
    return $t('page.monitoring.content.case.type.smart');
  }
  return $t('page.monitoring.content.case.valueEmpty');
});

/** 是否草稿 */
const isDraft = computed(() => isCaseListDraft(props.item?.status));

/** 审核状态文案 */
const auditText = computed(() =>
  $t(
    `page.monitoring.content.case.auditStatus.${resolveCaseAuditLabelKey(props.item?.status)}`,
  ),
);

/** 审核状态 Tag 类型 */
const auditTagType = computed(() =>
  resolveCaseAuditTagType(props.item?.status),
);

/** 浏览量文案 */
const viewText = computed(() => {
  if (!props.item) {
    return $t('page.monitoring.content.case.valueEmpty');
  }
  return (
    formatCaseViewCount(props.item.viewCount) ||
    $t('page.monitoring.content.case.viewPending')
  );
});

/**
 * 格式化可选时间字段
 * @param value 时间字符串
 * @returns 展示文案
 */
function formatTime(value?: string): string {
  return formatCaseDateTime(value) || $t('page.monitoring.content.case.valueEmpty');
}

/**
 * 格式化可选 ID 字段
 * @param value 数值 ID
 * @returns 展示文案
 */
function formatId(value?: number | string): string {
  if (value === null || value === undefined || value === '') {
    return $t('page.monitoring.content.case.valueEmpty');
  }
  return String(value);
}
</script>

<template>
  <el-drawer
    v-model="visible"
    class="case-detail-drawer"
    destroy-on-close
    :size="480"
    :title="$t('page.monitoring.content.case.detailTitle')"
  >
    <template v-if="item">
      <div
        class="case-detail-drawer__cover"
        :class="{
          'case-detail-drawer__cover--empty': !hasCaseCover(item.coverImage),
        }"
      >
        <el-image
          v-if="hasCaseCover(item.coverImage)"
          class="case-detail-drawer__img"
          :src="item.coverImage"
          fit="cover"
        />
        <span v-else class="case-detail-drawer__letter" aria-hidden="true">
          {{ item.title.slice(0, 1) }}
        </span>
      </div>

      <h3 class="case-detail-drawer__name">{{ item.title }}</h3>

      <div v-if="tags.length > 0" class="case-detail-drawer__tags">
        <el-tag
          v-for="tag in tags"
          :key="`${item.caseId}-${tag}`"
          size="small"
          type="info"
          effect="plain"
          round
        >
          {{ tag }}
        </el-tag>
      </div>

      <el-descriptions :column="1" border class="case-detail-drawer__desc">
        <el-descriptions-item
          :label="$t('page.monitoring.content.case.fields.caseId')"
        >
          {{ formatId(item.caseId) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.case.fields.caseType')"
        >
          {{ typeText }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="isDraft"
          :label="$t('page.monitoring.content.case.fields.draftStatus')"
        >
          <el-tag type="info" effect="plain" round size="small">
            {{ $t('page.monitoring.content.case.draftStatus.yes') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.case.fields.auditStatus')"
        >
          <el-tag :type="auditTagType" effect="plain" round size="small">
            {{ auditText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.case.fields.summary')"
        >
          {{ item.summary || $t('page.monitoring.content.case.valueEmpty') }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.case.fields.viewCount')"
        >
          {{ viewText }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.monitoring.content.case.fields.createTime')"
        >
          {{ formatTime(item.createTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
.case-detail-drawer {
  &__cover {
    position: relative;
    height: 180px;
    margin-bottom: 16px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary) / 12%),
      hsl(190deg 90% 66% / 18%) 55%,
      hsl(var(--primary) / 8%)
    );
    border-radius: 10px;

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
    color: hsl(var(--primary));
  }

  &__name {
    margin: 0 0 12px;
    font-size: 18px;
    font-weight: 750;
    line-height: 1.4;
    color: hsl(var(--foreground));
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__desc {
    margin-top: 4px;
  }
}
</style>
