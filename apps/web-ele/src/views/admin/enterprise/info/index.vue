<script lang="ts" setup>
import type { EnterpriseInfo } from '#/types/admin/enterprise/info';

import type { EnterpriseEditForm } from './data';

import { computed, onMounted, reactive, ref } from 'vue';

import { Edit, Refresh } from '@element-plus/icons-vue';
import { $t, useI18n } from '@vben/locales';
import { isEmpty } from '@vben/utils';
import { ElMessage } from 'element-plus';

import {
  getEnterpriseInfoApi,
  updateEnterpriseInfoApi,
} from '#/api/admin/enterprise/info';

import {
  buildEnterpriseFieldGroups,
  createEditForm,
  formatAuthStatusLabel,
  formatAuthStatusTip,
  formatDisplayValue,
  formatEnterpriseTypeLabel,
  formatStatusLabel,
  resolveAuthTagType,
} from './data';
import EditForm from './modules/edit-form.vue';

/**
 * 管理 · 企业信息管理
 * 对接 GET/PUT /enterprise/info（修改仅支持联系电话、企业地址）
 */
defineOptions({ name: 'AdminEnterpriseInfo' });

const { locale } = useI18n();

/** 企业信息 */
const info = ref<null | EnterpriseInfo>(null);
/** 首次加载中 */
const pageLoading = ref(true);
/** 刷新中 */
const refreshing = ref(false);
/** 是否处于编辑模式 */
const editing = ref(false);
/** 编辑表单 */
const editForm = reactive<EnterpriseEditForm>(createEditForm(null));
/** 保存中 */
const saving = ref(false);

/** 是否已有企业信息 */
const hasInfo = computed(() => {
  if (!info.value) {
    return false;
  }
  return (
    !isEmpty(info.value.enterpriseId) ||
    !isEmpty(info.value.enterpriseName) ||
    !isEmpty(info.value.creditCode)
  );
});

/** 分组展示（依赖 locale 以切换语言） */
const groups = computed(() => {
  void locale.value;
  return buildEnterpriseFieldGroups(info.value);
});

/** 编辑时只读分组（基础信息 / 元数据） */
const readonlyGroups = computed(() =>
  groups.value.filter((g) => g.key !== 'contact'),
);

/** 顶部企业名称 */
const displayName = computed(() => {
  const name = String(info.value?.enterpriseName ?? '').trim();
  return isEmpty(name)
    ? $t('page.admin.enterprise.info.unnamed')
    : name;
});

/**
 * 拉取企业信息
 */
async function loadInfo() {
  const data = await getEnterpriseInfoApi();
  info.value = data ?? null;
}

/**
 * 刷新企业信息
 */
async function handleRefresh() {
  refreshing.value = true;
  try {
    await loadInfo();
    if (editing.value) {
      Object.assign(editForm, createEditForm(info.value));
    }
  } catch {
    // 错误提示由请求拦截器处理
  } finally {
    refreshing.value = false;
  }
}

/**
 * 进入编辑模式并回填可改字段
 */
function startEdit() {
  Object.assign(editForm, createEditForm(info.value));
  editing.value = true;
}

/**
 * 取消编辑，恢复展示态
 */
function cancelEdit() {
  editing.value = false;
  Object.assign(editForm, createEditForm(info.value));
}

/**
 * 提交修改企业信息
 * @param form 校验后的表单
 */
async function saveEdit(form: EnterpriseEditForm) {
  saving.value = true;
  try {
    await updateEnterpriseInfoApi({
      contactPhone: form.contactPhone,
      address: form.address,
    });
    await loadInfo();
    Object.assign(editForm, form);
    editing.value = false;
    ElMessage.success($t('page.admin.enterprise.info.updateSuccess'));
  } catch {
    // 错误提示由请求拦截器处理
  } finally {
    saving.value = false;
  }
}

/**
 * 进入页面时拉取企业信息
 */
async function initPage() {
  try {
    await loadInfo();
  } catch {
    info.value = null;
  } finally {
    pageLoading.value = false;
  }
}

