<script lang="ts" setup>
import type { MyAppItem } from '#/types/service/mydemand/apps';

import { $t } from '@vben/locales';

import { Delete, Star, StarFilled } from '@element-plus/icons-vue';

import {
  displayAppValue,
  formatAppDateTime,
  getAppStatusI18nKey,
  getAppStatusTagType,
  isAppCollected,
  isAppEnabled,
} from '../data';

defineOptions({ name: 'MyDemandAppsGrid' });

defineProps<{
  /** 列表数据 */
  apps: MyAppItem[];
  /** 正在收藏操作的应用 ID */
  collectingId?: null | number;
  /** 加载中 */
  loading?: boolean;
  /** 正在启停的应用 ID */
  togglingId?: null | number;
}>();

const emit = defineEmits<{
  /** 收藏 / 取消收藏 */
  collect: [row: MyAppItem];
  /** 删除（Popconfirm 确认后） */
  delete: [row: MyAppItem];
  /** 编辑 */
  edit: [row: MyAppItem];
  /** 素材管理 */
  material: [row: MyAppItem];
  /** 定时任务 */
  schedule: [row: MyAppItem];
  /** 启停 */
  toggle: [row: MyAppItem];
  /** 版本维护 */
  version: [row: MyAppItem];
}>();

/**
 * 展示应用名称占位
 * @param row 列表行
 * @returns 名称或占位
 */
function appDisplayName(row: MyAppItem): string {
  return (
    row.appName?.trim() ||
    String(row.appId ?? '') ||
    $t('page.service.mydemand.apps.valueEmpty')
  );
}

/**
 * 取应用名称首字，用于封面占位
 * @param row 列表行
 * @returns 单个字符
 */
function appCoverLetter(row: MyAppItem): string {
  const name = appDisplayName(row).trim();
  return name ? name.slice(0, 1) : 'A';
}
</script>

