/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode } from 'react';

export type Currency = 'USD' | 'VES' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  symbol: string;
  setCurrency: (c: Currency) => void;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('facturai_currency') as Currency) || 'VES';
  });

  const getSymbol = (curr: Currency) => {
    switch (curr) {
      case 'USD': return '$';
      case 'VES': return 'Bs.';
      case 'EUR': return '€';
      default: return '$';
    }
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('facturai_currency', c);
  };

  const formatAmount = (amount: number) => {
    const formatted = Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${getSymbol(currency)} ${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol: getSymbol(currency), setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
