import { Box, Table, Tbody, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useSearchStore } from '../../model';
import { useShallow } from 'zustand/shallow';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLecture } from '../../../lecture';
import { getFilteredLectures } from '../../../lecture/lib';
import ResultRow from './ResultRow';

const PAGE_SIZE = 100;

const SearchResult = () => {
  const loaderWrapperRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  const { lectures } = useLecture();

  const { ...searchOptions } = useSearchStore(
    useShallow(state => ({
      query: state.query,
      grades: state.grades,
      days: state.days,
      times: state.times,
      majors: state.majors,
      credits: state.credits,
    })),
  );

  const filteredLectures = useMemo(() => getFilteredLectures(searchOptions, lectures), [searchOptions, lectures]);
  const lastPage = useMemo(() => Math.ceil(filteredLectures.length / PAGE_SIZE), [filteredLectures]);
  const visibleLectures = useMemo(() => filteredLectures.slice(0, page * PAGE_SIZE), [filteredLectures, page]);

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
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, [searchOptions]);

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
                <ResultRow key={`${lecture.id}-${index}`} lecture={lecture} />
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
