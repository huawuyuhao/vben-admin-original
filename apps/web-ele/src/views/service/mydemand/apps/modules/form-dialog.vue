<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';

import type { MyAppItem } from '#/types/service/mydemand/apps';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { createMyAppApi, updateMyAppApi } from '#/api/service/mydemand/apps';

import { useAppTypeOptions } from '../composables/use-app-type-options';
import {
  APP_STATUS_OFF,
  APP_STATUS_ON,
  matchAppTypeSelectValue,
  resolveAppTypeOptionValue,
  resolveMyAppId,
} from '../data';

defineOptions({ name: 'MyDemandAppsFormDialog' });

const emit = defineEmits<{
  /** 提交成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 编辑中的应用 ID；新增时为空 */
const editingId = ref<null | number>(null);
/** 提交中 */
const submitting = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  appName: '',
  appVersion: '',
  appType: undefined as number | undefined,
  appStatus: APP_STATUS_ON as number,
});

const { typeOptions, typeLoading, fetchTypeOptions, handleTypeRemoteSearch } =
  useAppTypeOptions();

/**
 * 可写入表单的类型选项（typeId / typeCode 任一可转数字即可）
 */
const selectableTypeOptions = computed(() =>
  typeOptions.value
    .map((item) => {
      const value = resolveAppTypeOptionValue(item);
      return {
        key: String(item.typeId ?? item.typeCode ?? value ?? ''),
        label: item.typeName || item.typeCode || String(item.typeId ?? ''),
        value,
      };
    })
    .filter(
      (item): item is { key: string; label: string; value: number } =>
        item.value != null,
    ),
);

/** 是否编辑模式 */
const isEdit = computed(() => editingId.value != null);

/** 弹窗标题 */
const dialogTitle = computed(() =>
  isEdit.value
    ? $t('page.service.mydemand.apps.form.editTitle')
    : $t('page.service.mydemand.apps.form.createTitle'),
);

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  appName: [
    {
      required: true,
      message: () => $t('page.service.mydemand.apps.form.appNameRequired'),
      trigger: 'blur',
    },
  ],
  appVersion: [
    {
      required: true,
      message: () => $t('page.service.mydemand.apps.form.appVersionRequired'),
      trigger: 'blur',
    },
  ],
  appType: [
    {
      required: true,
      message: () => $t('page.service.mydemand.apps.form.appTypeRequired'),
      trigger: 'change',
    },
  ],
}));

/**
 * 重置表单为初始值
 */
function resetForm() {
  form.appName = '';
  form.appVersion = '';
  form.appType = undefined;
  form.appStatus = APP_STATUS_ON;
  formRef.value?.clearValidate();
}

/**
 * 用列表行回填表单（应用类型等选项加载后再匹配赋值）
 * @param row 列表行
 */
function fillForm(row: MyAppItem) {
  form.appName = row.appName?.trim() || '';
  form.appVersion = row.appVersion?.trim() || '';
  form.appType = undefined;
  form.appStatus =
    Number(row.appStatus) === APP_STATUS_OFF ? APP_STATUS_OFF : APP_STATUS_ON;
}

/**
 * 按类型下拉选项匹配并回显应用类型
 * @param row 列表行
 */
async function syncAppTypeFromOptions(row: MyAppItem) {
  await fetchTypeOptions();
  form.appType = matchAppTypeSelectValue(row, typeOptions.value);
}

/**
 * 打开新增弹窗
 */
function openCreate() {
  editingId.value = null;
  resetForm();
  visible.value = true;
  void fetchTypeOptions();
}

/**
 * 打开编辑弹窗
 * @param row 列表行
 */
async function openEdit(row: MyAppItem) {
  const id = resolveMyAppId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.apps.form.invalidId'));
    return;
  }
  editingId.value = id;
  fillForm(row);
  visible.value = true;
  await syncAppTypeFromOptions(row);
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
}

watch(visible, (open) => {
  if (!open) {
    editingId.value = null;
    resetForm();
  }
});

/**
 * 提交新增 / 编辑
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  if (form.appType == null) {
    return;
  }

  const payload = {
    appName: form.appName.trim(),
    appVersion: form.appVersion.trim(),
    appType: Number(form.appType),
    appStatus:
      Number(form.appStatus) === APP_STATUS_OFF
        ? APP_STATUS_OFF
        : APP_STATUS_ON,
  };

  submitting.value = true;
  try {
    if (isEdit.value && editingId.value != null) {
      await updateMyAppApi(editingId.value, payload);
      ElMessage.success($t('page.service.mydemand.apps.form.editSuccess'));
    } else {
      await createMyAppApi(payload);
      ElMessage.success($t('page.service.mydemand.apps.form.createSuccess'));
    }
    visible.value = false;
    emit('success');
  } catch {
    // 错误提示由接口层处理
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate, openEdit });
</script>

<template>
  <el-dialog
    v-model="visible"
    class="apps-form-dialog"
    destroy-on-close
    :title="dialogTitle"
    width="520px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      label-position="top"
      :model="form"
      :rules="rules"
    >
      <el-form-item
        :label="$t('page.service.mydemand.apps.form.fields.appName')"
        prop="appName"
      >
        <el-input
          v-model="form.appName"
          clearable
          maxlength="100"
          :placeholder="
            $t('page.service.mydemand.apps.form.appNamePlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        :label="$t('page.service.mydemand.apps.form.fields.appVersion')"
        prop="appVersion"
      >
        <el-input
          v-model="form.appVersion"
          clearable
          maxlength="50"
          :placeholder="
            $t('page.service.mydemand.apps.form.appVersionPlaceholder')
          "
        />
      </el-form-item>

      <el-form-item
        :label="$t('page.service.mydemand.apps.form.fields.appType')"
        prop="appType"
      >
        <el-select
          v-model="form.appType"
          class="apps-form-dialog__full"
          clearable
          filterable
          remote
          :loading="typeLoading"
          :placeholder="
            $t('page.service.mydemand.apps.form.appTypePlaceholder')
          "
          :remote-method="handleTypeRemoteSearch"
          @visible-change="
            (open: boolean) => {
              if (open) {
                void fetchTypeOptions();
              }
            }
          "
        >
          <el-option
            v-for="item in selectableTypeOptions"
            :key="item.key"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        :label="$t('page.service.mydemand.apps.form.fields.appStatus')"
      >
        <el-switch
          v-model="form.appStatus"
          :active-text="$t('page.service.mydemand.apps.status.on')"
          :active-value="APP_STATUS_ON"
          :inactive-text="$t('page.service.mydemand.apps.status.off')"
          :inactive-value="APP_STATUS_OFF"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.service.mydemand.apps.form.cancel') }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('page.service.mydemand.apps.form.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.apps-form-dialog {
  &__full {
    width: 100%;
  }
}
</style>
