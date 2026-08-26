<script lang="ts" setup>
import type { AuthStatusMeta } from '../data';

import { $t } from '@vben/locales';

/**
 * 注册认证状态面板（步骤条 + 提示；企业 / 个人共用）
 */
defineOptions({ name: 'MineRegisterStatusPanel' });

withDefaults(
  defineProps<{
    /** 状态元数据 */
    meta: AuthStatusMeta;
    /** i18n 前缀，如 page.mine.register.enterprise */
    i18nPrefix?: string;
  }>(),
  {
    i18nPrefix: 'page.mine.register.enterprise',
  },
);

/** 步骤文案 key 列表 */
const STEP_KEYS = [
  'fillInfo',
  'uploadMaterials',
  'platformReview',
  'completed',
] as const;
</script>

<template>
  <section class="ent-status">
    <div class="ent-status__head">
      <h3>{{ $t(`${i18nPrefix}.statusTitle`) }}</h3>
      <span class="ent-status__tag" :class="`ent-status__tag--${meta.tagClass}`">
        {{ meta.label }}
      </span>
    </div>

    <div class="ent-status__steps">
      <template v-for="(key, index) in STEP_KEYS" :key="key">
        <div
          class="ent-status__step"
          :class="{
            'ent-status__step--done': meta.step > index,
            'ent-status__step--active': meta.step === index,
          }"
        >
          <div class="ent-status__node">
            {{ meta.step > index ? '✓' : index + 1 }}
          </div>
          <div class="ent-status__label">
            {{ $t(`${i18nPrefix}.steps.${key}`) }}
          </div>
        </div>
        <div
          v-if="index < STEP_KEYS.length - 1"
          class="ent-status__line"
          :class="{ 'ent-status__line--done': meta.step > index }"
        ></div>
      </template>
    </div>

    <p class="ent-status__tip">{{ meta.tip }}</p>
    <p class="ent-status__sub">{{ meta.sub }}</p>
  </section>
</template>

<style lang="scss" scoped>
.ent-status {
  margin-bottom: 18px;
  padding: 22px 24px;
  background: hsl(var(--card) / 0.92);
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: 0 8px 24px hsl(var(--foreground) / 0.05);
  backdrop-filter: blur(8px);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: hsl(var(--foreground));
    }
  }

  &__tag {
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 999px;

    &--warning {
      color: #b86e00;
      background: #fff4e0;
    }

    &--success {
      color: #0a7a3c;
      background: #e8f8ef;
    }

    &--danger {
      color: #c62828;
      background: #fdecea;
    }

    &--info {
      color: #5c6578;
      background: #f1f3f8;
    }
  }

  &__steps {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  &__step {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    width: 96px;
    text-align: center;

    &--done {
      .ent-status__node {
        color: #fff;
        background: #00c853;
      }

      .ent-status__label {
        color: hsl(var(--foreground));
      }
    }

    &--active {
      .ent-status__node {
        color: #fff;
        background: hsl(var(--primary));
        box-shadow: 0 0 0 4px hsl(var(--primary) / 0.16);
      }

      .ent-status__label {
        color: hsl(var(--foreground));
      }
    }
  }

  &__node {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 14px;
    font-weight: 700;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--muted) / 0.55);
    border-radius: 50%;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
  }

  &__line {
    flex: 1;
    height: 2px;
    margin-top: 15px;
    background: hsl(var(--border));

    &--done {
      background: #00c853;
    }
  }

  &__tip {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__sub {
    margin: 6px 0 0;
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }
}

@media (max-width: 768px) {
  .ent-status {
    &__steps {
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }

    &__line {
      display: none;
    }
  }
}
</style>
