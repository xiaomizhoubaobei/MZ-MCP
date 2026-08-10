/**
 * @fileoverview 华为云 OCR 客户端模块
 * @author xiaomizhou111
 * @date 2026-02-10
 * @since 2026-02-10
 * @contact 2923597244@qq.com
 * @LICENSE AGPL-3.0 license
 * @remark 本模块提供华为云 OCR 服务的客户端实现，包括通用文本识别功能和错误处理
 */
import { OcrClient } from "@huaweicloud/huaweicloud-sdk-ocr";
import { BasicCredentials } from "@huaweicloud/huaweicloud-sdk-core";
import { RecognizeGeneralTextRequest, GeneralTextRequestBody } from "@huaweicloud/huaweicloud-sdk-ocr";
import { API_ENDPOINT, PROJECT_ID } from "../constants.js";
import type { RecognizeGeneralTextInput, OcrResult } from "../types.js";

export class HuaweiOcrClient {
  private client: OcrClient;

  /**
 * 构造函数：初始化华为云 OCR 客户端
 * @throws {Error} 当环境变量 CLOUD_SDK_AK、CLOUD_SDK_SK 或 HUAWEI_OCR_PROJECT_ID 未设置时抛出错误
 */
constructor() {
    const ak = process.env.CLOUD_SDK_AK;
    const sk = process.env.CLOUD_SDK_SK;

    if (!ak || !sk) {
      throw new Error("需要设置 CLOUD_SDK_AK 和 CLOUD_SDK_SK 环境变量");
    }

    if (!PROJECT_ID) {
      throw new Error("需要设置 HUAWEI_OCR_PROJECT_ID 环境变量");
    }

    const credentials = new BasicCredentials()
      .withAk(ak)
      .withSk(sk)
      .withProjectId(PROJECT_ID);

    this.client = OcrClient.newBuilder()
      .withCredential(credentials)
      .withEndpoint(API_ENDPOINT)
      .build();
  }

  /**
 * 调用华为云 OCR 服务进行通用文本识别
 * @param {RecognizeGeneralTextInput} params - OCR 识别参数，包含图片数据或图片 URL
 * @returns {Promise<OcrResult>} OCR 识别结果，包含文本块列表和置信度信息
 * @throws {Error} 当参数无效或 OCR 服务调用失败时抛出错误
 */
async recognizeGeneralText(params: RecognizeGeneralTextInput): Promise<OcrResult> {
    const request = new RecognizeGeneralTextRequest();
    const body = new GeneralTextRequestBody();

    if (params.image) {
      body.withImage(params.image);
    } else if (params.url) {
      body.withUrl(params.url);
    } else {
      throw new Error("必须提供 image 或 url 参数");
    }

    // 设置可选参数
    if (params.detect_direction !== undefined) {
      body.withDetectDirection(params.detect_direction);
    }
    if (params.quick_mode !== undefined) {
      body.withQuickMode(params.quick_mode);
    }
    if (params.character_mode !== undefined) {
      body.withCharacterMode(params.character_mode);
    }
    if (params.language) {
      body.withLanguage(params.language);
    }
    if (params.single_orientation_mode !== undefined) {
      body.withSingleOrientationMode(params.single_orientation_mode);
    }
    if (params.pdf_page_number !== undefined) {
      body.withPdfPageNumber(params.pdf_page_number);
    }
    if (params.return_markdown_result !== undefined) {
      body.withReturnMarkdownResult(params.return_markdown_result);
    }

    request.withBody(body);

    try {
      const response = await this.client.recognizeGeneralText(request);
      const result = response.result;
      if (!result) {
        throw new Error("OCR 服务未返回结果");
      }
      return {
        direction: result.direction,
        words_block_count: result.wordsBlockList?.length || 0,
        words_block_list: result.wordsBlockList?.map((block: any) => ({
          words: block.words || "",
          location: block.location,
          confidence: block.confidence,
          char_list: block.charList?.map((char: any) => ({
            char: char.char || "",
            char_location: char.charLocation,
            char_confidence: char.charConfidence
          })) || []
        })) || [],
        markdown_result: result.markdownResult
      };
    } catch (error) {
      throw this.handleHuaweiError(error);
    }
  }

