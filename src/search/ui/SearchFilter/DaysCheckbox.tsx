import { Checkbox, CheckboxGroup, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import { DAY_LABELS } from '../../../constants';
import { useSearchStore } from '../../model';
import { useShallow } from 'zustand/shallow';

const DaysCheckbox = () => {
  const [days, setDays] = useSearchStore(useShallow(state => [state.days, state.setDays]));
  return (
    <FormControl>
      <FormLabel>요일</FormLabel>
      <CheckboxGroup value={days} onChange={value => setDays(value as string[])}>
        <HStack spacing={4}>
          {DAY_LABELS.map(day => (
            <Checkbox key={day} value={day}>
              {day}
            </Checkbox>
          ))}
        </HStack>
      </CheckboxGroup>
    </FormControl>
  );
};

export default DaysCheckbox;
