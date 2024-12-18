"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ChartContainer({
  config,
  children,
  className,
}: {
  config: Record<string, { label: string; color: string }>
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <style jsx global>{`
        :root {
          ${Object.entries(config)
            .map(([key, value]) => `--color-${key}: ${value.color};`)
            .join("\n")}
        }
      `}</style>
      {children}
    </div>
  )
}

export function ChartTooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
  label?: string
  config?: Record<string, { label: string; color: string }>
}) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg bg-white p-2 shadow-md">
      <div className="grid gap-2">
        <div className="font-bold">{label}</div>
        {payload.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: config?.[item.name]?.color }}
            />
            <div>{config?.[item.name]?.label ?? item.name}</div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}