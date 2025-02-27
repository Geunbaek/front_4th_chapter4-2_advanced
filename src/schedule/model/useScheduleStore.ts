import { create } from 'zustand';
import { Schedule } from '../../types.ts';
import dummyScheduleMap from '../../dummyScheduleMap.ts';

type SchedulesMap = Record<string, Schedule[]>;

interface ScheduleStore {
  schedulesMap: SchedulesMap;
  activeTableId: string | null;
  setActiveTableId: (tableId: string | null) => void;
  addSchedule: (tableId: string, schedules: Schedule[]) => void;
  updateSchedule: (tableId: string, targetIndex: number, getUpdatedSchedule: (schedule: Schedule) => Schedule) => void;
  removeSchedule: (tableId: string, day: string, time: number) => void;
  duplicateSchedules: (tableId: string) => void;
  removeSchedules: (tableId: string) => void;
}

const createScheduleStore = (initialSchedulesMap?: SchedulesMap) =>
  create<ScheduleStore>((set, get) => ({
    schedulesMap: initialSchedulesMap ?? {},
    activeTableId: null,
    setActiveTableId: tableId => {
      set({ activeTableId: tableId });
    },
    addSchedule: (tableId, schedules) => {
      set(prev => ({
        ...prev,
        schedulesMap: { ...prev.schedulesMap, [tableId]: [...prev.schedulesMap[tableId], ...schedules] },
      }));
    },
    updateSchedule: (tableId, targetIndex, getUpdatedSchedule) => {
      set(prev => ({
        ...prev,
        schedulesMap: {
          ...prev.schedulesMap,
          [tableId]: prev.schedulesMap[tableId].map((schedule, index) => {
            if (index !== Number(targetIndex)) {
              return schedule;
            }
            return {
              ...schedule,
              ...getUpdatedSchedule(schedule),
            };
          }),
        },
      }));
    },
    removeSchedule: (tableId, day, time) => {
      set(prev => ({
        ...prev,
        schedulesMap: {
          ...prev.schedulesMap,
          [tableId]: prev.schedulesMap[tableId].filter(
            schedule => schedule.day !== day || !schedule.range.includes(time),
          ),
        },
      }));
    },
    duplicateSchedules: tableId => {
      set(prev => ({
        ...prev,
        schedulesMap: { ...prev.schedulesMap, [`schedule-${Date.now()}`]: [...prev.schedulesMap[tableId]] },
      }));
    },
    removeSchedules: tableId => {
      const { schedulesMap } = get();
      const clonedSchedulesMap = structuredClone(schedulesMap);
      delete clonedSchedulesMap[tableId];
      set({ schedulesMap: clonedSchedulesMap });
    },
  }));

export const useScheduleStore = createScheduleStore(dummyScheduleMap);
