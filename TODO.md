# To do

Nothing outstanding.

---

## Done

### Put the app online (Sept 2026)

Live at **https://lump-sum-growth.vercel.app**, on Vercel. The GitHub repo is connected, so **any push to `main`
publishes itself** — no manual deploy step from here on.

Verified live: no console errors, the historical mode works, the date range
reflects the 2025 data (98-year maximum, 79 start years for a 20-year run), and
the mobile layout stacks correctly with no sideways scrolling.

Deliberately named with no personal identifiers — no surname, no account name.
Vercel also generates a machine URL (`investment-calculator-kohl-six.vercel.app`)
which works but isn't the one to share.

**Rule: nothing published from this repo carries a real name.** That includes
domains, commit authors, and the text of these notes.

### Bring the historical data up to 2025, and add the inflation series (Sept 2026)

Completed. Stocks now 1872–2025, bonds 1928–2025, plus a full CPI series.

**What the 2022 cut-off actually was:** not a judgement about data quality. The
copy of `ie_data.xls` hosted at econ.yale.edu is **stale — it ends September
2023**, so 2022 was simply the last complete December-to-December year in it. The
maintained file at shillerdata.com runs to August 2026. Damodaran's bond table
was already current to 2025.

**Verification done before adding anything:** all 151 existing stock values and
all 95 existing bond values were re-derived from the current spreadsheets and
matched **exactly** — confirming both that the method recorded here is right and
that neither source has revised its history.

**Added:** stocks 2023 +17.75%, 2024 +26.38%, 2025 +12.44%; bonds 2023 +0.51%,
2024 −4.40%, 2025 +4.98% (all real). Inflation 2023 3.35%, 2024 2.89%, 2025 2.68%.

**Also fixed:** RetireWell v2's start-year list had the cut-off written in by hand
(`y <= 2000`), so it would have kept offering the same years after the data grew.
It now derives the cut-off from the data, like this app already did.

**Caveat carried forward:** Shiller flags some recent months' CPI as estimated
(October 2025 wasn't published on schedule) and revises recent figures for a
while. The December values behind 2025 are actual, but if a future check finds
2025 has moved, that is the source behaving normally, not an error here.
