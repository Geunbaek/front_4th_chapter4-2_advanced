import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { useDndMonitor, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ComponentProps, Fragment, memo, PropsWithChildren } from 'react';
import { useShallow } from 'zustand/shallow';
import { fill2, parseHnM } from '../../utils';
import { CellSize, DAY_LABELS, 분 } from '../../constants';
import { Schedule } from '../../types';
import { useScheduleStore } from '../model';
import { useSearchStore } from '../../search/model';
import ScheduleDndProvider from '../../ScheduleDndProvider';

interface Props {
  tableId: string;
}

const TIMES = [
  ...Array(18)
    .fill(0)
    .map((v, k) => v + k * 30 * 분)
    .map(v => `${parseHnM(v)}~${parseHnM(v + 30 * 분)}`),

  ...Array(6)
    .fill(18 * 30 * 분)
    .map((v, k) => v + k * 55 * 분)
    .map(v => `${parseHnM(v)}~${parseHnM(v + 50 * 분)}`),
] as const;

const getColor = (schedules: Schedule[], lectureId: string): string => {
  const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
  const colors = ['#fdd', '#ffd', '#dff', '#ddf', '#fdf', '#dfd'];
  return colors[lectures.indexOf(lectureId) % colors.length];
};

const ScheduleTableWrapper = ({ tableId, children }: PropsWithChildren<{ tableId: string }>) => {
  const activeTableId = useScheduleStore(state => state.activeTableId);

  return (
    <Box position="relative" outline={activeTableId === tableId ? '5px dashed' : undefined} outlineColor="blue.300">
      {children}
    </Box>
  );
};

const ScheduleDndMonitor = () => {
  const setActiveTableId = useScheduleStore(state => state.setActiveTableId);

  useDndMonitor({
    onDragStart({ active }) {
      const tableId = active?.id?.toString().split(':')[0] || null;
      setActiveTableId(tableId);
    },
    onDragEnd() {
      setActiveTableId(null);
    },
    onDragCancel() {
      setActiveTableId(null);
    },
  });

  return null;
};

const ScheduleTable = ({ tableId }: Props) => {
  const { setTableId, setDays, setTimes } = useSearchStore(
    useShallow(state => ({
      setTableId: state.setTableId,
      setDays: state.setDays,
      setTimes: state.setTimes,
    })),
  );

  const handleScheduleTimeClick = (tableId: string, day: string, time: number) => {
    setTableId(tableId);
    setDays([day]);
    setTimes([time]);
  };

  return (
    <ScheduleTableWrapper tableId={tableId}>
      <Grid
        templateColumns={`120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`}
        templateRows={`40px repeat(${TIMES.length}, ${CellSize.HEIGHT}px)`}
        bg="white"
        fontSize="sm"
        textAlign="center"
        outline="1px solid"
        outlineColor="gray.300"
      >
        <GridItem key="교시" borderColor="gray.300" bg="gray.100">
          <Flex justifyContent="center" alignItems="center" h="full" w="full">
            <Text fontWeight="bold">교시</Text>
          </Flex>
        </GridItem>
        {DAY_LABELS.map(day => (
          <GridItem key={day} borderLeft="1px" borderColor="gray.300" bg="gray.100">
            <Flex justifyContent="center" alignItems="center" h="full">
              <Text fontWeight="bold">{day}</Text>
            </Flex>
          </GridItem>
        ))}
        {TIMES.map((time, timeIndex) => (
          <Fragment key={`시간-${timeIndex + 1}`}>
            <GridItem borderTop="1px solid" borderColor="gray.300" bg={timeIndex > 17 ? 'gray.200' : 'gray.100'}>
              <Flex justifyContent="center" alignItems="center" h="full">
                <Text fontSize="xs">
                  {fill2(timeIndex + 1)} ({time})
                </Text>
              </Flex>
            </GridItem>
            {DAY_LABELS.map(day => (
              <GridItem
                key={`${day}-${timeIndex + 2}`}
                borderWidth="1px 0 0 1px"
                borderColor="gray.300"
                bg={timeIndex > 17 ? 'gray.100' : 'white'}
                cursor="pointer"
                _hover={{ bg: 'yellow.100' }}
                onClick={() => handleScheduleTimeClick(tableId, day, timeIndex + 1)}
              />
            ))}
          </Fragment>
        ))}
      </Grid>
      <DraggableScheduleList tableId={tableId} />
    </ScheduleTableWrapper>
  );
};

const DraggableScheduleList = memo(({ tableId }: Props) => {
  const schedules = useScheduleStore(useShallow(state => state.schedulesMap[tableId]));
  return (
    <>
      {schedules.map((schedule, index) => (
        <ScheduleDndProvider key={`${schedule.lecture.title}-${index}`} tableId={tableId}>
          <ScheduleDndMonitor />
          <DraggableSchedule id={`${tableId}:${index}`} data={schedule} bg={getColor(schedules, schedule.lecture.id)} />
        </ScheduleDndProvider>
      ))}
    </>
  );
});

const DraggableSchedule = memo(({ id, data, bg }: { id: string; data: Schedule } & ComponentProps<typeof Box>) => {
  const [tableId] = id.split(':');
  const { day, range, room, lecture } = data;
  const { attributes, setNodeRef, listeners, transform } = useDraggable({ id });
  const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]);
  const topIndex = range[0] - 1;
  const size = range.length;
  const removeSchedule = useScheduleStore(state => state.removeSchedule);

  return (
    <Popover>
      <PopoverTrigger>
        <Box
          position="absolute"
          left={`${120 + CellSize.WIDTH * leftIndex + 1}px`}
          top={`${40 + (topIndex * CellSize.HEIGHT + 1)}px`}
          width={CellSize.WIDTH - 1 + 'px'}
          height={CellSize.HEIGHT * size - 1 + 'px'}
          bg={bg}
          p={1}
          boxSizing="border-box"
          cursor="pointer"
          ref={setNodeRef}
          transform={CSS.Translate.toString(transform)}
          {...listeners}
          {...attributes}
        >
          <Text fontSize="sm" fontWeight="bold">
            {lecture.title}
          </Text>
          <Text fontSize="xs">{room}</Text>
        </Box>
      </PopoverTrigger>
      <PopoverContent onClick={event => event.stopPropagation()}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Text>강의를 삭제하시겠습니까?</Text>
          <Button colorScheme="red" size="xs" onClick={() => removeSchedule(tableId, day, range[0])}>
            삭제
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});

export default ScheduleTable;
