/**
 * MCP protocol types defined inline — no external dependency required.
 * Follows the Model Context Protocol specification.
 */

/** JSON Schema object used to describe tool input shapes. */
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema & { description?: string; enum?: string[] }>;
  required?: string[];
  description?: string;
  items?: JSONSchema;
  enum?: string[];
  default?: unknown;
}

/** An MCP tool definition exposed to the AI model. */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

/** A tool invocation request from the AI model. */
export interface MCPToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

/** The result returned after executing a tool call. */
export interface MCPToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

/** Server identity advertised during the initialize handshake. */
export interface MCPServerInfo {
  name: string;
  version: string;
  description: string;
}

/** A JSON-RPC 2.0 message used by the MCP transport layer. */
export interface MCPMessage {
  jsonrpc: "2.0";
  id?: string | number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}
