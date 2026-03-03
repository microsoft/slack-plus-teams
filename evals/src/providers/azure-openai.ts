import { AzureOpenAI } from "openai";
import type { LLMProvider, CompletionOptions, ProviderConfig } from "./base.js";

export class AzureOpenAIProvider implements LLMProvider {
  private client: AzureOpenAI;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.azure_endpoint) throw new Error("azure_endpoint required for azure-openai provider");
    if (!config.azure_deployment) throw new Error("azure_deployment required for azure-openai provider");

    this.client = new AzureOpenAI({
      endpoint: config.azure_endpoint,
      deployment: config.azure_deployment,
      apiVersion: config.api_version ?? "2024-12-01-preview",
    });
    this.model = config.azure_deployment;
  }

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const messages: Array<{ role: "system" | "user"; content: string }> = [];

    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0,
      max_tokens: options?.maxTokens ?? 4096,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}
