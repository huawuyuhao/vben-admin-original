import type { FavoriteItem } from '#/types/mine/favorites/products';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import {
  createProductDemandIntentApi,
  toggleProductCollectApi,
} from '#/api/service/product';
import { ensureLoggedIn } from '#/store/common';

/**
 * 我的产品（收藏）页：取消收藏与「立即使用」共用逻辑
 * （收藏/取消、需求意向接口属产品域，故复用 #/api/service/product）
 * @returns 收藏切换、生成需求意向方法及 loading 状态
 */
export function useFavoriteActions() {
  const router = useRouter();
  /** 收藏请求中的产品 ID 集合 */
  const collectingIds = ref<Set<number>>(new Set());
  /** 生成需求意向中的产品 ID 集合 */
  const usingIds = ref<Set<number>>(new Set());

  /**
   * 是否正在收藏操作中
   * @param productId 产品 ID
   * @returns 进行中返回 true
   */
  function isCollecting(productId?: number): boolean {
    return !!productId && collectingIds.value.has(productId);
  }

  /**
   * 是否正在生成需求意向
   * @param productId 产品 ID
   * @returns 进行中返回 true
   */
  function isUsing(productId?: number): boolean {
    return !!productId && usingIds.value.has(productId);
  }

  /**
   * 收藏 / 取消收藏
   * @param productId 产品 ID
   * @param collected 当前是否已收藏
   * @returns 成功后的新收藏态；失败或未登录返回 null
   */
  async function toggleCollect(
    productId: number,
    collected: boolean,
  ): Promise<boolean | null> {
    if (!productId) {
      return null;
    }
    if (!ensureLoggedIn('/mine/favorites/products')) {
      return null;
    }

    const action = collected ? 'uncollect' : 'collect';
    collectingIds.value = new Set(collectingIds.value).add(productId);
    try {
      await toggleProductCollectApi(productId, action);
      const next = !collected;
      ElMessage.success(
        next
          ? $t('page.service.product.collect.success')
          : $t('page.service.product.collect.cancelSuccess'),
      );
      return next;
    } catch {
      return null;
    } finally {
      const nextSet = new Set(collectingIds.value);
      nextSet.delete(productId);
      collectingIds.value = nextSet;
    }
  }

  /**
   * 立即使用：生成需求意向并跳转下单配置页
   * @param product 产品信息（名称 / 简介作为意向默认值）
   */
  async function useNow(product: FavoriteItem) {
    if (!product?.productId) {
      return;
    }
    if (!ensureLoggedIn('/service/product/order')) {
      return;
    }

    const demandName = product.productName?.trim();
    if (!demandName) {
      ElMessage.warning($t('page.service.product.useNow.nameRequired'));
      return;
    }

    usingIds.value = new Set(usingIds.value).add(product.productId);
    try {
      const data = await createProductDemandIntentApi({
        productId: product.productId,
        demandName,
        demandDesc: product.description?.trim() || undefined,
      });
      const demandId = Number(data?.key);
      ElMessage.success($t('page.service.product.useNow.success'));
      await router.push({
        path: '/service/product/order',
        query: {
          productId: String(product.productId),
          demandName,
          ...(Number.isFinite(demandId) && demandId > 0
            ? { demandId: String(demandId) }
            : {}),
        },
      });
    } catch {
      // 错误提示由请求拦截器处理
    } finally {
      const nextSet = new Set(usingIds.value);
      nextSet.delete(product.productId);
      usingIds.value = nextSet;
    }
  }

  return {
    collectingIds,
    isCollecting,
    isUsing,
    toggleCollect,
    useNow,
    usingIds,
  };
}
