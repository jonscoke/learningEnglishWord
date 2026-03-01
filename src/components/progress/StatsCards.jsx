import { memo } from "react";
import { SimpleGrid, Stat, StatLabel, StatNumber } from "@chakra-ui/react";

const StatsCards = ({ streakDays, vocabularySize, accuracy }) => {
  const cards = [
    { label: "Streak", value: `${streakDays} days` },
    { label: "Vocabulary", value: `${vocabularySize} words` },
    { label: "Accuracy", value: `${accuracy}%` }
  ];

  return (
    <SimpleGrid columns={3} spacing={3}>
      {cards.map((card) => (
        <Stat
          key={card.label}
          bg="white"
          p={3}
          borderRadius="18px"
          boxShadow="0 10px 26px rgba(15, 23, 42, 0.05)"
        >
          <StatLabel fontSize="xs" color="gray.500">
            {card.label}
          </StatLabel>
          <StatNumber fontSize="md">{card.value}</StatNumber>
        </Stat>
      ))}
    </SimpleGrid>
  );
};

export default memo(StatsCards);
