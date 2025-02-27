import { create } from 'zustand';

interface SearchStore {
  tableId?: string;
  query: string;
  credits?: number;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  setTableId: (tableId?: string) => void;
  setQuery: (query: string) => void;
  setCredits: (credits?: number) => void;
  setGrades: (grades: number[]) => void;
  setDays: (days: string[]) => void;
  setTimes: (times: number[]) => void;
  setMajors: (majors: string[]) => void;
}

export const useSearchStore = create<SearchStore>(set => ({
  tableId: undefined,
  query: '',
  credits: undefined,
  grades: [],
  days: [],
  times: [],
  majors: [],
  setTableId: tableId => {
    set({ tableId });
  },
  setQuery: query => {
    set({ query });
  },
  setCredits: credits => {
    set({ credits });
  },
  setGrades: grades => {
    set({ grades });
  },
  setDays: days => {
    set({ days });
  },
  setTimes: times => {
    set({ times });
  },
  setMajors: majors => {
    set({ majors });
  },
}));
