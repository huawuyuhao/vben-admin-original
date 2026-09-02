<script lang="ts" setup>
import type { MyAppItem } from '#/types/service/mydemand/apps';

import { computed, onMounted, ref, watch } from 'vue';

import { Check, Close, Search } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';

import { getMyAppListApi } from '#/api/service/mydemand/apps';

import {
  COMPUTE_APP_PICKER_PAGE_SIZE,
  COMPUTE_APP_PICKER_PAGE_SIZE_OPTIONS,
  displayComputeAppName,
  getComputeAppCoverLetter,
  normalizeComputeAppPage,
} from '../../data';

defineOptions({ name: 'MyDemandComputeAppPicker' });

/** 当前选中的应用 ID */
const selectedId = defineModel<number | undefined>('modelValue');

/** 已选应用缓存（跨页保留展示信息） */
const selectedApp = ref<MyAppItem | null>(null);

/** 筛选草稿：应用名称 */
const filterAppName = ref('');
/** 已生效筛选 */
const appliedAppName = ref('');
/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(COMPUTE_APP_PICKER_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页应用 */
const apps = ref<MyAppItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过服务端回写页码触发的重复请求 */
const syncingFromServer = ref(false);

/** 已选应用展示名 */
const selectedDisplayName = computed(() => {
  if (selectedApp.value) {
    return displayComputeAppName(
      selectedApp.value,
      $t('page.service.mydemand.compute.valueEmpty'),
    );
  }
  if (selectedId.value != null) {
    return $t('page.service.mydemand.compute.form.appSelectedById', [
      selectedId.value,
    ]);
  }
  return '';
});

/**
 * 用当前页数据同步已选应用展示信息
 * @param records 当前页列表
 */
function syncSelectedFromRecords(records: MyAppItem[]) {
  if (selectedId.value == null) {
    return;
  }
  const matched = records.find(
    (item) => Number(item.appId) === Number(selectedId.value),
  );
  if (matched) {
    selectedApp.value = matched;
  }
}

/**
 * 拉取当前页应用列表（启用中）
 */
async function fetchApps() {
  loading.value = true;
  try {
    const data = await getMyAppListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      appName: appliedAppName.value.trim() || undefined,
      appStatus: 1,
    });
    const page = normalizeComputeAppPage(data);
    apps.value = page.records;
    total.value = page.total;
    syncSelectedFromRecords(page.records);

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    apps.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 回到第一页并查询
 */
function queryFromFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchApps();
}

/**
 * 提交名称筛选
 */
function handleSearch() {
  appliedAppName.value = filterAppName.value;
  queryFromFirstPage();
}

/**
 * 重置名称筛选
 */
function handleReset() {
  filterAppName.value = '';
  appliedAppName.value = '';
  queryFromFirstPage();
}

/**
 * 选择应用（再次点击同一项则取消）
 * @param app 应用条目
 */
function handleSelect(app: MyAppItem) {
  const id = Number(app.appId);
  if (!Number.isFinite(id) || id <= 0) {
    return;
  }
  if (selectedId.value === id) {
    selectedId.value = undefined;
    selectedApp.value = null;
    return;
  }
  selectedId.value = id;
  selectedApp.value = app;
}

/**
 * 清除已选应用
 */
function handleClear() {
  selectedId.value = undefined;
  selectedApp.value = null;
}

/**
 * 判断卡片是否选中
 * @param app 应用条目
 * @returns 选中返回 true
 */
function isSelected(app: MyAppItem): boolean {
  return (
    selectedId.value != null && Number(app.appId) === Number(selectedId.value)
  );
}

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchApps();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchApps();
});

watch(selectedId, (id) => {
  if (id == null) {
    selectedApp.value = null;
    return;
  }
  if (Number(selectedApp.value?.appId) === Number(id)) {
    return;
  }
  syncSelectedFromRecords(apps.value);
});

onMounted(() => {
  void fetchApps();
});
</script>

