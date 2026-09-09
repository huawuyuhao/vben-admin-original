<script lang="ts" setup>
import type { ProductInfo } from '#/types/service/product';

import { computed, ref } from 'vue';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { auditAdminProductApi } from '#/api/monitoring/content/product';

import { ADMIN_PRODUCT_AUDIT_SUBMIT_STATUS } from '../data';

defineOptions({ name: 'AdminProductAuditDialog' });

const emit = defineEmits<{
  /** 审核提交成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 提交中 */
const submitting = ref(false);
/** 当前产品 */
const currentItem = ref<null | ProductInfo>(null);
/** 审核意见 */
const auditRemark = ref('');

/** 弹窗标题 */
const dialogTitle = computed(() => {
  const name = currentItem.value?.productName?.trim();
  return name
    ? $t('page.monitoring.content.product.auditDialog.titleWithName', [name])
    : $t('page.monitoring.content.product.auditDialog.title');
});

/**
 * 打开审核弹窗
 * @param item 产品条目
 */
function open(item: ProductInfo) {
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
  if (!item) {
    return;
  }

  submitting.value = true;
  try {
    await auditAdminProductApi(item.productId, {
      // 默认审核状态见 ADMIN_PRODUCT_AUDIT_SUBMIT_STATUS；API 未传时亦默认为 1
      auditStatus: ADMIN_PRODUCT_AUDIT_SUBMIT_STATUS,
      auditRemark: auditRemark.value.trim() || undefined,
    });
    ElMessage.success(
      $t('page.monitoring.content.product.submitAuditSuccess', [
        item.productName,
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
        :label="$t('page.monitoring.content.product.auditDialog.remark')"
      >
        <el-input
          v-model="auditRemark"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          :placeholder="
            $t('page.monitoring.content.product.auditDialog.remarkPlaceholder')
          "
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="submitting" @click="visible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('page.monitoring.content.product.auditDialog.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>
