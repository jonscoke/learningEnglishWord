import { memo } from "react";
import { Badge, Box, Image, Text, VStack } from "@chakra-ui/react";

const AchievementBadge = ({ badge, unlocked }) => {
  return (
    <Box
      borderRadius="16px"
      p={3}
      bg={unlocked ? "white" : "gray.50"}
      border="1px solid"
      borderColor={unlocked ? "teal.100" : "gray.100"}
      boxShadow={unlocked ? "0 12px 28px rgba(15, 118, 110, 0.12)" : "none"}
    >
      <VStack align="stretch" spacing={2}>
        <Image
          src={badge.image}
          alt={badge.title}
          borderRadius="12px"
          h="88px"
          objectFit="cover"
          loading="lazy"
        />
        <Text fontWeight="700" fontSize="sm">
          {badge.title}
        </Text>
        <Text fontSize="xs" color="gray.600">
          {badge.description}
        </Text>
        <Badge alignSelf="flex-start" colorScheme={unlocked ? "teal" : "gray"} borderRadius="full" px={2}>
          {unlocked ? "Unlocked" : "Locked"}
        </Badge>
      </VStack>
    </Box>
  );
};

export default memo(AchievementBadge);
