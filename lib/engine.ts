// Investment Calculator — growth engine.
//
// Everything is modelled in REAL (today's money) terms, matching RetireWell:
// the historical return series is already inflation-adjusted, and the average
// mode subtracts the user's inflation assumption from nominal returns. The
// "money of the day" view is a presentation layer applied on top (see
// toNominal), never something the projection itself works in.

import {
  HISTORICAL_REAL_RETURNS,
  HISTORICAL_REAL_BOND_RETURNS,
  FIRST_STOCK_YEAR,
  FIRST_BOND_YEAR,
  LAST_DATA_YEAR,
  LAST_STOCK_YEAR,
  HISTORICAL_INFLATION,
} from "./historical-returns"

// Long-run nominal averages — identical to RetireWell v2's engine, deliberately.
// Stocks: 10.0% nominal, S&P 500 long-run historical average.
// Bonds: 4.5% nominal, long-run US 10-year Treasury average.
// Inflation is subtracted separately so all output is in real terms.
export const STOCK_RETURN = 0.10
export const BOND_RETURN = 0.045

export type Mode = "average" | "historical"
export type Frequency = "monthly" | "annual"

export interface CalcInputs {
  capital: number
  stocksPct: number          // 0–100; bonds are the remainder
  years: number
  contribution: number       // per period, in today's money
  frequency: Frequency
  contributionsRiseWithInflation: boolean
  inflationRate: number      // e.g. 0.025
  mode: Mode
  startYear: number          // historical mode only
}

export interface YearRow {
  n: number                  // 1, 2, 3 … from the start
  calendarYear: number | null // the real year, historical mode only
  opening: number
  contributions: number
  returnPct: number          // real return for that year
  growth: number
  closing: number
}

export interface Result {
  rows: YearRow[]
  finalValue: number
  totalContributed: number   // starting capital + everything added
  totalGrowth: number
}

// --- allowed date range -----------------------------------------------------
// A run must sit entirely inside the data: starting at Y for N years uses
// Y … Y+N-1, so Y can be at most LAST - N + 1. With no bonds the stock series
// alone applies, which reaches back further than the bond series does.

export function firstAvailableYear(stocksPct: number): number {
  return stocksPct >= 100 ? FIRST_STOCK_YEAR : FIRST_BOND_YEAR
}

export function lastAvailableYear(stocksPct: number): number {
  return stocksPct >= 100 ? LAST_STOCK_YEAR : LAST_DATA_YEAR
}

export function maxYears(stocksPct: number): number {
  return lastAvailableYear(stocksPct) - firstAvailableYear(stocksPct) + 1
}

export function latestStartYear(stocksPct: number, years: number): number {
  return lastAvailableYear(stocksPct) - years + 1
}

/** Every start year that gives a complete run of real data. */
export function validStartYears(stocksPct: number, years: number): number[] {
  const first = firstAvailableYear(stocksPct)
  const last = latestStartYear(stocksPct, years)
  const out: number[] = []
  for (let y = first; y <= last; y++) out.push(y)
  return out
}

/** Pull a start year back into range when the period or split changes. */
export function clampStartYear(stocksPct: number, years: number, startYear: number): number {
  const first = firstAvailableYear(stocksPct)
  const last = latestStartYear(stocksPct, years)
  if (last < first) return first
  return Math.min(Math.max(startYear, first), last)
}

// --- returns ----------------------------------------------------------------

/** Blended nominal return for a split, using the long-run averages. */
export function blendedNominal(stocksPct: number): number {
  const s = stocksPct / 100
  return s * STOCK_RETURN + (1 - s) * BOND_RETURN
}

/** Same, converted to real terms by removing inflation. */
export function blendedReal(stocksPct: number, inflationRate: number): number {
  return (1 + blendedNominal(stocksPct)) / (1 + inflationRate) - 1
}

/**
 * The real return actually achieved in one historical year, for a portfolio
 * rebalanced back to its target split annually. Returns undefined if either
 * series is missing that year — callers should never hit this, because the
 * start-year range above makes it unreachable, but it is not silently faked.
 */
export function historicalRealReturn(year: number, stocksPct: number): number | undefined {
  const s = stocksPct / 100
  const stock = HISTORICAL_REAL_RETURNS[year]
  if (stock === undefined) return undefined
  if (s >= 1) return stock
  const bond = HISTORICAL_REAL_BOND_RETURNS[year]
  if (bond === undefined) return undefined
  return s * stock + (1 - s) * bond
}

// --- the projection ---------------------------------------------------------

/**
 * Contributions arrive spread through the year rather than all on day one, so
 * they earn roughly half a year's growth in the year they are paid. This is the
 * standard convention and is honest either way — treating them as arriving on
 * 1 January would overstate growth, and on 31 December would understate it.
 */
function grownContributions(amount: number, realReturn: number): number {
  return amount * Math.pow(1 + realReturn, 0.5)
}

