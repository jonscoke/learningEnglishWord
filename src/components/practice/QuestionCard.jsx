import { memo, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack
} from "@chakra-ui/react";
import { FaVolumeUp } from "react-icons/fa";
import DragOrderQuestion from "./DragOrderQuestion";
import { speakText } from "../../utils/speech";

const OptionButton = memo(({ text, onClick, disabled }) => (
  <Button
    onClick={() => onClick(text)}
    variant="outline"
    borderRadius="14px"
    minH="54px"
    whiteSpace="normal"
    textAlign="left"
    justifyContent="flex-start"
    isDisabled={disabled}
  >
    {text}
  </Button>
));

const QuestionCard = ({ question, onSubmit, disabled }) => {
  const [fillAnswer, setFillAnswer] = useState("");

  if (!question) {
    return null;
  }

  const submitFill = () => {
    const isCorrect = fillAnswer.trim().toLowerCase() === question.answer;
    onSubmit(isCorrect);
    setFillAnswer("");
  };

  return (
    <Box borderRadius="24px" bg="white" p={5} boxShadow="0 20px 44px rgba(15, 23, 42, 0.07)">
      <VStack align="stretch" spacing={4}>
        <Text fontWeight="700" fontSize="lg">
          {question.prompt}
        </Text>

        {(question.type === "mcq" || question.type === "listening") && (
          <SimpleGrid columns={1} spacing={3}>
            {question.type === "listening" && (
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color="gray.500">
                  Meaning: {question.meaning}
                </Text>
                <Button
                  size="sm"
                  leftIcon={<FaVolumeUp />}
                  colorScheme="teal"
                  variant="ghost"
                  onClick={() => speakText(question.speechText)}
                >
                  Play
                </Button>
              </HStack>
            )}

            {question.options.map((option) => (
              <OptionButton
                key={option}
                text={option}
                onClick={(value) => onSubmit(value === question.answer)}
                disabled={disabled}
              />
            ))}
          </SimpleGrid>
        )}

        {question.type === "fill" && (
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm" color="gray.500">
              Hint: {question.hint}
            </Text>
            <Input
              value={fillAnswer}
              onChange={(event) => setFillAnswer(event.target.value)}
              placeholder="Type the missing word"
              borderRadius="14px"
              size="lg"
              isDisabled={disabled}
            />
            <Button colorScheme="teal" borderRadius="full" onClick={submitFill} isDisabled={disabled}>
              Submit Answer
            </Button>
          </VStack>
        )}

        {question.type === "ordering" && (
          <DragOrderQuestion question={question} onSubmit={onSubmit} disabled={disabled} />
        )}
      </VStack>
    </Box>
  );
};

export default memo(QuestionCard);
