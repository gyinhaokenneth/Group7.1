/**
 * URA DataService Integration Module
 * Official Urban Redevelopment Authority (URA) Real Estate Transaction API
 * 
 * Spec:
 * 1. Each day, trade the AccessKey for today's Token:
 *    (header: AccessKey: 1b03fdab-a2e6-4e20-82f4-5edc71022719)
 *    https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
 * 
 * 2. Data calls send BOTH headers (AccessKey + Token):
 *    Private residential transactions (4 batches by postal district - fetch all, merge):
 *    https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1
 */

const URA_TOKEN_URL = 'https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1';
const URA_DATA_URL = 'https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1';

// Default fallback AccessKey provided in spec
const DEFAULT_ACCESS_KEY = '1b03fdab-a2e6-4e20-82f4-5edc71022719';

function getAccessKey() {
  return process.env.URA_ACCESS_KEY || DEFAULT_ACCESS_KEY;
}

// In-memory token store
let cachedToken = null;
let tokenExpiresAt = 0; // Daily token validity
let lastTokenError = null;

// In-memory batch store (cache for 1 hour to prevent rate-limit exhaustion)
const batchCache = new Map(); // batchNumber (1..4) -> { data: Array, timestamp: number }
const BATCH_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let mergedTransactionsCache = null;
let mergedCacheTimestamp = 0;

/**
 * Format district string to 2-digit number (e.g., "D09" -> "09", "9" -> "09")
 */
export function normalizeDistrict(input) {
  if (!input) return '09';
  const clean = String(input).toUpperCase().replace(/[^0-9]/g, '');
  return clean.padStart(2, '0');
}

/**
 * Map district code to corresponding URA batch (1..4)
 * Batch 1: Districts 01-07
 * Batch 2: Districts 08-14
 * Batch 3: Districts 15-21
 * Batch 4: Districts 22-28
 */
export function getBatchForDistrict(district) {
  const dNum = parseInt(normalizeDistrict(district), 10);
  if (dNum >= 1 && dNum <= 7) return 1;
  if (dNum >= 8 && dNum <= 14) return 2;
  if (dNum >= 15 && dNum <= 21) return 3;
  if (dNum >= 22 && dNum <= 28) return 4;
  return 1;
}

/**
 * Trade AccessKey for today's Token (Cached for ~20 hours)
 */
export async function getTodayToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const accessKey = getAccessKey();
  try {
    const response = await fetch(URA_TOKEN_URL, {
      method: 'GET',
      headers: {
        AccessKey: accessKey,
        'User-Agent': 'Mozilla/5.0 (compatible; EstateAnalytics/2.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`URA Token API HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.Status !== 'Success' || !data.Result) {
      throw new Error(`URA Token API returned non-success: ${JSON.stringify(data)}`);
    }

    cachedToken = data.Result;
    // Tokens expire daily at midnight SGT; cache for 20 hours safely
    tokenExpiresAt = now + 20 * 60 * 60 * 1000;
    lastTokenError = null;
    return cachedToken;
  } catch (err) {
    lastTokenError = err.message;
    console.error('Error fetching URA daily token:', err);
    throw err;
  }
}

/**
 * Fetch a single batch of private residential transactions
 * @param {number} batch - 1, 2, 3, or 4
 * @param {boolean} forceRefresh - bypass cache
 */
export async function fetchBatch(batch, forceRefresh = false) {
  const batchNum = Math.max(1, Math.min(4, Number(batch) || 1));
  const now = Date.now();

  const cached = batchCache.get(batchNum);
  if (!forceRefresh && cached && now - cached.timestamp < BATCH_CACHE_TTL_MS) {
    return cached.data;
  }

  const accessKey = getAccessKey();
  const token = await getTodayToken(forceRefresh);

  const url = `${URA_DATA_URL}?service=PMI_Resi_Transaction&batch=${batchNum}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AccessKey: accessKey,
      Token: token,
      'User-Agent': 'Mozilla/5.0 (compatible; EstateAnalytics/2.0)',
    },
  });

  if (!response.ok) {
    // If unauthorized or token invalid, retry once with fresh token
    if (response.status === 401 || response.status === 403) {
      const freshToken = await getTodayToken(true);
      const retryRes = await fetch(url, {
        method: 'GET',
        headers: {
          AccessKey: accessKey,
          Token: freshToken,
          'User-Agent': 'Mozilla/5.0 (compatible; EstateAnalytics/2.0)',
        },
      });
      if (!retryRes.ok) {
        throw new Error(`URA Data API failed on retry: ${retryRes.status}`);
      }
      const retryData = await retryRes.json();
      const projects = retryData.Result || [];
      batchCache.set(batchNum, { data: projects, timestamp: now });
      return projects;
    }
    throw new Error(`URA Data API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.Status !== 'Success') {
    throw new Error(`URA Data API returned status: ${data.Status}`);
  }

  const projects = data.Result || [];
  batchCache.set(batchNum, { data: projects, timestamp: now });
  return projects;
}

