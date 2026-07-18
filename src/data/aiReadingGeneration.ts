import type { VocabularyWord } from './vocabulary';
import {
  analyzeSemanticVocabularyWords,
  type SemanticVocabularyProfile as AnalyzerSemanticVocabularyProfile,
} from '../services/ai/semanticVocabularyAnalyzer';

export type ReadingSegment = {
  text: string;
  word?: VocabularyWord;
  isUnknown?: boolean;
  isTodayLearned?: boolean;
};

export type SemanticThemeId =
  | 'geology'
  | 'psychology'
  | 'environment'
  | 'business'
  | 'life-story'
  | 'learning';

type SemanticTheme = {
  id: SemanticThemeId;
  title: string;
  description: string;
  promptFocus: string;
  fallbackStyle: 'science-article' | 'personal-story' | 'documentary' | 'case-study' | 'reflective-story' | 'essay';
  signalKeywords: string[];
  domainLabels: string[];
  settingOptions: string[];
  subjectAngles: string[];
  toneOptions: string[];
};

export type VocabularySemanticProfile = AnalyzerSemanticVocabularyProfile & {
  partOfSpeech: string;
  domain: string[];
  possibleContext: string[];
};

export type ThemeAnalysis = {
  theme: SemanticTheme;
  score: number;
  matchedWords: string[];
  wordProfiles: VocabularySemanticProfile[];
  dominantDomains: string[];
  semanticSummary: string;
};

export type ReadingTopicContext = {
  topicTitle: string;
  genre: string;
  setting: string;
  centralSituation: string;
  narrativeGoal: string;
  tone: string;
  subjectAngle: string;
  articleFocus: string;
};

export type ReadingContextPlan = {
  openingFocus: string;
  developmentFocus: string;
  turningPoint: string;
  closingFocus: string;
  wordUsageGuide: string;
  difficultyGuide: string;
};

export type ReadingGenerationPlan = {
  analysis: ThemeAnalysis;
  topic: ReadingTopicContext;
  context: ReadingContextPlan;
};

export type ReadingValidation = {
  coveredTargetWords: string[];
  missingTargetWords: string[];
  excessiveRepetition: string[];
  wordCount: number;
  unknownRatio: number;
  isLengthValid: boolean;
  isUnknownRatioValid: boolean;
  isCoverageValid: boolean;
  isValid: boolean;
};

type FallbackDraft = {
  title: string;
  article: string;
  translation: string;
};

