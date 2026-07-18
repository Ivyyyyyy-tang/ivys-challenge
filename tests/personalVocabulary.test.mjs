import test from 'node:test';
import assert from 'node:assert/strict';
import { removePersonalVocabularyByIds } from '../.tmp-tests/personalVocabulary.bundle.mjs';

function createEntries() {
  return [
    {
      id: '1',
      source: { label: 'AI Reading', detail: "Today's Reading", dateAdded: '2026-07-16' },
      customWord: { id: 'w1', word: 'resilience' },
    },
    {
      id: '2',
      source: { label: 'AI Reading', detail: "Today's Reading", dateAdded: '2026-07-16' },
      customWord: { id: 'w2', word: 'adapt' },
    },
    {
      id: '3',
      source: { label: 'AI Reading', detail: "Today's Reading", dateAdded: '2026-07-16' },
      customWord: { id: 'w3', word: 'persist' },
    },
  ];
}

test('removePersonalVocabularyByIds removes a single entry', () => {
  const entries = createEntries();
  const result = removePersonalVocabularyByIds(entries, ['1']);

  assert.deepEqual(
    result.map((entry) => entry.id),
    ['2', '3'],
  );
});

test('removePersonalVocabularyByIds removes multiple entries', () => {
  const entries = createEntries();
  const result = removePersonalVocabularyByIds(entries, ['1', '3']);

  assert.deepEqual(
    result.map((entry) => entry.id),
    ['2'],
  );
});