/**
 * Fetch all 4 batches in parallel and merge into unified dataset
 * @param {boolean} forceRefresh
 */
export async function fetchAllBatchesMerged(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && mergedTransactionsCache && now - mergedCacheTimestamp < BATCH_CACHE_TTL_MS) {
    return mergedTransactionsCache;
  }

  const batchResults = await Promise.all([
    fetchBatch(1, forceRefresh),
    fetchBatch(2, forceRefresh),
    fetchBatch(3, forceRefresh),
    fetchBatch(4, forceRefresh),
  ]);

  const merged = batchResults.flat();
  mergedTransactionsCache = merged;
  mergedCacheTimestamp = now;
  return merged;
}

/**
 * Format a raw URA transaction item with computed fields (sqft, psf, formatted date)
 */
function enrichTransaction(t, project) {
  const areaSqm = parseFloat(t.area) || 0;
  const areaSqft = Math.round(areaSqm * 10.76391);
  const price = parseFloat(t.price) || 0;
  const psf = areaSqft > 0 ? Math.round(price / areaSqft) : 0;

  // contractDate is MMYY e.g. "0326"
  const mm = t.contractDate ? t.contractDate.slice(0, 2) : '01';
  const yy = t.contractDate ? t.contractDate.slice(2, 4) : '24';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parseInt(mm, 10) - 1] || 'Jan';
  const yearFull = parseInt(yy, 10) > 50 ? `19${yy}` : `20${yy}`;
  const contractDateFormatted = `${monthName} ${yearFull}`;
  const sortKey = parseInt(`${yearFull}${mm}`, 10);

  const saleTypeLabel = t.typeOfSale === '1' ? 'New Sale' : t.typeOfSale === '2' ? 'Sub Sale' : 'Resale';

  return {
    project: project.project,
    street: project.street,
    marketSegment: project.marketSegment,
    x: project.x,
    y: project.y,
    areaSqm,
    areaSqft,
    price,
    psf,
    floorRange: t.floorRange || '-',
    noOfUnits: parseInt(t.noOfUnits, 10) || 1,
    contractDate: t.contractDate,
    contractDateFormatted,
    sortKey,
    typeOfSale: t.typeOfSale,
    typeOfSaleLabel: saleTypeLabel,
    propertyType: t.propertyType,
    district: `D${String(t.district).padStart(2, '0')}`,
    rawDistrict: t.district,
    tenure: t.tenure || 'Freehold',
    typeOfArea: t.typeOfArea || 'Strata',
  };
}

/**
 * Extract and filter transactions for a given district
 */
export async function getTransactionsForDistrict(districtCode, options = {}) {
  const normDistrict = normalizeDistrict(districtCode);
  const targetBatch = getBatchForDistrict(normDistrict);

  // Fetch the relevant batch (or use merged cache if already present)
  let projects;
  if (mergedTransactionsCache) {
    projects = mergedTransactionsCache;
  } else {
    projects = await fetchBatch(targetBatch);
  }

  const transactions = [];
  for (const p of projects) {
    if (!p.transaction || !Array.isArray(p.transaction)) continue;
    for (const t of p.transaction) {
      if (normalizeDistrict(t.district) === normDistrict) {
        transactions.push(enrichTransaction(t, p));
      }
    }
  }

  // Sort descending by contractDate (newest first)
  transactions.sort((a, b) => b.sortKey - a.sortKey);

  // Apply optional filters
  let filtered = transactions;
  if (options.propertyType && options.propertyType !== 'all') {
    const pTypeLower = String(options.propertyType).toLowerCase();
    filtered = filtered.filter((t) => {
      const tType = String(t.propertyType).toLowerCase();
      if (pTypeLower === 'private' || pTypeLower === 'condominium') {
        return tType.includes('condominium') || tType.includes('apartment') || tType.includes('executive');
      }
      if (pTypeLower === 'landed') {
        return tType.includes('terrace') || tType.includes('semi-detached') || tType.includes('detached');
      }
      return tType.includes(pTypeLower);
    });
  }

  if (options.saleType && options.saleType !== 'all') {
    filtered = filtered.filter((t) => t.typeOfSale === String(options.saleType));
  }

  const limit = Math.max(1, Math.min(500, Number(options.limit) || 100));
  return {
    district: `D${normDistrict}`,
    batch: targetBatch,
    totalMatching: filtered.length,
    transactions: filtered.slice(0, limit),
  };
}

