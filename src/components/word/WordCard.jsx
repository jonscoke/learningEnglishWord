import { memo, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaVolumeUp } from "react-icons/fa";

const LONG_PRESS_MS = 550;
const FLIP_DURATION_MS = 620;
const FLIP_COOLDOWN_MS = 850;

const WordCard = ({
  word,
  isFavorite,
  onToggleFavorite,
  onSpeak,
  onNext,
  onPrev,
  onLongPress
}) => {
  const [flipped, setFlipped] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const pressTimer = useRef(null);
  const lastFlipAt = useRef(0);

  const cardGradient = useMemo(() => "linear(to-br, brand.500, brand.700)", []);

  const clearLongPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handlePressStart = () => {
    clearLongPress();
    pressTimer.current = setTimeout(() => {
      onLongPress();
    }, LONG_PRESS_MS);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
    handlePressStart();
  };

  const handleTouchMove = (event) => {
    const currentX = event.touches[0].clientX;
    setSwipeOffset(currentX - touchStartX.current);
  };

  const handleTouchEnd = () => {
    clearLongPress();
    if (swipeOffset < -55) {
      onNext();
    }
    if (swipeOffset > 55) {
      onPrev();
    }
    setSwipeOffset(0);
  };

  const handleFlip = () => {
    const now = Date.now();
    if (isAnimating || now - lastFlipAt.current < FLIP_COOLDOWN_MS) {
      return;
    }

    lastFlipAt.current = now;
    setIsAnimating(true);
    setFlipped((prev) => !prev);
    window.setTimeout(() => setIsAnimating(false), FLIP_DURATION_MS + 40);
  };

  const meaningZh = word.meaningZh || word.meaning;

  return (
    <VStack spacing={4} align="stretch">
      <Box
        borderRadius="card"
        p={5}
        h="320px"
        boxShadow="0 24px 48px rgba(23, 115, 95, 0.16)"
        position="relative"
        overflow="hidden"
        cursor="pointer"
        transform={`translateX(${swipeOffset}px)`}
        transition="transform 0.2s ease"
        onClick={handleFlip}
        onMouseDown={handlePressStart}
        onMouseUp={clearLongPress}
        onMouseLeave={clearLongPress}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Flex justify="space-between" align="center" mb={3} position="relative" zIndex={3}>
          <Text fontWeight="700" fontSize="sm" color={flipped ? "whiteAlpha.900" : "brand.600"}>
            {flipped ? "Back Side" : "Front Side"}
          </Text>
          <IconButton
            aria-label="toggle favorite"
            icon={isFavorite ? <FaHeart /> : <FaRegHeart />}
            variant="ghost"
            color={isFavorite ? "pink.300" : flipped ? "whiteAlpha.800" : "gray.500"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
          />
        </Flex>

        <Box position="relative" h="250px" style={{ perspective: "1200px" }}>
          <Box
            position="relative"
            h="100%"
            borderRadius="18px"
            overflow="hidden"
            style={{
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d"
            }}
          >
            <Flex
              position="absolute"
              inset="0"
              direction="column"
              align="center"
              justify="center"
              px={4}
              textAlign="center"
              bg="#edfdf9"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitTransform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                transition: `transform ${FLIP_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${FLIP_DURATION_MS}ms ease`,
                opacity: flipped ? 0 : 1
              }}
            >
              <Text fontSize="4xl" fontWeight="700" color="gray.800">
                {word.word}
              </Text>
              <Text color="gray.600" fontSize="lg" mt={2}>
                {word.phonetic || "-"}
              </Text>
              <Text color="gray.500" fontSize="sm" mt={2}>
                Tap to flip, hold for details
              </Text>
            </Flex>

            <Flex
              position="absolute"
              inset="0"
              direction="column"
              align="center"
              justify="center"
              px={4}
              textAlign="center"
              bgGradient={cardGradient}
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitTransform: flipped ? "rotateY(0deg)" : "rotateY(-180deg)",
                transform: flipped ? "rotateY(0deg)" : "rotateY(-180deg)",
                transition: `transform ${FLIP_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${FLIP_DURATION_MS}ms ease`,
                opacity: flipped ? 1 : 0
              }}
            >
              <Text fontSize="md" color="whiteAlpha.900" fontWeight="700">
                Translation
              </Text>
              <Text fontSize="2xl" fontWeight="700" color="white" mt={2}>
                {meaningZh}
              </Text>
              {word.meaningEn ? (
                <Text fontSize="sm" color="whiteAlpha.900" mt={1}>
                  {word.meaningEn}
                </Text>
              ) : null}
              <Text fontSize="sm" color="whiteAlpha.900" mt={3}>
                {word.example}
              </Text>
              {word.exampleCn ? (
                <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
                  {word.exampleCn}
                </Text>
              ) : null}
            </Flex>
          </Box>
        </Box>
      </Box>

      <HStack spacing={3} justify="center">
        <Button variant="outline" colorScheme="gray" borderRadius="full" onClick={onPrev}>
          Previous
        </Button>
        <IconButton
          aria-label="play pronunciation"
          icon={<FaVolumeUp />}
          colorScheme="teal"
          borderRadius="full"
          onClick={onSpeak}
        />
        <Button colorScheme="teal" borderRadius="full" onClick={onNext}>
          Next
        </Button>
      </HStack>
    </VStack>
  );
};

export default memo(WordCard);
