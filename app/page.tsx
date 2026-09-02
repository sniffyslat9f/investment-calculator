"use client"

import { useState, useMemo } from "react"
import type { CalcInputs } from "@/lib/engine"
import { getDefaultInputs, project, summariseAllStartYears } from "@/lib/engine"
import { LAST_DATA_YEAR, FIRST_BOND_YEAR, FIRST_STOCK_YEAR } from "@/lib/historical-returns"
import { InputsPanel } from "@/components/calculator/inputs-panel"
import { Summary, type MoneyView } from "@/components/calculator/summary"
import { ResultsTable } from "@/components/calculator/results-table"
import { ResultsChart } from "@/components/calculator/results-chart"

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<CalcInputs>(getDefaultInputs)
  const [moneyView, setMoneyView] = useState<MoneyView>("real")

  const result = useMemo(() => project(inputs), [inputs])
  const windows = useMemo(
    () => (inputs.mode === "historical" ? summariseAllStartYears(inputs) : null),
    [inputs]
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        <header className="mb-6 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary shadow-md">
            <svg className="size-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Investment Calculator</h1>
            <p className="text-sm text-muted-foreground">
              What a lump sum could grow into — on long-run averages, or on the real returns of any period in history
            </p>
          </div>
        </header>

        <div className="space-y-5">
          <InputsPanel inputs={inputs} onChange={setInputs} />
          <Summary
            inputs={inputs}
            result={result}
            windows={windows}
            moneyView={moneyView}
            onMoneyViewChange={setMoneyView}
          />
          <ResultsTable inputs={inputs} result={result} moneyView={moneyView} />
          <ResultsChart inputs={inputs} result={result} moneyView={moneyView} />
        </div>

        <footer className="mt-8 border-t pt-5 text-xs text-muted-foreground space-y-1">
          <p>
            Historical returns are real, inflation-adjusted, dividends reinvested: US stocks{" "}
            {FIRST_STOCK_YEAR}–{LAST_DATA_YEAR} from Robert Shiller, US 10-year Treasury bonds{" "}
            {FIRST_BOND_YEAR}–{LAST_DATA_YEAR} from Aswath Damodaran (NYU Stern). The same verified
            dataset RetireWell uses.
          </p>
          <p>
            This shows what has happened, not what will. Past returns are not a forecast, and nothing
            here is financial advice.
          </p>
        </footer>
      </div>
    </main>
  )
}
