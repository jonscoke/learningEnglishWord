import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Box, Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { FixedSizeList as List } from "react-window";

const ITEM_SIZE = 58;
const INITIAL_LOAD = 40;
const LOAD_STEP = 40;

const WordRow = memo(({ data, index, style }) => {
  const { items, learnedWordSet, onLearnWord } = data;
  const item = items[index];
  const isLearned = learnedWordSet.has(item.id);

  return (
    <Box
      style={style}
      px={3}
      py={2}
      borderBottom="1px solid"
      borderColor="gray.100"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      cursor="pointer"
      _hover={{ bg: "gray.50" }}
      onClick={() => onLearnWord?.(item.id)}
    >
      <Box maxW="56%">
        <Text fontWeight="700" noOfLines={1}>
          {item.word}
        </Text>
        <Text color="gray.500" fontSize="xs">
          {item.phonetic || "-"}
        </Text>
      </Box>
      <Box textAlign="right" maxW="44%">
        <Text color="gray.500" fontSize="sm" noOfLines={1}>
          {item.meaningZh || item.meaning}
        </Text>
        <Badge colorScheme={isLearned ? "teal" : "gray"} variant="subtle" mt={1}>
          {isLearned ? "Learned" : "Tap to learn"}
        </Badge>
      </Box>
    </Box>
  );
});

const VirtualWordList = ({ words, learnedWordIds = [], onLearnWord }) => {
  const [query, setQuery] = useState("");
  const [width, setWidth] = useState(320);
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);

  const learnedWordSet = useMemo(() => new Set(learnedWordIds), [learnedWordIds]);

  const filteredWords = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return words;
    }

    return words.filter((item) =>
      [item.word, item.meaningZh, item.meaning, item.phonetic].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [query, words]);

  const loadedCount = Math.min(visibleCount, filteredWords.length);

  const itemData = useMemo(
    () => ({
      items: filteredWords.slice(0, loadedCount),
      learnedWordSet,
      onLearnWord
    }),
    [filteredWords, learnedWordSet, loadedCount, onLearnWord]
  );

  useEffect(() => {
    const updateWidth = () => {
      setWidth(Math.min(window.innerWidth - 36, 440));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    setVisibleCount(INITIAL_LOAD);
  }, [query, words]);

  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }) => {
      const nearBottom = visibleStopIndex >= loadedCount - 8;
      const hasMore = loadedCount < filteredWords.length;

      if (nearBottom && hasMore) {
        setVisibleCount((prev) => Math.min(prev + LOAD_STEP, filteredWords.length));
      }
    },
    [filteredWords.length, loadedCount]
  );

  const listHeight = Math.min(300, Math.max(ITEM_SIZE * 3, loadedCount * ITEM_SIZE));

  return (
    <Box bg="white" borderRadius="18px" overflow="hidden" boxShadow="0 10px 26px rgba(15, 23, 42, 0.06)">
      <Box px={3} py={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
        <Text fontWeight="700" fontSize="sm">
          All Words (Search + Scroll Load)
        </Text>
      </Box>

      <Box p={3} borderBottom="1px solid" borderColor="gray.100">
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <Box as={FaSearch} boxSize={3} />
          </InputLeftElement>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search word / meaning / phonetic"
            borderRadius="10px"
          />
        </InputGroup>
        <Text fontSize="xs" color="gray.500" mt={2}>
          Showing {loadedCount} / {filteredWords.length} words
        </Text>
      </Box>

      {filteredWords.length === 0 ? (
        <Box px={3} py={8} textAlign="center">
          <Text color="gray.500" fontSize="sm">
            No matched words.
          </Text>
        </Box>
      ) : (
        <List
          key={`${query}-${filteredWords.length}`}
          height={listHeight}
          itemCount={loadedCount}
          itemSize={ITEM_SIZE}
          width={width}
          itemData={itemData}
          onItemsRendered={handleItemsRendered}
        >
          {WordRow}
        </List>
      )}
    </Box>
  );
};

export default memo(VirtualWordList);
