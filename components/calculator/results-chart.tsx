"use client"

import { useMemo } from "react"
import type { CalcInputs, Result } from "@/lib/engine"
import { formatCurrency, nominalFactor } from "@/lib/engine"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ComposedChart, Area, Line, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend, ReferenceLine,
} from "recharts"
import { LineChart as LineChartIcon } from "lucide-react"
import { IOS } from "./ios-icon"
import type { MoneyView } from "./summary"

interface Props {
  inputs: CalcInputs
  result: Result
  moneyView: MoneyView
}

const fmt = (v: number) => {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}m`
  if (abs >= 1_000) return `£${Math.round(v / 1_000)}k`
  return `£${Math.round(v)}`
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; payload: { returnPct: number } }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  const returnPct = payload[0]?.payload?.returnPct
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
      {returnPct !== undefined && (
        <p className={`mt-1 text-xs font-medium ${returnPct < 0 ? "text-destructive" : "text-green-600"}`}>
          {returnPct >= 0 ? "+" : ""}{(returnPct * 100).toFixed(1)}% that year
        </p>
      )}
    </div>
  )
}

export function ResultsChart({ inputs, result, moneyView }: Props) {
  const historical = inputs.mode === "historical"

  const data = useMemo(() => {
    const show = (real: number, yearsElapsed: number) =>
      moneyView === "nominal" ? real * nominalFactor(inputs, yearsElapsed) : real

    let paidIn = inputs.capital
    const start = [{
      label: historical ? String(inputs.startYear - 1) : "Start",
      Value: inputs.capital,
      "Money in": inputs.capital,
      returnPct: undefined as number | undefined,
    }]

    return start.concat(result.rows.map((row) => {
      paidIn += row.contributions
      return {
        label: historical ? String(row.calendarYear) : `Year ${row.n}`,
        Value: show(row.closing, row.n),
        "Money in": show(paidIn, row.n),
        returnPct: row.returnPct,
      }
    }))
  }, [inputs, result, moneyView, historical])

  // Keep the tick count readable however long the run is.
  const interval = Math.max(0, Math.floor(data.length / 12))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-base">
          <IOS color="bg-blue-600"><LineChartIcon className="size-5 text-white" /></IOS>
          Growth over time
        </CardTitle>
        <CardDescription className="mt-1">
          The gap between the two lines is your growth — everything above what you paid in
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickLine={false} interval={interval} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} className="fill-muted-foreground" tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={inputs.capital} strokeDasharray="4 4" className="stroke-muted-foreground" />
              <Area type="monotone" dataKey="Value" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
              <Line type="monotone" dataKey="Money in" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          The dashed horizontal line marks your starting {formatCurrency(inputs.capital)}.
        </p>
      </CardContent>
    </Card>
  )
}
