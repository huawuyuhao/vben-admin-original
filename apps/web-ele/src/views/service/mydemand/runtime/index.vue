<script lang="ts" setup>
import type { RunningTaskItem } from '#/types/service/mydemand/runtime';

import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  closeRunningTaskApi,
  getRunningTaskListApi,
} from '#/api/service/mydemand/runtime';

import {
  normalizeRuntimePage,
  resolveRunningTaskId,
  RUNTIME_PAGE_SIZE,
} from './data';
import TaskPager from './modules/task-pager.vue';
import TaskTable from './modules/task-table.vue';

/**
 * 门户服务 · 应用运行管理
 * 对接在运列表与关闭任务；详情跳转独立页串联监控接口
 */
defineOptions({ name: 'ServiceMyDemandRuntime' });

const router = useRouter();

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(RUNTIME_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 当前页任务列表 */
const tasks = ref<RunningTaskItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);
/** 正在关闭的任务 ID */
const closingId = ref<null | string>(null);

/**
 * 拉取当前页在运应用列表
 */
async function fetchTasks() {
  loading.value = true;
  try {
    const data = await getRunningTaskListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    const page = normalizeRuntimePage(data);
    tasks.value = page.records;
    total.value = page.total;

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    tasks.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 手动刷新当前页
 */
function handleRefresh() {
  void fetchTasks();
}

/**
 * 跳转运行详情页
 * @param row 列表行
 */
function handleDetail(row: RunningTaskItem) {
  const id = resolveRunningTaskId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.runtime.invalidId'));
    return;
  }
  void router.push({
    path: '/service/mydemand/runtime/detail',
    query: { id: String(id) },
  });
}

/**
 * 关闭任务
 * @param row 列表行
 */
async function handleClose(row: RunningTaskItem) {
  const id = resolveRunningTaskId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.runtime.invalidId'));
    return;
  }

  closingId.value = id;
  try {
    const result = await closeRunningTaskApi(id);
    const tip = typeof result === 'string' ? result.trim() : '';
    ElMessage.success(
      tip || $t('page.service.mydemand.runtime.close.success'),
    );
    void fetchTasks();
  } catch {
    // 错误提示由接口层处理
  } finally {
    closingId.value = null;
  }
}

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchTasks();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchTasks();
});

onMounted(() => {
  void fetchTasks();
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
              {{ $t('page.service.mydemand.runtime.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.mydemand.runtime.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.mydemand.runtime.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.service.mydemand.runtime.refresh') }}
            </el-button>
          </div>
        </header>

        <TaskTable
          :closing-id="closingId"
          :loading="loading"
          :tasks="tasks"
          @close="handleClose"
          @detail="handleDetail"
        />

        <TaskPager
          v-if="tasks.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';
</style>
