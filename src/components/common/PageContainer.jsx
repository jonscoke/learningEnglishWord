import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const PageContainer = ({ title, subtitle, children }) => {
  return (
    <VStack
      align="stretch"
      spacing={4}
      px={4}
      pt="calc(env(safe-area-inset-top) + 20px)"
      pb="94px"
      maxW="480px"
      mx="auto"
    >
      <Box>
        <Heading size="lg" mb={1} letterSpacing="0.2px">
          {title}
        </Heading>
        <Text color="gray.600" fontSize="sm">
          {subtitle}
        </Text>
      </Box>
      {children}
    </VStack>
  );
};

export default PageContainer;
