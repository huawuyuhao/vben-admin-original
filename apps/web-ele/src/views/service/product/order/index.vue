<script lang="ts" setup>
import type {
  DemandConfigPayload,
  DemandDiskPayload,
  DemandFeeResult,
  ProductImageItem,
  ProductSpecItem,
} from '#/types/service/product/order';

import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ArrowLeft } from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { debounce } from '@vben/utils';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  calcDemandConfigFeeApi,
  getDemandConfigDetailApi,
  saveDemandConfigDraftApi,
  submitDemandConfigApi,
} from '#/api/service/product/order';

import {
  APP_SOURCE_MODEL_MARKET,
  DEFAULT_BANDWIDTH,
  DEFAULT_SYSTEM_DISK,
  type OrderStepIndex,
  formatFee,
  parsePositiveId,
} from './data';
import StepAdvanced from './modules/step-advanced.vue';
import StepBasic from './modules/step-basic.vue';
import StepConfirm from './modules/step-confirm.vue';
import StepNetwork from './modules/step-network.vue';

/**
 * 门户服务 · 产品下单（需求配置四步向导）
 * 对接规格筛选/列表、镜像、模型市场、费用试算、草稿与提交
 */
defineOptions({ name: 'ServiceProductOrder' });

const route = useRoute();
const router = useRouter();

const step = ref<OrderStepIndex>(0);
const pageLoading = ref(false);
const feeLoading = ref(false);
const savingDraft = ref(false);
const submitting = ref(false);

const demandId = ref<null | number>(null);
const productId = ref<null | number>(null);

const selectedSpec = ref<null | ProductSpecItem>(null);
const selectedImage = ref<null | ProductImageItem>(null);

const form = reactive({
  specId: null as null | number,
  quantity: 1,
  imageId: null as null | number,
  networkBandwidth: DEFAULT_BANDWIDTH,
  region: '',
  demandName: '',
  instanceName: '',
  loginPassword: '',
  confirmPassword: '',
  disks: [{ ...DEFAULT_SYSTEM_DISK }] as DemandDiskPayload[],
  selectedModelIds: [] as number[],
});

const fee = ref<null | DemandFeeResult>(null);
const advancedRef = ref<InstanceType<typeof StepAdvanced>>();

/** 步骤标题 */
const stepItems = computed(() => [
  {
    title: $t('page.service.product.order.steps.basic'),
    description: $t('page.service.product.order.steps.basicDesc'),
  },
  {
    title: $t('page.service.product.order.steps.network'),
    description: $t('page.service.product.order.steps.networkDesc'),
  },
  {
    title: $t('page.service.product.order.steps.advanced'),
    description: $t('page.service.product.order.steps.advancedDesc'),
  },
  {
    title: $t('page.service.product.order.steps.confirm'),
    description: $t('page.service.product.order.steps.confirmDesc'),
  },
]);

/**
 * 规格变更回调
 * @param spec 选中规格
 */
function handleSpecChange(spec: null | ProductSpecItem) {
  selectedSpec.value = spec;
  if (spec?.region && !form.region) {
    form.region = spec.region;
  }
  if (spec?.productId && !productId.value) {
    productId.value = spec.productId;
  }
}

/**
 * 镜像变更回调
 * @param image 选中镜像
 */
function handleImageChange(image: null | ProductImageItem) {
  selectedImage.value = image;
}

/**
 * 组装提交 / 草稿 / 试算共用载荷
 * @returns 需求配置入参
 */
function buildPayload(): DemandConfigPayload | null {
  if (!form.specId) {
    return null;
  }
  return {
    demandId: demandId.value ?? undefined,
    demandName: form.demandName.trim() || undefined,
    productId: productId.value ?? undefined,
    specId: form.specId,
    quantity: form.quantity,
    imageId: form.imageId ?? undefined,
    instanceName: form.instanceName.trim() || undefined,
    loginPassword: form.loginPassword || undefined,
    networkBandwidth: form.networkBandwidth,
    region: form.region.trim() || undefined,
    disks: form.disks.map((d) => ({
      diskUsage: d.diskUsage,
      diskType: d.diskType,
      capacityGb: d.capacityGb,
      quantity: d.quantity,
    })),
    applications: form.selectedModelIds.map((id) => ({
      applicationId: id,
      appSource: APP_SOURCE_MODEL_MARKET,
    })),
  };
}

