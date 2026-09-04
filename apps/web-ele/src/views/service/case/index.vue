<script lang="ts" setup>
import type { CaseListItem } from '#/types/service/case';

import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { Plus, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { deleteCaseApi, getCaseListApi } from '#/api/service/case';

import {
  CASE_PAGE_SIZE,
  type CaseTypeFilter,
  filterCaseRecordsByType,
  normalizeCasePage,
} from './data';
import CaseGrid from './modules/case-grid.vue';
import CasePager from './modules/case-pager.vue';
import FilterBar from './modules/filter-bar.vue';
import FormDialog from './modules/form-dialog.vue';

/**
 * 门户服务 · 案例中心列表
 * 列表 VO 含 tags、不含 content；标签走接口；案例类型前端筛当前页
 */
defineOptions({ name: 'ServiceCase' });

const router = useRouter();

/** 标签筛选（草稿，查询时写入接口） */
const tagName = ref('');
/** 案例类型筛选草稿（空为全部） */
const caseTypeFilter = ref<CaseTypeFilter>('');
/** 已生效的案例类型（点击查询后应用，仅筛当前页） */
const appliedCaseType = ref<CaseTypeFilter>('');
/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(CASE_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页接口原始案例 */
const cases = ref<CaseListItem[]>([]);
/** 总条数（接口 total，不受前端类型筛选影响） */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);
/** 表单弹窗引用 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();

/** 表格展示数据：案例类型前端过滤当前页 */
const displayCases = computed(() =>
  filterCaseRecordsByType(cases.value, appliedCaseType.value),
);

/**
 * 拉取当前页案例列表
 */
async function fetchCases() {
  loading.value = true;
  try {
    const data = await getCaseListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      tagName: tagName.value.trim() || undefined,
    });
    const page = normalizeCasePage(data);
    cases.value = page.records;
    total.value = page.total;

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    cases.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 回到第一页并查询接口
 */
function queryFromFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchCases();
}

/**
 * 提交查询：标签走接口；案例类型仅前端作用于当前页
 */
function handleSearch() {
  appliedCaseType.value = caseTypeFilter.value;
  queryFromFirstPage();
}

/**
 * 刷新当前页（保留已生效的类型筛选）
 */
function handleRefresh() {
  void fetchCases();
}

/**
 * 重置筛选并查询
 */
function handleReset() {
  tagName.value = '';
  caseTypeFilter.value = '';
  appliedCaseType.value = '';
  queryFromFirstPage();
}

/**
 * 打开新增弹窗
 */
function handleCreate() {
  formDialogRef.value?.openCreate();
}

/**
 * 打开编辑弹窗
 * @param item 案例
 */
function handleEdit(item: CaseListItem) {
  void formDialogRef.value?.openEdit(item);
}

/**
 * 删除案例（二次确认由卡片 Popconfirm 触发）
 * @param item 案例
 */
async function handleRemove(item: CaseListItem) {
  if (!item.caseId) {
    return;
  }
  const label = item.title?.trim() || String(item.caseId);

  try {
    await deleteCaseApi(item.caseId);
    ElMessage.success($t('ui.actionMessage.deleteSuccess', [label]));
    void fetchCases();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 表单保存成功后刷新列表
 */
function handleFormSuccess() {
  void fetchCases();
}

/**
 * 进入案例详情
 * @param item 案例
 */
function goDetail(item: CaseListItem) {
  if (!item.caseId) {
    return;
  }
  router.push(`/service/case/${item.caseId}`);
}

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchCases();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchCases();
});

onMounted(() => {
  void fetchCases();
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
              {{ $t('page.service.case.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.case.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.case.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.service.case.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              {{ $t('page.service.case.add') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:tag-name="tagName"
          v-model:case-type="caseTypeFilter"
          @search="handleSearch"
          @reset="handleReset"
        />

        <CaseGrid
          :loading="loading"
          :cases="displayCases"
          @detail="goDetail"
          @edit="handleEdit"
          @remove="handleRemove"
        />

        <CasePager
          v-if="cases.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../scss/page-shell.scss';
</style>
