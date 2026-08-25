<script lang="ts" setup>
import type { ProfileEditForm } from './data';

import { computed, reactive, ref } from 'vue';

import { isEmpty } from '@vben/utils';

import { ElMessage } from 'element-plus';

import { useLoginStore } from '#/store/login';

import {
  buildProfileFieldGroups,
  createEditForm,
  resolveAvatarLetter,
  resolveAvatarUrl,
} from './data';
import EditForm from './modules/edit-form.vue';
import ResetPasswordDialog from './modules/reset-password-dialog.vue';

/**
 * 我的 · 个人信息页（展示登录缓存；支持页内编辑并调修改接口）
 */
defineOptions({ name: 'MineProfileInfo' });

const loginStore = useLoginStore();

/** 登录后写入 sessionStorage 的个人信息 */
const profile = computed(() => loginStore.userProfile);

/** 是否已有缓存资料 */
const hasProfile = computed(() => !isEmpty(profile.value?.user));

/** 分组资料（只读展示） */
const groups = computed(() => buildProfileFieldGroups(profile.value));

/** 只读分组：组织归属 / 登录轨迹 */
const readonlyGroups = computed(() =>
  groups.value.filter((g) => g.title !== '基础资料'),
);

/** 头像 URL（仅 http(s) 可展示） */
const avatarUrl = computed(() => resolveAvatarUrl(profile.value?.user?.avatar));

/** 头像占位字母 */
const avatarLetter = computed(() => resolveAvatarLetter(profile.value));

/** 顶部主标题（昵称优先） */
const displayName = computed(() => {
  const user = profile.value?.user;
  const name = String(user?.nickName || user?.userName || '').trim();
  return isEmpty(name) ? '未命名用户' : name;
});

/** 角色 / 部门标签 */
const heroTags = computed(() => {
  const tags: string[] = [];
  const role = String(profile.value?.roleGroup ?? '').trim();
  const dept = String(profile.value?.user?.deptName ?? '').trim();
  const post = String(profile.value?.postGroup ?? '').trim();
  if (dept) tags.push(dept);
  const roleTag = role.split(/[,，]/)[0]?.trim();
  if (roleTag) tags.push(roleTag);
  const postTag = post.split(/[,，]/)[0]?.trim();
  if (postTag) tags.push(postTag);
  return tags.slice(0, 3);
});

/** 是否处于编辑模式 */
const editing = ref(false);
/** 编辑表单 */
const editForm = reactive<ProfileEditForm>(createEditForm(null));
/** 保存中 */
const saving = ref(false);
/** 重置密码弹窗是否打开 */
const resetPwdVisible = ref(false);

/**
 * 打开重置密码弹窗
 */
function openResetPassword() {
  resetPwdVisible.value = true;
}

/**
 * 进入编辑模式并回填可改字段
 */
function startEdit() {
  Object.assign(editForm, createEditForm(profile.value));
  editing.value = true;
}

/**
 * 取消编辑，恢复展示态
 */
function cancelEdit() {
  editing.value = false;
  Object.assign(editForm, createEditForm(profile.value));
}

/**
 * 提交修改个人信息
 * @param form 校验后的表单
 */
