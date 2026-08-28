<script lang="ts" setup>
import type { DeviceOptionItem } from '#/types/admin/device';
import type { FormInstance, FormRules } from 'element-plus';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import {
  getDeviceOptionsApi,
  getDeviceTypeListApi,
} from '#/api/admin/device';
import { submitSupplyDeviceApi } from '#/api/service/enterprise/supply';

import { formatDeviceOptionLabel, isGpuDeviceType } from '../data';

defineOptions({ name: 'EnterpriseSupplyFormDialog' });

const emit = defineEmits<{
  /** 提交成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = defineModel<boolean>('visible', { default: false });

/** 提交中 */
const submitting = ref(false);
/** 设备类型加载中 */
const typeLoading = ref(false);
/** 设备型号选项加载中 */
const optionLoading = ref(false);
/** 设备类型选项 */
const deviceTypeOptions = ref<string[]>([]);
/** 设备型号/设备选项（按类型联动） */
const deviceOptions = ref<DeviceOptionItem[]>([]);
/** 忽略类型变更触发的联动（重置时） */
const syncingType = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  deviceType: '',
  /** 选中的设备 ID（下拉 value） */
  deviceId: undefined as number | undefined,
  gpuVendor: '',
  gpuModel: '',
  quantity: 1,
});

/** 当前选中的设备选项 */
const selectedDevice = computed(() =>
  deviceOptions.value.find((item) => item.deviceId === form.deviceId),
);

/** 是否展示 GPU 相关字段 */
const showGpuFields = computed(() => isGpuDeviceType(form.deviceType));

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  deviceType: [
    {
      required: true,
      message: () => $t('page.service.enterprise.supply.form.deviceTypeRequired'),
      trigger: 'change',
    },
  ],
  deviceId: [
    {
      required: true,
      message: () => $t('page.service.enterprise.supply.form.deviceModelRequired'),
      trigger: 'change',
    },
  ],
  quantity: [
    {
      required: true,
      message: () => $t('page.service.enterprise.supply.form.quantityRequired'),
      trigger: 'change',
    },
    {
      type: 'number',
      min: 1,
      message: () => $t('page.service.enterprise.supply.form.quantityMin'),
      trigger: 'change',
    },
  ],
}));

/**
 * 清空型号选择与选项列表
 */
function clearDeviceOptions() {
  form.deviceId = undefined;
  deviceOptions.value = [];
}

/**
 * 重置表单
 */
function resetForm() {
  syncingType.value = true;
  form.deviceType = '';
  form.gpuVendor = '';
  form.gpuModel = '';
  form.quantity = 1;
  clearDeviceOptions();
  syncingType.value = false;
  formRef.value?.clearValidate();
}

/**
 * 按设备类型拉取型号选项
 * @param deviceType 设备类型
 */
async function fetchDeviceOptions(deviceType: string) {
  if (!deviceType) {
    clearDeviceOptions();
    return;
  }

  optionLoading.value = true;
  form.deviceId = undefined;
  try {
    const list = await getDeviceOptionsApi({ deviceType });
    deviceOptions.value = Array.isArray(list)
      ? list.filter((item) => item?.deviceId != null)
      : [];
  } catch {
    deviceOptions.value = [];
  } finally {
    optionLoading.value = false;
  }
}

/**
 * 拉取设备类型下拉选项
 */
async function fetchDeviceTypes() {
  typeLoading.value = true;
  try {
    const list = await getDeviceTypeListApi();
    deviceTypeOptions.value = Array.isArray(list)
      ? list.map((item) => String(item).trim()).filter(Boolean)
      : [];
  } catch {
    deviceTypeOptions.value = [];
  } finally {
    typeLoading.value = false;
  }
}

/**
 * 打开新增弹窗
 */
function openCreate() {
  resetForm();
  visible.value = true;
  void fetchDeviceTypes();
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
}

watch(visible, (open) => {
  if (!open) {
    resetForm();
  }
});

watch(
  () => form.deviceType,
  (deviceType) => {
    if (!visible.value || syncingType.value) {
      return;
    }
    form.gpuVendor = '';
    form.gpuModel = '';
    void fetchDeviceOptions(deviceType);
  },
);

