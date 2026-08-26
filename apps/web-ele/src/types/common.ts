/**
 * 统一图片上传接口 data（POST /upload）
 */
export interface UploadImageResult {
  /** 图片访问 URL */
  url: string;
  /** 文件名 */
  fileName?: string;
  /** 对象存储主键 */
  ossId?: string;
}