<template>
  <div v-loading="loading" class="apps-grid">
    <el-empty
      v-if="!loading && apps.length === 0"
      :description="$t('page.service.mydemand.apps.empty')"
    />

    <div v-else class="apps-grid__list">
      <el-card
        v-for="row in apps"
        :key="row.appId"
        class="apps-grid__card"
        shadow="hover"
        :body-style="{ padding: '0' }"
      >
        <div class="apps-grid__cover">
          <span class="apps-grid__letter" aria-hidden="true">
            {{ appCoverLetter(row) }}
          </span>

          <el-button
            class="apps-grid__collect"
            circle
            size="small"
            :loading="collectingId === row.appId"
            :title="
              isAppCollected(row.isCollect)
                ? $t('page.service.mydemand.apps.actions.uncollect')
                : $t('page.service.mydemand.apps.actions.collect')
            "
            @click="emit('collect', row)"
          >
            <el-icon
              :class="{ 'is-collected': isAppCollected(row.isCollect) }"
            >
              <StarFilled v-if="isAppCollected(row.isCollect)" />
              <Star v-else />
            </el-icon>
          </el-button>

          <el-tag
            class="apps-grid__status"
            effect="dark"
            round
            size="small"
            :type="getAppStatusTagType(row.appStatus)"
          >
            {{
              $t(
                `page.service.mydemand.apps.status.${getAppStatusI18nKey(row.appStatus)}`,
              )
            }}
          </el-tag>
        </div>

        <div class="apps-grid__body">
          <h3 class="apps-grid__title" :title="appDisplayName(row)">
            {{ appDisplayName(row) }}
          </h3>

          <div class="apps-grid__tags">
            <el-tag effect="plain" round size="small" type="info">
              {{
                displayAppValue(
                  row.appTypeName,
                  $t('page.service.mydemand.apps.valueEmpty'),
                )
              }}
            </el-tag>
            <el-tag effect="plain" round size="small">
              {{
                displayAppValue(
                  row.appVersion,
                  $t('page.service.mydemand.apps.valueEmpty'),
                )
              }}
            </el-tag>
          </div>

          <dl class="apps-grid__meta">
            <div class="apps-grid__meta-row">
              <dt>{{ $t('page.service.mydemand.apps.fields.createTime') }}</dt>
              <dd>
                {{
                  formatAppDateTime(row.createTime) ||
                  $t('page.service.mydemand.apps.valueEmpty')
                }}
              </dd>
            </div>
            <div class="apps-grid__meta-row">
              <dt>{{ $t('page.service.mydemand.apps.fields.updateTime') }}</dt>
              <dd>
                {{
                  formatAppDateTime(row.updateTime) ||
                  $t('page.service.mydemand.apps.valueEmpty')
                }}
              </dd>
            </div>
          </dl>
        </div>

        <template #footer>
          <div class="apps-grid__foot">
            <div class="apps-grid__actions">
              <el-button size="small" @click="emit('edit', row)">
                {{ $t('page.service.mydemand.apps.actions.edit') }}
              </el-button>
              <el-button
                size="small"
                :loading="togglingId === row.appId"
                @click="emit('toggle', row)"
              >
                {{
                  isAppEnabled(row.appStatus)
                    ? $t('page.service.mydemand.apps.actions.disable')
                    : $t('page.service.mydemand.apps.actions.enable')
                }}
              </el-button>
              <el-button size="small" @click="emit('version', row)">
                {{ $t('page.service.mydemand.apps.actions.version') }}
              </el-button>
              <el-button size="small" @click="emit('schedule', row)">
                {{ $t('page.service.mydemand.apps.actions.schedule') }}
              </el-button>
              <el-button size="small" @click="emit('material', row)">
                {{ $t('page.service.mydemand.apps.actions.material') }}
              </el-button>
            </div>

            <el-popconfirm
              width="240"
              confirm-button-type="danger"
              :cancel-button-text="
                $t('page.service.mydemand.apps.delete.cancelBtn')
              "
              :confirm-button-text="
                $t('page.service.mydemand.apps.delete.confirmBtn')
              "
              :title="
                $t('page.service.mydemand.apps.delete.confirm', [
                  appDisplayName(row),
                ])
              "
              @confirm="emit('delete', row)"
            >
              <template #reference>
                <el-button
                  circle
                  plain
                  size="small"
                  type="danger"
                  :title="$t('page.service.mydemand.apps.actions.delete')"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.apps-grid {
  min-height: 200px;

  &__list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  &__card {
    height: 100%;
    overflow: hidden;
    border-radius: 12px;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    :deep(.el-card__footer) {
      padding: 12px 16px 16px;
      border-top: 1px solid var(--el-card-border-color);
    }
  }

  &__cover {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    overflow: hidden;
    background: linear-gradient(
      145deg,
      hsl(var(--primary) / 14%),
      hsl(190deg 90% 66% / 20%) 55%,
      hsl(var(--primary) / 10%)
    );
  }

  &__letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    font-size: 28px;
    font-weight: 750;
    color: rgb(255 255 255 / 96%);
    background: linear-gradient(
      145deg,
      hsl(var(--primary)),
      hsl(190deg 90% 66%)
    );
    border-radius: 18px;
    box-shadow: 0 10px 24px hsl(var(--foreground) / 12%);
  }

  &__collect {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 1;
    background: rgb(255 255 255 / 92%) !important;
    border: 0;

    .is-collected {
      color: #e6a23c;
    }
  }

  &__status {
    position: absolute;
    top: 12px;
    right: 12px;
    border: 0;
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
  }

  &__title {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: 750;
    line-height: 1.4;
    color: hsl(var(--foreground));
    white-space: nowrap;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__meta {
    display: grid;
    gap: 8px;
    margin: 0;
    margin-top: auto;
  }

  &__meta-row {
    display: flex;
    gap: 8px;
    align-items: baseline;
    justify-content: space-between;
    min-width: 0;
    font-size: 12px;

    dt {
      flex-shrink: 0;
      margin: 0;
      color: hsl(var(--muted-foreground));
    }

    dd {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 650;
      color: hsl(var(--foreground));
      text-align: right;
      white-space: nowrap;
    }
  }

  &__foot {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  &__actions {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }
}

@media (max-width: 1200px) {
  .apps-grid {
    &__list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 768px) {
  .apps-grid {
    &__list {
      grid-template-columns: 1fr;
    }
  }
}
</style>
