import type { UploadImageResult } from '#/types/common';

import { rootRequestClient } from '#/api/request';

/**
 * 统一图片上传（multipart/form-data，字段名 file）
 * 开发态走 Apifox Mock：POST /mock/upload
 * 正式接口：POST /upload
 * @param file 图片文件
 * @returns 含 url / fileName / ossId 的业务 data
 */
export async function uploadImageApi(file: Blob | File) {
  return rootRequestClient.upload<UploadImageResult>('/mock/upload', {
    file,
  });
  // return rootRequestClient.upload<UploadImageResult>('/upload', { file });
}
