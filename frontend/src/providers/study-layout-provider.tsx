'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StudyLayoutContextType {
  hideHeader: boolean;
  setHideHeader: (hide: boolean) => void;
}

const StudyLayoutContext = createContext<StudyLayoutContextType>({
  hideHeader: false,
  setHideHeader: () => {},
});

export const useStudyLayout = () => useContext(StudyLayoutContext);

export function StudyLayoutProvider({ children }: { children: ReactNode }) {
  const [hideHeader, setHideHeader] = useState(false);

  return (
    <StudyLayoutContext.Provider value={{ hideHeader, setHideHeader }}>
      {children}
    </StudyLayoutContext.Provider>
  );
}
