<script lang="ts" setup>
import { $t } from '@vben/locales';

/**
 * 门户服务 · 我的算力产品（占位页，后续对接接口后替换实现）
 */
defineOptions({ name: 'ServiceEnterpriseProducts' });
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div class="mine-shell__inner">
        <header class="mine-shell__head">
          <div>
            <p class="mine-shell__eyebrow">
              {{ $t('page.service.enterprise.products.eyebrow') }}
            </p>
            <h2>{{ $t('page.service.enterprise.products.title') }}</h2>
            <p class="mine-shell__desc">
              {{ $t('page.service.enterprise.products.desc') }}
            </p>
          </div>
        </header>

        <el-card class="enterprise-products-placeholder" shadow="never">
          <el-empty
            :description="$t('page.service.enterprise.products.pending')"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';

.enterprise-products-placeholder {
  :deep(.el-card__body) {
    padding: 48px 24px;
  }
}
</style>
