import type { DictionaryConfig } from '../../config/dictionaryConfig';
import { loadDictionaryConfig } from '../../config/dictionaryConfig';
import { CustomDictionaryProvider } from './providers/customDictionaryProvider';
import { FreeDictionaryProvider } from './providers/freeDictionaryProvider';

export type DictionaryLookupResult = {
  phonetic: string;
  part_of_speech: string;
  definition: string;
  example: string;
};

export interface DictionaryProvider {
  lookup(word: string, fetcher?: typeof fetch): Promise<DictionaryLookupResult | null>;
}

export function createDictionaryProvider(
  config: DictionaryConfig = loadDictionaryConfig(),
): DictionaryProvider {
  if (config.provider === 'custom') {
    return new CustomDictionaryProvider(config);
  }

  return new FreeDictionaryProvider(config);
}

export async function lookupDictionaryWord(
  word: string,
  fetcher: typeof fetch = fetch,
  provider: DictionaryProvider = createDictionaryProvider(),
) {
  return provider.lookup(word, fetcher);
}
