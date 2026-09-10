<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ModelInfo } from '#/types/service/model';

import { nextTick, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  Cpu,
  DataAnalysis,
  Document,
  Odometer,
  Star,
} from '@element-plus/icons-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { compareModelsApi } from '#/api/service/model';

import {
  buildModelCompareRows,
  hasModelIcon,
  type ModelCompareBaseRowType,
  type ModelCompareRow,
  modelCompareColProp,
  useModelCompareColumns,
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

const [Grid, gridApi] = useVbenVxeGrid({
  class: 'mine-vxe-grid model-compare-dialog__grid',
  gridOptions: {
    border: true,
    columns: useModelCompareColumns([]),
    data: [],
    emptyText: $t('page.service.model.compare.empty'),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    stripe: true,
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<ModelCompareRow>,
});

/**
 * 基础行对应图标组件
 * @param type 基础行类型
 * @returns Element Plus 图标
 */
function baseRowIcon(type?: ModelCompareBaseRowType) {
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
 * 拉取对比数据并刷新本地表格
 */
async function fetchCompare() {
  if (!props.modelIds.length) {
    models.value = [];
    gridApi.setGridOptions({
      columns: useModelCompareColumns([]),
      data: [],
    });
    return;
  }

  loading.value = true;
  gridApi.setLoading(true);
  try {
    const list = await compareModelsApi(props.modelIds);
    models.value = list;
    await nextTick();
    gridApi.setGridOptions({
      columns: useModelCompareColumns(list),
      data: buildModelCompareRows(list),
    });
  } catch {
    models.value = [];
    gridApi.setGridOptions({
      columns: useModelCompareColumns([]),
      data: [],
    });
  } finally {
    loading.value = false;
    gridApi.setLoading(false);
  }
}

watch(visible, async (open) => {
  if (open) {
    await nextTick();
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

      <Grid>
        <template #table-title></template>

        <template #paramLabel="{ row }">
          <div class="model-compare-dialog__param">
            <el-icon class="model-compare-dialog__param-icon">
              <component
                :is="
                  row.kind === 'base' ? baseRowIcon(row.baseType) : DataAnalysis
                "
              />
            </el-icon>
            <span :title="row.paramLabel">{{ row.paramLabel }}</span>
          </div>
        </template>

        <template
          v-for="item in models"
          :key="`h-${item.modelId}`"
          #[`header_${modelCompareColProp(item.modelId)}`]
        >
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

        <template
          v-for="item in models"
          :key="`c-${item.modelId}`"
          #[modelCompareColProp(item.modelId)]="{ row }"
        >
          <div
            class="model-compare-dialog__cell"
            :class="{
              'model-compare-dialog__cell--desc':
                row.baseType === 'description',
            }"
            :title="String(row[modelCompareColProp(item.modelId)] ?? '')"
          >
            {{ row[modelCompareColProp(item.modelId)] }}
          </div>
        </template>
      </Grid>
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

  &__grid {
    :deep(.vxe-table--header th) {
      background: hsl(var(--primary) / 6%);
    }

    :deep(.vxe-body--column) {
      vertical-align: top;
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
