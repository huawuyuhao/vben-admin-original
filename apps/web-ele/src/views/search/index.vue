<script lang="ts" setup>
import type {
  PortalSearchResultItem,
  PortalSearchTypeFilter,
} from '#/types/search';

import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Search } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { debounce, isEmpty } from '@vben/utils';
import { ElMessage } from 'element-plus';

import { getPortalSearchApi } from '#/api/search';
import { ensureLoggedIn } from '#/store/common';

import {
  SEARCH_TYPE_FILTERS,
  resolveSearchDetailPath,
} from './data';
import ResultItem from './modules/result-item.vue';

/**
 * 门户顶栏业务搜索（对接 GET /portal/search）
 * 替代 Vben 菜单全局搜索展示位，不改动 packages 内 GlobalSearch
 */
defineOptions({ name: 'PortalSearchBar' });

const router = useRouter();

/** 下拉是否展开 */
const panelVisible = ref(false);
/** 关键词 */
const keyword = ref('');
/** 类型筛选 */
const searchType = ref<PortalSearchTypeFilter>('all');
/** 加载中 */
const loading = ref(false);
/** 结果列表 */
const results = ref<PortalSearchResultItem[]>([]);
/** 是否已发起过有效查询（用于区分空态文案） */
const hasSearched = ref(false);
/** 输入框引用 */
const inputRef = ref<{ focus?: () => void }>();

/** 类型筛选项（带文案） */
const typeOptions = computed(() =>
  SEARCH_TYPE_FILTERS.map((value) => ({
    value,
    label: $t(`page.search.filter.${value}`),
  })),
);

/**
 * 拉取搜索结果
 */
async function fetchResults() {
  const q = keyword.value.trim();
  if (isEmpty(q)) {
    results.value = [];
    hasSearched.value = false;
    return;
  }

  loading.value = true;
  hasSearched.value = true;
  try {
    results.value = await getPortalSearchApi({
      keyword: q,
      type: searchType.value,
    });
  } catch {
    results.value = [];
  } finally {
    loading.value = false;
  }
}

/** 防抖查询，避免输入过程频繁打接口 */
const debouncedFetch = debounce(() => {
  void fetchResults();
}, 320);

/**
 * 展开面板后聚焦输入框
 */
function focusInput() {
  nextTick(() => {
    inputRef.value?.focus?.();
  });
}

/**
 * 关键词变化：展开面板并防抖搜索
 */
function handleKeywordInput() {
  if (!panelVisible.value) {
    panelVisible.value = true;
  }
  debouncedFetch();
}

/**
 * 切换类型后立即查询
 * @param type 选中的类型
 */
function handleTypeChange(type: PortalSearchTypeFilter) {
  searchType.value = type;
  if (!panelVisible.value) {
    panelVisible.value = true;
  }
  void fetchResults();
}

/**
 * 回车立即查询（取消等待中的防抖）
 */
function handleEnter() {
  // es-toolkit / lodash 兼容防抖均提供 cancel
  debouncedFetch.cancel?.();
  void fetchResults();
}

/**
 * 点击结果跳转对应详情页
 * @param item 搜索结果
 */
function handleSelect(item: PortalSearchResultItem) {
  const path = resolveSearchDetailPath(item);
  if (!path) {
    ElMessage.warning($t('page.search.invalidTarget'));
    return;
  }
  panelVisible.value = false;

  // 未登录先去登录（已在登录页则保持不动），勿直接 push 业务路由
  // 否则守卫会把「登录页 → 业务页」打回门户首页
  if (!ensureLoggedIn(path)) {
    return;
  }
  void router.push(path);
}

watch(panelVisible, (visible) => {
  if (visible && keyword.value.trim()) {
    void fetchResults();
  }
});
</script>

<template>
  <div class="portal-search">
    <el-popover
      v-model:visible="panelVisible"
      :width="420"
      placement="bottom-end"
      trigger="click"
      :show-arrow="false"
      popper-class="portal-search-popper"
      :offset="8"
      @show="focusInput"
    >
      <template #reference>
        <button
          class="portal-search__trigger"
          type="button"
          :aria-label="$t('page.search.triggerAria')"
        >
          <el-icon class="portal-search__trigger-icon"><Search /></el-icon>
          <span class="portal-search__trigger-text">
            {{ $t('page.search.triggerPlaceholder') }}
          </span>
        </button>
      </template>

      <div class="portal-search__panel">
        <el-input
          ref="inputRef"
          v-model="keyword"
          clearable
          class="portal-search__input"
          :placeholder="$t('page.search.inputPlaceholder')"
          @input="handleKeywordInput"
          @keyup.enter="handleEnter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="portal-search__filters" role="tablist">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            class="portal-search__filter"
            type="button"
            :class="{ 'is-active': searchType === opt.value }"
            @click="handleTypeChange(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>

        <div v-loading="loading" class="portal-search__body">
          <el-empty
            v-if="!hasSearched"
            :description="$t('page.search.hint')"
            :image-size="64"
          />
          <el-empty
            v-else-if="!loading && results.length === 0"
            :description="$t('page.search.empty')"
            :image-size="64"
          />
          <div v-else class="portal-search__list">
            <ResultItem
              v-for="item in results"
              :key="`${item.type}-${item.id}`"
              :item="item"
              @select="handleSelect"
            />
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.portal-search {
  display: flex;
  align-items: center;
  margin-right: 8px;

  &__trigger {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 168px;
    max-width: 220px;
    height: 32px;
    padding: 0 12px;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    background: hsl(var(--accent) / 55%);
    border: 1px solid hsl(var(--border));
    border-radius: 999px;
    transition:
      border-color 0.18s ease,
      background-color 0.18s ease,
      box-shadow 0.18s ease,
      color 0.18s ease;

    &:hover,
    &:focus-visible {
      color: hsl(var(--foreground));
      background: hsl(var(--background));
      border-color: hsl(var(--primary) / 45%);
      outline: none;
      box-shadow: 0 0 0 3px hsl(var(--primary) / 12%);
    }
  }

  &__trigger-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: hsl(var(--primary));
  }

  &__trigger-text {
    overflow: hidden;
    font-size: 13px;
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__filter {
    height: 28px;
    padding: 0 10px;
    color: hsl(var(--muted-foreground));
    font-size: 12px;
    line-height: 26px;
    cursor: pointer;
    background: hsl(var(--accent) / 40%);
    border: 1px solid transparent;
    border-radius: 999px;
    transition:
      color 0.15s ease,
      background-color 0.15s ease,
      border-color 0.15s ease;

    &:hover {
      color: hsl(var(--foreground));
      background: hsl(var(--accent));
    }

    &.is-active {
      color: hsl(var(--primary-foreground));
      background: hsl(var(--primary));
      border-color: hsl(var(--primary));
    }
  }

  &__body {
    min-height: 180px;
    max-height: 360px;
    overflow: auto;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .portal-search {
    margin-right: 4px;

    &__trigger {
      min-width: 36px;
      max-width: 36px;
      padding: 0;
      justify-content: center;
    }

    &__trigger-text {
      display: none;
    }
  }
}
</style>

<style lang="scss">
/* popper 挂到 body，需非 scoped 微调 */
.portal-search-popper.el-popover {
  padding: 14px !important;
  border-radius: 14px !important;
  box-shadow:
    0 10px 30px hsl(245 40% 20% / 12%),
    0 2px 8px hsl(245 40% 20% / 6%) !important;
}
</style>
