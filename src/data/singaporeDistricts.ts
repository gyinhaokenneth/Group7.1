export interface SingaporeDistrictInfo {
  code: string;
  name: string;
  region: 'CCR' | 'RCR' | 'OCR';
  towns: string[];
  basePsfPrivate: number;
  basePsfLanded: number;
  basePsfHdb: number;
  minPsfMultiplier: number;
  maxPsfMultiplier: number;
  districtPriceIndex: number; // e.g. 204.6
  annualGrowthRate: number; // e.g. 5.2%
  nationalIndex: number; // 196.4
  sampleTransactionCount: number;
}

export const SINGAPORE_DISTRICTS: Record<string, SingaporeDistrictInfo> = {
  D01: {
    code: 'D01',
    name: 'Marina Bay / Raffles Place / Boat Quay',
    region: 'CCR',
    towns: ['Downtown Core', 'Marina Bay', 'Boat Quay'],
    basePsfPrivate: 2950,
    basePsfLanded: 3800,
    basePsfHdb: 0,
    minPsfMultiplier: 0.88,
    maxPsfMultiplier: 1.25,
    districtPriceIndex: 216.4,
    annualGrowthRate: 5.8,
    nationalIndex: 196.4,
    sampleTransactionCount: 428,
  },
  D02: {
    code: 'D02',
    name: 'Chinatown / Tanjong Pagar',
    region: 'CCR',
    towns: ['Tanjong Pagar', 'Chinatown', 'Shenton Way'],
    basePsfPrivate: 2650,
    basePsfLanded: 3400,
    basePsfHdb: 1120, // Pinnacle@Duxton benchmark
    minPsfMultiplier: 0.89,
    maxPsfMultiplier: 1.22,
    districtPriceIndex: 208.7,
    annualGrowthRate: 5.4,
    nationalIndex: 196.4,
    sampleTransactionCount: 512,
  },
  D03: {
    code: 'D03',
    name: 'Queenstown / Tiong Bahru / Alexandra',
    region: 'RCR',
    towns: ['Queenstown', 'Tiong Bahru', 'Bukit Merah'],
    basePsfPrivate: 2280,
    basePsfLanded: 2900,
    basePsfHdb: 980,
    minPsfMultiplier: 0.85,
    maxPsfMultiplier: 1.2,
    districtPriceIndex: 198.5,
    annualGrowthRate: 5.1,
    nationalIndex: 196.4,
    sampleTransactionCount: 789,
  },
  D04: {
    code: 'D04',
    name: 'Harbourfront / Telok Blangah / Sentosa',
    region: 'CCR',
    towns: ['Sentosa Cove', 'Keppel Bay', 'Harbourfront'],
    basePsfPrivate: 2420,
    basePsfLanded: 3200,
    basePsfHdb: 890,
    minPsfMultiplier: 0.82,
    maxPsfMultiplier: 1.35,
    districtPriceIndex: 191.2,
    annualGrowthRate: 4.6,
    nationalIndex: 196.4,
    sampleTransactionCount: 364,
  },
  D05: {
    code: 'D05',
    name: 'Buona Vista / West Coast / Clementi',
    region: 'RCR',
    towns: ['Clementi', 'West Coast', 'One-North', 'Pasir Panjang'],
    basePsfPrivate: 2050,
    basePsfLanded: 2450,
    basePsfHdb: 780,
    minPsfMultiplier: 0.86,
    maxPsfMultiplier: 1.18,
    districtPriceIndex: 192.4,
    annualGrowthRate: 4.8,
    nationalIndex: 196.4,
    sampleTransactionCount: 654,
  },
  D09: {
    code: 'D09',
    name: 'Orchard / River Valley / Cairnhill',
    region: 'CCR',
    towns: ['Orchard Road', 'River Valley', 'Paterson', 'Somerset'],
    basePsfPrivate: 3250,
    basePsfLanded: 4100,
    basePsfHdb: 0,
    minPsfMultiplier: 0.86,
    maxPsfMultiplier: 1.32,
    districtPriceIndex: 218.6,
    annualGrowthRate: 6.2,
    nationalIndex: 196.4,
    sampleTransactionCount: 610,
  },
  D10: {
    code: 'D10',
    name: 'Bukit Timah / Holland / Tanglin',
    region: 'CCR',
    towns: ['Bukit Timah', 'Holland Village', 'Tanglin', 'Farrer Road'],
    basePsfPrivate: 2980,
    basePsfLanded: 3850,
    basePsfHdb: 880,
    minPsfMultiplier: 0.88,
    maxPsfMultiplier: 1.35,
    districtPriceIndex: 215.1,
    annualGrowthRate: 5.9,
    nationalIndex: 196.4,
    sampleTransactionCount: 842,
  },
  D11: {
    code: 'D11',
    name: 'Newton / Novena / Dunearn',
    region: 'CCR',
    towns: ['Novena', 'Newton', 'Chancery', 'Dunearn'],
    basePsfPrivate: 2850,
    basePsfLanded: 3600,
    basePsfHdb: 0,
    minPsfMultiplier: 0.87,
    maxPsfMultiplier: 1.25,
    districtPriceIndex: 211.3,
    annualGrowthRate: 5.5,
    nationalIndex: 196.4,
    sampleTransactionCount: 520,
  },
  D12: {
    code: 'D12',
    name: 'Balestier / Toa Payoh / Serangoon',
    region: 'RCR',
    towns: ['Toa Payoh', 'Balestier', 'Boon Keng'],
    basePsfPrivate: 1980,
    basePsfLanded: 2500,
    basePsfHdb: 790,
    minPsfMultiplier: 0.85,
    maxPsfMultiplier: 1.18,
    districtPriceIndex: 190.8,
    annualGrowthRate: 4.7,
    nationalIndex: 196.4,
    sampleTransactionCount: 690,
  },
  D14: {
    code: 'D14',
    name: 'Geylang / Eunos / Paya Lebar',
    region: 'RCR',
    towns: ['Paya Lebar', 'Eunos', 'Aljunied', 'Geylang'],
    basePsfPrivate: 1950,
    basePsfLanded: 2350,
    basePsfHdb: 720,
    minPsfMultiplier: 0.84,
    maxPsfMultiplier: 1.2,
    districtPriceIndex: 189.5,
    annualGrowthRate: 4.9,
    nationalIndex: 196.4,
    sampleTransactionCount: 715,
  },
  D15: {
    code: 'D15',
    name: 'East Coast / Marine Parade / Katong',
    region: 'RCR',
    towns: ['Marine Parade', 'Tanjong Katong', 'Amber', 'Frankel', 'Meyer'],
    basePsfPrivate: 2450,
    basePsfLanded: 2950,
    basePsfHdb: 750,
    minPsfMultiplier: 0.86,
    maxPsfMultiplier: 1.28,
    districtPriceIndex: 202.3,
    annualGrowthRate: 5.6,
    nationalIndex: 196.4,
    sampleTransactionCount: 920,
  },
  D19: {
    code: 'D19',
    name: 'Serangoon / Hougang / Punggol / Sengkang',
    region: 'OCR',
    towns: ['Serangoon', 'Kovan', 'Hougang', 'Punggol', 'Sengkang'],
    basePsfPrivate: 1820,
    basePsfLanded: 2150,
    basePsfHdb: 660,
    minPsfMultiplier: 0.85,
    maxPsfMultiplier: 1.16,
    districtPriceIndex: 184.2,
    annualGrowthRate: 4.5,
    nationalIndex: 196.4,
    sampleTransactionCount: 1450,
  },
  D20: {
    code: 'D20',
    name: 'Bishan / Ang Mo Kio / Thomson',
    region: 'RCR',
    towns: ['Bishan', 'Ang Mo Kio', 'Upper Thomson'],
    basePsfPrivate: 2120,
    basePsfLanded: 2680,
    basePsfHdb: 840,
    minPsfMultiplier: 0.86,
    maxPsfMultiplier: 1.22,
    districtPriceIndex: 196.8,
    annualGrowthRate: 5.2,
    nationalIndex: 196.4,
    sampleTransactionCount: 890,
  },
  D21: {
    code: 'D21',
    name: 'Upper Bukit Timah / Clementi Park',
    region: 'RCR',
    towns: ['Beauty World', 'Upper Bukit Timah', 'King Albert Park'],
    basePsfPrivate: 2250,
    basePsfLanded: 2750,
    basePsfHdb: 690,
    minPsfMultiplier: 0.87,
    maxPsfMultiplier: 1.22,
    districtPriceIndex: 197.6,
    annualGrowthRate: 5.0,
    nationalIndex: 196.4,
    sampleTransactionCount: 540,
  },
  D22: {
    code: 'D22',
    name: 'Jurong / Boon Lay / Lakeside',
    region: 'OCR',
    towns: ['Jurong East', 'Jurong West', 'Boon Lay', 'Lakeside'],
    basePsfPrivate: 1720,
    basePsfLanded: 1950,
    basePsfHdb: 580,
    minPsfMultiplier: 0.84,
    maxPsfMultiplier: 1.15,
    districtPriceIndex: 181.5,
    annualGrowthRate: 4.3,
    nationalIndex: 196.4,
    sampleTransactionCount: 1120,
  },
  D23: {
    code: 'D23',
    name: 'Bukit Batok / Bukit Panjang / Hillview',
    region: 'OCR',
    towns: ['Hillview', 'Bukit Batok', 'Bukit Panjang', 'Choa Chu Kang'],
    basePsfPrivate: 1760,
    basePsfLanded: 2050,
    basePsfHdb: 590,
    minPsfMultiplier: 0.85,
    maxPsfMultiplier: 1.16,
    districtPriceIndex: 182.8,
    annualGrowthRate: 4.4,
    nationalIndex: 196.4,
    sampleTransactionCount: 980,
  },
  D27: {
    code: 'D27',
    name: 'Yishun / Sembawang',
    region: 'OCR',
    towns: ['Yishun', 'Sembawang', 'Canberra'],
    basePsfPrivate: 1580,
    basePsfLanded: 1850,
    basePsfHdb: 540,
    minPsfMultiplier: 0.85,
    maxPsfMultiplier: 1.14,
    districtPriceIndex: 178.4,
    annualGrowthRate: 4.1,
    nationalIndex: 196.4,
    sampleTransactionCount: 870,
  },
};

