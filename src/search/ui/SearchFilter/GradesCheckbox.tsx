import { Checkbox, CheckboxGroup, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import { useShallow } from 'zustand/shallow';
import { useSearchStore } from '../../model';

const GradesCheckbox = () => {
  const [grades, setGrades] = useSearchStore(useShallow(state => [state.grades, state.setGrades]));
  return (
    <FormControl>
      <FormLabel>학년</FormLabel>
      <CheckboxGroup value={grades} onChange={value => setGrades(value.map(Number))}>
        <HStack spacing={4}>
          {[1, 2, 3, 4].map(grade => (
            <Checkbox key={grade} value={grade}>
              {grade}학년
            </Checkbox>
          ))}
        </HStack>
      </CheckboxGroup>
    </FormControl>
  );
};

export default GradesCheckbox;
