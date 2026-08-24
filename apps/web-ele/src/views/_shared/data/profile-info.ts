/** 我的信息中心 · 个人信息 mock */

export const CERT_TYPE_OPTIONS = [
  '统一社会信用代码',
  '组织机构代码证',
  '营业执照注册号',
] as const;

export const LEGAL_CERT_TYPE_OPTIONS = [
  '居民身份证',
  '护照',
  '港澳居民来往内地通行证',
  '台湾居民来往大陆通行证',
] as const;

export function createDefaultProfile() {
  return {
    username: 'dsfuis',
    accountId: '2489372598',
    registeredAt: '2021-06-30',
    realNameStatus: '已认证' as '已认证' | '审核中' | '未认证',
    phone: '12489372598',
    companyName: '南方绿算科技有限公司',
    certType: '统一社会信用代码',
    orgCode: '91440101MA5XXXXX1X',
    contact: '020-88886666',
    legalName: '陈明远',
    legalCertType: '居民身份证',
    legalCertNo: '440106198805161234',
    licenseUrl: '',
  };
}
