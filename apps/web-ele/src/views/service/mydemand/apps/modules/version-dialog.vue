<script lang="ts" setup>
import type {
  MyAppItem,
  MyAppMaterialItem,
  MyAppVersionItem,
} from '#/types/service/mydemand/apps';
import type { FormInstance, FormRules } from 'element-plus';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';
import { ElMessage } from 'element-plus';

import {
  createMyAppVersionApi,
  getMyAppMaterialListApi,
  getMyAppVersionListApi,
} from '#/api/service/mydemand/apps';

import {
  displayAppValue,
  formatAppDateTime,
  isAppEnabled,
  joinMaterialIds,
  normalizeMaterialPage,
  resolveMyAppId,
} from '../data';

defineOptions({ name: 'MyDemandAppsVersionDialog' });

/** 弹窗可见 */
const visible = ref(false);
/** 当前应用 ID */
const appId = ref<null | number>(null);
/** 当前应用名称 */
const appName = ref('');
/** 版本列表加载中 */
const loading = ref(false);
/** 素材选项加载中 */
const materialLoading = ref(false);
/** 提交中 */
const submitting = ref(false);
/** 版本列表 */
const versions = ref<MyAppVersionItem[]>([]);
/** 可选素材（仅启用） */
const materialOptions = ref<MyAppMaterialItem[]>([]);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  versionNo: '',
  materialIdList: [] as number[],
});

/** 弹窗标题（含应用名） */
const dialogTitle = computed(() => {
  const base = $t('page.service.mydemand.apps.version.title');
  return appName.value ? `${base} · ${appName.value}` : base;
});

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  versionNo: [
    {
      required: true,
      message: () => $t('page.service.mydemand.apps.version.versionNoRequired'),
      trigger: 'blur',
    },
  ],
}));

/**
 * 重置新增表单
 */
function resetForm() {
  form.versionNo = '';
  form.materialIdList = [];
  formRef.value?.clearValidate();
}

/**
 * 拉取版本列表
 */
async function fetchVersions() {
  if (appId.value == null) {
    versions.value = [];
    return;
  }

  loading.value = true;
  try {
    versions.value = await getMyAppVersionListApi(appId.value);
  } catch {
    versions.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 拉取可绑定的启用素材（取较大 pageSize，供下拉选择）
 */
async function fetchMaterialOptions() {
  if (appId.value == null) {
    materialOptions.value = [];
    return;
  }

  materialLoading.value = true;
  try {
    const data = await getMyAppMaterialListApi({
      page: 1,
      pageSize: 100,
      appId: appId.value,
    });
    const page = normalizeMaterialPage(data);
    materialOptions.value = page.records.filter((item) =>
      isAppEnabled(item.status),
    );
  } catch {
    materialOptions.value = [];
  } finally {
    materialLoading.value = false;
  }
}

/**
 * 打开版本维护弹窗
 * @param row 应用行
 */
function open(row: MyAppItem) {
  const id = resolveMyAppId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.apps.version.invalidId'));
    return;
  }
  appId.value = id;
  appName.value = row.appName?.trim() || String(id);
  resetForm();
  visible.value = true;
  void fetchVersions();
  void fetchMaterialOptions();
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
    versions.value = [];
    materialOptions.value = [];
    resetForm();
  }
});

/**
 * 提交新增版本
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid || appId.value == null) {
    return;
  }

  submitting.value = true;
  try {
    await createMyAppVersionApi(appId.value, {
      versionNo: form.versionNo.trim(),
      materialIds: joinMaterialIds(form.materialIdList),
    });
    ElMessage.success($t('page.service.mydemand.apps.version.createSuccess'));
    resetForm();
    void fetchVersions();
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
    class="version-dialog"
    destroy-on-close
    :title="dialogTitle"
    width="720px"
    @close="handleClose"
  >
    <el-card class="version-dialog__form-card" shadow="never">
      <template #header>
        {{ $t('page.service.mydemand.apps.version.add') }}
      </template>
      <el-form
        ref="formRef"
        class="version-dialog__form"
        label-position="top"
        :model="form"
        :rules="rules"
      >
        <el-form-item
          :label="$t('page.service.mydemand.apps.version.fields.versionNo')"
          prop="versionNo"
        >
          <el-input
            v-model="form.versionNo"
            clearable
            maxlength="50"
            :placeholder="
              $t('page.service.mydemand.apps.version.versionNoPlaceholder')
            "
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.service.mydemand.apps.version.fields.materialIds')"
        >
          <el-select
            v-model="form.materialIdList"
            class="version-dialog__full"
            clearable
            collapse-tags
            collapse-tags-tooltip
            filterable
            multiple
            :loading="materialLoading"
            :placeholder="
              $t('page.service.mydemand.apps.version.materialPlaceholder')
            "
          >
            <el-option
              v-for="item in materialOptions"
              :key="item.materialId"
              :label="item.materialName || String(item.materialId)"
              :value="Number(item.materialId)"
            />
          </el-select>
          <p
            v-if="!materialLoading && materialOptions.length === 0"
            class="version-dialog__tip"
          >
            {{ $t('page.service.mydemand.apps.version.materialEmpty') }}
          </p>
        </el-form-item>

        <div class="version-dialog__form-actions">
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ $t('page.service.mydemand.apps.version.submit') }}
          </el-button>
        </div>
      </el-form>
    </el-card>

    <el-card class="version-dialog__list-card" shadow="never" v-loading="loading">
      <el-table
        :data="versions"
        stripe
        :empty-text="$t('page.service.mydemand.apps.version.empty')"
      >
        <el-table-column
          :label="$t('page.service.mydemand.apps.version.fields.versionNo')"
          min-width="120"
          prop="versionNo"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{
              displayAppValue(
                row.versionNo,
                $t('page.service.mydemand.apps.valueEmpty'),
              )
            }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('page.service.mydemand.apps.version.fields.materialIds')"
          min-width="200"
          prop="materialIds"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{
              displayAppValue(
                row.materialIds,
                $t('page.service.mydemand.apps.valueEmpty'),
              )
            }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('page.service.mydemand.apps.version.fields.createTime')"
          width="168"
        >
          <template #default="{ row }">
            {{
              formatAppDateTime(row.createTime) ||
              $t('page.service.mydemand.apps.valueEmpty')
            }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.service.mydemand.apps.version.cancel') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.version-dialog {
  &__form-card {
    margin-bottom: 16px;
  }

  &__form {
    display: grid;
    grid-template-columns: 1fr 1.4fr auto;
    gap: 0 16px;
    align-items: start;
  }

  &__full {
    width: 100%;
  }

  &__form-actions {
    display: flex;
    align-items: flex-end;
    height: 100%;
    padding-bottom: 18px;
  }

  &__tip {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__list-card {
    :deep(.el-card__body) {
      padding: 0;
    }
  }
}

@media (max-width: 768px) {
  .version-dialog {
    &__form {
      grid-template-columns: 1fr;
    }

    &__form-actions {
      height: auto;
      padding-bottom: 0;
    }
  }
}
</style>
