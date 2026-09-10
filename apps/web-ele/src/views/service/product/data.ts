import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  ProductId,
  ProductInfo,
  ProductListParams,
  ProductListResult,
  ProductSortField,
} from '#/types/service/product';

import { $t } from '@vben/locales';
import { formatDate, isEmpty } from '@vben/utils';

/** 产品列表默认每页条数（卡片 2 行 × 3 列） */
export const PRODUCT_PAGE_SIZE = 6;

/** 可选每页条数（供分页器） */
export const PRODUCT_PAGE_SIZE_OPTIONS = [6, 12, 18];

/** 上架 / 审核通过 */
export const PRODUCT_STATUS_ENABLED = 1;

/**
 * 排序字段选项（对应 OpenAPI sortField enum）
 */
export interface ProductSortFieldOption {
  /** 字段值 */
  value: ProductSortField;
  /** i18n 键后缀，对应 page.service.product.sortField.* */
  labelKey: string;
}

/**
 * 排序方向选项（对应 OpenAPI sortOrder）
 */
export interface ProductSortOrderOption {
  /** 方向值 */
  value: 'asc' | 'desc';
  /** i18n 键后缀，对应 page.service.product.sortOrder.* */
  labelKey: string;
}

/** 排序字段下拉 */
export const PRODUCT_SORT_FIELD_OPTIONS: ProductSortFieldOption[] = [
  { value: 'price', labelKey: 'price' },
  { value: 'greenPowerRatio', labelKey: 'greenPowerRatio' },
];

/** 排序方向下拉 */
export const PRODUCT_SORT_ORDER_OPTIONS: ProductSortOrderOption[] = [
  { value: 'asc', labelKey: 'asc' },
  { value: 'desc', labelKey: 'desc' },
];

/** 列表查询表单值 */
export interface ProductGridFormValues {
  /** 关键词 */
  keyword?: string;
  /** 排序字段 */
  sortField?: ProductSortField | string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc' | string;
}

/**
 * 产品列表查询栏 schema
 */
export function useProductGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: $t('page.service.product.searchPlaceholder'),
      },
      fieldName: 'keyword',
      label: $t('page.service.product.filter.keyword'),
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: PRODUCT_SORT_FIELD_OPTIONS.map((opt) => ({
          label: $t(`page.service.product.sortField.${opt.labelKey}`),
          value: opt.value,
        })),
        placeholder: $t('page.service.product.sortFieldLabel'),
      },
      fieldName: 'sortField',
      label: $t('page.service.product.sortFieldLabel'),
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: PRODUCT_SORT_ORDER_OPTIONS.map((opt) => ({
          label: $t(`page.service.product.sortOrder.${opt.labelKey}`),
          value: opt.value,
        })),
        placeholder: $t('page.service.product.sortOrderLabel'),
      },
      fieldName: 'sortOrder',
      label: $t('page.service.product.sortOrderLabel'),
    },
  ];
}

/**
 * 产品列表列配置
 */
export function useProductColumns(): VxeTableGridOptions<ProductInfo>['columns'] {
  const emptyText = $t('page.service.product.valueEmpty');
  return [
    {
      align: 'center',
      cellRender: { name: 'CellImage' },
      field: 'imageUrl',
      minWidth: 80,
      title: $t('page.service.product.fields.cover'),
    },
    {
      field: 'productName',
      minWidth: 160,
      showOverflow: true,
      title: $t('page.service.product.fields.productName'),
      formatter: ({ cellValue }) => displayProductValue(cellValue, emptyText),
    },
    {
      field: 'tags',
      minWidth: 160,
      slots: { default: 'tags' },
      title: $t('page.service.product.fields.tags'),
    },
    {
      field: 'price',
      minWidth: 110,
      title: $t('page.service.product.fields.price'),
      formatter: ({ cellValue }) =>
        formatProductPrice(cellValue) ||
        $t('page.service.product.pricePending'),
    },
    {
      field: 'greenPowerRatio',
      minWidth: 110,
      title: $t('page.service.product.fields.greenPowerRatio'),
      formatter: ({ cellValue }) =>
        formatGreenPowerRatio(cellValue) || emptyText,
    },
    {
      field: 'recommendLevel',
      minWidth: 90,
      title: $t('page.service.product.fields.recommendLevel'),
      formatter: ({ cellValue }) => displayProductValue(cellValue, emptyText),
    },
    {
      field: 'description',
      minWidth: 200,
      showOverflow: true,
      title: $t('page.service.product.fields.description'),
      formatter: ({ cellValue }) => displayProductValue(cellValue, emptyText),
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      minWidth: 220,
      slots: { default: 'action' },
      title: $t('page.service.product.fields.actions'),
    },
  ];
}

/**
 * 组装列表查询的排序参数（字段、方向可独立传递）
 * @param sortField 排序字段
 * @param sortOrder 排序方向
 * @returns 可展开进请求参数的对象
 */
