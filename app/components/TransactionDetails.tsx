'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ApplicationTransaction {
  accounts: string[]
  "application-args": string[]
  "application-id": number
  "foreign-apps": number[]
  "foreign-assets": number[]
  "global-state-schema": { "num-byte-slice": number, "num-uint": number }
  "local-state-schema": { "num-byte-slice": number, "num-uint": number }
  "on-completion": string
}

interface GlobalStateDelta {
  key: string
  value: {
    action: number
    bytes: string
    uint: number
  }
}

interface Transaction {
  "application-transaction"?: ApplicationTransaction
  "close-rewards": number
  "closing-amount": number
  "confirmed-round": number
  fee: number
  "first-valid": number
  "genesis-hash": string
  "genesis-id": string
  "global-state-delta"?: GlobalStateDelta[]
  group: string
  id: string
  "intra-round-offset": number
  "last-valid": number
  note?: string
  "receiver-rewards": number
  "round-time": number
  sender: string
  "sender-rewards": number
  signature: { sig: string }
  "tx-type": string
}

interface TransactionResponse {
  "current-round": number
  transaction: Transaction
}

interface TransactionDetailsProps {
  transactionId: string
}

export default function TransactionDetails({ transactionId }: TransactionDetailsProps) {
  const [transactionData, setTransactionData] = useState<TransactionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`https://testnet-idx.algonode.cloud/v2/transactions/${transactionId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch transaction')
        }
        const data: TransactionResponse = await response.json()
        setTransactionData(data)
        setIsLoading(false)
      } catch (err) {
        setError('Error fetching transaction')
        setIsLoading(false)
      }
    }

    if (transactionId) {
      fetchTransaction()
    }
  }, [transactionId])

  if (isLoading) return <div className="mt-4">Loading transaction details...</div>
  if (error) return <div className="mt-4 text-red-500">Error: {error}</div>
  if (!transactionData) return <div className="mt-4">No transaction found</div>

  const { transaction, "current-round": currentRound } = transactionData

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Transaction Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="general-info">
            <AccordionTrigger>General Information</AccordionTrigger>
            <AccordionContent>
              <p><strong>Transaction ID:</strong> {transaction.id}</p>
              <p><strong>Type:</strong> {transaction["tx-type"]}</p>
              <p><strong>Sender:</strong> {transaction.sender}</p>
              <p><strong>Fee:</strong> {transaction.fee} microAlgos</p>
              <p><strong>First Valid Round:</strong> {transaction["first-valid"]}</p>
              <p><strong>Last Valid Round:</strong> {transaction["last-valid"]}</p>
              <p><strong>Confirmed Round:</strong> {transaction["confirmed-round"]}</p>
              <p><strong>Round Time:</strong> {new Date(transaction["round-time"] * 1000).toLocaleString()}</p>
              {transaction.note && <p><strong>Note:</strong> {atob(transaction.note)}</p>}
              <p><strong>Group:</strong> {transaction.group}</p>
              <p><strong>Genesis ID:</strong> {transaction["genesis-id"]}</p>
              <p><strong>Genesis Hash:</strong> {transaction["genesis-hash"]}</p>
            </AccordionContent>
          </AccordionItem>
          {transaction["application-transaction"] && (
            <AccordionItem value="application-transaction">
              <AccordionTrigger>Application Transaction</AccordionTrigger>
              <AccordionContent>
                <p><strong>Application ID:</strong> {transaction["application-transaction"]["application-id"]}</p>
                <p><strong>On Completion:</strong> {transaction["application-transaction"]["on-completion"]}</p>
                <p><strong>Application Arguments:</strong></p>
                <ul className="list-disc list-inside">
                  {transaction["application-transaction"]["application-args"].map((arg, index) => (
                    <li key={index}>{arg}</li>
                  ))}
                </ul>
                <p><strong>Global State Schema:</strong></p>
                <ul className="list-disc list-inside">
                  <li>Num Byte Slice: {transaction["application-transaction"]["global-state-schema"]["num-byte-slice"]}</li>
                  <li>Num Uint: {transaction["application-transaction"]["global-state-schema"]["num-uint"]}</li>
                </ul>
                <p><strong>Local State Schema:</strong></p>
                <ul className="list-disc list-inside">
                  <li>Num Byte Slice: {transaction["application-transaction"]["local-state-schema"]["num-byte-slice"]}</li>
                  <li>Num Uint: {transaction["application-transaction"]["local-state-schema"]["num-uint"]}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
          {transaction["global-state-delta"] && transaction["global-state-delta"].length > 0 && (
            <AccordionItem value="global-state-delta">
              <AccordionTrigger>Global State Delta</AccordionTrigger>
              <AccordionContent>
                {transaction["global-state-delta"].map((delta, index) => (
                  <div key={index} className="mb-2">
                    <p><strong>Key:</strong> {delta.key}</p>
                    <p><strong>Action:</strong> {delta.value.action}</p>
                    <p><strong>Bytes:</strong> {delta.value.bytes}</p>
                    <p><strong>Uint:</strong> {delta.value.uint}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="signature">
            <AccordionTrigger>Signature</AccordionTrigger>
            <AccordionContent>
              <p>{transaction.signature.sig}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="rewards">
            <AccordionTrigger>Rewards</AccordionTrigger>
            <AccordionContent>
              <p><strong>Sender Rewards:</strong> {transaction["sender-rewards"]}</p>
              <p><strong>Receiver Rewards:</strong> {transaction["receiver-rewards"]}</p>
              <p><strong>Close Rewards:</strong> {transaction["close-rewards"]}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div>
          <p><strong>Current Round:</strong> {currentRound}</p>
        </div>
      </CardContent>
    </Card>
  )
}

