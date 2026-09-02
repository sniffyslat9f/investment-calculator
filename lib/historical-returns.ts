// METHODOLOGY NOTE (provenance — see below for the verification this is based on):
// Historical US equity returns are derived from Robert Shiller's Real Total Return Price series
// using December-to-December annual changes. The series is already inflation-adjusted and includes
// reinvested dividends.
//
// Real (inflation-adjusted) annual US stock market TOTAL returns (dividends reinvested), 1872–2025.
// Source: Robert Shiller, "Irrational Exuberance" dataset (ie_data.xls), "Real Total Return
// Price" series, December-to-December. Free, public, academic.
//
// Verified (Aug 2026): re-derived directly from the raw Shiller spreadsheet and confirmed an exact
// match to every value below across both the 1920s-80s and 2000s — no off-by-one, no double
// deflation. Cross-checked 12 individual years (1929, 1932, 1973, 1974, 1987, 2000, 2001, 2003,
// 2008, 2009, 2020, 2022) against Aswath Damodaran's independent NYU Stern dataset: 10/12 years
// agree closely in direction and magnitude. 1932 and 1987 disagree in sign — traced to a genuine
// methodology difference, not an extraction error: Damodaran computes a single annual-step return,
// (P_end - P_start + dividends) / P_start (his own documented formula), while Shiller's series
// compounds monthly reinvested dividends, deflated month by month. These diverge most in years with
// large intra-year swings (1932's Depression trough, 1987's October crash) — confirmed the two
// sources' inflation adjustments are essentially identical for those years (within 0.1 point), so
// the disagreement isn't a CPI/deflator issue. Shiller retained as the canonical source —
// the goal is one internally-consistent, well-documented dataset, not matching any specific
// external calculator.
//
// Replaced an earlier, shorter 1920–2023 series of uncertain provenance (Aug 2026) — it didn't
// consistently match either Shiller's dividend-included or dividend-excluded series closely enough
// to identify its exact source, so it couldn't be verified the way this one now is. That series
// also appears to have excluded reinvested dividends.
//
// EXTENDED 1872–2022 -> 1872–2025 (Sept 2026). The old end date was not a judgement about data
// quality: the copy of ie_data.xls hosted at econ.yale.edu is stale, ending September 2023, so 2022
// was simply the last COMPLETE December-to-December year it contained. The maintained file at
// shillerdata.com runs to August 2026. Before adding anything, all 151 existing stock values and
// all 95 existing bond values were re-derived from the current spreadsheets and matched EXACTLY,
// confirming both that the method here is right and that neither source has revised its history.
//
// CAVEAT on the most recent year: Shiller flags some recent months' CPI as estimated (October 2025
// was not published on schedule), and recent figures are revised for a while after publication. The
// December values underlying 2025 are actual, but if a future check finds 2025 has moved, that is
// expected behaviour of the source, not an error here.
export const HISTORICAL_REAL_RETURNS: Record<number, number> = {
  1872: 0.1062, 1873: -0.0103, 1874: 0.1677, 1875: 0.0866, 1876: -0.1021,
  1877: 0.1077, 1878: 0.3035, 1879: 0.2597, 1880: 0.2659, 1881: 0.0078,
  1882: 0.0453, 1883: 0.0486, 1884: -0.0306, 1885: 0.2865, 1886: 0.1872,
  1887: -0.0809, 1888: 0.0211, 1889: 0.1454, 1890: -0.1093, 1891: 0.2909,
  1892: 0.0484, 1893: -0.0886, 1894: 0.1015, 1895: 0.0204, 1896: 0.035,
  1897: 0.1722, 1898: 0.2179, 1899: -0.0583, 1900: 0.2349, 1901: 0.1467,
  1902: -0.0177, 1903: -0.0935, 1904: 0.2569, 1905: 0.1984, 1906: 0.0146,
  1907: -0.2794, 1908: 0.4053, 1909: 0.0778, 1910: -0.0013, 1911: 0.0814,
  1912: 0.0079, 1913: -0.1199, 1914: -0.0425, 1915: 0.3315, 1916: -0.0324,
  1917: -0.3666, 1918: 0.0479, 1919: 0.0494, 1920: -0.2061, 1921: 0.2914,
  1922: 0.3029, 1923: 0.0109, 1924: 0.2615, 1925: 0.2482, 1926: 0.1528,
  1927: 0.3893, 1928: 0.3975, 1929: -0.0476, 1930: -0.1882, 1931: -0.3579,
  1932: -0.0086, 1933: 0.5325, 1934: -0.0425, 1935: 0.4275, 1936: 0.3381,
  1937: -0.3382, 1938: 0.2598, 1939: 0.0201, 1940: -0.1031, 1941: -0.188,
  1942: 0.0745, 1943: 0.2335, 1944: 0.1732, 1945: 0.351, 1946: -0.2304,
  1947: -0.04, 1948: 0.0377, 1949: 0.1894, 1950: 0.2071, 1951: 0.1962,
  1952: 0.1704, 1953: 0.0024, 1954: 0.4916, 1955: 0.3445, 1956: 0.0323,
  1957: -0.122, 1958: 0.354, 1959: 0.1198, 1960: -0.0177, 1961: 0.2923,
  1962: -0.1091, 1963: 0.2021, 1964: 0.1546, 1965: 0.1042, 1966: -0.114,
  1967: 0.1737, 1968: 0.1001, 1969: -0.1683, 1970: -0.0273, 1971: 0.1006,
  1972: 0.1786, 1973: -0.2352, 1974: -0.3421, 1975: 0.2909, 1976: 0.1684,
  1977: -0.1219, 1978: -0.011, 1979: 0.043, 1980: 0.1574, 1981: -0.1049,
  1982: 0.1481, 1983: 0.1867, 1984: 0.0074, 1985: 0.2655, 1986: 0.2277,
  1987: -0.0435, 1988: 0.1377, 1989: 0.2443, 1990: -0.0797, 1991: 0.1844,
  1992: 0.1225, 1993: 0.0702, 1994: -0.0216, 1995: 0.3499, 1996: 0.1959,
  1997: 0.2957, 1998: 0.235, 1999: 0.1838, 2000: -0.0884, 2001: -0.1415,
  2002: -0.2204, 2003: 0.2001, 2004: 0.0926, 2005: 0.0355, 2006: 0.1144,
  2007: 0.0214, 2008: -0.3929, 2009: 0.2659, 2010: 0.1234, 2011: -0.0083,
  2012: 0.148, 2013: 0.278, 2014: 0.1499, 2015: 0.013, 2016: 0.0946,
  2017: 0.1841, 2018: -0.0366, 2019: 0.2333, 2020: 0.1691, 2021: 0.1983,
  2022: -0.2014, 2023: 0.1775, 2024: 0.2638, 2025: 0.1244,
}

