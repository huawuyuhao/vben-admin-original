<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';

import type { SupplyProductItem } from '#/types/service/enterprise/products';

import { computed, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import {
  createSupplyProductApi,
  updateSupplyProductApi,
} from '#/api/service/enterprise/products';

import { resolveSupplyProductId } from '../data';

defineOptions({ name: 'EnterpriseProductsFormDialog' });

const emit = defineEmits<{
  /** 提交成功 */
  success: [];
}>();

/** 弹窗可见 */
const visible = ref(false);
/** 编辑中的产品 ID；新增时为空 */
const editingId = ref<null | number>(null);
/** 提交中 */
const submitting = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  productName: '',
  description: '',
});

/** 是否编辑模式 */
const isEdit = computed(() => editingId.value != null);

/** 弹窗标题 */
const dialogTitle = computed(() =>
  isEdit.value
    ? $t('page.service.enterprise.products.form.editTitle')
    : $t('page.service.enterprise.products.form.createTitle'),
);

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  productName: [
    {
      required: true,
      message: () =>
        $t('page.service.enterprise.products.form.productNameRequired'),
      trigger: 'blur',
    },
  ],
}));

/**
 * 重置表单为初始值
 */
function resetForm() {
  form.productName = '';
  form.description = '';
  formRef.value?.clearValidate();
}

/**
 * 用列表行回填表单
 * @param row 列表行
 */
function fillForm(row: SupplyProductItem) {
  form.productName = row.productName?.trim() || '';
  form.description = row.description?.trim() || '';
}

/**
 * 打开新增弹窗
 */
function openCreate() {
  editingId.value = null;
  resetForm();
  visible.value = true;
}

/**
 * 打开编辑弹窗
 * @param row 列表行
 */
function openEdit(row: SupplyProductItem) {
  const id = resolveSupplyProductId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.enterprise.products.form.invalidId'));
    return;
  }
  editingId.value = id;
  fillForm(row);
  visible.value = true;
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
 * 提交新增 / 编辑
 */
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const payload = {
    productName: form.productName.trim(),
    description: form.description.trim() || undefined,
  };

  submitting.value = true;
  try {
    if (isEdit.value && editingId.value != null) {
      await updateSupplyProductApi(editingId.value, payload);
      ElMessage.success(
        $t('page.service.enterprise.products.form.editSuccess'),
      );
    } else {
      await createSupplyProductApi(payload);
      ElMessage.success(
        $t('page.service.enterprise.products.form.createSuccess'),
      );
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
    class="products-form-dialog"
    destroy-on-close
    :title="dialogTitle"
    width="520px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      class="products-form-dialog__form"
      label-width="96px"
      :model="form"
      :rules="rules"
      @submit.prevent
    >
      <el-form-item
        :label="$t('page.service.enterprise.products.form.fields.productName')"
        prop="productName"
      >
        <el-input
          v-model="form.productName"
          class="products-form-dialog__field"
          maxlength="100"
          :placeholder="
            $t('page.service.enterprise.products.form.productNamePlaceholder')
          "
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        :label="$t('page.service.enterprise.products.form.fields.description')"
        prop="description"
      >
        <el-input
          v-model="form.description"
          class="products-form-dialog__field"
          maxlength="500"
          :placeholder="
            $t('page.service.enterprise.products.form.descriptionPlaceholder')
          "
          :rows="4"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.service.enterprise.products.form.cancel') }}
      </el-button>
      <el-button :loading="submitting" type="primary" @click="handleSubmit">
        {{ $t('page.service.enterprise.products.form.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.products-form-dialog {
  &__field {
    width: 100%;
  }
}
</style>
