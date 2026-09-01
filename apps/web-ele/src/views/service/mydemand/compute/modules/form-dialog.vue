<script lang="ts" setup>
import type { MyAppItem } from '#/types/service/mydemand/apps';
import type { ComputeDemandItem } from '#/types/service/mydemand/compute';
import type { FormInstance, FormRules } from 'element-plus';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import { getMyAppListApi } from '#/api/service/mydemand/apps';
import {
  createComputeDemandApi,
  getComputeDemandDetailApi,
  updateComputeDemandApi,
} from '#/api/service/mydemand/compute';

import {
  COMPUTE_STATUS_PENDING,
  COMPUTE_TYPE_OPTIONS,
  getComputeTypeI18nKey,
  resolveComputeDemandId,
} from '../data';

defineOptions({ name: 'MyDemandComputeFormDialog' });

const emit = defineEmits<{
  /** 提交成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 编辑中的需求 ID；新增时为空 */
const editingId = ref<null | number>(null);
/** 是否重新提交模式（审核不通过后） */
const resubmitMode = ref(false);
/** 提交中 */
const submitting = ref(false);
/** 详情回填加载中 */
const detailLoading = ref(false);
/** 应用选项加载中 */
const appLoading = ref(false);
/** 关联应用选项 */
const appOptions = ref<MyAppItem[]>([]);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  demandName: '',
  demandType: undefined as number | undefined,
  resourceSpec: '',
  applicationId: undefined as number | undefined,
});

/** 是否编辑模式 */
const isEdit = computed(() => editingId.value != null);

/** 弹窗标题 */
const dialogTitle = computed(() => {
  if (resubmitMode.value) {
    return $t('page.service.mydemand.compute.form.resubmitTitle');
  }
  return isEdit.value
    ? $t('page.service.mydemand.compute.form.editTitle')
    : $t('page.service.mydemand.compute.form.createTitle');
});

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  demandName: [
    {
      required: true,
      message: () =>
        $t('page.service.mydemand.compute.form.demandNameRequired'),
      trigger: 'blur',
    },
  ],
  demandType: [
    {
      required: true,
      message: () =>
        $t('page.service.mydemand.compute.form.demandTypeRequired'),
      trigger: 'change',
    },
  ],
}));

/**
 * 重置表单为初始值
 */
function resetForm() {
  form.demandName = '';
  form.demandType = undefined;
  form.resourceSpec = '';
  form.applicationId = undefined;
  formRef.value?.clearValidate();
}

/**
 * 用详情或列表行回填表单
 * @param row 需求数据
 */
function fillForm(row: ComputeDemandItem) {
  form.demandName = row.demandName?.trim() || '';
  form.demandType =
    row.demandType != null && Number.isFinite(Number(row.demandType))
      ? Number(row.demandType)
      : undefined;
  form.resourceSpec = row.resourceSpec?.trim() || '';
  form.applicationId =
    row.applicationId != null && Number.isFinite(Number(row.applicationId))
      ? Number(row.applicationId)
      : undefined;
}

/**
 * 拉取可选应用列表（启用中优先）
 */
async function fetchAppOptions() {
  appLoading.value = true;
  try {
    const data = await getMyAppListApi({
      page: 1,
      pageSize: 100,
      appStatus: 1,
    });
    appOptions.value = Array.isArray(data.records) ? data.records : [];
  } catch {
    appOptions.value = [];
  } finally {
    appLoading.value = false;
  }
}

/**
 * 打开新增弹窗
 */
function openCreate() {
  editingId.value = null;
  resubmitMode.value = false;
  resetForm();
  visible.value = true;
  void fetchAppOptions();
}

/**
 * 打开编辑弹窗
 * @param row 列表行
 */
