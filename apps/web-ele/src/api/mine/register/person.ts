import type {
  PersonalCertParams,
  PersonalCertProgressParams,
  PersonalCertProgressResult,
  PersonalCertResult,
} from '#/types/mine/register/person';

import { rootRequestClient } from '#/api/request';

/**
 * 提交个人认证材料（需 Bearer Token）
 * 开发态走 Apifox Mock：POST /mock/auth/personal-cert（JSON body）
 * 正式接口：POST /auth/personal-cert
 * @param data 个人认证材料
 * @returns 含 key（认证 ID）的业务 data
 */
export async function submitPersonalCertApi(data: PersonalCertParams) {
  return rootRequestClient.post<PersonalCertResult>(
    '/mock/auth/personal-cert',
    data,
  );
  // return rootRequestClient.post<PersonalCertResult>(
  //   '/auth/personal-cert',
  //   data,
  // );
}

/**
 * 查询个人认证进度（需 Bearer Token）
 * 开发态走 Apifox Mock：GET /mock/auth/personal-cert/progress
 * 正式接口：GET /auth/personal-cert/progress
 * @param params 可选 authId（提交返参 key）；不传则由后端按当前登录用户查询
 * @returns 含 authStatus、auditRemark 的业务 data
 */
export async function getPersonalCertProgressApi(
  params?: PersonalCertProgressParams,
) {
  return rootRequestClient.get<PersonalCertProgressResult>(
    '/mock/auth/personal-cert/progress',
    { params },
  );
  // return rootRequestClient.get<PersonalCertProgressResult>(
  //   '/auth/personal-cert/progress',
  //   { params },
  // );
}
