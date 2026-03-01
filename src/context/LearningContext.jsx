import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { fetchWordBanks, fetchWordsByBank } from "../api/lingoApi";
import { buildPracticeQuestions } from "../data/practiceQuestions";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { shuffleArray } from "../utils/array";

const LearningContext = createContext(null);

const getDateToken = (date = new Date()) => date.toISOString().slice(0, 10);

const isYesterday = (lastDateToken, todayToken) => {
  const yesterday = new Date(todayToken);
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateToken(yesterday) === lastDateToken;
};

const getDefaultStreak = () => ({
  currentDays: 1,
  lastActiveDate: getDateToken()
});

const getBankValue = (map, bankId, fallback) => {
  if (!map || typeof map !== "object") {
    return fallback;
  }

  return map[bankId] ?? fallback;
};

const updateBankValue = (map, bankId, nextValue) => ({
  ...(map || {}),
  [bankId]: nextValue
});

export const LearningProvider = ({ children }) => {
  const [wordBanks, setWordBanks] = useState([]);
  const [wordDeck, setWordDeck] = useState([]);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [isBankLoading, setIsBankLoading] = useState(true);
  const [bankError, setBankError] = useState("");

  const [selectedWordBank, setSelectedWordBank] = useLocalStorage("lingo-selected-bank", "cet4");
  const [favoritesByBank, setFavoritesByBank] = useLocalStorage("lingo-favorites-by-bank", {});
  const [learnedByBank, setLearnedByBank] = useLocalStorage("lingo-learned-by-bank", {});
  const [focusWordByBank, setFocusWordByBank] = useLocalStorage("lingo-focus-word-by-bank", {});
  const [practiceHistoryByBank, setPracticeHistoryByBank] = useLocalStorage(
    "lingo-practice-history-by-bank",
    {}
  );
  const [streakByBank, setStreakByBank] = useLocalStorage("lingo-streak-by-bank", {});

  const requestIdRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const loadBanks = async () => {
      try {
        const banks = await fetchWordBanks();
        if (!mounted) {
          return;
        }

        setWordBanks(banks);

        if (!banks.some((bank) => bank.id === selectedWordBank)) {
          setSelectedWordBank(banks[0]?.id || "cet4");
        }
      } catch {
        if (!mounted) {
          return;
        }
        setWordBanks([]);
        setBankError("Failed to load remote word bank catalog.");
      }
    };

    loadBanks();

    return () => {
      mounted = false;
    };
  }, [selectedWordBank, setSelectedWordBank]);

  const loadBankData = useCallback(async (bankId, options = {}) => {
    const { shuffle = false } = options;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsBankLoading(true);
    setBankError("");

    try {
      const words = await fetchWordsByBank(bankId);

      if (requestIdRef.current !== requestId) {
        return;
      }

      const deck = shuffle ? shuffleArray(words) : words;
      setWordDeck(deck);
      setPracticeQuestions(buildPracticeQuestions(words));
    } catch {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setWordDeck([]);
      setPracticeQuestions([]);
      setBankError("Failed to load remote data. Please retry later.");
    } finally {
      if (requestIdRef.current === requestId) {
        setIsBankLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedWordBank) {
      return;
    }

    loadBankData(selectedWordBank);
  }, [loadBankData, selectedWordBank]);

  const favorites = useMemo(
    () => getBankValue(favoritesByBank, selectedWordBank, []),
    [favoritesByBank, selectedWordBank]
  );
  const learnedWords = useMemo(
    () => getBankValue(learnedByBank, selectedWordBank, []),
    [learnedByBank, selectedWordBank]
  );
  const focusWordId = useMemo(
    () => getBankValue(focusWordByBank, selectedWordBank, null),
    [focusWordByBank, selectedWordBank]
  );
  const practiceHistory = useMemo(
    () => getBankValue(practiceHistoryByBank, selectedWordBank, []),
    [practiceHistoryByBank, selectedWordBank]
  );
  const streak = useMemo(
    () => getBankValue(streakByBank, selectedWordBank, getDefaultStreak()),
    [selectedWordBank, streakByBank]
  );

  useEffect(() => {
    const today = getDateToken();
    if (streak.lastActiveDate === today) {
      return;
    }

    const nextStreak = isYesterday(streak.lastActiveDate, today)
      ? {
          currentDays: streak.currentDays + 1,
          lastActiveDate: today
        }
      : getDefaultStreak();

    setStreakByBank((prev) => updateBankValue(prev, selectedWordBank, nextStreak));
  }, [selectedWordBank, setStreakByBank, streak.currentDays, streak.lastActiveDate]);

  const refreshDeck = useCallback(async () => {
    await loadBankData(selectedWordBank, { shuffle: true });
  }, [loadBankData, selectedWordBank]);

  const changeWordBank = useCallback(
    (bankId) => {
      if (bankId && bankId !== selectedWordBank) {
        setSelectedWordBank(bankId);
      }
    },
    [selectedWordBank, setSelectedWordBank]
  );

  const toggleFavorite = useCallback(
    (wordId) => {
      setFavoritesByBank((prev) => {
        const current = getBankValue(prev, selectedWordBank, []);
        const next = current.includes(wordId)
          ? current.filter((id) => id !== wordId)
          : [...current, wordId];
        return updateBankValue(prev, selectedWordBank, next);
      });
    },
    [selectedWordBank, setFavoritesByBank]
  );

  const markWordLearned = useCallback(
    (wordId) => {
      setLearnedByBank((prev) => {
        const current = getBankValue(prev, selectedWordBank, []);
        if (current.includes(wordId)) {
          return prev;
        }

        return updateBankValue(prev, selectedWordBank, [...current, wordId]);
      });
    },
    [selectedWordBank, setLearnedByBank]
  );

  const focusWordForLearning = useCallback(
    (wordId) => {
      setFocusWordByBank((prev) => updateBankValue(prev, selectedWordBank, wordId || null));
    },
    [selectedWordBank, setFocusWordByBank]
  );

  const clearFocusWord = useCallback(() => {
    setFocusWordByBank((prev) => updateBankValue(prev, selectedWordBank, null));
  }, [selectedWordBank, setFocusWordByBank]);

  const recordPractice = useCallback(
    ({ score, total }) => {
      const entry = {
        date: getDateToken(),
        score,
        total,
        accuracy: Math.round((score / total) * 100)
      };

      setPracticeHistoryByBank((prev) => {
        const current = getBankValue(prev, selectedWordBank, []);
        return updateBankValue(prev, selectedWordBank, [...current.slice(-19), entry]);
      });
    },
    [selectedWordBank, setPracticeHistoryByBank]
  );

  const progressChartData = useMemo(() => {
    const source = practiceHistory.slice(-7);
    if (!source.length) {
      return [{ day: "Day1", accuracy: 0 }];
    }

    return source.map((item, index) => ({
      day: `D${index + 1}`,
      accuracy: item.accuracy
    }));
  }, [practiceHistory]);

  const vocabularySize = learnedWords.length;

  const value = useMemo(
    () => ({
      wordBanks,
      selectedWordBank,
      changeWordBank,
      wordDeck,
      practiceQuestions,
      favorites,
      learnedWords,
      focusWordId,
      streak,
      practiceHistory,
      progressChartData,
      vocabularySize,
      isBankLoading,
      bankError,
      refreshDeck,
      toggleFavorite,
      markWordLearned,
      focusWordForLearning,
      clearFocusWord,
      recordPractice
    }),
    [
      bankError,
      changeWordBank,
      clearFocusWord,
      favorites,
      focusWordForLearning,
      focusWordId,
      isBankLoading,
      learnedWords,
      markWordLearned,
      practiceHistory,
      practiceQuestions,
      progressChartData,
      recordPractice,
      refreshDeck,
      selectedWordBank,
      streak,
      toggleFavorite,
      vocabularySize,
      wordBanks,
      wordDeck
    ]
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used within LearningProvider");
  }
  return context;
};
