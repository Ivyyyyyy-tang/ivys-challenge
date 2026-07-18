import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAIReadingSearch,
  parseSelectedReadingWordIds,
  resolveSelectedReadingWords,
} from '../.tmp-tests/aiReadingSelection.bundle.mjs';

function createWord(id, word) {
  return {
    id,
    chapter: 1,
    word,
    phonetic: '',
    audio: '',
    part_of_speech: 'n.',
    meaning: `${word} meaning`,
    example: '',
    word_family: [],
    collocations: [],
    memory: [true, false, false, false, false, false, false],
    spelling: { attempts: 1, correct: 1, errors: 0 },
    memoryMarks: ['check', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
    memoryHistory: [],
    learnedOn: '2026-07-18',
  };
}

test('user-selected words resolve into the AI Reading input set', () => {
  const vocabularyWords = [
    createWord('resilience', 'resilience'),
    createWord('confidence', 'confidence'),
  ];
  const personalVocabularyWords = [createWord('anxiety', 'anxiety')];
  const selectedWords = resolveSelectedReadingWords({
    selectedWordIds: ['resilience', 'confidence', 'anxiety'],
    vocabularyWords,
    personalVocabularyWords,
  });

  assert.deepEqual(
    selectedWords.map((word) => word.word),
    ['resilience', 'confidence', 'anxiety'],
  );
});

test('missing user-selected words keep the existing automatic path available', () => {
  const selectedWords = resolveSelectedReadingWords({
    selectedWordIds: [],
    vocabularyWords: [createWord('mantle', 'mantle')],
    personalVocabularyWords: [createWord('magma', 'magma')],
  });

  assert.deepEqual(selectedWords, []);
});

test('selected word ids survive refresh through the AI Reading url query', () => {
  const search = buildAIReadingSearch(['resilience', 'confidence', 'anxiety']);
  const restoredWordIds = parseSelectedReadingWordIds(search);

  assert.equal(search, '?words=resilience%2Cconfidence%2Canxiety');
  assert.deepEqual(restoredWordIds, ['resilience', 'confidence', 'anxiety']);
});
