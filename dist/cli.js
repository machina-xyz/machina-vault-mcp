#!/usr/bin/env node
import { getToolDefinitions } from "./tools.js";
import { MCPToolHandler } from "./handler.js";
import { MCPServer } from "./server.js";
const MACHINA_API_URL = process.env.MACHINA_API_URL ?? "https://api.machina.money";
const MACHINA_API_KEY = process.env.MACHINA_API_KEY;
// --list flag: print tool definitions as JSON and exit
if (process.argv.includes("--list")) {
    process.stdout.write(JSON.stringify(getToolDefinitions(), null, 2) + "\n");
    process.exit(0);
}
if (!MACHINA_API_KEY) {
    process.stderr.write("Error: MACHINA_API_KEY environment variable is required.\n" +
        "Usage: MACHINA_API_URL=... MACHINA_API_KEY=... machina-vault-mcp\n");
    process.exit(1);
}
const handler = new MCPToolHandler(MACHINA_API_URL, MACHINA_API_KEY);
const server = new MCPServer(handler);
server.start().catch((err) => {
    process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map