/** 我的消息 mock 数据 */

export type MessageCategory =
  | 'all'
  | 'auth'
  | 'deleted'
  | 'demand'
  | 'subaccount'
  | 'system';

export interface MineMessage {
  id: string;
  category: Exclude<MessageCategory, 'all' | 'deleted'>;
  title: string;
  content: string;
  time: string;
  unread: boolean;
  deleted?: boolean;
}

export const MESSAGE_CATEGORY_META: Record<
  Exclude<MessageCategory, 'deleted'>,
  { label: string; color: string; icon: string }
> = {
  all: { label: '全部消息', color: '#6b4cff', icon: '📁' },
  demand: { label: '需求消息', color: '#00c853', icon: '📋' },
  auth: { label: '认证消息', color: '#9c27b0', icon: '🔐' },
  subaccount: { label: '企业子账号消息', color: '#2196f3', icon: '👥' },
  system: { label: '系统消息', color: '#ff9800', icon: '⚙️' },
};

export const mineMessages: MineMessage[] = [
  {
    id: 'm1',
    category: 'demand',
    title: '算力需求申请通知',
    content:
      '您提交的算力需求 DEM-20260315-001 已进入审核队列，预计 1 个工作日内反馈。',
    time: '2026-03-15 09:23',
    unread: true,
  },
  {
    id: 'm2',
    category: 'auth',
    title: '企业认证审核结果通知',
    content: '您的企业认证申请已通过审核，现可使用平台完整服务能力。',
    time: '2026-03-14 16:40',
    unread: true,
  },
  {
    id: 'm3',
    category: 'demand',
    title: '算力任务完成通知',
    content: '任务 TASK-20260314-008 已完成，结果文件可在「我的需求」中下载。',
    time: '2026-03-14 11:05',
    unread: true,
  },
  {
    id: 'm4',
    category: 'subaccount',
    title: '企业子账号开通通知',
    content: '管理员已为您开通子账号 ops-02，初始密码请查收短信。',
    time: '2026-03-13 18:20',
    unread: true,
  },
  {
    id: 'm5',
    category: 'system',
    title: '系统维护预告',
    content:
      '平台将于 2026-03-20 02:00-04:00 进行例行维护，期间部分服务可能短暂不可用。',
    time: '2026-03-13 10:00',
    unread: false,
  },
  {
    id: 'm6',
    category: 'auth',
    title: '个人认证材料补充提醒',
    content: '您的个人认证申请需补充身份证人像面清晰照片，请尽快处理。',
    time: '2026-03-12 15:33',
    unread: true,
  },
  {
    id: 'm7',
    category: 'demand',
    title: '需求报价更新通知',
    content: '供应商已对您的需求 DEM-20260310-004 更新报价，请及时查看。',
    time: '2026-03-12 09:18',
    unread: false,
  },
  {
    id: 'm8',
    category: 'subaccount',
    title: '子账号权限变更通知',
    content: '子账号 finance-01 的角色已调整为「财务员」，请知悉。',
    time: '2026-03-11 14:02',
    unread: false,
  },
  {
    id: 'm9',
    category: 'system',
    title: '安全登录提醒',
    content: '检测到您的账号于新设备登录，如非本人操作请立即修改密码。',
    time: '2026-03-11 08:45',
    unread: true,
  },
  {
    id: 'm10',
    category: 'demand',
    title: '算力需求审核通过通知',
    content: '需求 DEM-20260308-002 已通过审核并自动进入调度队列。',
    time: '2026-03-10 17:26',
    unread: false,
  },
  {
    id: 'm11',
    category: 'system',
    title: '账单已生成',
    content: '2026 年 2 月账单已生成，可在费用中心查看与下载。',
    time: '2026-03-09 11:10',
    unread: false,
  },
  {
    id: 'm12',
    category: 'auth',
    title: '实名认证即将到期提醒',
    content: '您的证件有效期将于 30 天后到期，请及时更新认证材料。',
    time: '2026-03-08 09:00',
    unread: false,
  },
  {
    id: 'm13',
    category: 'demand',
    title: '历史需求归档通知',
    content: '已过期需求 DEM-20260120-015 已自动归档。',
    time: '2026-02-28 16:00',
    unread: false,
    deleted: true,
  },
  {
    id: 'm14',
    category: 'system',
    title: '旧版公告（已删除）',
    content: '此消息已被删除，仅在回收站中可见。',
    time: '2026-02-20 10:00',
    unread: false,
    deleted: true,
  },
];

export function getMessageStats(list: MineMessage[]) {
  const active = list.filter((m) => !m.deleted);
  const by = (cat: MineMessage['category']) =>
    active.filter((m) => m.category === cat);
  return {
    all: {
      total: active.length,
      unread: active.filter((m) => m.unread).length,
    },
    demand: {
      total: by('demand').length,
      unread: by('demand').filter((m) => m.unread).length,
    },
    auth: {
      total: by('auth').length,
      unread: by('auth').filter((m) => m.unread).length,
    },
    system: {
      total: by('system').length,
      unread: by('system').filter((m) => m.unread).length,
    },
    subaccount: {
      total: by('subaccount').length,
      unread: by('subaccount').filter((m) => m.unread).length,
    },
  };
}
