<script lang="ts" setup>
import type {
  MyAppItem,
  MyAppMaterialItem,
} from '#/types/service/mydemand/apps';
import type {
  FormInstance,
  FormRules,
  UploadProps,
  UploadUserFile,
} from 'element-plus';

import { computed, reactive, ref, watch } from 'vue';

import {
  Delete,
  Document,
  Picture,
  Plus,
  Refresh,
  View,
} from '@element-plus/icons-vue';
import { $t } from '@vben/locales';
import { isEmpty } from '@vben/utils';
import { ElMessage } from 'element-plus';

import { uploadImageApi } from '#/api/common';
import {
  createMyAppMaterialApi,
  deleteMyAppMaterialApi,
  getMyAppMaterialListApi,
  toggleMyAppMaterialApi,
  updateMyAppMaterialApi,
} from '#/api/service/mydemand/apps';

import {
  APP_STATUS_OFF,
  APP_STATUS_ON,
  MATERIAL_MAX_FILE_COUNT,
  MATERIAL_MAX_FILE_SIZE_MB,
  MATERIAL_PAGE_SIZE,
  MATERIAL_PAGE_SIZE_OPTIONS,
  MATERIAL_UPLOAD_ACCEPT,
  displayAppValue,
  formatAppDateTime,
  getAppStatusI18nKey,
  getAppStatusTagType,
  getMaterialFileName,
  isAllowedMaterialFile,
  isAppEnabled,
  isMaterialImageUrl,
  isMaterialPdfUrl,
  normalizeMaterialPage,
  parseMaterialAttachmentUrls,
  resolveMaterialId,
  resolveMyAppId,
} from '../data';

defineOptions({ name: 'MyDemandAppsMaterialDialog' });

/** 抽屉可见 */
const visible = ref(false);
/** 当前应用 ID */
const appId = ref<null | number>(null);
/** 当前应用名称 */
const appName = ref('');
/** 列表加载中 */
const loading = ref(false);
/** 列表数据 */
const materials = ref<MyAppMaterialItem[]>([]);
/** 总条数 */
const total = ref(0);
/** 当前页 */
const currentPage = ref(1);
/** 每页条数 */
const pageSize = ref(MATERIAL_PAGE_SIZE);
/** 跳过由服务端回写触发的重复请求 */
const syncingFromServer = ref(false);
/** 正在启停的素材 ID */
const togglingId = ref<null | number>(null);

/** 表单弹窗可见 */
const formVisible = ref(false);
/** 编辑中的素材 ID */
const editingMaterialId = ref<null | number>(null);
/** 表单提交中 */
const submitting = ref(false);
/** 附件上传中 */
const uploading = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();

const form = reactive({
  materialName: '',
  description: '',
  status: APP_STATUS_ON as number,
  attachmentUrls: [] as string[],
});

/** 上传组件文件列表（仅新上传展示，已有附件单独列表） */
const uploadFileList = ref<UploadUserFile[]>([]);

/** 图片预览 */
const imagePreviewVisible = ref(false);
/** 图片预览地址列表 */
const imagePreviewList = ref<string[]>([]);
/** 图片预览起始下标 */
const imagePreviewIndex = ref(0);

/** 抽屉标题 */
const drawerTitle = computed(() => {
  const base = $t('page.service.mydemand.apps.material.title');
  return appName.value ? `${base} · ${appName.value}` : base;
});

/** 是否编辑素材 */
const isEditMaterial = computed(() => editingMaterialId.value != null);

/** 素材表单标题 */
const formTitle = computed(() =>
  isEditMaterial.value
    ? $t('page.service.mydemand.apps.material.editTitle')
    : $t('page.service.mydemand.apps.material.createTitle'),
);

/** 表单校验规则 */
const rules = computed<FormRules>(() => ({
  materialName: [
    {
      required: true,
      message: () => $t('page.service.mydemand.apps.material.nameRequired'),
      trigger: 'blur',
    },
  ],
}));

/**
 * 重置素材表单
 */
function resetMaterialForm() {
  form.materialName = '';
  form.description = '';
  form.status = APP_STATUS_ON;
  form.attachmentUrls = [];
  uploadFileList.value = [];
  formRef.value?.clearValidate();
}

/**
 * 用素材行回填表单（含附件列表）
 * @param row 素材行
 */
function fillMaterialForm(row: MyAppMaterialItem) {
  form.materialName = row.materialName?.trim() || '';
  form.description = row.description?.trim() || '';
  form.status =
    Number(row.status) === APP_STATUS_OFF ? APP_STATUS_OFF : APP_STATUS_ON;
  form.attachmentUrls = parseMaterialAttachmentUrls(row);
  uploadFileList.value = [];
}

