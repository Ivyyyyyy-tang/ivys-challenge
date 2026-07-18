import type { AIConfig } from '../../../config/aiConfig';
import type { AIProvider, AIGenerateInput } from '../aiService';

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export class GeminiProvider implements AIProvider {
  constructor(private readonly config: AIConfig) {}

  generateText(input: AIGenerateInput) {
    return this.requestText(input);
  }

  generateArticle(input: AIGenerateInput) {
    return this.requestText(input);
  }

  private async requestText({ prompt, systemPrompt }: AIGenerateInput) {
    const response = await fetch(this.resolveEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: systemPrompt
          ? {
              parts: [{ text: systemPrompt }],
            }
          : undefined,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini provider request failed with status ${response.status}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();

    if (!text) {
      throw new Error('Gemini provider returned an invalid response payload.');
    }

    return text;
  }

  private resolveEndpoint() {
    if (this.config.endpoint) {
      return this.config.endpoint;
    }

    const model = encodeURIComponent(this.config.model);
    const apiKey = encodeURIComponent(this.config.apiKey);
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  }
}
