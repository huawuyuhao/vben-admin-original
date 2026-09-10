import type { FormValues } from '@vben/common-ui';
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { ComponentPropsMap, ComponentType } from './component';

import { h } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t, $te } from '@vben/locales';
import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '@vben/plugins/vxe-table';
import { get, isFunction, isString } from '@vben/utils';

import { objectOmit } from '@vueuse/core';
import { ElButton, ElImage, ElPopconfirm, ElTag } from 'element-plus';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        // 随容器宽度重算列宽，避免右侧留白
        autoResize: true,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          // 全局禁用 vxe-table 内置表单，统一走 formOptions
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: 'items',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        // 默认不省略：含图片/标签等多行单元需完整展示；文本列在 columns 上单独 showOverflow: true / 'ellipsis'
        showOverflow: false,
        size: 'small',
        // height:auto 下列表走外层滚动，关闭虚拟滚动避免表头/表体横向滚动失同步
        scrollY: {
          enabled: false,
        },
        // showOverflow: true 时依赖 mode=tooltip 才会加 col--ellipsis
        tooltipConfig: {
          enterable: true,
          mode: 'tooltip',
        },
      } as VxeTableGridOptions,
    });

    /**
     * 热更新时清理旧 Cell* 渲染器，避免重复注册报错
     */
    vxeUI.renderer.forEach((_item, key) => {
      if (key.startsWith('Cell')) {
        vxeUI.renderer.delete(key);
      }
    });

    // 表格配置项可用 cellRender: { name: 'CellImage' }
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const { column, row } = params;
        const src = row[column.field];
        return h(ElImage, {
          src,
          previewSrcList: src ? [src] : [],
          fit: 'cover',
          style: { width: '40px', height: '40px', borderRadius: '6px' },
          ...props,
        });
      },
    });

    // 表格配置项可用 cellRender: { name: 'CellLink' }
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          ElButton,
          { size: 'small', link: true, type: 'primary' },
          { default: () => props?.text },
        );
      },
    });

    // 单元格 Tag（Element Plus）
    vxeUI.renderer.add('CellTag', {
      renderTableDefault({ options, props }, { column, row }) {
        const value = get(row, column.field);
        const tagOptions = options ?? [
          { label: $t('common.enabled'), type: 'success', value: 1 },
          { label: $t('common.disabled'), type: 'info', value: 0 },
        ];
        const tagItem = tagOptions.find((item: Recordable<any>) => item.value === value);
        return h(
          ElTag,
          {
            effect: 'light',
            round: true,
            size: 'small',
            type: tagItem?.type ?? 'info',
            ...props,
            ...objectOmit(tagItem ?? {}, ['label', 'value']),
          },
          { default: () => tagItem?.label ?? value },
        );
      },
    });

    /**
     * 操作列按钮渲染器（Element Plus）
     * cellRender: { name: 'CellOperation', options: ['edit','delete'], attrs: { onClick } }
     */
    vxeUI.renderer.add('CellOperation', {
      renderTableDefault({ attrs, options, props }, { column, row }) {
        const defaultProps = { size: 'small', link: true, type: 'primary', ...props };
        let align: string;
        switch (column.align) {
          case 'center': {
            align = 'center';
            break;
          }
          case 'left': {
            align = 'flex-start';
            break;
          }
          default: {
            align = 'flex-end';
            break;
          }
        }

        const presets: Recordable<Recordable<any>> = {
          delete: {
            type: 'danger',
            text: $t('common.delete'),
          },
          edit: {
            text: $t('common.edit'),
          },
          detail: {
            text: $t('common.detail'),
          },
        };

        const operations: Array<Recordable<any>> = (
          options || ['edit', 'detail', 'delete']
        )
          .map((opt) => {
            if (isString(opt)) {
              return presets[opt]
                ? { code: opt, ...presets[opt], ...defaultProps }
                : {
                    code: opt,
                    text: $te(`common.${opt}`) ? $t(`common.${opt}`) : opt,
                    ...defaultProps,
                  };
            }
            return { ...defaultProps, ...presets[opt.code], ...opt };
          })
          .map((opt) => {
            const optBtn: Recordable<any> = {};
            Object.keys(opt).forEach((key) => {
              optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
            });
            return optBtn;
          })
          .filter((opt) => opt.show !== false);

        /**
         * 渲染操作按钮
         * @param opt 按钮配置
         * @param listen 是否绑定点击
         */
        function renderBtn(opt: Recordable<any>, listen = true) {
          return h(
            ElButton,
            {
              ...props,
              ...opt,
              icon: undefined,
              onClick: listen
                ? () =>
                    attrs?.onClick?.({
                      code: opt.code,
                      row,
                    })
                : undefined,
            },
            {
              default: () => {
                const content = [];
                if (opt.icon) {
                  content.push(
                    h(IconifyIcon, { class: 'size-4', icon: opt.icon }),
                  );
                }
                content.push(opt.text);
                return content;
              },
            },
          );
        }

        /**
         * 渲染带确认框的删除按钮
         * @param opt 按钮配置
         */
        function renderConfirm(opt: Recordable<any>) {
          return h(
            ElPopconfirm,
            {
              title: $t('ui.actionTitle.delete', [attrs?.nameTitle || '']),
              width: 260,
              teleported: true,
              ...props,
              ...opt,
              icon: undefined,
              onConfirm: () => {
                attrs?.onClick?.({
                  code: opt.code,
                  row,
                });
              },
            },
            {
              reference: () => renderBtn({ ...opt }, false),
              default: () =>
                h(
                  'div',
                  { class: 'truncate' },
                  $t('ui.actionMessage.deleteConfirm', [
                    row[attrs?.nameField || 'name'],
                  ]),
                ),
            },
          );
        }

        const btns = operations.map((opt) =>
          opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
        );
        return h(
          'div',
          {
            class: 'flex table-operations gap-1',
            style: { justifyContent: align },
          },
          btns,
        );
      },
    });
  },
  useVbenForm,
});

