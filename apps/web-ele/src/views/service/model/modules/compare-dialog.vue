<script lang="ts" setup>
import type { ModelInfo } from '#/types/service/model';

import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  Cpu,
  DataAnalysis,
  Document,
  Odometer,
  Star,
} from '@element-plus/icons-vue';

import { compareModelsApi } from '#/api/service/model';

import {
  formatModelCallCount,
  formatModelParamValue,
  formatModelScore,
  hasModelIcon,
  parseModelParamsJson,
} from '../data';

defineOptions({ name: 'ServiceModelCompareDialog' });

const props = defineProps<{
  /** 待对比模型 ID */
  modelIds: number[];
}>();

const visible = defineModel<boolean>('visible', { default: false });

/** 对比加载中 */
const loading = ref(false);
/** 对比结果 */
const models = ref<ModelInfo[]>([]);

/** 基础行类型：评分 / 调用量 / 简介 */
type BaseRowType = 'callCount' | 'description' | 'score';

interface CompareRow {
  /** 行类型（基础行有图标） */
  kind: 'base' | 'param';
  /** 基础行类型 */
  baseType?: BaseRowType;
  /** 参数原始键（参数行） */
  rawKey?: string;
  /** 参数项展示文案 */
  paramLabel: string;
  /** 各模型单元格值 */
  [key: `m_${number}` | string]: unknown;
}

/**
 * 按模型 ID 取列 prop
 * @param modelId 模型 ID
 * @returns 列字段名
 */
function modelColProp(modelId: number): string {
  return `m_${modelId}`;
}

/** 横向对比表格行：基础信息 + 参数 */
const tableRows = computed<CompareRow[]>(() => {
  const list = models.value;
  if (!list.length) {
    return [];
  }

  const emptyText = $t('page.service.model.detail.valueEmpty');

  const baseDefs: Array<{
    baseType: BaseRowType;
    label: string;
    values: (m: ModelInfo) => string;
  }> = [
    {
      baseType: 'score',
      label: $t('page.service.model.fields.score'),
      values: (m) => formatModelScore(m.score) || emptyText,
    },
    {
      baseType: 'callCount',
      label: $t('page.service.model.fields.callCount'),
      values: (m) => formatModelCallCount(m.callCount) || emptyText,
    },
    {
      baseType: 'description',
      label: $t('page.service.model.fields.description'),
      values: (m) => m.description?.trim() || emptyText,
    },
  ];

  const baseRows: CompareRow[] = baseDefs.map((def) => ({
    kind: 'base',
    baseType: def.baseType,
    paramLabel: def.label,
    ...Object.fromEntries(
      list.map((m) => [modelColProp(m.modelId), def.values(m)]),
    ),
  }));

  const keySet = new Set<string>();
  const parsedList = list.map((m) => {
    const params = parseModelParamsJson(m.paramsJson);
    Object.keys(params).forEach((k) => keySet.add(k));
    return params;
  });

  const paramRows: CompareRow[] = [...keySet].sort().map((key) => ({
    kind: 'param',
    rawKey: key,
    paramLabel: key,
    ...Object.fromEntries(
      list.map((m, index) => [
        modelColProp(m.modelId),
        formatModelParamValue(parsedList[index]?.[key]) || emptyText,
      ]),
    ),
  }));

  return [...baseRows, ...paramRows];
});

/**
 * 基础行对应图标组件
 * @param type 基础行类型
 * @returns Element Plus 图标
 */
function baseRowIcon(type?: BaseRowType) {
  switch (type) {
    case 'callCount': {
      return Odometer;
    }
    case 'description': {
      return Document;
    }
    case 'score': {
      return Star;
    }
    default: {
      return DataAnalysis;
    }
  }
}

/**
 * 拉取对比数据
 */
async function fetchCompare() {
  if (!props.modelIds.length) {
    models.value = [];
    return;
  }
  loading.value = true;
  try {
    models.value = await compareModelsApi(props.modelIds);
  } catch {
    models.value = [];
  } finally {
    loading.value = false;
  }
}

watch(visible, (open) => {
  if (open) {
    void fetchCompare();
  }
});
</script>

