<script lang="ts" setup>
/**
 * 按需引入 Element Plus 组件样式（全局注册不会自动注入 CSS）
 */
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/form-item/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/radio/style/css';
import 'element-plus/es/components/radio-group/style/css';

import type { FormInstance, FormRules } from 'element-plus';

import type { ProfileEditForm } from '../data';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { EMAIL_PATTERN, getSexOptions, PHONE_PATTERN } from '../data';

const props = defineProps<{
  /** 是否正在保存 */
  saving?: boolean;
  /** 表单初值（来自缓存资料） */
  modelValue: ProfileEditForm;
}>();

const emit = defineEmits<{
  cancel: [];
  save: [form: ProfileEditForm];
  'update:modelValue': [form: ProfileEditForm];
}>();

/**
 * 修改个人信息表单（独立模块，避免影响展示页样式）
 */
defineOptions({ name: 'MineProfileEditForm' });

const formRef = ref<FormInstance>();
const form = reactive<ProfileEditForm>({ ...props.modelValue });
const sexOptions = computed(() => getSexOptions());

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(form, val);
  },
  { deep: true, immediate: true },
);

/** 表单校验规则（对齐 OpenAPI） */
const rules = computed<FormRules<ProfileEditForm>>(() => ({
  nickName: [
    {
      required: true,
      message: $t('page.mine.profile.edit.nickNameRequired'),
      trigger: 'blur',
    },
    {
      min: 2,
      max: 30,
      message: $t('page.mine.profile.edit.nickNameLength'),
      trigger: 'blur',
    },
  ],
  phonenumber: [
    {
      validator: (_rule, value: string, callback) => {
        const text = String(value ?? '').trim();
        if (!text) {
          callback();
          return;
        }
        if (!PHONE_PATTERN.test(text)) {
          callback(new Error($t('page.mine.profile.edit.invalidPhone')));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  email: [
    {
      validator: (_rule, value: string, callback) => {
        const text = String(value ?? '').trim();
        if (!text) {
          callback();
          return;
        }
        if (text.length > 50) {
          callback(new Error($t('page.mine.profile.edit.emailMaxLength')));
          return;
        }
        if (!EMAIL_PATTERN.test(text)) {
          callback(new Error($t('page.mine.profile.edit.invalidEmail')));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  sex: [
    {
      required: true,
      message: $t('page.mine.profile.edit.sexRequired'),
      trigger: 'change',
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
  const payload: ProfileEditForm = {
    email: form.email.trim(),
    nickName: form.nickName.trim(),
    phonenumber: form.phonenumber.trim(),
    sex: form.sex,
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
  <section class="profile-edit">
    <header class="profile-edit__head">
      <div>
        <h4>{{ $t('page.mine.profile.edit.title') }}</h4>
        <p>{{ $t('page.mine.profile.edit.hint') }}</p>
      </div>
    </header>

    <el-form
      ref="formRef"
      class="profile-edit__form"
      label-position="top"
      require-asterisk-position="right"
      :model="form"
      :rules="rules"
    >
      <div class="profile-edit__grid">
        <el-form-item
          :label="$t('page.mine.profile.fields.nickName')"
          prop="nickName"
          required
        >
          <el-input
            v-model="form.nickName"
            maxlength="30"
            show-word-limit
            :placeholder="$t('page.mine.profile.edit.nickNamePlaceholder')"
            clearable
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.mine.profile.fields.phonenumber')"
          prop="phonenumber"
        >
          <el-input
            v-model="form.phonenumber"
            maxlength="14"
            :placeholder="$t('page.mine.profile.edit.phonePlaceholder')"
            clearable
          />
        </el-form-item>

        <el-form-item :label="$t('page.mine.profile.fields.email')" prop="email">
          <el-input
            v-model="form.email"
            maxlength="50"
            show-word-limit
            :placeholder="$t('page.mine.profile.edit.emailPlaceholder')"
            clearable
          />
        </el-form-item>

        <el-form-item :label="$t('page.mine.profile.fields.sex')" prop="sex">
          <el-radio-group v-model="form.sex" class="profile-edit__sex">
            <el-radio
              v-for="opt in sexOptions"
              :key="opt.value"
              :value="opt.value"
              border
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <div class="profile-edit__actions">
        <el-button @click="handleCancel">
          {{ $t('page.mine.profile.edit.cancel') }}
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ $t('page.mine.profile.edit.save') }}
        </el-button>
      </div>
    </el-form>
  </section>
</template>

<style lang="scss" scoped>
.profile-edit {
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px 20px;
  }

  &__form {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    :deep(.el-form-item__label) {
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: hsl(var(--foreground));
      line-height: 1.4;
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

    :deep(.el-radio.is-bordered) {
      margin-right: 10px;
      margin-bottom: 0;
      padding: 8px 14px;
      border-radius: 10px;
    }

    :deep(.el-radio.is-bordered.is-checked) {
      border-color: hsl(var(--primary));
      background: hsl(var(--primary) / 0.08);
    }
  }

  &__sex {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
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

@media (max-width: 1200px) {
  .profile-edit {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 640px) {
  .profile-edit {
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