/**
 * 费用试算
 */
async function refreshFee() {
  if (!form.specId) {
    fee.value = null;
    return;
  }
  feeLoading.value = true;
  try {
    const data = await calcDemandConfigFeeApi({
      specId: form.specId,
      quantity: form.quantity,
      networkBandwidth: form.networkBandwidth,
      disks: form.disks,
    });
    fee.value = data ?? null;
  } catch {
    fee.value = null;
  } finally {
    feeLoading.value = false;
  }
}

const debouncedRefreshFee = debounce(() => {
  void refreshFee();
}, 400);

/**
 * 校验当前步是否可进入下一步
 * @returns 是否通过
 */
async function validateCurrentStep(): Promise<boolean> {
  if (step.value === 0) {
    if (!form.specId) {
      ElMessage.warning($t('page.service.product.order.validate.specRequired'));
      return false;
    }
    return true;
  }
  if (step.value === 1) {
    if (!form.imageId) {
      ElMessage.warning($t('page.service.product.order.validate.imageRequired'));
      return false;
    }
    return true;
  }
  if (step.value === 2) {
    const ok = await advancedRef.value?.validate();
    if (!ok) {
      return false;
    }
    return true;
  }
  return true;
}

/**
 * 下一步
 */
async function handleNext() {
  const ok = await validateCurrentStep();
  if (!ok) {
    return;
  }
  if (step.value < 3) {
    step.value = (step.value + 1) as OrderStepIndex;
  }
}

/**
 * 上一步
 */
function handlePrev() {
  if (step.value > 0) {
    step.value = (step.value - 1) as OrderStepIndex;
  }
}

/**
 * 返回产品列表
 */
function goBack() {
  router.push('/service/product');
}

/**
 * 取消下单
 */
async function handleCancel() {
  try {
    await ElMessageBox.confirm(
      $t('page.service.product.order.cancelConfirm'),
      $t('page.service.product.order.cancelTitle'),
      {
        type: 'warning',
        confirmButtonText: $t('page.service.product.order.cancelOk'),
        cancelButtonText: $t('page.service.product.order.cancelKeep'),
      },
    );
    goBack();
  } catch {
    // 用户取消对话框
  }
}

/**
 * 保存草稿
 */
async function handleSaveDraft() {
  if (!form.specId) {
    ElMessage.warning($t('page.service.product.order.validate.specRequired'));
    return;
  }
  const payload = buildPayload();
  if (!payload) {
    return;
  }
  savingDraft.value = true;
  try {
    const data = await saveDemandConfigDraftApi(payload);
    const nextId = Number(data?.demandId);
    if (Number.isFinite(nextId) && nextId > 0) {
      demandId.value = nextId;
      await router.replace({
        path: '/service/product/order',
        query: {
          ...route.query,
          demandId: String(nextId),
          ...(productId.value ? { productId: String(productId.value) } : {}),
        },
      });
    }
    ElMessage.success($t('page.service.product.order.draftSuccess'));
  } catch {
    // 错误提示由请求拦截器处理
  } finally {
    savingDraft.value = false;
  }
}

/**
 * 提交需求配置
 */
async function handleSubmit() {
  const okAdvanced = await advancedRef.value?.validate();
  if (step.value !== 3) {
    // 确认步再提交；若未在确认步则先校验高级配置
    if (okAdvanced === false) {
      step.value = 2;
      return;
    }
  }
  if (!form.specId) {
    ElMessage.warning($t('page.service.product.order.validate.specRequired'));
    step.value = 0;
    return;
  }
  if (!form.imageId) {
    ElMessage.warning($t('page.service.product.order.validate.imageRequired'));
    step.value = 1;
    return;
  }
  if (!form.demandName.trim() || !form.instanceName.trim() || !form.loginPassword) {
    ElMessage.warning($t('page.service.product.order.validate.advancedRequired'));
    step.value = 2;
    return;
  }
  if (form.loginPassword !== form.confirmPassword) {
    ElMessage.warning($t('page.service.product.order.advanced.passwordMismatch'));
    step.value = 2;
    return;
  }

  const payload = buildPayload();
  if (!payload) {
    return;
  }

  submitting.value = true;
  try {
    const data = await submitDemandConfigApi(payload);
    const nextId = Number(data?.demandId);
    ElMessage.success($t('page.service.product.order.submitSuccess'));
    await router.push({
      path: '/service/mydemand/compute',
      query:
        Number.isFinite(nextId) && nextId > 0
          ? { highlight: String(nextId) }
          : undefined,
    });
  } catch {
    // 错误提示由请求拦截器处理
  } finally {
    submitting.value = false;
  }
}

