# Investment Calculator

A simple standalone calculator: put in a lump sum, choose a stocks/bonds split and
a time period, and see what it could grow into — either on long-run average
returns, or on the actual year-by-year returns of any period in history.

Built as a companion to RetireWell, sharing its visual language and, importantly,
its verified historical returns dataset so the two tools agree with each other.

**Live:** https://lump-sum-growth.vercel.app — deployed on Vercel and
connected to this repo, so pushing to `main` publishes automatically.

## Running it

```
npm install
npm run dev
```

Then open http://localhost:3000.

```
npm test     # engine test suite — the growth maths, the date rule, the data
npm run build
```

## How it works

**Two modes.**

- *Long-run average* — a steady return based on 10% nominal for stocks and 4.5%
  for bonds (RetireWell's assumptions), blended at your split, with your inflation
  assumption subtracted.
- *A real period in history* — the actual real returns of each year from a start
  year you choose, with the portfolio rebalanced back to your target split
  annually.

**The date rule.** A historical run must sit entirely inside the dataset. Starting
at year Y for N years uses Y … Y+N-1, so Y can be at most `LAST_DATA_YEAR - N + 1`.
The start-year slider re-ranges itself whenever the period or split changes, and
an out-of-range year is pulled back in rather than being silently padded with a
made-up return. With no bonds, the stock series alone applies, which reaches back
further — so an all-stock portfolio can start as early as 1872.

**Real terms throughout.** The projection always works in today's money: the
historical series is already inflation-adjusted, and the average mode removes
inflation from the nominal assumptions. The "money of the day" view is a
presentation layer on top, never something the maths runs in.

**Contributions** earn half a year's growth in the year they are paid, since they
arrive through the year rather than all on 1 January.

## The data

`lib/historical-returns.ts` is copied verbatim from Retirewell v2, which holds the
provenance notes and the verification behind it:

- US stock total returns (dividends reinvested), 1872–2025, real — Robert Shiller
- US 10-year Treasury returns, 1928–2025, real — Aswath Damodaran (NYU Stern),
  deflated with the same Shiller CPI series
- Annual US inflation (CPI), 1872–2025, from that same CPI column

**Keep the two copies identical, and update them together.** The range constants at
the bottom of the file are derived from the data itself, so extending the series
widens the calculator's allowed dates with no other code change.

Extended from 1872–2022 to 1872–2025 in September 2026. Before adding anything,
all 151 existing stock values and all 95 existing bond values were re-derived from
the current spreadsheets and matched exactly. The earlier cut-off was not a quality
judgement — the copy of `ie_data.xls` hosted at econ.yale.edu is stale, ending
September 2023, so 2022 was the last complete year it held. Use the maintained file
linked from shillerdata.com.

Recent years are revised for a while after publication, and some recent months' CPI
is flagged as estimated. If a later check finds a recent year has moved, that is the
source behaving normally, not an error here.

## Not in scope

No Monte Carlo, no forecasts, no market predictions. This shows what has happened,
not what will.
