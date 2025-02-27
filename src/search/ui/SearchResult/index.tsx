import { Box, Button, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useSearchStore } from '../../model';
import { useShallow } from 'zustand/shallow';
import { useEffect, useRef, useState } from 'react';
import { Lecture } from '../../../types';
import { parseSchedule } from '../../../utils';
import { useScheduleStore } from '../../../schedule';
import { useLecture } from '../../../lecture';
import { getFilteredLectures } from '../../../lecture/lib';

const PAGE_SIZE = 100;

interface Props {
  onClose: () => void;
}

const SearchResult = ({ onClose }: Props) => {
  const loaderWrapperRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  const { lectures } = useLecture();

  const addSchedule = useScheduleStore(state => state.addSchedule);
  const { tableId, ...searchOptions } = useSearchStore(
    useShallow(state => ({
      tableId: state.tableId,
      query: state.query,
      grades: state.grades,
      days: state.days,
      times: state.times,
      majors: state.majors,
      credits: state.credits,
    })),
  );

  const filteredLectures = getFilteredLectures(searchOptions, lectures);
  const lastPage = Math.ceil(filteredLectures.length / PAGE_SIZE);
  const visibleLectures = filteredLectures.slice(0, page * PAGE_SIZE);

  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(prevPage => Math.min(lastPage, prevPage + 1));
        }
      },
      { threshold: 0, root: $loaderWrapper },
    );

    observer.observe($loader);

    return () => observer.unobserve($loader);
  }, [lastPage]);

  useEffect(() => {
    setPage(1);
  }, []);

  useEffect(() => {
    setPage(1);
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, [searchOptions]);

  const handleAddSchedule = (lecture: Lecture) => {
    if (!tableId) return;

    const schedules = parseSchedule(lecture.schedule).map(schedule => ({
      ...schedule,
      lecture,
    }));

    addSchedule(tableId, schedules);

    onClose();
  };

  return (
    <>
      <Text align="right">검색결과: {filteredLectures.length}개</Text>
      <Box>
        <Table>
          <Thead>
            <Tr>
              <Th width="100px">과목코드</Th>
              <Th width="50px">학년</Th>
              <Th width="200px">과목명</Th>
              <Th width="50px">학점</Th>
              <Th width="150px">전공</Th>
              <Th width="150px">시간</Th>
              <Th width="80px"></Th>
            </Tr>
          </Thead>
        </Table>

        <Box overflowY="auto" maxH="500px" ref={loaderWrapperRef}>
          <Table size="sm" variant="striped">
            <Tbody>
              {visibleLectures.map((lecture, index) => (
                <Tr key={`${lecture.id}-${index}`}>
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
              ))}
            </Tbody>
          </Table>
          <Box ref={loaderRef} h="20px" />
        </Box>
      </Box>
    </>
  );
};

export default SearchResult;
