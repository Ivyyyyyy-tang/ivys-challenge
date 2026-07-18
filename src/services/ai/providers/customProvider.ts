import type { AIConfig } from '../../../config/aiConfig';
import type { AIProvider, AIGenerateInput } from '../aiService';

type OpenAICompatibleResponse = {
  choices?: Array<{
    text?: string;
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
};

export class CustomProvider implements AIProvider {
  constructor(private readonly config: AIConfig) {}

  generateText(input: AIGenerateInput) {
    return this.requestText(input);
  }

  generateArticle(input: AIGenerateInput) {
    return this.requestText(input);
  }

  private async requestText({ prompt, systemPrompt }: AIGenerateInput) {
    if (!this.config.endpoint) {
      throw new Error('Custom provider requires an endpoint.');
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom provider request failed with status ${response.status}`);
    }

    const data = (await response.json()) as OpenAICompatibleResponse;
    const content = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text;

    if (typeof content === 'string' && content.trim()) {
      return content;
    }

    if (Array.isArray(content)) {
      const merged = content
        .map((item) => (item.type === 'text' && item.text ? item.text : ''))
        .join('')
        .trim();

      if (merged) {
        return merged;
      }
    }

    throw new Error('Custom provider returned an invalid response payload.');
  }
}
