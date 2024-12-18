'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TransactionDetails from './TransactionDetails'
import AssetDetails from './AssetDetails'

export default function AlgorandExplorer() {
  const [transactionId, setTransactionId] = useState('')
  const [assetId, setAssetId] = useState('')
  const [activeTab, setActiveTab] = useState('transaction')
  const [showResults, setShowResults] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowResults(true)
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transaction">Transaction</TabsTrigger>
          <TabsTrigger value="asset">Asset</TabsTrigger>
        </TabsList>
        <TabsContent value="transaction">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <Input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Fetch Transaction
            </Button>
          </form>
          {showResults && activeTab === 'transaction' && (
            <TransactionDetails transactionId={transactionId} />
          )}
        </TabsContent>
        <TabsContent value="asset">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
                Asset ID
              </label>
              <Input
                type="text"
                id="assetId"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                placeholder="Enter asset ID"
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Fetch Asset
            </Button>
          </form>
          {showResults && activeTab === 'asset' && (
            <AssetDetails assetId={assetId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

