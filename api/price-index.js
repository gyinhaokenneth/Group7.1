/**
 * URA Private Residential Property Price Index (PPI)
 *
 * The URA DataService API does NOT publish the price index - it only serves
 * transactions, median rentals and developer sales (every index-shaped
 * service name returns "Invalid service."). URA's official PPI is released
 * quarterly through data.gov.sg instead, which is what this module reads.
 *
 * Two datasets are merged:
 *   d_97f8a2e995022d311c6c68cfda6d034c - index by property type (Landed /
 *     Non-Landed / All Residential)
 *   d_f65e490a8ad430f60a9a3d9df2bff2a0 - non-landed index by locality
 *     (Core Central / Rest of Central / Outside Central Region)
 *
 * Both are indexed to 2009-Q1 = 100 and compiled by URA using stratified
 * hedonic regression.
 */

const DATASTORE = 'https://data.gov.sg/api/action/datastore_search';
const TYPE_DATASET = 'd_97f8a2e995022d311c6c68cfda6d034c';
const LOCALITY_DATASET = 'd_f65e490a8ad430f60a9a3d9df2bff2a0';

const BASE_PERIOD = '2009-Q1 = 100';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // quarterly data - 6h is plenty

let cache = null;
let cacheTimestamp = 0;

const SEGMENTS = [
  { key: 'landed', label: 'Landed', group: 'type', match: 'Landed' },
  { key: 'nonLanded', label: 'Non-Landed', group: 'type', match: 'Non-Landed' },
  { key: 'ccr', label: 'CCR', full: 'Core Central Region', group: 'locality', match: 'Core Central Region' },
  { key: 'rcr', label: 'RCR', full: 'Rest of Central Region', group: 'locality', match: 'Rest of Central Region' },
  { key: 'ocr', label: 'OCR', full: 'Outside Central Region', group: 'locality', match: 'Outside Central Region' },
];

/** Pull every row of a datastore resource, paging past the 100-row default. */
async function fetchDataset(resourceId) {
  const rows = [];
  let offset = 0;
  const limit = 1000;
  for (let guard = 0; guard < 20; guard++) {
    const res = await fetch(`${DATASTORE}?resource_id=${resourceId}&limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error(`data.gov.sg responded ${res.status} for ${resourceId}`);
    const body = await res.json();
    if (!body.success) throw new Error(`data.gov.sg returned success=false for ${resourceId}`);
    const batch = body.result.records || [];
    rows.push(...batch);
    offset += batch.length;
    if (batch.length === 0 || offset >= (body.result.total || 0)) break;
  }
  return rows;
}

/** "2026-Q2" -> 20262, so quarters sort and subtract correctly. */
function quarterKey(q) {
  const m = /^(\d{4})-Q([1-4])$/.exec(String(q).trim());
  return m ? parseInt(m[1], 10) * 4 + (parseInt(m[2], 10) - 1) : null;
}

function pctChange(current, previous) {
  if (current === null || previous === null || !previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export async function getPriceIndex(options = {}) {
  const quarters = Math.max(2, Math.min(40, Number(options.quarters) || 12));
  const now = Date.now();

  if (!cache || now - cacheTimestamp > CACHE_TTL_MS) {
    const [typeRows, localityRows] = await Promise.all([
      fetchDataset(TYPE_DATASET),
      fetchDataset(LOCALITY_DATASET),
    ]);
    cache = { typeRows, localityRows };
    cacheTimestamp = now;
  }

  // segment key -> { quarter -> index }
  const byQuarter = new Map(SEGMENTS.map((s) => [s.key, new Map()]));

  for (const r of cache.typeRows) {
    const seg = SEGMENTS.find((s) => s.group === 'type' && s.match === r.property_type);
    const value = parseFloat(r.index);
    if (seg && Number.isFinite(value)) byQuarter.get(seg.key).set(r.quarter, value);
  }
  for (const r of cache.localityRows) {
    const seg = SEGMENTS.find((s) => s.group === 'locality' && s.match === r.market_segment);
    const value = parseFloat(r.price_index);
    if (seg && Number.isFinite(value)) byQuarter.get(seg.key).set(r.quarter, value);
  }

  // Shared quarter axis: only quarters every segment reports, newest last.
  const common = [...byQuarter.values()]
    .map((m) => new Set(m.keys()))
    .reduce((acc, set) => (acc === null ? set : new Set([...acc].filter((q) => set.has(q)))), null);

  const axis = [...(common || [])]
    .filter((q) => quarterKey(q) !== null)
    .sort((a, b) => quarterKey(a) - quarterKey(b))
    .slice(-quarters);

  const latestQuarter = axis[axis.length - 1] || null;

  const segments = SEGMENTS.map((seg) => {
    const m = byQuarter.get(seg.key);
    const series = axis.map((q) => ({ quarter: q, index: m.has(q) ? m.get(q) : null }));
    const latest = latestQuarter ? m.get(latestQuarter) ?? null : null;

    const prevQ = axis[axis.length - 2] ?? null;
    // Same quarter one year earlier, for a like-for-like YoY.
    const yearAgoKey = latestQuarter ? quarterKey(latestQuarter) - 4 : null;
    const yearAgoQ =
      yearAgoKey === null ? null : [...m.keys()].find((q) => quarterKey(q) === yearAgoKey) ?? null;

    return {
      key: seg.key,
      label: seg.label,
      fullLabel: seg.full || seg.label,
      group: seg.group,
      latest,
      qoq: pctChange(latest, prevQ ? m.get(prevQ) ?? null : null),
      yoy: pctChange(latest, yearAgoQ ? m.get(yearAgoQ) ?? null : null),
      series,
    };
  });

  return {
    latestQuarter,
    basePeriod: BASE_PERIOD,
    quarters: axis,
    segments,
    source: {
      publisher: 'Urban Redevelopment Authority (URA)',
      distributedVia: 'data.gov.sg',
      datasets: [TYPE_DATASET, LOCALITY_DATASET],
      note: 'Compiled by URA using stratified hedonic regression. Locality indices cover non-landed properties.',
    },
    fetchedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (!res.status) {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const parsedUrl = new URL(req.url || '/', 'http://localhost');
    const query = Object.fromEntries(parsedUrl.searchParams);
    const data = await getPriceIndex(query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error('Price Index Handler Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
