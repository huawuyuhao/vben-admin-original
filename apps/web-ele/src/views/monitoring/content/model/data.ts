import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  AdminModelEvalAuditStatus,
  AdminModelEvalItem,
  AdminModelEvalListParams,
  AdminModelEvalListResult,
  AdminModelServiceItem,
  AdminModelServiceListParams,
  AdminModelServiceListResult,
  AdminModelServiceStatus,
} from '#/types/monitoring/content/model';

import { $t } from '@vben/locales';
import { formatDate, isEmpty } from '@vben/utils';

/** 模型服务列表默认每页条数（卡片 2 行 × 3 列） */
export const ADMIN_MODEL_PAGE_SIZE = 6;

/** 可选每页条数 */
export const ADMIN_MODEL_PAGE_SIZE_OPTIONS = [6, 12, 18];

/** 评价列表默认每页条数 */
export const ADMIN_MODEL_EVAL_PAGE_SIZE = 10;

/** 评价列表可选每页条数 */
export const ADMIN_MODEL_EVAL_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 停用 */
export const ADMIN_MODEL_STATUS_OFF = 0 as AdminModelServiceStatus;

/** 启用 */
export const ADMIN_MODEL_STATUS_ON = 1 as AdminModelServiceStatus;

/** 评价待审核 */
export const ADMIN_MODEL_AUDIT_PENDING = 0 as AdminModelEvalAuditStatus;

/** 评价已通过 */
export const ADMIN_MODEL_AUDIT_PASSED = 1 as AdminModelEvalAuditStatus;

/** 评价已驳回 */
export const ADMIN_MODEL_AUDIT_REJECTED = 2 as AdminModelEvalAuditStatus;

/** 模型类别：训练类（与接口字符串一致） */
export const ADMIN_MODEL_CATEGORY_TRAIN = '训练类';

/** 模型类别：推理类（与接口字符串一致） */
export const ADMIN_MODEL_CATEGORY_INFER = '推理类';

/** 图标上传 accept */
export const ADMIN_MODEL_IMAGE_ACCEPT = '.jpg,.jpeg,.png';

/** 状态筛选：空串表示全部 */
export type AdminModelStatusFilter =
  | ''
  | `${typeof ADMIN_MODEL_STATUS_OFF}`
  | `${typeof ADMIN_MODEL_STATUS_ON}`;

/** 模型类别筛选：空串表示全部 */
export type AdminModelCategoryFilter =
  | ''
  | typeof ADMIN_MODEL_CATEGORY_INFER
  | typeof ADMIN_MODEL_CATEGORY_TRAIN;

/** 评价审核筛选：空串表示全部 */
export type AdminModelEvalAuditFilter =
  | ''
  | typeof ADMIN_MODEL_AUDIT_PASSED
  | typeof ADMIN_MODEL_AUDIT_PENDING
  | typeof ADMIN_MODEL_AUDIT_REJECTED;

/** 列表查询表单值 */
export interface AdminModelGridFormValues {
  /** 关键词（模型名称） */
  keyword?: string;
  /** 模型类别 */
  modelCategory?: AdminModelCategoryFilter;
  /** 启停状态 */
  status?: AdminModelStatusFilter;
}

/** 评价列表查询表单值 */
export interface AdminModelEvalGridFormValues {
  /** 模型 ID */
  modelId?: string;
  /** 审核状态（空表示全部） */
  auditStatus?: AdminModelEvalAuditFilter;
}

/** 评价审核筛选选项 */
export interface AdminModelEvalAuditFilterOption {
  labelKey: 'all' | 'passed' | 'pending' | 'rejected';
  value: AdminModelEvalAuditFilter;
}

/** 评价审核状态下拉选项 */
export const ADMIN_MODEL_EVAL_AUDIT_FILTER_OPTIONS: AdminModelEvalAuditFilterOption[] =
  [
    { labelKey: 'all', value: '' },
    { labelKey: 'pending', value: ADMIN_MODEL_AUDIT_PENDING },
    { labelKey: 'passed', value: ADMIN_MODEL_AUDIT_PASSED },
    { labelKey: 'rejected', value: ADMIN_MODEL_AUDIT_REJECTED },
  ];

/**
 * 判断是否为允许的图标文件（jpg / jpeg / png）
 * @param file 原始文件
 * @returns 合法返回 true
 */
export function isAllowedAdminModelImageFile(file: File): boolean {
  const name = file.name?.toLowerCase() || '';
  return (
    name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')
  );
}

/**
 * 管理端模型服务查询栏 schema
 */
