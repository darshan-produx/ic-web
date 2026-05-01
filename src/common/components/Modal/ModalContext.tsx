import React, { createContext, useContext, useState } from 'react';

export interface ModalContextType {
  isModal: boolean;
  setIsModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleModalToggle: () => void;
  show?: any;
  onHide?: any;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalContextProvider');
  }
  return context;
};

interface ModalContextProviderProps {
  children: React.ReactNode;
  show: any;
  onHide: () => void;
}

export const ModalContextProvider: React.FC<ModalContextProviderProps> = ({ show, onHide, children }) => {
  const [isModal, setIsModal] = useState<boolean>(false);

  const handleModalToggle = () => {
    setIsModal(!isModal);
  };

  const bodyElement = document.body;

  React.useEffect(() => {
    // bodyElement.classList.toggle('overflow-hidden');
    if (show) {
      bodyElement.classList.add('overflow-hidden');
    } else {
      bodyElement.classList.remove('overflow-hidden');
    }
    return () => {
      bodyElement.classList.remove('overflow-hidden');
    };
  }, [isModal, show, bodyElement])

  return (
    <ModalContext.Provider value={{ isModal, setIsModal, handleModalToggle, show, onHide }}>
      {children}
    </ModalContext.Provider>
  );
};