// Real (inflation-adjusted) annual US 10-year Treasury bond returns, 1928–2025.
// Source: Aswath Damodaran, NYU Stern ("Returns by year" — US T.Bond 10-year, nominal),
// https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html — a widely-cited,
// free, public dataset used across academia and practice. Converted to real terms using the same
// Shiller CPI series as the stock data above, for consistency between the two series.
// Only goes back to 1928 — Damodaran's bond series doesn't extend further, and no equivalently
// well-established free total-return bond series exists back to 1872. A blended stock/bond
// historical test is therefore limited to 1928 onward; the S&P-only test still runs from 1872.
export const HISTORICAL_REAL_BOND_RETURNS: Record<number, number> = {
  1928: 0.0201, 1929: 0.036, 1930: 0.1168, 1931: 0.0745, 1932: 0.2125,
  1933: 0.0108, 1934: 0.0635, 1935: 0.0144, 1936: 0.0352, 1937: -0.0144,
  1938: 0.0719, 1939: 0.0441, 1940: 0.0465, 1941: -0.1087, 1942: -0.0618,
  1943: -0.0046, 1944: 0.0027, 1945: 0.0152, 1946: -0.127, 1947: -0.0727,
  1948: -0.0101, 1949: 0.0688, 1950: -0.0519, 1951: -0.0594, 1952: 0.015,
  1953: 0.0337, 1954: 0.0406, 1955: -0.017, 1956: -0.0509, 1957: 0.0379,
  1958: -0.0379, 1959: -0.043, 1960: 0.1014, 1961: 0.0138, 1962: 0.043,
  1963: 0.0004, 1964: 0.0273, 1965: -0.0118, 1966: -0.0053, 1967: -0.0448,
  1968: -0.0138, 1969: -0.1056, 1970: 0.1059, 1971: 0.0631, 1972: -0.0057,
  1973: -0.0464, 1974: -0.0921, 1975: -0.0312, 1976: 0.106, 1977: -0.0507,
  1978: -0.0899, 1979: -0.1114, 1980: -0.1378, 1981: -0.0066, 1982: 0.2792,
  1983: -0.0057, 1984: 0.0941, 1985: 0.2111, 1986: 0.2293, 1987: -0.09,
  1988: 0.0364, 1989: 0.1247, 1990: 0.0012, 1991: 0.1159, 1992: 0.0628,
  1993: 0.1116, 1994: -0.1043, 1995: 0.2042, 1996: -0.0183, 1997: 0.081,
  1998: 0.131, 1999: -0.1065, 2000: 0.1283, 2001: 0.0396, 2002: 0.1244,
  2003: -0.0148, 2004: 0.012, 2005: -0.0053, 2006: -0.0057, 2007: 0.0589,
  2008: 0.1999, 2009: -0.1347, 2010: 0.0686, 2011: 0.127, 2012: 0.0121,
  2013: -0.1045, 2014: 0.0991, 2015: 0.0055, 2016: -0.0136, 2017: 0.0068,
  2018: -0.0189, 2019: 0.0719, 2020: 0.0984, 2021: -0.107, 2022: -0.2281,
  2023: 0.0051, 2024: -0.044, 2025: 0.0498,
}