/**
 * 拉取素材列表
 */
async function fetchMaterials() {
  if (appId.value == null) {
    materials.value = [];
    total.value = 0;
    return;
  }

  loading.value = true;
  try {
    const data = await getMyAppMaterialListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      appId: appId.value,
    });
    const page = normalizeMaterialPage(data);
    materials.value = page.records;
    total.value = page.total;

    if (page.current !== currentPage.value) {
      syncingFromServer.value = true;
      currentPage.value = page.current;
      syncingFromServer.value = false;
    }
  } catch {
    materials.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 打开素材管理抽屉
 * @param row 应用行
 */
function open(row: MyAppItem) {
  const id = resolveMyAppId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.apps.material.invalidId'));
    return;
  }
  appId.value = id;
  appName.value = row.appName?.trim() || String(id);
  currentPage.value = 1;
  pageSize.value = MATERIAL_PAGE_SIZE;
  visible.value = true;
  void fetchMaterials();
}

/**
 * 关闭抽屉
 */
function handleClose() {
  visible.value = false;
}

watch(visible, (open) => {
  if (!open) {
    appId.value = null;
    appName.value = '';
    materials.value = [];
    total.value = 0;
    formVisible.value = false;
    editingMaterialId.value = null;
    resetMaterialForm();
    closeImagePreview();
  }
});

watch(pageSize, () => {
  if (!visible.value || syncingFromServer.value) {
    return;
  }
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchMaterials();
});

watch(currentPage, () => {
  if (!visible.value || syncingFromServer.value) {
    return;
  }
  void fetchMaterials();
});

/**
 * 打开新增素材表单
 */
function openCreateMaterial() {
  editingMaterialId.value = null;
  resetMaterialForm();
  formVisible.value = true;
}

/**
 * 打开编辑素材表单并回显列表数据
 * @param row 素材行
 */
function openEditMaterial(row: MyAppMaterialItem) {
  const id = resolveMaterialId(row);
  if (id == null) {
    ElMessage.warning(
      $t('page.service.mydemand.apps.material.invalidMaterialId'),
    );
    return;
  }
  editingMaterialId.value = id;
  fillMaterialForm(row);
  formVisible.value = true;
}

/**
 * 关闭素材表单
 */
function handleFormClose() {
  formVisible.value = false;
  editingMaterialId.value = null;
  resetMaterialForm();
}

/**
 * 上传前校验格式与大小
 * @param raw 原始文件
 */
const beforeUpload: UploadProps['beforeUpload'] = (raw) => {
  if (!isAllowedMaterialFile(raw)) {
    ElMessage.warning($t('page.service.mydemand.apps.material.typeInvalid'));
    return false;
  }
  if (raw.size / 1024 / 1024 > MATERIAL_MAX_FILE_SIZE_MB) {
    ElMessage.warning(
      $t('page.service.mydemand.apps.material.sizeInvalid', [
        MATERIAL_MAX_FILE_SIZE_MB,
      ]),
    );
    return false;
  }
  if (form.attachmentUrls.length >= MATERIAL_MAX_FILE_COUNT) {
    ElMessage.warning(
      $t('page.service.mydemand.apps.material.limit', [
        MATERIAL_MAX_FILE_COUNT,
      ]),
    );
    return false;
  }
  return true;
};

/**
 * 超出上传数量限制
 */
const handleUploadExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(
    $t('page.service.mydemand.apps.material.limit', [MATERIAL_MAX_FILE_COUNT]),
  );
};

/**
 * 自定义上传附件（共用 upload 接口）
 * @param options 上传选项
 */
async function handleFileUpload(options: { file: File }) {
  uploading.value = true;
  try {
    const result = await uploadImageApi(options.file);
    const url = String(result?.url ?? '').trim();
    if (isEmpty(url)) {
      ElMessage.error($t('page.service.mydemand.apps.material.uploadFail'));
      return;
    }
    form.attachmentUrls.push(url);
    uploadFileList.value = [];
  } catch {
    // 错误提示由接口层处理
  } finally {
    uploading.value = false;
  }
}

/**
 * 移除已回显 / 已上传的附件
 * @param url 附件地址
 */
function removeAttachment(url: string) {
  const target = String(url || '').trim();
  if (!target) {
    return;
  }
  form.attachmentUrls = form.attachmentUrls.filter((item) => item !== target);
}

