<script lang="ts" setup>
import type { DemandDiskPayload, ProductSpecItem } from '#/types/service/product/order';

import { computed, onMounted, reactive, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Delete, Plus, Search } from '@element-plus/icons-vue';

import {
  getSpecFilterOptionsApi,
  getSpecListApi,
} from '#/api/service/product/order';

import {
  DISK_TYPE_OPTIONS,
  DISK_USAGE_DATA,
  DISK_USAGE_SYSTEM,
  formatFee,
  MAX_DATA_DISKS,
  SPEC_PAGE_SIZE,
} from '../data';

const props = defineProps<{
  /** 磁盘配置 */
  disks: DemandDiskPayload[];
  /** 已选规格 ID */
  specId?: null | number;
}>();

const emit = defineEmits<{
  'spec-change': [null | ProductSpecItem];
  'update:disks': [DemandDiskPayload[]];
  'update:specId': [null | number];
}>();

/** 筛选项 */
const filterOptions = reactive({
  architectureOptions: [] as string[],
  specTypeOptions: [] as string[],
  instanceFamilyOptions: [] as string[],
  gpuModelOptions: [] as string[],
});

/** 当前筛选 */
const filters = reactive({
  architecture: '' as string,
  specType: '' as string,
  instanceFamily: '' as string,
  gpuModel: '' as string,
  keyword: '' as string,
});

const loading = ref(false);
const optionsLoading = ref(false);
const specs = ref<ProductSpecItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(SPEC_PAGE_SIZE);

/** 表格单选：当前选中行 */
const selectedSpec = computed(() =>
  specs.value.find((item) => item.specId === props.specId) ?? null,
);

/**
 * 拉取筛选项
 */
async function fetchFilterOptions() {
  optionsLoading.value = true;
  try {
    const data = await getSpecFilterOptionsApi();
    filterOptions.architectureOptions = data?.architectureOptions ?? [];
    filterOptions.specTypeOptions = data?.specTypeOptions ?? [];
    filterOptions.instanceFamilyOptions = data?.instanceFamilyOptions ?? [];
    filterOptions.gpuModelOptions = data?.gpuModelOptions ?? [];
  } catch {
    filterOptions.architectureOptions = [];
    filterOptions.specTypeOptions = [];
    filterOptions.instanceFamilyOptions = [];
    filterOptions.gpuModelOptions = [];
  } finally {
    optionsLoading.value = false;
  }
}

/**
 * 拉取规格列表
 */
async function fetchSpecs() {
  loading.value = true;
  try {
    const data = await getSpecListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      architecture: filters.architecture || undefined,
      specType: filters.specType || undefined,
      instanceFamily: filters.instanceFamily || undefined,
      gpuModel: filters.gpuModel || undefined,
      keyword: filters.keyword.trim() || undefined,
    });
    specs.value = data.records ?? [];
    total.value = data.total ?? 0;
    if (data.current && data.current !== currentPage.value) {
      currentPage.value = data.current;
    }
  } catch {
    specs.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * 重置到第一页并查询
 */
function queryFromFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void fetchSpecs();
}

/**
 * 切换筛选芯片（再次点击取消）
 * @param key 筛选字段
 * @param value 选项值
 */
function toggleFilter(
  key: 'architecture' | 'gpuModel' | 'instanceFamily' | 'specType',
  value: string,
) {
  filters[key] = filters[key] === value ? '' : value;
  queryFromFirstPage();
}

/**
 * 选中规格行
 * @param row 规格
 */
function handleSelectSpec(row: ProductSpecItem) {
  emit('update:specId', row.specId);
  emit('spec-change', row);
}

/**
 * 更新磁盘列表
 * @param next 新列表
 */
function updateDisks(next: DemandDiskPayload[]) {
  emit('update:disks', next);
}

/**
 * 添加数据盘
 */
function addDataDisk() {
  const dataCount = props.disks.filter(
    (d) => d.diskUsage === DISK_USAGE_DATA,
  ).length;
  if (dataCount >= MAX_DATA_DISKS) {
    return;
  }
  updateDisks([
    ...props.disks,
    {
      diskUsage: DISK_USAGE_DATA,
      diskType: '通用型SSD',
      capacityGb: 100,
      quantity: 1,
    },
  ]);
}

/**
 * 删除磁盘行
 * @param index 下标
 */
function removeDisk(index: number) {
  const target = props.disks[index];
  if (!target || target.diskUsage === DISK_USAGE_SYSTEM) {
    return;
  }
  updateDisks(props.disks.filter((_, i) => i !== index));
}

/**
 * 更新磁盘字段
 * @param index 下标
 * @param patch 局部字段
 */
