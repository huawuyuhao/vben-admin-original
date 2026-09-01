<script lang="ts" setup>
import { computed, onMounted } from 'vue';

import { $t } from '@vben/locales';

import { useAppTypeOptions } from '../composables/use-app-type-options';
import {
  APP_COLLECT_NO,
  APP_COLLECT_YES,
  APP_STATUS_OFF,
  APP_STATUS_ON,
  type AppCollectFilter,
  type AppStatusFilter,
  type AppTypeFilter,
  resolveAppTypeOptionValue,
} from '../data';

defineOptions({ name: 'MyDemandAppsFilterBar' });

/** 应用名称筛选 */
const appName = defineModel<string>('appName', { default: '' });
/** 应用类型筛选 */
const appType = defineModel<AppTypeFilter>('appType', { default: '' });
/** 应用状态筛选 */
const appStatus = defineModel<AppStatusFilter>('appStatus', { default: '' });
/** 收藏筛选 */
const isCollect = defineModel<AppCollectFilter>('isCollect', { default: '' });

const emit = defineEmits<{
  /** 重置筛选 */
  reset: [];
  /** 点击查询 */
  search: [];
}>();

const { typeOptions, typeLoading, fetchTypeOptions, handleTypeRemoteSearch } =
  useAppTypeOptions();

/**
 * 筛选可用类型选项（typeId / typeCode 任一可转数字即可）
 */
const selectableTypeOptions = computed(() =>
  typeOptions.value
    .map((item) => {
      const value = resolveAppTypeOptionValue(item);
      return {
        key: String(item.typeId ?? item.typeCode ?? value ?? ''),
        label: item.typeName || item.typeCode || String(item.typeId ?? ''),
        value,
      };
    })
    .filter(
      (item): item is { key: string; label: string; value: number } =>
        item.value != null && item.key !== '',
    ),
);

onMounted(() => {
  void fetchTypeOptions();
});
</script>

<template>
  <el-card class="apps-filter" shadow="never">
    <el-form class="apps-filter__form" @submit.prevent>
      <el-form-item
        class="apps-filter__field"
        :label="$t('page.service.mydemand.apps.filter.appName')"
      >
        <el-input
          v-model="appName"
          class="apps-filter__input"
          clearable
          :placeholder="
            $t('page.service.mydemand.apps.filter.appNamePlaceholder')
          "
          @keyup.enter="emit('search')"
        />
      </el-form-item>

      <el-form-item
        class="apps-filter__field"
        :label="$t('page.service.mydemand.apps.filter.appType')"
      >
        <el-select
          v-model="appType"
          clearable
          class="apps-filter__select"
          filterable
          remote
          :loading="typeLoading"
          :placeholder="$t('page.service.mydemand.apps.filter.appTypeAll')"
          :remote-method="handleTypeRemoteSearch"
          @visible-change="
            (open: boolean) => {
              if (open && typeOptions.length === 0) {
                void fetchTypeOptions();
              }
            }
          "
        >
          <el-option
            v-for="item in selectableTypeOptions"
            :key="item.key"
            :label="item.label"
            :value="String(item.value)"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        class="apps-filter__field"
        :label="$t('page.service.mydemand.apps.filter.appStatus')"
      >
        <el-select
          v-model="appStatus"
          clearable
          class="apps-filter__select"
          :placeholder="$t('page.service.mydemand.apps.filter.appStatusAll')"
        >
          <el-option
            :label="$t('page.service.mydemand.apps.status.on')"
            :value="String(APP_STATUS_ON)"
          />
          <el-option
            :label="$t('page.service.mydemand.apps.status.off')"
            :value="String(APP_STATUS_OFF)"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        class="apps-filter__field"
        :label="$t('page.service.mydemand.apps.filter.isCollect')"
      >
        <el-select
          v-model="isCollect"
          clearable
          class="apps-filter__select"
          :placeholder="$t('page.service.mydemand.apps.filter.isCollectAll')"
        >
          <el-option
            :label="$t('page.service.mydemand.apps.collect.yes')"
            :value="String(APP_COLLECT_YES)"
          />
          <el-option
            :label="$t('page.service.mydemand.apps.collect.no')"
            :value="String(APP_COLLECT_NO)"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="apps-filter__actions">
        <el-button
          class="mine-shell__action-btn"
          type="primary"
          @click="emit('search')"
        >
          {{ $t('page.service.mydemand.apps.search') }}
        </el-button>
        <el-button class="mine-shell__action-btn" @click="emit('reset')">
          {{ $t('page.service.mydemand.apps.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.apps-filter {
  margin-bottom: 18px;

  &__form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;
    align-items: center;
  }

  &__field {
    margin-right: 0;
    margin-bottom: 0;

    :deep(.el-form-item__label) {
      display: inline-flex;
      align-items: center;
      height: 32px;
      padding-right: 8px;
      line-height: 32px;
    }

    :deep(.el-form-item__content) {
      display: inline-flex;
      align-items: center;
    }
  }

  &__input {
    width: 180px;
  }

  &__select {
    width: 140px;
  }

  &__actions {
    margin-right: 0;
    margin-bottom: 0;
    margin-left: auto;

    :deep(.el-form-item__content) {
      display: inline-flex;
      gap: 10px;
      align-items: center;
    }
  }
}

@media (max-width: 768px) {
  .apps-filter {
    &__input,
    &__select {
      width: 100%;
    }

    &__field {
      width: 100%;
    }

    &__actions {
      width: 100%;
      margin-left: 0;

      :deep(.el-form-item__content) {
        display: flex;
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style>
