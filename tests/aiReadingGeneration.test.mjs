import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_READING_GENERATION_PROMPT,
  analyzeVocabularySemantics,
  buildAIReadingPrompt,
  buildReadingTopicContext,
  createReadingGenerationPlan,
} from '../.tmp-tests/aiReadingGeneration.bundle.mjs';
import { generateReadingArticle } from '../.tmp-tests/aiReadingService.bundle.mjs';

function createWord(word, meaning, partOfSpeech = 'n.') {
  return {
    id: word,
    chapter: 1,
    word,
    phonetic: '',
    audio: '',
    part_of_speech: partOfSpeech,
    meaning,
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

const geologyWords = [
  createWord('mantle', 'earth layer beneath the crust'),
  createWord('crust', 'outer layer of the earth'),
  createWord('magma', 'hot liquid rock under the surface'),
];

const psychologyWords = [
  createWord('resilience', 'ability to recover after difficulty'),
  createWord('confidence', 'belief in one’s own ability'),
  createWord('anxiety', 'persistent feeling of worry'),
];

const environmentWords = [
  createWord('ecosystem', 'community of living things and their environment'),
  createWord('climate', 'long-term weather pattern'),
  createWord('habitat', 'natural home of an organism'),
];

const businessWords = [
  createWord('strategy', 'long-term plan for action'),
  createWord('innovation', 'new idea applied in practice'),
  createWord('market', 'commercial environment of buyers and sellers'),
];

const lifeWords = [
  createWord('journey', 'a trip from one place to another'),
  createWord('challenge', 'a difficult task or problem'),
  createWord('opportunity', 'a good chance for progress'),
];

test('semantic analysis groups mantle crust magma into geology theme', () => {
  const analysis = analyzeVocabularySemantics(geologyWords);

  assert.equal(analysis.theme.id, 'geology');
  assert.equal(analysis.theme.title, 'Earth Science and Geology');
  assert.deepEqual(
    analysis.wordProfiles.map((profile) => profile.domain[0]),
    ['geology', 'geology', 'geology'],
  );
});

test('semantic analysis groups resilience confidence anxiety into psychology theme', () => {
  const analysis = analyzeVocabularySemantics(psychologyWords);

  assert.equal(analysis.theme.id, 'psychology');
  assert.match(analysis.semanticSummary, /human psychology/i);
});

test('semantic analysis groups ecosystem climate habitat into environment theme', () => {
  const analysis = analyzeVocabularySemantics(environmentWords);

  assert.equal(analysis.theme.id, 'environment');
  assert.match(analysis.semanticSummary, /environmental science|environment/i);
});

test('semantic analysis groups strategy innovation market into business theme', () => {
  const analysis = analyzeVocabularySemantics(businessWords);

  assert.equal(analysis.theme.id, 'business');
  assert.match(analysis.semanticSummary, /business/i);
});

test('semantic analysis groups journey challenge opportunity into life story theme', () => {
  const analysis = analyzeVocabularySemantics(lifeWords);

  assert.equal(analysis.theme.id, 'life-story');
  assert.match(analysis.semanticSummary, /life experience|story/i);
});

test('prompt architecture includes semantic analysis topic planning and context planning', () => {
  const plan = createReadingGenerationPlan({
    words: geologyWords,
    difficulty: 'B1',
    learningLevel: 'intermediate',
    variant: 1,
  });
  const prompt = buildAIReadingPrompt({
    words: geologyWords,
    difficulty: 'B1',
    unknownRatio: 8,
    length: 120,
    learningLevel: 'intermediate',
    analysis: plan.analysis,
    topicContext: plan.topic,
    contextPlan: plan.context,
  });

  assert.match(AI_READING_GENERATION_PROMPT, /Generation pipeline:/);
  assert.match(AI_READING_GENERATION_PROMPT, /Each target word should appear 1 to 3 times/i);
  assert.match(prompt, /Semantic analysis:/);
  assert.match(prompt, /category=geology/);
  assert.match(prompt, /related_concepts=/);
  assert.match(prompt, /Topic planning:/);
  assert.match(prompt, /Context planning:/);
  assert.match(prompt, /Theme: Earth Science and Geology/);
  assert.match(prompt, /Do not define or translate words inside the article body/);
});

test('topic planning picks a unified geology scene instead of isolated word stuffing', () => {
  const analysis = analyzeVocabularySemantics(geologyWords);
  const topic = buildReadingTopicContext({ words: geologyWords, analysis, variant: 0 });

  assert.equal(topic.topicTitle, 'Deep Earth Clues in One Field Scene');
  assert.match(topic.genre, /science article|field note/i);
  assert.match(topic.centralSituation, /interpret evidence/i);
});

test('fallback varies by semantic category and remains coherent for business vocabulary', async () => {
  const result = await generateReadingArticle({
    words: businessWords,
    difficulty: 'B1',
    unknownRatio: 8,
    length: 120,
    variant: 0,
    provider: null,
  });

  assert.equal(result.mode, 'fallback');
  assert.equal(result.topic, 'Decision Pressure Inside a Real Market Situation');
  assert.match(result.article, /strategy/i);
  assert.match(result.article, /innovation/i);
  assert.match(result.article, /market/i);
  assert.equal(result.validation.missingTargetWords.length, 0);
});

test('fallback varies between variants for the same semantic category', async () => {
  const first = await generateReadingArticle({
    words: environmentWords,
    difficulty: 'B1',
    unknownRatio: 8,
    length: 120,
    variant: 0,
    provider: null,
  });
  const second = await generateReadingArticle({
    words: environmentWords,
    difficulty: 'B1',
    unknownRatio: 8,
    length: 120,
    variant: 1,
    provider: null,
  });

  assert.equal(first.mode, 'fallback');
  assert.equal(second.mode, 'fallback');
  assert.notEqual(first.title, second.title);
  assert.notEqual(first.article, second.article);
});

test('service still uses provider output when AI provider returns valid JSON', async () => {
  const provider = {
    async generateText() {
      return '';
    },
    async generateArticle() {
      return JSON.stringify({
        title: 'Under the Ridge',
        article:
          'The guide used mantle, crust, and magma to explain the pressure beneath the hill. By the time the team checked the samples again, the landscape had become easier to read.',
        translation: '向导借助地幔、地壳和岩浆解释山丘下方的压力变化，让整片地形更容易理解。',
      });
    },
  };

  const result = await generateReadingArticle({
    words: geologyWords,
    difficulty: 'B1',
    unknownRatio: 8,
    length: 120,
    provider,
  });

  assert.equal(result.mode, 'ai');
  assert.equal(result.title, 'Under the Ridge');
  assert.equal(result.validation.missingTargetWords.length, 0);
});
