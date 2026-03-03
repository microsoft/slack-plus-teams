import type { LLMProvider, ProviderConfig } from "./base.js";
import { OpenAIProvider } from "./openai.js";
import { AnthropicProvider } from "./anthropic.js";
import { AzureOpenAIProvider } from "./azure-openai.js";

/**
 * Factory function to create an LLM provider from config.
 */
export function createProvider(config: ProviderConfig): LLMProvider {
  switch (config.type) {
    case "openai":
      return new OpenAIProvider(config);
    case "anthropic":
      return new AnthropicProvider(config);
    case "azure-openai":
      return new AzureOpenAIProvider(config);
    default:
      throw new Error(`Unknown provider type: ${config.type}`);
  }
}

export type { LLMProvider, ProviderConfig };
