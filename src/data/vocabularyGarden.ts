import ancientTreeIcon from '../assets/garden-icons/ancient-tree.svg';
import growingIcon from '../assets/garden-icons/growing.svg';
import seedIcon from '../assets/garden-icons/seed.svg';
import sproutIcon from '../assets/garden-icons/sprout.svg';
import treeIcon from '../assets/garden-icons/tree.svg';
import { type VocabularyChapterSummary, type VocabularyWord } from './vocabulary';

export type GardenStage = 'seed' | 'sprout' | 'growing' | 'tree' | 'ancient-tree';

export type GardenGrowthState = {
  wordId: string;
  chapter: number;
  gardenStage: GardenStage;
  growthScore: number;
  hasStarted: boolean;
  stability: number;
  learningCycles: number;
  reviewStrength: number;
};

export type ChapterGardenGrowthSummary = {
  chapter: number;
  chapterLabel: string;
  topic: string;
  totalWords: number;
  learnedWords: number;
  progress: number;
  inactiveCount: number;
  stageCounts: Record<GardenStage, number>;
  states: GardenGrowthState[];
  averageStability: number;
  averageReviewStrength: number;
};

export const gardenStageOrder: GardenStage[] = ['seed', 'sprout', 'growing', 'tree', 'ancient-tree'];

export const gardenStageMeta: Record<
  GardenStage,
  {
    label: string;
    note: string;
    tone: string;
    icon: string;
  }
> = {
  seed: {
    label: 'Seed',
    note: 'Present in the garden, waiting for active learning.',
    tone: 'bg-[#d9d1c7]',
    icon: seedIcon,
  },
  sprout: {
    label: 'Sprout',
    note: 'Early contact has begun, but recall is still fragile.',
    tone: 'bg-[#bca98f]',
    icon: sproutIcon,
  },
  growing: {
    label: 'Growing',
    note: 'Repeated success is turning contact into retention.',
    tone: 'bg-[#8d9a7c]',
    icon: growingIcon,
  },
  tree: {
    label: 'Tree',
    note: 'The word is stable and meaningfully available in memory.',
    tone: 'bg-[#50664c]',
    icon: treeIcon,
  },
  'ancient-tree': {
    label: 'Ancient Tree',
    note: 'Longer-lived retention with strong review history.',
    tone: 'bg-[#2f4030]',
    icon: ancientTreeIcon,
  },
};

export function calculateGardenGrowthState(word: VocabularyWord): GardenGrowthState {
  const memoryDepth = word.memory.filter(Boolean).length;
  const completedMarks = word.memoryMarks.filter((mark) => mark !== 'empty').length;
  const checkCount = word.memoryMarks.filter((mark) => mark === 'check').length;
  const attempts = word.spelling.attempts;
  const correct = word.spelling.correct;
  const errors = word.spelling.errors;
  const resetCount = word.memoryHistory.length;
  const hasActivity = memoryDepth > 0 || completedMarks > 0 || attempts > 0 || resetCount > 0;
  const unsureCount = Math.max(0, attempts - correct - errors);
  const growthScore = Math.min(10, Math.max(0, correct - errors - unsureCount));
  const accuracyRatio = attempts > 0 ? correct / attempts : completedMarks > 0 ? checkCount / completedMarks : 0;

  const reviewStrength = clampToPercent(
    growthScore * 10 + memoryDepth * 4 + Math.round(accuracyRatio * 18) + checkCount * 2 - resetCount * 8,
  );

  const stability = clampToPercent(
    growthScore * 8 + memoryDepth * 5 + Math.round(accuracyRatio * 24) + completedMarks - resetCount * 10,
  );

  const learningCycles = resetCount + (hasActivity ? 1 : 0);
  const gardenStage = resolveGardenStage(growthScore);

  return {
    wordId: word.id,
    chapter: word.chapter,
    gardenStage,
    growthScore,
    hasStarted: hasActivity,
    stability,
    learningCycles,
    reviewStrength,
  };
}

export function summarizeChapterGardenGrowth(
  chapter: VocabularyChapterSummary,
  words: VocabularyWord[],
): ChapterGardenGrowthSummary {
  const states = words.map(calculateGardenGrowthState);
  const stageCounts = createEmptyStageCounts();
  let inactiveCount = 0;

  states.forEach((state) => {
    if (!state.hasStarted) {
      inactiveCount += 1;
      return;
    }

    stageCounts[state.gardenStage] += 1;
  });

  return {
    chapter: chapter.chapter,
    chapterLabel: chapter.chapterLabel,
    topic: chapter.topic,
    totalWords: chapter.totalWords,
    learnedWords: chapter.learnedWords,
    progress: chapter.progress,
    inactiveCount,
    stageCounts,
    states,
    averageStability: average(states.map((state) => state.stability)),
    averageReviewStrength: average(states.map((state) => state.reviewStrength)),
  };
}

function resolveGardenStage(growthScore: number): GardenStage {
  if (growthScore >= 10) {
    return 'ancient-tree';
  }

  if (growthScore >= 7) {
    return 'tree';
  }

  if (growthScore >= 5) {
    return 'growing';
  }

  if (growthScore >= 3) {
    return 'sprout';
  }

  return 'seed';
}

function createEmptyStageCounts(): Record<GardenStage, number> {
  return {
    seed: 0,
    sprout: 0,
    growing: 0,
    tree: 0,
    'ancient-tree': 0,
  };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clampToPercent(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}
