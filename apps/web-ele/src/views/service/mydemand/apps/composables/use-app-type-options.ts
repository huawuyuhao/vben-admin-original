import type { AppTypeOptionItem } from '#/types/service/mydemand/apps';

import { ref } from 'vue';

import { getAppTypeOptionsApi } from '#/api/service/mydemand/apps';

/**
 * 应用类型下拉选项（查询 / 新增 / 编辑共用）
 * @returns options、loading、拉取方法
 */
export function useAppTypeOptions() {
  /** 类型选项列表 */
  const typeOptions = ref<AppTypeOptionItem[]>([]);
  /** 加载中 */
  const typeLoading = ref(false);

  /**
   * 拉取应用类型下拉数据
   * @param keyword 可选搜索关键词
   */
  async function fetchTypeOptions(keyword?: string) {
    typeLoading.value = true;
    try {
      const list = await getAppTypeOptionsApi({
        keyword: keyword?.trim() || undefined,
      });
      typeOptions.value = Array.isArray(list) ? list : [];
    } catch {
      typeOptions.value = [];
    } finally {
      typeLoading.value = false;
    }
  }

  /**
   * 远程搜索回调（供 el-select remote-method）
   * @param query 输入关键词
   */
  function handleTypeRemoteSearch(query: string) {
    void fetchTypeOptions(query);
  }

  return {
    typeOptions,
    typeLoading,
    fetchTypeOptions,
    handleTypeRemoteSearch,
  };
}