async function saveEdit(form: ProfileEditForm) {
  saving.value = true;
  try {
    await loginStore.updateProfile({
      email: form.email,
      nickName: form.nickName,
      phonenumber: form.phonenumber,
      sex: form.sex,
    });
    Object.assign(editForm, form);
    editing.value = false;
    ElMessage.success('个人信息修改成功');
  } catch {
    // 错误提示由请求拦截器处理
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mine-profile-page">
    <div class="mine-profile">
      <div class="mine-profile__bg" aria-hidden="true">
        <span class="mine-profile__orb mine-profile__orb--a"></span>
        <span class="mine-profile__orb mine-profile__orb--b"></span>
        <span class="mine-profile__mesh"></span>
      </div>

      <div class="mine-profile__inner">
        <header class="mine-profile__head">
          <div>
            <p class="mine-profile__eyebrow">我的信息中心</p>
            <h2>个人信息</h2>
            <p class="mine-profile__desc">
              {{
                editing
                  ? '正在修改资料，保存后将同步到服务端与本地缓存'
                  : '基于登录缓存展示；点击修改可编辑昵称、手机、邮箱与性别'
              }}
            </p>
          </div>
          <div v-if="hasProfile && !editing" class="mine-profile__head-actions">
            <el-button class="mine-profile__action-btn" @click="openResetPassword">
              重置密码
            </el-button>
            <el-button
              class="mine-profile__action-btn mine-profile__action-btn--primary"
              type="primary"
              @click="startEdit"
            >
              修改资料
            </el-button>
          </div>
        </header>
        <section v-if="!hasProfile" class="mine-profile__empty">
          <div class="mine-profile__empty-icon">空</div>
          <p>暂无个人信息缓存，请重新登录后再查看。</p>
        </section>

        <template v-else>
          <section class="mine-profile__hero">
            <div
              class="mine-profile__avatar"
              :style="
                avatarUrl
                  ? { backgroundImage: `url(${avatarUrl})` }
                  : undefined
              "
            >
              <span v-if="!avatarUrl">{{ avatarLetter }}</span>
            </div>

            <div class="mine-profile__hero-main">
              <div class="mine-profile__hero-top">
                <h3>{{ displayName }}</h3>
                <button
                  v-if="!editing"
                  class="mine-profile__icon-edit"
                  type="button"
                  title="修改资料"
                  @click="startEdit"
                >
                  修改
                </button>
              </div>
              <p class="mine-profile__hero-meta">
                <span>账号 {{ profile?.user?.userName || '—' }}</span>
                <i></i>
                <span>手机 {{ profile?.user?.phonenumber || '—' }}</span>
              </p>
              <div v-if="heroTags.length" class="mine-profile__tags">
                <span v-for="tag in heroTags" :key="tag">{{ tag }}</span>
              </div>
            </div>

            <div class="mine-profile__hero-side">
              <div class="mine-profile__stat">
                <em>最近登录</em>
                <strong>{{ profile?.user?.loginDate || '—' }}</strong>
              </div>
              <div class="mine-profile__stat">
                <em>登录 IP</em>
                <strong>{{ profile?.user?.loginIp || '—' }}</strong>
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

          <div v-else class="mine-profile__sections">
            <section
              v-for="group in groups"
              :key="group.title"
              class="mine-profile__card"
            >
              <header class="mine-profile__card-head">
                <div>
                  <h4>{{ group.title }}</h4>
                  <p>{{ group.hint }}</p>
                </div>
                <button
                  v-if="group.title === '基础资料'"
                  class="mine-profile__link-edit"
                  type="button"
                  @click="startEdit"
                >
                  去修改
                </button>
              </header>
              <dl class="mine-profile__grid">
                <div
                  v-for="item in group.fields"
                  :key="`${group.title}-${item.label}`"
                  class="mine-profile__item"
                >
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div v-if="editing" class="mine-profile__sections mine-profile__sections--readonly">
            <section
              v-for="group in readonlyGroups"
              :key="group.title"
              class="mine-profile__card"
            >
              <header class="mine-profile__card-head">
                <div>
                  <h4>{{ group.title }}</h4>
                  <p>{{ group.hint }}（只读）</p>
                </div>
              </header>
              <dl class="mine-profile__grid">
                <div
                  v-for="item in group.fields"
                  :key="`${group.title}-${item.label}`"
                  class="mine-profile__item"
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

    <ResetPasswordDialog v-model="resetPwdVisible" />
  </div>
</template>

<style lang="scss" scoped>
.mine-profile-page {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: calc(100vh - 120px);
  /* 外边距交给布局统一控制，页面内不再叠加 */
  padding: 0;
}

.mine-profile {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  min-height: calc(100vh - 140px);
  margin: 0;
  padding: 20px;
  overflow: hidden;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 20px;
  box-shadow: 0 12px 40px hsl(var(--foreground) / 0.06);

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    background:
      radial-gradient(
        1200px 480px at 8% -10%,
        hsl(var(--primary) / 0.14),
        transparent 55%
      ),
      radial-gradient(
        900px 420px at 100% 0%,
        hsl(190 70% 45% / 0.1),
        transparent 50%
      ),
      linear-gradient(
        180deg,
        hsl(var(--background)) 0%,
        hsl(var(--card)) 45%,
        hsl(var(--background)) 100%
      );
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(8px);
    opacity: 0.55;

    &--a {
      top: 72px;
      right: 12%;
      width: 180px;
      height: 180px;
      background: hsl(var(--primary) / 0.18);
    }

    &--b {
      bottom: 8%;
      left: 6%;
      width: 220px;
      height: 220px;
      background: hsl(210 80% 55% / 0.12);
    }
  }

  &__mesh {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image:
      linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: linear-gradient(180deg, #000 0%, transparent 88%);
  }

  &__inner {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: none;
    margin: 0;
  }

  &__head {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 22px;

    h2 {
      margin: 0 0 6px;
      font-size: 24px;
      font-weight: 750;
      letter-spacing: 0.02em;
      color: hsl(var(--foreground));
    }
  }

  &__eyebrow {
    margin: 0 0 4px;
    font-size: 12px;
    font-weight: 600;
    color: hsl(var(--primary));
    letter-spacing: 0.08em;
  }

  &__desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }

  &__head-actions {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
  }

  &__action-btn {
    box-sizing: border-box !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 108px !important;
    min-width: 108px !important;
    max-width: 108px !important;
    height: 36px !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    line-height: 1 !important;
    border-width: 1px !important;
    border-style: solid !important;
    border-radius: 10px !important;
    box-shadow: none !important;

    /* 覆盖 Element Plus 默认尺寸，保证两钮盒模型一致 */
    :deep(span) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      line-height: 1;
    }

    &--primary {
      border-color: hsl(var(--primary)) !important;
    }
  }

  &__edit-btn {
    box-sizing: border-box !important;
    width: 108px !important;
    height: 36px !important;
    padding: 0 !important;
    font-weight: 600;
    border-radius: 10px !important;
    box-shadow: none !important;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    justify-content: center;
    min-height: 240px;
    padding: 40px 24px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--card) / 0.72);
    border: 1px dashed hsl(var(--primary) / 0.35);
    border-radius: 20px;
    backdrop-filter: blur(8px);
  }

  &__empty-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    font-size: 14px;
    font-weight: 700;
    color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.12);
    border-radius: 16px;
  }

  &__hero {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
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

  &__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 84px;
    height: 84px;
    overflow: hidden;
    font-size: 30px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(145deg, hsl(var(--primary)), hsl(250 100% 76%) 55%, hsl(190 90% 66%));
    background-position: center;
    background-size: cover;
    border: 3px solid hsl(var(--card) / 0.9);
    border-radius: 50%;
    box-shadow: 0 10px 24px hsl(var(--primary) / 0.28);
  }

  &__hero-main {
    min-width: 0;
  }

  &__hero-top {
    display: flex;
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

  &__icon-edit {
    height: 28px;
    padding: 0 10px;
    font-size: 12px;
    font-weight: 600;
    color: hsl(var(--primary));
    cursor: pointer;
    background: hsl(var(--primary) / 0.12);
    border: 1px solid hsl(var(--primary) / 0.28);
    border-radius: 999px;
    transition: background 0.2s ease;

    &:hover {
      background: hsl(var(--primary) / 0.18);
    }
  }

  &__hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    align-items: center;
    margin: 0 0 12px;
    font-size: 13px;
    color: hsl(var(--muted-foreground));

    i {
      width: 4px;
      height: 4px;
      background: hsl(var(--border));
      border-radius: 50%;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    span {
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      color: hsl(var(--primary));
      background: hsl(var(--primary) / 0.12);
      border-radius: 999px;
    }
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

  &__link-edit {
    flex-shrink: 0;
    padding: 0;
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--primary));
    cursor: pointer;
    background: none;
    border: 0;

    &:hover {
      text-decoration: underline;
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

  &__form {
    padding-right: 4px;
  }

  &__drawer-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
}

@media (max-width: 1200px) {
  .mine-profile {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 960px) {
  .mine-profile-page {
    padding: 12px;
  }

  .mine-profile {
    min-height: auto;
    padding: 18px 16px;
    border-radius: 18px;

    &__hero {
      grid-template-columns: auto minmax(0, 1fr);
    }

    &__hero-side {
      grid-column: 1 / -1;
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
  .mine-profile-page {
    padding: 10px;
  }

  .mine-profile {
    padding: 14px 12px;
    border-radius: 16px;

    &__head {
      flex-direction: column;
      align-items: stretch;
    }

    &__head-actions {
      width: 100%;

      .mine-profile__action-btn {
        flex: 1;
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
      }
    }

    &__edit-btn {
      width: auto;
    }

    &__hero {
      grid-template-columns: 1fr;
      padding: 18px;
      border-radius: 18px;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__hero-side {
      flex-direction: column;
    }

    &__card {
      border-radius: 16px;
    }
  }
}
</style>
