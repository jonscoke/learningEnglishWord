import { Alert, AlertIcon, Box, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageContainer from "../components/common/PageContainer";
import WordBankSelector from "../components/common/WordBankSelector";
import AchievementBadge from "../components/progress/AchievementBadge";
import StatsCards from "../components/progress/StatsCards";
import VirtualWordList from "../components/progress/VirtualWordList";
import { useLearning } from "../context/LearningContext";
import { badges } from "../data/practiceQuestions";

const ProgressPage = () => {
  const {
    wordBanks,
    selectedWordBank,
    changeWordBank,
    wordDeck,
    streak,
    vocabularySize,
    practiceHistory,
    progressChartData,
    learnedWords,
    isBankLoading,
    bankError
  } = useLearning();

  const avgAccuracy =
    practiceHistory.length === 0
      ? 0
      : Math.round(
          practiceHistory.reduce((sum, item) => sum + item.accuracy, 0) / practiceHistory.length
        );

  const learnedWordItems = wordDeck.filter((word) => learnedWords.includes(word.id));

  return (
    <PageContainer title="Progress Dashboard" subtitle="Track your progress by selected remote word bank.">
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

      {isBankLoading && !wordDeck.length ? (
        <VStack py={10} spacing={3}>
          <Spinner color="teal.500" thickness="4px" />
          <Text color="gray.500" fontSize="sm">
            Loading progress data...
          </Text>
        </VStack>
      ) : null}

      <StatsCards streakDays={streak.currentDays} vocabularySize={vocabularySize} accuracy={avgAccuracy} />

      <Box bg="white" borderRadius="20px" p={4} boxShadow="0 20px 44px rgba(15, 23, 42, 0.07)">
        <Text fontWeight="700" mb={3}>
          Accuracy Trend
        </Text>
        <Box h="210px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressChartData}>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#1f9d86" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <VStack align="stretch" spacing={3}>
        <Text fontWeight="700">Achievement Badges</Text>
        <SimpleGrid columns={2} spacing={3}>
          {badges.map((badge) => {
            const unlockedByStreak = badge.threshold ? streak.currentDays >= badge.threshold : false;
            const unlockedByVocab = badge.vocabThreshold ? vocabularySize >= badge.vocabThreshold : false;
            return (
              <AchievementBadge
                key={badge.id}
                badge={badge}
                unlocked={unlockedByStreak || unlockedByVocab}
              />
            );
          })}
        </SimpleGrid>
      </VStack>

      <VirtualWordList words={learnedWordItems.length ? learnedWordItems : wordDeck.slice(0, 12)} />
    </PageContainer>
  );
};

export default ProgressPage;
