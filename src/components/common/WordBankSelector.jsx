import { memo } from "react";
import { HStack, Button, Text, VStack } from "@chakra-ui/react";

const WordBankSelector = ({ banks, selectedBankId, onChange, isLoading }) => {
  if (!banks.length) {
    return null;
  }

  return (
    <VStack align="stretch" spacing={2}>
      <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.08em">
        Word Bank
      </Text>
      <HStack spacing={2} overflowX="auto" pb={1}>
        {banks.map((bank) => {
          const isActive = bank.id === selectedBankId;
          return (
            <Button
              key={bank.id}
              size="sm"
              borderRadius="full"
              px={4}
              flexShrink={0}
              colorScheme={isActive ? "teal" : "gray"}
              variant={isActive ? "solid" : "outline"}
              isLoading={isLoading && isActive}
              onClick={() => onChange(bank.id)}
            >
              {bank.name}
            </Button>
          );
        })}
      </HStack>
    </VStack>
  );
};

export default memo(WordBankSelector);