export const useVbenVxeGrid = <
  T extends Record<string, any>,
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
>(
  ...rest: Parameters<
    typeof useGrid<
      T,
      ComponentType,
      ComponentPropsMap,
      TFormValues,
      TSubmitValues
    >
  >
) =>
  useGrid<T, ComponentType, ComponentPropsMap, TFormValues, TSubmitValues>(
    ...rest,
  );

/**
 * 将业务分页结果转为 VxeGrid proxy 期望的 { items, total }
 * @param page 含 records / total 的分页对象
 */
export function toVxePageResult<T>(
  page?: null | { records?: T[]; total?: number },
): { items: T[]; total: number } {
  return {
    items: Array.isArray(page?.records) ? page!.records : [],
    total: Math.max(0, Number(page?.total) || 0),
  };
}

/**
 * 卡片列表页 VxeGrid 布局。
 *
 * vxe-grid 的 layouts 只支持 3 段：
 * - [0] header（Form）
 * - [1] body（Toolbar / Top / Table…）
 * - [2] footer（Pager）
 * 多写的第 4 段会被忽略，会导致分页器消失。
 *
 * Form 独占头行，避免与 Toolbar 并排挤窄查询栏；
 * Top 放卡片，Table 仅供 proxy（由 CSS 隐藏）。
 */
export const CARD_LIST_VXE_LAYOUTS = [
  ['Form'],
  ['Toolbar', 'Top', 'Table'],
  ['Pager'],
] as const;

/**
 * 卡片列表模式专用分页结果：不往表格塞 rows（卡片在 #top），
 * 仅用 total 驱动 Vben 分页器。
 * @param page 含 total 的分页对象（records 由页面自行绑定到卡片组件）
 */
export function toVxeCardPageResult(
  page?: null | { total?: number },
): { items: never[]; total: number } {
  return {
    items: [],
    total: Math.max(0, Number(page?.total) || 0),
  };
}

export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};

export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;

export type * from '@vben/plugins/vxe-table';
