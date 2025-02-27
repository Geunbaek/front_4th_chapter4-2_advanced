import { ChakraProvider } from '@chakra-ui/react';
import ScheduleTables from './schedule/ui/ScheduleTables.tsx';

function App() {
  return (
    <ChakraProvider>
      <ScheduleTables />
    </ChakraProvider>
  );
}

export default App;
