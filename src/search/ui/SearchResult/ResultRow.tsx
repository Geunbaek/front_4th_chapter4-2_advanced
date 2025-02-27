import { Button, Td, Tr } from '@chakra-ui/react';
import { Lecture } from '../../../types';
import { parseSchedule } from '../../../utils';
import { useScheduleStore } from '../../../schedule';
import { useSearchStore } from '../../model';
import { useShallow } from 'zustand/shallow';
import { memo } from 'react';

interface ResultRowProps {
  lecture: Lecture;
}

const ResultRow = memo(({ lecture }: ResultRowProps) => {
  const addSchedule = useScheduleStore(state => state.addSchedule);
  const { tableId, setTableId } = useSearchStore(
    useShallow(state => ({
      tableId: state.tableId,
      setTableId: state.setTableId,
    })),
  );

  const handleAddSchedule = (lecture: Lecture) => {
    if (!tableId) return;

    const schedules = parseSchedule(lecture.schedule).map(schedule => ({
      ...schedule,
      lecture,
    }));

    addSchedule(tableId, schedules);

    setTableId();
  };
  return (
    <Tr>
      <Td width="100px">{lecture.id}</Td>
      <Td width="50px">{lecture.grade}</Td>
      <Td width="200px">{lecture.title}</Td>
      <Td width="50px">{lecture.credits}</Td>
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }} />
      <Td width="80px">
        <Button size="sm" colorScheme="green" onClick={() => handleAddSchedule(lecture)}>
          추가
        </Button>
      </Td>
    </Tr>
  );
});

export default ResultRow;
