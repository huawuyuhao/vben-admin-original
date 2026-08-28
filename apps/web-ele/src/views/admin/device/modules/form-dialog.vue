<script lang="ts" setup>
import type { DeviceItem, DeviceOnlineStatus } from '#/types/admin/device';
import type { FormInstance, FormRules } from 'element-plus';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import {
  createDeviceApi,
  getDeviceDetailApi,
  getDeviceTypeListApi,
  updateDeviceApi,
} from '#/api/admin/device';

import {
  DEVICE_ONLINE_OFFLINE,
  DEVICE_ONLINE_ONLINE,
  DEVICE_STORAGE_TYPES,
  isGpuDeviceType,
} from '../data';

defineOptions({ name: 'AdminDeviceFormDialog' });

const emit = defineEmits<{
  /** 提交成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 编辑中的设备 ID；新增时为空 */
const editingId = ref<null | number>(null);
/** 提交中 */
const submitting = ref(false);
/** 详情加载中（编辑回填） */
const detailLoading = ref(false);
/** 设备类型加载中 */
const typeLoading = ref(false);
/** 设备类型选项 */
const deviceTypeOptions = ref<string[]>([]);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  deviceCode: '',
  deviceName: '',
  deviceType: '',
  deviceModel: '',
  gpuVendor: '',
  gpuModel: '',
  cpuModel: '',
  cpuCores: undefined as number | undefined,
  memorySize: undefined as number | undefined,
  storageSize: undefined as number | undefined,
  storageType: '',
  location: '',
  rackNumber: '',
  position: '',
  onlineStatus: undefined as DeviceOnlineStatus | undefined,
  purchaseDate: '',
  warrantyExpiry: '',
  remark: '',
});

/** 是否编辑模式 */
const isEdit = computed(() => editingId.value != null);

/** 是否展示 GPU 相关字段 */
const showGpuFields = computed(() => isGpuDeviceType(form.deviceType));

/** 弹窗标题 */
const dialogTitle = computed(() =>
  isEdit.value
    ? $t('page.admin.device.form.editTitle')
    : $t('page.admin.device.form.createTitle'),
);

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  deviceCode: [
    {
      required: true,
      message: () => $t('page.admin.device.form.deviceCodeRequired'),
      trigger: 'blur',
    },
  ],
  deviceName: [
    {
      required: true,
      message: () => $t('page.admin.device.form.deviceNameRequired'),
      trigger: 'blur',
    },
  ],
  deviceType: [
    {
      required: true,
      message: () => $t('page.admin.device.form.deviceTypeRequired'),
      trigger: 'change',
    },
  ],
  deviceModel: [
    {
      required: true,
      message: () => $t('page.admin.device.form.deviceModelRequired'),
      trigger: 'blur',
    },
  ],
}));

/**
 * 重置表单为初始值
 */
function resetForm() {
  form.deviceCode = '';
  form.deviceName = '';
  form.deviceType = '';
  form.deviceModel = '';
  form.gpuVendor = '';
  form.gpuModel = '';
  form.cpuModel = '';
  form.cpuCores = undefined;
  form.memorySize = undefined;
  form.storageSize = undefined;
  form.storageType = '';
  form.location = '';
  form.rackNumber = '';
  form.position = '';
  form.onlineStatus = undefined;
  form.purchaseDate = '';
  form.warrantyExpiry = '';
  form.remark = '';
  formRef.value?.clearValidate();
}

/**
 * 用详情数据回填表单
 * @param detail 设备详情
 */
function fillForm(detail: DeviceItem) {
  form.deviceCode = detail.deviceCode?.trim() || '';
  form.deviceName = detail.deviceName?.trim() || '';
  form.deviceType = detail.deviceType?.trim() || '';
  form.deviceModel = detail.deviceModel?.trim() || '';
  form.gpuVendor = detail.gpuVendor?.trim() || '';
  form.gpuModel = detail.gpuModel?.trim() || '';
  form.cpuModel = detail.cpuModel?.trim() || '';
  form.cpuCores =
    detail.cpuCores == null ? undefined : Number(detail.cpuCores);
  form.memorySize =
    detail.memorySize == null ? undefined : Number(detail.memorySize);
  form.storageSize =
    detail.storageSize == null ? undefined : Number(detail.storageSize);
  form.storageType = detail.storageType?.trim() || '';
  form.location = detail.location?.trim() || '';
  form.rackNumber = detail.rackNumber?.trim() || '';
  form.position = detail.position?.trim() || '';
  const online = Number(detail.onlineStatus);
  form.onlineStatus =
    online === DEVICE_ONLINE_ONLINE || online === DEVICE_ONLINE_OFFLINE
      ? (online as DeviceOnlineStatus)
      : undefined;
  form.purchaseDate = detail.purchaseDate?.trim()?.slice(0, 10) || '';
  form.warrantyExpiry = detail.warrantyExpiry?.trim()?.slice(0, 10) || '';
  form.remark = detail.remark?.trim() || '';
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
  editingId.value = null;
  resetForm();
  visible.value = true;
  void fetchDeviceTypes();
}

