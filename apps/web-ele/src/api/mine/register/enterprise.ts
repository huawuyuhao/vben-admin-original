import type {
  EnterpriseCertParams,
  EnterpriseCertProgressParams,
  EnterpriseCertProgressResult,
  EnterpriseCertResult,
} from '#/types/mine/register/enterprise';

import { rootRequestClient } from '#/api/request';

/**
 * 提交企业认证材料（需 Bearer Token）
 * 开发态走 Apifox Mock：POST /mock/auth/enterprise-cert（JSON body）
 * 正式接口：POST /auth/enterprise-cert
 * @param data 企业认证材料
 * @returns 含 key（认证 ID）的业务 data
 */
export async function submitEnterpriseCertApi(data: EnterpriseCertParams) {
  return rootRequestClient.post<EnterpriseCertResult>(
    '/mock/auth/enterprise-cert',
    data,
  );
  // return rootRequestClient.post<EnterpriseCertResult>(
  //   '/auth/enterprise-cert',
  //   data,
  // );
}

/**
 * 查询企业认证进度（需 Bearer Token）
 * 开发态走 Apifox Mock：GET /mock/auth/enterprise-cert/progress
 * 正式接口：GET /auth/enterprise-cert/progress
 * @param params 可选 authId（提交返参 key）；不传则由后端按当前登录用户查询
 * @returns 含 authStatus、auditRemark 的业务 data
 */
export async function getEnterpriseCertProgressApi(
  params?: EnterpriseCertProgressParams,
) {
  return rootRequestClient.get<EnterpriseCertProgressResult>(
    '/mock/auth/enterprise-cert/progress',
    { params },
  );
  // return rootRequestClient.get<EnterpriseCertProgressResult>(
  //   '/auth/enterprise-cert/progress',
  //   { params },
  // );
}
