import { memo, useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { FixedSizeList as List } from "react-window";

const WordRow = memo(({ data, index, style }) => {
  const item = data[index];

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
    >
      <Text fontWeight="700">{item.word}</Text>
      <Text color="gray.500" fontSize="sm">
        {item.meaning}
      </Text>
    </Box>
  );
});

const VirtualWordList = ({ words }) => {
  const [width, setWidth] = useState(320);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(Math.min(window.innerWidth - 36, 440));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <Box bg="white" borderRadius="18px" overflow="hidden" boxShadow="0 10px 26px rgba(15, 23, 42, 0.06)">
      <Box px={3} py={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
        <Text fontWeight="700" fontSize="sm">
          Learned Words (Virtual Scroll)
        </Text>
      </Box>
      <List height={220} itemCount={words.length} itemSize={54} width={width} itemData={words}>
        {WordRow}
      </List>
    </Box>
  );
};

export default memo(VirtualWordList);
