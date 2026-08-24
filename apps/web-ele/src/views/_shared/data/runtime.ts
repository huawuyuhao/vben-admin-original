/** 应用运行管理 mock */

export interface RuntimeKpi {
  label: string;
  value: string;
  unit: string;
}

export interface RuntimeTask {
  id: string;
  taskId: string;
  taskName: string;
  taskType: string;
  prefer: string;
  startTime: string;
  /** 已运行秒数（用于实时计时展示） */
  elapsedSec: number;
  /** 流程步骤：0-3，当前进行中的下标 */
  stepIndex: number;
  progressDone: number;
  progressTotal: number;
  appName: string;
  appVersion: string;
  appType: string;
  appDesc: string;
}

export interface RuntimeFileRow {
  id: string;
  name: string;
  type: string;
  fileName: string;
  uploadedAt: string;
}

export const runtimeKpis: RuntimeKpi[] = [
  { label: '总费用', value: '12,256', unit: '万元' },
  { label: '总时长', value: '12,256', unit: '小时' },
  { label: '总用电', value: '12,256', unit: 'kWh' },
  { label: '算电能耗', value: '12,256', unit: 'kWh' },
  { label: '碳排放', value: '12,256', unit: '吨' },
];

export const runtimeSteps = [
  '任务提交',
  '资源准备中',
  '任务运行中',
  '任务完成',
];

export const runtimeTasks: RuntimeTask[] = [
  {
    id: 'rt-1',
    taskId: '1234567890',
    taskName: '算网应用名',
    taskType: '大模型训练',
    prefer: '费用优先',
    startTime: '2026/03/04',
    elapsedSec: 11 * 3600 + 11 * 60 + 51,
    stepIndex: 2,
    progressDone: 100,
    progressTotal: 1000,
    appName: '长延迟智算产品1',
    appVersion: 'V2.0',
    appType: '训练类',
    appDesc:
      '面向长周期训练任务的智算应用，支持多卡分布式训练与绿电调度策略，当前任务正在运行中。',
  },
  {
    id: 'rt-2',
    taskId: '2234567891',
    taskName: '电力语音客服推理',
    taskType: '模型推理',
    prefer: '时间优先',
    startTime: '2026/03/05',
    elapsedSec: 2 * 3600 + 35 * 60 + 12,
    stepIndex: 2,
    progressDone: 420,
    progressTotal: 500,
    appName: '电力语音客服',
    appVersion: 'V1.0',
    appType: '推理类',
    appDesc: '基于语音识别与大模型问答的电力客服推理任务，支持多路并发。',
  },
  {
    id: 'rt-3',
    taskId: '3234567892',
    taskName: '目标识别训练任务',
    taskType: '大模型训练',
    prefer: '低碳优先',
    startTime: '2026/03/03',
    elapsedSec: 26 * 3600 + 8 * 60 + 3,
    stepIndex: 3,
    progressDone: 2000,
    progressTotal: 2000,
    appName: '目标识别产品',
    appVersion: 'V1.2',
    appType: '训练类',
    appDesc: 'YOLO 系列目标检测训练任务，已完成全部样本训练。',
  },
];

export const runtimeModels: RuntimeFileRow[] = [
  {
    id: 'MX-1',
    name: 'yolo11n_train',
    type: '训练模型',
    fileName: 'yolo11n_v2.zip',
    uploadedAt: '2026-03-04 09:12:33',
  },
  {
    id: 'MX-2',
    name: 'yolo11n_ckpt',
    type: '检查点',
    fileName: 'ckpt_epoch10.pt',
    uploadedAt: '2026-03-04 14:20:01',
  },
];

export const runtimeMaterials: RuntimeFileRow[] = [
  {
    id: 'SC-1',
    name: '机巡缺陷识别样本集',
    type: 'AI训练',
    fileName: 'jixun_2026.zip',
    uploadedAt: '2026-01-27 10:37:04',
  },
  {
    id: 'SC-2',
    name: '安全帽佩戴图片集',
    type: 'AI训练',
    fileName: 'helmet_v1.zip',
    uploadedAt: '2026-01-25 09:20:11',
  },
];

/** 简易折线 mock（百分比序列） */
export function buildSeries(seed: number, len = 24): number[] {
  const arr: number[] = [];
  let v = 20 + (seed % 30);
  for (let i = 0; i < len; i++) {
    v += Math.sin(i / 2 + seed) * 8 + ((seed * i) % 7) - 3;
    v = Math.max(5, Math.min(98, v));
    arr.push(Math.round(v * 10) / 10);
  }
  return arr;
}

export function formatElapsed(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
