<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';

import type { ModelMarketItem } from '#/types/service/product/order';

import { computed, onMounted, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Search } from '@element-plus/icons-vue';

import { getModelMarketListApi } from '#/api/service/product/order';

import { MODEL_PAGE_SIZE } from '../data';

const props = defineProps<{
  confirmPassword: string;
  demandName: string;
  instanceName: string;
  loginPassword: string;
  /** 已选模型 ID 列表（模型市场） */
  selectedModelIds: number[];
}>();

const emit = defineEmits<{
  'update:confirmPassword': [string];
  'update:demandName': [string];
  'update:instanceName': [string];
  'update:loginPassword': [string];
  'update:selectedModelIds': [number[]];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const keyword = ref('');
const models = ref<ModelMarketItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(MODEL_PAGE_SIZE);

const selectedSet = computed(() => new Set(props.selectedModelIds));

/** 本地表单模型（与父级双向同步，供校验使用） */
const formModel = reactive({
  demandName: props.demandName,
  instanceName: props.instanceName,
  loginPassword: props.loginPassword,
  confirmPassword: props.confirmPassword,
});

watch(
  () => [
    props.demandName,
    props.instanceName,
    props.loginPassword,
    props.confirmPassword,
  ],
  ([demandName, instanceName, loginPassword, confirmPassword]) => {
    formModel.demandName = String(demandName ?? '');
    formModel.instanceName = String(instanceName ?? '');
    formModel.loginPassword = String(loginPassword ?? '');
    formModel.confirmPassword = String(confirmPassword ?? '');
  },
);

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  demandName: [
    {
      required: true,
      message: () => $t('page.service.product.order.advanced.demandNameRequired'),
      trigger: 'blur',
    },
  ],
  instanceName: [
    {
      required: true,
      message: () =>
        $t('page.service.product.order.advanced.instanceNameRequired'),
      trigger: 'blur',
    },
    {
      pattern: /^[\w-]{2,64}$/,
      message: () =>
        $t('page.service.product.order.advanced.instanceNamePattern'),
      trigger: 'blur',
    },
  ],
  loginPassword: [
    {
      required: true,
      message: () =>
        $t('page.service.product.order.advanced.passwordRequired'),
      trigger: 'blur',
    },
    {
      min: 8,
      max: 30,
      message: () => $t('page.service.product.order.advanced.passwordLength'),
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: () =>
        $t('page.service.product.order.advanced.confirmPasswordRequired'),
      trigger: 'blur',
    },
    {
      validator: (_rule, value, callback) => {
        if (value !== formModel.loginPassword) {
          callback(
            new Error(
              $t('page.service.product.order.advanced.passwordMismatch'),
            ),
          );
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
}));

/**
 * 拉取模型列表
 */
async function fetchModels() {
  loading.value = true;
  try {
    const data = await getModelMarketListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
    });
    models.value = data.records ?? [];
    total.value = data.total ?? 0;
  } catch {
    models.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 回到第一页查询
 */
function queryFromFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchModels();
}

/**
 * 切换模型选中
 * @param model 模型
 */
function toggleModel(model: ModelMarketItem) {
  const id = model.modelId;
  const next = new Set(props.selectedModelIds);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  emit('update:selectedModelIds', [...next]);
}

/**
 * 校验高级配置表单
 * @returns 是否通过
 */
async function validate(): Promise<boolean> {
  if (!formRef.value) {
    return false;
  }
  try {
    await formRef.value.validate();
    return true;
  } catch {
    return false;
  }
}

watch(currentPage, () => {
  void fetchModels();
});

watch(pageSize, () => {
  queryFromFirstPage();
});

onMounted(() => {
  void fetchModels();
});

defineExpose({ validate });
</script>

<template>
  <div class="order-advanced">
    <el-card class="order-advanced__card" shadow="never">
      <template #header>
        <div class="order-advanced__card-head">
          <h3>{{ $t('page.service.product.order.advanced.accountTitle') }}</h3>
          <p>{{ $t('page.service.product.order.advanced.accountDesc') }}</p>
        </div>
      </template>

      <el-form
        ref="formRef"
        class="order-advanced__form"
        label-position="top"
        :model="formModel"
        :rules="rules"
      >
        <div class="order-advanced__grid">
          <el-form-item
            :label="$t('page.service.product.order.advanced.demandName')"
            prop="demandName"
          >
            <el-input
              v-model="formModel.demandName"
              clearable
              maxlength="100"
              show-word-limit
              :placeholder="
                $t('page.service.product.order.advanced.demandNamePlaceholder')
              "
              @update:model-value="
                (v: string) => emit('update:demandName', v)
              "
            />
          </el-form-item>

          <el-form-item
            :label="$t('page.service.product.order.advanced.instanceName')"
            prop="instanceName"
          >
            <el-input
              v-model="formModel.instanceName"
              clearable
              maxlength="64"
              :placeholder="
                $t(
                  'page.service.product.order.advanced.instanceNamePlaceholder',
                )
              "
              @update:model-value="
                (v: string) => emit('update:instanceName', v)
              "
            />
          </el-form-item>

          <el-form-item
            :label="$t('page.service.product.order.advanced.loginPassword')"
            prop="loginPassword"
          >
            <el-input
              v-model="formModel.loginPassword"
              type="password"
              show-password
              clearable
              maxlength="30"
              :placeholder="
                $t(
                  'page.service.product.order.advanced.passwordPlaceholder',
                )
              "
              @update:model-value="
                (v: string) => emit('update:loginPassword', v)
              "
            />
          </el-form-item>

          <el-form-item
            :label="$t('page.service.product.order.advanced.confirmPassword')"
            prop="confirmPassword"
          >
            <el-input
              v-model="formModel.confirmPassword"
              type="password"
              show-password
              clearable
              maxlength="30"
              :placeholder="
                $t(
                  'page.service.product.order.advanced.confirmPasswordPlaceholder',
                )
              "
              @update:model-value="
                (v: string) => emit('update:confirmPassword', v)
              "
            />
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <el-card class="order-advanced__card" shadow="never">
      <template #header>
        <div class="order-advanced__card-head">
          <h3>
            {{ $t('page.service.product.order.advanced.modelTitle') }}
            <el-tag effect="plain" round size="small" type="info">
              {{ $t('page.service.product.order.advanced.optional') }}
            </el-tag>
          </h3>
          <p>{{ $t('page.service.product.order.advanced.modelDesc') }}</p>
        </div>
      </template>

      <div class="order-advanced__search">
        <el-input
          v-model="keyword"
          clearable
          :placeholder="
            $t('page.service.product.order.advanced.modelKeywordPlaceholder')
          "
          @keyup.enter="queryFromFirstPage"
        >
          <template #append>
            <el-button :icon="Search" @click="queryFromFirstPage" />
          </template>
        </el-input>
      </div>

      <div v-loading="loading" class="order-advanced__model-grid">
        <el-empty
          v-if="!loading && models.length === 0"
          :description="$t('page.service.product.order.advanced.modelEmpty')"
        />
        <button
          v-for="item in models"
          :key="item.modelId"
          type="button"
          class="order-advanced__model-card"
          :class="{
            'order-advanced__model-card--active': selectedSet.has(item.modelId),
          }"
          @click="toggleModel(item)"
        >
          <div class="order-advanced__model-icon">
            <el-image
              v-if="item.iconUrl"
              :src="item.iconUrl"
              fit="cover"
              class="order-advanced__model-img"
            />
            <span v-else class="order-advanced__model-fallback">
              {{ (item.modelName || 'M').slice(0, 1) }}
            </span>
          </div>
          <div class="order-advanced__model-body">
            <div class="order-advanced__model-name">
              {{ item.modelName || `Model #${item.modelId}` }}
            </div>
            <div class="order-advanced__model-tags">
              <el-tag
                v-if="item.modelCategory"
                size="small"
                effect="plain"
                round
              >
                {{ item.modelCategory }}
              </el-tag>
              <el-tag v-if="item.sceneTag" size="small" effect="plain" round>
                {{ item.sceneTag }}
              </el-tag>
            </div>
            <p v-if="item.description" class="order-advanced__model-desc">
              {{ item.description }}
            </p>
          </div>
        </button>
      </div>

      <div v-if="total > 0" class="order-advanced__pager">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          background
          layout="total, prev, pager, next"
          :total="total"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.order-advanced {
  display: flex;
  flex-direction: column;
  gap: 16px;

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

  &__search {
    max-width: 360px;
    margin-bottom: 16px;
  }

  &__model-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
    min-height: 80px;
  }

  &__model-card {
    display: flex;
    gap: 12px;
    padding: 14px;
    text-align: left;
    cursor: pointer;
    background: hsl(var(--background));
    border: 1px solid var(--el-border-color);
    border-radius: 12px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary-light-5);
    }

    &--active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 1px var(--el-color-primary);
    }
  }

  &__model-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    overflow: hidden;
    background: var(--el-color-primary-light-9);
    border-radius: 10px;
  }

  &__model-img {
    width: 48px;
    height: 48px;
  }

  &__model-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 18px;
    font-weight: 700;
    color: var(--el-color-primary);
  }

  &__model-body {
    min-width: 0;
  }

  &__model-name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }

  &__model-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }

  &__model-desc {
    display: -webkit-box;
    margin: 6px 0 0;
    overflow: hidden;
    -webkit-line-clamp: 2;
    font-size: 12px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
  }

  &__pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .order-advanced {
    &__grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
