import { Button, ButtonGroup, Flex, Heading, Stack } from '@chakra-ui/react';
import { useShallow } from 'zustand/shallow';
import { useScheduleStore } from '../model';
import { useSearchStore } from '../../search';
import ScheduleTable from './ScheduleTable';
import { SearchDialog } from '../../search';

const ScheduleTables = () => {
  const schedulesKeys = useScheduleStore(useShallow(state => Object.keys(state.schedulesMap)));
  const { duplicateSchedules, removeSchedules } = useScheduleStore(
    useShallow(state => ({
      duplicateSchedules: state.duplicateSchedules,
      removeSchedules: state.removeSchedules,
    })),
  );

  const setTableId = useSearchStore(state => state.setTableId);
  const disabledRemoveButton = schedulesKeys.length === 1;

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {schedulesKeys.map((tableId, index) => (
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
            <ScheduleTable key={`schedule-table-${index}`} tableId={tableId} />
          </Stack>
        ))}
      </Flex>
      <SearchDialog />
    </>
  );
};

export default ScheduleTables;
