import type { MCPToolDefinition } from "./types.js";
import { VAULT_STATE_TOOLS } from "./vault-state-tools.js";

/**
 * All MACHINA vault MCP tool definitions.
 * Each tool maps to a vault API operation that AI agents can invoke via MCP.
 */

const TOOL_DEFINITIONS: MCPToolDefinition[] = [
  {
    name: "machina_vault_create",
    description: "Create a new MACHINA vault for an AI agent",
    inputSchema: {
      type: "object",
      properties: {
        chains: {
          type: "array",
          items: { type: "string" },
          description: "Chains to activate on the vault (e.g. ['ethereum', 'base', 'solana'])",
        },
        policy: {
          type: "string",
          description: "Transaction policy to apply to the vault",
        },
        name: {
          type: "string",
          description: "Human-readable name for the vault",
        },
      },
    },
  },
  {
    name: "machina_vault_info",
    description: "Get vault information including address, chains, and status",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: {
          type: "string",
          description: "The unique identifier of the vault",
        },
      },
      required: ["vault_id"],
    },
  },
  {
    name: "machina_vault_balance",
    description: "Check token balances across all chains for a vault",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: {
          type: "string",
          description: "The unique identifier of the vault",
        },
        chain: {
          type: "string",
          description: "Filter balances to a specific chain",
        },
        token: {
          type: "string",
          description: "Filter balances to a specific token symbol or address",
        },
      },
      required: ["vault_id"],
    },
  },
  {
    name: "machina_vault_sign",
    description: "Sign and broadcast a transaction from the vault",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: {
          type: "string",
          description: "The unique identifier of the vault",
        },
        chain: {
          type: "string",
          description: "The chain to submit the transaction on",
        },
        to: {
          type: "string",
          description: "The destination address",
        },
        value: {
          type: "string",
          description: "The native token value to send (in wei or lamports)",
        },
        data: {
          type: "string",
          description: "Hex-encoded calldata for contract interactions",
        },
      },
      required: ["vault_id", "chain", "to"],
    },
  },
  {
    name: "machina_vault_transfer",
    description: "Transfer tokens from the vault to a recipient",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: {
          type: "string",
          description: "The unique identifier of the vault",
        },
        chain: {
          type: "string",
          description: "The chain to execute the transfer on",
        },
        token: {
          type: "string",
          description: "Token symbol or contract address to transfer",
        },
        to: {
          type: "string",
          description: "The recipient address",
        },
        amount: {
          type: "string",
          description: "The amount to transfer (in human-readable units)",
        },
      },
      required: ["vault_id", "chain", "token", "to", "amount"],
    },
  },
  {
    name: "machina_vault_reputation",
    description: "Query the reputation score and tier for a vault or address",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The on-chain address to query reputation for",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "machina_vault_check_counterparty",
    description: "Check counterparty risk before transacting with an address",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The address to check counterparty risk for",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "machina_vault_create_key",
    description: "Create a new agent or session key with specific permissions",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: {
          type: "string",
          description: "The unique identifier of the vault",
        },
        tier: {
          type: "string",
          enum: ["agent", "session"],
          description: "The key tier — 'agent' for persistent keys, 'session' for ephemeral keys",
        },
        name: {
          type: "string",
          description: "Human-readable name for the key",
        },
        permissions: {
          type: "array",
          items: { type: "string" },
          description: "List of permission scopes for the key",
        },
        spending_limit_usd: {
          type: "number",
          description: "Maximum spending limit in USD for this key",
        },
        ttl_hours: {
          type: "number",
          description: "Time-to-live in hours before the key expires",
        },
      },
      required: ["vault_id", "tier", "name"],
    },
  },
  {
    name: "machina_vault_policy",
    description: "Get or set the vault's transaction policy",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: {
          type: "string",
          description: "The unique identifier of the vault",
        },
        action: {
          type: "string",
          enum: ["get", "set"],
          description: "Whether to get the current policy or set a new one",
        },
        policy: {
          type: "string",
          description: "The policy to set (required when action is 'set')",
        },
      },
      required: ["vault_id", "action"],
    },
  },
  {
    name: "machina_vault_identity",
    description:
      "Get the vault's on-chain identity, A2A agent card, and KYA metadata",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: {
          type: "string",
          description: "The unique identifier of the vault",
        },
      },
      required: ["vault_id"],
    },
  },
  {
    name: "machina_vault_history",
    description: "Get transaction history for the vault",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: {
          type: "string",
          description: "The unique identifier of the vault",
        },
        chain: {
          type: "string",
          description: "Filter history to a specific chain",
        },
        limit: {
          type: "number",
          description: "Maximum number of transactions to return",
        },
      },
      required: ["vault_id"],
    },
  },
  {
    name: "machina_vault_estimate_gas",
    description: "Estimate gas cost for a transaction before signing",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: {
          type: "string",
          description: "The unique identifier of the vault",
        },
        chain: {
          type: "string",
          description: "The chain to estimate gas on",
        },
        to: {
          type: "string",
          description: "The destination address",
        },
        value: {
          type: "string",
          description: "The native token value (in wei or lamports)",
        },
        data: {
          type: "string",
          description: "Hex-encoded calldata for contract interactions",
        },
      },
      required: ["vault_id", "chain", "to"],
    },
  },
];

/** Returns all MACHINA vault MCP tool definitions. */
export function getToolDefinitions(): MCPToolDefinition[] {
  return [...TOOL_DEFINITIONS, ...VAULT_STATE_TOOLS];
}
