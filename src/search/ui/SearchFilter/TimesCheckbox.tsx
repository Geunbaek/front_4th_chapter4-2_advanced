import {
  Box,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Wrap,
} from '@chakra-ui/react';
import { useShallow } from 'zustand/shallow';
import { useSearchStore } from '../../model';
import { TIME_SLOTS } from '../../config';

const TimesCheckbox = () => {
  const [times, setTimes] = useSearchStore(useShallow(state => [state.times, state.setTimes]));

  return (
    <FormControl>
      <FormLabel>시간</FormLabel>
      <CheckboxGroup colorScheme="green" value={times} onChange={values => setTimes(values.map(Number))}>
        <Wrap spacing={1} mb={2}>
          {times
            .sort((a, b) => a - b)
            .map(time => (
              <Tag key={time} size="sm" variant="outline" colorScheme="blue">
                <TagLabel>{time}교시</TagLabel>
                <TagCloseButton onClick={() => setTimes(times.filter(v => v !== time))} />
              </Tag>
            ))}
        </Wrap>
        <Stack spacing={2} overflowY="auto" h="100px" border="1px solid" borderColor="gray.200" borderRadius={5} p={2}>
          {TIME_SLOTS.map(({ id, label }) => (
            <Box key={id}>
              <Checkbox key={id} size="sm" value={id}>
                {id}교시({label})
              </Checkbox>
            </Box>
          ))}
        </Stack>
      </CheckboxGroup>
    </FormControl>
  );
};

export default TimesCheckbox;
