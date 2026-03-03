import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, CompletionOptions, ProviderConfig } from "./base.js";

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(config: ProviderConfig) {
    this.client = new Anthropic();
    this.model = config.model;
  }

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? 4096,
      messages: [{ role: "user", content: prompt }],
      ...(options?.systemPrompt ? { system: options.systemPrompt } : {}),
      temperature: options?.temperature ?? 0,
    });

    const block = response.content[0];
    return block?.type === "text" ? block.text : "";
  }
}
