<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

const router = useRouter();
const activeTab = ref(0);
const username = ref('');
const password = ref('');
const remember = ref(false);

function handleLogin() {
  ElMessage.success('登录成功（示例）');
  router.push('/workbench/overview');
}
</script>

<template>
  <div
    style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 56px);
      padding: 40px;
      background: linear-gradient(135deg, #fafbff 0%, #f0edff 40%, #e8f5e9 100%);
    "
  >
    <div style="width: 100%; max-width: 420px">
      <div style="margin-bottom: 32px; text-align: center">
        <img
          src="/logo.svg"
          alt="电碳算协同运营平台"
          style="
            display: block;
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            border-radius: 16px;
          "
        />
        <h2 style="margin: 0; font-size: 24px; font-weight: 800">
          电碳算协同运营平台
        </h2>
        <p style="margin-top: 4px; font-size: 13px; color: #909399">
          随电而算 向绿而行
        </p>
      </div>

      <ElCard shadow="never" style="padding: 8px 16px 24px">
        <ElTabs v-model="activeTab">
          <ElTabPane :name="0" label="账号登录" />
          <ElTabPane
            :name="1"
            label="注册"
            @click="router.push('/service/register')"
          />
        </ElTabs>

        <ElForm label-position="top" style="margin-top: 8px" @submit.prevent>
          <ElFormItem label="用户名 / 手机号">
            <ElInput
              v-model="username"
              placeholder="请输入用户名或手机号"
              size="large"
            />
          </ElFormItem>
          <ElFormItem label="密码">
            <ElInput
              v-model="password"
              placeholder="请输入密码"
              show-password
              size="large"
              type="password"
            />
          </ElFormItem>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 20px;
            "
          >
            <ElCheckbox v-model="remember">记住我</ElCheckbox>
            <ElButton link type="primary" @click.prevent>忘记密码？</ElButton>
          </div>
          <ElButton
            size="large"
            style="width: 100%"
            type="primary"
            @click="handleLogin"
          >
            登 录
          </ElButton>
          <div
            style="
              margin-top: 20px;
              font-size: 13px;
              color: #909399;
              text-align: center;
            "
          >
            还没有账号？
            <ElButton
              link
              type="primary"
              @click="router.push('/service/register')"
            >
              立即注册
            </ElButton>
          </div>
        </ElForm>
      </ElCard>
    </div>
  </div>
</template>