<template>
  <div class="compute-app-picker">
    <div class="compute-app-picker__selected">
      <template v-if="selectedId != null">
        <span class="compute-app-picker__selected-label">
          {{ $t('page.service.mydemand.compute.form.appSelected') }}
        </span>
        <el-tag
          class="compute-app-picker__selected-tag"
          closable
          effect="plain"
          round
          type="primary"
          @close="handleClear"
        >
          {{ selectedDisplayName }}
        </el-tag>
        <el-button
          :icon="Close"
          link
          type="primary"
          @click="handleClear"
        >
          {{ $t('page.service.mydemand.compute.form.appClear') }}
        </el-button>
      </template>
      <span v-else class="compute-app-picker__selected-empty">
        {{ $t('page.service.mydemand.compute.form.appSelectedEmpty') }}
      </span>
    </div>

    <div class="compute-app-picker__toolbar">
      <el-input
        v-model="filterAppName"
        class="compute-app-picker__search"
        clearable
        :placeholder="
          $t('page.service.mydemand.compute.form.appSearchPlaceholder')
        "
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">
        {{ $t('page.service.mydemand.compute.search') }}
      </el-button>
      <el-button @click="handleReset">
        {{ $t('page.service.mydemand.compute.reset') }}
      </el-button>
    </div>

    <div v-loading="loading" class="compute-app-picker__grid">
      <el-empty
        v-if="!loading && apps.length === 0"
        :description="$t('page.service.mydemand.compute.form.appEmpty')"
      />

      <div v-else class="compute-app-picker__list">
        <el-card
          v-for="app in apps"
          :key="app.appId"
          class="compute-app-picker__card"
          :class="{ 'is-selected': isSelected(app) }"
          shadow="hover"
          :body-style="{ padding: '0' }"
          @click="handleSelect(app)"
        >
          <div class="compute-app-picker__cover">
            <span class="compute-app-picker__letter" aria-hidden="true">
              {{ getComputeAppCoverLetter(app) }}
            </span>
            <span
              v-if="isSelected(app)"
              class="compute-app-picker__check"
              aria-hidden="true"
            >
              <el-icon><Check /></el-icon>
            </span>
          </div>

          <div class="compute-app-picker__body">
            <h3
              class="compute-app-picker__title"
              :title="
                displayComputeAppName(
                  app,
                  $t('page.service.mydemand.compute.valueEmpty'),
                )
              "
            >
              {{
                displayComputeAppName(
                  app,
                  $t('page.service.mydemand.compute.valueEmpty'),
                )
              }}
            </h3>
            <div class="compute-app-picker__tags">
              <el-tag effect="plain" round size="small" type="info">
                {{
                  app.appTypeName?.trim() ||
                  $t('page.service.mydemand.compute.valueEmpty')
                }}
              </el-tag>
              <el-tag effect="plain" round size="small">
                {{
                  app.appVersion?.trim() ||
                  $t('page.service.mydemand.compute.valueEmpty')
                }}
              </el-tag>
            </div>
            <p class="compute-app-picker__id">
              ID · {{ app.appId ?? $t('page.service.mydemand.compute.valueEmpty') }}
            </p>
          </div>
        </el-card>
      </div>
    </div>

    <el-card
      v-if="apps.length > 0 || loading || total > 0"
      class="compute-app-picker__pager"
      shadow="never"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        layout="total, sizes, prev, pager, next"
        :disabled="loading"
        :page-sizes="COMPUTE_APP_PICKER_PAGE_SIZE_OPTIONS"
        :total="total"
      />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.compute-app-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  &__selected {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    min-height: 40px;
    padding: 10px 14px;
    background: hsl(var(--primary) / 6%);
    border: 1px dashed hsl(var(--primary) / 35%);
    border-radius: 12px;
  }

  &__selected-label {
    color: hsl(var(--muted-foreground));
    font-size: 13px;
  }

  &__selected-tag {
    max-width: min(100%, 360px);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__selected-empty {
    color: hsl(var(--muted-foreground));
    font-size: 13px;
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__search {
    flex: 1 1 220px;
    max-width: 360px;
  }

  &__grid {
    min-height: 220px;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  &__card {
    cursor: pointer;
    overflow: hidden;
    border-radius: 12px;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }

    &.is-selected {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 1px var(--el-color-primary);
    }
  }

  &__cover {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96px;
    background: linear-gradient(
      145deg,
      hsl(var(--primary) / 14%),
      hsl(190 90% 66% / 20%) 55%,
      hsl(var(--primary) / 10%)
    );
  }

  &__letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    font-size: 22px;
    font-weight: 750;
    color: rgba(255, 255, 255, 0.96);
    background: linear-gradient(
      145deg,
      hsl(var(--primary)),
      hsl(190 90% 66%)
    );
    border-radius: 16px;
    box-shadow: 0 8px 20px hsl(var(--foreground) / 12%);
  }

  &__check {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: #fff;
    background: var(--el-color-primary);
    border-radius: 50%;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px 16px;
  }

  &__title {
    margin: 0;
    overflow: hidden;
    font-size: 15px;
    font-weight: 650;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__id {
    margin: 0;
    color: hsl(var(--muted-foreground));
    font-size: 12px;
  }

  &__pager {
    :deep(.el-card__body) {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    :deep(.el-pagination) {
      flex-wrap: wrap;
      justify-content: flex-end;
    }
  }
}

@media (max-width: 1100px) {
  .compute-app-picker {
    &__list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 768px) {
  .compute-app-picker {
    &__list {
      grid-template-columns: minmax(0, 1fr);
    }

    &__pager {
      :deep(.el-card__body),
      :deep(.el-pagination) {
        justify-content: center;
      }
    }
  }
}
</style>
