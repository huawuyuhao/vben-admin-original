import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  LoginLogExportParams,
  LoginLogItem,
  LoginLogListParams,
  LoginLogListResult,
  LoginLogStatus,
} from '#/types/mine/profile/login-log';

import { $t } from '@vben/locales';
import { formatDate, isEmpty } from '@vben/utils';

export { resolveExportDownloadUrl as resolveLoginLogExportDownloadUrl } from '#/store/common';

/** 登录日志默认每页条数 */
export const LOGIN_LOG_PAGE_SIZE = 10;

/** 可选每页条数 */
export const LOGIN_LOG_PAGE_SIZE_OPTIONS = [10, 20, 50];

/** 登录成功 */
export const LOGIN_LOG_STATUS_SUCCESS = '0' as LoginLogStatus;

/** 登录失败 */
export const LOGIN_LOG_STATUS_FAIL = '1' as LoginLogStatus;

/** 登录状态筛选：空串表示全部 */
export type LoginLogStatusFilter =
  | ''
  | typeof LOGIN_LOG_STATUS_FAIL
  | typeof LOGIN_LOG_STATUS_SUCCESS;

/** 访问时间范围（起止，含时分秒） */
export type LoginLogTimeRange = [string, string] | null;

/** 查询表单值 */
export interface LoginLogGridFormValues {
  /** 用户账号 */
  userName?: string;
  /** 登录 IP */
  ipaddr?: string;
  /** 登录地点 */
  loginLocation?: string;
  /** 登录状态 */
  status?: LoginLogStatusFilter;
  /** 访问时间范围 */
  loginTimeRange?: LoginLogTimeRange;
}

/**
 * 登录日志查询栏 schema
 */
export function useLoginLogGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: $t('page.mine.loginLog.filter.userNamePlaceholder'),
      },
      fieldName: 'userName',
      label: $t('page.mine.loginLog.filter.userName'),
    },
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: $t('page.mine.loginLog.filter.ipaddrPlaceholder'),
      },
      fieldName: 'ipaddr',
      label: $t('page.mine.loginLog.filter.ipaddr'),
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: [
          {
            label: $t('page.mine.loginLog.status.success'),
            value: LOGIN_LOG_STATUS_SUCCESS,
          },
          {
            label: $t('page.mine.loginLog.status.fail'),
            value: LOGIN_LOG_STATUS_FAIL,
          },
        ],
        placeholder: $t('page.mine.loginLog.filter.statusAll'),
      },
      fieldName: 'status',
      label: $t('page.mine.loginLog.filter.status'),
    },
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: $t('page.mine.loginLog.filter.loginLocationPlaceholder'),
      },
      fieldName: 'loginLocation',
      label: $t('page.mine.loginLog.filter.loginLocation'),
    },
    {
      component: 'DatePicker',
      componentProps: {
        clearable: true,
        endPlaceholder: $t('page.mine.loginLog.filter.loginTimeEnd'),
        format: 'YYYY-MM-DD HH:mm:ss',
        rangeSeparator: '-',
        startPlaceholder: $t('page.mine.loginLog.filter.loginTimeStart'),
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'loginTimeRange',
      label: $t('page.mine.loginLog.filter.loginTime'),
    },
  ];
}

/**
 * 登录日志表格列配置
 */
export function useLoginLogColumns(): VxeTableGridOptions<LoginLogItem>['columns'] {
  const emptyText = $t('page.mine.loginLog.valueEmpty');
  return [
    {
      field: 'infoId',
      minWidth: 90,
      showOverflow: true,
      title: $t('page.mine.loginLog.fields.infoId'),
      formatter: ({ cellValue }) => displayLoginLogValue(cellValue, emptyText),
    },
    {
      field: 'userName',
      minWidth: 120,
      showOverflow: true,
      title: $t('page.mine.loginLog.fields.userName'),
      formatter: ({ cellValue }) => displayLoginLogValue(cellValue, emptyText),
    },
    {
      field: 'ipaddr',
      minWidth: 130,
      showOverflow: true,
      title: $t('page.mine.loginLog.fields.ipaddr'),
      formatter: ({ cellValue }) => displayLoginLogValue(cellValue, emptyText),
    },
    {
      field: 'loginLocation',
      minWidth: 130,
      showOverflow: true,
      title: $t('page.mine.loginLog.fields.loginLocation'),
      formatter: ({ cellValue }) => displayLoginLogValue(cellValue, emptyText),
    },
    {
      field: 'browser',
      minWidth: 110,
      showOverflow: true,
      title: $t('page.mine.loginLog.fields.browser'),
      formatter: ({ cellValue }) => displayLoginLogValue(cellValue, emptyText),
    },
    {
      field: 'os',
      minWidth: 110,
      showOverflow: true,
      title: $t('page.mine.loginLog.fields.os'),
      formatter: ({ cellValue }) => displayLoginLogValue(cellValue, emptyText),
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellTag',
        options: [
          {
            label: $t('page.mine.loginLog.status.success'),
            type: 'success',
            value: LOGIN_LOG_STATUS_SUCCESS,
          },
          {
            label: $t('page.mine.loginLog.status.fail'),
            type: 'danger',
            value: LOGIN_LOG_STATUS_FAIL,
          },
        ],
      },
      field: 'status',
      minWidth: 100,
      title: $t('page.mine.loginLog.fields.status'),
    },
    {
      field: 'msg',
      minWidth: 140,
      showOverflow: true,
      title: $t('page.mine.loginLog.fields.msg'),
      formatter: ({ cellValue }) => displayLoginLogValue(cellValue, emptyText),
    },
    {
      field: 'loginTime',
      minWidth: 170,
      title: $t('page.mine.loginLog.fields.loginTime'),
      formatter: ({ cellValue }) =>
        formatLoginLogDateTime(cellValue) || emptyText,
    },
  ];
}

