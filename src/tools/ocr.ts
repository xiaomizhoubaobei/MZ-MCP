/**
 * @fileoverview OCR 工具注册模块
 * @author xiaomizhou111
 * @date 2026-02-10
 * @since 2026-02-10
 * @contact 2923597244@qq.com
 * @LICENSE AGPL-3.0 license
 * @remark 本模块注册 OCR 相关的 MCP 工具，包括通用文本识别功能，支持 Markdown 和 JSON 两种输出格式
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RecognizeGeneralTextInputSchema } from "../schemas/ocr.js";
import { huaweiOcrClient } from "../services/huaweiClient.js";
import { ResponseFormat, type OcrResult, type OcrMetadata } from "../types.js";
import { CHARACTER_LIMIT } from "../constants.js";

/**
 * 注册 OCR 相关的 MCP 工具
 * @param {McpServer} server - MCP 服务器实例
 * @returns {void}
 */
export function registerOcrTools(server: McpServer): void {
  server.registerTool(
    "huawei_ocr_recognize_general_text",
    {
      title: "华为云 OCR - 通用文本识别",
      description: `使用华为云 OCR 服务从图像中识别通用文本。

此工具对图像执行光学字符识别（OCR）以提取文本内容。它支持多种图像格式（JPG、PNG、BMP、GIF、TIFF、WEBP、PCX、ICO、PSD、PDF），可以处理各种文本类型，包括印刷文本和一些手写文本。

参数:
  - image (string): Base64 编码的图像数据（如果未提供 url 则必需）。图片大小不超过 10MB，建议不超过 7MB
  - url (string): 图像的公开 URL（image 参数的替代选项）。支持公网 http/https URL 和 OBS URL
  - detect_direction (boolean): 是否校正图片的倾斜角度（默认：false）
  - quick_mode (boolean): 快速模式开关，针对单行文字图片（默认：false）
  - character_mode (boolean): 单字符模式开关（默认：false）
  - language (string): 语种选择，默认为中英文识别模式。可选值：'zh'（中英文）、'en'（英文）、'ja'（日语）、'ko'（韩语）、'auto'（自动）等
  - single_orientation_mode (boolean): 单朝向模式开关（默认：false）
  - pdf_page_number (number): 指定 PDF 页码识别（默认：第1页）
  - return_markdown_result (boolean): 是否返回文字块拼接结果（默认：false）
  - response_format ('markdown' | 'json'): 输出格式（默认：'markdown'）

返回:
  对于 JSON 格式：具有以下架构的结构化数据：
  {
    "result": {
      "direction": number,
      "words_block_count": number,
      "words_block_list": [
        {
          "words": string,
          "confidence": number,
          "location": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
          "char_list": [
            {
              "char": string,
              "char_location": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
              "char_confidence": number
            }
          ]
        }
      ],
      "markdown_result": string
    },
    "metadata": {
      "total_characters": number,
      "total_lines": number,
      "processing_time_ms": number
    }
  }

示例:
  - 使用场景: "从这张收据图像中提取文本" -> 参数 image="/9j/4AAQSkZJRgABAgEASABIAAD/4RFZRXhpZgAATU0AKgAAAA..."
  - 使用场景: "读取此截图中的文本" -> 参数 url="https://BucketName.obs.xxxx.com/ObjectName"
  - 使用场景: "识别日语文本" -> 参数 image="base64...", language="ja"
  - 使用场景: "校正倾斜图片的文本" -> 参数 image="base64...", detect_direction=true
  - 不使用场景: 图像不包含文本或已损坏

错误处理:
  - 如果凭证无效，返回 "Error: 认证失败 (401)"
  - 如果图像格式不支持，返回 "Error: 无效请求 (400)"
  - 如果请求过多，返回 "Error: 超出速率限制 (429)"`,
      inputSchema: RecognizeGeneralTextInputSchema,
      annotations: {
        title: "通用文本识别",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const startTime = Date.now();
        const result = await huaweiOcrClient.recognizeGeneralText(params);
        const processingTime = Date.now() - startTime;

        const metadata: OcrMetadata = {
          total_characters: result.words_block_list.reduce((sum, block) => sum + block.words.length, 0),
          total_lines: result.words_block_count,
          processing_time_ms: processingTime
        };

        let output: string;
        
        if (params.response_format === ResponseFormat.MARKDOWN) {
          output = formatMarkdownOutput(result, metadata);
        } else {
          output = formatJsonOutput(result, metadata);
        }

        if (output.length > CHARACTER_LIMIT) {
          output = truncateOutput(output);
        }

        return {
          content: [{ type: "text", text: output }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: formatError(error) }]
        };
      }
    }
  );
}

/**
 * 将 OCR 结果格式化为 Markdown 格式
 * @param {OcrResult} result - OCR 识别结果
 * @param {OcrMetadata} metadata - 处理元数据
 * @returns {string} Markdown 格式的字符串
 */
function formatMarkdownOutput(result: OcrResult, metadata: OcrMetadata): string {
  const lines: string[] = [];

  lines.push("# OCR 识别结果\n");

  // 显示图片朝向信息
  if (result.direction !== undefined && result.direction !== -1) {
    lines.push(`## 图片朝向\n`);
    lines.push(`图片逆时针旋转角度：${result.direction}°\n`);
  }

  // 显示 markdown_result（如果存在）
  if (result.markdown_result) {
    lines.push("## 识别结果\n");
    lines.push(result.markdown_result);
  } else {
    // 逐块显示
    lines.push("## 检测到的文本\n");

    if (result.words_block_list.length > 0) {
      result.words_block_list.forEach((block, index) => {
        const confidence = block.confidence !== undefined ? ` (置信度: ${(block.confidence * 100).toFixed(1)}%)` : "";
        lines.push(`${index + 1}. ${block.words}${confidence}`);
      });
    } else {
      lines.push("图像中未检测到文本。");
    }
  }

  lines.push("\n## 元数据\n");
  lines.push(`- **总字符数**: ${metadata.total_characters}`);
  lines.push(`- **总行数**: ${metadata.total_lines}`);
  lines.push(`- **处理时间**: ${(metadata.processing_time_ms / 1000).toFixed(2)}秒`);

  return lines.join("\n");
}

/**
 * 将 OCR 结果格式化为 JSON 格式
 * @param {OcrResult} result - OCR 识别结果
 * @param {OcrMetadata} metadata - 处理元数据
 * @returns {string} JSON 格式的字符串
 */
function formatJsonOutput(result: OcrResult, metadata: OcrMetadata): string {
  return JSON.stringify({ result, metadata }, null, 2);
}

/**
 * 格式化错误信息
 * @param {unknown} error - 错误对象
 * @returns {string} 格式化的错误消息
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return `错误：发生意外错误：${String(error)}`;
}

/**
 * 截断输出字符串以符合字符限制
 * @param {string} output - 原始输出字符串
 * @returns {string} 截断后的字符串
 */
function truncateOutput(output: string): string {
  const truncated = output.substring(0, CHARACTER_LIMIT - 100);
  return `${truncated}\n\n[注意：由于字符限制，输出已被截断]`;
}