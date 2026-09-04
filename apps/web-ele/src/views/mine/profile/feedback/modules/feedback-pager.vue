<script lang="ts" setup>
import { FEEDBACK_PAGE_SIZE_OPTIONS } from '../data';

defineOptions({ name: 'MineProfileFeedbackPager' });

defineProps<{
  /** 禁用交互 */
  disabled?: boolean;
  /** 总条数（接口 total） */
  total: number;
}>();
/** 当前页 */
const page = defineModel<number>('page', { default: 1 });
/** 每页条数 */
const pageSize = defineModel<number>('pageSize', { default: 10 });

</script>

<template>
  <el-card class="feedback-pager" shadow="never">
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      background
      layout="total, sizes, prev, pager, next"
      :disabled="disabled"
      :page-sizes="FEEDBACK_PAGE_SIZE_OPTIONS"
      :total="total"
    />
  </el-card>
</template>

<style lang="scss" scoped>
.feedback-pager {
  margin-top: 8px;

  :deep(.el-card__body) {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .feedback-pager {
    :deep(.el-card__body),
    :deep(.el-pagination) {
      justify-content: center;
    }
  }
}
</style>
