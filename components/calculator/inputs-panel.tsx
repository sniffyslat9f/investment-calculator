"use client"

import type { CalcInputs } from "@/lib/engine"
import { blendedNominal, blendedReal, clampStartYear, maxYears, formatCurrency } from "@/lib/engine"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from "lucide-react"
import { IOS } from "./ios-icon"

interface Props {
  inputs: CalcInputs
  onChange: (inputs: CalcInputs) => void
}

export function InputsPanel({ inputs, onChange }: Props) {
  // Every change goes through here, so the start year can never be left
  // pointing at a run that would fall off the end of the data.
  const update = (patch: Partial<CalcInputs>) => {
    const next = { ...inputs, ...patch }
    next.years = Math.min(next.years, maxYears(next.stocksPct))
    next.startYear = clampStartYear(next.stocksPct, next.years, next.startYear)
    onChange(next)
  }

  const nominal = blendedNominal(inputs.stocksPct) * 100
  const real = blendedReal(inputs.stocksPct, inputs.inflationRate) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-base">
          <IOS color="bg-slate-700"><Settings className="size-5 text-white" /></IOS>
          Your investment
        </CardTitle>
        <CardDescription className="mt-1">
          Shown in today&rsquo;s money unless you switch the view in the summary.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {/* Capital */}
          <div className="space-y-2">
            <Label htmlFor="capital">Amount to invest</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
              <Input
                id="capital"
                type="number"
                min={0}
                step={1000}
                className="pl-7 font-mono"
                value={inputs.capital}
                onChange={(e) => update({ capital: Math.max(0, Number(e.target.value) || 0) })}
              />
            </div>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="years">Time period — {inputs.years} years</Label>
            <Slider
              id="years"
              min={1}
              max={maxYears(inputs.stocksPct)}
              step={1}
              value={[inputs.years]}
              onValueChange={([v]) => update({ years: v })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 year</span>
              <span>{maxYears(inputs.stocksPct)} years max</span>
            </div>
          </div>
        </div>

        {/* Split */}
        <div className="space-y-2">
          <Label htmlFor="split">
            Split — {inputs.stocksPct}% stocks / {100 - inputs.stocksPct}% bonds
          </Label>
          <Slider
            id="split"
            min={0}
            max={100}
            step={5}
            value={[inputs.stocksPct]}
            onValueChange={([v]) => update({ stocksPct: v })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>All bonds</span>
            <span className="font-medium text-green-600">
              {nominal.toFixed(1)}% nominal · {real.toFixed(1)}% real
            </span>
            <span>All stocks</span>
          </div>
          <p className="text-xs text-muted-foreground">Rebalanced to this split every year.</p>
        </div>

        {/* Contributions */}
        <div className="space-y-3 rounded-lg border p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="contribution">Regular top-up (optional)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                <Input
                  id="contribution"
                  type="number"
                  min={0}
                  step={50}
                  className="pl-7 font-mono"
                  value={inputs.contribution}
                  onChange={(e) => update({ contribution: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">How often</Label>
              <Select value={inputs.frequency} onValueChange={(v) => update({ frequency: v as CalcInputs["frequency"] })}>
                <SelectTrigger id="frequency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Every month</SelectItem>
                  <SelectItem value="annual">Every year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {inputs.contribution > 0 && (
            <div className="flex items-start justify-between gap-4 pt-1">
              <div>
                <Label htmlFor="rise" className="font-normal">Increase it with inflation each year</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {inputs.contributionsRiseWithInflation
                    ? `Keeps its value — always worth ${formatCurrency(inputs.contribution)} in today's money.`
                    : `Stays at ${formatCurrency(inputs.contribution)} forever, so it buys less as the years pass.`}
                </p>
              </div>
              <Switch
                id="rise"
                checked={inputs.contributionsRiseWithInflation}
                onCheckedChange={(v) => update({ contributionsRiseWithInflation: v })}
              />
            </div>
          )}
        </div>

        {/* Inflation */}
        <div className="space-y-2">
          <Label htmlFor="inflation">Inflation — {(inputs.inflationRate * 100).toFixed(1)}% a year</Label>
          <Slider
            id="inflation"
            min={0}
            max={10}
            step={0.1}
            value={[inputs.inflationRate * 100]}
            onValueChange={([v]) => update({ inflationRate: v / 100 })}
          />
          <p className="text-xs text-muted-foreground">
            Applies to the average-returns mode. Historical returns already have real inflation removed.
          </p>
        </div>

      </CardContent>
    </Card>
  )
}
