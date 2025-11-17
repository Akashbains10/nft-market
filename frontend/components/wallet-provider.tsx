'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface WalletContextType {
  isConnected: boolean
  account: string | null
  connect: () => Promise<void>
  disconnect: () => void
  balance: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  const connect = useCallback(async () => {
    try {
      // Simulate wallet connection - in production this would connect to MetaMask/WalletConnect
      const mockAccount = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`
      const mockBalance = (Math.random() * 5).toFixed(3)

      setAccount(mockAccount)
      setBalance(mockBalance)
      setIsConnected(true)

      localStorage.setItem('walletConnected', 'true')
      localStorage.setItem('walletAccount', mockAccount)
      localStorage.setItem('walletBalance', mockBalance)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }, [])

  const disconnect = useCallback(() => {
    setIsConnected(false)
    setAccount(null)
    setBalance(null)
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAccount')
    localStorage.removeItem('walletBalance')
  }, [])

  // Load wallet state on mount
  React.useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected') === 'true'
    if (wasConnected) {
      const savedAccount = localStorage.getItem('walletAccount')
      const savedBalance = localStorage.getItem('walletBalance')
      if (savedAccount && savedBalance) {
        setAccount(savedAccount)
        setBalance(savedBalance)
        setIsConnected(true)
      }
    }
  }, [])

  return (
    <WalletContext.Provider value={{ isConnected, account, connect, disconnect, balance }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