const THEMES: SemanticTheme[] = [
  {
    id: 'geology',
    title: 'Earth Science and Geology',
    description: 'Natural processes, layers of the earth, field observation, and physical evidence.',
    promptFocus: 'Choose one earth-science topic and keep the article grounded in observation, process, and consequence.',
    fallbackStyle: 'science-article',
    signalKeywords: [
      'mantle',
      'crust',
      'magma',
      'core',
      'longitude',
      'latitude',
      'mineral',
      'volcano',
      'glacier',
      'landscape',
      'climate',
      'geology',
      'earth',
      'magnet',
      'horizon',
    ],
    domainLabels: ['geology', 'earth science', 'geography'],
    settingOptions: [
      'a ridge survey above a fault line',
      'a volcanic research station',
      'a field lesson beside exposed rock layers',
    ],
    subjectAngles: [
      'how visible evidence reveals hidden structure',
      'how researchers connect surface clues to deep forces',
      'how a small field team turns observation into judgment',
    ],
    toneOptions: ['observational', 'measured', 'quietly vivid'],
  },
  {
    id: 'psychology',
    title: 'Human Psychology and Personal Growth',
    description: 'Emotion, self-regulation, recovery, and internal change.',
    promptFocus: 'Choose one believable human challenge and show psychological change through action rather than explanation.',
    fallbackStyle: 'personal-story',
    signalKeywords: [
      'resilience',
      'confidence',
      'anxiety',
      'stress',
      'emotion',
      'fear',
      'calm',
      'mind',
      'mental',
      'recovery',
      'motivation',
      'habit',
    ],
    domainLabels: ['psychology', 'personal growth', 'mental health'],
    settingOptions: [
      'a student returning after a difficult setback',
      'a runner preparing for a race after a poor performance',
      'a quiet conversation after a stressful public moment',
    ],
    subjectAngles: [
      'how confidence returns after disruption',
      'how a person responds to pressure without denying it',
      'how inner change becomes visible through small decisions',
    ],
    toneOptions: ['human', 'reflective', 'steady'],
  },
  {
    id: 'environment',
    title: 'Environmental Science',
    description: 'Ecosystems, climate pressure, habitat change, and observation over time.',
    promptFocus: 'Choose one environmental scene and show how systems interact across one coherent setting.',
    fallbackStyle: 'documentary',
    signalKeywords: [
      'ecosystem',
      'climate',
      'habitat',
      'species',
      'diversity',
      'conservation',
      'ecology',
      'wetland',
      'forest',
      'bacteria',
      'organism',
      'mutation',
    ],
    domainLabels: ['environment', 'ecology', 'biology'],
    settingOptions: [
      'a wetland under seasonal pressure',
      'a coastal habitat during a field survey',
      'a forest edge where scientists track change',
    ],
    subjectAngles: [
      'how one habitat reflects a larger environmental shift',
      'how small observations reveal system-wide stress',
      'how climate pressure reshapes living relationships',
    ],
    toneOptions: ['documentary', 'precise', 'attentive'],
  },
  {
    id: 'business',
    title: 'Business and Strategy',
    description: 'Decision-making, innovation, competition, and market response.',
    promptFocus: 'Choose one business situation and show tradeoffs, decisions, and outcomes in concrete terms.',
    fallbackStyle: 'case-study',
    signalKeywords: [
      'strategy',
      'innovation',
      'market',
      'profit',
      'company',
      'investment',
      'brand',
      'growth',
      'competition',
      'customer',
      'product',
      'finance',
    ],
    domainLabels: ['business', 'management', 'economics'],
    settingOptions: [
      'a product team before a launch decision',
      'a regional company reviewing weak sales',
      'a founder meeting about expansion risk',
    ],
    subjectAngles: [
      'how one decision shapes market response',
      'how innovation becomes useful only with timing and discipline',
      'how a business problem becomes a test of priorities',
    ],
    toneOptions: ['practical', 'analytical', 'clear'],
  },
  {
    id: 'life-story',
    title: 'Life Experience and Storytelling',
    description: 'Journey, challenge, opportunity, and meaningful personal movement.',
    promptFocus: 'Choose one lived situation and let the vocabulary emerge through plot, movement, or reflection.',
    fallbackStyle: 'reflective-story',
    signalKeywords: [
      'journey',
      'challenge',
      'opportunity',
      'choice',
      'future',
      'dream',
      'path',
      'friendship',
      'moment',
      'change',
      'travel',
      'experience',
    ],
    domainLabels: ['life', 'story', 'personal experience'],
    settingOptions: [
      'a train ride toward an uncertain new beginning',
      'a community project that slowly changes direction',
      'a return trip that makes an old decision look different',
    ],
    subjectAngles: [
      'how a challenge opens a different path',
      'how opportunity appears inside ordinary movement',
      'how a journey changes the way someone names the future',
    ],
    toneOptions: ['narrative', 'warm', 'thoughtful'],
  },
  {
    id: 'learning',
    title: 'Learning and Research',
    description: 'Study, inquiry, revision, and the movement from confusion to insight.',
    promptFocus: 'Choose one academic or reflective scene and show ideas developing naturally through work or discussion.',
    fallbackStyle: 'essay',
    signalKeywords: [
      'insight',
      'knowledge',
      'study',
      'report',
      'scholar',
      'research',
      'education',
      'professor',
      'review',
      'analysis',
      'evidence',
      'question',
    ],
    domainLabels: ['learning', 'research', 'education'],
    settingOptions: [
      'a research studio after a failed draft',
      'a library table late in the afternoon',
      'a seminar where one question changes the discussion',
    ],
    subjectAngles: [
      'how understanding grows through revision',
      'how one question reorganizes knowledge',
      'how study becomes meaningful through concrete evidence',
    ],
    toneOptions: ['reflective', 'scholarly', 'natural'],
  },
];

const DOMAIN_KEYWORDS: Array<{ domain: string; keywords: string[] }> = [
  { domain: 'geology', keywords: ['mantle', 'crust', 'magma', 'core', 'volcano', 'mineral', 'rock', 'fault'] },
  { domain: 'geography', keywords: ['longitude', 'latitude', 'map', 'route', 'coast', 'ridge', 'horizon'] },
  { domain: 'psychology', keywords: ['resilience', 'confidence', 'anxiety', 'emotion', 'stress', 'mind', 'habit'] },
  { domain: 'personal growth', keywords: ['recovery', 'courage', 'confidence', 'challenge', 'motivation'] },
  { domain: 'environment', keywords: ['ecosystem', 'climate', 'habitat', 'conservation', 'wetland', 'forest'] },
  { domain: 'biology', keywords: ['species', 'organism', 'mutation', 'diversity', 'bacteria', 'metabolism'] },
  { domain: 'business', keywords: ['strategy', 'innovation', 'market', 'profit', 'company', 'customer', 'product'] },
  { domain: 'economics', keywords: ['investment', 'finance', 'growth', 'competition', 'economy'] },
  { domain: 'life', keywords: ['journey', 'opportunity', 'path', 'future', 'moment', 'experience', 'travel'] },
  { domain: 'learning', keywords: ['insight', 'knowledge', 'study', 'report', 'scholar', 'review', 'question'] },
];

