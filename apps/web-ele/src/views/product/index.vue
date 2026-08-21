<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

interface ProductItem {
  icon: string;
  name: string;
  desc: string;
  region: string;
  type: string;
  green: string;
  price: string;
}

const keyword = ref('');
const regionFilter = ref('all');
const typeFilter = ref('all');
const currentPage = ref(1);
const pageSize = 6;
const toast = ref('');

const allProducts: ProductItem[] = [
  {
    icon: '🖥️',
    name: 'GPU 智算服务 - 贵州A区',
    desc: 'NVIDIA A100 × 8卡集群，支持大模型分布式训练，绿电占比 85%。',
    region: '贵州',
    type: 'GPU 智算',
    green: '绿电 85%',
    price: '¥2.8/小时',
  },
  {
    icon: '🖥️',
    name: 'GPU 智算服务 - 广州B区',
    desc: 'NVIDIA H100 × 4卡集群，高性能推理，低延迟响应，绿电占比 72%。',
    region: '广州',
    type: 'GPU 智算',
    green: '绿电 72%',
    price: '¥3.5/小时',
  },
  {
    icon: '☁️',
    name: '通用算力服务 - 贵州C区',
    desc: 'AMD EPYC 64核实例，适合通算类任务，大内存高带宽，绿电占比 90%。',
    region: '贵州',
    type: 'CPU 通算',
    green: '绿电 90%',
    price: '¥0.8/小时',
  },
  {
    icon: '☁️',
    name: '通用算力服务 - 惠州D区',
    desc: 'Intel Xeon 32核实例，企业级稳定性，适合后台批处理任务。',
    region: '惠州',
    type: 'CPU 通算',
    green: '绿电 68%',
    price: '¥0.6/小时',
  },
  {
    icon: '🔗',
    name: '边缘算力服务 - 华南节点',
    desc: '200+ 边缘节点覆盖，毫秒级延迟，适合实时推理与物联网场景。',
    region: '边缘节点',
    type: '边缘算力',
    green: '绿电 90%',
    price: '¥1.5/小时',
  },
  {
    icon: '💾',
    name: '分布式存储服务',
    desc: '高可用对象存储，支持冷热数据分层，多副本冗余，数据持久性 99.999%。',
    region: '贵州',
    type: '存储服务',
    green: 'SSD 存储',
    price: '¥0.12/GB·月',
  },
  {
    icon: '🖥️',
    name: 'GPU 智算服务 - 惠州E区',
    desc: 'NVIDIA L40S × 8卡推理集群，面向在线推理与批处理混合场景。',
    region: '惠州',
    type: 'GPU 智算',
    green: '绿电 70%',
    price: '¥2.2/小时',
  },
  {
    icon: '☁️',
    name: '通用算力服务 - 广州F区',
    desc: '高主频 CPU 实例，适合实时交易风控与低延迟业务系统。',
    region: '广州',
    type: 'CPU 通算',
    green: '绿电 75%',
    price: '¥1.1/小时',
  },
  {
    icon: '🔗',
    name: '边缘算力服务 - 西南节点',
    desc: '覆盖贵州及周边城市边缘节点，支持视频分析与本地推理。',
    region: '边缘节点',
    type: '边缘算力',
    green: '绿电 88%',
    price: '¥1.3/小时',
  },
  {
    icon: '💾',
    name: '高性能块存储服务',
    desc: '低延迟块存储，适配训练数据集读写与模型 checkpoint 落盘。',
    region: '广州',
    type: '存储服务',
    green: 'NVMe',
    price: '¥0.35/GB·月',
  },
  {
    icon: '🖥️',
    name: 'GPU 智算服务 - 贵州B区',
    desc: 'A800 × 16卡训练池，支持多租户队列与弹性扩缩。',
    region: '贵州',
    type: 'GPU 智算',
    green: '绿电 92%',
    price: '¥3.0/小时',
  },
  {
    icon: '☁️',
    name: '通用算力服务 - 惠州G区',
    desc: '内存优化型实例，适合大数据 ETL 与内存计算任务。',
    region: '惠州',
    type: 'CPU 通算',
    green: '绿电 66%',
    price: '¥0.9/小时',
  },
];

