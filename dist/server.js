import { getToolDefinitions } from "./tools.js";
const SERVER_INFO = {
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
    handler;
    constructor(handler) {
        this.handler = handler;
    }
    /** Start listening for JSON-RPC messages on stdin. */
    async start() {
        process.stdin.setEncoding("utf-8");
        let buffer = "";
        process.stdin.on("data", (chunk) => {
            buffer += chunk;
            // Process all complete lines in the buffer.
            let newlineIdx;
            while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
                const line = buffer.slice(0, newlineIdx).trim();
                buffer = buffer.slice(newlineIdx + 1);
                if (line.length === 0)
                    continue;
                this.handleLine(line).catch((err) => {
                    const errorMsg = {
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
    async handleLine(line) {
        let msg;
        try {
            msg = JSON.parse(line);
        }
        catch {
            const parseError = {
                jsonrpc: "2.0",
                error: { code: -32700, message: "Parse error" },
            };
            this.send(parseError);
            return;
        }
        const response = await this.processMessage(msg);
        this.send(response);
    }
    async processMessage(msg) {
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
                const params = msg.params;
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
    send(msg) {
        process.stdout.write(JSON.stringify(msg) + "\n");
    }
}
//# sourceMappingURL=server.js.map