const COMMON_WORDS = new Set([
  'a',
  'about',
  'after',
  'all',
  'also',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'but',
  'by',
  'can',
  'could',
  'day',
  'did',
  'do',
  'down',
  'during',
  'each',
  'even',
  'for',
  'from',
  'had',
  'has',
  'have',
  'he',
  'her',
  'his',
  'how',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'like',
  'made',
  'make',
  'many',
  'more',
  'most',
  'much',
  'near',
  'new',
  'no',
  'not',
  'of',
  'on',
  'one',
  'only',
  'or',
  'our',
  'out',
  'over',
  'part',
  'people',
  'same',
  'she',
  'small',
  'so',
  'some',
  'story',
  'student',
  'students',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'through',
  'to',
  'too',
  'under',
  'up',
  'use',
  'used',
  'using',
  'very',
  'was',
  'we',
  'well',
  'were',
  'what',
  'when',
  'which',
  'while',
  'with',
  'would',
]);

export const AI_READING_GENERATION_PROMPT = `
You are writing an authentic English reading passage for a private learning app.

Generation pipeline:
1. Read the semantic analysis of the target vocabulary.
2. Choose one unified theme.
3. Build one believable context inside that theme.
4. Write one natural reading passage inside that context.

Hard requirements:
1. The article must stay inside one unified topic.
2. Every target word must appear naturally in context.
3. Each target word should appear 1 to 3 times.
4. Never define the target words one by one.
5. Never write teaching-style sentences such as "This word means" or "The definition of".
6. The passage must read like a real science article, documentary, story, essay, observation, or case study.
7. Let meaning emerge through situation, action, evidence, reflection, or consequence.
8. Match the difficulty to the requested learner level and CEFR range.
9. Keep the writing coherent from opening to ending.

Output strict JSON only:
{
  "title": "",
  "article": "",
  "translation": ""
}
`.trim();

export function analyzeVocabularySemantics(
  words: VocabularyWord[],
  preparedProfiles?: AnalyzerSemanticVocabularyProfile[],
): ThemeAnalysis {
  const wordProfiles = (preparedProfiles ?? analyzeSemanticVocabularyWords(words)).map((profile, index) =>
    enrichSemanticProfile(profile, words[index]),
  );
  const analyses = THEMES.map((theme) => {
    const matchedWords = wordProfiles
      .filter((profile) => profileMatchesTheme(profile, theme))
      .map((profile) => profile.word);

    const dominantDomainMatches = wordProfiles.reduce((count, profile) => {
      return count + profile.domain.filter((domain) => theme.domainLabels.includes(domain)).length;
    }, 0);

    return {
      theme,
      score: matchedWords.length * 2 + dominantDomainMatches,
      matchedWords,
    };
  });

  const bestAnalysis = [...analyses].sort((left, right) => right.score - left.score)[0] ?? {
    theme: THEMES.find((theme) => theme.id === 'learning') ?? THEMES[0],
    score: 0,
    matchedWords: [],
  };

  const selectedTheme = bestAnalysis.score > 0 ? bestAnalysis.theme : chooseFallbackTheme(wordProfiles);
  const dominantDomains = rankDomains(wordProfiles);

  return {
    theme: selectedTheme,
    score: bestAnalysis.score,
    matchedWords: wordProfiles.filter((profile) => profileMatchesTheme(profile, selectedTheme)).map((profile) => profile.word),
    wordProfiles,
    dominantDomains,
    semanticSummary: buildSemanticSummary(wordProfiles, selectedTheme, dominantDomains),
  };
}

export function createReadingGenerationPlan({
  words,
  difficulty,
  learningLevel = 'intermediate',
  variant = 0,
  analysis,
}: {
  words: VocabularyWord[];
  difficulty: string;
  learningLevel?: string;
  variant?: number;
  analysis?: ThemeAnalysis;
}): ReadingGenerationPlan {
  const resolvedAnalysis = analysis ?? analyzeVocabularySemantics(words);
  const topic = buildReadingTopicContext({
    words,
    analysis: resolvedAnalysis,
    variant,
  });
  const context = buildReadingContextPlan({
    topic,
    analysis: resolvedAnalysis,
    difficulty,
    learningLevel,
  });

  return {
    analysis: resolvedAnalysis,
    topic,
    context,
  };
}