export function useAdminModelGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: $t(
          'page.monitoring.content.model.filter.keywordPlaceholder',
        ),
      },
      fieldName: 'keyword',
      label: $t('page.monitoring.content.model.filter.keyword'),
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: [
          {
            label: $t('page.monitoring.content.model.category.train'),
            value: ADMIN_MODEL_CATEGORY_TRAIN,
          },
          {
            label: $t('page.monitoring.content.model.category.infer'),
            value: ADMIN_MODEL_CATEGORY_INFER,
          },
        ],
        placeholder: $t('page.monitoring.content.model.filter.categoryAll'),
      },
      fieldName: 'modelCategory',
      label: $t('page.monitoring.content.model.filter.modelCategory'),
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: [
          {
            label: $t('page.monitoring.content.model.status.on'),
            value: String(ADMIN_MODEL_STATUS_ON),
          },
          {
            label: $t('page.monitoring.content.model.status.off'),
            value: String(ADMIN_MODEL_STATUS_OFF),
          },
        ],
        placeholder: $t('page.monitoring.content.model.filter.statusAll'),
      },
      fieldName: 'status',
      label: $t('page.monitoring.content.model.filter.status'),
    },
  ];
}

/**
 * 管理端模型服务表格列配置
 */
export function useAdminModelColumns(): VxeTableGridOptions<AdminModelServiceItem>['columns'] {
  const emptyText = $t('page.monitoring.content.model.valueEmpty');
  return [
    {
      align: 'center',
      cellRender: { name: 'CellImage' },
      field: 'iconUrl',
      minWidth: 80,
      title: $t('page.monitoring.content.model.fields.iconUrl'),
    },
    {
      field: 'modelName',
      minWidth: 150,
      showOverflow: true,
      title: $t('page.monitoring.content.model.fields.modelName'),
      formatter: ({ cellValue }) =>
        displayAdminModelValue(cellValue, emptyText),
    },
    {
      field: 'modelCategory',
      minWidth: 100,
      showOverflow: true,
      title: $t('page.monitoring.content.model.fields.modelCategory'),
      formatter: ({ cellValue }) =>
        displayAdminModelValue(cellValue, emptyText),
    },
    {
      field: 'sceneTag',
      minWidth: 120,
      showOverflow: true,
      title: $t('page.monitoring.content.model.fields.sceneTag'),
      formatter: ({ cellValue }) =>
        displayAdminModelValue(cellValue, emptyText),
    },
    {
      field: 'score',
      minWidth: 80,
      title: $t('page.monitoring.content.model.fields.score'),
      formatter: ({ cellValue }) =>
        formatAdminModelScore(cellValue) || emptyText,
    },
    {
      field: 'callCount',
      minWidth: 100,
      title: $t('page.monitoring.content.model.fields.callCount'),
      formatter: ({ cellValue }) =>
        formatAdminModelCount(cellValue) || emptyText,
    },
    {
      field: 'collectCount',
      minWidth: 90,
      title: $t('page.monitoring.content.model.fields.collectCount'),
      formatter: ({ cellValue }) =>
        formatAdminModelCount(cellValue) || emptyText,
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellTag',
        options: [
          {
            label: $t('page.monitoring.content.model.status.on'),
            type: 'success',
            value: ADMIN_MODEL_STATUS_ON,
          },
          {
            label: $t('page.monitoring.content.model.status.off'),
            type: 'info',
            value: ADMIN_MODEL_STATUS_OFF,
          },
        ],
      },
      field: 'status',
      minWidth: 90,
      title: $t('page.monitoring.content.model.fields.status'),
    },
    {
      field: 'createTime',
      minWidth: 160,
      title: $t('page.monitoring.content.model.fields.createTime'),
      formatter: ({ cellValue }) =>
        formatAdminModelDateTime(cellValue) || emptyText,
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      minWidth: 240,
      slots: { default: 'action' },
      title: $t('page.monitoring.content.model.fields.actions'),
    },
  ];
}

/**
 * 管理端模型评价查询栏 schema
 * @param options.modelIdDisabled 是否锁定模型 ID 输入
 */
export function useAdminModelEvalFormSchema(options?: {
  modelIdDisabled?: boolean;
}): VbenFormSchema[] {
  const modelIdDisabled = !!options?.modelIdDisabled;
  return [
    {
      component: 'Input',
      componentProps: {
        clearable: !modelIdDisabled,
        disabled: modelIdDisabled,
        placeholder: $t(
          'page.monitoring.content.model.eval.modelIdPlaceholder',
        ),
      },
      fieldName: 'modelId',
      label: $t('page.monitoring.content.model.eval.modelIdLabel'),
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: ADMIN_MODEL_EVAL_AUDIT_FILTER_OPTIONS.filter(
          (opt) => opt.value !== '',
        ).map((opt) => ({
          label: $t(
            `page.monitoring.content.model.eval.status.${opt.labelKey}`,
          ),
          value: opt.value,
        })),
        placeholder: $t('page.monitoring.content.model.eval.status.all'),
      },
      fieldName: 'auditStatus',
      label: $t('page.monitoring.content.model.eval.statusLabel'),
    },
  ];
}