  /**
 * 处理华为云 OCR 服务返回的错误
 * @param {unknown} error - 原始错误对象
 * @returns {Error} 格式化后的错误对象，包含详细的错误描述
 * @private
 */
private handleHuaweiError(error: unknown): Error {
    if (error instanceof Error) {
      const err = error as any;

      // 处理华为云 OCR 服务的特定错误码
      if (err.error_code) {
        const errorCode = err.error_code;
        const errorMsg = err.error_msg || '未知错误';

        switch (errorCode) {
          // 文字识别错误码
          case 'AIS.0101':
            return new Error(`输入参数不符合规范 (AIS.0101): ${errorMsg}。请检查 image 和 url 参数是否二选一，不要同时填写。`);
          case 'AIS.0102':
            return new Error(`图片格式不支持 (AIS.0102): ${errorMsg}。请检查图片格式，支持 JPEG、JPG、PNG、BMP、GIF、TIFF、WEBP、PCX、ICO、PSD、PDF 格式。`);
          case 'AIS.0103':
            return new Error(`图片尺寸不满足要求 (AIS.0103): ${errorMsg}。图片最短边不小于15px，最长边不超过30000px。`);
          case 'AIS.0104':
            return new Error(`非支持的图片类型或图片质量差 (AIS.0104): ${errorMsg}。请检查图片类型与图片质量。`);
          case 'AIS.0105':
            return new Error(`算法计算失败 (AIS.0105): ${errorMsg}。请联系华为云支持人员。`);
          case 'AIS.0117':
            return new Error(`输入ID不存在 (AIS.0117): ${errorMsg}。请检查入参中的 classifier_id 或 template_id 是否存在。`);
          case 'AIS.0118':
            return new Error(`服务请求错误或税局机关接口故障 (AIS.0118): ${errorMsg}。请等待税局机关接口恢复（建议2小时后重试）。`);
          case 'AIS.0119':
            return new Error(`模板匹配失败 (AIS.0119): ${errorMsg}。请检查模板中的参照字段是否与输入图片匹配。`);
          case 'AIS.0120':
            return new Error(`图片分类失败 (AIS.0120): ${errorMsg}。请检查分类器中模板是否与输入图片匹配。`);
          case 'AIS.0121':
            return new Error(`模板未配置识别区 (AIS.0121): ${errorMsg}。请检查模板是否配置了识别区。`);
          case 'AIS.0122':
            return new Error(`存在两张及以上同面身份证 (AIS.0122): ${errorMsg}。请检查输入图片是否存在两张及以上同面身份证。`);

          // 平台错误码 - Token 相关
          case 'ModelArts.0203':
            return new Error(`非法 Token (ModelArts.0203): ${errorMsg}。请检查 Token 是否正确。`);
          case 'ModelArts.4101':
            return new Error(`Token 为空 (ModelArts.4101): ${errorMsg}。发送的 HTTP 请求 header 中没有带 x-auth-token。`);
          case 'ModelArts.4102':
            return new Error(`解析 Token 失败 (ModelArts.4102): ${errorMsg}。请检查发送的请求和 token。`);
          case 'ModelArts.4103':
            return new Error(`Token 不合法 (ModelArts.4103): ${errorMsg}。请检查发送的请求和 token。`);
          case 'ModelArts.4104':
            return new Error(`请求 body 体长度不合法 (ModelArts.4104): ${errorMsg}。Base64 编码后大小不超过 10MB。`);
          case 'ModelArts.4105':
            return new Error(`请求 body 体 JSON 格式不对 (ModelArts.4105): ${errorMsg}。请检查请求 body 体是否符合 JSON 格式。`);
          case 'ModelArts.4106':
            return new Error(`用户账号受限 (ModelArts.4106): ${errorMsg}。请检查用户资源状态。`);
          case 'ModelArts.4107':
            return new Error(`获取用户临时 AK、SK 异常 (ModelArts.4107): ${errorMsg}。请联系华为云支持人员。`);

          // 平台错误码 - 权限和服务相关
          case 'ModelArts.4201':
            return new Error(`请求 url 中需要包含服务 ID (ModelArts.4201): ${errorMsg}。请检查请求 url 中的服务 ID。`);
          case 'ModelArts.4202':
            return new Error(`请求 url 格式不合法 (ModelArts.4202): ${errorMsg}。请检查请求 url 格式。`);
          case 'ModelArts.4203':
            return new Error(`没有权限访问 (ModelArts.4203): ${errorMsg}。请检查访问权限。`);
          case 'ModelArts.4204':
            return new Error(`服务未开通 (ModelArts.4204): ${errorMsg}。请前往文字识别控制台开通需要调用的 API。`);

          // 平台错误码 - 服务异常
          case 'ModelArts.4301':
          case 'ModelArts.4302':
          case 'ModelArts.4401':
          case 'ModelArts.4402':
          case 'ModelArts.4403':
          case 'ModelArts.4502':
          case 'ModelArts.4503':
          case 'ModelArts.4504':
          case 'ModelArts.4505':
          case 'ModelArts.4506':
          case 'ModelArts.4508':
            return new Error(`服务异常 (${errorCode}): ${errorMsg}。请联系华为云支持人员。`);

          // 平台错误码 - 文件下载相关
          case 'ModelArts.4601':
            return new Error(`外网下载地址不合法 (ModelArts.4601): ${errorMsg}。请检查输入的 url 下载地址参数格式。`);
          case 'ModelArts.4603':
            return new Error(`下载外网 URL 文件失败 (ModelArts.4603): ${errorMsg}。请检查网络与 URL。`);

          // 平台错误码 - OBS 相关
          case 'ModelArts.4702':
            return new Error(`查询 OBS 委托失败 (ModelArts.4702): ${errorMsg}。请检查是否已开通服务的 OBS 委托。`);
          case 'ModelArts.4703':
            return new Error(`OBS 地址不合法 (ModelArts.4703): ${errorMsg}。请检查 OBS 地址。`);
          case 'ModelArts.4704':
            return new Error(`获取 OBS 文件失败 (ModelArts.4704): ${errorMsg}。请检查 OBS 文件。`);
          case 'ModelArts.4705':
            return new Error(`OBS 文件大小超限 (ModelArts.4705): ${errorMsg}。请检查 OBS 文件大小。`);
          case 'ModelArts.4706':
            return new Error(`OBS 文件不存在 (ModelArts.4706): ${errorMsg}。请检查对应的文件是否存在。`);

          // 平台错误码 - 账户相关
          case 'ModelArts.6201':
            return new Error(`用户账户被冻结 (ModelArts.6201): ${errorMsg}。请检查账户是否被冻结，并完成充值。`);

          // APIG 错误码
          case 'APIG.0101':
            return new Error(`访问的 API 不存在或尚未在环境中发布 (APIG.0101): ${errorMsg}。请检查 API 的 URL 是否拼写正确。`);
          case 'APIG.0201':
            return new Error(`请求超时 (APIG.0201): ${errorMsg}。请检查原调用请求是否过于频繁，或图片过大。`);
          case 'APIG.0301':
            return new Error(`IAM 身份验证信息不正确 (APIG.0301): ${errorMsg}。请检查 AK/SK 是否正确，或 token 是否过期。`);
          case 'APIG.0308':
            return new Error(`超出速率限制 (APIG.0308): ${errorMsg}。请参考调用 API 时提示的解决方案。`);

          default:
            return new Error(`OCR 服务错误 (${errorCode}): ${errorMsg}`);
        }
      }

      // 处理 HTTP 状态码错误
      if (err.httpStatusCode) {
        const status = err.httpStatusCode;
        switch (status) {
          case 400:
            return new Error(`无效请求 (400): ${err.message || '输入参数不符合规范'}. 请检查 image 和 url 参数是否二选一。`);
          case 401:
            return new Error(`认证失败 (401): ${err.message || '无效的凭证'}. 请检查 CLOUD_SDK_AK 和 CLOUD_SDK_SK 环境变量。`);
          case 403:
            return new Error(`权限被拒绝 (403): ${err.message || '无法访问 OCR 服务'}. 请检查您的 IAM 权限。`);
          case 429:
            return new Error(`超出速率限制 (429): ${err.message || '请求过多'}. 请稍后再试。`);
          case 500:
            return new Error(`内部服务器错误 (500): ${err.message || '华为云服务错误'}. 请稍后重试。`);
          default:
            return new Error(`OCR 请求失败 (${status}): ${err.message}`);
        }
      }

      // 处理超时和连接错误
      if (error.message.includes('timeout')) {
        return new Error(`请求超时: ${error.message}. 请尝试使用较小的图像或检查网络连接。`);
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
        return new Error(`连接错误: ${error.message}. 请检查您的网络连接。`);
      }
    }
    return new Error(`意外错误: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const huaweiOcrClient = new HuaweiOcrClient();