// Annual US inflation (CPI), December-to-December, 1872–2025, from the same Shiller CPI column used
// to deflate both series above — so inflation, stock returns and bond returns all share one basis.
// Used only for presentation: turning a real (today's money) figure into the money of its own day.
// The projections themselves never run in nominal terms.
export const HISTORICAL_INFLATION: Record<number, number> = {
  1872: 0.0226, 1873: -0.0588, 1874: -0.0547, 1875: -0.0496, 1876: -0.0174,
  1877: -0.115, 1878: -0.14, 1879: 0.186, 1880: -0.0196, 1881: 0.07,
  1882: -0.0187, 1883: -0.0762, 1884: -0.1031, 1885: -0.0115, 1886: -0.0465,
  1887: 0.061, 1888: 0.0, 1889: -0.0575, 1890: 0.0122, 1891: -0.0482,
  1892: 0.0127, 1893: -0.075, 1894: -0.0676, 1895: 0.029, 1896: -0.0141,
  1897: 0.0, 1898: 0.0143, 1899: 0.169, 1900: -0.0361, 1901: 0.05,
  1902: 0.0714, 1903: -0.0556, 1904: 0.0471, 1905: 0.0, 1906: 0.0562,
  1907: -0.0213, 1908: 0.0326, 1909: 0.1053, 1910: -0.0762, 1911: -0.0206,
  1912: 0.0737, 1913: 0.0304, 1914: 0.01, 1915: 0.0198, 1916: 0.1262,
  1917: 0.181, 1918: 0.2044, 1919: 0.1455, 1920: 0.0265, 1921: -0.1082,
  1922: -0.0231, 1923: 0.0237, 1924: 0.0, 1925: 0.0347, 1926: -0.0112,
  1927: -0.0226, 1928: -0.0116, 1929: 0.0058, 1930: -0.064, 1931: -0.0932,
  1932: -0.1027, 1933: 0.0076, 1934: 0.0152, 1935: 0.0299, 1936: 0.0145,
  1937: 0.0286, 1938: -0.0278, 1939: 0.0, 1940: 0.0071, 1941: 0.0993,
  1942: 0.0903, 1943: 0.0296, 1944: 0.023, 1945: 0.0225, 1946: 0.1813,
  1947: 0.0884, 1948: 0.0299, 1949: -0.0207, 1950: 0.0593, 1951: 0.06,
  1952: 0.0075, 1953: 0.0075, 1954: -0.0074, 1955: 0.0037, 1956: 0.0299,
  1957: 0.029, 1958: 0.0176, 1959: 0.0173, 1960: 0.0136, 1961: 0.0067,
  1962: 0.0133, 1963: 0.0164, 1964: 0.0097, 1965: 0.0192, 1966: 0.0346,
  1967: 0.0304, 1968: 0.0472, 1969: 0.062, 1970: 0.0557, 1971: 0.0327,
  1972: 0.0341, 1973: 0.0871, 1974: 0.1234, 1975: 0.0694, 1976: 0.0486,
  1977: 0.067, 1978: 0.0902, 1979: 0.1329, 1980: 0.1252, 1981: 0.0892,
  1982: 0.0383, 1983: 0.0379, 1984: 0.0395, 1985: 0.038, 1986: 0.011,
  1987: 0.0443, 1988: 0.0442, 1989: 0.0465, 1990: 0.0611, 1991: 0.0306,
  1992: 0.029, 1993: 0.0275, 1994: 0.0267, 1995: 0.0254, 1996: 0.0332,
  1997: 0.017, 1998: 0.0161, 1999: 0.0268, 2000: 0.0339, 2001: 0.0155,
  2002: 0.0238, 2003: 0.0188, 2004: 0.0326, 2005: 0.0342, 2006: 0.0254,
  2007: 0.0408, 2008: 0.0009, 2009: 0.0272, 2010: 0.015, 2011: 0.0296,
  2012: 0.0174, 2013: 0.015, 2014: 0.0076, 2015: 0.0073, 2016: 0.0207,
  2017: 0.0211, 2018: 0.0191, 2019: 0.0229, 2020: 0.0136, 2021: 0.0704,
  2022: 0.0645, 2023: 0.0335, 2024: 0.0289, 2025: 0.0268,
}

