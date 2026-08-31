<script lang="ts" setup>
import type { SubAccountItem } from '#/types/admin/enterprise/accounts';

import { onMounted, ref, watch } from 'vue';

import { Download, Plus, Refresh } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { downloadFileFromUrl } from '@vben/utils';
import { ElMessage } from 'element-plus';

import {
  deleteSubAccountApi,
  exportSubAccountApi,
  getSubAccountListApi,
} from '#/api/admin/enterprise/accounts';

import {
  normalizeSubAccountPage,
  parseSubAccountStatusFilter,
  resolveSubAccountExportDownloadUrl,
  SUB_ACCOUNT_PAGE_SIZE,
  type SubAccountStatusFilter,
} from './data';
import AccountPager from './modules/account-pager.vue';
import AccountTable from './modules/account-table.vue';
import FilterBar from './modules/filter-bar.vue';
import FormDialog from './modules/form-dialog.vue';
import PermissionDialog from './modules/permission-dialog.vue';
import ResetPasswordDialog from './modules/reset-password-dialog.vue';

/**
 * 管理 · 企业子账号管理
 * 对接子账号列表 / 增删改 / 权限 / 重置密码 / 导出
 */
defineOptions({ name: 'AdminEnterpriseAccounts' });

/** 筛选草稿：用户名 */
const filterUsername = ref('');
/** 筛选草稿：部门 */
const filterDepartment = ref('');
/** 筛选草稿：状态 */
const filterStatus = ref<SubAccountStatusFilter>('');

/** 已生效筛选 */
const appliedUsername = ref('');
const appliedDepartment = ref('');
const appliedStatus = ref<SubAccountStatusFilter>('');

/** 当前页码 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(SUB_ACCOUNT_PAGE_SIZE);
/** 列表加载中 */
const loading = ref(false);
/** 导出中 */
const exporting = ref(false);
/** 当前页列表 */
const accounts = ref<SubAccountItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 跳过由服务端回写 current 触发的重复请求 */
const syncingFromServer = ref(false);

/** 新增 / 编辑表单弹窗 */
const formDialogRef = ref<InstanceType<typeof FormDialog>>();
/** 权限分配弹窗 */
const permissionDialogRef = ref<InstanceType<typeof PermissionDialog>>();
/** 重置密码弹窗 */
const resetPasswordDialogRef =
  ref<InstanceType<typeof ResetPasswordDialog>>();

/**
 * 拉取当前页子账号列表
 */
async function fetchAccounts() {
  loading.value = true;
  try {
    const data = await getSubAccountListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      username: appliedUsername.value.trim() || undefined,
      department: appliedDepartment.value.trim() || undefined,
      status: parseSubAccountStatusFilter(appliedStatus.value),
    });
    const page = normalizeSubAccountPage(data);
    accounts.value = page.records;
    total.value = page.total;

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    accounts.value = [];
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
  void fetchAccounts();
}

/**
 * 提交查询
 */
function handleSearch() {
  appliedUsername.value = filterUsername.value;
  appliedDepartment.value = filterDepartment.value;
  appliedStatus.value = filterStatus.value;
  queryFromFirstPage();
}

/**
 * 重置筛选并查询
 */
function handleReset() {
  filterUsername.value = '';
  filterDepartment.value = '';
  filterStatus.value = '';
  appliedUsername.value = '';
  appliedDepartment.value = '';
  appliedStatus.value = '';
  queryFromFirstPage();
}

/**
 * 刷新当前页
 */
function handleRefresh() {
  void fetchAccounts();
}

/**
 * 打开新增弹窗
 */
function handleCreate() {
  formDialogRef.value?.openCreate();
}

/**
 * 打开编辑弹窗
 * @param row 列表行
 */
function handleEdit(row: SubAccountItem) {
  formDialogRef.value?.openEdit(row);
}

/**
 * 打开权限分配弹窗
 * @param row 列表行
 */
function handlePermission(row: SubAccountItem) {
  permissionDialogRef.value?.open(row);
}

/**
 * 打开重置密码弹窗
 * @param row 列表行
 */
function handleResetPassword(row: SubAccountItem) {
  resetPasswordDialogRef.value?.open(row);
}

/**
 * 删除子账号（Popconfirm 确认后执行）
 * @param row 列表行
 */
async function handleDelete(row: SubAccountItem) {
  const id = Number(row.subAccountId);
  if (!Number.isFinite(id) || id <= 0) {
    ElMessage.warning($t('page.admin.enterprise.accounts.form.invalidId'));
    return;
  }

  try {
    await deleteSubAccountApi(id);
    ElMessage.success($t('page.admin.enterprise.accounts.delete.success'));
    void fetchAccounts();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 导出当前筛选条件下的子账号列表
 */
async function handleExport() {
  exporting.value = true;
  try {
    const result = await exportSubAccountApi({
      username: appliedUsername.value.trim() || undefined,
      status: parseSubAccountStatusFilter(appliedStatus.value),
    });
    const downloadUrl = resolveSubAccountExportDownloadUrl(result?.fileUrl);
    if (!downloadUrl) {
      ElMessage.warning(
        $t('page.admin.enterprise.accounts.export.invalidUrl'),
      );
      return;
    }
    await downloadFileFromUrl({
      source: downloadUrl,
      fileName: result?.fileName || 'sub-accounts.xlsx',
    });
    ElMessage.success($t('page.admin.enterprise.accounts.export.success'));
  } catch {
    // 错误提示由接口层处理
  } finally {
    exporting.value = false;
  }
}

/**
 * 表单提交成功后刷新列表
 */
function handleFormSuccess() {
  void fetchAccounts();
}

watch(pageSize, () => {
  if (syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchAccounts();
});

watch(currentPage, () => {
  if (syncingFromServer.value) {
    return;
  }
  void fetchAccounts();
});

onMounted(() => {
  void fetchAccounts();
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
              {{ $t('page.admin.enterprise.accounts.eyebrow') }}
            </p>
            <h2>{{ $t('page.admin.enterprise.accounts.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.admin.enterprise.accounts.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="loading"
              @click="handleRefresh"
            >
              {{ $t('page.admin.enterprise.accounts.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              :icon="Download"
              :loading="exporting"
              @click="handleExport"
            >
              {{ $t('page.admin.enterprise.accounts.export.btn') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              {{ $t('page.admin.enterprise.accounts.add') }}
            </el-button>
          </div>
        </header>

        <FilterBar
          v-model:username="filterUsername"
          v-model:department="filterDepartment"
          v-model:status="filterStatus"
          @search="handleSearch"
          @reset="handleReset"
        />

        <AccountTable
          :accounts="accounts"
          :loading="loading"
          @edit="handleEdit"
          @permission="handlePermission"
          @reset-password="handleResetPassword"
          @delete="handleDelete"
        />

        <AccountPager
          v-if="accounts.length > 0 || loading || total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :disabled="loading"
          :total="total"
        />
      </div>
    </div>

    <FormDialog ref="formDialogRef" @success="handleFormSuccess" />
    <PermissionDialog ref="permissionDialogRef" @success="handleFormSuccess" />
    <ResetPasswordDialog ref="resetPasswordDialogRef" />
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';
</style>
