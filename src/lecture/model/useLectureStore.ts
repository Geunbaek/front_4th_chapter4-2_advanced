import { create } from 'zustand';
import { Lecture } from '../../types';

interface LectureStore {
  lectures: Lecture[];
  setLectures: (lectures: Lecture[]) => void;
}

export const useLectureStore = create<LectureStore>(set => ({
  lectures: [],
  setLectures: lectures => {
    set({ lectures });
  },
}));
