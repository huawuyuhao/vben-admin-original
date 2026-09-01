<script lang="ts" setup>
import type { ComputeDemandItem } from '#/types/service/mydemand/compute';

import { computed, ref } from 'vue';

import { $t } from '@vben/locales';
import { downloadFileFromUrl, isHttpUrl } from '@vben/utils';
import { ElMessage } from 'element-plus';

import {
  downloadComputeDemandResultApi,
  getComputeDemandDetailApi,
  previewComputeDemandResultApi,
} from '#/api/service/mydemand/compute';

import {
  formatComputeDateTime,
  getComputeStatusI18nKey,
  getComputeStatusTagType,
  getComputeTypeI18nKey,
  isComputeDemandDone,
  isComputePreviewUrl,
  resolveComputeDemandId,
  resolveComputeDownloadUrl,
} from '../data';

defineOptions({ name: 'MyDemandComputeDetailDialog' });

/** 弹窗可见 */
const visible = ref(false);
/** 详情加载中 */
const loading = ref(false);
/** 预览加载中 */
const previewLoading = ref(false);
/** 下载中 */
const downloading = ref(false);
/** 当前详情 */
const detail = ref<ComputeDemandItem | null>(null);
/** 预览内容 */
const previewContent = ref('');
/** 是否已拉取过预览 */
const previewLoaded = ref(false);

/** 是否已完成（可预览/下载） */
const canShowResult = computed(() => isComputeDemandDone(detail.value?.status));

/** 预览内容是否为链接 */
const previewIsUrl = computed(() => isComputePreviewUrl(previewContent.value));

/** 预览可打开地址 */
const previewOpenUrl = computed(() => {
  const text = previewContent.value.trim();
  if (!text) {
    return '';
  }
  if (isHttpUrl(text)) {
    return text;
  }
  if (text.startsWith('/')) {
    return `${window.location.origin}${text}`;
  }
  return '';
});

/**
 * 展示字段空值占位
 * @param value 原始值
 * @returns 展示文案
 */
function displayValue(value?: null | number | string): string {
  if (value == null) {
    return $t('page.service.mydemand.compute.valueEmpty');
  }
  const text = String(value).trim();
  return text || $t('page.service.mydemand.compute.valueEmpty');
}

/**
 * 打开详情弹窗
 * @param row 列表行
 */
async function open(row: ComputeDemandItem) {
  const id = resolveComputeDemandId(row);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.compute.form.invalidId'));
    return;
  }

  detail.value = { ...row };
  previewContent.value = '';
  previewLoaded.value = false;
  visible.value = true;

  loading.value = true;
  try {
    const data = await getComputeDemandDetailApi(id);
    if (data) {
      detail.value = data;
    }
  } catch {
    // 保留列表行数据
  } finally {
    loading.value = false;
  }

  if (isComputeDemandDone(detail.value?.status)) {
    void loadPreview(id);
  }
}

/**
 * 拉取结果预览
 * @param id 需求 ID
 */
async function loadPreview(id: number) {
  previewLoading.value = true;
  try {
    const data = await previewComputeDemandResultApi(id);
    previewContent.value = data?.resultContent?.trim() || '';
    previewLoaded.value = true;
  } catch {
    previewContent.value = '';
    previewLoaded.value = true;
  } finally {
    previewLoading.value = false;
  }
}

/**
 * 下载结果文件
 */
async function handleDownload() {
  const id = resolveComputeDemandId(detail.value);
  if (id == null) {
    ElMessage.warning($t('page.service.mydemand.compute.form.invalidId'));
    return;
  }

  downloading.value = true;
  try {
    const result = await downloadComputeDemandResultApi(id);
    const downloadUrl = resolveComputeDownloadUrl(result?.fileUrl);
    if (!downloadUrl) {
      ElMessage.error($t('page.service.mydemand.compute.result.noUrl'));
      return;
    }
    await downloadFileFromUrl({ source: downloadUrl });
    ElMessage.success($t('page.service.mydemand.compute.result.downloadSuccess'));
  } catch {
    // 错误提示由接口层处理
  } finally {
    downloading.value = false;
  }
}

