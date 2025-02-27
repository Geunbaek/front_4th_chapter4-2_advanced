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
import { useSearchStore } from '../../model/useSearchStore';
import { useShallow } from 'zustand/shallow';
import { useLecture } from '../../../lecture';

const MajorsCheckbox = () => {
  const [majors, setMajors] = useSearchStore(useShallow(state => [state.majors, state.setMajors]));
  const { lectures } = useLecture();
  const allMajors = [...new Set(lectures.map(lecture => lecture.major))];
  return (
    <FormControl>
      <FormLabel>전공</FormLabel>
      <CheckboxGroup colorScheme="green" value={majors} onChange={values => setMajors(values as string[])}>
        <Wrap spacing={1} mb={2}>
          {majors.map(major => (
            <Tag key={major} size="sm" variant="outline" colorScheme="blue">
              <TagLabel>{major.split('<p>').pop()}</TagLabel>
              <TagCloseButton onClick={() => setMajors(majors.filter(v => v !== major))} />
            </Tag>
          ))}
        </Wrap>
        <Stack spacing={2} overflowY="auto" h="100px" border="1px solid" borderColor="gray.200" borderRadius={5} p={2}>
          {allMajors.map(major => (
            <Box key={major}>
              <Checkbox key={major} size="sm" value={major}>
                {major.replace(/<p>/gi, ' ')}
              </Checkbox>
            </Box>
          ))}
        </Stack>
      </CheckboxGroup>
    </FormControl>
  );
};

export default MajorsCheckbox;
