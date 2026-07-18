import type { AIConfig } from '../../../config/aiConfig';
import type { AIProvider, AIGenerateInput } from '../aiService';

type DeepSeekResponse = {
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

const DEFAULT_DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

export class DeepSeekProvider implements AIProvider {
  constructor(private readonly config: AIConfig) {}

  generateText(input: AIGenerateInput) {
    return this.requestText(input);
  }

  generateArticle(input: AIGenerateInput) {
    return this.requestText(input);
  }

  private async requestText({ prompt, systemPrompt }: AIGenerateInput) {
    const response = await fetch(this.config.endpoint ?? DEFAULT_DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'deepseek-chat',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek provider request failed with status ${response.status}`);
    }

    const data = (await response.json()) as DeepSeekResponse;
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

    throw new Error('DeepSeek provider returned an invalid response payload.');
  }
}