/**
 * 关闭弹窗
 */
function handleClose() {
  visible.value = false;
}

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    class="compute-detail-dialog"
    destroy-on-close
    :title="$t('page.service.mydemand.compute.detail.title')"
    width="720px"
    @close="handleClose"
  >
    <div v-loading="loading" class="compute-detail-dialog__body">
      <el-descriptions :column="2" border>
        <el-descriptions-item
          :label="$t('page.service.mydemand.compute.fields.demandNo')"
        >
          {{ displayValue(detail?.demandNo) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.mydemand.compute.fields.demandName')"
        >
          {{ displayValue(detail?.demandName) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.mydemand.compute.fields.demandType')"
        >
          {{
            $t(
              `page.service.mydemand.compute.type.${getComputeTypeI18nKey(detail?.demandType)}`,
            )
          }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.mydemand.compute.fields.status')"
        >
          <el-tag
            effect="light"
            round
            size="small"
            :type="getComputeStatusTagType(detail?.status)"
          >
            {{
              $t(
                `page.service.mydemand.compute.status.${getComputeStatusI18nKey(detail?.status)}`,
              )
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.mydemand.compute.fields.resourceSpec')"
          :span="2"
        >
          {{ displayValue(detail?.resourceSpec) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.mydemand.compute.fields.applicationId')"
        >
          {{ displayValue(detail?.applicationId) }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.mydemand.compute.fields.submitTime')"
        >
          {{
            formatComputeDateTime(detail?.submitTime || detail?.createTime) ||
            $t('page.service.mydemand.compute.valueEmpty')
          }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.mydemand.compute.fields.resultTime')"
        >
          {{
            formatComputeDateTime(detail?.resultTime) ||
            $t('page.service.mydemand.compute.valueEmpty')
          }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="$t('page.service.mydemand.compute.fields.resultFile')"
        >
          {{ displayValue(detail?.resultFile) }}
        </el-descriptions-item>
      </el-descriptions>

      <section v-if="canShowResult" class="compute-detail-dialog__result">
        <div class="compute-detail-dialog__result-head">
          <h3>{{ $t('page.service.mydemand.compute.result.title') }}</h3>
          <el-button
            type="primary"
            :loading="downloading"
            @click="handleDownload"
          >
            {{ $t('page.service.mydemand.compute.result.download') }}
          </el-button>
        </div>

        <div v-loading="previewLoading" class="compute-detail-dialog__preview">
          <template v-if="previewContent">
            <div v-if="previewIsUrl" class="compute-detail-dialog__preview-link">
              <el-link
                :href="previewOpenUrl"
                target="_blank"
                type="primary"
              >
                {{ $t('page.service.mydemand.compute.result.openPreview') }}
              </el-link>
              <p class="compute-detail-dialog__preview-path">
                {{ previewContent }}
              </p>
            </div>
            <pre v-else class="compute-detail-dialog__preview-text">{{
              previewContent
            }}</pre>
          </template>
          <el-empty
            v-else-if="previewLoaded"
            :description="$t('page.service.mydemand.compute.result.empty')"
          />
        </div>
      </section>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('page.service.mydemand.compute.detail.close') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.compute-detail-dialog {
  &__body {
    min-height: 120px;
  }

  &__result {
    margin-top: 20px;
  }

  &__result-head {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
    }
  }

  &__preview {
    min-height: 120px;
    padding: 12px;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    background: hsl(var(--muted) / 0.25);
  }

  &__preview-link {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__preview-path {
    margin: 0;
    color: hsl(var(--muted-foreground));
    font-size: 13px;
    word-break: break-all;
  }

  &__preview-text {
    margin: 0;
    max-height: 320px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
