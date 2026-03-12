import React, { createContext, useContext } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';

const PortfolioContext = createContext<ReturnType<typeof usePortfolio> | null>(null);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const portfolio = usePortfolio();
  return <PortfolioContext.Provider value={portfolio}>{children}</PortfolioContext.Provider>;
};

export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolioContext must be used within PortfolioProvider');
  return context;
};
