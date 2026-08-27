<script lang="ts" setup>
import type { CaseInfo } from '#/types/service/case';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import { isCaseHtmlContent } from '../../data';

defineOptions({ name: 'ServiceCaseDetailContent' });

const props = defineProps<{
  /** 案例详情 */
  caseItem: CaseInfo;
}>();

/** 是否按 HTML 渲染 */
const isHtml = computed(() => isCaseHtmlContent(props.caseItem.content));

/** 是否有正文 */
const hasContent = computed(() => !!props.caseItem.content?.trim());
</script>

<template>
  <el-card class="case-content" shadow="never">
    <template #header>
      <span>{{ $t('page.service.case.detail.contentTitle') }}</span>
    </template>

    <div
      v-if="hasContent && isHtml"
      class="case-content__body"
      v-html="caseItem.content"
    ></div>
    <div
      v-else-if="hasContent"
      class="case-content__body case-content__body--plain"
    >
      {{ caseItem.content }}
    </div>
    <el-empty
      v-else
      :description="$t('page.service.case.detail.contentEmpty')"
    />
  </el-card>
</template>

<style lang="scss" scoped>
.case-content {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    font-size: 15px;
    font-weight: 700;
  }

  &__body {
    font-size: 14px;
    line-height: 1.8;
    color: hsl(var(--foreground));
    word-break: break-word;

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }

    :deep(p) {
      margin: 0 0 12px;
    }

    &--plain {
      white-space: pre-wrap;
    }
  }
}
</style>
