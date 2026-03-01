import { pickRandom, shuffleArray } from "../utils/array";

const sanitizeWords = (words = []) =>
  words
    .filter((item) => item && item.word && (item.meaning || item.meaningZh || item.meaningEn))
    .map((item, index) => {
      const meaningZh = String(item.meaningZh || item.meaning || "").trim();
      const meaningEn = String(item.meaningEn || "").trim();
      const displayMeaning = meaningZh || meaningEn || "No translation";

      return {
        id: item.id ?? `${item.word}-${index}`,
        word: String(item.word),
        phonetic: item.phonetic ? String(item.phonetic) : "",
        meaning: displayMeaning,
        meaningZh,
        meaningEn,
        example: item.example ? String(item.example) : `Use '${item.word}' in a sentence.`,
        exampleCn: item.exampleCn ? String(item.exampleCn) : "",
        synonyms: Array.isArray(item.synonyms) ? item.synonyms.map((entry) => String(entry)) : [],
        difficulty: item.difficulty ? String(item.difficulty) : ""
      };
    });

const buildMcq = (targetWord, distractors) => ({
  id: `mcq-${targetWord.word}`,
  type: "mcq",
  prompt: `Choose the Chinese meaning of '${targetWord.word}'.`,
  options: shuffleArray([
    targetWord.meaningZh || targetWord.meaning,
    ...distractors.map((item) => item.meaningZh || item.meaning)
  ]),
  answer: targetWord.meaningZh || targetWord.meaning,
  explanation: targetWord.exampleCn || targetWord.example
});

const buildFill = (targetWord) => ({
  id: `fill-${targetWord.word}`,
  type: "fill",
  prompt: `Fill in the English word for: ${targetWord.meaningZh || targetWord.meaning}.`,
  answer: targetWord.word.toLowerCase(),
  hint: targetWord.phonetic
});

const buildListening = (targetWord, distractors) => ({
  id: `listen-${targetWord.word}`,
  type: "listening",
  prompt: "Tap the speaker and choose the word you hear.",
  speechText: targetWord.word,
  options: shuffleArray([targetWord.word, ...distractors.map((item) => item.word)]),
  answer: targetWord.word,
  meaning: `${targetWord.meaningZh || targetWord.meaning}${
    targetWord.meaningEn ? ` / ${targetWord.meaningEn}` : ""
  }`
});

const buildOrdering = (targetWord) => {
  const sentence = targetWord.example || `${targetWord.word} improves communication skills.`;
  const words = sentence.split(" ").filter(Boolean);
  return {
    id: `order-${targetWord.word}`,
    type: "ordering",
    prompt: "Drag the words to make a correct sentence.",
    answer: words,
    options: shuffleArray(words),
    helper: `Target word: ${targetWord.word} (${targetWord.meaningZh || targetWord.meaning})`
  };
};

const getDistractors = (allWords, targetWord, count = 3) =>
  pickRandom(allWords.filter((item) => item.id !== targetWord.id), count);

export const buildPracticeQuestions = (rawWords = []) => {
  const words = sanitizeWords(rawWords);
  if (words.length < 4) {
    return [];
  }

  const targetWords = pickRandom(words, Math.min(6, words.length));

  return [
    buildMcq(targetWords[0], getDistractors(words, targetWords[0])),
    buildFill(targetWords[1] ?? targetWords[0]),
    buildListening(
      targetWords[2] ?? targetWords[0],
      getDistractors(words, targetWords[2] ?? targetWords[0])
    ),
    buildOrdering(targetWords[3] ?? targetWords[0]),
    buildMcq(
      targetWords[4] ?? targetWords[1] ?? targetWords[0],
      getDistractors(words, targetWords[4] ?? targetWords[1] ?? targetWords[0])
    ),
    buildFill(targetWords[5] ?? targetWords[2] ?? targetWords[0])
  ];
};

export const normalizeWords = sanitizeWords;

export const badges = [
  {
    id: "streak3",
    title: "3-Day Spark",
    description: "Keep learning for 3 straight days",
    threshold: 3,
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=120&q=60"
  },
  {
    id: "streak7",
    title: "7-Day Runner",
    description: "Reach a 7-day streak",
    threshold: 7,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&q=60"
  },
  {
    id: "vocab20",
    title: "Word Collector",
    description: "Master 20 words",
    vocabThreshold: 20,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=120&q=60"
  }
];