onMounted(initPage);
</script>

<template>
  <div class="mine-page">
    <div class="mine-shell">
      <div class="mine-shell__bg" aria-hidden="true">
        <span class="mine-shell__orb mine-shell__orb--a"></span>
        <span class="mine-shell__orb mine-shell__orb--b"></span>
        <span class="mine-shell__mesh"></span>
      </div>

      <div v-loading="pageLoading" class="mine-shell__inner">
        <header class="mine-shell__head">
          <div>
            <p class="mine-shell__eyebrow">
              {{ $t('page.admin.enterprise.info.eyebrow') }}
            </p>
            <h2>{{ $t('page.admin.enterprise.info.title') }}</h2>
            <p class="mine-shell__desc">
              {{
                editing
                  ? $t('page.admin.enterprise.info.descEdit')
                  : $t('page.admin.enterprise.info.descView')
              }}
            </p>
          </div>
          <div
            v-if="hasInfo && !editing"
            class="mine-shell__head-actions"
          >
            <el-button
              class="mine-shell__action-btn"
              :icon="Refresh"
              :loading="refreshing"
              @click="handleRefresh"
            >
              {{ $t('page.admin.enterprise.info.refresh') }}
            </el-button>
            <el-button
              class="mine-shell__action-btn"
              type="primary"
              :icon="Edit"
              @click="startEdit"
            >
              {{ $t('page.admin.enterprise.info.editProfile') }}
            </el-button>
          </div>
        </header>

        <section
          v-if="!pageLoading && !hasInfo"
          class="enterprise-info__empty"
        >
          <el-empty :description="$t('page.admin.enterprise.info.empty')" />
        </section>

        <template v-else-if="hasInfo">
          <section class="enterprise-info__hero">
            <div class="enterprise-info__hero-main">
              <div class="enterprise-info__hero-top">
                <h3>{{ displayName }}</h3>
                <el-tag
                  effect="light"
                  round
                  :type="resolveAuthTagType(info?.authStatus)"
                >
                  {{ formatAuthStatusLabel(info?.authStatus) }}
                </el-tag>
              </div>
              <p class="enterprise-info__hero-meta">
                <span>
                  {{ $t('page.admin.enterprise.info.fields.creditCode') }}：
                  {{ formatDisplayValue(info?.creditCode) }}
                </span>
                <i></i>
                <span>
                  {{ formatEnterpriseTypeLabel(info?.enterpriseType) }}
                </span>
                <i></i>
                <span>{{ formatStatusLabel(info?.status) }}</span>
              </p>
              <p class="enterprise-info__auth-tip">
                {{ formatAuthStatusTip(info?.authStatus) }}
              </p>
            </div>

            <div class="enterprise-info__hero-side">
              <div class="enterprise-info__stat">
                <em>{{ $t('page.admin.enterprise.info.fields.contactPhone') }}</em>
                <strong>{{ formatDisplayValue(info?.contactPhone) }}</strong>
              </div>
              <div class="enterprise-info__stat">
                <em>{{ $t('page.admin.enterprise.info.fields.updateTime') }}</em>
                <strong>{{ formatDisplayValue(info?.updateTime) }}</strong>
              </div>
            </div>
          </section>

          <EditForm
            v-if="editing"
            v-model="editForm"
            :saving="saving"
            @cancel="cancelEdit"
            @save="saveEdit"
          />

          <div v-else class="enterprise-info__sections">
            <section
              v-for="group in groups"
              :key="group.key"
              class="enterprise-info__card"
            >
              <header class="enterprise-info__card-head">
                <div>
                  <h4>{{ group.title }}</h4>
                  <p>{{ group.hint }}</p>
                </div>
                <el-button
                  v-if="group.key === 'contact'"
                  link
                  type="primary"
                  @click="startEdit"
                >
                  {{ $t('page.admin.enterprise.info.goEdit') }}
                </el-button>
              </header>
              <dl class="enterprise-info__grid">
                <div
                  v-for="item in group.fields"
                  :key="`${group.key}-${item.label}`"
                  class="enterprise-info__item"
                >
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div
            v-if="editing"
            class="enterprise-info__sections enterprise-info__sections--readonly"
          >
            <section
              v-for="group in readonlyGroups"
              :key="group.key"
              class="enterprise-info__card"
            >
              <header class="enterprise-info__card-head">
                <div>
                  <h4>{{ group.title }}</h4>
                  <p>
                    {{ group.hint
                    }}{{ $t('page.admin.enterprise.info.readonlySuffix') }}
                  </p>
                </div>
              </header>
              <dl class="enterprise-info__grid">
                <div
                  v-for="item in group.fields"
                  :key="`${group.key}-${item.label}`"
                  class="enterprise-info__item"
                >
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </div>
              </dl>
            </section>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../scss/page-shell.scss';

