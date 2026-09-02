"use client"

import { useState } from "react"
import type { CalcInputs, Result } from "@/lib/engine"
import { formatCurrency, nominalFactor } from "@/lib/engine"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table } from "lucide-react"
import { IOS } from "./ios-icon"
import type { MoneyView } from "./summary"

interface Props {
  inputs: CalcInputs
  result: Result
  moneyView: MoneyView
}

export function ResultsTable({ inputs, result, moneyView }: Props) {
  const [showAll, setShowAll] = useState(false)
  const rows = showAll ? result.rows : result.rows.slice(0, 15)
  const historical = inputs.mode === "historical"

  const show = (real: number, yearsElapsed: number) =>
    moneyView === "nominal" ? real * nominalFactor(inputs, yearsElapsed) : real

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-base">
          <IOS color="bg-slate-700"><Table className="size-5 text-white" /></IOS>
          Year by year
        </CardTitle>
        <CardDescription className="mt-1">
          {moneyView === "real"
            ? "Every year of the run, in today's £ — all figures inflation-adjusted"
            : "Every year of the run, in the money of the day — not inflation-adjusted"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs" role="table">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground whitespace-nowrap" scope="col">Year</th>
                <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap" scope="col">Opening</th>
                <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap" scope="col">Added</th>
                <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap" scope="col">Return</th>
                <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap" scope="col">Growth</th>
                <th className="py-2 pl-3 text-right font-medium text-muted-foreground whitespace-nowrap" scope="col">Closing</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const down = row.returnPct < 0
                return (
                  <tr key={row.n} className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${down ? "bg-destructive/5" : ""}`}>
                    <td className="py-2 pr-3 font-medium whitespace-nowrap">
                      {historical ? row.calendarYear : `Year ${row.n}`}
                    </td>
                    <td className="py-2 px-3 text-right font-mono whitespace-nowrap">
                      {formatCurrency(show(row.opening, row.n - 1))}
                    </td>
                    <td className="py-2 px-3 text-right font-mono whitespace-nowrap text-muted-foreground">
                      {row.contributions > 0 ? formatCurrency(show(row.contributions, row.n)) : "—"}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono whitespace-nowrap ${down ? "font-semibold text-destructive" : "text-green-600"}`}>
                      {(row.returnPct * 100).toFixed(1)}%
                    </td>
                    <td className={`py-2 px-3 text-right font-mono whitespace-nowrap ${down ? "text-destructive" : ""}`}>
                      {formatCurrency(show(row.growth, row.n))}
                    </td>
                    <td className="py-2 pl-3 text-right font-mono font-medium whitespace-nowrap">
                      {formatCurrency(show(row.closing, row.n))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {result.rows.length > 15 && (
          <div className="mt-3 flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)} className="text-xs">
              {showAll ? "Show fewer years" : `Show all ${result.rows.length} years`}
            </Button>
          </div>
        )}

        {historical && (
          <p className="mt-3 text-xs text-muted-foreground">
            The return column is the real, inflation-adjusted return that a{" "}
            {inputs.stocksPct}/{100 - inputs.stocksPct} portfolio actually earned that year.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