/**
 * 打开编辑弹窗并拉取详情回填
 * @param row 列表行
 */
async function openEdit(row: DeviceItem) {
  const id = Number(row.deviceId);
  if (!Number.isFinite(id) || id <= 0) {
    ElMessage.warning($t('page.admin.device.form.invalidId'));
    return;
  }

  editingId.value = id;
  resetForm();
  visible.value = true;
  void fetchDeviceTypes();

  detailLoading.value = true;
  try {
    const detail = await getDeviceDetailApi(id);
    if (detail) {
      fillForm(detail);
    } else {
      fillForm(row);
    }
  } catch {
    fillForm(row);
  } finally {
    detailLoading.value = false;
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
    resetForm();
  }
});

/**
 * 组装提交参数（去掉空可选字段）
 */
function buildPayload() {
  const payload = {
    deviceCode: form.deviceCode.trim(),
    deviceName: form.deviceName.trim(),
    deviceType: form.deviceType.trim(),
    deviceModel: form.deviceModel.trim(),
    gpuVendor: showGpuFields.value
      ? form.gpuVendor.trim() || undefined
      : undefined,
    gpuModel: showGpuFields.value
      ? form.gpuModel.trim() || undefined
      : undefined,
    cpuModel: form.cpuModel.trim() || undefined,
    cpuCores: form.cpuCores,
    memorySize: form.memorySize,
    storageSize: form.storageSize,
    storageType: form.storageType.trim() || undefined,
    location: form.location.trim() || undefined,
    rackNumber: form.rackNumber.trim() || undefined,
    position: form.position.trim() || undefined,
    onlineStatus: isEdit.value ? form.onlineStatus : undefined,
    purchaseDate: form.purchaseDate.trim() || undefined,
    warrantyExpiry: form.warrantyExpiry.trim() || undefined,
    remark: form.remark.trim() || undefined,
  };
  return payload;
}

