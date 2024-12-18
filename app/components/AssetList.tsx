'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AssetParams {
  clawback: string
  creator: string
  decimals: number
  "default-frozen": boolean
  freeze: string
  manager: string
  name: string
  "name-b64": string
  reserve: string
  total: number
  "unit-name": string
  "unit-name-b64": string
  url: string
  "url-b64": string
}

interface Asset {
  "created-at-round": number
  deleted: boolean
  index: number
  params: AssetParams
}

interface AssetResponse {
  asset: Asset
  "current-round": number
}

interface AssetDetailsProps {
  assetId: string
}

export default function AssetDetails({ assetId }: AssetDetailsProps) {
  const [assetData, setAssetData] = useState<AssetResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`https://testnet-idx.algonode.cloud/v2/assets/${assetId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch asset')
        }
        const data: AssetResponse = await response.json()
        setAssetData(data)
        setIsLoading(false)
      } catch (err) {
        setError('Error fetching asset')
        setIsLoading(false)
      }
    }

    if (assetId) {
      fetchAsset()
    }
  }, [assetId])

  if (isLoading) return <div className="mt-4">Loading asset details...</div>
  if (error) return <div className="mt-4 text-red-500">Error: {error}</div>
  if (!assetData) return <div className="mt-4">No asset found</div>

  const { asset, "current-round": currentRound } = assetData

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Asset Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">General Information</h3>
          <p><strong>Asset ID:</strong> {asset.index}</p>
          <p><strong>Created at Round:</strong> {asset["created-at-round"]}</p>
          <p><strong>Deleted:</strong> {asset.deleted ? "Yes" : "No"}</p>
          <p><strong>Current Round:</strong> {currentRound}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Asset Parameters</h3>
          <p><strong>Name:</strong> {asset.params.name} ({asset.params["name-b64"]})</p>
          <p><strong>Unit Name:</strong> {asset.params["unit-name"]} ({asset.params["unit-name-b64"]})</p>
          <p><strong>Total Supply:</strong> {asset.params.total}</p>
          <p><strong>Decimals:</strong> {asset.params.decimals}</p>
          <p><strong>Default Frozen:</strong> {asset.params["default-frozen"] ? "Yes" : "No"}</p>
          <p><strong>URL:</strong> <a href={asset.params.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{asset.params.url}</a> ({asset.params["url-b64"]})</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Asset Control Addresses</h3>
          <p><strong>Creator:</strong> {asset.params.creator}</p>
          <p><strong>Manager:</strong> {asset.params.manager}</p>
          <p><strong>Reserve:</strong> {asset.params.reserve}</p>
          <p><strong>Freeze:</strong> {asset.params.freeze}</p>
          <p><strong>Clawback:</strong> {asset.params.clawback}</p>
        </div>
      </CardContent>
    </Card>
  )
}

