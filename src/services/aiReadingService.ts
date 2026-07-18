import {
  analyzeVocabularySemantics,
  buildAIReadingPrompt,
  createFallbackReadingDraft,
  createReadingGenerationPlan,
  validateGeneratedReading,
  type ReadingValidation,
} from '../data/aiReadingGeneration';
import type { VocabularyWord } from '../data/vocabulary';
import { loadUserSettings } from '../config/userSettings';
import { createAIProvider, generateArticle, type AIProvider } from './ai/aiService';
import { analyzeSemanticVocabularyWords } from './ai/semanticVocabularyAnalyzer';

export type GenerateReadingArticleInput = {
  words: VocabularyWord[];
  difficulty: string;
  unknownRatio: number;
  length: number;
  variant?: number;
  provider?: AIProvider | null;
};

export type GenerateReadingArticleResult = {
  title: string;
  article: string;
  translation: string;
  selectedWords: string[];
  mode: 'ai' | 'fallback';
  topic: string;
  validation: ReadingValidation;
};

type ReadingDraft = {
  title: string;
  article: string;
  translation: string;
};

export async function generateReadingArticle({
  words,
  difficulty,
  unknownRatio,
  length,
  variant = 0,
  provider,
}: GenerateReadingArticleInput): Promise<GenerateReadingArticleResult> {
  const semanticProfiles = analyzeSemanticVocabularyWords(words);
  const analysis = analyzeVocabularySemantics(words, semanticProfiles);
  const learningLevel = loadUserSettings().learningLevel;
  const plan = createReadingGenerationPlan({
    words,
    difficulty,
    learningLevel,
    variant,
    analysis,
  });
  const selectedWords = words.map((word) => word.word);
  const activeProvider = provider ?? createAIProvider();
  const prompt = buildAIReadingPrompt({
    words,
    difficulty,
    unknownRatio,
    length,
    learningLevel,
    analysis: plan.analysis,
    topicContext: plan.topic,
    contextPlan: plan.context,
  });

  if (activeProvider) {
    try {
      const raw =
        (await generateArticle(
          {
            prompt,
          },
          activeProvider,
        )) ?? '';
      const parsed = parseProviderResponse(raw);
      const validation = validateGeneratedReading({
        article: parsed.article,
        targetWords: words,
        length,
        unknownRatio,
      });

      return {
        ...parsed,
        selectedWords,
        mode: 'ai',
        topic: plan.topic.topicTitle,
        validation,
      };
    } catch {
      // Fall back silently so one provider failure does not block reading generation.
    }
  }

  const fallback = createFallbackReadingDraft({
    words,
    plan,
    variant,
  });
  const validation = validateGeneratedReading({
    article: fallback.article,
    targetWords: words,
    length,
    unknownRatio,
  });

  return {
    ...fallback,
    selectedWords,
    mode: 'fallback',
    topic: plan.topic.topicTitle,
    validation,
  };
}

function parseProviderResponse(raw: string): ReadingDraft {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('AI provider did not return JSON.');
  }

  const parsed = JSON.parse(match[0]) as Partial<ReadingDraft>;

  if (!parsed.title || !parsed.article || !parsed.translation) {
    throw new Error('AI provider JSON is missing required fields.');
  }

  return {
    title: parsed.title.trim(),
    article: parsed.article.trim(),
    translation: parsed.translation.trim(),
  };
}
