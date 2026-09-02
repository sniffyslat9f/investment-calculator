# Investment Calculator — notes for Claude

A standalone growth calculator: lump sum + stocks/bonds split + period (+ optional
top-ups) → what it could become, either on long-run averages or on the real
returns of a chosen period in history. See `README.md` for how it works.

## Standing rule — syncing across the owner's two Macs

This project lives in `~/Code`, **not** in iCloud. iCloud corrupts git repos (it
renames `.git` to `git 2` on cross-machine conflicts), so iCloud must never be used
for it. Do not "helpfully" move it back.

The owner works across two Macs and should never have to remember
to sync. So **at the START of every session, before doing anything else:**

1. Run `git fetch` and check whether the remote is ahead.
2. If it is, `git pull` before touching a single file.
3. Say in one line what you pulled, or that it was already current.

The repo is **public** (`github.com/sniffyslat9f/investment-calculator`) by
deliberate choice, so the tool can be shared. That is safe because the app stores
nothing and contains no personal figures — but it does mean never committing real
holdings, exported RetireWell JSON, or anything else personal here.

## The dataset is shared with Retirewell v2 — keep them identical

`lib/historical-returns.ts` above the marked line is copied **verbatim** from
`~/Code/Retirewell v2/retirewell/lib/historical-returns.ts`. That file holds the
provenance and verification notes; read them before touching any number.

Rule for this project: **follow RetireWell as the guide and the tiebreaker.**
The two tools agreeing with each other matters more than either being marginally
"better" on its own. So if the data changes, change it in both, in the same
session, and check v2 is up to date (`git fetch`) before copying from it.

The dataset now runs to **2025** (extended Sept 2026). Before those years were
added, every existing value was re-derived from the current source spreadsheets
and matched exactly — that check is the price of touching this data, and it comes
first. Never type numbers from memory or from a search-result summary; always
re-derive from Shiller's own spreadsheet and Damodaran's own table.

Note the trap that caused the previous 2022 cut-off: **the copy of ie_data.xls at
econ.yale.edu is stale** (it ends September 2023). Use the maintained file linked
from shillerdata.com.

Recent years are revised for a while after publication, and Shiller flags some
recent months' CPI as estimated. If a future check finds a recent year has moved,
that is the source behaving normally — investigate, don't paper over it.

The "money of the day" view uses the actual inflation of the chosen years, from
the CPI series in the same file. It falls back to the assumed rate only where
the data doesn't reach, and says which it is doing on screen.


## The Mac desktop app

There is a clickable icon in `/Applications/Investment Calculator.app`. It is not
a real application — it is a tiny bundle whose only job is to open the live site,
so it needs no maintenance and can't fall out of date with the code.

`tools/make-mac-app.sh` rebuilds it from scratch (needs Pillow: `pip3 install
pillow`). Run it if the live address ever changes — the URL is the first line of
the script — or if the icon needs redrawing.

The icon is drawn in code inside that script rather than kept only as a binary,
so it can be edited: a green rounded square with the same rising-chart mark as
the app header. `tools/icon.icns` is the generated result, committed so the app
can be rebuilt without regenerating it.

Two things that will waste time if forgotten:
- It must go in `/Applications`, not `~/Applications`. The second one exists, is
  easy to write to by mistake, and does not appear in Finder's sidebar — the
  owner will not find it there.
- `touch` the bundle after building, or Finder keeps showing the old icon.

## House style

- **No forecasts, no market predictions, no valuation calls.** Historical data
  only. This is a hard rule across all of these investing tools.
- Invalid states should be impossible to select rather than validated after the
  fact — the start-year range is derived from the data and the chosen period.
- Never substitute a fallback return for missing data. Stop, or don't offer the
  choice.
- Write for a non-technical reader: plain English in the UI and in explanations,
  and spell out any steps needed.

## Checks before saying something works

```
npm test          # 43 engine tests
npx tsc --noEmit
npm run build
```
