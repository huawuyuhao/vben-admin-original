<script lang="ts" setup>
import type { CaseListItem } from '#/types/monitoring/content/case';

import { computed, ref } from 'vue';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { auditCaseApi } from '#/api/monitoring/content/case';

import { CASE_AUDIT_SUBMIT_STATUS } from '../data';

defineOptions({ name: 'AdminCaseAuditDialog' });

const emit = defineEmits<{
  /** 审核提交成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 提交中 */
const submitting = ref(false);
/** 当前案例 */
const currentItem = ref<CaseListItem | null>(null);
/** 审核意见 */
const auditRemark = ref('');

/** 弹窗标题 */
const dialogTitle = computed(() => {
  const name = currentItem.value?.title?.trim();
  return name
    ? $t('page.monitoring.content.case.auditDialog.titleWithName', [name])
    : $t('page.monitoring.content.case.auditDialog.title');
});

/**
 * 打开审核弹窗
 * @param item 案例条目
 */
function open(item: CaseListItem) {
  currentItem.value = item;
  auditRemark.value = '';
  visible.value = true;
}

/**
 * 关闭弹窗并重置
 */
function handleClosed() {
  currentItem.value = null;
  auditRemark.value = '';
  submitting.value = false;
}

/**
 * 提交审核
 */
async function handleSubmit() {
  const item = currentItem.value;
  if (!item?.caseId) {
    return;
  }

  submitting.value = true;
  try {
    await auditCaseApi(item.caseId, {
      // 默认审核状态见 CASE_AUDIT_SUBMIT_STATUS；API 未传时亦默认为 1
      auditStatus: CASE_AUDIT_SUBMIT_STATUS,
      auditRemark: auditRemark.value.trim() || undefined,
    });
    ElMessage.success(
      $t('page.monitoring.content.case.submitAuditSuccess', [
        item.title?.trim() || String(item.caseId),
      ]),
    );
    visible.value = false;
    emit('success');
  } catch {
    // 错误提示由接口层处理
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="480px"
    destroy-on-close
    append-to-body
    @closed="handleClosed"
  >
    <el-form label-position="top" @submit.prevent>
      <el-form-item
        :label="$t('page.monitoring.content.case.auditDialog.remark')"
      >
        <el-input
          v-model="auditRemark"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          :placeholder="
            $t('page.monitoring.content.case.auditDialog.remarkPlaceholder')
          "
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="submitting" @click="visible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('page.monitoring.content.case.auditDialog.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>