/**
 * Bala's Table leasehold depreciation table
 * Represents Singapore SLA leasehold value relative to freehold (100%)
 */
export function getBalasTableFactor(leaseYears: number): number {
  if (leaseYears >= 999) return 1.0;
  if (leaseYears >= 99) return 1.0;
  if (leaseYears >= 95) return 0.985;
  if (leaseYears >= 90) return 0.965;
  if (leaseYears >= 85) return 0.948;
  if (leaseYears >= 80) return 0.932;
  if (leaseYears >= 75) return 0.915;
  if (leaseYears >= 70) return 0.892;
  if (leaseYears >= 65) return 0.865;
  if (leaseYears >= 60) return 0.825;
  if (leaseYears >= 55) return 0.778;
  if (leaseYears >= 50) return 0.725;
  if (leaseYears >= 40) return 0.612;
  if (leaseYears >= 30) return 0.485;
  return 0.35;
}

export interface CalculatedDistrictStats {
  districtCode: string;
  districtName: string;
  region: 'CCR' | 'RCR' | 'OCR';
  propertyType: 'private' | 'landed' | 'hdb';
  minPsf: number;
  medianPsf: number;
  maxPsf: number;
  minPrice: number;
  medianPrice: number;
  maxPrice: number;
  districtPriceIndex: number;
  nationalPriceIndex: number;
  spreadVsNational: number; // e.g. +8.2%
  annualGrowthRate: number;
  sampleCount: number;
}

