import React, { createContext, useContext, useState, useEffect } from 'react'

// Static exchange rate (USD to RUB)
const EXCHANGE_RATE = 95 // 1 USD = 95 RUB

const CurrencyContext = createContext()

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    const stored = localStorage.getItem('currency')
    return stored || 'usd'
  })

  useEffect(() => {
    localStorage.setItem('currency', currency)
  }, [currency])

  const value = {
    currency,
    setCurrency,
    exchangeRate: EXCHANGE_RATE,
    convertPrice: (priceUsd) => {
      if (currency === 'rub' && priceUsd) {
        return priceUsd * EXCHANGE_RATE
      }
      return priceUsd
    }
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
