<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';

import type { ComputeDemandItem } from '#/types/service/mydemand/compute';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  createComputeDemandApi,
  getComputeDemandDetailApi,
  updateComputeDemandApi,
} from '#/api/service/mydemand/compute';

import {
  COMPUTE_STATUS_PENDING,
  COMPUTE_TYPE_OPTIONS,
  getComputeTypeI18nKey,
  parseComputeCreateDemandId,
} from '../data';
import AppPicker from './modules/app-picker.vue';

/**
 * 门户服务 · 新建 / 编辑算力需求
 * 独立页提交后返回列表；关联应用分页选自「我的应用」列表
 */
defineOptions({ name: 'ServiceMyDemandComputeCreate' });

const route = useRoute();
const router = useRouter();

/** 编辑中的需求 ID；新增时为空 */
const editingId = ref<null | number>(null);
/** 是否重新提交模式 */
const resubmitMode = ref(false);
/** 提交中 */
const submitting = ref(false);
/** 详情回填加载中 */
const detailLoading = ref(false);
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

/** 页面标题 */
const pageTitle = computed(() => {
  if (resubmitMode.value) {
    return $t('page.service.mydemand.compute.form.resubmitTitle');
  }
  return isEdit.value
    ? $t('page.service.mydemand.compute.form.editTitle')
    : $t('page.service.mydemand.compute.form.createTitle');
});

/** 页面说明 */
const pageDesc = computed(() => {
  if (resubmitMode.value) {
    return $t('page.service.mydemand.compute.form.resubmitPageDesc');
  }
  return isEdit.value
    ? $t('page.service.mydemand.compute.form.editPageDesc')
    : $t('page.service.mydemand.compute.form.createPageDesc');
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
 * 用详情回填表单
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
 * 返回算力需求列表页
 */
function goBackToList() {
  void router.push({ path: '/service/mydemand/compute' });
}

/**
 * 初始化：按路由决定新增 / 编辑 / 重新提交
 */
async function initPage() {
  const id = parseComputeCreateDemandId(route.query);
  resubmitMode.value =
    route.query.resubmit === '1' || route.query.resubmit === 'true';

  if (id == null) {
    editingId.value = null;
    return;
  }

  editingId.value = id;
  detailLoading.value = true;
  try {
    const detail = await getComputeDemandDetailApi(id);
    if (detail) {
      fillForm(detail);
    } else {
      ElMessage.warning($t('page.service.mydemand.compute.form.invalidId'));
      goBackToList();
    }
  } catch {
    // 错误提示由接口层处理
  } finally {
    detailLoading.value = false;
  }
}

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
    goBackToList();
  } catch {
    // 错误提示由接口层处理
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  void initPage();
});
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div class="mine-shell__inner">
        <header class="mine-shell__head">
          <div>
            <p class="mine-shell__eyebrow">
              {{ $t('page.service.mydemand.compute.eyebrow') }}
            </p>
            <h2>{{ pageTitle }}</h2>
            <p class="mine-shell__desc">
              {{ pageDesc }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="ArrowLeft"
              @click="goBackToList"
            >
              {{ $t('page.service.mydemand.compute.form.backToList') }}
            </el-button>
          </div>
        </header>

        <div v-loading="detailLoading" class="compute-create">
          <el-form
            ref="formRef"
            class="compute-create__form"
            label-position="top"
            :model="form"
            :rules="rules"
          >
            <el-card class="compute-create__card" shadow="never">
              <template #header>
                <div class="compute-create__card-head">
                  <h3>{{ $t('page.service.mydemand.compute.form.basicTitle') }}</h3>
                  <p>{{ $t('page.service.mydemand.compute.form.basicDesc') }}</p>
                </div>
              </template>

              <div class="compute-create__grid">
                <el-form-item
                  :label="
                    $t('page.service.mydemand.compute.form.fields.demandName')
                  "
                  prop="demandName"
                >
                  <el-input
                    v-model="form.demandName"
                    clearable
                    maxlength="100"
                    :placeholder="
                      $t(
                        'page.service.mydemand.compute.form.demandNamePlaceholder',
                      )
                    "
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item
                  :label="
                    $t('page.service.mydemand.compute.form.fields.demandType')
                  "
                  prop="demandType"
                >
                  <el-select
                    v-model="form.demandType"
                    class="compute-create__full"
                    clearable
                    :placeholder="
                      $t(
                        'page.service.mydemand.compute.form.demandTypePlaceholder',
                      )
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
              </div>

              <el-form-item
                :label="
                  $t('page.service.mydemand.compute.form.fields.resourceSpec')
                "
              >
                <el-input
                  v-model="form.resourceSpec"
                  clearable
                  maxlength="200"
                  :placeholder="
                    $t(
                      'page.service.mydemand.compute.form.resourceSpecPlaceholder',
                    )
                  "
                  show-word-limit
                  type="textarea"
                  :rows="3"
                />
              </el-form-item>
            </el-card>

            <el-card class="compute-create__card" shadow="never">
              <template #header>
                <div class="compute-create__card-head">
                  <h3>
                    {{
                      $t(
                        'page.service.mydemand.compute.form.fields.applicationId',
                      )
                    }}
                    <el-tag effect="plain" round size="small" type="info">
                      {{ $t('page.service.mydemand.compute.form.optional') }}
                    </el-tag>
                  </h3>
                  <p>
                    {{ $t('page.service.mydemand.compute.form.appPickerDesc') }}
                  </p>
                </div>
              </template>

              <AppPicker v-model="form.applicationId" />
            </el-card>
          </el-form>

          <div class="compute-create__footer">
            <el-button @click="goBackToList">
              {{ $t('page.service.mydemand.compute.form.cancel') }}
            </el-button>
            <el-button
              type="primary"
              :loading="submitting || detailLoading"
              @click="handleSubmit"
            >
              {{
                resubmitMode
                  ? $t('page.service.mydemand.compute.form.resubmit')
                  : $t('page.service.mydemand.compute.form.submit')
              }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../../scss/page-shell.scss';

.compute-create {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__card {
    border-radius: 14px;

    :deep(.el-card__header) {
      padding: 16px 20px 12px;
    }

    :deep(.el-card__body) {
      padding: 8px 20px 20px;
    }
  }

  &__card-head {
    h3 {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin: 0;
      font-size: 16px;
      font-weight: 650;
      line-height: 1.4;
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.5;
      color: hsl(var(--muted-foreground));
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 16px;
  }

  &__full {
    width: 100%;
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: flex-end;
    padding: 4px 4px 8px;
  }
}

@media (max-width: 768px) {
  .compute-create {
    &__grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
