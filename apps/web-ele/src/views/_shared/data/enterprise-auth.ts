/** 企业用户认证 mock 数据 */

export type AuthStatus = 'approved' | 'draft' | 'rejected' | 'reviewing';

export interface AuthHistoryItem {
  id: string;
  applyNo: string;
  companyName: string;
  submittedAt: string;
  finishedAt: string;
  result: '通过' | '审核中' | '驳回';
  remark: string;
}

export const INDUSTRY_OPTIONS = [
  '电力 / 能源',
  '信息技术 / 软件',
  '云计算 / 数据中心',
  '制造业',
  '科研院所',
  '政务 / 公共事业',
  '其他',
] as const;

export const COMPANY_TYPE_OPTIONS = [
  '有限责任公司',
  '股份有限公司',
  '国有企业',
  '外商投资企业',
  '个人独资企业',
  '其他',
] as const;

/** 省市区简化数据（演示） */
export const REGION_TREE: Record<string, Record<string, string[]>> = {
  广东省: {
    广州市: ['天河区', '海珠区', '番禺区', '南沙区', '黄埔区'],
    深圳市: ['南山区', '福田区', '宝安区', '龙岗区'],
    珠海市: ['香洲区', '金湾区', '斗门区'],
  },
  贵州省: {
    贵阳市: ['观山湖区', '南明区', '云岩区'],
    贵安新区: ['党武镇', '湖潮乡'],
  },
  云南省: {
    昆明市: ['五华区', '盘龙区', '官渡区'],
    大理州: ['大理市', '宾川县'],
  },
  广西壮族自治区: {
    南宁市: ['青秀区', '西乡塘区', '良庆区'],
    桂林市: ['秀峰区', '七星区'],
  },
  海南省: {
    海口市: ['龙华区', '美兰区', '秀英区'],
    三亚市: ['吉阳区', '天涯区'],
  },
};

export function createDefaultForm() {
  return {
    companyName: '南方绿算科技有限公司',
    creditCode: '91440101MA5XXXXX1X',
    industry: '云计算 / 数据中心',
    companyType: '有限责任公司',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    addressDetail: '科韵路 88 号绿算大厦 18 层',
    introduction:
      '面向电碳算协同场景，提供绿电可追溯算力调度与普惠 Token 服务。',
    legalName: '陈明远',
    legalIdNo: '440106198805161234',
    legalPhone: '13800138000',
    legalEmail: 'legal@nanfang-green.com',
  };
}

export const AUTH_HISTORY: AuthHistoryItem[] = [
  {
    id: 'h1',
    applyNo: 'ENT-2026-0812-003',
    companyName: '南方绿算科技有限公司',
    submittedAt: '2026-08-12 14:22',
    finishedAt: '—',
    result: '审核中',
    remark: '材料齐全，等待平台复核。',
  },
  {
    id: 'h2',
    applyNo: 'ENT-2026-0301-011',
    companyName: '南方绿算科技有限公司',
    submittedAt: '2026-03-01 09:40',
    finishedAt: '2026-03-03 16:18',
    result: '驳回',
    remark: '营业执照影像不清晰，请重新上传正本或副本清晰照片。',
  },
];

/** 演示默认状态：审核中 */
export const DEFAULT_AUTH_STATUS: AuthStatus = 'reviewing';
