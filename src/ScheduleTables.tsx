import { Button, ButtonGroup, Flex, Heading, Stack } from '@chakra-ui/react';
import ScheduleTable from './ScheduleTable.tsx';
import SearchDialog from './SearchDialog.tsx';
import { useShallow } from 'zustand/shallow';
import { useScheduleStore } from './schedule/index.ts';
import { useSearchStore } from './search/index.ts';

export const ScheduleTables = () => {
  const { schedulesMap, removeSchedule, removeSchedules, duplicateSchedules } = useScheduleStore(
    useShallow(state => ({
      schedulesMap: state.schedulesMap,
      removeSchedule: state.removeSchedule,
      removeSchedules: state.removeSchedules,
      duplicateSchedules: state.duplicateSchedules,
    })),
  );

  const { tableId, setTableId, setDays, setTimes } = useSearchStore(
    useShallow(state => ({
      tableId: state.tableId,
      setTableId: state.setTableId,
      setDays: state.setDays,
      setTimes: state.setTimes,
    })),
  );

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const handleScheduleTimeClick = (tableId: string, timeInfo: { day: string; time: number }) => {
    setTableId(tableId);
    setDays([timeInfo.day]);
    setTimes([timeInfo.time]);
  };
  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <Stack key={tableId} width="600px">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading as="h3" fontSize="lg">
                시간표 {index + 1}
              </Heading>
              <ButtonGroup size="sm" isAttached>
                <Button colorScheme="green" onClick={() => setTableId(tableId)}>
                  시간표 추가
                </Button>
                <Button colorScheme="green" mx="1px" onClick={() => duplicateSchedules(tableId)}>
                  복제
                </Button>
                <Button colorScheme="green" isDisabled={disabledRemoveButton} onClick={() => removeSchedules(tableId)}>
                  삭제
                </Button>
              </ButtonGroup>
            </Flex>
            <ScheduleTable
              key={`schedule-table-${index}`}
              schedules={schedules}
              tableId={tableId}
              onScheduleTimeClick={handleScheduleTimeClick}
              onDeleteButtonClick={({ day, time }) => removeSchedule(tableId, day, time)}
            />
          </Stack>
        ))}
      </Flex>
      <SearchDialog tableId={tableId} onClose={() => setTableId()} />
    </>
  );
};
