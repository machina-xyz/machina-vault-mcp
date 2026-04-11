import { describe, it, expect } from "vitest";

describe("@machina-xyz/vault-mcp", () => {
  it("exports expected modules", async () => {
    const mod = await import("../index.js");
    expect(mod.getToolDefinitions).toBeDefined();
    expect(mod.MCPToolHandler).toBeDefined();
    expect(mod.MCPServer).toBeDefined();
  });
});