/**
 * 回填草稿 / 已提交配置
 * @param id 需求 ID
 */
async function loadDetail(id: number) {
  pageLoading.value = true;
  try {
    const data = await getDemandConfigDetailApi(id);
    demandId.value = data?.demand?.demandId ?? id;
    if (data?.demand?.productId) {
      productId.value = data.demand.productId;
    }
    if (data?.demand?.demandName) {
      form.demandName = data.demand.demandName;
    }
    const cfg = data?.config;
    if (cfg) {
      form.specId = cfg.specId ?? null;
      form.quantity = cfg.quantity ?? 1;
      form.imageId = cfg.imageId ?? null;
      form.instanceName = cfg.instanceName ?? '';
      form.loginPassword = cfg.loginPassword ?? '';
      form.confirmPassword = cfg.loginPassword ?? '';
      form.networkBandwidth = cfg.networkBandwidth ?? DEFAULT_BANDWIDTH;
      form.region = cfg.region ?? '';
      if (cfg.configFee != null || cfg.networkFee != null || cfg.totalFee != null) {
        fee.value = {
          configFee: cfg.configFee,
          networkFee: cfg.networkFee,
          totalFee: cfg.totalFee,
        };
      }
    }
    if (data?.disks?.length) {
      form.disks = data.disks.map((d) => ({
        diskUsage: d.diskUsage,
        diskType: d.diskType,
        capacityGb: d.capacityGb,
        quantity: d.quantity,
      }));
    }
    if (data?.applications?.length) {
      form.selectedModelIds = data.applications
        .filter((a) => a.appSource === APP_SOURCE_MODEL_MARKET || a.appSource == null)
        .map((a) => a.applicationId)
        .filter((n) => Number.isFinite(n) && n > 0);
    }
  } catch {
    // 回显失败时保留空白向导
  } finally {
    pageLoading.value = false;
  }
}

watch(
  () => [
    form.specId,
    form.quantity,
    form.networkBandwidth,
    JSON.stringify(form.disks),
  ],
  () => {
    debouncedRefreshFee();
  },
);

watch(step, (val) => {
  if (val === 3) {
    void refreshFee();
  }
});

