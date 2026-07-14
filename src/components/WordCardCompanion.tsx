import type { WordAction } from '../data/vocabulary';
import wordCardIllustrationKnown from '../assets/word-card-known-user-cutout.png';
import wordCardIllustrationUnsure from '../assets/word-card-unsure-user-cutout.png';
import wordCardIllustrationUnknown from '../assets/word-card-unknown-user-cutout.png';

type WordCardCompanionProps = {
  action: WordAction | null;
};

const companionContent: Record<
  string,
  {
    image: string;
    text: string;
  }
> = {
  known: {
    image: wordCardIllustrationKnown,
    text: 'Ivy 你太厉害啦！',
  },
  unsure: {
    image: wordCardIllustrationUnsure,
    text: '赶快拿小本本记下来！',
  },
  unknown: {
    image: wordCardIllustrationUnknown,
    text: '单词快点进我脑子里...',
  },
};

export function WordCardCompanion({ action }: WordCardCompanionProps) {
  if (action === null) {
    return null;
  }

  const content = companionContent[action];

  return (
    <div className="pointer-events-none absolute bottom-8 right-0 z-0 hidden w-[28%] min-w-[180px] max-w-[280px] items-end justify-end lg:flex">
      <div className="relative w-full">
        <div className="absolute -top-24 left-0 max-w-[15rem] rounded-[26px] border border-line/80 bg-white/90 px-5 py-4 shadow-card backdrop-blur-sm">
          <p className="text-[17px] leading-7 text-ink">{content.text}</p>
          <span className="absolute -bottom-3 right-8 h-5 w-5 rotate-45 border-b border-r border-line/80 bg-white/90" />
        </div>

        <img
          src={content.image}
          alt=""
          className="max-h-[20vh] w-full object-contain opacity-95"
        />
      </div>
    </div>
  );
}
