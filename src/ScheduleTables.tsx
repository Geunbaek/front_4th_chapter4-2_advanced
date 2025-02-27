import { Button, ButtonGroup, Flex, Heading, Stack } from '@chakra-ui/react';
import ScheduleTable from './ScheduleTable.tsx';
import SearchDialog from './SearchDialog.tsx';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useScheduleStore } from './schedule/index.ts';

export const ScheduleTables = () => {
  const { schedulesMap, removeSchedule, removeSchedules, duplicateSchedules } = useScheduleStore(
    useShallow(state => ({
      schedulesMap: state.schedulesMap,
      removeSchedule: state.removeSchedule,
      removeSchedules: state.removeSchedules,
      duplicateSchedules: state.duplicateSchedules,
    })),
  );

  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

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
                <Button colorScheme="green" onClick={() => setSearchInfo({ tableId })}>
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
              onScheduleTimeClick={timeInfo => setSearchInfo({ tableId, ...timeInfo })}
              onDeleteButtonClick={({ day, time }) => removeSchedule(tableId, day, time)}
            />
          </Stack>
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)} />
    </>
  );
};
