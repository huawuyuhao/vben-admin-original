/** 智算任务算力计量 mock */

export interface ComputeMeterTask {
  id: string;
  name: string;
  type: '批处理' | '推理' | '训练';
  status: '已完成' | '暂停' | '计量中';
  gpus: number;
  gpuUtil: number;
  vramUtil: number;
  throughput: string;
  io: string;
  cumulative: string;
  duration: string;
  startTime: string;
  endTime: string;
}

export const computeMeterTasks: ComputeMeterTask[] = [
  {
    id: 'CM-20260312-01',
    name: 'LLM-SFT-70B-贵阳',
    type: '训练',
    status: '计量中',
    gpus: 64,
    gpuUtil: 86,
    vramUtil: 78,
    throughput: '72.4 PFLOPS',
    io: '1.8 GB/s',
    cumulative: '486.2 PFLOPS·h',
    duration: '6h 42m',
    startTime: '2026-03-12 08:20',
    endTime: '-',
  },
  {
    id: 'CM-20260312-02',
    name: '客服推理服务池',
    type: '推理',
    status: '计量中',
    gpus: 12,
    gpuUtil: 54,
    vramUtil: 61,
    throughput: '9.6 PFLOPS',
    io: '420 MB/s',
    cumulative: '128.5 PFLOPS·h',
    duration: '13h 20m',
    startTime: '2026-03-11 22:00',
    endTime: '-',
  },
  {
    id: 'CM-20260311-08',
    name: '巡检模型微调',
    type: '训练',
    status: '已完成',
    gpus: 16,
    gpuUtil: 81,
    vramUtil: 72,
    throughput: '18.2 PFLOPS',
    io: '960 MB/s',
    cumulative: '214.8 PFLOPS·h',
    duration: '11h 48m',
    startTime: '2026-03-11 02:10',
    endTime: '2026-03-11 13:58',
  },
  {
    id: 'CM-20260311-05',
    name: '文档解析批处理',
    type: '批处理',
    status: '已完成',
    gpus: 4,
    gpuUtil: 68,
    vramUtil: 55,
    throughput: '3.1 PFLOPS',
    io: '1.2 GB/s',
    cumulative: '36.4 PFLOPS·h',
    duration: '4h 15m',
    startTime: '2026-03-11 09:00',
    endTime: '2026-03-11 13:15',
  },
  {
    id: 'CM-20260310-12',
    name: '边缘推理压测',
    type: '推理',
    status: '暂停',
    gpus: 8,
    gpuUtil: 0,
    vramUtil: 12,
    throughput: '-',
    io: '-',
    cumulative: '52.0 PFLOPS·h',
    duration: '2h 06m',
    startTime: '2026-03-10 16:40',
    endTime: '-',
  },
  {
    id: 'CM-20260309-03',
    name: 'Pretrain-13B-安顺',
    type: '训练',
    status: '已完成',
    gpus: 32,
    gpuUtil: 88,
    vramUtil: 84,
    throughput: '41.5 PFLOPS',
    io: '1.4 GB/s',
    cumulative: '612.7 PFLOPS·h',
    duration: '14h 45m',
    startTime: '2026-03-09 01:00',
    endTime: '2026-03-09 15:45',
  },
];

/** 选中任务时的时序指标（示例） */
export const meterSeries = {
  times: ['08:20', '09:20', '10:20', '11:20', '12:20', '13:20', '14:20'],
  gpuUtil: [62, 78, 85, 88, 84, 90, 86],
  throughput: [48, 61, 70, 74, 71, 76, 72],
  vramUtil: [55, 68, 74, 79, 77, 80, 78],
  io: [0.9, 1.2, 1.6, 1.9, 1.7, 2.0, 1.8],
  cumulative: [42, 98, 168, 248, 332, 410, 486],
};
