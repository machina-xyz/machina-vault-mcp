import { MCPToolHandler } from "./handler.js";
/**
 * MCP server that communicates over stdin/stdout using line-delimited JSON-RPC 2.0.
 *
 * This is the ONE place Node.js-specific APIs (process.stdin / process.stdout)
 * are used, since MCP servers always run as CLI processes.
 */
export declare class MCPServer {
    private handler;
    constructor(handler: MCPToolHandler);
    /** Start listening for JSON-RPC messages on stdin. */
    start(): Promise<void>;
    private handleLine;
    private processMessage;
    private send;
}
//# sourceMappingURL=server.d.ts.map