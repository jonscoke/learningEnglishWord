import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  HStack,
  Progress,
  Spinner,
  Text,
  VStack
} from "@chakra-ui/react";
import PageContainer from "../components/common/PageContainer";
import WordBankSelector from "../components/common/WordBankSelector";
import QuestionCard from "../components/practice/QuestionCard";
import { useLearning } from "../context/LearningContext";

const QUESTION_TIME = 30;

const PracticePage = () => {
  const {
    wordBanks,
    selectedWordBank,
    changeWordBank,
    practiceQuestions,
    isBankLoading,
    bankError,
    recordPractice
  } = useLearning();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [feedback, setFeedback] = useState("");
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setIndex(0);
    setScore(0);
    setTimeLeft(QUESTION_TIME);
    setFeedback("");
    setAnswered(false);
    setFinished(false);
  }, [selectedWordBank, practiceQuestions.length]);

  const currentQuestion = useMemo(() => practiceQuestions[index], [index, practiceQuestions]);

  const moveToNext = useCallback(
    (nextScore) => {
      const isLast = index === practiceQuestions.length - 1;
      if (isLast) {
        setFinished(true);
        recordPractice({ score: nextScore, total: practiceQuestions.length });
        return;
      }

      setIndex((prev) => prev + 1);
      setTimeLeft(QUESTION_TIME);
      setAnswered(false);
      setFeedback("");
    },
    [index, practiceQuestions.length, recordPractice]
  );

  const handleSubmit = useCallback(
    (isCorrect) => {
      if (answered || !currentQuestion) {
        return;
      }

      setAnswered(true);
      setFeedback(isCorrect ? "Great! Correct answer." : "Not quite, keep going.");

      const nextScore = isCorrect ? score + 1 : score;
      if (isCorrect) {
        setScore(nextScore);
      }

      window.setTimeout(() => moveToNext(nextScore), 800);
    },
    [answered, currentQuestion, moveToNext, score]
  );

  useEffect(() => {
    if (finished || answered || !currentQuestion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          handleSubmit(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [answered, currentQuestion, finished, handleSubmit]);

  const restart = () => {
    setIndex(0);
    setScore(0);
    setTimeLeft(QUESTION_TIME);
    setFeedback("");
    setAnswered(false);
    setFinished(false);
  };

  return (
    <PageContainer title="Practice Zone" subtitle="Remote practice set synced with selected word bank.">
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

      {isBankLoading && !practiceQuestions.length ? (
        <VStack py={10} spacing={3}>
          <Spinner color="teal.500" thickness="4px" />
          <Text color="gray.500" fontSize="sm">
            Loading remote practice questions...
          </Text>
        </VStack>
      ) : null}

      {!isBankLoading && !practiceQuestions.length ? (
        <Box bg="white" borderRadius="18px" p={5} textAlign="center" color="gray.500">
          No practice questions found for this bank.
        </Box>
      ) : null}

      {practiceQuestions.length > 0 && finished ? (
        <VStack
          spacing={4}
          bg="white"
          borderRadius="24px"
          p={6}
          boxShadow="0 20px 44px rgba(15, 23, 42, 0.07)"
        >
          <Text fontSize="3xl" fontWeight="700">
            {score}/{practiceQuestions.length}
          </Text>
          <Text color="gray.600">
            Accuracy: {Math.round((score / practiceQuestions.length) * 100)}%
          </Text>
          <Button colorScheme="teal" borderRadius="full" onClick={restart}>
            Practice Again
          </Button>
        </VStack>
      ) : null}

      {practiceQuestions.length > 0 && !finished ? (
        <>
          <Box bg="white" borderRadius="18px" p={4} boxShadow="0 10px 26px rgba(15, 23, 42, 0.05)">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.600">
                Question {index + 1}/{practiceQuestions.length}
              </Text>
              <Text fontSize="sm" fontWeight="700" color={timeLeft <= 8 ? "red.500" : "teal.600"}>
                {timeLeft}s
              </Text>
            </HStack>
            <Progress value={(timeLeft / QUESTION_TIME) * 100} colorScheme="teal" borderRadius="full" h="8px" />
          </Box>

          <QuestionCard
            key={`${selectedWordBank}-${currentQuestion?.id || "empty"}`}
            question={currentQuestion}
            onSubmit={handleSubmit}
            disabled={answered}
          />

          {feedback && (
            <Box
              borderRadius="14px"
              bg={feedback.includes("Great") ? "teal.50" : "orange.50"}
              border="1px solid"
              borderColor={feedback.includes("Great") ? "teal.100" : "orange.100"}
              px={4}
              py={3}
            >
              <Text color={feedback.includes("Great") ? "teal.700" : "orange.700"} fontWeight="700">
                {feedback}
              </Text>
            </Box>
          )}
        </>
      ) : null}
    </PageContainer>
  );
};

export default PracticePage;
