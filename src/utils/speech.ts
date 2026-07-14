let queuedVoiceRetry: number | null = null;
let activeAudio: HTMLAudioElement | null = null;

export function speakWord(word: string) {
  const text = word.trim();
  if (!text) return;

  const audioStarted = tryPlayAudioPronunciation(text);
  if (audioStarted) {
    return;
  }

  speakWithBrowserVoice(text);
}

function tryPlayAudioPronunciation(word: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    if (typeof Audio === 'undefined') {
      return false;
    }
  }

  if (typeof Audio === 'undefined') {
    return false;
  }

  const sources = [
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(word)}`,
    `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`,
  ];

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }

  let sourceIndex = 0;
  const audio = new Audio();
  audio.preload = 'auto';

  const playNextSource = () => {
    if (sourceIndex >= sources.length) {
      activeAudio = null;
      speakWithBrowserVoice(word);
      return;
    }

    audio.src = sources[sourceIndex];
    sourceIndex += 1;
    void audio.play().catch(() => {
      playNextSource();
    });
  };

  activeAudio = audio;
  playNextSource();
  return true;
}

function speakWithBrowserVoice(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    return;
  }

  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const preferredVoice = pickPreferredVoice(voices);

  utterance.lang = preferredVoice?.lang || 'en-US';
  utterance.voice = preferredVoice ?? null;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (queuedVoiceRetry !== null) {
    window.clearTimeout(queuedVoiceRetry);
    queuedVoiceRetry = null;
  }

  synth.cancel();

  if (synth.paused) {
    synth.resume();
  }

  if (voices.length === 0) {
    queuedVoiceRetry = window.setTimeout(() => {
      queuedVoiceRetry = null;
      speakWithBrowserVoice(text);
    }, 120);
  }

  synth.speak(utterance);
}

function pickPreferredVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en-us')) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ??
    voices.find((voice) => voice.default) ??
    voices[0]
  );
}
