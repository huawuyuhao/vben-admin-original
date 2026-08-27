<script lang="ts" setup>
import type { CaseListItem } from '#/types/service/case';

import { $t } from '@vben/locales';

import CaseCard from './case-card.vue';

defineOptions({ name: 'ServiceCaseGrid' });

withDefaults(
  defineProps<{
    /** 案例列表 */
    cases: CaseListItem[];
    /** 空态文案 */
    emptyDescription?: string;
    /** 加载中 */
    loading?: boolean;
  }>(),
  {
    emptyDescription: undefined,
    loading: false,
  },
);

const emit = defineEmits<{
  /** 查看详情 */
  detail: [item: CaseListItem];
  /** 编辑 */
  edit: [item: CaseListItem];
  /** 删除 */
  remove: [item: CaseListItem];
}>();
</script>

<template>
  <div v-loading="loading" class="case-grid-wrap">
    <div
      v-if="loading && cases.length === 0"
      class="case-grid case-grid--skel"
    >
      <el-card
        v-for="i in 6"
        :key="i"
        class="case-grid-wrap__skel-col"
        shadow="never"
        :body-style="{ padding: '0' }"
      >
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item
              variant="image"
              style="width: 100%; height: 168px"
            />
            <div style="padding: 14px">
              <el-skeleton-item variant="h3" style="width: 70%" />
              <el-skeleton-item variant="text" style="margin-top: 10px" />
              <el-skeleton-item variant="text" style="width: 40%" />
            </div>
          </template>
        </el-skeleton>
      </el-card>
    </div>

    <el-card
      v-else-if="!loading && cases.length === 0"
      class="case-grid-wrap__empty"
      shadow="never"
    >
      <el-empty
        :description="emptyDescription || $t('page.service.case.empty')"
      />
    </el-card>

    <div v-else class="case-grid">
      <CaseCard
        v-for="item in cases"
        :key="item.caseId"
        class="case-grid__item"
        :item="item"
        @detail="emit('detail', $event)"
        @edit="emit('edit', $event)"
        @remove="emit('remove', $event)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.case-grid-wrap {
  min-height: 240px;

  &__empty {
    :deep(.el-card__body) {
      padding: 24px 16px;
    }
  }
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  &__item {
    min-width: 0;
  }
}

@media (max-width: 1100px) {
  .case-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .case-grid {
    grid-template-columns: 1fr;
  }
}
</style>
