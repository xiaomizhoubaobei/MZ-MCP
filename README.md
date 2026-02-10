# MZ-MCP - 华为云 OCR MCP 服务器

一个基于 Model Context Protocol (MCP) 的服务器，通过华为云 OCR 服务提供光学字符识别（OCR）功能。

## 功能特性

- **通用文本识别**：从图像中提取文本，支持多种格式（JPG、PNG、BMP、GIF、TIFF、WEBP、PCX、ICO、PSD、PDF）
- **倾斜校正**：自动检测并校正图片的倾斜角度
- **多语言支持**：支持 30 多种语言的文字识别，包括中文、英文、日语、韩语等
- **快速模式**：针对单行文字图片提供快速识别
- **单字符模式**：返回字符级别的详细信息
- **PDF 支持**：支持多页 PDF 文件的文字识别
- **双输出格式**：支持人类可读的 Markdown 格式和机器可读的 JSON 格式
- **完善的错误处理**：为各种故障场景提供清晰、可操作的错误消息
- **输入验证**：基于 Zod 的运行时参数验证
- **STDIO 传输**：通过标准输入/输出通信，易于集成

## 前置要求

- Node.js >= 18
- 华为云账号，已开通 OCR 服务
- (参考此文档获取AKK)[https://support.huaweicloud.com/intl/zh-cn/devg-apisign/api-sign-provide-aksk.html]
- (参考此文档获取Endpoint)[https://support.huaweicloud.com/intl/zh-cn/api-ocr/ocr_03_0062.html]
- (参考是文档获取项目ID)[https://support.huaweicloud.com/intl/zh-cn/api-ocr/ocr_03_0130.html]

## 安装

### 通过 npx 使用（推荐）

无需安装，直接使用：

```bash
npx -y mz-mcp
```

### 本地安装

```bash
npm install mz-mcp-beta
```

## 配置

### 环境变量

配置以下必需的环境变量：

| 环境变量 | 必需 | 说明 |
|---------|------|------|
| `CLOUD_SDK_AK` | 是 | 华为云访问密钥 ID |
| `CLOUD_SDK_SK` | 是 | 华为云秘密访问密钥 |
| `HUAWEI_OCR_PROJECT_ID` | 是 | 华为云项目 ID |
| `HUAWEI_OCR_REGION` | 否 | 服务地域，默认为 `cn-east-3`（华东-上海） |

### MCP 客户端配置

将此服务器添加到您的 MCP 客户端配置中：

```json
{
  "mcpServers": {
    "huawei-ocr": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "mz-mcp"
      ],
      "env": {
        "CLOUD_SDK_AK": "your_access_key",
        "CLOUD_SDK_SK": "your_secret_key",
        "HUAWEI_OCR_PROJECT_ID": "your_project_id",
        "HUAWEI_OCR_REGION": "cn-east-3"
      }
    }
  }
}
```

### 支持的服务地域

| 区域代码 | 区域名称 |
|---------|---------|
| `cn-north-4` | 华北-北京四 |
| `cn-east-3` | 华东-上海 |
| `cn-south-1` | 华南-广州 |
| `ap-southeast-1` | 中国-香港 |

## 开发

### 克隆仓库

```bash
git clone https://github.com/xiaomizhoubaobei/MZ-MCP.git
cd MZ-MCP
```

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入您的华为云凭证
```

### 构建

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

### 生产模式

```bash
npm start
```

## 工具

### `huawei_ocr_recognize_general_text`

从图像中识别通用文本。

#### 参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `image` | string | 否* | Base64 编码的图像数据（与 url 二选一） |
| `url` | string | 否* | 图像的公开 URL（与 image 二选一） |
| `detect_direction` | boolean | 否 | 是否校正图片的倾斜角度（默认：false） |
| `quick_mode` | boolean | 否 | 快速模式开关，针对单行文字图片（默认：false） |
| `character_mode` | boolean | 否 | 单字符模式开关（默认：false） |
| `language` | string | 否 | 语种选择，默认为中英文识别模式 |
| `single_orientation_mode` | boolean | 否 | 单朝向模式开关（默认：false） |
| `pdf_page_number` | number | 否 | 指定 PDF 页码识别（默认：第1页） |
| `return_markdown_result` | boolean | 否 | 是否返回文字块拼接结果（默认：false） |
| `response_format` | 'markdown' \| 'json' | 否 | 输出格式（默认：'markdown'） |

*必须提供 `image` 或 `url` 中的一个。

#### 支持的语种

| 语种代码 | 语言名称 |
|---------|---------|
| `auto` | 自动语种分类 |
| `zh` | 中英文 |
| `en` | 英文 |
| `ja` | 日语 |
| `ko` | 韩语 |
| `ru` | 俄语 |
| `de` | 德语 |
| `fr` | 法语 |
| `es` | 西班牙语 |
| `pt` | 葡萄牙语 |
| `it` | 意大利语 |
| `ar` | 阿拉伯语 |
| `th` | 泰语 |
| `vi` | 越南语 |
| `id` | 印尼语 |
| `ms` | 马来语 |
| `hi` | 印地语 |
| `uk` | 乌克兰语 |
| `tr` | 土耳其语 |
| `no` | 挪威语 |
| `da` | 丹麦语 |
| `sv` | 瑞典语 |
| `km` | 柬埔寨语 |
| `he` | 希伯来语 |

#### 图像格式要求

- **支持格式**：JPEG、JPG、PNG、BMP、GIF、TIFF、WEBP、PCX、ICO、PSD、PDF
- **图片大小**：Base64 编码后不超过 10MB，建议不超过 7MB
- **图片尺寸**：最短边不小于 15px，最长边不超过 30000px
- **URL 要求**：支持公网 http/https URL 和 OBS URL

#### 使用示例

在支持 MCP 的 AI 助手中，您可以直接通过自然语言使用此工具：

**示例 1：识别图片中的文字**

```
用户：请帮我识别这张图片中的文字
```

AI 助手会自动调用 `huawei_ocr_recognize_general_text` 工具，传入图片数据，返回识别结果。

**示例 2：识别日语文本**

```
用户：这张图片是日文的，帮我识别一下内容
```

AI 助手会自动设置 `language: "ja"` 参数进行日语识别。

**示例 3：识别 PDF 文档**

```
用户：请读取这个 PDF 文件的第 3 页内容
```

AI 助手会自动设置 `pdf_page_number: 3` 参数识别指定页面。

**示例 4：校正倾斜图片**

```
用户：这张图片有点歪，帮我识别里面的文字
```

AI 助手会自动设置 `detect_direction: true` 参数进行倾斜校正。

**示例 5：快速识别单行文字**

```
用户：这是车牌号，快速识别一下
```

AI 助手会自动设置 `quick_mode: true` 参数进行快速识别。

#### 输出格式

**Markdown 格式：**
```markdown
# OCR 识别结果

## 检测到的文本
1. 第一行文字
2. 第二行文字
3. 第三行文字

## 元数据
- **总字符数**: 42
- **总行数**: 3
- **处理时间**: 0.23 秒
```

**JSON 格式：**
```json
{
  "result": {
    "direction": 67.6506,
    "words_block_count": 3,
    "words_block_list": [
      {
        "words": "第一行文字",
        "confidence": 0.98,
        "location": [[517, 447], [540, 504], [505, 518], [482, 461]],
        "char_list": [
          {
            "char": "第",
            "char_location": [[517, 447], [530, 479], [495, 493], [482, 461]],
            "char_confidence": 0.99
          }
        ]
      }
    ],
    "markdown_result": "第一行文字\t第二行文字\t第三行文字\n"
  },
  "metadata": {
    "total_characters": 42,
    "total_lines": 3,
    "processing_time_ms": 230
  }
}
```

## 错误处理

服务器为常见问题提供清晰的错误消息：

### HTTP 状态码错误

- **400**：无效请求 - 检查图像格式和大小，确认 image 和 url 参数二选一
- **401**：认证失败 - 检查您的凭证（AK/SK）
- **403**：权限被拒绝 - 验证 IAM 权限
- **429**：超出速率限制 - 等待后重试
- **500**：内部服务器错误 - 稍后重试

### OCR 服务错误码 (AIS.*)

| 错误码 | 说明 | 解决方案 |
|-------|------|---------|
| AIS.0101 | 输入参数不符合规范 | 检查 image 和 url 参数是否二选一 |
| AIS.0102 | 图片格式不支持 | 检查图片格式 |
| AIS.0103 | 图片尺寸不满足要求 | 检查图片尺寸 |
| AIS.0104 | 图片质量差 | 检查图片类型与质量 |
| AIS.0105 | 算法计算失败 | 联系华为云支持人员 |

### 平台错误码 (ModelArts.*)

| 错误码 | 说明 | 解决方案 |
|-------|------|---------|
| ModelArts.4101-4107 | Token 相关错误 | 检查 Token 是否正确 |
| ModelArts.4204 | 服务未开通 | 前往文字识别控制台开通 API |
| ModelArts.4703-4706 | OBS 相关错误 | 检查 OBS 地址和权限 |
| ModelArts.6201 | 用户账户被冻结 | 检查账户余额并完成充值 |

### APIG 错误码

| 错误码 | 说明 | 解决方案 |
|-------|------|---------|
| APIG.0201 | 请求超时 | 检查图片大小或网络延时 |
| APIG.0301 | IAM 认证失败 | 检查 AK/SK 是否正确或 token 是否过期 |
| APIG.0308 | 超出速率限制 | 参考限流解决方案 |

## 项目结构

```
mz-mcp/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── types.ts              # 类型定义
│   ├── constants.ts          # 配置常量
│   ├── tools/
│   │   ├── ocr.ts            # OCR 工具实现
│   │   └── index.ts          # 工具导出
│   ├── services/
│   │   ├── huaweiClient.ts   # 华为云 OCR 客户端
│   │   └── index.ts          # 服务导出
│   └── schemas/
│       ├── ocr.ts            # Zod 验证 schemas
│       └── index.ts          # Schema 导出
├── dist/                     # 编译输出
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── .env.example              # 环境变量模板
└── README.md                 # 本文件
```

## 脚本

| 脚本 | 说明 |
|-----|------|
| `npm run dev` | 开发模式（自动重新编译） |
| `npm run build` | 构建项目 |
| `npm start` | 启动生产服务器 |
| `npm run clean` | 清理编译输出 |
| `npm publish` | 发布到 npm |

## 故障排除

### 问题：无法连接到华为云服务

**解决方案：**
1. 检查网络连接
2. 尝试更换服务地域（如从 `cn-east-3` 改为 `cn-north-4`）
3. 检查防火墙设置
4. 确认华为云 OCR 服务已开通

### 问题：认证失败 (401)

**解决方案：**
1. 确认 AK 和 SK 填写正确（不要填反）
2. 检查 AK/SK 是否已过期或被禁用
3. 重新生成访问密钥
4. 确认项目 ID 正确

### 问题：图片格式不支持

**解决方案：**
1. 确认图片格式在支持列表中
2. 检查 Base64 编码是否正确（不要有额外前缀）
3. 确认图片大小不超过 10MB（建议不超过 7MB）

### 问题：速率限制 (429)

**解决方案：**
1. 减少请求频率
2. 使用快速模式（`quick_mode: true`）处理简单图片
3. 联系华为云提升配额

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

AGPL-3.0

## 链接

- [华为云控制台](https://console.huaweicloud.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitHub 仓库](https://github.com/xiaomizhoubaobei/MZ-MCP)