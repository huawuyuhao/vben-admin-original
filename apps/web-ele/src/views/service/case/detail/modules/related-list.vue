<script lang="ts" setup>
import type { CaseInfo } from '#/types/service/case';

import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { getCaseRelatedApi } from '#/api/service/case';

import { groupCasesByType, normalizeCaseList } from '../../data';
import RelatedCard from './related-card.vue';

defineOptions({ name: 'ServiceCaseRelatedList' });

const props = defineProps<{
  /** 当前案例 ID */
  caseId: number;
  /** 可选：指定标签筛选关联 */
  tagName?: string;
}>();

const router = useRouter();

/** 加载中 */
const loading = ref(false);
/** 关联案例原始列表 */
const related = ref<CaseInfo[]>([]);

/** 按通算 / 智算分组 */
const grouped = computed(() => groupCasesByType(related.value));

/**
 * 拉取关联案例
 */
async function fetchRelated() {
  if (!props.caseId) {
    related.value = [];
    return;
  }

  loading.value = true;
  try {
    const list = await getCaseRelatedApi({
      caseId: props.caseId,
      tagName: props.tagName?.trim() || undefined,
    });
    related.value = normalizeCaseList(list).filter(
      (item) => item.caseId !== props.caseId,
    );
  } catch {
    related.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 跳转关联案例详情
 * @param item 案例
 */
function goDetail(item: CaseInfo) {
  if (!item.caseId) {
    return;
  }
  router.push(`/service/case/${item.caseId}`);
}

onMounted(() => {
  void fetchRelated();
});

watch(
  () => [props.caseId, props.tagName] as const,
  () => {
    void fetchRelated();
  },
);
</script>

<template>
  <el-card v-loading="loading" class="case-related" shadow="never">
    <template #header>
      <div class="case-related__header">
        <span>{{ $t('page.service.case.detail.relatedTitle') }}</span>
        <span v-if="tagName" class="case-related__tip">
          {{ $t('page.service.case.detail.relatedTagTip', [tagName]) }}
        </span>
      </div>
    </template>

    <el-empty
      v-if="!loading && related.length === 0"
      :description="$t('page.service.case.detail.relatedEmpty')"
    />

    <template v-else>
      <section
        v-if="grouped.general.length"
        class="case-related__section"
      >
        <h4 class="case-related__section-title">
          {{ $t('page.service.case.detail.relatedGeneral') }}
        </h4>
        <div class="case-related__grid">
          <RelatedCard
            v-for="item in grouped.general"
            :key="item.caseId"
            :item="item"
            @detail="goDetail"
          />
        </div>
      </section>

      <section
        v-if="grouped.smart.length"
        class="case-related__section"
      >
        <h4 class="case-related__section-title">
          {{ $t('page.service.case.detail.relatedSmart') }}
        </h4>
        <div class="case-related__grid">
          <RelatedCard
            v-for="item in grouped.smart"
            :key="item.caseId"
            :item="item"
            @detail="goDetail"
          />
        </div>
      </section>

      <section
        v-if="grouped.other.length"
        class="case-related__section"
      >
        <h4 class="case-related__section-title">
          {{ $t('page.service.case.detail.relatedOther') }}
        </h4>
        <div class="case-related__grid">
          <RelatedCard
            v-for="item in grouped.other"
            :key="item.caseId"
            :item="item"
            @detail="goDetail"
          />
        </div>
      </section>
    </template>
  </el-card>
</template>

<style lang="scss" scoped>
.case-related {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    font-size: 15px;
    font-weight: 700;
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: baseline;
  }

  &__tip {
    font-size: 12px;
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }

  &__section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__section-title {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 700;
    color: hsl(var(--foreground));
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
}

@media (max-width: 1100px) {
  .case-related {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 768px) {
  .case-related {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
