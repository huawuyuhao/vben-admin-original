<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';

import type { EnterpriseEditForm } from '../data';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { PHONE_PATTERN } from '../data';

const props = defineProps<{
  /** 是否正在保存 */
  saving?: boolean;
  /** 表单初值 */
  modelValue: EnterpriseEditForm;
}>();

const emit = defineEmits<{
  cancel: [];
  save: [form: EnterpriseEditForm];
  'update:modelValue': [form: EnterpriseEditForm];
}>();

/**
 * 修改企业信息表单（仅联系电话、企业地址可改）
 */
defineOptions({ name: 'AdminEnterpriseInfoEditForm' });

const formRef = ref<FormInstance>();
const form = reactive<EnterpriseEditForm>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(form, val);
  },
  { deep: true, immediate: true },
);

/** 表单校验规则（对齐 PUT 必填项） */
const rules = computed<FormRules<EnterpriseEditForm>>(() => ({
  contactPhone: [
    {
      required: true,
      message: $t('page.admin.enterprise.info.edit.phoneRequired'),
      trigger: 'blur',
    },
    {
      validator: (_rule, value: string, callback) => {
        const text = String(value ?? '').trim();
        if (!text) {
          callback();
          return;
        }
        if (!PHONE_PATTERN.test(text)) {
          callback(
            new Error($t('page.admin.enterprise.info.edit.invalidPhone')),
          );
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  address: [
    {
      required: true,
      message: $t('page.admin.enterprise.info.edit.addressRequired'),
      trigger: 'blur',
    },
    {
      min: 2,
      max: 200,
      message: $t('page.admin.enterprise.info.edit.addressLength'),
      trigger: 'blur',
    },
  ],
}));

/**
 * 校验通过后向父组件抛出保存事件
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  const payload: EnterpriseEditForm = {
    contactPhone: form.contactPhone.trim(),
    address: form.address.trim(),
  };
  emit('update:modelValue', payload);
  emit('save', payload);
}

/**
 * 取消编辑
 */
function handleCancel() {
  emit('cancel');
}
</script>

<template>
  <section class="enterprise-edit">
    <header class="enterprise-edit__head">
      <div>
        <h4>{{ $t('page.admin.enterprise.info.edit.title') }}</h4>
        <p>{{ $t('page.admin.enterprise.info.edit.hint') }}</p>
      </div>
    </header>

    <el-form
      ref="formRef"
      class="enterprise-edit__form"
      label-position="top"
      require-asterisk-position="right"
      :model="form"
      :rules="rules"
    >
      <div class="enterprise-edit__grid">
        <el-form-item
          :label="$t('page.admin.enterprise.info.fields.contactPhone')"
          prop="contactPhone"
          required
        >
          <el-input
            v-model="form.contactPhone"
            maxlength="14"
            clearable
            :placeholder="
              $t('page.admin.enterprise.info.edit.phonePlaceholder')
            "
          />
        </el-form-item>

        <el-form-item
          class="enterprise-edit__full"
          :label="$t('page.admin.enterprise.info.fields.address')"
          prop="address"
          required
        >
          <el-input
            v-model="form.address"
            maxlength="200"
            show-word-limit
            clearable
            :placeholder="
              $t('page.admin.enterprise.info.edit.addressPlaceholder')
            "
          />
        </el-form-item>
      </div>

      <div class="enterprise-edit__actions">
        <el-button @click="handleCancel">
          {{ $t('page.admin.enterprise.info.edit.cancel') }}
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ $t('page.admin.enterprise.info.edit.save') }}
        </el-button>
      </div>
    </el-form>
  </section>
</template>

<style lang="scss" scoped>
.enterprise-edit {
  margin-bottom: 16px;
  padding: 22px 24px 18px;
  background: hsl(var(--card) / 0.96);
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  box-shadow: 0 8px 24px hsl(var(--foreground) / 0.06);

  &__head {
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid hsl(var(--border));

    h4 {
      margin: 0 0 6px;
      font-size: 16px;
      font-weight: 700;
      color: hsl(var(--foreground));
    }

    p {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: hsl(var(--muted-foreground));
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 20px;
  }

  &__full {
    grid-column: 1 / -1;
  }

  &__form {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    :deep(.el-form-item__label) {
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.4;
      color: hsl(var(--foreground));
    }

    :deep(.el-input__wrapper) {
      min-height: 40px;
      padding: 0 12px;
      background: hsl(var(--background));
      border-radius: 10px;
      box-shadow: 0 0 0 1px hsl(var(--border)) inset;

      &:hover {
        box-shadow: 0 0 0 1px hsl(var(--primary) / 0.35) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px hsl(var(--primary)) inset;
      }
    }

    :deep(.el-input__inner) {
      height: 40px;
      font-size: 14px;
      color: hsl(var(--foreground));
    }

    :deep(.el-input .el-input__count) {
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }
  }

  &__actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 4px;
    padding-top: 14px;
    border-top: 1px solid hsl(var(--border));

    :deep(.el-button) {
      min-width: 96px;
      height: 36px;
      border-radius: 10px;
    }

    :deep(.el-button--primary) {
      border: 0;
      box-shadow: 0 8px 16px hsl(var(--primary) / 0.24);
    }
  }
}

@media (max-width: 640px) {
  .enterprise-edit {
    padding: 18px 16px 14px;

    &__grid {
      grid-template-columns: 1fr;
    }

    &__actions {
      flex-direction: column-reverse;

      :deep(.el-button) {
        width: 100%;
        margin: 0;
      }
    }
  }
}
</style>
