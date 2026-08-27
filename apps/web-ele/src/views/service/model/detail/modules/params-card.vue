<script lang="ts" setup>
import type { ModelInfo } from '#/types/service/model';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  formatModelParamValue,
  parseModelParamsJson,
} from '../../data';

defineOptions({ name: 'ServiceModelDetailParams' });

const props = defineProps<{
  /** 模型详情 */
  model: ModelInfo;
}>();

/** 参数键值行（标签直接使用接口返回的键名） */
const paramRows = computed(() => {
  const params = parseModelParamsJson(props.model.paramsJson);
  return Object.keys(params)
    .sort()
    .map((key) => ({
      key,
      value:
        formatModelParamValue(params[key]) ||
        $t('page.service.model.detail.valueEmpty'),
    }));
});
</script>

<template>
  <el-card class="model-params" shadow="never">
    <template #header>
      <span>{{ $t('page.service.model.detail.paramsTitle') }}</span>
    </template>

    <el-empty
      v-if="paramRows.length === 0"
      :description="$t('page.service.model.detail.paramsEmpty')"
    />

    <el-descriptions v-else :column="2" border>
      <el-descriptions-item
        v-for="row in paramRows"
        :key="row.key"
        :label="row.key"
      >
        {{ row.value }}
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style lang="scss" scoped>
.model-params {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    font-size: 15px;
    font-weight: 700;
  }
}
</style>
