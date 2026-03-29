/**
 * Vault State MCP Tools — MAC-1020 Harness Pattern 5
 *
 * Exposes vault state persistence to AI agents via MCP. Agents call
 * machina_get_vault_state at session start to load context, and
 * machina_update_vault_state at session end to persist progress.
 */

import type { MCPToolDefinition } from "./types.js";

// ─── Tool Definitions ────────────────────────────────────────────────────────

export const VAULT_STATE_TOOLS: MCPToolDefinition[] = [
  {
    name: "machina_get_vault_state",
    description:
      "Load the full vault state for an agent. Call this at the start of every session " +
      "to get portfolio positions, active policies, strategy config, pending operations, " +
      "and alerts. Returns the complete VaultState object.",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: {
          type: "string",
          description: "The agent ID whose vault state to load",
        },
      },
      required: ["agent_id"],
    },
  },
  {
    name: "machina_update_vault_state",
    description:
      "Update the vault state after operations. Call this at session end or after " +
      "significant changes (rebalance, deposit, withdrawal, policy change). " +
      "Performs a partial merge — only provided fields are updated.",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: {
          type: "string",
          description: "The agent ID whose vault state to update",
        },
        portfolio: {
          type: "object",
          description:
            "Updated portfolio snapshot: { total_value_usd, positions, cash_usd }",
          properties: {
            total_value_usd: { type: "number" },
            positions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  protocol: { type: "string" },
                  chain: { type: "string" },
                  token: { type: "string" },
                  amount_usd: { type: "number" },
                  apy: { type: "number" },
                  health_factor: { type: "number" },
                  days_to_maturity: { type: "number" },
                },
                required: ["protocol", "chain", "token", "amount_usd", "apy"],
              },
            },
            cash_usd: { type: "number" },
          },
        },
        pending_operations: {
          type: "array",
          description: "Replace the pending operations list",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              status: { type: "string", enum: ["pending", "executing", "confirming"] },
              description: { type: "string" },
              created_at: { type: "string" },
            },
            required: ["id", "type", "status", "description"],
          },
        },
        strategy: {
          type: "object",
          description: "Updated strategy parameters",
          properties: {
            mode: { type: "string", enum: ["auto", "custom", "hybrid"] },
            risk_profile: {
              type: "string",
              enum: ["conservative", "moderate", "aggressive"],
            },
            last_rebalance_at: { type: "string" },
            next_rebalance_at: { type: "string" },
            target_allocation: {
              type: "object",
              description: "Protocol name → target allocation percentage",
            },
            drift_pct: { type: "number" },
          },
        },
      },
      required: ["agent_id"],
    },
  },
];

export default VAULT_STATE_TOOLS;
