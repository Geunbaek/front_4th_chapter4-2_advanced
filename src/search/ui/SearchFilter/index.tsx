import { HStack } from '@chakra-ui/react';
import SearchTermInput from './SearchTermInput';
import CreditsSelect from './CreditsSelect';
import GradesCheckbox from './GradesCheckbox';
import DaysCheckbox from './DaysCheckbox';
import TimesCheckbox from './TimesCheckbox';
import MajorsCheckbox from './MajorsCheckbox';

const SearchFilter = () => {
  return (
    <>
      <HStack spacing={4}>
        <SearchTermInput />
        <CreditsSelect />
      </HStack>

      <HStack spacing={4}>
        <GradesCheckbox />
        <DaysCheckbox />
      </HStack>

      <HStack spacing={4}>
        <TimesCheckbox />
        <MajorsCheckbox />
      </HStack>
    </>
  );
};

export default SearchFilter;
