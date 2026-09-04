<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';

import type { MyAppItem } from '#/types/service/mydemand/apps';

import { reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { createMyAppScheduleTaskApi } from '#/api/service/mydemand/apps';

import { APP_STATUS_OFF, APP_STATUS_ON, resolveMyAppId } from '../data';

defineOptions({ name: 'MyDemandAppsScheduleDialog' });

/** 弹窗可见 */
const visible = ref(false);
/** 当前应用 ID */
const appId = ref<null | number>(null);
/** 当前应用名称（展示） */
const appName = ref('');
/** 提交中 */
const submitting = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  cronExpression: '',
  status: APP_STATUS_ON as number,
});

/** 表单校验规则 */
const rules: FormRules = {
  cronExpression: [
    {
      required: true,
      message: () => $t('page.service.mydemand.apps.schedule.cronRequired'),
      trigger: 'blur',
    },
  ],
};

/**
 * 重置表单
 */
function resetForm() {
  form.cronExpression = '';
  form.status = APP_STATUS_ON;
  formRef.value?.clearValidate();
}

/**
 * 打开定时任务配置弹窗
 * @param row 应用行
 */
function open(row: MyAppItem) {
  const id = resolveMyAppId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.apps.schedule.invalidId'));
    return;
  }
  appId.value = id;
  appName.value = row.appName?.trim() || String(id);
  resetForm();
  visible.value = true;
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
}

watch(visible, (open) => {
  if (!open) {
    appId.value = null;
    appName.value = '';
    resetForm();
  }
});

/**
 * 提交创建定时任务
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid || appId.value == null) {
    return;
  }

  submitting.value = true;
  try {
    await createMyAppScheduleTaskApi({
      appId: appId.value,
      cronExpression: form.cronExpression.trim(),
      status:
        Number(form.status) === APP_STATUS_OFF ? APP_STATUS_OFF : APP_STATUS_ON,
    });
    ElMessage.success($t('page.service.mydemand.apps.schedule.success'));
    visible.value = false;
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
    :title="$t('page.service.mydemand.apps.schedule.title')"
    width="480px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      label-position="top"
      :model="form"
      :rules="rules"
    >
      <el-form-item
        :label="$t('page.service.mydemand.apps.schedule.fields.appName')"
      >
        <el-input :model-value="appName" disabled />
      </el-form-item>

      <el-form-item
        :label="$t('page.service.mydemand.apps.schedule.fields.cronExpression')"
        prop="cronExpression"
      >
        <el-input
          v-model="form.cronExpression"
          clearable
          :placeholder="
            $t('page.service.mydemand.apps.schedule.cronPlaceholder')
          "
        />
        <p class="schedule-dialog__tip">
          {{ $t('page.service.mydemand.apps.schedule.cronTip') }}
        </p>
      </el-form-item>

      <el-form-item
        :label="$t('page.service.mydemand.apps.schedule.fields.status')"
      >
        <el-switch
          v-model="form.status"
          :active-text="$t('page.service.mydemand.apps.status.on')"
          :active-value="APP_STATUS_ON"
          :inactive-text="$t('page.service.mydemand.apps.status.off')"
          :inactive-value="APP_STATUS_OFF"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.service.mydemand.apps.schedule.cancel') }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('page.service.mydemand.apps.schedule.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.schedule-dialog {
  &__tip {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
}
</style>