/**
 * 解析登录状态筛选值为接口参数
 * @param status 筛选值
 * @returns 合法状态；全部时返回 undefined
 */
export function parseLoginLogStatusFilter(
  status?: LoginLogStatusFilter | null,
): LoginLogStatus | undefined {
  if (status === LOGIN_LOG_STATUS_SUCCESS || status === LOGIN_LOG_STATUS_FAIL) {
    return status;
  }
  return undefined;
}

/**
 * 将时间范围转为列表 / 导出查询中的 beginTime / endTime
 * @param range 日期时间范围
 * @returns 若依 params[beginTime] / params[endTime]；无范围时为空对象
 */
export function buildLoginLogTimeParams(
  range?: LoginLogTimeRange,
): Pick<LoginLogListParams, 'params[beginTime]' | 'params[endTime]'> {
  if (!range?.[0] || !range[1]) {
    return {};
  }
  return {
    'params[beginTime]': range[0],
    'params[endTime]': range[1],
  };
}

/**
 * 将查询表单值转为列表 / 导出筛选参数（不含分页）
 * @param formValues 查询表单值
 * @returns 接口筛选参数
 */
export function buildLoginLogFilterParams(
  formValues?: LoginLogGridFormValues | null,
): LoginLogExportParams {
  return {
    userName: String(formValues?.userName ?? '').trim() || undefined,
    ipaddr: String(formValues?.ipaddr ?? '').trim() || undefined,
    loginLocation: String(formValues?.loginLocation ?? '').trim() || undefined,
    status: parseLoginLogStatusFilter(formValues?.status),
    ...buildLoginLogTimeParams(formValues?.loginTimeRange ?? null),
  };
}

/**
 * 归一化登录日志分页结果
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeLoginLogPage(data?: LoginLogListResult | null): {
  current: number;
  records: LoginLogItem[];
  size: number;
  total: number;
} {
  return {
    records: Array.isArray(data?.records) ? data!.records : [],
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || LOGIN_LOG_PAGE_SIZE),
  };
}

/**
 * 格式化访问时间
 * @param time 时间字符串
 * @returns 年月日时分秒；无效返回空串
 */
export function formatLoginLogDateTime(time?: string): string {
  if (isEmpty(time?.trim())) {
    return '';
  }
  return formatDate(time!.trim(), 'YYYY-MM-DD HH:mm:ss');
}

/**
 * 获取登录状态对应的 i18n 键后缀
 * @param status 登录状态
 * @returns success / fail / unknown
 */
export function getLoginLogStatusI18nKey(
  status?: null | string,
): 'fail' | 'success' | 'unknown' {
  const value = String(status ?? '').trim();
  if (value === LOGIN_LOG_STATUS_SUCCESS) {
    return 'success';
  }
  if (value === LOGIN_LOG_STATUS_FAIL) {
    return 'fail';
  }
  return 'unknown';
}

/**
 * 获取登录状态对应的 Element Plus 标签类型
 * @param status 登录状态
 * @returns tag type
 */
export function getLoginLogStatusTagType(
  status?: null | string,
): 'danger' | 'info' | 'success' {
  const value = String(status ?? '').trim();
  if (value === LOGIN_LOG_STATUS_SUCCESS) {
    return 'success';
  }
  if (value === LOGIN_LOG_STATUS_FAIL) {
    return 'danger';
  }
  return 'info';
}

/**
 * 展示空值占位
 * @param value 原始值
 * @param emptyText 空占位文案
 * @returns 展示文本
 */
export function displayLoginLogValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value === null || value === undefined) {
    return emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}
