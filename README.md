# 리액트 프로젝트 성능 개선 보고서

- **URL:** https://front-4th-chapter4-2-advanced-mocha.vercel.app/

---

## 1. 프로젝트 개요

이 어플리케이션은 사용자에게 시간표를 제공하며, 다음과 같은 기능을 포함합니다:

- **수업 검색:** 시간표 내 수업을 다양한 조건(과목명, 전공, 요일, 시간 등)을 기준으로 검색할 수 있습니다.
- **인피니티 스크롤:** 검색 결과를 페이지네이션 대신 무한 스크롤 방식으로 표시합니다.
- **드래그 & 드롭(DnD):** 등록한 수업 블럭을 드래그하여 시간표 내에서 옮길 수 있습니다.
- **기타 기능:** 수업 삭제 및 시간표 복제 등의 기능도 지원합니다.

---

## 2 성능 이슈 분석

1. **검색 모달의 페이지네이션 렌더링 지연**

   - 수업 검색 결과 리스트를 렌더링할 때, 매번 불필요한 연산이 발생하여 페이지네이션(인피니트 스크롤) 성능이 저하됨.

2. **중복 API 호출 문제**

   - 동일한 API를 여러 번 호출하여, Promise.all이 의도한 병렬 처리가 이루어지지 않고 직렬로 실행되는 문제가 있음.
   - 이미 호출한 API는 캐싱되지 않아 불필요한 네트워크 비용이 발생함.

3. **드래그 & 드롭(DnD) 성능 문제**

   - 시간표 내 과목 블럭을 옮길 때, 드래그 중에 전체 요소가 불필요하게 리렌더링 되어 드래그/드롭 반응 속도가 느림.
   - 전역 상태(`schedulesMap`)가 한 번 업데이트될 때마다 관련 컴포넌트 전체가 재렌더링됨.

4. **시간표 데이터 증가에 따른 렌더링 비용**
   - 시간이 지남에 따라 등록된 시간표 및 수업 데이터가 많아질 경우, 전체 렌더링 비용이 기하급수적으로 증가함.

## 3. 개선 방법 및 구현 내용

### API 호출 최적화

- `await` 을 제거하여 정상적으로 `Promise.all` 이 병렬적으로 동작할 수 있도록 하였습니다.
- 캐싱을 추가하여 이미 요청한 경우 추가적으로 요청하지 않도록 하였습니다.

- 개선 전 코드:

  ```jsx
  const fetchMajors = () => axios.get<Lecture[]>('/schedules-majors.json');
    const fetchLiberalArts = () => axios.get<Lecture[]>('/schedules-majors.json');

    // TODO: 이 코드를 개선해서 API 호출을 최소화 해보세요 + Promise.all이 현재 잘못 사용되고 있습니다. 같이 개선해주세요.
    const fetchAllLectures = async () => await Promise.all([
    (console.log('API Call 1', performance.now()), await fetchMajors()),
    (console.log('API Call 2', performance.now()), await fetchLiberalArts()),
    (console.log('API Call 3', performance.now()), await fetchMajors()),
    (console.log('API Call 4', performance.now()), await fetchLiberalArts()),
    (console.log('API Call 5', performance.now()), await fetchMajors()),
    (console.log('API Call 6', performance.now()), await fetchLiberalArts()),
    ]);
  ```

- 개선 후

  ```jsx
    const requestCache = new Map<string, Promise<unknown>>();

    const fetchWithCache = <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
        if (requestCache.has(key)) {
            return requestCache.get(key)! as Promise<T>;
        }
        const promise = fetcher();
        requestCache.set(key, promise);
        return promise;
    };

    // TODO: 이 코드를 개선해서 API 호출을 최소화 해보세요 + Promise.all이 현재 잘못 사용되고 있습니다. 같이 개선해주세요.

    export const useLecture = () => {
        const { lectures, setLectures } = useLectureStore(
            useShallow(state => ({ lectures: state.lectures, setLectures: state.setLectures })),
        );

        useEffect(() => {
            const start = performance.now();
            console.log('API 호출 시작: ', start);
            Promise.all([
            (console.log('API Call 1', performance.now()), fetchWithCache('majors', fetchMajors)),
            (console.log('API Call 2', performance.now()), fetchWithCache('liberalArts', fetchLiberalArts)),
            (console.log('API Call 3', performance.now()), fetchWithCache('majors', fetchMajors)),
            (console.log('API Call 4', performance.now()), fetchWithCache('liberalArts', fetchLiberalArts)),
            (console.log('API Call 5', performance.now()), fetchWithCache('majors', fetchMajors)),
            (console.log('API Call 6', performance.now()), fetchWithCache('liberalArts', fetchLiberalArts)),
            ]).then(data => {
                const end = performance.now();
                console.log('모든 API 호출 완료 ', end);
                console.log('API 호출에 걸린 시간(ms): ', end - start);
                setLectures(data.flatMap(result => result.data));
            });
        }, [setLectures]);

        return { lectures };
    };
  ```

### 리렌더링 방지

- zustand 를 활용하여 전역 상태를 관리하여 해당 상태를 사용하는 컴포넌트만 리렌더링 될 수 있도록 최적화 하였습니다.

### 검색 모달의 페이지네이션 렌더링 지연

- 검색 결과 테이블 row 가 불필요하게 렌더링 되는 현상이 있었는데 `ResultRow` 컴포넌트를 분리하고 `memo` 를 통해 불필요한 렌더링을 방지했습니다

- 개선전

```jsx
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
            <Button size="sm" colorScheme="green" onClick={() => addSchedule(lecture)}>
              추가
            </Button>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
  <Box ref={loaderRef} h="20px" />
</Box>
```

- 개선 후

```jsx
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

// ResultRow.tsx

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
```

### 드래그 & 드롭(DnD) 성능 문제

- `ScheduleDndProvider` 가 `App` 에 선언되어 불필요한 리렌더링이 발생하고 있어 최대한 리렌더를 일으키는 컴포넌트와 가깝게 배치하여 불필요한 리렌더링 방지

- 전역 상태(`schedulesMap`)를 두고 하위 테이블에서는 필요한 schedules 만 구독하여 불필요한 리렌더링을 방지했습니다.

- 개선 전

```jsx
<ChakraProvider>
  <ScheduleProvider>
    <ScheduleDndProvider>
      <ScheduleTables />
    </ScheduleDndProvider>
  </ScheduleProvider>
</ChakraProvider>
```

- 개선 후

```jsx
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
```

## 4. 기타 및 향후 계획

- **시간표 데이터 증가에 따른 렌더링 비용**
  - virtual scroll을 적용하여 시간표 데이터가 증가하더라도 보여지는 부분만 실제로 렌더링 하여 데이터 증가에 따른 버벅임을 방지할 계획입니다.