/**
 * Calculates empirical location price statistics (Min, Max, Median)
 * based on selected district, property type, and square footage.
 */
export function getDistrictPriceStats(
  districtCode: string,
  propertyType: 'private' | 'landed' | 'hdb',
  sqft: number
): CalculatedDistrictStats {
  const district = SINGAPORE_DISTRICTS[districtCode] || SINGAPORE_DISTRICTS.D09;
  const safeSqft = Math.max(200, sqft || 1000);

  let basePsf = district.basePsfPrivate;
  if (propertyType === 'landed') {
    basePsf = district.basePsfLanded;
  } else if (propertyType === 'hdb') {
    basePsf = district.basePsfHdb > 0 ? district.basePsfHdb : 650;
  }

  const medianPsf = Math.round(basePsf);
  const minPsf = Math.round(basePsf * district.minPsfMultiplier);
  const maxPsf = Math.round(basePsf * district.maxPsfMultiplier);

  const medianPrice = Math.round(medianPsf * safeSqft);
  const minPrice = Math.round(minPsf * safeSqft);
  const maxPrice = Math.round(maxPsf * safeSqft);

  const nationalPriceIndex = propertyType === 'hdb' ? 189.2 : district.nationalIndex;
  const spreadVsNational = Number(
    (((district.districtPriceIndex - nationalPriceIndex) / nationalPriceIndex) * 100).toFixed(1)
  );

  return {
    districtCode: district.code,
    districtName: district.name,
    region: district.region,
    propertyType,
    minPsf,
    medianPsf,
    maxPsf,
    minPrice,
    medianPrice,
    maxPrice,
    districtPriceIndex: district.districtPriceIndex,
    nationalPriceIndex,
    spreadVsNational,
    annualGrowthRate: district.annualGrowthRate,
    sampleCount: district.sampleTransactionCount,
  };
}
