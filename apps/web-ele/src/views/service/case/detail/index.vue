<script lang="ts" setup>
import type { CaseInfo } from '#/types/service/case';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getCaseDetailApi } from '#/api/service/case';

import { parseCaseRouteId } from '../data';
import ContentCard from './modules/content-card.vue';
import InfoCard from './modules/info-card.vue';
import OverviewCard from './modules/overview-card.vue';
import RelatedList from './modules/related-list.vue';

/**
 * 门户服务 · 案例详情（对接 GET /case/{id}、GET /case/related）
 */
defineOptions({ name: 'ServiceCaseDetail' });

const route = useRoute();
const router = useRouter();

/** 详情加载中 */
const loading = ref(false);
/** 加载失败 / 无数据 */
const loadError = ref(false);
/** 案例详情 */
const caseItem = ref<CaseInfo | null>(null);
/** 关联推荐按标签筛选（点击概览标签） */
const relatedTag = ref('');

/** 路由中的案例 ID */
const caseId = computed(() => parseCaseRouteId(route.params.id));

/**
 * 返回案例列表
 */
function goBack() {
  router.push('/service/case');
}

/**
 * 切换关联筛选标签（再次点击取消）
 * @param tag 标签名
 */
function handleTagSelect(tag: string) {
  relatedTag.value = relatedTag.value === tag ? '' : tag;
}

/**
 * 拉取案例详情
 */
async function fetchDetail() {
  if (Number.isNaN(caseId.value)) {
    caseItem.value = null;
    loadError.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  loadError.value = false;
  relatedTag.value = '';
  try {
    const data = await getCaseDetailApi(caseId.value);
    caseItem.value = data ?? null;
    if (!data?.caseId) {
      loadError.value = true;
    }
  } catch {
    caseItem.value = null;
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void fetchDetail();
});

watch(caseId, () => {
  void fetchDetail();
});
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div class="mine-shell__inner">
        <header class="mine-shell__head">
          <div>
            <p class="mine-shell__eyebrow">
              {{ $t('page.service.case.detail.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.case.detail.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.case.detail.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button class="mine-shell__action-btn" @click="goBack">
              {{ $t('page.service.case.detail.back') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :loading="loading"
              @click="fetchDetail"
            >
              {{ $t('page.service.case.refresh') }}
            </el-button>
          </div>
        </header>

        <div v-loading="loading">
          <el-card
            v-if="loading && !caseItem"
            shadow="never"
            class="case-detail__state"
          >
            <el-skeleton animated :rows="6" />
          </el-card>

          <el-card
            v-else-if="loadError || !caseItem"
            shadow="never"
            class="case-detail__state"
          >
            <el-empty :description="$t('page.service.case.detail.empty')">
              <el-button type="primary" @click="goBack">
                {{ $t('page.service.case.detail.back') }}
              </el-button>
            </el-empty>
          </el-card>

          <template v-else>
            <OverviewCard
              :case-item="caseItem"
              :active-tag="relatedTag"
              @tag-select="handleTagSelect"
            />
            <InfoCard :case-item="caseItem" />
            <ContentCard :case-item="caseItem" />
            <RelatedList
              :case-id="caseItem.caseId"
              :tag-name="relatedTag || undefined"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';

.case-detail {
  &__state {
    min-height: 240px;

    :deep(.el-card__body) {
      padding: 32px 24px;
    }
  }
}
</style>
