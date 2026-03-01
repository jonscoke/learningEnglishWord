import { memo } from "react";
import { HStack, Text } from "@chakra-ui/react";

const WordSwiper = ({ index, total }) => {
  return (
    <HStack justify="space-between" px={1}>
      <Text fontSize="sm" color="gray.600">
        Swipe left or right to switch cards
      </Text>
      <Text fontSize="sm" color="gray.500" fontWeight="700">
        {index + 1}/{total}
      </Text>
    </HStack>
  );
};

export default memo(WordSwiper);