/**
 * 管理端模型评价表格列配置
 * @param options.showModelId 是否展示模型 ID 列（从行进入锁定时隐藏）
 */
export function useAdminModelEvalColumns(options?: {
  showModelId?: boolean;
}): VxeTableGridOptions<AdminModelEvalItem>['columns'] {
  const emptyText = $t('page.monitoring.content.model.valueEmpty');
  const showModelId = options?.showModelId !== false;
  const columns: VxeTableGridOptions<AdminModelEvalItem>['columns'] = [
    {
      field: 'evalId',
      minWidth: 140,
      showOverflow: true,
      title: $t('page.monitoring.content.model.eval.fields.evalId'),
      formatter: ({ cellValue }) =>
        displayAdminModelValue(cellValue, emptyText),
    },
  ];

  if (showModelId) {
    columns.push({
      field: 'modelId',
      minWidth: 120,
      showOverflow: true,
      title: $t('page.monitoring.content.model.eval.fields.modelId'),
      formatter: ({ cellValue }) =>
        displayAdminModelValue(cellValue, emptyText),
    });
  }

  columns.push(
    {
      field: 'userName',
      minWidth: 110,
      showOverflow: true,
      title: $t('page.monitoring.content.model.eval.fields.userName'),
      formatter: ({ cellValue }) =>
        displayAdminModelValue(cellValue, emptyText),
    },
    {
      align: 'center',
      field: 'score',
      minWidth: 140,
      slots: { default: 'score' },
      title: $t('page.monitoring.content.model.eval.fields.score'),
    },
    {
      field: 'content',
      minWidth: 200,
      showOverflow: true,
      title: $t('page.monitoring.content.model.eval.fields.content'),
      formatter: ({ cellValue }) =>
        displayAdminModelValue(cellValue, emptyText),
    },
    {
      align: 'center',
      field: 'auditStatus',
      minWidth: 100,
      slots: { default: 'auditStatus' },
      title: $t('page.monitoring.content.model.eval.fields.auditStatus'),
    },
    {
      field: 'createTime',
      minWidth: 160,
      showOverflow: true,
      title: $t('page.monitoring.content.model.eval.fields.createTime'),
      formatter: ({ cellValue }) =>
        formatAdminModelDateTime(cellValue) || emptyText,
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      minWidth: 240,
      slots: { default: 'action' },
      title: $t('page.monitoring.content.model.eval.fields.actions'),
    },
  );

  return columns;
}

/**
 * 将评价查询表单值转为接口筛选参数（不含分页）
 * @param formValues 查询表单值
 * @param lockedModelId 锁定的模型 ID（有值时优先生效）
 * @returns 接口筛选参数
 */
export function buildAdminModelEvalFilterParams(
  formValues?: AdminModelEvalGridFormValues | null,
  lockedModelId?: null | number | string,
): Pick<AdminModelEvalListParams, 'auditStatus' | 'modelId'> {
  const lockedText =
    lockedModelId === null || lockedModelId === undefined
      ? ''
      : String(lockedModelId).trim();
  const modelIdText = lockedText || String(formValues?.modelId ?? '').trim();
  const auditRaw = formValues?.auditStatus;
  const auditStatus =
    auditRaw === '' || auditRaw === undefined || auditRaw === null
      ? undefined
      : (Number(auditRaw) as AdminModelEvalAuditStatus);

  return {
    modelId: modelIdText || undefined,
    auditStatus,
  };
}

/**
 * 归一化模型评价分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeAdminModelEvalPage(
  data?: AdminModelEvalListResult | null,
): {
  current: number;
  records: AdminModelEvalItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || ADMIN_MODEL_EVAL_PAGE_SIZE),
  };
}

/**
 * 将查询表单值转为列表筛选参数（不含分页）
 * @param formValues 查询表单值
 * @returns 接口筛选参数
 */
