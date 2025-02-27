import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, VStack } from '@chakra-ui/react';

import SearchFilter from '../SearchFilter';
import SearchResult from '../SearchResult';
import { Suspense } from 'react';
import { useSearchStore } from '../../model';
import { useShallow } from 'zustand/shallow';

export interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

// TODO: 이 컴포넌트에서 불필요한 연산이 발생하지 않도록 다양한 방식으로 시도해주세요.
const SearchDialog = () => {
  const { tableId, setTableId } = useSearchStore(
    useShallow(state => ({
      tableId: state.tableId,
      setTableId: state.setTableId,
    })),
  );

  const handleClose = () => {
    setTableId();
  };

  return (
    <Modal isOpen={Boolean(tableId)} onClose={handleClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Suspense fallback={<>loading...</>}>
              <SearchFilter />
              <SearchResult onClose={handleClose} />
            </Suspense>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchDialog;
