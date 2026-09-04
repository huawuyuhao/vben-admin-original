<script lang="ts" setup>
import type { ModelInfo } from '#/types/service/model';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  formatModelDateTime,
  MODEL_STATUS_ENABLED,
} from '../../data';

defineOptions({ name: 'ServiceModelDetailInfo' });

const props = defineProps<{
  /** 模型详情 */
  model: ModelInfo;
}>();

/**
 * 启用状态文案
 */
const statusText = computed(() => {
  const status = Number(props.model.status);
  if (status === MODEL_STATUS_ENABLED) {
    return $t('page.service.model.detail.statusOn');
  }
  if (status === 0) {
    return $t('page.service.model.detail.statusOff');
  }
  return $t('page.service.model.detail.valueEmpty');
});

/** 创建时间 */
const createText = computed(
  () =>
    formatModelDateTime(props.model.createTime) ||
    $t('page.service.model.detail.valueEmpty'),
);

/** 更新时间 */
const updateText = computed(
  () =>
    formatModelDateTime(props.model.updateTime) ||
    $t('page.service.model.detail.valueEmpty'),
);
</script>

<template>
  <el-card class="model-info" shadow="never">
    <template #header>
      <span>{{ $t('page.service.model.detail.infoTitle') }}</span>
    </template>

    <el-descriptions :column="2" border>
      <el-descriptions-item
        :label="$t('page.service.model.detail.fields.modelId')"
      >
        {{ model.modelId }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.model.detail.fields.modelName')"
      >
        {{ model.modelName }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.model.detail.fields.status')"
      >
        {{ statusText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.model.detail.fields.createTime')"
      >
        {{ createText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.model.detail.fields.updateTime')"
      >
        {{ updateText }}
      </el-descriptions-item>
      <el-descriptions-item
        :label="$t('page.service.model.detail.fields.description')"
        :span="2"
      >
        {{
          model.description?.trim() ||
          $t('page.service.model.detail.valueEmpty')
        }}
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style lang="scss" scoped>
.model-info {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    font-size: 15px;
    font-weight: 700;
  }
}
</style>
