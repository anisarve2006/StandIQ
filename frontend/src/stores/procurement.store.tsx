import React, { createContext, useContext, useState } from 'react';

interface Procurement {
  id: string;
  name: string;
  category: string;
}

interface ProcurementContextType {
  currentProcurement: Procurement | null;
  setCurrentProcurement: (procurement: Procurement | null) => void;
  clearCurrentProcurement: () => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export function ProcurementProvider({ children }: { children: React.ReactNode }) {
  const [currentProcurement, setCurrentProcurement] = useState<Procurement | null>(null);

  const clearCurrentProcurement = () => setCurrentProcurement(null);

  return (
    <ProcurementContext.Provider value={{ currentProcurement, setCurrentProcurement, clearCurrentProcurement }}>
      {children}
    </ProcurementContext.Provider>
  );
}

export function useProcurement() {
  const context = useContext(ProcurementContext);
  if (context === undefined) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
}
