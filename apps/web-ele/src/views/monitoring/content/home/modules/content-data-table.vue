<script lang="ts" setup>
import type { PortalContentItem, PortalContentType } from '#/types/monitoring/content/home/common';

import { computed } from 'vue';

import { $t } from '@vben/locales';

import {
  PORTAL_CONTENT_STATUS_ENABLED,
  canSubmitPortalContentAudit,
  formatPortalContentDateTime,
  getPortalContentAuditLabelKey,
  getPortalContentAuditTagType,
  getPortalContentStatusLabelKey,
  getPortalContentStatusTagType,
  hasPortalContentImage,
  resolvePortalContentRowImageUrl,
  showsPortalContentImageColumn,
  supportsPortalContentSort,
} from '../data';

defineOptions({ name: 'PortalContentDataTable' });

const props = defineProps<{
  /** 内容类型 */
  contentType: PortalContentType;
  /** 表格数据 */
  records: PortalContentItem[];
  /** 加载中 */
  loading?: boolean;
}>();

/** 排序草稿（contentId -> sortOrder） */
const sortDrafts = defineModel<Record<number, number>>('sortDrafts', {
  required: true,
});

const emit = defineEmits<{
  /** 编辑 */
  edit: [row: PortalContentItem];
  /** 查看 */
  view: [row: PortalContentItem];
  /** 下线 */
  offline: [row: PortalContentItem];
  /** 提交审核 */
  submitAudit: [row: PortalContentItem];
  /** 删除 */
  remove: [row: PortalContentItem];
}>();

/** 是否展示排序序号列 */
const showSort = computed(() => supportsPortalContentSort(props.contentType));
const showStatus = computed(
  () =>
    props.contentType === 'banner' ||
    props.contentType === 'news' ||
    props.contentType === 'service',
);

/** 是否展示审核状态列 */
const showAudit = computed(
  () =>
    props.contentType === 'banner' ||
    props.contentType === 'news' ||
    props.contentType === 'service',
);

/** 标题 / 图片列同宽 */
const titleColWidth = 140;
/** 跳转链接、创建/更新时间列同宽 */
const datetimeColWidth = 168;
/** 排序列宽 */
const sortColWidth = 148;
/** 操作列宽（多枚 link 按钮单行展示） */
const opsColWidth = 360;

/** 是否展示图片列 */
const showImage = computed(() => showsPortalContentImageColumn(props.contentType));

/** 表格内可预览的图片列表（已归一化 URL） */
const previewImageList = computed(() =>
  props.records
    .map((row) => resolvePortalContentRowImageUrl(row, props.contentType))
    .filter((url) => hasPortalContentImage(url)),
);

/**
 * 获取提交审核确认文案
 * @param row 行数据
 */
function submitAuditConfirmTitle(row: PortalContentItem): string {
  const label = row.title?.trim() || String(row.contentId);
  return $t('page.monitoring.content.home.common.submitAuditConfirm', [label]);
}

/**
 * 获取下线确认文案
 * @param row 行数据
 */
function offlineConfirmTitle(row: PortalContentItem): string {
  const label = row.title?.trim() || String(row.contentId);
  return $t('page.monitoring.content.home.common.offlineConfirm', [label]);
}

/**
 * 获取删除确认文案
 * @param row 行数据
 */
function deleteConfirmTitle(row: PortalContentItem): string {
  const label = row.title?.trim() || String(row.contentId);
  return $t('ui.actionMessage.deleteConfirm', [label]);
}

/**
 * 解析状态文案 i18n
 * @param status 状态码
 */
function statusLabel(status?: number) {
  const key = getPortalContentStatusLabelKey(status);
  return $t(`page.monitoring.content.home.common.status.${key}`);
}

/**
 * 解析审核状态文案 i18n
 * @param auditStatus 审核状态码
 */
function auditLabel(auditStatus?: null | number) {
  const key = getPortalContentAuditLabelKey(auditStatus);
  return $t(`page.monitoring.content.home.common.audit.${key}`);
}

/**
 * 获取行图片地址
 * @param row 行数据
 */
function rowImageUrl(row: PortalContentItem): string {
  return resolvePortalContentRowImageUrl(row, props.contentType);
}

/**
 * 获取预览图在列表中的索引
 * @param url 图片地址
 */
function previewIndex(url: string) {
  if (!hasPortalContentImage(url)) {
    return 0;
  }
  const index = previewImageList.value.indexOf(url);
  return index >= 0 ? index : 0;
}

