/* Investment Calculator engine test suite.
 * Checks the growth maths, the date-range rule, and the historical data itself.
 * Run with:  npm test   (compiles the engine, then runs these checks)
 */
const E = require('../.test-build/engine.js')
const D = require('../.test-build/historical-returns.js')

let pass = 0, fail = 0
function eq(label, got, want, tol = 0.5) {
  const okay = Math.abs(got - want) <= tol
  console.log(`  ${okay ? 'PASS' : 'FAIL'}  ${label}  (got ${Math.round(got * 1000) / 1000}, want ${want})`)
  okay ? pass++ : fail++
}
function ok(label, cond) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}`)
  cond ? pass++ : fail++
}

const base = () => ({
  capital: 100000, stocksPct: 60, years: 20, contribution: 0, frequency: 'annual',
  contributionsRiseWithInflation: true, inflationRate: 0.025, mode: 'average', startYear: 2000,
})

console.log('\n# Blended returns (RetireWell assumptions: 10% stocks / 4.5% bonds nominal)')
eq('100% stocks nominal', E.blendedNominal(100), 0.10, 1e-9)
eq('100% bonds nominal', E.blendedNominal(0), 0.045, 1e-9)
eq('60/40 nominal', E.blendedNominal(60), 0.078, 1e-9)
eq('60/40 real at 2.5% inflation', E.blendedReal(60, 0.025), (1.078 / 1.025) - 1, 1e-9)
eq('zero inflation leaves nominal unchanged', E.blendedReal(60, 0), 0.078, 1e-9)

console.log('\n# Average-mode compounding')
{
  const r = E.project({ ...base(), years: 10 })
  const expected = 100000 * Math.pow(1 + E.blendedReal(60, 0.025), 10)
  eq('£100k, 60/40, 10 years', r.finalValue, expected, 0.01)
  eq('no contributions means total in = capital', r.totalContributed, 100000, 1e-9)
  eq('growth = final minus capital', r.totalGrowth, expected - 100000, 0.01)
  ok('one row per year', r.rows.length === 10)
  ok('rows chain: each opening is the previous closing',
    r.rows.every((row, i) => i === 0 || Math.abs(row.opening - r.rows[i - 1].closing) < 1e-9))
}

console.log('\n# Contributions')
{
  const r = E.project({ ...base(), capital: 0, years: 1, contribution: 1000, frequency: 'monthly' })
  const rr = E.blendedReal(60, 0.025)
  eq('£1,000/month for a year = £12,000 in', r.totalContributed, 12000, 1e-9)
  eq('earns half a year of growth', r.finalValue, 12000 * Math.pow(1 + rr, 0.5), 0.01)
}
{
  const flat = E.project({ ...base(), capital: 0, years: 10, contribution: 1200, frequency: 'annual', contributionsRiseWithInflation: false })
  const rising = E.project({ ...base(), capital: 0, years: 10, contribution: 1200, frequency: 'annual', contributionsRiseWithInflation: true })
  ok('a fixed contribution is worth less in real terms than a rising one', flat.finalValue < rising.finalValue)
  eq('rising contributions are flat in today\'s money', rising.rows[9].contributions, 1200, 1e-9)
  eq('fixed contributions erode by inflation', flat.rows[9].contributions, 1200 / Math.pow(1.025, 9), 1e-9)
}

console.log('\n# Historical mode')
{
  const r = E.project({ ...base(), mode: 'historical', startYear: 2000, years: 3, stocksPct: 100 })
  ok('uses the real calendar years', r.rows.map(x => x.calendarYear).join() === '2000,2001,2002')
  const want = 100000 * (1 + D.HISTORICAL_REAL_RETURNS[2000]) * (1 + D.HISTORICAL_REAL_RETURNS[2001]) * (1 + D.HISTORICAL_REAL_RETURNS[2002])
  eq('dot-com crash, 100% stocks, 2000–2002', r.finalValue, want, 0.01)
  ok('and it loses money', r.finalValue < 100000)
}
{
  const year = 1974
  const blend = E.historicalRealReturn(year, 60)
  const want = 0.6 * D.HISTORICAL_REAL_RETURNS[year] + 0.4 * D.HISTORICAL_REAL_BOND_RETURNS[year]
  eq('60/40 blends the two series (annual rebalancing)', blend, want, 1e-9)
}
ok('a year outside the data returns undefined, not a guess', E.historicalRealReturn(1500, 60) === undefined)
ok('bonds are unavailable before 1928', E.historicalRealReturn(1900, 60) === undefined)
ok('but stocks alone reach back to 1872', E.historicalRealReturn(1872, 100) !== undefined)

console.log('\n# The date-range rule: a run must fit inside the data')
{
  const last = D.LAST_DATA_YEAR
  eq('20-year run must start by LAST-19', E.latestStartYear(60, 20), last - 19, 1e-9)
  eq('40-year run must start by LAST-39', E.latestStartYear(60, 40), last - 39, 1e-9)
  eq('1-year run can start on the last year itself', E.latestStartYear(60, 1), last, 1e-9)
  eq('mixed portfolios start at the bond series', E.firstAvailableYear(60), D.FIRST_BOND_YEAR, 1e-9)
  eq('all-stock portfolios start at the stock series', E.firstAvailableYear(100), D.FIRST_STOCK_YEAR, 1e-9)
  ok('every valid start year gives a complete run',
    E.validStartYears(60, 25).every(y => E.project({ ...base(), mode: 'historical', startYear: y, years: 25 }).rows.length === 25))
  ok('the longest possible period still runs end to end',
    E.project({ ...base(), mode: 'historical', stocksPct: 60, years: E.maxYears(60), startYear: E.firstAvailableYear(60) }).rows.length === E.maxYears(60))
  eq('a too-early start year is pulled into range', E.clampStartYear(60, 20, 1800), D.FIRST_BOND_YEAR, 1e-9)
  eq('a too-late start year is pulled into range', E.clampStartYear(60, 20, 2100), last - 19, 1e-9)
}

console.log('\n# Annualised return')
{
  // No contributions: the money-weighted return must equal simple compounding.
  const r = E.project({ ...base(), years: 10 })
  const rate = E.annualisedRealReturn({ ...base(), years: 10 }, r)
  eq('lump sum only: matches the underlying real rate', rate, E.blendedReal(60, 0.025), 1e-6)
  eq('gross = real plus inflation', E.toGross(rate, { ...base(), years: 10 }), E.blendedNominal(60), 1e-6)
  ok('gross is always the higher of the two while inflation is positive', E.toGross(rate, base()) > rate)
}
{
  // With top-ups, later money has had less time to grow, so comparing start and
  // end values would overstate the rate. The money-weighted figure must not.
  const inp = { ...base(), capital: 10000, years: 20, contribution: 5000, frequency: 'annual' }
  const r = E.project(inp)
  const rate = E.annualisedRealReturn(inp, r)
  eq('with top-ups: still the underlying real rate', rate, E.blendedReal(60, 0.025), 1e-6)
  const naive = Math.pow(r.finalValue / r.totalContributed, 1 / 20) - 1
  ok('and it is not the naive start-to-end figure', Math.abs(naive - rate) > 0.005)
}
{
  const inp = { ...base(), mode: 'historical', startYear: 2000, years: 20, stocksPct: 100 }
  const rate = E.annualisedRealReturn(inp, E.project(inp))
  const want = Math.pow(E.project(inp).finalValue / 100000, 1 / 20) - 1
  eq('historical run, no top-ups', rate, want, 1e-6)
  eq('gross uses the real inflation of those years', E.toGross(rate, inp),
     (1 + rate) * Math.pow(E.historicalInflationFactor(2000, 20), 1 / 20) - 1, 1e-9)
}
ok('nothing invested means no rate to quote',
  E.annualisedRealReturn({ ...base(), capital: 0, contribution: 0 }, E.project({ ...base(), capital: 0, contribution: 0 })) === undefined)

console.log("\n# Today's money vs money of the day")
eq('no inflation means no difference', E.toNominal(1000, 20, 0), 1000, 1e-9)
eq('20 years at 2.5%', E.toNominal(1000, 20, 0.025), 1000 * Math.pow(1.025, 20), 1e-9)
eq('year zero is unchanged', E.toNominal(1000, 0, 0.025), 1000, 1e-9)

console.log('\n# Actual historical inflation (money of the day)')
{
  ok('the inflation series covers the whole stock series', (() => {
    const ys = Object.keys(D.HISTORICAL_REAL_RETURNS).map(Number)
    return ys.every(y => D.HISTORICAL_INFLATION[y] !== undefined)
  })())
  const f = E.historicalInflationFactor(2000, 20)
  const want = Array.from({ length: 20 }, (_, i) => 1 + D.HISTORICAL_INFLATION[2000 + i]).reduce((a, b) => a * b, 1)
  eq('2000-2019 compounds the real inflation of those years', f, want, 1e-9)
  ok('prices roughly doubled over a long historical run', E.historicalInflationFactor(1970, 40) > 2)
  ok('a span outside the data returns undefined, not a guess', E.historicalInflationFactor(1500, 10) === undefined)
  eq('zero years means no inflation at all', E.historicalInflationFactor(2000, 0), 1, 1e-9)

  const hist = { ...base(), mode: 'historical', startYear: 2000, years: 20 }
  eq('historical runs use the real inflation of those years', E.nominalFactor(hist, 20), want, 1e-9)
  eq('average runs use the assumed rate', E.nominalFactor({ ...base(), years: 20 }, 20), Math.pow(1.025, 20), 1e-9)
  const preData = { ...base(), mode: 'historical', startYear: 1500, years: 10 }
  eq('and fall back to the assumed rate when data is missing', E.nominalFactor(preData, 10), Math.pow(1.025, 10), 1e-9)
}

console.log('\n# The dataset itself')
ok('stock series is unbroken from first year to last', (() => {
  const ys = Object.keys(D.HISTORICAL_REAL_RETURNS).map(Number).sort((a, b) => a - b)
  return ys.every((y, i) => i === 0 || y === ys[i - 1] + 1)
})())
ok('bond series is unbroken from first year to last', (() => {
  const ys = Object.keys(D.HISTORICAL_REAL_BOND_RETURNS).map(Number).sort((a, b) => a - b)
  return ys.every((y, i) => i === 0 || y === ys[i - 1] + 1)
})())
ok('the two series end together', Math.max(...Object.keys(D.HISTORICAL_REAL_BOND_RETURNS).map(Number)) === D.LAST_DATA_YEAR)
ok('inflation series is unbroken from first year to last', (() => {
  const ys = Object.keys(D.HISTORICAL_INFLATION).map(Number).sort((a, b) => a - b)
  return ys.every((y, i) => i === 0 || y === ys[i - 1] + 1)
})())
ok('1931 was a bad year for stocks', D.HISTORICAL_REAL_RETURNS[1931] < -0.3)
ok('2008 was a bad year for stocks', D.HISTORICAL_REAL_RETURNS[2008] < -0.3)
ok('1932 was a good year for bonds', D.HISTORICAL_REAL_BOND_RETURNS[1932] > 0.2)

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail > 0 ? 1 : 0)
