/**
 * 门户首页滚动入场动画配置（参考阿里云首页：视口进入后上浮渐显，仅播放一次）
 */

/** 默认位移距离（px） */
const REVEAL_Y = 48;

/** 默认动画时长（ms） */
const REVEAL_DURATION = 720;

/** 卡片错落间隔（ms） */
export const REVEAL_STAGGER_MS = 90;

/**
 * 是否偏好减少动态效果
 * @returns 系统开启「减少动态效果」时返回 true
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 缓动曲线：先快后稳，接近营销页常见手感 */
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 区块标题 / 整块内容的滚动入场配置
 * @param delay 延迟毫秒
 * @returns 供 v-motion 绑定的 initial / visibleOnce
 */
export function createSectionReveal(delay = 0) {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 1, y: 0 },
      visibleOnce: { opacity: 1, y: 0 },
    };
  }

  return {
    initial: {
      opacity: 0,
      y: REVEAL_Y,
    },
    visibleOnce: {
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: REVEAL_DURATION,
        ease: REVEAL_EASE,
      },
    },
  };
}

/**
 * 列表卡片错落入场配置
 * @param index 卡片下标（从 0 起）
 * @param staggerMs 相邻卡片间隔，默认 REVEAL_STAGGER_MS
 * @returns 供 v-motion 绑定的 initial / visibleOnce
 */
export function createCardReveal(index: number, staggerMs = REVEAL_STAGGER_MS) {
  return createSectionReveal(Math.max(0, index) * staggerMs);
}

/**
 * 首屏轮播首次进入动画（非滚动触发）
 * @returns 供 v-motion 绑定的 initial / enter
 */
export function createHeroEnter() {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 1, scale: 1 },
      enter: { opacity: 1, scale: 1 },
    };
  }

  return {
    initial: {
      opacity: 0,
      scale: 1.03,
    },
    enter: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 900,
        ease: REVEAL_EASE,
      },
    },
  };
}
