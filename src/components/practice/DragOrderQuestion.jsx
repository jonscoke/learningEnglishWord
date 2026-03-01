import { memo, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Button, Flex, Text } from "@chakra-ui/react";

const SortableChip = ({ id, value }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <Box
      ref={setNodeRef}
      transform={CSS.Transform.toString(transform)}
      transition={transition}
      px={4}
      py={2}
      borderRadius="full"
      bg="teal.50"
      border="1px solid"
      borderColor="teal.100"
      cursor="grab"
      fontWeight="700"
      {...attributes}
      {...listeners}
    >
      {value}
    </Box>
  );
};

const DragOrderQuestion = ({ question, onSubmit, disabled }) => {
  const initialItems = useMemo(
    () => question.options.map((word, index) => ({ id: `${word}-${index}`, value: word })),
    [question.options]
  );
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setItems((current) => {
      const oldIndex = current.findIndex((entry) => entry.id === active.id);
      const newIndex = current.findIndex((entry) => entry.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleSubmit = () => {
    const candidate = items.map((item) => item.value);
    const isCorrect = candidate.join(" ") === question.answer.join(" ");
    onSubmit(isCorrect);
  };

  return (
    <Flex direction="column" gap={4}>
      <Text fontSize="sm" color="gray.500">
        {question.helper}
      </Text>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={horizontalListSortingStrategy}>
          <Flex wrap="wrap" gap={2}>
            {items.map((item) => (
              <SortableChip key={item.id} id={item.id} value={item.value} />
            ))}
          </Flex>
        </SortableContext>
      </DndContext>
      <Button colorScheme="teal" borderRadius="full" onClick={handleSubmit} isDisabled={disabled}>
        Submit Order
      </Button>
    </Flex>
  );
};

export default memo(DragOrderQuestion);