async function openEdit(row: ComputeDemandItem) {
  const id = resolveComputeDemandId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.compute.form.invalidId'));
    return;
  }

  editingId.value = id;
  resubmitMode.value = false;
  resetForm();
  fillForm(row);
  visible.value = true;
  void fetchAppOptions();

  detailLoading.value = true;
  try {
    const detail = await getComputeDemandDetailApi(id);
    if (detail) {
      fillForm(detail);
    }
  } catch {
    // 列表行已回填，详情失败时保留列表数据
  } finally {
    detailLoading.value = false;
  }
}

/**
 * 打开重新提交弹窗（审核不通过）
 * @param row 列表行
 */
async function openResubmit(row: ComputeDemandItem) {
  await openEdit(row);
  if (visible.value) {
    resubmitMode.value = true;
  }
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
    resubmitMode.value = false;
    resetForm();
  }
});

/**
 * 提交表单
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  if (form.demandType == null) {
    return;
  }

  const payload = {
    demandName: form.demandName.trim(),
    demandType: form.demandType,
    resourceSpec: form.resourceSpec.trim() || undefined,
    applicationId: form.applicationId,
    ...(resubmitMode.value || !isEdit.value
      ? { status: COMPUTE_STATUS_PENDING }
      : {}),
  };

  submitting.value = true;
  try {
    if (isEdit.value && editingId.value != null) {
      await updateComputeDemandApi(editingId.value, payload);
      ElMessage.success(
        $t(
          resubmitMode.value
            ? 'page.service.mydemand.compute.form.resubmitSuccess'
            : 'page.service.mydemand.compute.form.editSuccess',
        ),
      );
    } else {
      await createComputeDemandApi(payload);
      ElMessage.success($t('page.service.mydemand.compute.form.createSuccess'));
    }
    visible.value = false;
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
  openResubmit,
});
</script>

<template>
  <el-dialog
    v-model="visible"
    class="compute-form-dialog"
    destroy-on-close
    :title="dialogTitle"
    width="560px"
    @close="handleClose"
  >
    <div v-loading="detailLoading">
      <el-form
        ref="formRef"
        label-position="top"
        :model="form"
        :rules="rules"
      >
        <el-form-item
          :label="$t('page.service.mydemand.compute.form.fields.demandName')"
          prop="demandName"
        >
          <el-input
            v-model="form.demandName"
            clearable
            maxlength="100"
            :placeholder="
              $t('page.service.mydemand.compute.form.demandNamePlaceholder')
            "
            show-word-limit
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.service.mydemand.compute.form.fields.demandType')"
          prop="demandType"
        >
          <el-select
            v-model="form.demandType"
            class="compute-form-dialog__full"
            clearable
            :placeholder="
              $t('page.service.mydemand.compute.form.demandTypePlaceholder')
            "
          >
            <el-option
              v-for="item in COMPUTE_TYPE_OPTIONS"
              :key="item"
              :label="
                $t(
                  `page.service.mydemand.compute.type.${getComputeTypeI18nKey(item)}`,
                )
              "
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="$t('page.service.mydemand.compute.form.fields.resourceSpec')"
        >
          <el-input
            v-model="form.resourceSpec"
            clearable
            maxlength="200"
            :placeholder="
              $t('page.service.mydemand.compute.form.resourceSpecPlaceholder')
            "
            show-word-limit
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.service.mydemand.compute.form.fields.applicationId')"
        >
          <el-select
            v-model="form.applicationId"
            class="compute-form-dialog__full"
            clearable
            filterable
            :loading="appLoading"
            :placeholder="
              $t('page.service.mydemand.compute.form.applicationPlaceholder')
            "
          >
            <el-option
              v-for="app in appOptions.filter((item) => item.appId != null)"
              :key="app.appId"
              :label="
                app.appName?.trim() ||
                String(app.appId ?? '') ||
                $t('page.service.mydemand.compute.valueEmpty')
              "
              :value="Number(app.appId)"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.service.mydemand.compute.form.cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{
          resubmitMode
            ? $t('page.service.mydemand.compute.form.resubmit')
            : $t('page.service.mydemand.compute.form.submit')
        }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.compute-form-dialog {
  &__full {
    width: 100%;
  }
}
</style>
