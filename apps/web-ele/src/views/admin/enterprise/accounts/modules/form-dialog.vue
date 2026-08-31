<script lang="ts" setup>
import type { SubAccountItem, SubAccountStatus } from '#/types/admin/enterprise/accounts';
import type { FormInstance, FormRules } from 'element-plus';

import { computed, reactive, ref } from 'vue';

import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import {
  createSubAccountApi,
  updateSubAccountApi,
} from '#/api/admin/enterprise/accounts';

import {
  getSubAccountStatusOptions,
  PASSWORD_PATTERN,
  PHONE_PATTERN,
  SUB_ACCOUNT_STATUS_ENABLED,
} from '../data';

defineOptions({ name: 'AdminEnterpriseAccountsFormDialog' });

const emit = defineEmits<{
  /** 提交成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 编辑中的子账号 ID；新增时为空 */
const editingId = ref<null | number>(null);
/** 提交中 */
const submitting = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  username: '',
  realName: '',
  department: '',
  phone: '',
  password: '',
  expireDate: '',
  status: SUB_ACCOUNT_STATUS_ENABLED as SubAccountStatus,
});

/** 是否编辑模式 */
const isEdit = computed(() => editingId.value != null);

/** 弹窗标题 */
const dialogTitle = computed(() =>
  isEdit.value
    ? $t('page.admin.enterprise.accounts.form.editTitle')
    : $t('page.admin.enterprise.accounts.form.createTitle'),
);

/** 状态选项 */
const statusOptions = computed(() => getSubAccountStatusOptions());

/** 表单校验规则 */
const rules = computed<FormRules>(() => {
  const base: FormRules = {
    realName: [
      {
        required: true,
        message: () =>
          $t('page.admin.enterprise.accounts.form.realNameRequired'),
        trigger: 'blur',
      },
    ],
    phone: [
      {
        validator: (_rule, value: string, callback) => {
          const text = String(value ?? '').trim();
          if (!text) {
            callback();
            return;
          }
          if (!PHONE_PATTERN.test(text)) {
            callback(
              new Error(
                $t('page.admin.enterprise.accounts.form.invalidPhone'),
              ),
            );
            return;
          }
          callback();
        },
        trigger: 'blur',
      },
    ],
  };

  if (isEdit.value) {
    base.status = [
      {
        required: true,
        message: () =>
          $t('page.admin.enterprise.accounts.form.statusRequired'),
        trigger: 'change',
      },
    ];
  } else {
    base.username = [
      {
        required: true,
        message: () =>
          $t('page.admin.enterprise.accounts.form.usernameRequired'),
        trigger: 'blur',
      },
      {
        min: 3,
        max: 30,
        message: () =>
          $t('page.admin.enterprise.accounts.form.usernameLength'),
        trigger: 'blur',
      },
    ];
    base.password = [
      {
        required: true,
        message: () =>
          $t('page.admin.enterprise.accounts.form.passwordRequired'),
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
                $t('page.admin.enterprise.accounts.form.passwordPattern'),
              ),
            );
            return;
          }
          callback();
        },
        trigger: 'blur',
      },
    ];
  }

  return base;
});

/**
 * 重置表单为初始值
 */
function resetForm() {
  form.username = '';
  form.realName = '';
  form.department = '';
  form.phone = '';
  form.password = '';
  form.expireDate = '';
  form.status = SUB_ACCOUNT_STATUS_ENABLED;
  formRef.value?.clearValidate();
}

/**
 * 打开新增弹窗
 */
function openCreate() {
  editingId.value = null;
  resetForm();
  visible.value = true;
}

/**
 * 打开编辑弹窗并回填
 * @param row 列表行
 */