/**
 * 提交素材新增 / 编辑（提交当前附件列表，含保留与新传）
 */
async function handleMaterialSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid || appId.value == null) {
    return;
  }

  if (form.attachmentUrls.length === 0) {
    ElMessage.warning(
      $t('page.service.mydemand.apps.material.attachmentRequired'),
    );
    return;
  }

  const payload = {
    materialName: form.materialName.trim(),
    description: form.description.trim() || undefined,
    attachmentUrls: [...form.attachmentUrls],
    status:
      Number(form.status) === APP_STATUS_OFF ? APP_STATUS_OFF : APP_STATUS_ON,
    appId: appId.value,
  };

  submitting.value = true;
  try {
    if (isEditMaterial.value && editingMaterialId.value != null) {
      await updateMyAppMaterialApi(editingMaterialId.value, payload);
      ElMessage.success($t('page.service.mydemand.apps.material.editSuccess'));
    } else {
      await createMyAppMaterialApi(payload);
      ElMessage.success(
        $t('page.service.mydemand.apps.material.createSuccess'),
      );
    }
    handleFormClose();
    void fetchMaterials();
  } catch {
    // 错误提示由接口层处理
  } finally {
    submitting.value = false;
  }
}

/**
 * 删除素材
 * @param row 素材行
 */
async function handleDeleteMaterial(row: MyAppMaterialItem) {
  const id = resolveMaterialId(row);
  if (id == null) {
    ElMessage.warning(
      $t('page.service.mydemand.apps.material.invalidMaterialId'),
    );
    return;
  }

  try {
    await deleteMyAppMaterialApi(id);
    ElMessage.success($t('page.service.mydemand.apps.material.deleteSuccess'));
    void fetchMaterials();
  } catch {
    // 错误提示由接口层处理
  }
}

/**
 * 素材启停
 * @param row 素材行
 */
async function handleToggleMaterial(row: MyAppMaterialItem) {
  const id = resolveMaterialId(row);
  if (id == null) {
    ElMessage.warning(
      $t('page.service.mydemand.apps.material.invalidMaterialId'),
    );
    return;
  }

  const enabled = isAppEnabled(row.status);
  const action = enabled ? 'disable' : 'enable';
  togglingId.value = id;
  try {
    await toggleMyAppMaterialApi(id, action);
    ElMessage.success(
      $t(
        enabled
          ? 'page.service.mydemand.apps.material.disableSuccess'
          : 'page.service.mydemand.apps.material.enableSuccess',
      ),
    );
    void fetchMaterials();
  } catch {
    // 错误提示由接口层处理
  } finally {
    togglingId.value = null;
  }
}

/**
 * 预览附件：图片走预览器，其它新开标签
 * @param url 当前附件
 * @param urls 同组附件（用于图片左右切换）
 */
function previewAttachment(url: string, urls?: string[]) {
  const target = String(url || '').trim();
  if (!target) {
    return;
  }

  if (isMaterialImageUrl(target)) {
    const images = (urls || [target]).filter((item) => isMaterialImageUrl(item));
    const index = Math.max(0, images.indexOf(target));
    imagePreviewList.value = images.length > 0 ? images : [target];
    imagePreviewIndex.value = index;
    imagePreviewVisible.value = true;
    return;
  }

  window.open(target, '_blank', 'noopener,noreferrer');
}

/**
 * 关闭图片预览
 */
function closeImagePreview() {
  imagePreviewVisible.value = false;
  imagePreviewList.value = [];
  imagePreviewIndex.value = 0;
}

defineExpose({ open });
</script>

