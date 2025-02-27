import { useEffect } from 'react';
import { useLectureStore } from './useLectureStore';
import { useShallow } from 'zustand/shallow';
import { fetchLiberalArts, fetchMajors } from '../api';

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
