import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useSearchStore } from '../../model';
import { useShallow } from 'zustand/shallow';

const CreditsSelect = () => {
  const [credits, setCredits] = useSearchStore(useShallow(state => [state.credits, state.setCredits]));
  return (
    <FormControl>
      <FormLabel>학점</FormLabel>
      <Select value={credits} onChange={e => setCredits(e.target.value ? Number(e.target.value) : undefined)}>
        <option value="">전체</option>
        <option value="1">1학점</option>
        <option value="2">2학점</option>
        <option value="3">3학점</option>
      </Select>
    </FormControl>
  );
};

export default CreditsSelect;
