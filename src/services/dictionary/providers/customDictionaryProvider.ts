import type { DictionaryConfig } from '../../../config/dictionaryConfig';
import type { DictionaryLookupResult, DictionaryProvider } from '../dictionaryService';

type CustomDictionaryResponse = {
  phonetic?: string;
  part_of_speech?: string;
  definition?: string;
  example?: string;
};

export class CustomDictionaryProvider implements DictionaryProvider {
  constructor(private readonly config: DictionaryConfig) {}

  async lookup(word: string, fetcher: typeof fetch = fetch): Promise<DictionaryLookupResult | null> {
    if (!this.config.endpoint) {
      return null;
    }

    try {
      const response = await fetcher(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({ word }),
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as CustomDictionaryResponse;
      if (!payload.definition || !payload.part_of_speech) {
        return null;
      }

      return {
        phonetic: payload.phonetic ?? '',
        part_of_speech: payload.part_of_speech,
        definition: payload.definition,
        example: payload.example ?? '',
      };
    } catch {
      return null;
    }
  }
}
