import { DndContext, Modifier, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { PropsWithChildren } from 'react';
import { CellSize, DAY_LABELS } from './constants.ts';
import { useShallow } from 'zustand/shallow';
import { Schedule } from './types.ts';
import { useScheduleStore } from './schedule/index.ts';

function createSnapModifier(): Modifier {
  return ({ transform, containerNodeRect, draggingNodeRect }) => {
    const containerTop = containerNodeRect?.top ?? 0;
    const containerLeft = containerNodeRect?.left ?? 0;
    const containerBottom = containerNodeRect?.bottom ?? 0;
    const containerRight = containerNodeRect?.right ?? 0;

    const { top = 0, left = 0, bottom = 0, right = 0 } = draggingNodeRect ?? {};

    const minX = containerLeft - left + 120 + 1;
    const minY = containerTop - top + 40 + 1;
    const maxX = containerRight - right;
    const maxY = containerBottom - bottom;

    return {
      ...transform,
      x: Math.min(Math.max(Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH, minX), maxX),
      y: Math.min(Math.max(Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT, minY), maxY),
    };
  };
}

const modifiers = [createSnapModifier()];

export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const { schedulesMap, updateSchedule } = useScheduleStore(
    useShallow(state => ({
      schedulesMap: state.schedulesMap,
      updateSchedule: state.updateSchedule,
    })),
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (event: any) => {
    const { active, delta } = event;
    const { x, y } = delta;
    const [tableId, index] = active.id.split(':');
    const schedule = schedulesMap[tableId][index];
    const nowDayIndex = DAY_LABELS.indexOf(schedule.day as (typeof DAY_LABELS)[number]);
    const moveDayIndex = Math.floor(x / 80);
    const moveTimeIndex = Math.floor(y / 30);
    updateSchedule(tableId, index, (schedule: Schedule) => ({
      ...schedule,
      day: DAY_LABELS[nowDayIndex + moveDayIndex],
      range: schedule.range.map(time => time + moveTimeIndex),
    }));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
      {children}
    </DndContext>
  );
}
