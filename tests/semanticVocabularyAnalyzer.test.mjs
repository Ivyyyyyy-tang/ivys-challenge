import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeSemanticVocabularyEntries,
  analyzeSemanticVocabularyWords,
} from '../.tmp-tests/semanticVocabularyAnalyzer.bundle.mjs';

function createWord(word, meaning, partOfSpeech = 'n.', example = '') {
  return {
    id: word,
    chapter: 1,
    word,
    phonetic: '',
    audio: '',
    part_of_speech: partOfSpeech,
    meaning,
    example,
    word_family: [],
    collocations: [],
    memory: [true, false, false, false, false, false, false],
    spelling: { attempts: 1, correct: 1, errors: 0 },
    memoryMarks: ['check', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
    memoryHistory: [],
  };
}

test('geology words produce the same semantic group', () => {
  const result = analyzeSemanticVocabularyEntries([
    { word: 'core', definition: 'the central part of Earth', partOfSpeech: 'n.' },
    { word: 'crust', definition: 'the outer layer of the Earth', partOfSpeech: 'n.' },
    { word: 'mantle', definition: 'the layer between core and crust', partOfSpeech: 'n.' },
  ]);

  assert.deepEqual(
    result.map((item) => item.category),
    ['geology', 'geology', 'geology'],
  );
  assert.match(result[0].possibleContexts.join(' '), /earth science|field report|scientific exploration/i);
});

test('mixed words produce different semantic categories', () => {
  const result = analyzeSemanticVocabularyEntries([
    { word: 'orbit', definition: 'the curved path of a planet', partOfSpeech: 'n.' },
    { word: 'strategy', definition: 'a long-term business plan', partOfSpeech: 'n.' },
    { word: 'resilience', definition: 'the ability to recover after difficulty', partOfSpeech: 'n.' },
  ]);

  assert.deepEqual(
    result.map((item) => item.category),
    ['astronomy', 'business', 'psychology'],
  );
});

test('word-based analyzer preserves meaning and semantic context for prompt construction', () => {
  const result = analyzeSemanticVocabularyWords([
    createWord('core', 'the central part of Earth'),
    createWord('crust', 'the outer layer of Earth'),
    createWord('mantle', 'the layer under the crust'),
  ]);

  assert.equal(result[0].meaning, 'the central part of Earth');
  assert.equal(result[0].category, 'geology');
  assert.ok(result[0].relatedConcepts.length > 0);
  assert.ok(result[0].possibleContexts.length > 0);
});