export function buildAIReadingPrompt({
  words,
  difficulty,
  unknownRatio,
  length,
  learningLevel = 'intermediate',
  analysis,
  topicContext,
  contextPlan,
}: {
  words: VocabularyWord[];
  difficulty: string;
  unknownRatio: number;
  length: number;
  learningLevel?: string;
  analysis?: ThemeAnalysis;
  topicContext?: ReadingTopicContext;
  contextPlan?: ReadingContextPlan;
}) {
  const plan = createReadingGenerationPlan({
    words,
    difficulty,
    learningLevel,
    analysis,
  });
  const resolvedAnalysis = analysis ?? plan.analysis;
  const resolvedTopic = topicContext ?? plan.topic;
  const resolvedContext = contextPlan ?? plan.context;

  return [
    AI_READING_GENERATION_PROMPT,
    'Semantic analysis:',
    ...resolvedAnalysis.wordProfiles.map(
      (profile) =>
        `- ${profile.word}: meaning=${profile.meaning || 'not supplied'}; category=${profile.category}; part_of_speech=${profile.partOfSpeech || 'unknown'}; related_concepts=${profile.relatedConcepts.join(' / ')}; possible_context=${profile.possibleContext.join(' / ')}`,
    ),
    '',
    'Topic planning:',
    `- Theme: ${resolvedAnalysis.theme.title}`,
    `- Theme summary: ${resolvedAnalysis.semanticSummary}`,
    `- Chosen topic: ${resolvedTopic.topicTitle}`,
    `- Subject angle: ${resolvedTopic.subjectAngle}`,
    `- Genre: ${resolvedTopic.genre}`,
    `- Setting: ${resolvedTopic.setting}`,
    `- Central situation: ${resolvedTopic.centralSituation}`,
    '',
    'Context planning:',
    `- Opening focus: ${resolvedContext.openingFocus}`,
    `- Development focus: ${resolvedContext.developmentFocus}`,
    `- Turning point: ${resolvedContext.turningPoint}`,
    `- Closing focus: ${resolvedContext.closingFocus}`,
    `- Word usage guide: ${resolvedContext.wordUsageGuide}`,
    '',
    'Article generation constraints:',
    `- Learner level: ${learningLevel}`,
    `- CEFR difficulty: ${difficulty}`,
    `- Target length: about ${length} words`,
    `- Target unknown vocabulary ratio: ${unknownRatio}%`,
    `- Difficulty guide: ${resolvedContext.difficultyGuide}`,
    `- Target words: ${words.map((word) => word.word).join(', ')}`,
    '- Use each target word naturally and no more than three times.',
    '- Do not define or translate words inside the article body.',
    '- Return strict JSON only.',
  ].join('\n');
}

export function buildReadingTopicContext({
  words,
  analysis,
  variant = 0,
}: {
  words: VocabularyWord[];
  analysis: ThemeAnalysis;
  variant?: number;
}): ReadingTopicContext {
  const theme = analysis.theme;
  const firstWord = normalizeWord(words[0]?.word ?? 'study');
  const setting = pickVariant(theme.settingOptions, variant);
  const subjectAngle = pickVariant(theme.subjectAngles, variant);
  const tone = pickVariant(theme.toneOptions, variant);

  if (theme.id === 'geology') {
    return {
      topicTitle: 'Deep Earth Clues in One Field Scene',
      genre: 'science article or field note',
      setting,
      centralSituation: `a small team must interpret evidence connected to ${firstWord} before making a practical judgment`,
      narrativeGoal: 'show how visible data leads to a better understanding of the earth beneath the surface',
      tone,
      subjectAngle,
      articleFocus: 'physical observation, inference, and grounded explanation through scene',
    };
  }

  if (theme.id === 'psychology') {
    return {
      topicTitle: 'Inner Recovery During One Human Challenge',
      genre: 'personal story or reflective essay',
      setting,
      centralSituation: `one person faces pressure linked to ${firstWord} and must respond without collapsing into self-explanation`,
      narrativeGoal: 'show psychological movement through choice, reaction, and gradual change',
      tone,
      subjectAngle,
      articleFocus: 'behavior, emotion, and recovery inside one lived moment',
    };
  }

  if (theme.id === 'environment') {
    return {
      topicTitle: 'System Change Inside One Living Habitat',
      genre: 'documentary passage or science observation',
      setting,
      centralSituation: `observers notice a shift around ${firstWord} and trace what it reveals about a larger environmental system`,
      narrativeGoal: 'show how one habitat reveals wider ecological relationships',
      tone,
      subjectAngle,
      articleFocus: 'living systems, evidence, and environmental consequence',
    };
  }

  if (theme.id === 'business') {
    return {
      topicTitle: 'Decision Pressure Inside a Real Market Situation',
      genre: 'case study or workplace report',
      setting,
      centralSituation: `a team must make one practical decision around ${firstWord} while facing visible tradeoffs`,
      narrativeGoal: 'show how strategy becomes meaningful through timing, risk, and response',
      tone,
      subjectAngle,
      articleFocus: 'decision, tradeoff, and outcome',
    };
  }

  if (theme.id === 'life-story') {
    return {
      topicTitle: 'A Turning Point in Ordinary Life',
      genre: 'story or reflective narrative',
      setting,
      centralSituation: `someone moving through ${firstWord} begins to see a different future inside one concrete experience`,
      narrativeGoal: 'show how a lived moment changes perspective without becoming a moral lesson',
      tone,
      subjectAngle,
      articleFocus: 'movement, tension, and personal meaning',
    };
  }

  return {
    topicTitle: 'Understanding Through One Concrete Inquiry',
    genre: 'essay, research note, or reflective academic scene',
    setting,
    centralSituation: `a learner or researcher tries to organize a problem around ${firstWord} and arrives at a clearer view`,
    narrativeGoal: 'show how understanding grows through work, discussion, or revision',
    tone,
    subjectAngle,
    articleFocus: 'inquiry, revision, and intellectual movement',
  };
}

