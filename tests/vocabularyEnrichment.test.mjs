import test from 'node:test';
import assert from 'node:assert/strict';
import { createDictionaryProvider } from '../.tmp-tests/dictionaryService.bundle.mjs';
import {
  createAIEnrichmentPlaceholder,
  enrichPendingVocabularyWord,
  fetchDictionaryData,
  getEnrichmentStatus,
  shouldAIEnrichVocabularyEntry,
  shouldEnrichVocabularyEntry,
} from '../.tmp-tests/vocabularyEnrichment.bundle.mjs';

function createPendingEntry(word) {
  return {
    id: `personal-${word}`,
    source: {
      label: 'AI Reading',
      detail: "Today's Reading",
      dateAdded: '2026-07-16',
    },
    customWord: {
      id: `ai-reading-custom-${word}`,
      chapter: 0,
      word,
      phonetic: '',
      audio: '',
      part_of_speech: 'Unknown',
      meaning: 'Pending enrichment',
      example: 'Captured from AI Reading.',
      word_family: [],
      collocations: [],
      memory: [false, false, false, false, false, false, false],
      spelling: { attempts: 0, correct: 0, errors: 0 },
      memoryMarks: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
      memoryHistory: [],
    },
    enrichment: {
      status: 'pending',
      source: 'ai-reading',
      updatedAt: '2026-07-16T00:00:00.000Z',
    },
  };
}

test('fetchDictionaryData returns normalized dictionary fields', async () => {
  const mockFetch = async () => ({
    ok: true,
    json: async () => [
      {
        phonetic: '/təˈstɪŋ/',
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [
              {
                definition: 'The act of trying something carefully.',
                example: 'Testing reveals edge cases.',
              },
            ],
          },
        ],
      },
    ],
  });

  const result = await fetchDictionaryData('testing', mockFetch);

  assert.deepEqual(result, {
    phonetic: '/təˈstɪŋ/',
    part_of_speech: 'noun',
    definition: 'The act of trying something carefully.',
    example: 'Testing reveals edge cases.',
  });
});

test('enrichPendingVocabularyWord fills pending word from dictionary result', async () => {
  const pendingEntry = createPendingEntry('unknownword');
  const mockFetch = async () => ({
    ok: true,
    json: async () => [
      {
        phonetics: [{ text: '/ʌnˈnoʊn/' }],
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [
              {
                definition: 'A word used for demonstration.',
                example: 'This unknown word is only a test.',
              },
            ],
          },
        ],
      },
    ],
  });

  const result = await enrichPendingVocabularyWord(pendingEntry, mockFetch);

  assert.equal(result.customWord?.phonetic, '/ʌnˈnoʊn/');
  assert.equal(result.customWord?.meaning, 'A word used for demonstration.');
  assert.equal(result.customWord?.part_of_speech, 'noun');
  assert.equal(result.enrichment?.status, 'partial');
  assert.equal(result.enrichment?.source, 'dictionary-api');
});

test('enrichPendingVocabularyWord keeps pending entry when word is not found', async () => {
  const pendingEntry = createPendingEntry('missingword');
  const mockFetch = async () => ({
    ok: false,
    json: async () => ({ title: 'No Definitions Found' }),
  });

  const result = await enrichPendingVocabularyWord(pendingEntry, mockFetch);

  assert.equal(result.customWord?.phonetic, '');
  assert.equal(result.customWord?.meaning, 'Pending enrichment');
  assert.equal(result.enrichment?.status, 'pending');
  assert.equal(result.enrichment?.source, 'ai-reading');
});

test('getEnrichmentStatus and shouldEnrichVocabularyEntry return true for pending ai-reading entry', () => {
  const pendingEntry = createPendingEntry('resilience');

  assert.equal(shouldEnrichVocabularyEntry(pendingEntry), true);

  const status = getEnrichmentStatus(pendingEntry);
  assert.equal(status.status, 'pending');
  assert.equal(status.source, 'ai-reading');
  assert.equal(status.needsAIEnhancement, false);
});

test('getEnrichmentStatus marks partial dictionary-api entry as AI-enhancement candidate', () => {
  const partialEntry = {
    ...createPendingEntry('resilience'),
    enrichment: {
      status: 'partial',
      source: 'dictionary-api',
      updatedAt: '2026-07-16T10:00:00.000Z',
    },
  };

  assert.equal(shouldEnrichVocabularyEntry(partialEntry), false);

  const status = getEnrichmentStatus(partialEntry);
  assert.equal(status.status, 'partial');
  assert.equal(status.source, 'dictionary-api');
  assert.equal(status.needsAIEnhancement, true);
});

test('getEnrichmentStatus marks complete ai-enhanced entry as no longer needing AI enhancement', () => {
  const completeEntry = {
    ...createPendingEntry('resilience'),
    enrichment: {
      status: 'complete',
      source: 'ai-enhanced',
      updatedAt: '2026-07-16T11:00:00.000Z',
    },
  };

  const status = getEnrichmentStatus(completeEntry);
  assert.equal(status.status, 'complete');
  assert.equal(status.source, 'ai-enhanced');
  assert.equal(status.needsAIEnhancement, false);
});

test('shouldAIEnrichVocabularyEntry returns true for partial dictionary-api entry', () => {
  const partialEntry = {
    ...createPendingEntry('resilience'),
    enrichment: {
      status: 'partial',
      source: 'dictionary-api',
      updatedAt: '2026-07-16T10:00:00.000Z',
    },
  };

  assert.equal(shouldAIEnrichVocabularyEntry(partialEntry), true);
});

test('shouldAIEnrichVocabularyEntry returns false for complete ai-enhanced entry', () => {
  const completeEntry = {
    ...createPendingEntry('resilience'),
    enrichment: {
      status: 'complete',
      source: 'ai-enhanced',
      updatedAt: '2026-07-16T11:00:00.000Z',
    },
    aiEnrichment: {
      status: 'complete',
      source: 'ai',
      updatedAt: '2026-07-16T11:30:00.000Z',
    },
  };

  assert.equal(shouldAIEnrichVocabularyEntry(completeEntry), false);
});

test('createAIEnrichmentPlaceholder creates pending ai placeholder for dictionary-partial entry', () => {
  const partialEntry = {
    ...createPendingEntry('resilience'),
    enrichment: {
      status: 'partial',
      source: 'dictionary-api',
      updatedAt: '2026-07-16T10:00:00.000Z',
    },
  };

  const result = createAIEnrichmentPlaceholder(partialEntry);

  assert.equal(result.aiEnrichment?.status, 'pending');
  assert.equal(result.aiEnrichment?.source, 'ai');
});

test('dictionary provider can switch to custom provider without business-code changes', async () => {
  const provider = createDictionaryProvider({
    provider: 'custom',
    endpoint: 'https://dictionary.example.dev/lookup',
    apiKey: 'demo-key',
  });

  const mockFetch = async (_url, options) => ({
    ok: true,
    json: async () => ({
      phonetic: '/rɪˈzɪliəns/',
      part_of_speech: 'noun',
      definition: 'The ability to recover quickly from difficulty.',
      example: 'Resilience matters during long projects.',
    }),
    requestOptions: options,
  });

  const result = await provider.lookup('resilience', mockFetch);

  assert.equal(result?.phonetic, '/rɪˈzɪliəns/');
  assert.equal(result?.part_of_speech, 'noun');
  assert.equal(result?.definition, 'The ability to recover quickly from difficulty.');
});
