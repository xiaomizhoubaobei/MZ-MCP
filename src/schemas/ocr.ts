/**
 * @fileoverview OCR 相关 Schema 定义模块
 * @author xiaomizhou111
 * @date 2026-02-10
 * @since 2026-02-10
 * @contact 2923597244@qq.com
 * @LICENSE AGPL-3.0 license
 * @remark 本模块定义 OCR 服务的输入参数验证 schema，使用 Zod 进行运行时类型检查
 */
import { z } from "zod";
import { ResponseFormat } from "../types.js";

export const RecognizeGeneralTextInputSchema = z.object({
  image: z.string()
    .min(1, "图像数据是必需的")
    .optional()
    .describe("用于 OCR 识别的 Base64 编码图像数据（与 url 二选一）"),
  url: z.string()
    .url("无效的 URL 格式")
    .optional()
    .describe("图像的公开 URL（与 image 二选一）"),
  detect_direction: z.boolean()
    .optional()
    .describe("是否校正图片的倾斜角度"),
  quick_mode: z.boolean()
    .optional()
    .describe("快速模式开关，针对单行文字图片"),
  character_mode: z.boolean()
    .optional()
    .describe("单字符模式开关"),
  language: z.string()
    .optional()
    .describe("语种选择，如 'zh'（中英文）、'en'（英文）、'ja'（日语）等"),
  single_orientation_mode: z.boolean()
    .optional()
    .describe("单朝向模式开关"),
  pdf_page_number: z.number()
    .int()
    .positive()
    .optional()
    .describe("指定 PDF 页码识别"),
  return_markdown_result: z.boolean()
    .optional()
    .describe("是否返回文字块拼接结果"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("输出格式：'markdown' 适合人类阅读，'json' 适合机器处理")
}).strict().refine(
  (data) => data.image || data.url,
  {
    message: "必须提供 image 或 url 参数"
  }
);
