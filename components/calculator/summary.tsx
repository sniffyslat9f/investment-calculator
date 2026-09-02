"use client"

import type { CalcInputs, Result } from "@/lib/engine"
import {
  formatCurrency, nominalFactor, historicalInflationFactor, blendedReal,
  clampStartYear, firstAvailableYear, latestStartYear,
  annualisedRealReturn, toGross,
} from "@/lib/engine"
import { NOTABLE_YEARS } from "@/lib/historical-returns"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp } from "lucide-react"
import { IOS } from "./ios-icon"

export type MoneyView = "real" | "nominal"

interface Props {
  inputs: CalcInputs
  onInputsChange: (inputs: CalcInputs) => void
  result: Result
  moneyView: MoneyView
  onMoneyViewChange: (v: MoneyView) => void
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-xl font-semibold ${tone === "good" ? "text-green-600" : tone === "bad" ? "text-destructive" : ""}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 font-mono text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

export function Summary({ inputs, onInputsChange, result, moneyView, onMoneyViewChange }: Props) {
  // Same guard as the inputs panel: a change here can never leave the start year
  // pointing at a run that would fall off the end of the data.
  const update = (patch: Partial<CalcInputs>) => {
    const next = { ...inputs, ...patch }
    next.startYear = clampStartYear(next.stocksPct, next.years, next.startYear)
    onInputsChange(next)
  }

  const firstYear = firstAvailableYear(inputs.stocksPct)
  const lastStart = latestStartYear(inputs.stocksPct, inputs.years)
  const notable = NOTABLE_YEARS[inputs.startYear]
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

  // Quoted per year, and money-weighted, so regular top-ups don't flatter it.
  const realReturn = annualisedRealReturn(inputs, result)
  const grossReturn = realReturn === undefined ? undefined : toGross(realReturn, inputs)
  const pct = (v: number) => `${v >= 0 ? "" : "-"}${Math.abs(v * 100).toFixed(1)}%`
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
        {/* Which returns to use — sits with the outcome it produces, not with the inputs */}
        <div className="space-y-3 rounded-lg border p-3">
          <Tabs value={inputs.mode} onValueChange={(v) => update({ mode: v as CalcInputs["mode"] })}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="average">Long-run average</TabsTrigger>
              <TabsTrigger value="historical">A real period in history</TabsTrigger>
            </TabsList>
          </Tabs>

          {inputs.mode === "average" ? (
            <p className="text-xs text-muted-foreground">
              A steady {(blendedReal(inputs.stocksPct, inputs.inflationRate) * 100).toFixed(1)}% a year
              after inflation — the same long-run assumptions RetireWell uses.
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="start" className="text-sm">
                Starting in {inputs.startYear}
                {notable && <span className="ml-2 font-normal text-muted-foreground">— {notable.replace(/^\d+ — /, "")}</span>}
              </Label>
              <Slider
                id="start"
                min={firstYear}
                max={lastStart}
                step={1}
                value={[inputs.startYear]}
                onValueChange={([v]) => update({ startYear: v })}
                disabled={lastStart <= firstYear}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{firstYear}</span>
                <span className="font-medium text-foreground">Runs {inputs.startYear} → {endYear}</span>
                <span>{lastStart}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Stops at {lastStart}: a {inputs.years}-year run has to finish inside the data.
                {inputs.stocksPct < 100 && " Starts at 1928 because bond data begins there."}
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <Stat label={`Value after ${inputs.years} years`} value={formatCurrency(finalValue)} />
          <Stat label="Total you put in" value={formatCurrency(result.totalContributed)} />
          <Stat
            label="Growth"
            value={`${growth >= 0 ? "+" : ""}${formatCurrency(growth)}`}
            tone={growth >= 0 ? "good" : "bad"}
          />
          {realReturn !== undefined && grossReturn !== undefined && (
            <Stat
              label="Return a year"
              value={`${pct(grossReturn)} gross`}
              sub={`${pct(realReturn)} after inflation`}
              tone={realReturn >= 0 ? "good" : "bad"}
            />
          )}
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

      </CardContent>
    </Card>
  )
}