<template>
  <el-dialog
    v-model="visible"
    class="model-compare-dialog"
    :title="$t('page.service.model.compare.title')"
    width="1280px"
    top="6vh"
    destroy-on-close
    append-to-body
  >
    <div v-loading="loading" class="model-compare-dialog__body">
      <div v-if="models.length > 0" class="model-compare-dialog__meta">
        <el-icon><Cpu /></el-icon>
        <span>
          {{
            $t('page.service.model.compare.modelCount', [
              String(models.length),
            ])
          }}
        </span>
      </div>

      <el-empty
        v-if="!loading && models.length === 0"
        :description="$t('page.service.model.compare.empty')"
      />

      <el-table
        v-else
        :data="tableRows"
        border
        stripe
        class="model-compare-dialog__table"
      >
        <el-table-column
          prop="paramLabel"
          :label="$t('page.service.model.compare.paramKey')"
          fixed="left"
          min-width="168"
        >
          <template #default="{ row }">
            <div class="model-compare-dialog__param">
              <el-icon class="model-compare-dialog__param-icon">
                <component
                  :is="
                    row.kind === 'base'
                      ? baseRowIcon(row.baseType)
                      : DataAnalysis
                  "
                />
              </el-icon>
              <span :title="row.paramLabel">{{ row.paramLabel }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          v-for="item in models"
          :key="item.modelId"
          :prop="modelColProp(item.modelId)"
          min-width="200"
        >
          <template #header>
            <div class="model-compare-dialog__model-head">
              <div
                class="model-compare-dialog__model-icon"
                :class="{
                  'model-compare-dialog__model-icon--empty': !hasModelIcon(
                    item.iconUrl,
                  ),
                }"
              >
                <el-image
                  v-if="hasModelIcon(item.iconUrl)"
                  :src="item.iconUrl"
                  fit="cover"
                />
                <span v-else>{{ item.modelName.slice(0, 1) }}</span>
              </div>
              <span
                class="model-compare-dialog__model-name"
                :title="item.modelName"
              >
                {{ item.modelName }}
              </span>
            </div>
          </template>
          <template #default="{ row }">
            <div
              class="model-compare-dialog__cell"
              :class="{
                'model-compare-dialog__cell--desc':
                  row.baseType === 'description',
              }"
              :title="String(row[modelColProp(item.modelId)] ?? '')"
            >
              {{ row[modelColProp(item.modelId)] }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<style lang="scss">
/* 弹窗挂到 body，需非 scoped 才能作用到 el-dialog 外壳 */
.model-compare-dialog.el-dialog {
  width: min(1280px, 96vw) !important;
  max-width: 96vw;
  height: auto !important;
  max-height: none;
  margin-top: 3vh !important;
  margin-bottom: 3vh !important;
  overflow: visible;

  .el-dialog__header {
    padding: 20px 28px 12px;
  }

  .el-dialog__body {
    max-height: none;
    padding: 8px 28px 28px;
    overflow: visible;
  }

  .el-dialog__headerbtn {
    top: 20px;
    right: 20px;
  }
}
</style>

<style lang="scss" scoped>
.model-compare-dialog {
  &__body {
    min-height: 120px;
    overflow: visible;
  }

  &__meta {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 14px;
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  &__table {
    width: 100%;

    :deep(.el-table__header th) {
      background: hsl(var(--primary) / 6%);
    }

    :deep(.el-table__body td) {
      vertical-align: top;
    }

    /* 取消表格内部滚动，整表随内容撑开 */
    :deep(.el-table__body-wrapper),
    :deep(.el-scrollbar__wrap) {
      max-height: none !important;
      overflow: visible !important;
    }
  }

  &__cell {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    line-height: 1.5;
    white-space: nowrap;

    &--desc {
      display: -webkit-box;
      min-height: 72px;
      max-height: 72px;
      padding: 2px 0;
      overflow: hidden;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      line-height: 1.6;
      word-break: break-word;
      white-space: normal;
      -webkit-box-orient: vertical;
    }
  }

  &__param {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    min-width: 0;
    font-weight: 650;
  }

  &__param-icon {
    flex-shrink: 0;
    color: hsl(var(--primary));
  }

  &__model-head {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
    padding: 4px 0;
  }

  &__model-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    overflow: hidden;
    font-size: 14px;
    font-weight: 750;
    color: #fff;
    background: linear-gradient(
      145deg,
      hsl(var(--primary)),
      hsl(190deg 90% 66%)
    );
    border-radius: 10px;

    .el-image {
      width: 100%;
      height: 100%;
    }
  }

  &__model-name {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;
    white-space: nowrap;
  }
}
</style>
