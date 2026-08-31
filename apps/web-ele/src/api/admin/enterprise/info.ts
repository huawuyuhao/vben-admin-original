import type {
  EnterpriseInfo,
  UpdateEnterpriseInfoParams,
  UpdateEnterpriseInfoResult,
} from '#/types/admin/enterprise/info';

import { rootRequestClient } from '#/api/request';

/**
 * 获取企业信息（需 Bearer Token）
 * 开发态走 Apifox Mock：GET /mock/enterprise/info
 * 正式接口：GET /enterprise/info
 * @returns 企业基础信息
 */
export async function getEnterpriseInfoApi() {
  return rootRequestClient.get<EnterpriseInfo>('/mock/enterprise/info');
  // return rootRequestClient.get<EnterpriseInfo>('/enterprise/info');
}

/**
 * 修改企业信息（需 Bearer Token）
 * 开发态走 Apifox Mock：PUT /mock/enterprise/info
 * 正式接口：PUT /enterprise/info
 * 入参走 query：contactPhone、address（均为必填）
 * @param params 可改字段
 * @returns 业务 data（文档为 string）
 */
export async function updateEnterpriseInfoApi(
  params: UpdateEnterpriseInfoParams,
) {
  return rootRequestClient.put<UpdateEnterpriseInfoResult>(
    '/mock/enterprise/info',
    undefined,
    { params },
  );
  // return rootRequestClient.put<UpdateEnterpriseInfoResult>(
  //   '/enterprise/info',
  //   undefined,
  //   { params },
  // );
}
