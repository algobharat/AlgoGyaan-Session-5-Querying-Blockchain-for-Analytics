'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
  id: string
  "confirmed-round": number
  "intra-round-offset": number
  "round-time": number
}

interface TransactionListProps {
  count: number
}

export default function TransactionList({ count }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`https://testnet-idx.algonode.cloud/v2/transactions?limit=${count}`)
        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }
        const data = await response.json()
        setTransactions(data.transactions)
        setIsLoading(false)
      } catch (err) {
        setError('Error fetching transactions')
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [count])

  if (isLoading) return <div>Loading transactions...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <Card key={tx.id}>
            <CardHeader>
              <CardTitle>Transaction ID: {tx.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Confirmed Round:</strong> {tx["confirmed-round"]}</p>
              <p><strong>Intra-Round Offset:</strong> {tx["intra-round-offset"]}</p>
              <p><strong>Round Time:</strong> {new Date(tx["round-time"] * 1000).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