/**
 * 提交新增或修改
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitting.value = true;
  try {
    const payload = buildPayload();
    if (isEdit.value && editingId.value != null) {
      await updateDeviceApi(editingId.value, payload);
      ElMessage.success($t('page.admin.device.form.updateSuccess'));
    } else {
      await createDeviceApi(payload);
      ElMessage.success($t('page.admin.device.form.createSuccess'));
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
    class="device-form-dialog"
    destroy-on-close
    :title="dialogTitle"
    width="720px"
    @close="handleClose"
  >
    <div v-loading="detailLoading">
      <el-form
        ref="formRef"
        class="device-form-dialog__form"
        label-width="108px"
        :model="form"
        :rules="rules"
        @submit.prevent
      >
        <el-row :gutter="12">
          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.deviceCode')"
              prop="deviceCode"
            >
              <el-input
                v-model="form.deviceCode"
                :placeholder="
                  $t('page.admin.device.form.deviceCodePlaceholder')
                "
              />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.deviceName')"
              prop="deviceName"
            >
              <el-input
                v-model="form.deviceName"
                :placeholder="
                  $t('page.admin.device.form.deviceNamePlaceholder')
                "
              />
            </el-form-item>
          </el-col>

          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.deviceType')"
              prop="deviceType"
            >
              <el-select
                v-model="form.deviceType"
                class="device-form-dialog__field"
                :loading="typeLoading"
                :placeholder="
                  $t('page.admin.device.form.deviceTypePlaceholder')
                "
              >
                <el-option
                  v-for="item in deviceTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.deviceModel')"
              prop="deviceModel"
            >
              <el-input
                v-model="form.deviceModel"
                :placeholder="
                  $t('page.admin.device.form.deviceModelPlaceholder')
                "
              />
            </el-form-item>
          </el-col>

          <template v-if="showGpuFields">
            <el-col :md="12" :span="24">
              <el-form-item
                :label="$t('page.admin.device.form.fields.gpuVendor')"
              >
                <el-input
                  v-model="form.gpuVendor"
                  :placeholder="
                    $t('page.admin.device.form.gpuVendorPlaceholder')
                  "
                />
              </el-form-item>
            </el-col>
            <el-col :md="12" :span="24">
              <el-form-item
                :label="$t('page.admin.device.form.fields.gpuModel')"
              >
                <el-input
                  v-model="form.gpuModel"
                  :placeholder="
                    $t('page.admin.device.form.gpuModelPlaceholder')
                  "
                />
              </el-form-item>
            </el-col>
          </template>

          <el-col :md="12" :span="24">
            <el-form-item :label="$t('page.admin.device.form.fields.cpuModel')">
              <el-input
                v-model="form.cpuModel"
                :placeholder="$t('page.admin.device.form.cpuModelPlaceholder')"
              />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item :label="$t('page.admin.device.form.fields.cpuCores')">
              <el-input-number
                v-model="form.cpuCores"
                class="device-form-dialog__field"
                :min="1"
                :step="1"
              />
            </el-form-item>
          </el-col>

          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.memorySize')"
            >
              <el-input-number
                v-model="form.memorySize"
                class="device-form-dialog__field"
                :min="0"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.storageSize')"
            >
              <el-input-number
                v-model="form.storageSize"
                class="device-form-dialog__field"
                :min="0"
                :step="1"
              />
            </el-form-item>
          </el-col>

          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.storageType')"
            >
              <el-select
                v-model="form.storageType"
                class="device-form-dialog__field"
                clearable
                :placeholder="
                  $t('page.admin.device.form.storageTypePlaceholder')
                "
              >
                <el-option
                  v-for="item in DEVICE_STORAGE_TYPES"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="isEdit" :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.onlineStatus')"
            >
              <el-select
                v-model="form.onlineStatus"
                class="device-form-dialog__field"
                clearable
                :placeholder="
                  $t('page.admin.device.form.onlineStatusPlaceholder')
                "
              >
                <el-option
                  :label="$t('page.admin.device.online.online')"
                  :value="DEVICE_ONLINE_ONLINE"
                />
                <el-option
                  :label="$t('page.admin.device.online.offline')"
                  :value="DEVICE_ONLINE_OFFLINE"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :md="12" :span="24">
            <el-form-item :label="$t('page.admin.device.form.fields.location')">
              <el-input
                v-model="form.location"
                :placeholder="$t('page.admin.device.form.locationPlaceholder')"
              />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.rackNumber')"
            >
              <el-input
                v-model="form.rackNumber"
                :placeholder="
                  $t('page.admin.device.form.rackNumberPlaceholder')
                "
              />
            </el-form-item>
          </el-col>

          <el-col :md="12" :span="24">
            <el-form-item :label="$t('page.admin.device.form.fields.position')">
              <el-input
                v-model="form.position"
                :placeholder="$t('page.admin.device.form.positionPlaceholder')"
              />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.purchaseDate')"
            >
              <el-date-picker
                v-model="form.purchaseDate"
                class="device-form-dialog__field"
                format="YYYY-MM-DD"
                type="date"
                value-format="YYYY-MM-DD"
                :placeholder="
                  $t('page.admin.device.form.purchaseDatePlaceholder')
                "
              />
            </el-form-item>
          </el-col>

          <el-col :md="12" :span="24">
            <el-form-item
              :label="$t('page.admin.device.form.fields.warrantyExpiry')"
            >
              <el-date-picker
                v-model="form.warrantyExpiry"
                class="device-form-dialog__field"
                format="YYYY-MM-DD"
                type="date"
                value-format="YYYY-MM-DD"
                :placeholder="
                  $t('page.admin.device.form.warrantyExpiryPlaceholder')
                "
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item :label="$t('page.admin.device.form.fields.remark')">
              <el-input
                v-model="form.remark"
                :autosize="{ minRows: 2, maxRows: 4 }"
                type="textarea"
                :placeholder="$t('page.admin.device.form.remarkPlaceholder')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.admin.device.form.cancel') }}
      </el-button>
      <el-button
        :loading="submitting || detailLoading"
        type="primary"
        @click="handleSubmit"
      >
        {{ $t('page.admin.device.form.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.device-form-dialog {
  &__field {
    width: 100%;
  }

  &__form {
    :deep(.el-input-number) {
      width: 100%;
    }

    :deep(.el-date-editor) {
      width: 100%;
    }
  }
}
</style>
