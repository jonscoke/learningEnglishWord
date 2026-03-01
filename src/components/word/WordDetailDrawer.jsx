import { Badge, Divider, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, HStack, Text, VStack } from "@chakra-ui/react";

const WordDetailDrawer = ({ isOpen, onClose, word }) => {
  if (!word) {
    return null;
  }

  return (
    <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent borderTopRadius="24px" maxH="70vh">
        <DrawerHeader>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700">
              {word.word}
            </Text>
            <Text color="gray.500">{word.phonetic}</Text>
          </VStack>
        </DrawerHeader>
        <DrawerBody pb={8}>
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="700">
              {word.meaningZh || word.meaning}
            </Text>
            {word.meaningEn ? (
              <Text fontSize="sm" color="gray.600">
                {word.meaningEn}
              </Text>
            ) : null}
            <Divider />
            <Text fontSize="sm" color="gray.600">
              {word.example}
            </Text>
            {word.exampleCn ? (
              <Text fontSize="sm" color="gray.500">
                {word.exampleCn}
              </Text>
            ) : null}
            <HStack spacing={2} flexWrap="wrap">
              {(word.synonyms || []).map((item) => (
                <Badge key={item} colorScheme="teal" borderRadius="full" px={3} py={1}>
                  {item}
                </Badge>
              ))}
            </HStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default WordDetailDrawer;