// Start years offered in the historical-sequence dropdown. The cut-off is derived from the data
// rather than written in by hand, so extending the series widens the list on its own — a hardcoded
// year silently stops offering the newest starting points the moment the data moves past it.
export const HISTORICAL_SEQUENCE_YEARS = 25 // a run needs at least this many years of real data
const LAST_STOCK_DATA_YEAR = Math.max(...Object.keys(HISTORICAL_REAL_RETURNS).map(Number))

export const HISTORICAL_START_YEARS = Object.keys(HISTORICAL_REAL_RETURNS)
  .map(Number)
  .filter(y => y + HISTORICAL_SEQUENCE_YEARS - 1 <= LAST_STOCK_DATA_YEAR)
  .sort((a, b) => a - b)

// Notable years with labels for the dropdown
export const NOTABLE_YEARS: Record<number, string> = {
  1893: "1893 — Panic of 1893",
  1907: "1907 — Panic of 1907",
  1929: "1929 — Wall St Crash",
  1937: "1937 — Depression relapse",
  1946: "1946 — Post-war adjustment",
  1966: "1966 — Vietnam-era stagflation",
  1973: "1973 — Oil crisis",
  1980: "1980 — Volcker rate shock",
  1987: "1987 — Black Monday",
  2000: "2000 — Dot-com crash",
}

// Build a per-year real stock returns array for use with generateProjection
// Years past the end of the real dataset come back as undefined — the caller (engine.ts) falls
// back to the user's own configured stock return assumption for those years (same pattern as the
// bond array below), rather than a second, hardcoded guess disconnected from what the user actually
// entered. This only affects the single-sequence "Year-by-Year Projection" detail view for starting
// years old enough to run past the data's end (e.g. 1998) — the headline Historical Cycles % never
// hits this path, since it only counts starting years with a complete run of real data.
export function getHistoricalRealReturnsArray(startYear: number, years: number): (number | undefined)[] {
  return Array.from({ length: years }, (_, i) => {
    const y = startYear + i
    return HISTORICAL_REAL_RETURNS[y]
  })
}

// Build a per-year real bond returns array, same shape as the stock one above. Years before 1928
// (no bond data) come back as undefined — the caller falls back to the user's own flat bond
// return assumption for those years, rather than a second, different hardcoded guess here.
export function getHistoricalRealBondReturnsArray(startYear: number, years: number): (number | undefined)[] {
  return Array.from({ length: years }, (_, i) => {
    const y = startYear + i
    return HISTORICAL_REAL_BOND_RETURNS[y]
  })
}

// ---------------------------------------------------------------------------
// Added for Investment Calculator (everything above this line is copied
// verbatim from Retirewell v2 so the two apps share one verified dataset —
// keep it that way, and update both together.)
// ---------------------------------------------------------------------------

// Derived from the data itself rather than hardcoded, so extending the series
// automatically widens the calculator's allowed date range with no other code
// change.
const stockYears = Object.keys(HISTORICAL_REAL_RETURNS).map(Number)
const bondYears = Object.keys(HISTORICAL_REAL_BOND_RETURNS).map(Number)

export const FIRST_STOCK_YEAR = Math.min(...stockYears)
export const FIRST_BOND_YEAR = Math.min(...bondYears)
export const LAST_DATA_YEAR = Math.min(Math.max(...stockYears), Math.max(...bondYears))
export const LAST_STOCK_YEAR = Math.max(...stockYears)

export const HAS_INFLATION_DATA = Object.keys(HISTORICAL_INFLATION).length > 0