function patchDisk(index: number, patch: Partial<DemandDiskPayload>) {
  updateDisks(
    props.disks.map((item, i) => (i === index ? { ...item, ...patch } : item)),
  );
}

/**
 * 磁盘用途文案
 * @param usage 用途码
 */
function diskUsageLabel(usage: number) {
  return usage === DISK_USAGE_SYSTEM
    ? $t('page.service.product.order.disk.system')
    : $t('page.service.product.order.disk.data');
}

watch(currentPage, () => {
  void fetchSpecs();
});

watch(pageSize, () => {
  queryFromFirstPage();
});

onMounted(async () => {
  await fetchFilterOptions();
  await fetchSpecs();
});

defineExpose({
  /** 当前页选中规格（可能因分页不在列表中） */
  selectedSpec,
  fetchSpecs,
});
</script>

<template>
  <div class="order-basic" v-loading="optionsLoading">
    <el-card class="order-basic__card" shadow="never">
      <template #header>
        <div class="order-basic__card-head">
          <h3>{{ $t('page.service.product.order.basic.specTitle') }}</h3>
          <p>{{ $t('page.service.product.order.basic.specDesc') }}</p>
        </div>
      </template>

      <div class="order-basic__filters">
        <div class="order-basic__filter-row">
          <span class="order-basic__filter-label">
            {{ $t('page.service.product.order.basic.architecture') }}
          </span>
          <div class="order-basic__chips">
            <el-check-tag
              v-for="item in filterOptions.architectureOptions"
              :key="`arch-${item}`"
              :checked="filters.architecture === item"
              @change="() => toggleFilter('architecture', item)"
            >
              {{ item }}
            </el-check-tag>
            <span
              v-if="filterOptions.architectureOptions.length === 0"
              class="order-basic__filter-empty"
            >
              {{ $t('page.service.product.order.basic.filterEmpty') }}
            </span>
          </div>
        </div>

        <div class="order-basic__filter-row">
          <span class="order-basic__filter-label">
            {{ $t('page.service.product.order.basic.instanceFamily') }}
          </span>
          <div class="order-basic__chips">
            <el-check-tag
              v-for="item in filterOptions.instanceFamilyOptions"
              :key="`fam-${item}`"
              :checked="filters.instanceFamily === item"
              @change="() => toggleFilter('instanceFamily', item)"
            >
              {{ item }}
            </el-check-tag>
          </div>
        </div>

        <div class="order-basic__filter-row">
          <span class="order-basic__filter-label">
            {{ $t('page.service.product.order.basic.specType') }}
          </span>
          <div class="order-basic__chips">
            <el-check-tag
              v-for="item in filterOptions.specTypeOptions"
              :key="`type-${item}`"
              :checked="filters.specType === item"
              @change="() => toggleFilter('specType', item)"
            >
              {{ item }}
            </el-check-tag>
          </div>
        </div>

        <div class="order-basic__filter-row">
          <span class="order-basic__filter-label">
            {{ $t('page.service.product.order.basic.gpuModel') }}
          </span>
          <div class="order-basic__chips">
            <el-check-tag
              v-for="item in filterOptions.gpuModelOptions"
              :key="`gpu-${item}`"
              :checked="filters.gpuModel === item"
              @change="() => toggleFilter('gpuModel', item)"
            >
              {{ item }}
            </el-check-tag>
          </div>
        </div>

        <div class="order-basic__search">
          <el-input
            v-model="filters.keyword"
            clearable
            :placeholder="$t('page.service.product.order.basic.keywordPlaceholder')"
            @keyup.enter="queryFromFirstPage"
          >
            <template #append>
              <el-button :icon="Search" @click="queryFromFirstPage" />
            </template>
          </el-input>
        </div>
      </div>

      <el-table
        v-loading="loading"
        class="order-basic__table"
        :data="specs"
        highlight-current-row
        row-key="specId"
        :current-row-key="specId ?? undefined"
        @current-change="(row: ProductSpecItem | undefined) => row && handleSelectSpec(row)"
        @row-click="handleSelectSpec"
      >
        <el-table-column width="52" align="center">
          <template #default="{ row }">
            <el-radio
              :model-value="specId"
              :value="row.specId"
              @change="handleSelectSpec(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="specCode"
          :label="$t('page.service.product.order.basic.columns.specCode')"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="architecture"
          :label="$t('page.service.product.order.basic.columns.architecture')"
          min-width="110"
        />
        <el-table-column
          prop="instanceFamily"
          :label="$t('page.service.product.order.basic.columns.instanceFamily')"
          min-width="110"
        />
        <el-table-column
          prop="vcpu"
          :label="$t('page.service.product.order.basic.columns.vcpu')"
          width="90"
          align="center"
        />
        <el-table-column
          :label="$t('page.service.product.order.basic.columns.memory')"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ row.memoryGb != null ? `${row.memoryGb} GB` : '—' }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('page.service.product.order.basic.columns.gpu')"
          min-width="120"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <template v-if="row.gpuCount || row.gpuModel">
              {{ row.gpuModel || '—' }}
              <span v-if="row.gpuCount"> × {{ row.gpuCount }}</span>
            </template>
            <template v-else>—</template>
          </template>
        </el-table-column>
        <el-table-column
          prop="intranetBandwidth"
          :label="$t('page.service.product.order.basic.columns.bandwidth')"
          min-width="110"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('page.service.product.order.basic.columns.price')"
          width="120"
          align="right"
        >
          <template #default="{ row }">
            <span class="order-basic__price">
              ¥{{ formatFee(row.pricePerHour) }}
              <small>/h</small>
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div class="order-basic__pager">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="total"
        />
      </div>
    </el-card>

    <el-card class="order-basic__card" shadow="never">
      <template #header>
        <div class="order-basic__card-head">
          <h3>{{ $t('page.service.product.order.basic.diskTitle') }}</h3>
          <p>{{ $t('page.service.product.order.basic.diskDesc') }}</p>
        </div>
      </template>

      <el-table :data="disks" class="order-basic__disk-table">
        <el-table-column
          :label="$t('page.service.product.order.disk.usage')"
          width="120"
        >
          <template #default="{ row }">
            {{ diskUsageLabel(row.diskUsage) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('page.service.product.order.disk.type')"
          min-width="180"
        >
          <template #default="{ row, $index }">
            <el-select
              :model-value="row.diskType"
              @update:model-value="
                (v: string) => patchDisk($index, { diskType: v })
              "
            >
              <el-option
                v-for="opt in DISK_TYPE_OPTIONS"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('page.service.product.order.disk.capacity')"
          width="160"
        >
          <template #default="{ row, $index }">
            <el-input-number
              :model-value="row.capacityGb"
              :min="row.diskUsage === DISK_USAGE_SYSTEM ? 40 : 10"
              :max="32000"
              :step="10"
              controls-position="right"
              @update:model-value="
                (v: number | undefined) =>
                  patchDisk($index, { capacityGb: Number(v) || 10 })
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('page.service.product.order.disk.quantity')"
          width="140"
        >
          <template #default="{ row, $index }">
            <el-input-number
              :model-value="row.quantity"
              :min="1"
              :max="row.diskUsage === DISK_USAGE_SYSTEM ? 1 : 20"
              :disabled="row.diskUsage === DISK_USAGE_SYSTEM"
              controls-position="right"
              @update:model-value="
                (v: number | undefined) =>
                  patchDisk($index, { quantity: Number(v) || 1 })
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('page.service.product.order.disk.actions')"
          width="90"
          align="center"
        >
          <template #default="{ row, $index }">
            <el-button
              v-if="row.diskUsage === DISK_USAGE_DATA"
              type="danger"
              link
              :icon="Delete"
              @click="removeDisk($index)"
            />
            <span v-else class="order-basic__disk-fixed">—</span>
          </template>
        </el-table-column>
      </el-table>

      <el-button
        class="order-basic__add-disk"
        :icon="Plus"
        :disabled="
          disks.filter((d) => d.diskUsage === DISK_USAGE_DATA).length >=
          MAX_DATA_DISKS
        "
        @click="addDataDisk"
      >
        {{ $t('page.service.product.order.disk.addData') }}
      </el-button>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.order-basic {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__card {
    border-radius: 14px;

    :deep(.el-card__header) {
      padding: 16px 20px 12px;
    }

    :deep(.el-card__body) {
      padding: 8px 20px 20px;
    }
  }

  &__card-head {
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 650;
      line-height: 1.4;
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.5;
      color: hsl(var(--muted-foreground));
    }
  }

  &__filters {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__filter-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  &__filter-label {
    flex-shrink: 0;
    width: 72px;
    padding-top: 4px;
    font-size: 13px;
    line-height: 1.4;
    color: hsl(var(--muted-foreground));
  }

  &__chips {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__filter-empty {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
  }

  &__search {
    max-width: 360px;
    margin-top: 4px;
  }

  &__table {
    width: 100%;
  }

  &__price {
    font-weight: 650;
    color: var(--el-color-primary);

    small {
      margin-left: 2px;
      font-weight: 400;
      color: hsl(var(--muted-foreground));
    }
  }

  &__pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  &__add-disk {
    margin-top: 12px;
  }

  &__disk-fixed {
    color: hsl(var(--muted-foreground));
  }
}

@media (max-width: 768px) {
  .order-basic {
    &__filter-row {
      flex-direction: column;
      gap: 6px;
    }

    &__filter-label {
      width: auto;
      padding-top: 0;
    }
  }
}
</style>