const filtered = computed(() => {
  let list = [...allProducts];
  const key = keyword.value.trim().toLowerCase();
  if (key) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(key) ||
        p.desc.includes(key) ||
        p.region.includes(key),
    );
  }
  if (regionFilter.value !== 'all') {
    list = list.filter((p) => p.region === regionFilter.value);
  }
  if (typeFilter.value !== 'all') {
    list = list.filter((p) => p.type === typeFilter.value);
  }
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);

const paged = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  const pages: number[] = [];
  const maxShow = Math.min(total, 4);
  let start = Math.max(1, Math.min(cur - 1, total - maxShow + 1));
  for (let i = 0; i < maxShow; i++) pages.push(start + i);
  return pages;
});

watch([keyword, regionFilter, typeFilter], () => {
  currentPage.value = 1;
});

function showToast(msg: string) {
  toast.value = msg;
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = '';
  }, 2000);
}
</script>

<template>
  <div class="portal-inner-page">
    <div class="portal-page-title">
      <h2>产品服务</h2>
      <p>
        展示已发布算力产品的名称、简介及图片，支持进入详情页。便于用户批量查阅算力产品，快速筛选适配算力需求的资源。
      </p>
    </div>

    <div class="portal-filter-bar">
      <div class="portal-search-box">
        <span class="search-icon">🔍</span>
        <input v-model="keyword" type="text" placeholder="搜索产品名称..." />
      </div>
      <select v-model="regionFilter">
        <option value="all">全部区域</option>
        <option value="贵州">贵州</option>
        <option value="广州">广州</option>
        <option value="惠州">惠州</option>
        <option value="边缘节点">边缘节点</option>
      </select>
      <select v-model="typeFilter">
        <option value="all">全部类型</option>
        <option value="GPU 智算">GPU 智算</option>
        <option value="CPU 通算">CPU 通算</option>
        <option value="边缘算力">边缘算力</option>
        <option value="存储服务">存储服务</option>
      </select>
      <button class="portal-btn portal-btn-primary portal-btn-sm" type="button">
        🔍 查询
      </button>
    </div>

    <div v-if="filtered.length === 0" class="portal-empty">暂无匹配产品</div>

    <div v-else class="portal-product-grid">
      <div
        v-for="item in paged"
        :key="item.name"
        class="portal-product-card"
        @click="showToast(`查看产品：${item.name}`)"
      >
        <div class="portal-product-img">{{ item.icon }}</div>
        <div class="portal-product-body">
          <h4>{{ item.name }}</h4>
          <p>{{ item.desc }}</p>
          <div class="portal-product-tags">
            <span class="portal-product-tag">{{ item.green }}</span>
            <span class="portal-product-tag price">{{ item.price }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filtered.length > 0" class="portal-pagination">
      <span class="portal-page-info">共 {{ filtered.length }} 条记录</span>
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="currentPage = Math.max(1, currentPage - 1)"
      >
        上一页
      </button>
      <button
        v-for="p in pageNumbers"
        :key="p"
        type="button"
        :class="{ active: p === currentPage }"
        @click="currentPage = p"
      >
        {{ p }}
      </button>
      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
      >
        下一页
      </button>
    </div>

    <div v-if="toast" class="portal-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>

.portal-empty {
  padding: 48px 16px;
  font-size: 14px;
  color: var(--portal-gray-500, #9e9e9e);
  text-align: center;
  background: #fff;
  border: 1px dashed var(--portal-gray-300, #e0e0e0);
  border-radius: 12px;
}

.portal-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  z-index: 2000;
  padding: 10px 20px;
  font-size: 13px;
  color: #fff;
  background: rgb(33 33 33 / 88%);
  border-radius: 8px;
  transform: translateX(-50%);
}

.portal-pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
