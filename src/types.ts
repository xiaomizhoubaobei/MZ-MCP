/**
 * @fileoverview 类型定义模块
 * @author xiaomizhou111
 * @date 2026-02-10
 * @since 2026-02-10
 * @contact 2923597244@qq.com
 * @LICENSE AGPL-3.0 license
 * @remark 本模块定义 OCR 服务相关的 TypeScript 类型接口，包括响应格式、输入参数、输出结果等
 */
/**
 * OCR 响应格式类型
 */
export enum ResponseFormat {
  /** Markdown 格式，适合人类阅读 */
  MARKDOWN = "markdown",
  /** JSON 格式，适合机器处理 */
  JSON = "json"
}

/**
 * OCR 通用文本识别输入参数接口
 */
export interface RecognizeGeneralTextInput {
  /** Base64 编码的图片数据（与 url 二选一） */
  image?: string;
  /** 图片的公开 URL（与 image 二选一） */
  url?: string;
  /** 是否校正图片的倾斜角度 */
  detect_direction?: boolean;
  /** 快速模式开关，针对单行文字图片 */
  quick_mode?: boolean;
  /** 单字符模式开关 */
  character_mode?: boolean;
  /** 语种选择 */
  language?: string;
  /** 单朝向模式开关 */
  single_orientation_mode?: boolean;
  /** 指定 PDF 页码识别 */
  pdf_page_number?: number;
  /** 是否返回文字块拼接结果 */
  return_markdown_result?: boolean;
  /** 响应格式，默认为 Markdown */
  response_format?: ResponseFormat;
}

/**
 * 单字符识别结果接口
 */
export interface GeneralTextCharList {
  /** 单字符识别结果 */
  char: string;
  /** 单字符的区域位置信息，包含字符区域四个顶点的二维坐标 */
  char_location?: Array<Array<number>>;
  /** 单字符识别结果的置信度 */
  char_confidence?: number;
}

/**
 * 识别到的文本块接口
 */
export interface WordsBlock {
  /** 识别出的文本内容 */
  words: string;
  /** 文字块的区域位置信息，包含文字区域四个顶点的二维坐标 */
  location?: Array<Array<number>>;
  /** 置信度分数（0-1 之间） */
  confidence?: number;
  /** 文字块对应的单字符识别列表 */
  char_list?: GeneralTextCharList[];
}

/**
 * OCR 识别结果接口
 */
export interface OcrResult {
  /** 图片朝向，当 detect_direction 为 true 时有效 */
  direction?: number;
  /** 识别到的文本块数量 */
  words_block_count: number;
  /** 识别到的文本块列表 */
  words_block_list: WordsBlock[];
  /** 所有文字块拼接的识别结果 */
  markdown_result?: string;
}

/**
 * OCR 处理元数据接口
 */
export interface OcrMetadata {
  /** 识别到的总字符数 */
  total_characters: number;
  /** 识别到的总行数 */
  total_lines: number;
  /** 处理耗时（毫秒） */
  processing_time_ms: number;
}

/**
 * OCR 完整响应接口
 */
export interface OcrResponse {
  /** OCR 识别结果 */
  result: OcrResult;
  /** 处理元数据 */
  metadata: OcrMetadata;
}