export function buildReadingContextPlan({
  topic,
  analysis,
  difficulty,
  learningLevel,
}: {
  topic: ReadingTopicContext;
  analysis: ThemeAnalysis;
  difficulty: string;
  learningLevel: string;
}): ReadingContextPlan {
  return {
    openingFocus: `Open with one concrete moment inside ${topic.setting}.`,
    developmentFocus: `Develop ${analysis.theme.title.toLowerCase()} through ${topic.articleFocus}.`,
    turningPoint: `Introduce one shift that forces a new interpretation of the situation described in "${topic.centralSituation}".`,
    closingFocus: `Close by fulfilling the narrative goal: ${topic.narrativeGoal}.`,
    wordUsageGuide: 'Spread target words across the passage as part of description, action, evidence, or reflection. Avoid clustering them into one sentence.',
    difficultyGuide: buildDifficultyGuide(difficulty, learningLevel),
  };
}

export function createFallbackReadingDraft({
  words,
  plan,
  variant = 0,
}: {
  words: VocabularyWord[];
  plan: ReadingGenerationPlan;
  variant?: number;
}): FallbackDraft {
  const filledWords = fillWords(words, Math.max(words.length, 5));
  const theme = plan.analysis.theme;

  if (theme.fallbackStyle === 'science-article') {
    return buildScienceFallback(filledWords, plan, variant);
  }

  if (theme.fallbackStyle === 'personal-story') {
    return buildPsychologyFallback(filledWords, plan, variant);
  }

  if (theme.fallbackStyle === 'documentary') {
    return buildEnvironmentFallback(filledWords, plan, variant);
  }

  if (theme.fallbackStyle === 'case-study') {
    return buildBusinessFallback(filledWords, plan, variant);
  }

  if (theme.fallbackStyle === 'reflective-story') {
    return buildLifeStoryFallback(filledWords, plan, variant);
  }

  return buildLearningFallback(filledWords, plan, variant);
}

export function validateGeneratedReading({
  article,
  targetWords,
  length,
  unknownRatio,
}: {
  article: string;
  targetWords: VocabularyWord[];
  length: number;
  unknownRatio: number;
}) {
  const normalizedArticle = article.toLowerCase();
  const targetSet = new Set(targetWords.map((word) => normalizeWord(word.word)));
  const coveredTargetWords = [...targetSet].filter((word) =>
    new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(normalizedArticle),
  );
  const missingTargetWords = [...targetSet].filter((word) => !coveredTargetWords.includes(word));

  const articleWords = tokenizeArticle(article);
  const counts = new Map<string, number>();
  for (const token of articleWords) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  const excessiveRepetition = [...counts.entries()]
    .filter(([token, count]) => token.length > 4 && count >= 4 && !COMMON_WORDS.has(token))
    .map(([token]) => token)
    .filter((token) => !targetSet.has(token) || (counts.get(token) ?? 0) > 3);

  const rareWordCount = articleWords.filter(
    (token) => !COMMON_WORDS.has(token) && !targetSet.has(token) && token.length > 5,
  ).length;
  const wordCount = articleWords.length;
  const estimatedUnknownRatio = wordCount === 0 ? 0 : Math.round((rareWordCount / wordCount) * 100);

  const minLength = Math.max(60, length - 25);
  const maxLength = length + 40;
  const minUnknownRatio = Math.max(0, unknownRatio - 5);
  const maxUnknownRatio = unknownRatio + 10;

  const isLengthValid = wordCount >= minLength && wordCount <= maxLength;
  const isUnknownRatioValid = estimatedUnknownRatio >= minUnknownRatio && estimatedUnknownRatio <= maxUnknownRatio;
  const isCoverageValid = missingTargetWords.length === 0 && excessiveRepetition.length === 0;

  return {
    coveredTargetWords,
    missingTargetWords,
    excessiveRepetition,
    wordCount,
    unknownRatio: estimatedUnknownRatio,
    isLengthValid,
    isUnknownRatioValid,
    isCoverageValid,
    isValid: isLengthValid && isUnknownRatioValid && isCoverageValid,
  };
}

