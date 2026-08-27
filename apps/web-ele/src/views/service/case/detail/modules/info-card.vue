<script lang="ts" setup>
import type { CaseInfo } from '#/types/service/case';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  CASE_STATUS_PUBLISHED,
  CASE_TYPE_GENERAL,
  CASE_TYPE_SMART,
  formatCaseDateTime,
} from '../../data';

defineOptions({ name: 'ServiceCaseDetailInfo' });

const props = defineProps<{
  /** 案例详情 */
  caseItem: CaseInfo;
}>();

/** 类型文案 */
const typeText = computed(() => {
  const type = Number(props.caseItem.caseType);
  if (type === CASE_TYPE_GENERAL) {
    return $t('page.service.case.type.general');
  }
  if (type === CASE_TYPE_SMART) {
    return $t('page.service.case.type.smart');
  }
  return $t('page.service.case.detail.valueEmpty');
});

/** 状态文案 */
const statusText = computed(() => {
  const status = Number(props.caseItem.status);
  if (status === CASE_STATUS_PUBLISHED) {
    return $t('page.service.case.detail.statusPublished');
  }
  if (status === 0) {
    return $t('page.service.case.detail.statusDraft');
  }
  return $t('page.service.case.detail.valueEmpty');
});

/** 创建时间 */
const createText = computed(
  () =>
    formatCaseDateTime(props.caseItem.createTime) ||
    $t('page.service.case.detail.valueEmpty'),
);

/** 更新时间 */
const updateText = computed(
  () =>
    formatCaseDateTime(props.caseItem.updateTime) ||
    $t('page.service.case.detail.valueEmpty'),
);
</script>

<template>
  <el-card class="case-info" shadow="never">
    <template #header>
      <span>{{ $t('page.service.case.detail.infoTitle') }}</span>
    </template>

    <el-descriptions :column="2" border>
      <el-descriptions-item
        :label="$t('page.service.case.detail.fields.caseId')"
      >
        {{ caseItem.caseId }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.case.detail.fields.caseType')"
      >
        {{ typeText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.case.detail.fields.status')"
      >
        {{ statusText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.case.detail.fields.createTime')"
      >
        {{ createText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.case.detail.fields.updateTime')"
        :span="2"
      >
        {{ updateText }}
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style lang="scss" scoped>
.case-info {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    font-size: 15px;
    font-weight: 700;
  }
}
</style>