/**
 * 选中设备后：GPU 类型自动回填 GPU 型号
 * @param deviceId 选中设备 ID
 */
function handleDeviceChange(deviceId?: number) {
  if (!isGpuDeviceType(form.deviceType)) {
    return;
  }
  const device = deviceOptions.value.find((item) => item.deviceId === deviceId);
  form.gpuModel = device?.deviceModel?.trim() || '';
}

/**
 * 提交设备清单
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const device = selectedDevice.value;
  const deviceModel =
    device?.deviceModel?.trim() ||
    device?.deviceName?.trim() ||
    '';
  if (!deviceModel) {
    ElMessage.warning($t('page.service.enterprise.supply.form.deviceModelRequired'));
    return;
  }

  submitting.value = true;
  try {
    await submitSupplyDeviceApi({
      deviceType: form.deviceType,
      deviceModel,
      gpuVendor: showGpuFields.value
        ? form.gpuVendor.trim() || undefined
        : undefined,
      gpuModel: showGpuFields.value
        ? form.gpuModel.trim() || undefined
        : undefined,
      quantity: form.quantity,
    });
    ElMessage.success($t('page.service.enterprise.supply.form.submitSuccess'));
    visible.value = false;
    emit('success');
  } catch {
    // 错误提示由接口层处理
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate });
</script>

<template>
  <el-dialog
    v-model="visible"
    class="supply-form-dialog"
    destroy-on-close
    :title="$t('page.service.enterprise.supply.form.createTitle')"
    width="520px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      class="supply-form-dialog__form"
      label-width="96px"
      :model="form"
      :rules="rules"
      @submit.prevent
    >
      <el-form-item
        :label="$t('page.service.enterprise.supply.form.fields.deviceType')"
        prop="deviceType"
      >
        <el-select
          v-model="form.deviceType"
          class="supply-form-dialog__field"
          :loading="typeLoading"
          :placeholder="$t('page.service.enterprise.supply.form.deviceTypePlaceholder')"
        >
          <el-option
            v-for="item in deviceTypeOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        :label="$t('page.service.enterprise.supply.form.fields.deviceModel')"
        prop="deviceId"
      >
        <el-select
          v-model="form.deviceId"
          class="supply-form-dialog__field"
          clearable
          filterable
          :disabled="!form.deviceType"
          :loading="optionLoading"
          :placeholder="
            form.deviceType
              ? $t('page.service.enterprise.supply.form.deviceModelPlaceholder')
              : $t('page.service.enterprise.supply.form.deviceModelNeedType')
          "
          @change="handleDeviceChange"
        >
          <el-option
            v-for="item in deviceOptions"
            :key="item.deviceId"
            :label="formatDeviceOptionLabel(item)"
            :value="item.deviceId"
          />
        </el-select>
      </el-form-item>

      <template v-if="showGpuFields">
        <el-form-item
          :label="$t('page.service.enterprise.supply.form.fields.gpuVendor')"
          prop="gpuVendor"
        >
          <el-input
            v-model="form.gpuVendor"
            class="supply-form-dialog__field"
            :placeholder="$t('page.service.enterprise.supply.form.gpuVendorPlaceholder')"
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.service.enterprise.supply.form.fields.gpuModel')"
          prop="gpuModel"
        >
          <el-input
            v-model="form.gpuModel"
            class="supply-form-dialog__field"
            :placeholder="$t('page.service.enterprise.supply.form.gpuModelPlaceholder')"
          />
        </el-form-item>
      </template>

      <el-form-item
        :label="$t('page.service.enterprise.supply.form.fields.quantity')"
        prop="quantity"
      >
        <el-input-number
          v-model="form.quantity"
          class="supply-form-dialog__field"
          :min="1"
          :step="1"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.service.enterprise.supply.form.cancel') }}
      </el-button>
      <el-button :loading="submitting" type="primary" @click="handleSubmit">
        {{ $t('page.service.enterprise.supply.form.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.supply-form-dialog {
  &__field {
    width: 100%;
  }
}
</style>