/**
 * 更新单行排序草稿
 * @param contentId 内容 ID
 * @param value 排序值
 */
function updateSortDraft(contentId: number, value?: number) {
  sortDrafts.value = {
    ...sortDrafts.value,
    [contentId]: Number(value) || 0,
  };
}
</script>

<template>
  <el-card class="content-table" shadow="never">
    <el-table
      v-loading="loading"
      class="content-table__el"
      :data="records"
      row-key="contentId"
      stripe
      border
      empty-text=""
      header-cell-class-name="content-table__header-cell"
      table-layout="fixed"
    >
      <template #empty>
        <el-empty
          :description="$t('page.monitoring.content.home.common.empty')"
          :image-size="88"
        />
      </template>

      <!-- 左侧固定：序号（行号） -->
      <el-table-column
        fixed="left"
        type="index"
        width="56"
        align="center"
        header-align="center"
        :index="(i: number) => i + 1"
        :label="$t('page.monitoring.content.home.common.fields.sortIndex')"
      />

      <!-- 左侧固定：图片 -->
      <el-table-column
        v-if="showImage"
        fixed="left"
        :width="titleColWidth"
        align="center"
        header-align="center"
        :label="$t('page.monitoring.content.home.common.fields.image')"
      >
        <template #default="{ row }">
          <el-image
            v-if="hasPortalContentImage(rowImageUrl(row))"
            class="content-table__thumb"
            fit="cover"
            lazy
            preview-teleported
            :src="rowImageUrl(row)"
            :preview-src-list="previewImageList"
            :initial-index="previewIndex(rowImageUrl(row))"
          />
          <span v-else class="content-table__placeholder">—</span>
        </template>
      </el-table-column>

      <!-- 左侧固定：标题 -->
      <el-table-column
        fixed="left"
        prop="title"
        :width="titleColWidth"
        align="center"
        header-align="center"
        show-overflow-tooltip
        :label="$t('page.monitoring.content.home.common.fields.title')"
      />

      <!-- 中间可滚动列 -->
      <el-table-column
        v-if="contentType === 'news'"
        prop="summary"
        min-width="180"
        align="center"
        header-align="center"
        show-overflow-tooltip
        :label="$t('page.monitoring.content.home.common.fields.summary')"
      />

      <el-table-column
        v-if="contentType === 'billing' || contentType === 'about'"
        prop="content"
        min-width="220"
        align="center"
        header-align="center"
        show-overflow-tooltip
        :label="$t('page.monitoring.content.home.common.fields.content')"
      />

      <el-table-column
        v-if="contentType === 'banner'"
        prop="linkUrl"
        :width="datetimeColWidth"
        align="center"
        header-align="center"
        show-overflow-tooltip
        :label="$t('page.monitoring.content.home.common.fields.linkUrl')"
      >
        <template #default="{ row }">
          <span v-if="row.linkUrl">{{ row.linkUrl }}</span>
          <span v-else class="content-table__placeholder">—</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="contentType === 'news'"
        prop="viewCount"
        min-width="90"
        align="center"
        header-align="center"
        :label="$t('page.monitoring.content.home.common.fields.viewCount')"
      >
        <template #default="{ row }">
          {{ row.viewCount ?? '—' }}
        </template>
      </el-table-column>

      <el-table-column
        v-if="showStatus"
        min-width="90"
        align="center"
        header-align="center"
        :label="$t('page.monitoring.content.home.common.fields.status')"
      >
        <template #default="{ row }">
          <el-tag
            :type="getPortalContentStatusTagType(row.status)"
            effect="light"
            size="small"
          >
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        v-if="showAudit"
        min-width="100"
        align="center"
        header-align="center"
        :label="$t('page.monitoring.content.home.common.fields.auditStatus')"
      >
        <template #default="{ row }">
          <el-tag
            v-if="row.auditStatus !== null && row.auditStatus !== undefined"
            :type="getPortalContentAuditTagType(row.auditStatus)"
            effect="light"
            size="small"
          >
            {{ auditLabel(row.auditStatus) }}
          </el-tag>
          <span v-else class="content-table__placeholder">—</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="contentType === 'news'"
        min-width="160"
        align="center"
        header-align="center"
        :label="$t('page.monitoring.content.home.common.fields.publishTime')"
      >
        <template #default="{ row }">
          {{ formatPortalContentDateTime(row.publishTime) }}
        </template>
      </el-table-column>

      <el-table-column
        v-if="contentType === 'banner'"
        :width="datetimeColWidth"
        align="center"
        header-align="center"
        show-overflow-tooltip
        :label="$t('page.monitoring.content.home.common.fields.createTime')"
      >
        <template #default="{ row }">
          {{ formatPortalContentDateTime(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column
        :width="datetimeColWidth"
        align="center"
        header-align="center"
        show-overflow-tooltip
        :label="$t('page.monitoring.content.home.common.fields.updateTime')"
      >
        <template #default="{ row }">
          {{ formatPortalContentDateTime(row.updateTime) }}
        </template>
      </el-table-column>

      <!-- 排序（紧邻操作列左侧，随中间列横向滚动） -->
      <el-table-column
        v-if="showSort"
        :width="sortColWidth"
        align="center"
        header-align="center"
        class-name="content-table__sort-cell"
        :label="$t('page.monitoring.content.home.common.fields.sortEdit')"
      >
        <template #default="{ row }">
          <el-input-number
            class="content-table__sort-input"
            :min="0"
            :model-value="sortDrafts[row.contentId]"
            controls-position="right"
            size="small"
            @update:model-value="(v) => updateSortDraft(row.contentId, v as number)"
          />
        </template>
      </el-table-column>

      <!-- 右侧固定：操作 -->
      <el-table-column
        fixed="right"
        :width="opsColWidth"
        align="center"
        header-align="center"
        class-name="content-table__ops-cell"
        :label="$t('page.monitoring.content.home.common.fields.actions')"
      >
        <template #default="{ row }">
          <div class="content-table__ops">
            <el-button link type="primary" @click="emit('edit', row)">
              {{ $t('page.monitoring.content.home.common.actions.edit') }}
            </el-button>
            <el-button link type="primary" @click="emit('view', row)">
              {{ $t('page.monitoring.content.home.common.actions.view') }}
            </el-button>
            <el-popconfirm
              v-if="canSubmitPortalContentAudit(row.auditStatus)"
              :title="submitAuditConfirmTitle(row)"
              width="220"
              :confirm-button-text="$t('common.confirm')"
              :cancel-button-text="$t('common.cancel')"
              @confirm="emit('submitAudit', row)"
            >
              <template #reference>
                <el-button link type="primary">
                  {{ $t('page.monitoring.content.home.common.actions.submitAudit') }}
                </el-button>
              </template>
            </el-popconfirm>
            <el-button v-else link type="primary" disabled>
              {{ $t('page.monitoring.content.home.common.actions.submitAudit') }}
            </el-button>
            <el-popconfirm
              v-if="showStatus && row.status === PORTAL_CONTENT_STATUS_ENABLED"
              :title="offlineConfirmTitle(row)"
              width="220"
              :confirm-button-text="$t('common.confirm')"
              :cancel-button-text="$t('common.cancel')"
              confirm-button-type="warning"
              @confirm="emit('offline', row)"
            >
              <template #reference>
                <el-button link type="warning">
                  {{ $t('page.monitoring.content.home.common.actions.offline') }}
                </el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm
              :title="deleteConfirmTitle(row)"
              width="220"
              :confirm-button-text="$t('common.confirm')"
              :cancel-button-text="$t('common.cancel')"
              confirm-button-type="danger"
              @confirm="emit('remove', row)"
            >
              <template #reference>
                <el-button link type="danger">
                  {{ $t('page.monitoring.content.home.common.actions.delete') }}
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style lang="scss" scoped>
.content-table {
  margin-bottom: 8px;

  &__el {
    width: 100%;

    :deep(.content-table__header-cell) {
      text-align: center;

      .cell {
        white-space: nowrap;
      }
    }

    :deep(.el-table__body-wrapper) {
      overflow-x: auto;
    }
  }

  &__thumb {
    display: block;
    width: 120px;
    height: 68px;
    margin: 0 auto;
    border-radius: 6px;
    cursor: zoom-in;

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
    }
  }

  &__sort-input {
    width: 120px;
  }

  &__ops {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 0 2px;
    align-items: center;
    justify-content: center;
    white-space: nowrap;

    :deep(.el-button.is-link) {
      flex-shrink: 0;
      padding-right: 4px;
      padding-left: 4px;
    }
  }

  :deep(.content-table__ops-cell .cell) {
    overflow: visible;
    white-space: nowrap;
  }

  :deep(.content-table__sort-cell .cell) {
    overflow: visible;
  }

  &__placeholder {
    color: hsl(var(--muted-foreground));
    font-size: 13px;
  }
}
</style>
