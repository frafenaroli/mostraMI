import { createContext, useContext } from 'react';
import { useExhibits } from './useExhibits';

const ExhibitsContext = createContext(null);

export function ExhibitsProvider({ children }) {
  const data = useExhibits();
  return <ExhibitsContext.Provider value={data}>{children}</ExhibitsContext.Provider>;
}

export function useExhibitsData() {
  const ctx = useContext(ExhibitsContext);
  if (!ctx) throw new Error('useExhibitsData must be used within an ExhibitsProvider');
  return ctx;
}
