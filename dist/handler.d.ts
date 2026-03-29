import type { MCPToolCall, MCPToolResult } from "./types.js";
/**
 * Handles MCP tool calls by validating input, calling the MACHINA API,
 * and returning structured results.
 */
export declare class MCPToolHandler {
    private apiUrl;
    private apiKey;
    private readonly toolNames;
    constructor(apiUrl: string, apiKey: string);
    /** Execute an MCP tool call and return the result. */
    handleToolCall(call: MCPToolCall): Promise<MCPToolResult>;
    private apiGet;
    private apiPost;
    private headers;
    private toResult;
    private error;
}
//# sourceMappingURL=handler.d.ts.map