export function buildAdminModelFilterParams(
  formValues?: AdminModelGridFormValues | null,
): Pick<AdminModelServiceListParams, 'keyword' | 'modelCategory' | 'status'> {
  const category = String(formValues?.modelCategory ?? '').trim();
  const statusRaw = String(formValues?.status ?? '').trim();
  let status: AdminModelServiceStatus | undefined;
  if (statusRaw === String(ADMIN_MODEL_STATUS_ON)) {
    status = ADMIN_MODEL_STATUS_ON;
  } else if (statusRaw === String(ADMIN_MODEL_STATUS_OFF)) {
    status = ADMIN_MODEL_STATUS_OFF;
  }

  return {
    keyword: String(formValues?.keyword ?? '').trim() || undefined,
    modelCategory:
      category === ADMIN_MODEL_CATEGORY_TRAIN ||
      category === ADMIN_MODEL_CATEGORY_INFER
        ? category
        : undefined,
    status,
  };
}

/**
 * 归一化模型服务分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeAdminModelPage(
  data?: AdminModelServiceListResult | null,
): {
  current: number;
  records: AdminModelServiceItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || ADMIN_MODEL_PAGE_SIZE),
  };
}

/**
 * 格式化时间展示
 * @param time 时间字符串
 * @returns 年月日时分秒；无效返回空串
 */
export function formatAdminModelDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm:ss');
}

/**
 * 格式化评分
 * @param score 评分
 * @returns 展示字符串；无效返回空串
 */
export function formatAdminModelScore(score?: null | number): string {
  if (score === null || score === undefined || Number.isNaN(Number(score))) {
    return '';
  }
  const num = Number(score);
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

/**
 * 格式化调用量 / 收藏数
 * @param count 数量
 * @returns 本地化数字；无效返回空串
 */
export function formatAdminModelCount(count?: null | number): string {
  if (count === null || count === undefined || Number.isNaN(Number(count))) {
    return '';
  }
  return Number(count).toLocaleString('zh-CN');
}

/**
 * 展示字段值；空值用占位符
 * @param value 原始值
 * @param emptyText 占位文案
 * @returns 展示字符串
 */
export function displayAdminModelValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value === null || value === undefined) {
    return emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}

/**
 * 是否有模型图标
 * @param iconUrl 图标地址
 * @returns 有图返回 true
 */
export function hasAdminModelIcon(iconUrl?: string): boolean {
  return !isEmpty(iconUrl?.trim());
}

/**
 * 获取启停状态对应的 i18n 键后缀
 * @param status 状态码
 * @returns on / off / unknown
 */
export function resolveAdminModelStatusLabelKey(
  status?: null | number,
): 'off' | 'on' | 'unknown' {
  if (Number(status) === ADMIN_MODEL_STATUS_ON) {
    return 'on';
  }
  if (Number(status) === ADMIN_MODEL_STATUS_OFF) {
    return 'off';
  }
  return 'unknown';
}

/**
 * 获取启停状态对应的 Element Plus 标签类型
 * @param status 状态码
 * @returns tag type
 */
export function resolveAdminModelStatusTagType(
  status?: null | number,
): 'info' | 'success' {
  return Number(status) === ADMIN_MODEL_STATUS_ON ? 'success' : 'info';
}

/**
 * 获取评价审核状态对应的 i18n 键后缀
 * @param status 审核状态
 * @returns pending / passed / rejected / unknown
 */
export function resolveAdminModelEvalAuditLabelKey(
  status?: null | number,
): 'passed' | 'pending' | 'rejected' | 'unknown' {
  const value = Number(status);
  if (value === ADMIN_MODEL_AUDIT_PENDING) {
    return 'pending';
  }
  if (value === ADMIN_MODEL_AUDIT_PASSED) {
    return 'passed';
  }
  if (value === ADMIN_MODEL_AUDIT_REJECTED) {
    return 'rejected';
  }
  return 'unknown';
}

/**
 * 获取评价审核状态对应的标签类型
 * @param status 审核状态
 * @returns tag type
 */
export function resolveAdminModelEvalAuditTagType(
  status?: null | number,
): 'danger' | 'info' | 'success' | 'warning' {
  const value = Number(status);
  if (value === ADMIN_MODEL_AUDIT_PASSED) {
    return 'success';
  }
  if (value === ADMIN_MODEL_AUDIT_REJECTED) {
    return 'danger';
  }
  if (value === ADMIN_MODEL_AUDIT_PENDING) {
    return 'warning';
  }
  return 'info';
}

/**
 * 待审核评价是否可执行通过 / 驳回
 * @param status 审核状态
 * @returns 待审核返回 true
 */
export function canAuditAdminModelEval(status?: null | number): boolean {
  return Number(status) === ADMIN_MODEL_AUDIT_PENDING;
}
