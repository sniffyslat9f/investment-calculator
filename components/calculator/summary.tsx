"use client"

import type { CalcInputs, Result, WindowSummary } from "@/lib/engine"
import { formatCurrency, nominalFactor, historicalInflationFactor } from "@/lib/engine"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, History } from "lucide-react"
import { IOS } from "./ios-icon"

export type MoneyView = "real" | "nominal"

interface Props {
  inputs: CalcInputs
  result: Result
  windows: WindowSummary | null
  moneyView: MoneyView
  onMoneyViewChange: (v: MoneyView) => void
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-xl font-semibold ${tone === "good" ? "text-green-600" : tone === "bad" ? "text-destructive" : ""}`}>
        {value}
      </div>
    </div>
  )
}

export function Summary({ inputs, result, windows, moneyView, onMoneyViewChange }: Props) {
  const show = (real: number, yearsElapsed: number) =>
    moneyView === "nominal" ? real * nominalFactor(inputs, yearsElapsed) : real

  // Whether the money-of-the-day figure rests on the real inflation of those
  // years or on the user's own assumption — the caption must not claim the former
  // when it is doing the latter.
  const usingRealInflation =
    inputs.mode === "historical" &&
    historicalInflationFactor(inputs.startYear, inputs.years) !== undefined

  const finalValue = show(result.finalValue, inputs.years)
  const growth = finalValue - result.totalContributed
  const multiple = result.totalContributed > 0 ? finalValue / result.totalContributed : 0
  const endYear = inputs.mode === "historical" ? inputs.startYear + inputs.years - 1 : null

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-base">
              <IOS color="bg-green-600"><TrendingUp className="size-5 text-white" /></IOS>
              What it could become
            </CardTitle>
            <CardDescription className="mt-1">
              {inputs.mode === "average"
                ? `${inputs.years} years at long-run average returns`
                : `${inputs.startYear} to ${endYear} — what actually happened`}
            </CardDescription>
          </div>

          <Tabs value={moneyView} onValueChange={(v) => onMoneyViewChange(v as MoneyView)}>
            <TabsList>
              <TabsTrigger value="real" className="text-xs">Today&rsquo;s money</TabsTrigger>
              <TabsTrigger value="nominal" className="text-xs">Money of the day</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label={`Value after ${inputs.years} years`} value={formatCurrency(finalValue)} />
          <Stat label="Total you put in" value={formatCurrency(result.totalContributed)} />
          <Stat
            label="Growth"
            value={`${growth >= 0 ? "+" : ""}${formatCurrency(growth)}`}
            tone={growth >= 0 ? "good" : "bad"}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {moneyView === "real" ? (
            <>Shown in today&rsquo;s money — what it would actually buy. Your money{" "}
              {multiple >= 1 ? "grows" : "shrinks"} by a factor of {multiple.toFixed(2)} in real terms.</>
          ) : usingRealInflation ? (
            <><strong>Not adjusted for inflation.</strong> The number you&rsquo;d have seen on a statement,
              using the actual inflation of {inputs.startYear} to {endYear} — prices rose{" "}
              {((nominalFactor(inputs, inputs.years) - 1) * 100).toFixed(0)}% over that period. It buys no
              more than the today&rsquo;s-money figure.</>
          ) : (
            <><strong>Not adjusted for inflation.</strong> Inflated at your assumed{" "}
              {(inputs.inflationRate * 100).toFixed(1)}% a year. A bigger number, but it buys no more than
              the today&rsquo;s-money figure.</>
          )}
        </p>

        {windows && inputs.mode === "historical" && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <History className="size-4 text-muted-foreground" />
              Every other starting point
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              The same {inputs.years} years and the same {inputs.stocksPct}/{100 - inputs.stocksPct} split,
              run from all {windows.count} start years the data allows. In today&rsquo;s money:
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Stat label={`Worst — from ${windows.worst.year}`} value={formatCurrency(windows.worst.value)} tone="bad" />
              <Stat label={`Typical — from ${windows.median.year}`} value={formatCurrency(windows.median.value)} />
              <Stat label={`Best — from ${windows.best.year}`} value={formatCurrency(windows.best.value)} tone="good" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
