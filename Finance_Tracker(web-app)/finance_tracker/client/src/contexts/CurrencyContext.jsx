import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

const CurrencyContext = createContext()

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth()
  const [currency, setCurrency] = useState('USD')

  // Update currency when user changes
  useEffect(() => {
    if (user?.preferences?.currency) {
      setCurrency(user.preferences.currency)
    }
  }, [user])

  // Currency symbols mapping
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    PKR: '₨',
    AED: 'د.إ'
  }

  // Format amount with currency
  const formatCurrency = (amount, showSymbol = true) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return showSymbol ? `${currencySymbols[currency]}0.00` : '0.00'
    }

    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount))

    const symbol = currencySymbols[currency] || '$'
    return showSymbol ? `${symbol}${formattedAmount}` : formattedAmount
  }

  // Format amount with sign (positive/negative)
  const formatCurrencyWithSign = (amount, showSymbol = true) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return showSymbol ? `${currencySymbols[currency]}0.00` : '0.00'
    }

    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount))

    const symbol = currencySymbols[currency] || '$'
    const sign = amount >= 0 ? '+' : '-'
    return showSymbol ? `${sign}${symbol}${formattedAmount}` : `${sign}${formattedAmount}`
  }

  // Get currency symbol
  const getCurrencySymbol = () => {
    return currencySymbols[currency] || '$'
  }

  // Update currency preference
  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency)
  }

  const value = {
    currency,
    currencySymbol: getCurrencySymbol(),
    formatCurrency,
    formatCurrencyWithSign,
    getCurrencySymbol,
    updateCurrency,
    currencySymbols
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}
