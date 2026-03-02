#!/usr/bin/env node
/**
 * @fileoverview MCP 服务器入口文件
 * @author xiaomizhou111
 * @date 2026-02-10
 * @since 2026-02-10
 * @contact 2923597244@qq.com
 * @LICENSE AGPL-3.0 license
 * @remark 本模块提供华为云 OCR 服务的 MCP 服务器，支持通过 stdio 通信协议提供 OCR 功能
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerOcrTools } from "./tools/index.js";

/**
 * 主函数：初始化并启动 MCP 服务器
 * @throws {Error} 当环境变量未设置或服务器启动失败时抛出错误
 */
async function main(): Promise<void> {
  if (!process.env.CLOUD_SDK_AK || !process.env.CLOUD_SDK_SK) {
    console.error("错误：需要设置 CLOUD_SDK_AK 和 CLOUD_SDK_SK 环境变量");
    process.exit(1);
  }

  const server = new McpServer({
    name: "mz-mcp",
    version: "0.0.1"
  });

  registerOcrTools(server);

  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("华为云 OCR MCP 服务器已启动（通过 stdio 通信）");
}

main().catch((error) => {
  console.error("服务器错误：", error);
  process.exit(1);
});