function openEdit(row: SubAccountItem) {
  const id = Number(row.subAccountId);
  if (!Number.isFinite(id) || id <= 0) {
    ElMessage.warning($t('page.admin.enterprise.accounts.form.invalidId'));
    return;
  }
  editingId.value = id;
  form.username = String(row.username ?? '');
  form.realName = String(row.realName ?? '');
  form.department = String(row.department ?? '');
  form.phone = String(row.phone ?? '');
  form.password = '';
  form.expireDate = String(row.expireDate ?? '').slice(0, 10);
  form.status =
    Number(row.status) === 0
      ? 0
      : SUB_ACCOUNT_STATUS_ENABLED;
  visible.value = true;
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
  resetForm();
  editingId.value = null;
}

/**
 * 提交新增 / 修改
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value && editingId.value != null) {
      await updateSubAccountApi(editingId.value, {
        realName: form.realName.trim(),
        status: form.status,
        department: form.department.trim() || undefined,
        expireDate: form.expireDate.trim() || undefined,
      });
      ElMessage.success(
        $t('page.admin.enterprise.accounts.form.updateSuccess'),
      );
    } else {
      await createSubAccountApi({
        username: form.username.trim(),
        realName: form.realName.trim(),
        password: form.password,
        department: form.department.trim() || undefined,
        phone: form.phone.trim() || undefined,
        expireDate: form.expireDate.trim() || undefined,
      });
      ElMessage.success(
        $t('page.admin.enterprise.accounts.form.createSuccess'),
      );
    }
    handleClose();
    emit('success');
  } catch {
    // 错误提示由接口层处理
  } finally {
    submitting.value = false;
  }
}

defineExpose({
  openCreate,
  openEdit,
});
</script>

<template>
  <el-dialog
    v-model="visible"
    destroy-on-close
    :title="dialogTitle"
    width="560px"
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
        v-if="!isEdit"
        :label="$t('page.admin.enterprise.accounts.fields.username')"
        prop="username"
        required
      >
        <el-input
          v-model="form.username"
          maxlength="30"
          clearable
          :placeholder="
            $t('page.admin.enterprise.accounts.form.usernamePlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        v-else
        :label="$t('page.admin.enterprise.accounts.fields.username')"
      >
        <el-input :model-value="form.username" disabled />
      </el-form-item>

      <el-form-item
        :label="$t('page.admin.enterprise.accounts.fields.realName')"
        prop="realName"
        required
      >
        <el-input
          v-model="form.realName"
          maxlength="50"
          clearable
          :placeholder="
            $t('page.admin.enterprise.accounts.form.realNamePlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        :label="$t('page.admin.enterprise.accounts.fields.department')"
        prop="department"
      >
        <el-input
          v-model="form.department"
          maxlength="50"
          clearable
          :placeholder="
            $t('page.admin.enterprise.accounts.form.departmentPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        v-if="!isEdit"
        :label="$t('page.admin.enterprise.accounts.fields.phone')"
        prop="phone"
      >
        <el-input
          v-model="form.phone"
          maxlength="14"
          clearable
          :placeholder="
            $t('page.admin.enterprise.accounts.form.phonePlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        v-if="!isEdit"
        :label="$t('page.admin.enterprise.accounts.fields.password')"
        prop="password"
        required
      >
        <el-input
          v-model="form.password"
          type="password"
          show-password
          maxlength="64"
          clearable
          :placeholder="
            $t('page.admin.enterprise.accounts.form.passwordPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        :label="$t('page.admin.enterprise.accounts.fields.expireDate')"
        prop="expireDate"
      >
        <el-date-picker
          v-model="form.expireDate"
          class="accounts-form__date"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="
            $t('page.admin.enterprise.accounts.form.expireDatePlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        v-if="isEdit"
        :label="$t('page.admin.enterprise.accounts.fields.status')"
        prop="status"
        required
      >
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="opt in statusOptions"
            :key="opt.value"
            :value="opt.value"
            border
          >
            {{ opt.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <p v-if="!isEdit" class="accounts-form__hint">
        {{ $t('page.admin.enterprise.accounts.form.createHint') }}
      </p>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.admin.enterprise.accounts.form.cancel') }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('page.admin.enterprise.accounts.form.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.accounts-form {
  &__date {
    width: 100%;
  }

  &__hint {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }
}
</style>