<template>
  <el-drawer
    v-model="visible"
    class="material-drawer"
    destroy-on-close
    size="1120px"
    :title="drawerTitle"
    @close="handleClose"
  >
    <div class="material-drawer__toolbar">
      <el-button :icon="Refresh" :loading="loading" @click="fetchMaterials">
        {{ $t('page.service.mydemand.apps.material.refresh') }}
      </el-button>
      <el-button type="primary" :icon="Plus" @click="openCreateMaterial">
        {{ $t('page.service.mydemand.apps.material.add') }}
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      class="material-drawer__table"
      :data="materials"
      stripe
      :empty-text="$t('page.service.mydemand.apps.material.empty')"
    >
      <el-table-column
        :label="$t('page.service.mydemand.apps.material.fields.materialName')"
        min-width="140"
        prop="materialName"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayAppValue(
              row.materialName,
              $t('page.service.mydemand.apps.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.mydemand.apps.material.fields.description')"
        min-width="140"
        prop="description"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{
            displayAppValue(
              row.description,
              $t('page.service.mydemand.apps.valueEmpty'),
            )
          }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.mydemand.apps.material.fields.attachment')"
        min-width="240"
      >
        <template #default="{ row }">
          <div
            v-if="parseMaterialAttachmentUrls(row).length > 0"
            class="material-drawer__files"
          >
            <button
              v-for="url in parseMaterialAttachmentUrls(row)"
              :key="url"
              class="material-drawer__file"
              type="button"
              @click="previewAttachment(url, parseMaterialAttachmentUrls(row))"
            >
              <el-icon>
                <Picture v-if="isMaterialImageUrl(url)" />
                <Document v-else />
              </el-icon>
              <span :title="getMaterialFileName(url)">
                {{ getMaterialFileName(url) }}
              </span>
              <el-icon class="material-drawer__file-view"><View /></el-icon>
            </button>
          </div>
          <span v-else class="material-drawer__empty-file">
            {{ $t('page.service.mydemand.apps.material.noAttachment') }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :label="$t('page.service.mydemand.apps.material.fields.status')"
        width="90"
      >
        <template #default="{ row }">
          <el-tag
            effect="light"
            round
            size="small"
            :type="getAppStatusTagType(row.status)"
          >
            {{
              $t(
                `page.service.mydemand.apps.status.${getAppStatusI18nKey(row.status)}`,
              )
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('page.service.mydemand.apps.material.fields.createTime')"
        width="150"
      >
        <template #default="{ row }">
          {{
            formatAppDateTime(row.createTime) ||
            $t('page.service.mydemand.apps.valueEmpty')
          }}
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        fixed="right"
        :label="$t('page.service.mydemand.apps.material.fields.actions')"
        width="200"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditMaterial(row)">
            {{ $t('page.service.mydemand.apps.material.edit') }}
          </el-button>
          <el-button
            link
            type="primary"
            :loading="togglingId === row.materialId"
            @click="handleToggleMaterial(row)"
          >
            {{
              isAppEnabled(row.status)
                ? $t('page.service.mydemand.apps.material.disable')
                : $t('page.service.mydemand.apps.material.enable')
            }}
          </el-button>
          <el-popconfirm
            width="240"
            confirm-button-type="danger"
            :cancel-button-text="
              $t('page.service.mydemand.apps.material.deleteCancelBtn')
            "
            :confirm-button-text="
              $t('page.service.mydemand.apps.material.deleteConfirmBtn')
            "
            :title="
              $t('page.service.mydemand.apps.material.deleteConfirm', [
                row.materialName?.trim() ||
                  String(row.materialId ?? '') ||
                  $t('page.service.mydemand.apps.valueEmpty'),
              ])
            "
            @confirm="handleDeleteMaterial(row)"
          >
            <template #reference>
              <el-button link type="danger">
                {{ $t('page.service.mydemand.apps.material.delete') }}
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div
      v-if="materials.length > 0 || loading || total > 0"
      class="material-drawer__pager"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        layout="total, sizes, prev, pager, next"
        :disabled="loading"
        :page-sizes="MATERIAL_PAGE_SIZE_OPTIONS"
        :total="total"
      />
    </div>

    <el-dialog
      v-model="formVisible"
      align-center
      append-to-body
      class="material-form-dialog"
      destroy-on-close
      :title="formTitle"
      width="760px"
      @close="handleFormClose"
    >
      <el-form
        ref="formRef"
        label-position="top"
        :model="form"
        :rules="rules"
      >
        <div class="material-form-dialog__grid">
          <el-form-item
            :label="
              $t('page.service.mydemand.apps.material.fields.materialName')
            "
            prop="materialName"
          >
            <el-input
              v-model="form.materialName"
              clearable
              maxlength="100"
              :placeholder="
                $t('page.service.mydemand.apps.material.namePlaceholder')
              "
            />
          </el-form-item>

          <el-form-item
            :label="$t('page.service.mydemand.apps.material.statusLabel')"
          >
            <el-switch
              v-model="form.status"
              :active-text="$t('page.service.mydemand.apps.status.on')"
              :active-value="APP_STATUS_ON"
              :inactive-text="$t('page.service.mydemand.apps.status.off')"
              :inactive-value="APP_STATUS_OFF"
            />
          </el-form-item>
        </div>

        <el-form-item
          :label="$t('page.service.mydemand.apps.material.fields.description')"
        >
          <el-input
            v-model="form.description"
            :autosize="{ minRows: 3, maxRows: 6 }"
            maxlength="500"
            show-word-limit
            type="textarea"
            :placeholder="
              $t('page.service.mydemand.apps.material.descPlaceholder')
            "
          />
        </el-form-item>

        <el-form-item
          :label="$t('page.service.mydemand.apps.material.fields.attachment')"
          required
        >
          <div class="material-form-dialog__attachments">
            <div class="material-form-dialog__section-title">
              {{
                $t('page.service.mydemand.apps.material.existingAttachments')
              }}
              <span class="material-form-dialog__count">
                {{ form.attachmentUrls.length }}/{{ MATERIAL_MAX_FILE_COUNT }}
              </span>
            </div>

            <div
              v-if="form.attachmentUrls.length > 0"
              class="material-form-dialog__file-list"
            >
              <div
                v-for="url in form.attachmentUrls"
                :key="url"
                class="material-form-dialog__file-item"
              >
                <button
                  class="material-form-dialog__file-main"
                  type="button"
                  @click="previewAttachment(url, form.attachmentUrls)"
                >
                  <el-icon>
                    <Picture v-if="isMaterialImageUrl(url)" />
                    <Document v-else />
                  </el-icon>
                  <span :title="getMaterialFileName(url)">
                    {{ getMaterialFileName(url) }}
                  </span>
                  <el-tag
                    v-if="isMaterialPdfUrl(url)"
                    size="small"
                    type="info"
                  >
                    PDF
                  </el-tag>
                </button>
                <el-button
                  :icon="Delete"
                  link
                  type="danger"
                  @click="removeAttachment(url)"
                >
                  {{ $t('page.service.mydemand.apps.material.removeFile') }}
                </el-button>
              </div>
            </div>
            <el-empty
              v-else
              :description="
                $t('page.service.mydemand.apps.material.noAttachment')
              "
              :image-size="64"
            />

            <div class="material-form-dialog__section-title">
              {{ $t('page.service.mydemand.apps.material.addMore') }}
            </div>
            <el-upload
              v-model:file-list="uploadFileList"
              :accept="MATERIAL_UPLOAD_ACCEPT"
              :before-upload="beforeUpload"
              :disabled="
                uploading || form.attachmentUrls.length >= MATERIAL_MAX_FILE_COUNT
              "
              drag
              :http-request="handleFileUpload"
              :limit="MATERIAL_MAX_FILE_COUNT"
              multiple
              :on-exceed="handleUploadExceed"
              :show-file-list="false"
            >
              <el-icon class="el-icon--upload"><Plus /></el-icon>
              <div class="el-upload__text">
                {{ $t('page.service.mydemand.apps.material.uploadText') }}
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  {{
                    $t('page.service.mydemand.apps.material.uploadTip', [
                      MATERIAL_MAX_FILE_SIZE_MB,
                      MATERIAL_MAX_FILE_COUNT,
                    ])
                  }}
                </div>
              </template>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleFormClose">
          {{ $t('page.service.mydemand.apps.material.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="submitting || uploading"
          @click="handleMaterialSubmit"
        >
          {{ $t('page.service.mydemand.apps.material.submit') }}
        </el-button>
      </template>
    </el-dialog>
  </el-drawer>

  <el-image-viewer
    v-if="imagePreviewVisible"
    teleported
    :initial-index="imagePreviewIndex"
    :url-list="imagePreviewList"
    :z-index="4100"
    @close="closeImagePreview"
  />
</template>

<style lang="scss" scoped>
.material-drawer {
  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
    margin-bottom: 16px;
  }

  &__table {
    width: 100%;
  }

  &__pager {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin-top: 16px;
  }

  &__files {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__file {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    max-width: 100%;
    padding: 0;
    overflow: hidden;
    font-size: 13px;
    color: var(--el-color-primary);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;

    span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover {
      opacity: 0.85;
    }
  }

  &__file-view {
    flex-shrink: 0;
    opacity: 0.7;
  }

  &__empty-file {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.material-form-dialog {
  &__grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 0 20px;
  }

  &__attachments {
    width: 100%;
  }

  &__section-title {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-regular);
  }

  &__count {
    font-weight: 500;
    color: var(--el-text-color-secondary);
  }

  &__file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__file-item {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  &__file-main {
    display: inline-flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    min-width: 0;
    padding: 0;
    overflow: hidden;
    font-size: 13px;
    color: var(--el-color-primary);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;

    span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 28px 16px;
  }

  :deep(.el-upload__tip) {
    margin-top: 8px;
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .material-form-dialog {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