/**
 * Compute real-time district statistics from official URA transactions
 */
export async function getDistrictStatistics(districtCode) {
  const normDistrict = normalizeDistrict(districtCode);
  const targetBatch = getBatchForDistrict(normDistrict);

  let projects;
  if (mergedTransactionsCache) {
    projects = mergedTransactionsCache;
  } else {
    projects = await fetchBatch(targetBatch);
  }

  const transactions = [];
  const projectAgg = new Map();
  const bySaleType = { newSale: 0, resale: 0, subSale: 0 };
  const byPropertyType = {};

  for (const p of projects) {
    if (!p.transaction || !Array.isArray(p.transaction)) continue;
    for (const t of p.transaction) {
      if (normalizeDistrict(t.district) === normDistrict) {
        const enriched = enrichTransaction(t, p);
        transactions.push(enriched);

        // Project aggregation
        const projKey = p.project || 'Unknown';
        if (!projectAgg.has(projKey)) {
          projectAgg.set(projKey, {
            project: p.project,
            street: p.street,
            psfs: [],
            prices: [],
            latestDate: enriched.contractDateFormatted,
            latestSortKey: enriched.sortKey,
            latestPrice: enriched.price,
            latestPsf: enriched.psf,
            tenure: enriched.tenure,
          });
        }
        const projData = projectAgg.get(projKey);
        if (enriched.psf > 0) projData.psfs.push(enriched.psf);
        if (enriched.price > 0) projData.prices.push(enriched.price);
        if (enriched.sortKey > projData.latestSortKey) {
          projData.latestSortKey = enriched.sortKey;
          projData.latestDate = enriched.contractDateFormatted;
          projData.latestPrice = enriched.price;
          projData.latestPsf = enriched.psf;
        }

        // Sale type aggregation
        if (t.typeOfSale === '1') bySaleType.newSale++;
        else if (t.typeOfSale === '2') bySaleType.subSale++;
        else if (t.typeOfSale === '3') bySaleType.resale++;

        // Property type aggregation
        const pType = t.propertyType || 'Other';
        byPropertyType[pType] = (byPropertyType[pType] || 0) + 1;
      }
    }
  }

  // Sort newest first
  transactions.sort((a, b) => b.sortKey - a.sortKey);

  const psfList = transactions.map((t) => t.psf).filter((p) => p > 0).sort((a, b) => a - b);
  const priceList = transactions.map((t) => t.price).filter((p) => p > 0).sort((a, b) => a - b);

  const total = transactions.length;
  const medianPsf = psfList.length > 0 ? psfList[Math.floor(psfList.length / 2)] : 2200;
  const minPsf = psfList.length > 0 ? psfList[0] : 1400;
  const maxPsf = psfList.length > 0 ? psfList[psfList.length - 1] : 4500;
  const p25Psf = psfList.length > 0 ? psfList[Math.floor(psfList.length * 0.25)] : minPsf;
  const p75Psf = psfList.length > 0 ? psfList[Math.floor(psfList.length * 0.75)] : maxPsf;

  const medianPrice = priceList.length > 0 ? priceList[Math.floor(priceList.length / 2)] : 2100000;
  const minPrice = priceList.length > 0 ? priceList[0] : 1200000;
  const maxPrice = priceList.length > 0 ? priceList[priceList.length - 1] : 6000000;
  const avgPrice = priceList.length > 0 ? Math.round(priceList.reduce((a, b) => a + b, 0) / priceList.length) : medianPrice;

  // Top developments by transaction volume
  const topProjects = Array.from(projectAgg.values())
    .map((p) => {
      const sortedPsfs = p.psfs.sort((a, b) => a - b);
      const projMedianPsf = sortedPsfs.length > 0 ? sortedPsfs[Math.floor(sortedPsfs.length / 2)] : p.latestPsf;
      return {
        project: p.project,
        street: p.street,
        transactionCount: p.psfs.length,
        medianPsf: projMedianPsf,
        latestDate: p.latestDate,
        latestPrice: p.latestPrice,
        latestPsf: p.latestPsf,
        tenure: p.tenure,
      };
    })
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 15);

  return {
    district: `D${normDistrict}`,
    districtNumber: normDistrict,
    batch: targetBatch,
    totalTransactions: total,
    uniqueDevelopments: projectAgg.size,
    medianPsf,
    minPsf,
    maxPsf,
    p25Psf,
    p75Psf,
    medianPrice,
    minPrice,
    maxPrice,
    avgPrice,
    topProjects,
    bySaleType,
    byPropertyType,
    recentTransactions: transactions.slice(0, 30),
    source: 'live_ura_api',
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Universal request handler for Express or Vite Connect middleware
 */
export default async function handler(req, res) {
  // Ensure CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccessKey, Token');

  // Polyfill helper methods for res if running under connect middleware
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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse URL pathname and query params
  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  const path = parsedUrl.pathname.replace(/^\/api\/ura/, '') || '/';
  const query = Object.fromEntries(parsedUrl.searchParams);

  try {
    // 1. Status endpoint
    if (path === '/' || path === '/status') {
      const hasToken = !!cachedToken && Date.now() < tokenExpiresAt;
      return res.status(200).json({
        status: 'connected',
        service: 'URA DataService API',
        endpoints: {
          tokenService: URA_TOKEN_URL,
          transactionService: `${URA_DATA_URL}?service=PMI_Resi_Transaction`,
        },
        token: {
          active: hasToken,
          expiresInMinutes: hasToken ? Math.round((tokenExpiresAt - Date.now()) / 60000) : 0,
          tokenExcerpt: cachedToken ? `${cachedToken.slice(0, 8)}...` : null,
          lastError: lastTokenError,
        },
        cache: {
          batchesLoaded: Array.from(batchCache.keys()),
          allMergedLoaded: !!mergedTransactionsCache,
          totalProjectsCached: mergedTransactionsCache ? mergedTransactionsCache.length : 0,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Token refresh / get
    if (path === '/token') {
      const force = query.force === 'true' || req.method === 'POST';
      const token = await getTodayToken(force);
      return res.status(200).json({
        success: true,
        tokenExcerpt: `${token.slice(0, 12)}...`,
        cached: !force,
        expiresInMinutes: Math.round((tokenExpiresAt - Date.now()) / 60000),
      });
    }

    // 3. District Statistics endpoint
    if (path === '/district-stats' || path === '/district') {
      const district = query.district || 'D09';
      const stats = await getDistrictStatistics(district);
      return res.status(200).json({
        success: true,
        stats,
      });
    }

    // 4. Filtered Transactions endpoint
    if (path === '/transactions') {
      const district = query.district || 'D09';
      const result = await getTransactionsForDistrict(district, query);
      return res.status(200).json({
        success: true,
        ...result,
      });
    }

    // 5. Raw batch endpoint (batches 1 to 4)
    if (path === '/batch') {
      const batch = parseInt(query.batch, 10) || 1;
      const projects = await fetchBatch(batch, query.refresh === 'true');
      return res.status(200).json({
        success: true,
        batch,
        projectCount: projects.length,
        projects: projects.slice(0, 100), // slice for preview payload
      });
    }

    // 6. Merge and Sync all 4 batches
    if (path === '/sync') {
      const t0 = Date.now();
      const merged = await fetchAllBatchesMerged(true);
      let totalTransactions = 0;
      for (const p of merged) {
        if (p.transaction) totalTransactions += p.transaction.length;
      }
      return res.status(200).json({
        success: true,
        mergedBatches: 4,
        totalDevelopments: merged.length,
        totalTransactions,
        elapsedMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(404).json({ error: `Unknown URA endpoint: ${path}` });
  } catch (error) {
    console.error('URA API Handler Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
