import type { MCPMessage, MCPServerInfo } from "./types.js";
import { getToolDefinitions } from "./tools.js";
import { MCPToolHandler } from "./handler.js";

const SERVER_INFO: MCPServerInfo = {
  name: "machina-vault-mcp",
  version: "0.1.0",
  description: "MACHINA Vault MCP server — exposes vault operations as MCP tools for AI agents",
};

/**
 * MCP server that communicates over stdin/stdout using line-delimited JSON-RPC 2.0.
 *
 * This is the ONE place Node.js-specific APIs (process.stdin / process.stdout)
 * are used, since MCP servers always run as CLI processes.
 */
export class MCPServer {
  constructor(private handler: MCPToolHandler) {}

  /** Start listening for JSON-RPC messages on stdin. */
  async start(): Promise<void> {
    process.stdin.setEncoding("utf-8");

    let buffer = "";

    process.stdin.on("data", (chunk: string) => {
      buffer += chunk;

      // Process all complete lines in the buffer.
      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);

        if (line.length === 0) continue;

        this.handleLine(line).catch((err) => {
          const errorMsg: MCPMessage = {
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: err instanceof Error ? err.message : String(err),
            },
          };
          this.send(errorMsg);
        });
      }
    });

    process.stdin.on("end", () => {
      process.exit(0);
    });
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private async handleLine(line: string): Promise<void> {
    let msg: MCPMessage;
    try {
      msg = JSON.parse(line) as MCPMessage;
    } catch {
      const parseError: MCPMessage = {
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
      };
      this.send(parseError);
      return;
    }

    const response = await this.processMessage(msg);
    this.send(response);
  }

  private async processMessage(msg: MCPMessage): Promise<MCPMessage> {
    const id = msg.id;

    switch (msg.method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            serverInfo: SERVER_INFO,
            capabilities: {
              tools: {},
            },
          },
        };

      case "notifications/initialized":
        // Acknowledgement — no response required, but return one for safety.
        return { jsonrpc: "2.0", id, result: {} };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: getToolDefinitions(),
          },
        };

      case "tools/call": {
        const params = msg.params as
          | { name: string; arguments?: Record<string, unknown> }
          | undefined;

        if (!params?.name) {
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "Missing tool name in params" },
          };
        }

        const result = await this.handler.handleToolCall({
          name: params.name,
          arguments: params.arguments ?? {},
        });

        return { jsonrpc: "2.0", id, result };
      }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method not found: ${msg.method ?? "(none)"}`,
          },
        };
    }
  }

  private send(msg: MCPMessage): void {
    process.stdout.write(JSON.stringify(msg) + "\n");
  }
}
