import { ChakraProvider } from '@chakra-ui/react';
import { ScheduleTables } from './ScheduleTables.tsx';
import ScheduleDndProvider from './ScheduleDndProvider.tsx';

function App() {
  return (
    <ChakraProvider>
      <ScheduleDndProvider>
        <ScheduleTables />
      </ScheduleDndProvider>
    </ChakraProvider>
  );
}

export default App;
