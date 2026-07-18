import type { VocabularyWord } from '../../data/vocabulary';

export type SemanticVocabularyEntry = {
  word: string;
  definition: string;
  partOfSpeech: string;
  example?: string;
};

export type SemanticVocabularyProfile = {
  word: string;
  meaning: string;
  category: string;
  relatedConcepts: string[];
  possibleContexts: string[];
};

type CategoryDefinition = {
  id: string;
  keywords: string[];
  relatedConcepts: string[];
  possibleContexts: string[];
};

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'geology',
    keywords: ['mantle', 'crust', 'magma', 'core', 'mineral', 'volcano', 'rock', 'earth layer', 'fault'],
    relatedConcepts: ['earth structure', 'scientific exploration', 'field observation'],
    possibleContexts: ['earth science article', 'geological expedition', 'field report'],
  },
  {
    id: 'astronomy',
    keywords: ['orbit', 'gravity', 'planet', 'galaxy', 'satellite', 'telescope', 'solar system', 'astronomy'],
    relatedConcepts: ['space motion', 'planetary systems', 'observation and measurement'],
    possibleContexts: ['astronomy article', 'observatory briefing', 'space exploration story'],
  },
  {
    id: 'psychology',
    keywords: ['resilience', 'confidence', 'anxiety', 'stress', 'emotion', 'mind', 'recovery', 'mental'],
    relatedConcepts: ['inner change', 'pressure and response', 'personal growth'],
    possibleContexts: ['personal reflection', 'human-interest story', 'psychology essay'],
  },
  {
    id: 'environment',
    keywords: ['ecosystem', 'climate', 'habitat', 'species', 'conservation', 'ecology', 'forest', 'wetland'],
    relatedConcepts: ['living systems', 'environmental pressure', 'ecological balance'],
    possibleContexts: ['documentary passage', 'science article', 'field observation'],
  },
  {
    id: 'business',
    keywords: ['strategy', 'innovation', 'market', 'customer', 'product', 'finance', 'company', 'competition'],
    relatedConcepts: ['decision making', 'growth and risk', 'market response'],
    possibleContexts: ['case study', 'workplace report', 'business article'],
  },
  {
    id: 'learning',
    keywords: ['insight', 'knowledge', 'study', 'report', 'scholar', 'research', 'question', 'analysis'],
    relatedConcepts: ['inquiry', 'revision', 'understanding'],
    possibleContexts: ['academic scene', 'research note', 'reflective essay'],
  },
  {
    id: 'life-story',
    keywords: ['journey', 'challenge', 'opportunity', 'future', 'path', 'travel', 'experience', 'change'],
    relatedConcepts: ['turning point', 'movement and choice', 'personal narrative'],
    possibleContexts: ['short story', 'reflective narrative', 'travel scene'],
  },
];

export function analyzeSemanticVocabularyEntries(entries: SemanticVocabularyEntry[]) {
  return entries.map((entry) => buildSemanticProfile(entry));
}

export function analyzeSemanticVocabularyWords(words: VocabularyWord[]) {
  return analyzeSemanticVocabularyEntries(
    words.map((word) => ({
      word: word.word,
      definition: word.meaning,
      partOfSpeech: word.part_of_speech,
      example: word.example,
    })),
  );
}

function buildSemanticProfile(entry: SemanticVocabularyEntry): SemanticVocabularyProfile {
  const normalizedWord = normalize(entry.word);
  const normalizedDefinition = normalize(entry.definition);
  const normalizedExample = normalize(entry.example ?? '');
  const signals = `${normalizedWord} ${normalizedDefinition} ${normalizedExample} ${normalize(entry.partOfSpeech)}`;
  const category = chooseCategory(signals);
  const categoryDefinition = CATEGORY_DEFINITIONS.find((item) => item.id === category);

  return {
    word: entry.word,
    meaning: compactMeaning(entry.definition),
    category,
    relatedConcepts: categoryDefinition?.relatedConcepts ?? ['general understanding', 'real-world usage'],
    possibleContexts: categoryDefinition?.possibleContexts ?? ['natural reading passage', 'short article'],
  };
}

function chooseCategory(signals: string) {
  const ranked = CATEGORY_DEFINITIONS.map((definition) => ({
    id: definition.id,
    score: definition.keywords.filter((keyword) => signals.includes(keyword)).length,
  })).sort((left, right) => right.score - left.score);

  return ranked[0]?.score > 0 ? ranked[0].id : 'learning';
}

function compactMeaning(value: string) {
  return value.replace(/\s+/g, ' ').replace(/[；;].*$/, '').replace(/[，,].*$/, '').trim();
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}