.enterprise-info {
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
    padding: 40px 24px;
    background: hsl(var(--card) / 0.72);
    border: 1px dashed hsl(var(--primary) / 0.35);
    border-radius: 20px;
    backdrop-filter: blur(8px);
  }

  &__hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px;
    align-items: center;
    margin-bottom: 18px;
    padding: 24px 28px;
    background: hsl(var(--card) / 0.92);
    border: 1px solid hsl(var(--border));
    border-radius: 22px;
    box-shadow: 0 10px 30px hsl(var(--foreground) / 0.08);
    backdrop-filter: blur(10px);
  }

  &__hero-main {
    min-width: 0;
  }

  &__hero-top {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;

    h3 {
      margin: 0;
      font-size: 22px;
      font-weight: 750;
      color: hsl(var(--foreground));
    }
  }

  &__hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    align-items: center;
    margin: 0 0 10px;
    font-size: 13px;
    color: hsl(var(--muted-foreground));

    i {
      width: 4px;
      height: 4px;
      background: hsl(var(--border));
      border-radius: 50%;
    }
  }

  &__auth-tip {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }

  &__hero-side {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 180px;
  }

  &__stat {
    padding: 12px 14px;
    background: hsl(var(--background) / 0.72);
    border: 1px solid hsl(var(--border));
    border-radius: 14px;

    em {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      font-style: normal;
      color: hsl(var(--muted-foreground));
    }

    strong {
      font-size: 13px;
      font-weight: 650;
      color: hsl(var(--foreground));
      word-break: break-all;
    }
  }

  &__sections {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    > :last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }

    &--readonly {
      margin-top: 16px;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      > * {
        grid-column: auto;
        min-width: 0;
      }
    }
  }

  &__card {
    width: 100%;
    padding: 20px 22px 10px;
    background: hsl(var(--card) / 0.92);
    border: 1px solid hsl(var(--border));
    border-radius: 20px;
    box-shadow: 0 8px 24px hsl(var(--foreground) / 0.05);
    backdrop-filter: blur(8px);
  }

  &__card-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid hsl(var(--border));

    h4 {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 700;
      color: hsl(var(--foreground));
    }

    p {
      margin: 0;
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 64px;
    padding: 12px 10px;
    border-bottom: 1px solid hsl(var(--border));

    dt {
      margin: 0;
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }

    dd {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
      color: hsl(var(--foreground));
      word-break: break-all;
    }
  }
}

@media (max-width: 1200px) {
  .enterprise-info {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 960px) {
  .enterprise-info {
    &__hero {
      grid-template-columns: 1fr;
    }

    &__hero-side {
      flex-direction: row;
      min-width: 0;
    }

    &__stat {
      flex: 1;
    }

    &__sections {
      grid-template-columns: 1fr;

      &--readonly {
        grid-template-columns: 1fr;
      }
    }
  }
}

@media (max-width: 640px) {
  .enterprise-info {
    &__hero {
      padding: 18px;
      border-radius: 18px;
    }

    &__hero-side {
      flex-direction: column;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__card {
      border-radius: 16px;
    }
  }
}
</style>