export function buildProductSortParams(
  sortField?: null | ProductSortField | string,
  sortOrder?: 'asc' | 'desc' | null | string,
): {
  sortField?: ProductSortField;
  sortOrder?: 'asc' | 'desc';
} {
  const field = sortField?.trim() as ProductSortField | undefined;
  const order = (sortOrder?.trim() || '') as '' | 'asc' | 'desc';
  const result: {
    sortField?: ProductSortField;
    sortOrder?: 'asc' | 'desc';
  } = {};
  if (field === 'price' || field === 'greenPowerRatio') {
    result.sortField = field;
  }
  if (order === 'asc' || order === 'desc') {
    result.sortOrder = order;
  }
  return result;
}

/**
 * 将查询表单值转为列表筛选参数（不含分页）
 * @param formValues 查询表单值
 * @returns 接口筛选参数
 */
export function buildProductFilterParams(
  formValues?: null | ProductGridFormValues,
): Pick<ProductListParams, 'keyword' | 'sortField' | 'sortOrder'> {
  const sort = buildProductSortParams(
    formValues?.sortField,
    formValues?.sortOrder,
  );
  return {
    keyword: String(formValues?.keyword ?? '').trim() || undefined,
    ...sort,
  };
}

/**
 * 过滤含名称的产品条目（列表接口已返回上架数据，此处做兜底）
 * @param list 接口原始列表
 * @returns 可展示列表
 */
export function normalizeProductList(
  list?: null | ProductInfo[],
): ProductInfo[] {
  if (!list?.length) {
    return [];
  }
  return list.filter((item) => !isEmpty(item.productName?.trim()));
}

/**
 * 归一化产品列表分页结果（供页面绑定）
 * @param data 接口分页结果
 * @returns records + total + current + size
 */
export function normalizeProductPage(data?: null | ProductListResult): {
  current: number;
  records: ProductInfo[];
  size: number;
  total: number;
} {
  return {
    records: normalizeProductList(data?.records),
    total: Math.max(0, Number(data?.total) || 0),
    current: Math.max(1, Number(data?.current) || 1),
    size: Math.max(1, Number(data?.size) || PRODUCT_PAGE_SIZE),
  };
}

/**
 * 拆分产品标签字符串（逗号分隔）
 * @param tags 原始标签
 * @returns 标签数组
 */
export function splitProductTags(tags?: string): string[] {
  if (isEmpty(tags?.trim())) {
    return [];
  }
  return tags!
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * 格式化产品价格展示
 * @param price 价格
 * @returns 如 ¥12,800；无效返回空串
 */
export function formatProductPrice(price?: number): string {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return '';
  }
  const num = Number(price);
  return `¥${num.toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
  })}`;
}

/**
 * 格式化绿电占比
 * @param ratio 占比数值
 * @returns 如 35.2%；无效返回空串
 */
export function formatGreenPowerRatio(ratio?: number): string {
  if (ratio === null || ratio === undefined || Number.isNaN(Number(ratio))) {
    return '';
  }
  return `${Number(ratio)}%`;
}

/**
 * 格式化产品发布时间
 * @param publishTime 发布时间
 * @returns 年月日时分；无效返回空串
 */
export function formatProductDateTime(publishTime?: string): string {
  if (isEmpty(publishTime?.trim())) {
    return '';
  }
  return formatDate(publishTime!.trim(), 'YYYY-MM-DD HH:mm');
}

/**
 * 是否有产品图
 * @param imageUrl 图片地址
 * @returns 有图返回 true
 */
export function hasProductImage(imageUrl?: string): boolean {
  return !isEmpty(imageUrl?.trim());
}

/**
 * 展示字段值；空值用占位符
 * @param value 原始值
 * @param emptyText 占位文案
 * @returns 展示字符串
 */
export function displayProductValue(
  value?: null | number | string,
  emptyText = '—',
): string {
  if (value == null) {
    return emptyText;
  }
  const text = String(value).trim();
  return text || emptyText;
}

/**
 * 归一化产品主键：保留字符串雪花 ID，避免 Number 精度丢失
 * @param value 原始主键
 * @returns 可用主键；无法识别时 undefined
 */
export function normalizeProductId(value: unknown): ProductId | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }
  if (typeof value === 'string') {
    const text = value.trim();
    if (!/^\d+$/.test(text) || text === '0') {
      return undefined;
    }
    // 安全整数范围内可保留 number；超长雪花 ID 必须保持字符串
    if (text.length <= 15) {
      const num = Number(text);
      if (Number.isSafeInteger(num) && num > 0) {
        return num;
      }
    }
    return text;
  }
  return undefined;
}

/**
 * 解析路由中的产品 ID（不做 Number 强转，防止雪花字符串精度丢失）
 * @param raw 路由 params.id
 * @returns 可用主键；非法时 undefined
 */
export function parseProductRouteId(raw: unknown): ProductId | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return normalizeProductId(value);
}