export function project(inputs: CalcInputs): Result {
  const {
    capital, stocksPct, years, contribution, frequency,
    contributionsRiseWithInflation, inflationRate, mode, startYear,
  } = inputs

  const perYear = contribution * (frequency === "monthly" ? 12 : 1)
  const flatReal = blendedReal(stocksPct, inflationRate)

  const rows: YearRow[] = []
  let balance = capital
  let contributed = capital

  for (let i = 0; i < years; i++) {
    const calendarYear = mode === "historical" ? startYear + i : null

    let realReturn: number
    if (mode === "historical") {
      const r = historicalRealReturn(startYear + i, stocksPct)
      // Unreachable while the start year is clamped to a complete run; if the
      // data range ever changes underneath us, stop rather than invent a number.
      if (r === undefined) break
      realReturn = r
    } else {
      realReturn = flatReal
    }

    // A contribution that rises with inflation holds its value, so in today's
    // money it stays flat. A fixed one is eroded by inflation each year.
    const realContribution = contributionsRiseWithInflation
      ? perYear
      : perYear / Math.pow(1 + inflationRate, i)

    const opening = balance
    const closing = opening * (1 + realReturn) + grownContributions(realContribution, realReturn)

    rows.push({
      n: i + 1,
      calendarYear,
      opening,
      contributions: realContribution,
      returnPct: realReturn,
      growth: closing - opening - realContribution,
      closing,
    })

    balance = closing
    contributed += realContribution
  }

  return {
    rows,
    finalValue: balance,
    totalContributed: contributed,
    totalGrowth: balance - contributed,
  }
}

// --- presentation -----------------------------------------------------------

/** Convert a today's-money figure into the money of its own year. */
export function toNominal(realValue: number, yearsElapsed: number, inflationRate: number): number {
  return realValue * Math.pow(1 + inflationRate, yearsElapsed)
}

/**
 * How much prices actually rose over the first `yearsElapsed` years of a run
 * starting in `startYear`. Returns undefined if the inflation series doesn't
 * cover the whole span, so the caller falls back rather than half-applying it.
 *
 * Note this is the inflation *path* of those years applied to money invested
 * today — not the absolute price level of the 1930s. The question being
 * answered is "if the next N years repeated that period, what would my
 * statement say?", so the run starts from today's money either way.
 */
export function historicalInflationFactor(startYear: number, yearsElapsed: number): number | undefined {
  let factor = 1
  for (let i = 0; i < yearsElapsed; i++) {
    const rate = HISTORICAL_INFLATION[startYear + i]
    if (rate === undefined) return undefined
    factor *= 1 + rate
  }
  return factor
}

/**
 * The multiplier that turns a today's-money figure into money-of-the-day.
 * Historical runs use the real inflation of those years where the data allows;
 * everything else uses the user's own inflation assumption.
 */
export function nominalFactor(inputs: CalcInputs, yearsElapsed: number): number {
  if (inputs.mode === "historical") {
    const actual = historicalInflationFactor(inputs.startYear, yearsElapsed)
    if (actual !== undefined) return actual
  }
  return Math.pow(1 + inputs.inflationRate, yearsElapsed)
}

/**
 * The annualised return the money actually earned, in real (today's money) terms.
 *
 * This is a money-weighted return (an IRR), not simply the start and end values
 * compared — with regular top-ups those two differ, because money paid in later
 * has had less time to grow. Contributions are dated mid-year to match how the
 * projection credits them.
 *
 * Returns undefined when nothing was invested, or when the portfolio is wiped
 * out, since there is no meaningful rate to quote.
 */
export function annualisedRealReturn(inputs: CalcInputs, result: Result): number | undefined {
  if (result.totalContributed <= 0 || result.finalValue <= 0) return undefined

  const npv = (rate: number): number => {
    let v = -inputs.capital
    result.rows.forEach((row, i) => {
      if (row.contributions > 0) v -= row.contributions / Math.pow(1 + rate, i + 0.5)
    })
    return v + result.finalValue / Math.pow(1 + rate, inputs.years)
  }

  let lo = -0.9999, hi = 10
  if (npv(lo) * npv(hi) > 0) return undefined
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (npv(lo) * npv(mid) <= 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

/** Average yearly inflation over the run — assumed, or the real thing for a historical period. */
export function inflationPerYear(inputs: CalcInputs): number {
  return Math.pow(nominalFactor(inputs, inputs.years), 1 / inputs.years) - 1
}

/** The same return before inflation is taken off. */
export function toGross(realRate: number, inputs: CalcInputs): number {
  return (1 + realRate) * (1 + inflationPerYear(inputs)) - 1
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function getDefaultInputs(): CalcInputs {
  return {
    capital: 25000,
    // 90/10 — the split Warren Buffett recommends for a simple long-term portfolio.
    stocksPct: 90,
    years: 20,
    contribution: 0,
    frequency: "monthly",
    contributionsRiseWithInflation: true,
    inflationRate: 0.025,
    mode: "average",
    startYear: clampStartYear(90, 20, 2000),
  }
}
