/**
 * Model registry — the single source of truth for model routing.
 *
 * Every model the agent or eval harness can use is declared here.
 * Never hardcode a model string anywhere else in the codebase.
 *
 * The eval harness and the /benchmark page iterate over this registry
 * to run the same agent across providers.
 */
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { togetherai } from "@ai-sdk/togetherai";

export const MODEL_KEYS = [
  "claude-sonnet",
  "claude-opus",
  "gpt",
  "llama-70b",
  "qwen-72b",
] as const;

export type ModelKey = (typeof MODEL_KEYS)[number];

/**
 * TODO(perufindocs): confirm exact model IDs at implementation time (Week 3).
 * Model IDs churn quarterly; the keys above are stable, the IDs below are not.
 */
export const modelRegistry = {
  "claude-sonnet": {
    model: anthropic("claude-sonnet-4-5"),
    displayName: "Claude Sonnet",
    provider: "anthropic",
    /** Used by eval cost reporting; update from provider pricing pages. */
    costPer1MTokens: { input: 3, output: 15 },
  },
  "claude-opus": {
    model: anthropic("claude-opus-4-1"),
    displayName: "Claude Opus",
    provider: "anthropic",
    costPer1MTokens: { input: 15, output: 75 },
  },
  gpt: {
    model: openai("gpt-4o"),
    displayName: "GPT",
    provider: "openai",
    costPer1MTokens: { input: 2.5, output: 10 },
  },
  "llama-70b": {
    model: togetherai("meta-llama/Llama-3.1-70B-Instruct-Turbo"),
    displayName: "Llama 3.1 70B",
    provider: "together",
    costPer1MTokens: { input: 0.88, output: 0.88 },
  },
  "qwen-72b": {
    model: togetherai("Qwen/Qwen2.5-72B-Instruct-Turbo"),
    displayName: "Qwen 2.5 72B",
    provider: "together",
    costPer1MTokens: { input: 1.2, output: 1.2 },
  },
} as const satisfies Record<ModelKey, unknown>;

/** Default model for the public demo. */
export const DEFAULT_MODEL: ModelKey = "claude-sonnet";

/**
 * Models whose API key is missing are skipped (not failed) by the eval
 * harness. See CLAUDE.md → "Secrets & config".
 */
export function availableModels(): ModelKey[] {
  const keyFor: Record<string, string> = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    together: "TOGETHER_API_KEY",
  };
  return MODEL_KEYS.filter((k) => {
    const provider = modelRegistry[k].provider;
    const envVar = keyFor[provider];
    return envVar !== undefined && Boolean(process.env[envVar]);
  });
}
