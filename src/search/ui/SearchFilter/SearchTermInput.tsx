import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import { useShallow } from 'zustand/shallow';
import { useSearchStore } from '../../model';

const SearchTermInput = () => {
  const [query, setQuery] = useSearchStore(useShallow(state => [state.query, state.setQuery]));

  return (
    <FormControl>
      <FormLabel>검색어</FormLabel>
      <Input placeholder="과목명 또는 과목코드" value={query} onChange={e => setQuery(e.target.value)} />
    </FormControl>
  );
};

export default SearchTermInput;
