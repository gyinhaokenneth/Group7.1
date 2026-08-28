export type TabType = 'valuation' | 'trajectory' | 'rent' | 'trends' | 'about';

export type UserPersonaRole = 'buyer' | 'seller' | 'rentee' | 'investor';

export type PropertyType = 'apartment' | 'condominium' | 'landed';

export type TrajectoryScenario = 'conservative' | 'baseline' | 'accelerated' | 'historical' | 'custom';

export interface TrajectoryPredictionParams {
  currentPrice: number;
  sqft: number;
  propertyType: 'private' | 'landed' | 'hdb' | string;
  district: string;
  holdingYears: number;
  scenario: TrajectoryScenario;
  customAnnualGrowth: number;
  includeRentalYield: boolean;
  estimatedGrossYield: number;
  mortgageInterestRate: number;
  downPaymentPct: number;
}

export interface TrajectoryYearData {
  year: number;
  calendarYear: number;
  projectedValue: number;
  projectedValueLow: number;
  projectedValueHigh: number;
  projectedPsf: number;
  capitalGain: number;
  gainPct: number;
  cumulativeRentalIncome: number;
  netEquity: number;
  remainingMortgage: number;
}

export interface TrajectoryPredictionResult {
  params: TrajectoryPredictionParams;
  startPrice: number;
  finalProjectedValue: number;
  finalProjectedValueLow: number;
  finalProjectedValueHigh: number;
  totalCapitalGain: number;
  totalGainPct: number;
  annualizedCAGR: number;
  finalPsf: number;
  yearlyBreakdown: TrajectoryYearData[];
  cumulativeRent: number;
  estimatedNetProfit: number;
  confidenceRating: number;
  recommendationTag: string;
  timestamp: string;
}

export interface SavedTrajectoryPrediction {
  id: string;
  title: string;
  result: TrajectoryPredictionResult;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  price: number; // monthly rent in SGD/USD
  priceFormatted: string;
  location: string;
  district: string;
  sqft: number;
  beds: number;
  baths: number;
  mrtDist: string;
  image: string;
  tag?: 'High Value' | 'New Listing' | 'Exclusive' | 'Price Drop';
  tagColor?: 'tertiary' | 'secondary' | 'primary';
  propertyType: PropertyType;
  facing: 'North' | 'South' | 'East' | 'West';
  amenities: string[];
  description: string;
  yearBuilt: number;
  furnished: 'Fully Furnished' | 'Partial' | 'Unfurnished';
}

export interface ValuationFormValues {
  role: UserPersonaRole;
  district: string;
  propertyType: 'private' | 'landed' | 'hdb' | string;
  subType?: string;
  size: number | '';
  level: string;
  tenure: string;
  leaseRemainingYears: number;
  facing: string;
  amenityProximity: string;
  condition: string;
  transportProximity?: string;
  bedrooms?: number;
  // Seller-specific fields
  outstandingLoan?: number;
  cpfRefund?: number;
  sellerHoldingYears?: number;
}

export interface ValuationResult {
  role: UserPersonaRole;
  estimatedMin: number;
  estimatedMax: number;
  estimatedMedian: number;
  psfMin: number;
  psfMax: number;
  psfMedian: number;
  confidenceScore: number;
  annualYieldRate: number;
  monthlyRentalEstimate: number;
  facingFactorPct: number;
  transitFactorPct: number;
  levelFactorPct: number;
  conditionFactorPct: number;
  leaseFactorPct: number;
  districtMultiplier: number;
  districtPriceIndex: number;
  nationalPriceIndex: number;
  indexSpreadPct: number;
  // Seller Net Proceeds
  sellerNetProceeds?: {
    sellingPrice: number;
    outstandingLoan: number;
    cpfRefund: number;
    agentCommission: number;
    legalFee: number;
    ssdRate: number;
    ssdAmount: number;
    netCashInHand: number;
  };
  timestamp: string;
}

export interface AIInsightResult {
  source: 'gemini_ai' | 'heuristic_insight';
  role: string;
  title: string;
  executiveSummary: string;
  macroOutlook: string;
  keyDrivers: string[];
  riskFactors: string[];
  strategicAdvice: string[];
  timestamp: string;
}

export interface TrendDataPoint {
  month: string;
  privateIndex: number; // e.g. 182.4
  landedIndex: number;  // e.g. 195.8
  volume: number;
  changePct: number;
}

export interface HotspotArea {
  id: string;
  name: string;
  subzone: string;
  avgPsf: number;
  yoyGrowth: number;
  medianRent: number;
  xPct: number;
  yPct: number;
  density: 'High' | 'Very High' | 'Moderate';
  highlights: string;
}

export interface AppraisalBooking {
  fullName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  propertyType: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: 'in-person' | 'virtual';
  notes?: string;
}

export interface URATransaction {
  project: string;
  street: string;
  marketSegment?: string;
  areaSqm: number;
  areaSqft: number;
  price: number;
  psf: number;
  floorRange: string;
  noOfUnits: number;
  contractDate: string;
  contractDateFormatted: string;
  sortKey: number;
  typeOfSale: string;
  typeOfSaleLabel: 'New Sale' | 'Sub Sale' | 'Resale';
  propertyType: string;
  district: string;
  tenure: string;
  typeOfArea: string;
}

export interface URATopProject {
  project: string;
  street: string;
  transactionCount: number;
  medianPsf: number;
  latestDate: string;
  latestPrice: number;
  latestPsf: number;
  tenure: string;
}

export interface URADistrictStats {
  district: string;
  districtNumber: string;
  batch: number;
  totalTransactions: number;
  uniqueDevelopments: number;
  medianPsf: number;
  minPsf: number;
  maxPsf: number;
  p25Psf: number;
  p75Psf: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  topProjects: URATopProject[];
  bySaleType: {
    newSale: number;
    resale: number;
    subSale: number;
  };
  byPropertyType: Record<string, number>;
  recentTransactions: URATransaction[];
  source: 'live_ura_api';
  fetchedAt: string;
}

export interface URAStatusResponse {
  status: string;
  service: string;
  token: {
    active: boolean;
    expiresInMinutes: number;
    tokenExcerpt: string | null;
    lastError: string | null;
  };
  cache: {
    batchesLoaded: number[];
    allMergedLoaded: boolean;
    totalProjectsCached: number;
  };
  timestamp: string;
}

