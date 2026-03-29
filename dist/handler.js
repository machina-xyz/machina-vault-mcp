import { getToolDefinitions } from "./tools.js";
/**
 * Handles MCP tool calls by validating input, calling the MACHINA API,
 * and returning structured results.
 */
export class MCPToolHandler {
    apiUrl;
    apiKey;
    toolNames;
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.toolNames = new Set(getToolDefinitions().map((t) => t.name));
    }
    /** Execute an MCP tool call and return the result. */
    async handleToolCall(call) {
        try {
            if (!this.toolNames.has(call.name)) {
                return this.error(`Unknown tool: ${call.name}`);
            }
            switch (call.name) {
                case "machina_vault_create":
                    return this.apiPost("/v1/vaults", {
                        chains: call.arguments.chains,
                        policy: call.arguments.policy,
                        name: call.arguments.name,
                    });
                case "machina_vault_info":
                    return this.apiGet(`/v1/vaults/${call.arguments.vault_id}`);
                case "machina_vault_balance": {
                    const params = new URLSearchParams();
                    if (call.arguments.chain)
                        params.set("chain", String(call.arguments.chain));
                    if (call.arguments.token)
                        params.set("token", String(call.arguments.token));
                    const qs = params.toString();
                    return this.apiGet(`/v1/vaults/${call.arguments.vault_id}/balances${qs ? `?${qs}` : ""}`);
                }
                case "machina_vault_sign":
                    return this.apiPost(`/v1/vaults/${call.arguments.vault_id}/sign`, {
                        chain: call.arguments.chain,
                        to: call.arguments.to,
                        value: call.arguments.value,
                        data: call.arguments.data,
                    });
                case "machina_vault_transfer":
                    return this.apiPost(`/v1/vaults/${call.arguments.vault_id}/transfer`, {
                        chain: call.arguments.chain,
                        token: call.arguments.token,
                        to: call.arguments.to,
                        amount: call.arguments.amount,
                    });
                case "machina_vault_reputation":
                    return this.apiGet(`/v1/reputation/${call.arguments.address}`);
                case "machina_vault_check_counterparty":
                    return this.apiGet(`/v1/counterparty/${call.arguments.address}`);
                case "machina_vault_create_key":
                    return this.apiPost(`/v1/vaults/${call.arguments.vault_id}/keys`, {
                        tier: call.arguments.tier,
                        name: call.arguments.name,
                        permissions: call.arguments.permissions,
                        spending_limit_usd: call.arguments.spending_limit_usd,
                        ttl_hours: call.arguments.ttl_hours,
                    });
                case "machina_vault_policy": {
                    const action = call.arguments.action;
                    if (action === "get") {
                        return this.apiGet(`/v1/vaults/${call.arguments.vault_id}/policy`);
                    }
                    return this.apiPost(`/v1/vaults/${call.arguments.vault_id}/policy`, {
                        policy: call.arguments.policy,
                    });
                }
                case "machina_vault_identity":
                    return this.apiGet(`/v1/vaults/${call.arguments.vault_id}/identity`);
                case "machina_vault_history": {
                    const historyParams = new URLSearchParams();
                    if (call.arguments.chain)
                        historyParams.set("chain", String(call.arguments.chain));
                    if (call.arguments.limit)
                        historyParams.set("limit", String(call.arguments.limit));
                    const historyQs = historyParams.toString();
                    return this.apiGet(`/v1/vaults/${call.arguments.vault_id}/history${historyQs ? `?${historyQs}` : ""}`);
                }
                case "machina_vault_estimate_gas":
                    return this.apiPost(`/v1/vaults/${call.arguments.vault_id}/estimate-gas`, {
                        chain: call.arguments.chain,
                        to: call.arguments.to,
                        value: call.arguments.value,
                        data: call.arguments.data,
                    });
                default:
                    return this.error(`Unhandled tool: ${call.name}`);
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return this.error(message);
        }
    }
    // ---------------------------------------------------------------------------
    // HTTP helpers
    // ---------------------------------------------------------------------------
    async apiGet(path) {
        const res = await fetch(`${this.apiUrl}${path}`, {
            method: "GET",
            headers: this.headers(),
        });
        return this.toResult(res);
    }
    async apiPost(path, body) {
        const res = await fetch(`${this.apiUrl}${path}`, {
            method: "POST",
            headers: { ...this.headers(), "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return this.toResult(res);
    }
    headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            "User-Agent": "machina-vault-mcp/0.1.0",
        };
    }
    async toResult(res) {
        const text = await res.text();
        if (!res.ok) {
            return this.error(`API error ${res.status}: ${text}`);
        }
        return {
            content: [{ type: "text", text }],
        };
    }
    error(message) {
        return {
            isError: true,
            content: [{ type: "text", text: message }],
        };
    }
}
//# sourceMappingURL=handler.js.map