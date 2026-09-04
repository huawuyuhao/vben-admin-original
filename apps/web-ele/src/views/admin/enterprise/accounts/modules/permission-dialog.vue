<script lang="ts" setup>
import type { SubAccountItem } from '#/types/admin/enterprise/accounts';

import { computed, ref } from 'vue';

import { $t, useI18n } from '@vben/locales';

import { ElMessage, ElTree } from 'element-plus';

import { assignSubAccountPermissionApi } from '#/api/admin/enterprise/accounts';

import { buildAssignableMenuTree, joinMenuIds } from '../data';

defineOptions({ name: 'AdminEnterpriseAccountsPermissionDialog' });

const emit = defineEmits<{
  /** 提交成功 */
  success: [];
}>();

const { locale } = useI18n();

/** 弹窗可见 */
const visible = ref(false);
/** 当前子账号 ID */
const accountId = ref<null | number>(null);
/** 展示用用户名 */
const accountName = ref('');
/** 提交中 */
const submitting = ref(false);
/** 树引用 */
const treeRef = ref<InstanceType<typeof ElTree>>();

/** 可分配菜单树（随语言切换） */
const menuTree = computed(() => {
  void locale.value;
  return buildAssignableMenuTree();
});

/** 弹窗标题 */
const dialogTitle = computed(() =>
  accountName.value
    ? $t('page.admin.enterprise.accounts.permission.titleWithName', [
        accountName.value,
      ])
    : $t('page.admin.enterprise.accounts.permission.title'),
);

/**
 * 打开权限分配弹窗
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
  visible.value = true;
  // 文档无查询已分配权限接口，打开时清空勾选
  queueMicrotask(() => {
    treeRef.value?.setCheckedKeys([]);
  });
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
  accountId.value = null;
  accountName.value = '';
  treeRef.value?.setCheckedKeys([]);
}

/**
 * 提交菜单权限
 */
async function handleSubmit() {
  if (accountId.value == null) {
    return;
  }

  const checked = (treeRef.value?.getCheckedKeys(false) ?? []) as Array<
    number | string
  >;
  const half = (treeRef.value?.getHalfCheckedKeys() ?? []) as Array<
    number | string
  >;
  const menuIds = joinMenuIds([...checked, ...half]);

  if (!menuIds) {
    ElMessage.warning(
      $t('page.admin.enterprise.accounts.permission.required'),
    );
    return;
  }

  submitting.value = true;
  try {
    await assignSubAccountPermissionApi(accountId.value, { menuIds });
    ElMessage.success(
      $t('page.admin.enterprise.accounts.permission.success'),
    );
    handleClose();
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
    destroy-on-close
    :title="dialogTitle"
    width="480px"
    @closed="handleClose"
  >
    <p class="accounts-permission__hint">
      {{ $t('page.admin.enterprise.accounts.permission.hint') }}
    </p>
    <ElTree
      ref="treeRef"
      class="accounts-permission__tree"
      :data="menuTree"
      default-expand-all
      node-key="id"
      show-checkbox
      :props="{ label: 'label', children: 'children' }"
    />

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.admin.enterprise.accounts.form.cancel') }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('page.admin.enterprise.accounts.permission.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.accounts-permission {
  &__hint {
    margin: 0 0 12px;
    font-size: 12px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }

  &__tree {
    max-height: 360px;
    padding: 8px 4px;
    overflow: auto;
    background: hsl(var(--background) / 60%);
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
  }
}
</style>