onMounted(async () => {
  const qDemandId = parsePositiveId(route.query.demandId ?? route.query.id);
  const qProductId = parsePositiveId(route.query.productId);
  const qDemandName = Array.isArray(route.query.demandName)
    ? route.query.demandName[0]
    : route.query.demandName;
  if (qProductId) {
    productId.value = qProductId;
  }
  if (typeof qDemandName === 'string' && qDemandName.trim()) {
    form.demandName = qDemandName.trim();
  }
  if (qDemandId) {
    await loadDetail(qDemandId);
  }
  if (form.specId) {
    void refreshFee();
  }
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
              {{ $t('page.service.product.order.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.product.order.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.product.order.desc') }}
            </p>
          </div>
          <div class="mine-shell__head-actions">
            <el-button
              class="mine-shell__action-btn"
              :icon="ArrowLeft"
              @click="goBack"
            >
              {{ $t('page.service.product.order.back') }}
            </el-button>
          </div>
        </header>

        <div v-loading="pageLoading" class="product-order">
          <el-card class="product-order__steps-card" shadow="never">
            <el-steps :active="step" align-center finish-status="success">
              <el-step
                v-for="(item, index) in stepItems"
                :key="index"
                :title="item.title"
                :description="item.description"
              />
            </el-steps>
          </el-card>

          <div class="product-order__body">
            <StepBasic
              v-show="step === 0"
              v-model:spec-id="form.specId"
              v-model:disks="form.disks"
              @spec-change="handleSpecChange"
            />
            <StepNetwork
              v-show="step === 1"
              v-model:image-id="form.imageId"
              v-model:network-bandwidth="form.networkBandwidth"
              v-model:region="form.region"
              @image-change="handleImageChange"
            />
            <StepAdvanced
              v-show="step === 2"
              ref="advancedRef"
              v-model:demand-name="form.demandName"
              v-model:instance-name="form.instanceName"
              v-model:login-password="form.loginPassword"
              v-model:confirm-password="form.confirmPassword"
              v-model:selected-model-ids="form.selectedModelIds"
            />
            <StepConfirm
              v-if="step === 3"
              :demand-name="form.demandName"
              :instance-name="form.instanceName"
              :network-bandwidth="form.networkBandwidth"
              :quantity="form.quantity"
              :region="form.region"
              :selected-spec="selectedSpec"
              :selected-image="selectedImage"
              :disks="form.disks"
              :selected-model-count="form.selectedModelIds.length"
              :fee="fee"
              :fee-loading="feeLoading"
            />
          </div>

          <div class="product-order__footer">
            <div class="product-order__fee-brief" v-loading="feeLoading">
              <div class="product-order__fee-line">
                <span>{{ $t('page.service.product.order.footer.spec') }}</span>
                <strong>{{
                  selectedSpec?.specCode || fee?.specCode || '—'
                }}</strong>
              </div>
              <div class="product-order__fee-line">
                <span>{{ $t('page.service.product.order.footer.quantity') }}</span>
                <el-input-number
                  v-model="form.quantity"
                  :min="1"
                  :max="100"
                  size="small"
                  controls-position="right"
                />
              </div>
              <div class="product-order__fee-line">
                <span>{{ $t('page.service.product.order.footer.configFee') }}</span>
                <strong class="product-order__fee-price">
                  ¥{{ formatFee(fee?.configFee) }}
                  <small>/h</small>
                </strong>
              </div>
              <div class="product-order__fee-line">
                <span>{{ $t('page.service.product.order.footer.networkFee') }}</span>
                <strong class="product-order__fee-price">
                  ¥{{ formatFee(fee?.networkFee) }}
                  <small>/GB</small>
                </strong>
              </div>
            </div>

            <div class="product-order__actions">
              <el-button @click="handleCancel">
                {{ $t('page.service.product.order.actions.cancel') }}
              </el-button>
              <el-button
                :loading="savingDraft"
                :disabled="submitting"
                @click="handleSaveDraft"
              >
                {{ $t('page.service.product.order.actions.saveDraft') }}
              </el-button>
              <el-button v-if="step > 0" @click="handlePrev">
                {{ $t('page.service.product.order.actions.prev') }}
              </el-button>
              <el-button
                v-if="step < 3"
                type="primary"
                @click="handleNext"
              >
                {{ $t('page.service.product.order.actions.next') }}
              </el-button>
              <el-button
                v-else
                type="success"
                :loading="submitting"
                :disabled="savingDraft"
                @click="handleSubmit"
              >
                {{ $t('page.service.product.order.actions.submit') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';

.product-order {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;

  &__steps-card {
    border-radius: 14px;

    :deep(.el-card__body) {
      padding: 20px 16px 12px;
    }
  }

  &__body {
    min-height: 320px;
  }

  &__footer {
    position: sticky;
    bottom: 12px;
    z-index: 5;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: hsl(var(--card) / 92%);
    border: 1px solid var(--el-border-color-light);
    border-radius: 14px;
    box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
    backdrop-filter: blur(8px);
  }

  &__fee-brief {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    align-items: center;
    min-height: 32px;
  }

  &__fee-line {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;

    span {
      color: hsl(var(--muted-foreground));
    }

    strong {
      font-weight: 650;
    }
  }

  &__fee-price {
    color: var(--el-color-primary);

    small {
      margin-left: 2px;
      color: hsl(var(--muted-foreground));
      font-weight: 400;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
  }
}

@media (max-width: 900px) {
  .product-order {
    &__footer {
      flex-direction: column;
      align-items: stretch;
    }

    &__actions {
      justify-content: stretch;

      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
