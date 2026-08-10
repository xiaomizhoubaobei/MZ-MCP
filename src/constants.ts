/**
 * @fileoverview 常量配置模块
 * @author xiaomizhou111
 * @date 2026-02-10
 * @since 2026-02-10
 * @contact 2923597244@qq.com
 * @LICENSE AGPL-3.0 license
 * @remark 本模块定义华为云 OCR 服务的常量配置，包括 API 端点、项目 ID、超时时间、字符限制和图片大小限制等
 */

/** 华为云 OCR 服务地域，默认为 cn-east-3（华东-上海） */
export const REGION = process.env.HUAWEI_OCR_REGION || "cn-east-3";

/** 华为云项目 ID，用户需通过环境变量 HUAWEI_OCR_PROJECT_ID 提供 */
export const PROJECT_ID = process.env.HUAWEI_OCR_PROJECT_ID;

/** 通过地域拼接获得完整的 API 端点 */
export const API_ENDPOINT = `https://ocr.${REGION}.myhuaweicloud.com`;

/** API 请求超时时间（毫秒） */
export const REQUEST_TIMEOUT = 30000;

/** OCR 结果字符限制 */
export const CHARACTER_LIMIT = 25000;

/** 图片最大大小（字节） */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** 图片最大大小（MB） */
export const MAX_IMAGE_SIZE_MB = 10;
