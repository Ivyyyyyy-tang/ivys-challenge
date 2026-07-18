import type { DictionaryConfig } from '../../../config/dictionaryConfig';
import type { DictionaryLookupResult, DictionaryProvider } from '../dictionaryService';

type DictionaryApiEntry = {
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
  }>;
  meanings?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{
      definition?: string;
      example?: string;
    }>;
  }>;
};

const DEFAULT_FREE_DICTIONARY_ENDPOINT = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export class FreeDictionaryProvider implements DictionaryProvider {
  constructor(private readonly config: DictionaryConfig) {}

  async lookup(word: string, fetcher: typeof fetch = fetch): Promise<DictionaryLookupResult | null> {
    try {
      const endpointBase = this.config.endpoint ?? DEFAULT_FREE_DICTIONARY_ENDPOINT;
      const response = await fetcher(`${endpointBase}/${encodeURIComponent(word)}`);
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as unknown;
      if (!Array.isArray(payload) || payload.length === 0) {
        return null;
      }

      const firstEntry = payload[0] as DictionaryApiEntry | undefined;
      if (!firstEntry || !Array.isArray(firstEntry.meanings) || firstEntry.meanings.length === 0) {
        return null;
      }

      const phonetic =
        firstEntry.phonetic ||
        firstEntry.phonetics?.find((item) => typeof item?.text === 'string' && item.text.trim())?.text ||
        '';

      const meaningBlock = firstEntry.meanings.find(
        (item) => typeof item?.partOfSpeech === 'string' && Array.isArray(item.definitions) && item.definitions.length > 0,
      );

      if (!meaningBlock) {
        return null;
      }

      const definitionBlock = meaningBlock.definitions?.find(
        (item) => typeof item?.definition === 'string' && item.definition.trim(),
      );

      if (!definitionBlock) {
        return null;
      }

      return {
        phonetic,
        part_of_speech: meaningBlock.partOfSpeech || 'Unknown',
        definition: definitionBlock.definition || '',
        example: definitionBlock.example || '',
      };
    } catch {
      return null;
    }
  }
}
