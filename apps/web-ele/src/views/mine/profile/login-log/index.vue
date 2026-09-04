<script lang="ts" setup>
import type { LoginLogItem } from '#/types/mine/profile/login-log';

import { onMounted, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { downloadFileFromUrl } from '@vben/utils';

import { Download, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  exportLoginLogApi,
  getLoginLogListApi,
} from '#/api/mine/profile/login-log';

import {
  buildLoginLogTimeParams,
  LOGIN_LOG_PAGE_SIZE,
  type LoginLogStatusFilter,
  type LoginLogTimeRange,
  normalizeLoginLogPage,
  parseLoginLogStatusFilter,
  resolveLoginLogExportDownloadUrl,
} from './data';
import FilterBar from './modules/filter-bar.vue';
import LogPager from './modules/log-pager.vue';
import LogTable from './modules/log-table.vue';

/**
 * 我的 · 登录日志
 * 对接 GET /monitor/logininfor/list、POST /monitor/logininfor/export
 */
defineOptions({ name: 'MineProfileLoginLog' });

/** 筛选草稿：用户账号 */
const filterUserName = ref('');
/** 筛选草稿：登录 IP */
const filterIpaddr = ref('');
/** 筛选草稿：登录地点 */
const filterLoginLocation = ref('');
/** 筛选草稿：登录状态 */
const filterStatus = ref<LoginLogStatusFilter>('');
/** 筛选草稿：访问时间范围 */
const filterLoginTimeRange = ref<LoginLogTimeRange>(null);

/** 已生效筛选 */
const appliedUserName = ref('');
const appliedIpaddr = ref('');
const appliedLoginLocation = ref('');
const appliedStatus = ref<LoginLogStatusFilter>('');
const appliedLoginTimeRange = ref<LoginLogTimeRange>(null);

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(LOGIN_LOG_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 导出中 */
const exporting = ref(false);
/** 当前页记录 */
const records = ref<LoginLogItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);

/**
 * 组装当前生效的筛选查询参数（不含分页）
 */
function buildAppliedFilterParams() {
  return {
    userName: appliedUserName.value.trim() || undefined,
    ipaddr: appliedIpaddr.value.trim() || undefined,
    loginLocation: appliedLoginLocation.value.trim() || undefined,
    status: parseLoginLogStatusFilter(appliedStatus.value),
    ...buildLoginLogTimeParams(appliedLoginTimeRange.value),
  };
}

/**
 * 拉取当前页登录日志
 */
async function fetchLoginLogs() {
  loading.value = true;
  try {
    const data = await getLoginLogListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...buildAppliedFilterParams(),
    });
    const page = normalizeLoginLogPage(data);
    records.value = page.records;
    total.value = page.total;

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    records.value = [];
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
  void fetchLoginLogs();
}

/**
 * 提交查询
 */
function handleSearch() {
  appliedUserName.value = filterUserName.value;
  appliedIpaddr.value = filterIpaddr.value;
  appliedLoginLocation.value = filterLoginLocation.value;
  appliedStatus.value = filterStatus.value;
  appliedLoginTimeRange.value = filterLoginTimeRange.value;
  queryFromFirstPage();
}

/**
 * 重置筛选并查询
 */
function handleReset() {
  filterUserName.value = '';
  filterIpaddr.value = '';
  filterLoginLocation.value = '';
  filterStatus.value = '';
  filterLoginTimeRange.value = null;
  appliedUserName.value = '';
  appliedIpaddr.value = '';
  appliedLoginLocation.value = '';
  appliedStatus.value = '';
  appliedLoginTimeRange.value = null;
  queryFromFirstPage();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  void fetchLoginLogs();
}

/**
 * 按当前筛选条件导出登录日志
 */
async function handleExport() {
  exporting.value = true;
  try {
    const result = await exportLoginLogApi(buildAppliedFilterParams());
    const downloadUrl = resolveLoginLogExportDownloadUrl(result?.fileUrl);
    if (!downloadUrl) {
      ElMessage.error($t('page.mine.loginLog.export.noUrl'));
      return;
    }
    await downloadFileFromUrl({
      source: downloadUrl,
      fileName: result?.fileName?.trim() || undefined,
    });
    ElMessage.success($t('page.mine.loginLog.export.success'));
  } catch {
    // 错误提示由接口层处理
  } finally {
    exporting.value = false;
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
  void fetchLoginLogs();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchLoginLogs();
});

onMounted(() => {
  void fetchLoginLogs();
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
              {{ $t('page.mine.loginLog.eyebrow') }}
            </p>
            <h2>{{ $t('page.mine.loginLog.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.mine.loginLog.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.mine.loginLog.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Download"
              :loading="exporting"
              @click="handleExport"
            >
              {{ $t('page.mine.loginLog.export.btn') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:user-name="filterUserName"
          v-model:ipaddr="filterIpaddr"
          v-model:login-location="filterLoginLocation"
          v-model:status="filterStatus"
          v-model:login-time-range="filterLoginTimeRange"
          @search="handleSearch"
          @reset="handleReset"
        />

        <LogTable :loading="loading" :records="records" />

        <LogPager
          v-if="records.length > 0 || loading || total > 0"
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
