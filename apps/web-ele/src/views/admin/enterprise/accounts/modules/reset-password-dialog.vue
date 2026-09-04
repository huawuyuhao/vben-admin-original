<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';

import type { SubAccountItem } from '#/types/admin/enterprise/accounts';

import { computed, reactive, ref } from 'vue';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { resetSubAccountPasswordApi } from '#/api/admin/enterprise/accounts';

import { PASSWORD_PATTERN } from '../data';

defineOptions({ name: 'AdminEnterpriseAccountsResetPasswordDialog' });

/** 弹窗可见 */
const visible = ref(false);
/** 当前子账号 ID */
const accountId = ref<null | number>(null);
/** 展示用用户名 */
const accountName = ref('');
/** 提交中 */
const submitting = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  newPassword: '',
  confirmPassword: '',
});

/** 弹窗标题 */
const dialogTitle = computed(() =>
  accountName.value
    ? $t('page.admin.enterprise.accounts.resetPassword.titleWithName', [
        accountName.value,
      ])
    : $t('page.admin.enterprise.accounts.resetPassword.title'),
);

/** 校验规则 */
const rules = computed<FormRules>(() => ({
  newPassword: [
    {
      required: true,
      message: () =>
        $t('page.admin.enterprise.accounts.resetPassword.passwordRequired'),
      trigger: 'blur',
    },
    {
      validator: (_rule, value: string, callback) => {
        const text = String(value ?? '');
        if (!text) {
          callback();
          return;
        }
        if (!PASSWORD_PATTERN.test(text)) {
          callback(
            new Error(
              $t('page.admin.enterprise.accounts.resetPassword.passwordPattern'),
            ),
          );
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: () =>
        $t('page.admin.enterprise.accounts.resetPassword.confirmRequired'),
      trigger: 'blur',
    },
    {
      validator: (_rule, value: string, callback) => {
        if (String(value ?? '') !== form.newPassword) {
          callback(
            new Error(
              $t('page.admin.enterprise.accounts.resetPassword.confirmMismatch'),
            ),
          );
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
}));

/**
 * 重置表单
 */
function resetForm() {
  form.newPassword = '';
  form.confirmPassword = '';
  formRef.value?.clearValidate();
}

/**
 * 打开重置密码弹窗
 * @param row 列表行
 */
function open(row: SubAccountItem) {
  const id = Number(row.subAccountId);
  if (!Number.isFinite(id) || id <= 0) {
    ElMessage.warning($t('page.admin.enterprise.accounts.form.invalidId'));
    return;
  }
  accountId.value = id;
  accountName.value =
    row.username?.trim() || row.realName?.trim() || String(id);
  resetForm();
  visible.value = true;
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
  accountId.value = null;
  accountName.value = '';
  resetForm();
}

/**
 * 提交重置密码
 */
async function handleSubmit() {
  if (accountId.value == null) {
    return;
  }
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitting.value = true;
  try {
    await resetSubAccountPasswordApi(accountId.value, {
      newPassword: form.newPassword,
    });
    ElMessage.success(
      $t('page.admin.enterprise.accounts.resetPassword.success'),
    );
    handleClose();
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
    destroy-on-close
    :title="dialogTitle"
    width="440px"
    @closed="handleClose"
  >
    <el-form
      ref="formRef"
      label-position="top"
      require-asterisk-position="right"
      :model="form"
      :rules="rules"
    >
      <el-form-item
        :label="$t('page.admin.enterprise.accounts.resetPassword.newPassword')"
        prop="newPassword"
        required
      >
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          maxlength="64"
          clearable
          :placeholder="
            $t(
              'page.admin.enterprise.accounts.resetPassword.passwordPlaceholder',
            )
          "
        />
      </el-form-item>

      <el-form-item
        :label="
          $t('page.admin.enterprise.accounts.resetPassword.confirmPassword')
        "
        prop="confirmPassword"
        required
      >
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          maxlength="64"
          clearable
          :placeholder="
            $t(
              'page.admin.enterprise.accounts.resetPassword.confirmPlaceholder',
            )
          "
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.admin.enterprise.accounts.form.cancel') }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('page.admin.enterprise.accounts.resetPassword.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>
