<script lang="ts" setup>
/**
 * 按需引入 Element Plus 按钮样式
 */
import 'element-plus/es/components/button/style/css';

import type { EnterpriseCertForm } from './data';

import { computed, onMounted, reactive, ref } from 'vue';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import {
  getEnterpriseCertProgressApi,
  submitEnterpriseCertApi,
} from '#/api/mine/register/enterprise';

import {
  buildAuthStatusMeta,
  createCertForm,
  normalizeAuthStatus,
  readCachedAuthId,
  sanitizeAuditRemark,
  saveCachedAuthId,
} from './data';
import ApplyForm from './modules/apply-form.vue';
import StatusPanel from './modules/status-panel.vue';

/**
 * 我的 · 企业用户认证（提交材料 + 查询进度）
 */
defineOptions({ name: 'MineRegisterEnterprise' });

/** 归一化后的认证状态 */
const authStatus = ref<'approved' | 'draft' | 'rejected' | 'reviewing'>('draft');
/** 审核备注 */
const auditRemark = ref('');
/** 当前认证 ID */
const authId = ref(readCachedAuthId());
/** 提交中 */
const submitting = ref(false);
/** 进度查询中 */
const progressLoading = ref(false);

/** 申请表单（企业 ID 不预填，由用户自行输入） */
const form = reactive<EnterpriseCertForm>(createCertForm());

/** 状态展示元数据 */
const statusMeta = computed(() =>
  buildAuthStatusMeta(authStatus.value, auditRemark.value),
);

/** 仅审核中只读；已认证 / 已驳回 / 未提交均可填写并重复申请 */
const readonly = computed(() => authStatus.value === 'reviewing');

/** 已认证，可再次申请 */
const canReapply = computed(() => authStatus.value === 'approved');

/**
 * 用进度接口结果更新页面状态
 * @param status 原始 authStatus（integer）
 * @param remark 审核备注
 */
function applyProgress(status?: number | string, remark?: string) {
  authStatus.value = normalizeAuthStatus(status);
  auditRemark.value = sanitizeAuditRemark(remark);
}

/**
 * 将缓存 / 入参解析为认证 ID（integer）
 * @param id 原始 ID
 * @returns 合法 integer，否则 NaN
 */
function parseAuthId(id?: number | string): number {
  const num = Number(id);
  return Number.isFinite(num) && Number.isInteger(num) ? num : Number.NaN;
}

/**
 * 查询认证进度（无表单回显接口，进页先查状态）
 * @param id 认证 ID（提交返参 key）；不传则带本地缓存，再没有则不带 authId
 */
async function fetchProgress(id?: number | string) {
  const queryId = parseAuthId(id ?? authId.value);
  progressLoading.value = true;
  try {
    const data = await getEnterpriseCertProgressApi(
      Number.isNaN(queryId) ? undefined : { authId: queryId },
    );
    applyProgress(data?.authStatus, data?.auditRemark);
  } catch {
    // 错误提示由请求拦截器处理；无历史认证时保持草稿态
  } finally {
    progressLoading.value = false;
  }
}

/**
 * 提交企业认证
 * @param payload 校验后的表单
 */
async function handleSubmit(payload: EnterpriseCertForm) {
  if (readonly.value) {
    ElMessage.warning($t('page.mine.register.enterprise.message.readonlyHint'));
    return;
  }
  const enterpriseId = Number(payload.enterpriseId);
  if (
    !Number.isFinite(enterpriseId) ||
    !Number.isInteger(enterpriseId) ||
    enterpriseId <= 0
  ) {
    ElMessage.warning(
      $t('page.mine.register.enterprise.form.enterpriseIdInvalid'),
    );
    return;
  }
  submitting.value = true;
  try {
    const result = await submitEnterpriseCertApi({
      enterpriseId,
      legalPersonName: payload.legalPersonName.trim(),
      idCardNo: payload.idCardNo.trim(),
      idCardFront: payload.idCardFront,
      idCardBack: payload.idCardBack,
      businessLicense: payload.businessLicense,
    });
    const nextAuthId = parseAuthId(result?.key);
    if (Number.isNaN(nextAuthId)) {
      ElMessage.error($t('page.mine.register.enterprise.message.noAuthId'));
      return;
    }
    authId.value = String(nextAuthId);
    saveCachedAuthId(authId.value);
    Object.assign(form, payload);
    ElMessage.success($t('page.mine.register.enterprise.message.submitSuccess'));
    // 提交成功后立刻查一次进度
    await fetchProgress(nextAuthId);
    if (authStatus.value === 'draft') {
      applyProgress(1);
    }
  } catch {
    // 错误提示由请求拦截器处理
  } finally {
    submitting.value = false;
  }
}

/**
 * 表单重置后的提示
 */
function handleReset() {
  ElMessage.info($t('page.mine.register.enterprise.message.resetDone'));
}

/**
 * 手动刷新进度
 */
async function handleRefreshProgress() {
  await fetchProgress(authId.value);
  ElMessage.success($t('page.mine.register.enterprise.message.refreshDone'));
}

/**
 * 进入页面先查认证进度（暂无已填信息回显接口）
 */
onMounted(() => {
  void fetchProgress();
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
              {{ $t('page.mine.register.enterprise.eyebrow') }}
            </p>
            <h2>{{ $t('page.mine.register.enterprise.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.mine.register.enterprise.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :loading="progressLoading"
              @click="handleRefreshProgress"
            >
              {{ $t('page.mine.register.enterprise.actions.refresh') }}
            </el-button>
          </div>
        </header>

        <StatusPanel :meta="statusMeta" />

        <ApplyForm
          v-model="form"
          :can-reapply="canReapply"
          :readonly="readonly"
          :submitting="submitting"
          @reset="handleReset"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';
</style>
