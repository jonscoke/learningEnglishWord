import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { FaBookOpen, FaChartLine, FaPenFancy } from "react-icons/fa";

const navItems = [
  { key: "learn", label: "Learn", icon: FaBookOpen },
  { key: "practice", label: "Practice", icon: FaPenFancy },
  { key: "progress", label: "Progress", icon: FaChartLine }
];

const BottomNav = ({ activeTab, onTabChange }) => {
  return (
    <Flex
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      maxW="480px"
      mx="auto"
      px={4}
      py={3}
      pb="calc(env(safe-area-inset-bottom) + 12px)"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.100"
      zIndex="sticky"
      justify="space-between"
      boxShadow="0 -10px 24px rgba(15, 23, 42, 0.06)"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <Flex
            key={item.key}
            direction="column"
            align="center"
            justify="center"
            cursor="pointer"
            onClick={() => onTabChange(item.key)}
            color={isActive ? "brand.600" : "gray.500"}
            transition="all 0.2s ease"
            transform={isActive ? "translateY(-2px)" : "none"}
            minW="68px"
          >
            <Box
              p={2}
              borderRadius="full"
              bg={isActive ? "brand.50" : "transparent"}
              mb={1}
            >
              <Icon as={item.icon} boxSize={4} />
            </Box>
            <Text fontSize="xs" fontWeight="700">
              {item.label}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default BottomNav;
