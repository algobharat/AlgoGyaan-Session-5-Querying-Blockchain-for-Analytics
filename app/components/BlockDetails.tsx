'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Transaction {
  id: string
  "tx-type": string
  sender: string
  fee: number
  "application-transaction"?: {
    "application-id": number
    "on-completion": string
  }
}

interface Block {
  round: number
  timestamp: number
  transactions: Transaction[]
  "txn-counter": number
  "genesis-id": string
  "genesis-hash": string
  "previous-block-hash": string
}

interface ChartData {
  transactionTypes: { name: string; value: number; percentage: string }[]
  topSenders: { sender: string; count: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658']

export default function BlockDetails() {
  const [blockNumber, setBlockNumber] = useState('')
  const [blockData, setBlockData] = useState<Block | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBlockData = async () => {
    if (!blockNumber) return

    setIsLoading(true)
    setError(null)
    setChartData(null)

    try {
      const response = await fetch(`https://testnet-idx.algonode.cloud/v2/blocks/${blockNumber}`)
      if (!response.ok) {
        throw new Error('Failed to fetch block data')
      }
      const data: Block = await response.json()
      setBlockData(data)
    } catch (err) {
      setError('Error fetching block data')
      setBlockData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeBlockData = () => {
    if (!blockData) return

    const transactionTypes: { [key: string]: number } = {}
    const senderCounts: { [key: string]: number } = {}

    blockData.transactions.forEach((tx) => {
      transactionTypes[tx["tx-type"]] = (transactionTypes[tx["tx-type"]] || 0) + 1
      senderCounts[tx.sender] = (senderCounts[tx.sender] || 0) + 1
    })

    const totalTransactions = blockData.transactions.length

    const chartData: ChartData = {
      transactionTypes: Object.entries(transactionTypes).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / totalTransactions) * 100).toFixed(2) + '%'
      })),
      topSenders: Object.entries(senderCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sender, count]) => ({ sender, count }))
    }

    setChartData(chartData)
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="number"
          value={blockNumber}
          onChange={(e) => setBlockNumber(e.target.value)}
          placeholder="Enter block number"
          className="flex-grow"
        />
        <Button onClick={fetchBlockData} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Fetch Block'}
        </Button>
        <Button onClick={analyzeBlockData} disabled={!blockData}>
          Analyze
        </Button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {blockData && (
        <Card>
          <CardHeader>
            <CardTitle>Block {blockData.round}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p><strong>Timestamp:</strong> {new Date(blockData.timestamp * 1000).toLocaleString()}</p>
            <p><strong>Transaction Count:</strong> {blockData.transactions.length}</p>
            <p><strong>Genesis ID:</strong> {blockData["genesis-id"]}</p>
            <p><strong>Genesis Hash:</strong> {blockData["genesis-hash"]}</p>
            <p><strong>Previous Block Hash:</strong> {blockData["previous-block-hash"]}</p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="transactions">
                <AccordionTrigger>Transactions</AccordionTrigger>
                <AccordionContent>
                  {blockData.transactions.map((tx, index) => (
                    <Card key={tx.id} className="mb-2">
                      <CardHeader>
                        <CardTitle className="text-sm">Transaction {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p><strong>ID:</strong> {tx.id}</p>
                        <p><strong>Type:</strong> {tx["tx-type"]}</p>
                        <p><strong>Sender:</strong> {tx.sender}</p>
                        <p><strong>Fee:</strong> {tx.fee}</p>
                        {tx["application-transaction"] && (
                          <>
                            <p><strong>Application ID:</strong> {tx["application-transaction"]["application-id"]}</p>
                            <p><strong>On Completion:</strong> {tx["application-transaction"]["on-completion"]}</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {chartData && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartData.transactionTypes.reduce((acc, item) => {
                  acc[item.name] = {
                    label: item.name,
                    color: COLORS[chartData.transactionTypes.indexOf(item) % COLORS.length],
                  }
                  return acc
                }, {} as Record<string, { label: string; color: string }>)}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.transactionTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.transactionTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p>{`${data.name}: ${data.value} (${data.percentage})`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Senders</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartData.topSenders.reduce((acc, item, index) => {
                  acc[item.sender] = {
                    label: `Sender ${index + 1}`,
                    color: COLORS[index % COLORS.length],
                  }
                  return acc
                }, {} as Record<string, { label: string; color: string }>)}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.topSenders} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" label={{ value: 'Number of Transactions', position: 'insideBottom', offset: -5 }} />
                    <YAxis dataKey="sender" type="category" width={100} label={{ value: 'Sender Address', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p><strong>Sender:</strong> {data.sender}</p>
                              <p><strong>Transactions:</strong> {data.count}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#8884d8">
                      {chartData.topSenders.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

