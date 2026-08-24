/** 管理 / 企业中心 mock */

export type SubAccountStatus = '启用' | '禁用';

export interface SubAccount {
  id: string;
  username: string;
  name: string;
  department: string;
  phone: string;
  role: string;
  validFrom: string;
  validTo: string;
  status: SubAccountStatus;
}

export type DeviceRunStatus = '运行中' | '待修' | '维护中';

export interface DeviceStatRow {
  id: string;
  name: string;
  type: string;
  onlineHours: number;
  powerKwh: number;
  alarms: number;
  status: DeviceRunStatus;
}

export const subAccounts: SubAccount[] = [
  {
    id: '1',
    username: 'zhang.san',
    name: '张三',
    department: '技术部',
    phone: '138****1001',
    role: '管理员',
    validFrom: '2023-01-01',
    validTo: '2024-12-31',
    status: '启用',
  },
  {
    id: '2',
    username: 'li.si',
    name: '李四',
    department: '市场部',
    phone: '139****2002',
    role: '操作员',
    validFrom: '2023-03-15',
    validTo: '2024-12-31',
    status: '启用',
  },
  {
    id: '3',
    username: 'wang.wu',
    name: '王五',
    department: '运营部',
    phone: '137****3003',
    role: '查看员',
    validFrom: '2023-05-01',
    validTo: '2024-06-30',
    status: '禁用',
  },
  {
    id: '4',
    username: 'zhao.liu',
    name: '赵六',
    department: '财务部',
    phone: '136****4004',
    role: '财务员',
    validFrom: '2023-02-20',
    validTo: '2025-02-20',
    status: '启用',
  },
  {
    id: '5',
    username: 'chen.qi',
    name: '陈七',
    department: '技术部',
    phone: '135****5005',
    role: '操作员',
    validFrom: '2023-08-01',
    validTo: '2024-08-01',
    status: '启用',
  },
  {
    id: '6',
    username: 'sun.ba',
    name: '孙八',
    department: '市场部',
    phone: '134****6006',
    role: '查看员',
    validFrom: '2023-01-10',
    validTo: '2023-12-31',
    status: '禁用',
  },
  {
    id: '7',
    username: 'zhou.jiu',
    name: '周九',
    department: '运营部',
    phone: '133****7007',
    role: '操作员',
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    status: '启用',
  },
  {
    id: '8',
    username: 'wu.shi',
    name: '吴十',
    department: '技术部',
    phone: '132****8008',
    role: '管理员',
    validFrom: '2023-06-01',
    validTo: '2025-06-01',
    status: '启用',
  },
];

export const deviceStatRows: DeviceStatRow[] = [
  {
    id: 'd1',
    name: 'GPU-01',
    type: 'GPU服务器',
    onlineHours: 8420,
    powerKwh: 28600,
    alarms: 8,
    status: '运行中',
  },
  {
    id: 'd2',
    name: 'CPU-01',
    type: 'CPU服务器',
    onlineHours: 8100,
    powerKwh: 15200,
    alarms: 3,
    status: '运行中',
  },
  {
    id: 'd3',
    name: 'STORAGE-01',
    type: '存储设备',
    onlineHours: 7900,
    powerKwh: 9800,
    alarms: 5,
    status: '待修',
  },
  {
    id: 'd4',
    name: 'NET-01',
    type: '网络设备',
    onlineHours: 8600,
    powerKwh: 4200,
    alarms: 2,
    status: '运行中',
  },
  {
    id: 'd5',
    name: 'AC-01',
    type: '空调系统',
    onlineHours: 8700,
    powerKwh: 18600,
    alarms: 6,
    status: '维护中',
  },
  {
    id: 'd6',
    name: 'GPU-02',
    type: 'GPU服务器',
    onlineHours: 7200,
    powerKwh: 24100,
    alarms: 4,
    status: '运行中',
  },
  {
    id: 'd7',
    name: 'CPU-02',
    type: 'CPU服务器',
    onlineHours: 6500,
    powerKwh: 12800,
    alarms: 1,
    status: '运行中',
  },
  {
    id: 'd8',
    name: 'STORAGE-02',
    type: '存储设备',
    onlineHours: 5400,
    powerKwh: 7600,
    alarms: 7,
    status: '待修',
  },
];

