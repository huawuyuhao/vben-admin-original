<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { ElMessage, type FormInstance, type FormRules } from 'element-plus';

import { submitModelEvaluationApi } from '#/api/service/model';
import { ensureLoggedIn } from '#/store/common';

defineOptions({ name: 'ServiceModelEvaluateDialog' });

const visible = defineModel<boolean>('visible', { default: false });

const props = defineProps<{
  /** 模型 ID */
  modelId?: number;
  /** 模型名称（展示用） */
  modelName?: string;
}>();

const emit = defineEmits<{
  /** 提交成功 */
  success: [];
}>();

const formRef = ref<FormInstance>();
/** 提交中 */
const submitting = ref(false);

/** 评价表单 */
const form = reactive({
  score: 5,
  content: '',
});

/** 校验规则 */
const rules = reactive<FormRules>({
  score: [
    {
      required: true,
      message: () => $t('page.service.model.evaluate.scoreRequired'),
      trigger: 'change',
    },
  ],
  content: [
    {
      required: true,
      message: () => $t('page.service.model.evaluate.contentRequired'),
      trigger: 'blur',
    },
    {
      min: 2,
      max: 500,
      message: () => $t('page.service.model.evaluate.contentLength'),
      trigger: 'blur',
    },
  ],
});

/**
 * 重置表单
 */
function resetForm() {
  form.score = 5;
  form.content = '';
  formRef.value?.clearValidate();
}

watch(visible, (open) => {
  if (open) {
    resetForm();
  }
});

/**
 * 提交评价
 */
async function handleSubmit() {
  if (!props.modelId) {
    return;
  }
  if (!ensureLoggedIn(`/service/model/${props.modelId}`)) {
    return;
  }

  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitting.value = true;
  try {
    await submitModelEvaluationApi({
      modelId: props.modelId,
      score: form.score,
      content: form.content.trim(),
    });
    ElMessage.success($t('page.service.model.evaluate.success'));
    visible.value = false;
    emit('success');
  } catch {
    // 错误提示由请求拦截器处理
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="$t('page.service.model.evaluate.title')"
    width="520px"
    destroy-on-close
    append-to-body
  >
    <p v-if="modelName" class="model-evaluate__name">{{ modelName }}</p>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent
    >
      <el-form-item
        :label="$t('page.service.model.evaluate.scoreLabel')"
        prop="score"
      >
        <el-rate v-model="form.score" :max="5" show-score />
      </el-form-item>
      <el-form-item
        :label="$t('page.service.model.evaluate.contentLabel')"
        prop="content"
      >
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          :placeholder="$t('page.service.model.evaluate.contentPlaceholder')"
        />
      </el-form-item>
    </el-form>

    <p class="model-evaluate__tip">
      {{ $t('page.service.model.evaluate.auditTip') }}
    </p>

    <template #footer>
      <el-button @click="visible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('page.service.model.evaluate.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.model-evaluate {
  &__name {
    margin: 0 0 16px;
    font-size: 15px;
    font-weight: 700;
    color: hsl(var(--foreground));
  }

  &__tip {
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
  }
}
</style>
