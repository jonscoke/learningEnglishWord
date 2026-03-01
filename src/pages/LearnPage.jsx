import { useEffect, useMemo, useState } from "react";
import { Alert, AlertIcon, Box, Spinner, Text, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import PageContainer from "../components/common/PageContainer";
import WordBankSelector from "../components/common/WordBankSelector";
import WordCard from "../components/word/WordCard";
import WordSwiper from "../components/word/WordSwiper";
import WordDetailDrawer from "../components/word/WordDetailDrawer";
import { useLearning } from "../context/LearningContext";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { speakText } from "../utils/speech";

const LearnPage = () => {
  const toast = useToast();
  const {
    wordBanks,
    selectedWordBank,
    changeWordBank,
    wordDeck,
    favorites,
    isBankLoading,
    bankError,
    refreshDeck,
    toggleFavorite,
    markWordLearned
  } = useLearning();
  const [index, setIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setIndex(0);
  }, [selectedWordBank]);

  useEffect(() => {
    if (wordDeck.length && index >= wordDeck.length) {
      setIndex(0);
    }
  }, [index, wordDeck.length]);

  const currentWord = useMemo(() => wordDeck[index], [index, wordDeck]);

  const onRefresh = async () => {
    await refreshDeck();
    setIndex(0);
    toast({
      title: "Word deck refreshed",
      status: "success",
      duration: 1200,
      position: "top"
    });
  };

  const { pullDistance, refreshing } = usePullToRefresh(onRefresh);

  const goNext = () => {
    if (!currentWord) {
      return;
    }

    markWordLearned(currentWord.id);
    setIndex((prev) => (prev + 1) % wordDeck.length);
  };

  const goPrev = () => {
    if (!wordDeck.length) {
      return;
    }

    setIndex((prev) => (prev - 1 + wordDeck.length) % wordDeck.length);
  };

  return (
    <PageContainer
      title="LingoLearn"
      subtitle="Remote word banks for CET-4, CET-6 and TEM-8. Pull down to refresh."
    >
      <WordBankSelector
        banks={wordBanks}
        selectedBankId={selectedWordBank}
        onChange={changeWordBank}
        isLoading={isBankLoading}
      />

      {bankError && (
        <Alert status="warning" borderRadius="14px">
          <AlertIcon />
          {bankError}
        </Alert>
      )}

      <Box
        className="pull-indicator"
        textAlign="center"
        py={2}
        color="teal.600"
        fontSize="sm"
        transform={`translateY(${Math.min(pullDistance, 70)}px)`}
      >
        {refreshing ? "Refreshing..." : pullDistance > 8 ? "Release to refresh" : ""}
      </Box>

      {isBankLoading && !wordDeck.length ? (
        <VStack py={10} spacing={3}>
          <Spinner color="teal.500" thickness="4px" />
          <Text color="gray.500" fontSize="sm">
            Loading remote word deck...
          </Text>
        </VStack>
      ) : null}

      {!isBankLoading && wordDeck.length > 0 ? <WordSwiper index={index} total={wordDeck.length} /> : null}

      {currentWord ? (
        <WordCard
          key={`${selectedWordBank}-${currentWord.id}`}
          word={currentWord}
          isFavorite={favorites.includes(currentWord.id)}
          onToggleFavorite={() => toggleFavorite(currentWord.id)}
          onSpeak={() => speakText(`${currentWord.word}. ${currentWord.example}`)}
          onNext={goNext}
          onPrev={goPrev}
          onLongPress={onOpen}
        />
      ) : null}

      {!isBankLoading && !currentWord ? (
        <Box bg="white" borderRadius="18px" p={5} textAlign="center" color="gray.500">
          No words found in this bank.
        </Box>
      ) : null}

      <Text fontSize="xs" color="gray.500" textAlign="center">
        Long press card for detail - tap card to flip
      </Text>

      <WordDetailDrawer isOpen={isOpen} onClose={onClose} word={currentWord} />
    </PageContainer>
  );
};

export default LearnPage;