export function buildReadingSegmentsFromArticle({
  article,
  learnedWords,
  unknownWords,
}: {
  article: string;
  learnedWords: VocabularyWord[];
  unknownWords: VocabularyWord[];
}) {
  const learnedMap = new Map(learnedWords.map((word) => [normalizeWord(word.word), word]));
  const unknownMap = new Map(unknownWords.map((word) => [normalizeWord(word.word), word]));

  return splitArticleIntoParagraphs(article).map((paragraph) =>
    paragraph.split(/([A-Za-z'-]+)/).flatMap((token) => {
      if (!token) return [];
      if (!/[A-Za-z]/.test(token)) {
        return [{ text: token }];
      }

      const normalized = normalizeWord(token);
      const learnedWord = learnedMap.get(normalized);
      if (learnedWord) {
        return [{ text: token, word: learnedWord, isTodayLearned: true }];
      }

      const unknownWord = unknownMap.get(normalized);
      if (unknownWord) {
        return [{ text: token, word: unknownWord, isUnknown: true }];
      }

      return [{ text: token }];
    }),
  );
}

export function splitArticleIntoParagraphs(article: string) {
  return article
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function chooseFallbackTheme(wordProfiles: VocabularySemanticProfile[]) {
  const allWords = wordProfiles.map((profile) => normalizeWord(profile.word));
  if (allWords.some((word) => ['journey', 'challenge', 'opportunity', 'future', 'path'].includes(word))) {
    return THEMES.find((theme) => theme.id === 'life-story') ?? THEMES[0];
  }
  if (allWords.some((word) => ['resilience', 'confidence', 'anxiety', 'stress'].includes(word))) {
    return THEMES.find((theme) => theme.id === 'psychology') ?? THEMES[0];
  }
  return THEMES.find((theme) => theme.id === 'learning') ?? THEMES[0];
}

function enrichSemanticProfile(
  profile: AnalyzerSemanticVocabularyProfile,
  word?: VocabularyWord,
): VocabularySemanticProfile {
  const signals = `${normalizeWord(profile.word)} ${normalizeMeaning(profile.meaning)} ${profile.category}`;
  const domain = DOMAIN_KEYWORDS.filter((entry) => entry.keywords.some((keyword) => signals.includes(keyword))).map(
    (entry) => entry.domain,
  );
  const resolvedDomains = domain.length > 0 ? domain : profile.category === 'life-story' ? ['life'] : [profile.category];
  const possibleContext = uniqueList([...profile.possibleContexts, ...resolvedDomains.flatMap((value) => contextHintsForDomain(value))]).slice(0, 4);

  return {
    ...profile,
    partOfSpeech: word?.part_of_speech || 'unknown',
    domain: uniqueList(resolvedDomains),
    possibleContext,
  };
}

function buildSemanticSummary(wordProfiles: VocabularySemanticProfile[], theme: SemanticTheme, dominantDomains: string[]) {
  const wordList = wordProfiles.map((profile) => profile.word).join(', ');
  const domains = dominantDomains.join(', ') || 'general context';
  return `Words such as ${wordList} point toward ${theme.title.toLowerCase()} with dominant domains in ${domains}.`;
}

function profileMatchesTheme(profile: VocabularySemanticProfile, theme: SemanticTheme) {
  const profileSignals = `${normalizeWord(profile.word)} ${profile.meaning.toLowerCase()} ${profile.partOfSpeech.toLowerCase()} ${profile.domain.join(' ')}`;
  return theme.signalKeywords.some((keyword) => profileSignals.includes(keyword));
}

function rankDomains(wordProfiles: VocabularySemanticProfile[]) {
  const counts = new Map<string, number>();
  for (const profile of wordProfiles) {
    for (const domain of profile.domain) {
      counts.set(domain, (counts.get(domain) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([domain]) => domain)
    .slice(0, 3);
}

function buildDifficultyGuide(difficulty: string, learningLevel: string) {
  if (learningLevel === 'beginner' || difficulty.startsWith('A')) {
    return 'Prefer short sentences, clear transitions, and concrete actions.';
  }
  if (learningLevel === 'advanced' || difficulty.startsWith('C')) {
    return 'Allow richer sentence variation and deeper reflection, but keep the article natural.';
  }
  return 'Use moderate sentence length, natural connectors, and one clear line of development.';
}

function buildScienceFallback(words: VocabularyWord[], plan: ReadingGenerationPlan, variant: number): FallbackDraft {
  const [w1, w2, w3, w4, w5] = words;
  const titleOptions = ['Tracing Heat Beneath the Ridge', 'Notes from a Volcanic Survey', 'Reading the Ground Before the Storm'];
  const openingPlace = plan.topic.setting;
  return {
    title: pickVariant(titleOptions, variant),
    article: [
      `At dawn, the field team worked through ${openingPlace} and compared fresh notes with the landscape below. What seemed simple at first began to change as the researchers connected ${w1.word}, ${w2.word}, and ${w3.word} to the structure hidden under the surface.`,
      `Their guide explained that the visible rock was only one part of the story. A corrected ${w4.word} reading, a handheld ${w5.word}, and several samples from the outcrop helped the group link surface evidence to deeper movement without turning the lesson into a list of terms.`,
      `By the end of the survey, the hill no longer looked static. It felt like a record of pressure, heat, and time, and each observation mattered because it pushed the team toward a more reliable judgment about the earth beneath their feet.`,
    ].join('\n\n'),
    translation:
      '黎明时，考察小组停在破碎山坡上方，把现场景象与笔记对照。随着他们把地表线索、经度修正和磁性工具联系起来，眼前的山体不再只是静止的景观，而成为地球深部活动留下的记录。',
  };
}

function buildPsychologyFallback(words: VocabularyWord[], plan: ReadingGenerationPlan, variant: number): FallbackDraft {
  const [w1, w2, w3, w4, w5] = words;
  const titleOptions = ['The Quiet Return', 'After the Missed Moment', 'What Stayed After the Noise'];
  const openingPlace = plan.topic.setting;
  return {
    title: pickVariant(titleOptions, variant),
    article: [
      `Inside ${openingPlace}, Lina did not feel brave. The memory of her last failure had left a layer of ${w3.word} in even ordinary moments, and her ${w2.word} had become too fragile to trust.`,
      `What surprised her was not a sudden change, but a slower one. She kept showing up, listened more carefully, and discovered that ${w1.word} was not dramatic at all. It looked like one honest attempt after another, especially on days when the result still felt uncertain.`,
      `A week later, the room had not changed, but her response had. The challenge no longer demanded perfect control. It asked for steadier attention, and that was enough to make the future look wider than it had before.`,
    ].join('\n\n'),
    translation:
      '当 Lina 回到练习室时，她并没有立刻变得勇敢。焦虑和脆弱的自信仍然存在，但她通过一次次真实的尝试慢慢理解了韧性并不是戏剧性的爆发，而是持续回应困难的方式。',
  };
}

function buildEnvironmentFallback(words: VocabularyWord[], plan: ReadingGenerationPlan, variant: number): FallbackDraft {
  const [w1, w2, w3, w4, w5] = words;
  const titleOptions = ['Where the Marsh Began to Change', 'Watching a Habitat Under Pressure', 'The Shoreline Record'];
  const openingPlace = plan.topic.setting;
  const observationVerb = pickVariant(['could see', 'began to notice', 'recorded'], variant);
  return {
    title: pickVariant(titleOptions, variant),
    article: [
      `Working through ${openingPlace}, the team ${observationVerb} how one ${w3.word} held more information than a map ever could. Birds circled lower than they had in spring, the grass line had retreated, and the water moved with a new dullness after weeks of unusual ${w2.word}.`,
      `The researchers followed those changes back through the wider ${w1.word}. What looked like a local shift was tied to nesting patterns, plant cover, and the fragile balance that allowed each ${w4.word || w5.word} to remain in the same place season after season.`,
      `By evening, the documentary notes were no longer about one wetland alone. They described a living system adjusting under pressure, where every altered edge of ${w3.word} suggested a larger environmental story still unfolding.`,
    ].join('\n\n'),
    translation:
      '站在湿地平台上，研究人员从栖息地边缘的变化看到更大的生态系统压力。异常气候、物种活动和水体状态彼此关联，使这片环境看起来像一段仍在展开的纪录片。',
  };
}

function buildBusinessFallback(words: VocabularyWord[], plan: ReadingGenerationPlan, variant: number): FallbackDraft {
  const [w1, w2, w3, w4, w5] = words;
  const titleOptions = ['One Meeting Before the Launch', 'The Week the Numbers Changed', 'A Better Question for the Team'];
  const openingPlace = plan.topic.setting;
  return {
    title: pickVariant(titleOptions, variant),
    article: [
      `Inside ${openingPlace}, the product team met with a problem that looked smaller than it was. Their ${w1.word} seemed clear on paper, and the latest ${w2.word} had impressed everyone inside the company, but the ${w3.word} outside the meeting room was moving faster than expected.`,
      `Sales staff pointed to cautious customers, while finance questioned whether speed would protect the launch or weaken it. The discussion became more useful when the group stopped repeating slogans and treated the next step as a real decision about timing, audience, and risk.`,
      `By the end of the meeting, no one called the answer perfect. Still, the case became easier to manage once the team connected ${w1.word}, ${w2.word}, and ${w3.word} to the same practical question: what would create durable value instead of short applause.`,
    ].join('\n\n'),
    translation:
      '周一早上的产品会议让团队意识到，战略、创新和市场并不是分开的亮点，而是同一个现实问题：如何在时机、客户和风险之间做出可持续的决定。',
  };
}

function buildLifeStoryFallback(words: VocabularyWord[], plan: ReadingGenerationPlan, variant: number): FallbackDraft {
  const [w1, w2, w3, w4, w5] = words;
  const titleOptions = ['The Train Beyond the Old Town', 'A Different Road After Noon', 'What the Return Trip Changed'];
  const openingPlace = plan.topic.setting;
  return {
    title: pickVariant(titleOptions, variant),
    article: [
      `Inside ${openingPlace}, the ${w1.word} began as a practical trip, the kind people make without expecting anything from it. Yet halfway through the day, a small ${w2.word} forced Mei to leave the familiar route and wait in a station she had never planned to see.`,
      `What followed was not dramatic. She shared a bench with an older woman, missed one connection, and listened to a conversation about work, family, and unfinished plans. Somewhere in that slow delay, the word ${w3.word} stopped sounding abstract and began to feel close.`,
      `When the train finally moved again, the landscape outside had not changed much. Mei had. The road ahead still looked uncertain, but it no longer felt closed, and that difference stayed with her long after the trip ended.`,
    ].join('\n\n'),
    translation:
      '这段旅程原本只是一次普通出行，但一次小小的挑战打断了既定路线。正是在等待与观察之间，机会不再抽象，未来也开始呈现出新的可能。',
  };
}

function buildLearningFallback(words: VocabularyWord[], plan: ReadingGenerationPlan, variant: number): FallbackDraft {
  const [w1, w2, w3, w4, w5] = words;
  const titleOptions = ['After the Weak Draft', 'An Idea That Needed Structure', 'The Table Near the Window'];
  const openingPlace = plan.topic.setting;
  return {
    title: pickVariant(titleOptions, variant),
    article: [
      `Inside ${openingPlace}, the seminar ended, but three students stayed behind because the ${w4.word || w3.word} still felt thinner than the material they had collected. Facts were present, yet something about the arrangement of ${w2.word} kept the argument from becoming persuasive.`,
      `Their professor did not offer an easy correction. Instead, she asked one careful question and waited. The room changed as the group returned to ${w3.word}, reconsidered its evidence, and noticed that real ${w1.word} often appears only after a familiar structure begins to fail.`,
      `By the time they packed their notes, the revision no longer felt like punishment. It felt like the ordinary shape of serious learning, where a stronger idea emerges because the first version was not allowed to remain comfortable.`,
    ].join('\n\n'),
    translation:
      '讨论结束后，几位学生留下来修改草稿。他们意识到，知识和研究材料并不少，真正缺失的是由问题推动出来的洞见，而修订本身正是学习的常态。',
  };
}

function fillWords(words: VocabularyWord[], count: number) {
  if (words.length >= count) {
    return words.slice(0, count);
  }

  const filled = [...words];
  while (filled.length < count) {
    filled.push(words[filled.length % Math.max(words.length, 1)] ?? fallbackWord(filled.length));
  }
  return filled;
}

function fallbackWord(index: number): VocabularyWord {
  return {
    id: `fallback-${index}`,
    chapter: 0,
    word: 'study',
    phonetic: '/ˈstʌdi/',
    audio: '',
    part_of_speech: 'n.',
    meaning: '学习；研究',
    example: '',
    word_family: [],
    collocations: [],
    memory: [false, false, false, false, false, false, false],
    spelling: { attempts: 0, correct: 0, errors: 0 },
    memoryMarks: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
    memoryHistory: [],
  };
}

function compactMeaning(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/[；;].*$/, '')
    .replace(/[，,].*$/, '')
    .trim();
}

function normalizeMeaning(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ');
}

function contextHintsForDomain(domain: string) {
  if (domain === 'geology') return ['field report', 'expedition note', 'museum explanation'];
  if (domain === 'geography') return ['route judgment', 'map reading', 'field observation'];
  if (domain === 'psychology') return ['personal setback', 'quiet conversation', 'practice session'];
  if (domain === 'personal growth') return ['recovery scene', 'reflection after failure', 'slow rebuilding'];
  if (domain === 'environment') return ['documentary observation', 'wetland survey', 'forest monitoring'];
  if (domain === 'biology') return ['research journal', 'lab note', 'species observation'];
  if (domain === 'business') return ['team meeting', 'launch review', 'market response'];
  if (domain === 'economics') return ['case study', 'growth review', 'decision briefing'];
  if (domain === 'life') return ['journey narrative', 'turning point story', 'reflective travel note'];
  if (domain === 'learning') return ['seminar reflection', 'study note', 'research discussion'];
  return ['real-world observation', 'short narrative', 'reflective passage'];
}

function uniqueList(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function pickVariant(values: string[], variant: number) {
  return values[((variant % values.length) + values.length) % values.length];
}

function tokenizeArticle(article: string) {
  return (article.toLowerCase().match(/[a-z]+(?:['-][a-z]+)*/g) ?? []).map((token) => normalizeWord(token));
}

function normalizeWord(value: string) {
  return value.trim().toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
