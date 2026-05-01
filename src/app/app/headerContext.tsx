// HeaderContext.tsx
'use client';
import React, { createContext, useContext, useState } from 'react';

interface HeaderContextType {
  headerVariable: string;
  setHeaderVariable: React.Dispatch<React.SetStateAction<string>>;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [headerVariable, setHeaderVariable] = useState<string>('');

  return (
    <HeaderContext.Provider value={{ headerVariable, setHeaderVariable }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeaderContext = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeaderContext must be used within a HeaderProvider');
  }
  return context;
};