export const statsKpis = [
  {
    key: 'devices',
    label: '供给设备数量',
    value: '128',
    unit: '',
    change: 12.5,
    up: true,
  },
  {
    key: 'online',
    label: '累计在线时间',
    value: '8,760',
    unit: '小时',
    change: 8.3,
    up: true,
  },
  {
    key: 'power',
    label: '累计用电量',
    value: '125,600',
    unit: 'kWh',
    change: 5.2,
    up: true,
  },
  {
    key: 'alarms',
    label: '累计告警数量',
    value: '36',
    unit: '',
    change: 18.7,
    up: false,
  },
];

export const months = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];

export const deviceCountTrend = [
  72, 78, 82, 88, 90, 95, 98, 105, 110, 118, 124, 128,
];

export const onlineHoursTrend = [
  520, 580, 610, 640, 680, 720, 760, 790, 820, 850, 880, 900,
];

export const powerPieData = [
  { name: 'GPU服务器', value: 25 },
  { name: 'CPU服务器', value: 20 },
  { name: '存储设备', value: 15 },
  { name: '网络设备', value: 15 },
  { name: '空调系统', value: 15 },
  { name: '其他设备', value: 10 },
];

export const alarmBarData = [
  { name: 'CPU告警', value: 12 },
  { name: '内存告警', value: 8 },
  { name: '磁盘告警', value: 9 },
  { name: '网络告警', value: 7 },
];

/** 企业认证状态 */
export type EnterpriseAuthStatus =
  | '已认证'
  | '待审核'
  | '未认证'
  | '需重新认证';

/** 企业基础信息（企业信息管理） */
export interface EnterpriseInfo {
  /** 算力客户类型 */
  customerType: string;
  /** 组织/企业名称 */
  orgName: string;
  /** 注册名称 */
  registerName: string;
  /** 法人姓名 */
  legalPerson: string;
  /** 统一社会信用代码（不可修改） */
  creditCode: string;
  /** 联系人 */
  contactName: string;
  /** 手机号 */
  phone: string;
  /** 邮箱 */
  email: string;
  /** 企业地址 */
  address: string;
  /** 所属行业 */
  industry: string;
  /** 认证信息状态 */
  authStatus: EnterpriseAuthStatus;
  /** 最近审核时间 */
  lastAuditAt: string;
  /** 供给方名称 */
  supplierName: string;
  /** 算力资源数量 */
  resourceCount: number;
  /** 接入状态 */
  accessStatus: string;
  /** 合同主体名称 */
  contractSubject: string;
  /** 合同状态 */
  contractStatus: string;
}

export const defaultEnterpriseInfo: EnterpriseInfo = {
  customerType: '算力供给用户',
  orgName: '南方绿算科技有限公司',
  registerName: '南方绿算科技有限公司',
  legalPerson: '陈明远',
  creditCode: '91440101MA5CXXXX1X',
  contactName: '王晓琳',
  phone: '13800138000',
  email: 'contact@nanfang-ls.com',
  address: '广东省广州市天河区科韵路 88 号绿算大厦 18 层',
  industry: '信息传输、软件和信息技术服务业',
  authStatus: '已认证',
  lastAuditAt: '2026-06-18 14:32:00',
  supplierName: '南方绿算科技有限公司',
  resourceCount: 128,
  accessStatus: '已接入',
  contractSubject: '南方绿算科技有限公司',
  contractStatus: '履行中',
};

export const industryOptions = [
  '信息传输、软件和信息技术服务业',
  '电力、热力生产和供应业',
  '科学研究和技术服务业',
  '租赁和商务服务业',
  '制造业',
];
