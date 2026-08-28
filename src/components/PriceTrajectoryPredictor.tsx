import React, { useState, useMemo } from 'react';
import {
  TrajectoryScenario,
  TrajectoryPredictionParams,
  TrajectoryYearData,
  TrajectoryPredictionResult,
  SavedTrajectoryPrediction,
  TabType,
  ValuationFormValues,
} from '../types';
import {
  TrendingUp,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  Bookmark,
  Check,
  Download,
  Info,
  ShieldCheck,
  Sparkles,
  Share2,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { PropertyPriceIndexCard } from './PropertyPriceIndexCard';
import { GeminiInsightPanel } from './GeminiInsightPanel';
import { SINGAPORE_DISTRICTS, getDistrictPriceStats } from '../data/singaporeDistricts';

interface PriceTrajectoryPredictorProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenBookAppraisal: (prefillData?: Partial<ValuationFormValues>) => void;
  onSavePrediction?: (prediction: SavedTrajectoryPrediction) => void;
  initialParams?: Partial<TrajectoryPredictionParams>;
}

// District historical trajectories (annualized 5-year averages)
const DISTRICT_RATES: Record<string, { name: string; baseGrowth: number; historicalPsf: number }> = {
  ccr: { name: 'Core Central (D01, D09, D10, D11)', baseGrowth: 4.8, historicalPsf: 2850 },
  rcr: { name: 'Rest of Central (D03, D04, D12, D14)', baseGrowth: 5.2, historicalPsf: 2150 },
  ocr: { name: 'Outside Central / Suburban (D19, D23, D27)', baseGrowth: 4.5, historicalPsf: 1650 },
  eastcoast: { name: 'East Coast & Marine Parade (D15, D16)', baseGrowth: 4.9, historicalPsf: 2280 },
  marina: { name: 'Marina Bay & Financial Core (D01)', baseGrowth: 5.6, historicalPsf: 3100 },
};

// Preset Profiles for quick home buyer scenario testing
const BUYER_PRESETS = [
  {
    label: 'First-Time Buyer Starter Condo',
    badge: 'Starter',
    price: 1380000,
    sqft: 780,
    type: 'private',
    district: 'rcr',
    years: 5,
    scenario: 'baseline' as TrajectoryScenario,
  },
  {
    label: 'HDB 5-Room Prime Resale (Bishan DBSS)',
    badge: 'HDB Resale',
    price: 1390000,
    sqft: 1290,
    type: 'hdb',
    district: 'rcr',
    years: 5,
    scenario: 'baseline' as TrajectoryScenario,
  },
  {
    label: 'Family Prime Residence',
    badge: 'Prime',
    price: 2650000,
    sqft: 1250,
    type: 'private',
    district: 'ccr',
    years: 7,
    scenario: 'historical' as TrajectoryScenario,
  },
  {
    label: 'Waterfront / Core Trophy Asset',
    badge: 'Trophy',
    price: 4950000,
    sqft: 1850,
    type: 'private',
    district: 'marina',
    years: 10,
    scenario: 'accelerated' as TrajectoryScenario,
  },
  {
    label: 'Landed Prestige Estate',
    badge: 'Landed',
    price: 7800000,
    sqft: 3900,
    type: 'landed',
    district: 'ccr',
    years: 10,
    scenario: 'baseline' as TrajectoryScenario,
  },
];

export const PriceTrajectoryPredictor: React.FC<PriceTrajectoryPredictorProps> = ({
  onNavigateTab,
  onOpenBookAppraisal,
  onSavePrediction,
  initialParams,
}) => {
  // Input parameters state
  const [currentPrice, setCurrentPrice] = useState<number>(initialParams?.currentPrice || 1850000);
  const [sqft, setSqft] = useState<number>(initialParams?.sqft || 1150);
  const [propertyType, setPropertyType] = useState<string>(initialParams?.propertyType || 'private');
  const [district, setDistrict] = useState<string>(initialParams?.district || 'ccr');
  const [holdingYears, setHoldingYears] = useState<number>(initialParams?.holdingYears || 5);
  const [scenario, setScenario] = useState<TrajectoryScenario>(initialParams?.scenario || 'historical');
  const [customGrowth, setCustomGrowth] = useState<number>(initialParams?.customAnnualGrowth || 4.5);

  // Financial leverage & cashflow parameters
  const [includeRental, setIncludeRental] = useState<boolean>(true);
  const [rentalYield, setRentalYield] = useState<number>(3.6);
  const [includeMortgage, setIncludeMortgage] = useState<boolean>(true);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(25);
  const [mortgageRate, setMortgageRate] = useState<number>(3.2);

  // UI interaction states
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'valuation' | 'equity'>('valuation');
  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  const [downloadingReport, setDownloadingReport] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Calculate annual trajectory rate according to scenario and district
  const annualTrajectoryRate = useMemo(() => {
    const districtInfo = DISTRICT_RATES[district] || DISTRICT_RATES.ccr;
    let rate = districtInfo.baseGrowth;

    if (scenario === 'conservative') {
      rate = 2.4;
    } else if (scenario === 'baseline') {
      rate = 3.9;
    } else if (scenario === 'accelerated') {
      rate = 6.4;
    } else if (scenario === 'historical') {
      // Historical trend extrapolation based on empirical index
      rate = propertyType === 'landed' ? 5.8 : districtInfo.baseGrowth;
    } else if (scenario === 'custom') {
      rate = customGrowth;
    }

    return rate;
  }, [scenario, district, propertyType, customGrowth]);

  // Compute Year-by-Year Trajectory
  const predictionResult: TrajectoryPredictionResult = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const rateDecimal = annualTrajectoryRate / 100;
    const loanPrincipal = currentPrice * (1 - downPaymentPct / 100);
    const monthlyRate = mortgageRate / 100 / 12;
    const totalMonths = 30 * 12; // standard 30-yr tenure
    const monthlyMortgagePayment =
      monthlyRate > 0
        ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
        : loanPrincipal / totalMonths;

    let cumulativeRent = 0;
    let remainingLoan = loanPrincipal;

    const yearlyBreakdown: TrajectoryYearData[] = [];

    for (let yr = 0; yr <= holdingYears; yr++) {
      // Compound price appreciation
      const compoundFactor = Math.pow(1 + rateDecimal, yr);
      const projectedValue = Math.round(currentPrice * compoundFactor);

      // Confidence spread (widens over time, e.g. ±1.5% per year of horizon)
      const spreadFactor = 0.02 + yr * 0.012;
      const projectedValueLow = Math.round(projectedValue * (1 - spreadFactor));
      const projectedValueHigh = Math.round(projectedValue * (1 + spreadFactor));

      const capitalGain = projectedValue - currentPrice;
      const gainPct = (capitalGain / currentPrice) * 100;
      const projectedPsf = Math.round(projectedValue / (sqft || 1));

      // Mortgage amortization & rent
      if (yr > 0) {
        // Amortize loan for 12 months
        for (let m = 0; m < 12; m++) {
          const interestMonth = remainingLoan * monthlyRate;
          const principalMonth = monthlyMortgagePayment - interestMonth;
          remainingLoan = Math.max(0, remainingLoan - principalMonth);
        }
        // Add yearly gross rent with 2% annual inflation
        const annualRentYear = currentPrice * Math.pow(1.02, yr - 1) * (rentalYield / 100);
        cumulativeRent += Math.round(annualRentYear);
      }

      const netEquity = projectedValue - (includeMortgage ? remainingLoan : 0);

      yearlyBreakdown.push({
        year: yr,
        calendarYear: currentYear + yr,
        projectedValue,
        projectedValueLow,
        projectedValueHigh,
        projectedPsf,
        capitalGain,
        gainPct: Number(gainPct.toFixed(1)),
        cumulativeRentalIncome: cumulativeRent,
        netEquity: Math.round(netEquity),
        remainingMortgage: Math.round(remainingLoan),
      });
    }

    const finalYearData = yearlyBreakdown[yearlyBreakdown.length - 1];
    const totalCapitalGain = finalYearData.capitalGain;
    const totalGainPct = finalYearData.gainPct;
    const annualizedCAGR =
      holdingYears > 0 ? (Math.pow(finalYearData.projectedValue / currentPrice, 1 / holdingYears) - 1) * 100 : 0;

    const estimatedNetProfit = totalCapitalGain + (includeRental ? cumulativeRent : 0);

    // Dynamic institutional recommendation tag
    let recommendationTag = 'Favorable Wealth Preservation';
    if (annualizedCAGR > 6.0) recommendationTag = 'High-Growth Capital Catalyst';
    else if (annualizedCAGR > 4.5) recommendationTag = 'Solid Core Outperformance';
    else if (annualizedCAGR < 3.0) recommendationTag = 'Defensive Yield Strategy';

    return {
      params: {
        currentPrice,
        sqft,
        propertyType,
        district,
        holdingYears,
        scenario,
        customAnnualGrowth: customGrowth,
        includeRentalYield: includeRental,
        estimatedGrossYield: rentalYield,
        mortgageInterestRate: mortgageRate,
        downPaymentPct,
      },
      startPrice: currentPrice,
      finalProjectedValue: finalYearData.projectedValue,
      finalProjectedValueLow: finalYearData.projectedValueLow,
      finalProjectedValueHigh: finalYearData.projectedValueHigh,
      totalCapitalGain,
      totalGainPct,
      annualizedCAGR: Number(annualizedCAGR.toFixed(2)),
      finalPsf: finalYearData.projectedPsf,
      yearlyBreakdown,
      cumulativeRent,
      estimatedNetProfit,
      confidenceRating: holdingYears <= 5 ? 94.8 : holdingYears <= 10 ? 89.2 : 82.5,
      recommendationTag,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }, [
    currentPrice,
    sqft,
    propertyType,
    district,
    holdingYears,
    annualTrajectoryRate,
    customGrowth,
    includeRental,
    rentalYield,
    includeMortgage,
    downPaymentPct,
    mortgageRate,
    scenario,
  ]);

  // Resolve district code to Singapore district database
  const normalizedDistrict = useMemo(() => {
    const d = district.toLowerCase();
    if (d === 'ccr') return 'D09';
    if (d === 'rcr') return 'D03';
    if (d === 'ocr') return 'D19';
    if (d === 'eastcoast') return 'D15';
    if (d === 'marina') return 'D01';
    const upper = district.toUpperCase();
    if (SINGAPORE_DISTRICTS[upper]) return upper;
    return 'D09';
  }, [district]);

  const districtInfo = useMemo(() => {
    return SINGAPORE_DISTRICTS[normalizedDistrict] || SINGAPORE_DISTRICTS.D09;
  }, [normalizedDistrict]);

  const districtStats = useMemo(() => {
    return getDistrictPriceStats(
      normalizedDistrict,
      (propertyType === 'landed' ? 'landed' : propertyType === 'hdb' ? 'hdb' : 'private'),
      sqft
    );
  }, [normalizedDistrict, propertyType, sqft]);

  // Load a quick-select preset
  const handleApplyPreset = (preset: (typeof BUYER_PRESETS)[0]) => {
    setCurrentPrice(preset.price);
    setSqft(preset.sqft);
    setPropertyType(preset.type);
    setDistrict(preset.district);
    setHoldingYears(preset.years);
    setScenario(preset.scenario);
  };

  // Save prediction to user account
  const handleSaveToAccount = () => {
    if (onSavePrediction) {
      const newPrediction: SavedTrajectoryPrediction = {
        id: `pred-${Date.now()}`,
        title: `${DISTRICT_RATES[district]?.name.split(' ')[0]} ${propertyType.toUpperCase()} (${holdingYears}-Yr Forecast)`,
        result: predictionResult,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      onSavePrediction(newPrediction);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
    }
  };

  // Export report monograph (clean download simulation)
  const handleDownloadMonograph = () => {
    setDownloadingReport(true);
    setTimeout(() => {
      const summaryText = `ESTATEANALYTICS - PROPERTY PRICE TRAJECTORY MONOGRAPH
Issue Reference: TRJ-${Date.now()}
Date Generated: ${new Date().toLocaleString()}

============================================================
ASSET BASELINE PARAMETERS
============================================================
Entry Purchase Price: $${currentPrice.toLocaleString()}
Property Size: ${sqft} SQFT (Entry PSF: $${Math.round(currentPrice / sqft).toLocaleString()})
Property Class: ${propertyType.toUpperCase()}
District Corridor: ${DISTRICT_RATES[district]?.name || district}
Holding Horizon: ${holdingYears} Years (${new Date().getFullYear()} to ${new Date().getFullYear() + holdingYears})
Trajectory Model: ${scenario.toUpperCase()} (${annualTrajectoryRate}% p.a.)

============================================================
FORWARD VALUATION PROJECTION
============================================================
Projected Final Valuation: $${predictionResult.finalProjectedValue.toLocaleString()}
Projected Valuation Range: $${predictionResult.finalProjectedValueLow.toLocaleString()} - $${predictionResult.finalProjectedValueHigh.toLocaleString()}
Expected Capital Gain: +$${predictionResult.totalCapitalGain.toLocaleString()} (+${predictionResult.totalGainPct}%)
Compound Annual Growth Rate (CAGR): ${predictionResult.annualizedCAGR}% p.a.
Projected Exit PSF: $${predictionResult.finalPsf.toLocaleString()} / SQFT
Cumulative Estimated Rental Cashflow: $${predictionResult.cumulativeRent.toLocaleString()}
Total Estimated Wealth Accretion: $${predictionResult.estimatedNetProfit.toLocaleString()}
Algorithmic Confidence Rating: ${predictionResult.confidenceRating}%

============================================================
YEAR-BY-YEAR TRAJECTORY LEDGER
============================================================
${predictionResult.yearlyBreakdown
  .map(
    (item) =>
      `Year ${item.year} (${item.calendarYear}): $${item.projectedValue.toLocaleString()} | Gain: +$${item.capitalGain.toLocaleString()} (+${item.gainPct}%) | PSF: $${item.projectedPsf} | Equity: $${item.netEquity.toLocaleString()}`
  )
  .join('\n')}

Notice: This monograph constitutes computational econometric projection modeled by EstateAnalytics. Not a binding guarantee.`;

      const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `EstateAnalytics_Trajectory_Forecast_${holdingYears}Y.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadingReport(false);
    }, 900);
  };

  // Copy share summary
  const handleCopySummary = () => {
    const text = `EstateAnalytics Price Trajectory: $${currentPrice.toLocaleString()} projected to reach $${predictionResult.finalProjectedValue.toLocaleString()} in ${holdingYears} yrs (+${predictionResult.totalGainPct}% gain / ${predictionResult.annualizedCAGR}% CAGR).`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // SVG Chart Geometry Calculations
  const chartWidth = 740;
  const chartHeight = 280;
  const padLeft = 70;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 40;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const maxVal = Math.max(
    ...predictionResult.yearlyBreakdown.map((d) => (activeChartTab === 'valuation' ? d.projectedValueHigh : d.netEquity))
  );
  const minVal = Math.min(
    ...predictionResult.yearlyBreakdown.map((d) =>
      activeChartTab === 'valuation' ? Math.min(currentPrice * 0.9, d.projectedValueLow) : 0
    )
  );

  const getChartX = (idx: number) => {
    if (predictionResult.yearlyBreakdown.length <= 1) return padLeft;
    return padLeft + (idx / (predictionResult.yearlyBreakdown.length - 1)) * innerW;
  };

  const getChartY = (val: number) => {
    const range = maxVal - minVal || 1;
    const pct = (val - minVal) / range;
    return padTop + innerH - pct * innerH;
  };

  // Path generators
  const mainPoints = predictionResult.yearlyBreakdown.map((d, i) => ({
    x: getChartX(i),
    y: getChartY(activeChartTab === 'valuation' ? d.projectedValue : d.netEquity),
  }));

  const mainPath = mainPoints.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = mainPoints[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  // Confidence area path for valuation
  const upperPoints = predictionResult.yearlyBreakdown.map((d, i) => ({
    x: getChartX(i),
    y: getChartY(d.projectedValueHigh),
  }));
  const lowerPoints = predictionResult.yearlyBreakdown.map((d, i) => ({
    x: getChartX(i),
    y: getChartY(d.projectedValueLow),
  }));

  const areaCorridorPath =
    upperPoints.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, '') +
    lowerPoints
      .slice()
      .reverse()
      .reduce((acc, pt) => `${acc} L ${pt.x} ${pt.y}`, '') +
    ' Z';

  // Area under curve
  const fillAreaPath = `${mainPath} L ${getChartX(predictionResult.yearlyBreakdown.length - 1)} ${padTop + innerH} L ${padLeft} ${padTop + innerH} Z`;

  // Grid steps (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = minVal + pct * (maxVal - minVal);
    return {
      val: Math.round(val),
      y: padTop + innerH - pct * innerH,
    };
  });

  const activeDataPoint =
    hoveredYear !== null
      ? predictionResult.yearlyBreakdown[hoveredYear]
      : predictionResult.yearlyBreakdown[predictionResult.yearlyBreakdown.length - 1];

  return (
    <div className="w-full bg-[#F5F2ED] text-[#1A1A1A] pb-24">
      {/* Editorial Header Section */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-16 pt-10 md:pt-14 pb-8 border-b border-[#1A1A1A]/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
                Forward Econometric Modeling • Home Buyer Suite
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8C7355]" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
                Issue No. 042
              </span>
            </div>
            <h1 className="font-serif text-[36px] sm:text-[46px] md:text-[52px] font-light text-[#1A1A1A] leading-[1.08] tracking-tight">
              Property Price <br className="hidden sm:inline" />
              <span className="italic font-normal">Trajectory Predictor.</span>
            </h1>
            <div className="editorial-rule my-4" />
            <p className="font-serif text-[17px] md:text-[18px] text-[#1A1A1A]/80 leading-relaxed">
              Empower your acquisition decision with forward-looking econometric trajectory simulations. Forecast future valuations, equity compounding, and capital exits across macroeconomic market cycles.
            </p>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex items-center gap-3">
            <button
              id="pred-save-account-btn"
              onClick={handleSaveToAccount}
              className="bg-[#FFFFFF] border border-[#1A1A1A]/15 hover:border-[#1A1A1A] text-[#1A1A1A] px-4 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.18em] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {savedStatus ? (
                <>
                  <Check size={14} className="text-[#8C7355]" />
                  <span>Archived</span>
                </>
              ) : (
                <>
                  <Bookmark size={14} />
                  <span>Save Trajectory</span>
                </>
              )}
            </button>

            <button
              id="pred-download-monograph-btn"
              onClick={handleDownloadMonograph}
              disabled={downloadingReport}
              className="bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] px-4 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.18em] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-75"
            >
              {downloadingReport ? (
                <>
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-[#F5F2ED] border-t-transparent rounded-full" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Export Monograph</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Select Presets Bar */}
        <div className="mt-8 pt-6 border-t border-[#1A1A1A]/10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
              Curated Buyer Archetypes:
            </span>
            <span className="font-serif text-[12px] italic text-[#8C7355]">
              Select a benchmark profile to populate simulation
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BUYER_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className="text-left bg-[#FFFFFF] hover:bg-[#E2DFD8]/40 border border-[#1A1A1A]/10 hover:border-[#8C7355] p-3 rounded-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C7355]">
                    {preset.badge}
                  </span>
                  <span className="font-serif text-[13px] font-medium text-[#1A1A1A]">
                    ${(preset.price / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="font-serif text-[13px] text-[#1A1A1A] group-hover:text-[#8C7355] transition-colors truncate">
                  {preset.label}
                </div>
                <div className="font-sans text-[10px] text-[#1A1A1A]/50 uppercase tracking-wider mt-0.5">
                  {preset.sqft} sqft • {preset.years}-Yr Horizon
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <main className="max-w-[1200px] mx-auto px-5 md:px-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameter Controls (4 Cols) */}
          <div className="lg:col-span-4 bg-[#FFFFFF] rounded-sm p-6 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] border border-[#1A1A1A]/10 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-[#8C7355]" />
                <h3 className="font-serif text-[20px] font-normal text-[#1A1A1A]">
                  Trajectory Parameters
                </h3>
              </div>
              <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C7355] bg-[#E2DFD8]/50 px-2 py-0.5 rounded-sm">
                Live Engine
              </span>
            </div>

            <div className="space-y-4 text-[13px]">
              {/* 1. Purchase / Entry Price */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label
                    htmlFor="param-price"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/75"
                  >
                    Target Purchase Price ($)
                  </label>
                  <span className="font-serif font-medium text-[#1A1A1A] text-[14px]">
                    ${currentPrice.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-serif text-[#1A1A1A]/40">$</span>
                  <input
                    id="param-price"
                    type="number"
                    step={25000}
                    min={200000}
                    max={30000000}
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(Math.max(100000, Number(e.target.value) || 0))}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-sm pl-7 pr-3 py-2 text-[14px] font-serif text-[#1A1A1A] focus:outline-none focus:border-[#8C7355]"
                  />
                </div>
              </div>

              {/* 2. Size & Resulting Entry PSF */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="param-sqft"
                    className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/75 mb-1"
                  >
                    Size (SQFT)
                  </label>
                  <input
                    id="param-sqft"
                    type="number"
                    step={50}
                    min={300}
                    max={15000}
                    value={sqft}
                    onChange={(e) => setSqft(Math.max(100, Number(e.target.value) || 0))}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-sm px-3 py-2 text-[14px] font-serif text-[#1A1A1A] focus:outline-none focus:border-[#8C7355]"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/75 mb-1">
                    Entry Rate
                  </label>
                  <div className="bg-[#E2DFD8]/30 border border-[#1A1A1A]/10 rounded-sm px-3 py-2 text-[14px] font-serif text-[#1A1A1A]">
                    ${Math.round(currentPrice / (sqft || 1)).toLocaleString()} psf
                  </div>
                </div>
              </div>

              {/* 3. Property Type & Corridor District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="param-prop-type"
                    className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/75 mb-1"
                  >
                    Property Class
                  </label>
                  <select
                    id="param-prop-type"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-sm px-2.5 py-2 text-[13px] font-serif text-[#1A1A1A] focus:outline-none focus:border-[#8C7355] cursor-pointer"
                  >
                    <option value="private">Private (Condominium / Apt)</option>
                    <option value="landed">Landed Estate (Bungalow / Semi-D)</option>
                    <option value="hdb">HDB (Public Housing Resale)</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="param-district"
                    className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/75 mb-1"
                  >
                    District Corridor
                  </label>
                  <select
                    id="param-district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-sm px-2.5 py-2 text-[13px] font-serif text-[#1A1A1A] focus:outline-none focus:border-[#8C7355] cursor-pointer"
                  >
                    <optgroup label="Core Central Region (CCR)">
                      <option value="D01">D01 - Marina Bay / Raffles</option>
                      <option value="D02">D02 - Tanjong Pagar / Chinatown</option>
                      <option value="D04">D04 - Harbourfront / Sentosa</option>
                      <option value="D09">D09 - Orchard / River Valley</option>
                      <option value="D10">D10 - Tanglin / Bukit Timah</option>
                      <option value="D11">D11 - Newton / Novena</option>
                    </optgroup>
                    <optgroup label="Rest of Central Region (RCR)">
                      <option value="D03">D03 - Queenstown / Tiong Bahru</option>
                      <option value="D05">D05 - Buona Vista / Clementi</option>
                      <option value="D12">D12 - Toa Payoh / Balestier</option>
                      <option value="D14">D14 - Paya Lebar / Eunos</option>
                      <option value="D15">D15 - East Coast / Marine Parade</option>
                      <option value="D20">D20 - Bishan / Ang Mo Kio</option>
                    </optgroup>
                    <optgroup label="Outside Central Region (OCR)">
                      <option value="D19">D19 - Serangoon / Hougang / Punggol</option>
                      <option value="D22">D22 - Jurong / Lakeside</option>
                      <option value="D23">D23 - Bukit Batok / Hillview</option>
                      <option value="D27">D27 - Yishun / Canberra</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* 4. Holding Period Slider */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="param-years"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/75"
                  >
                    Investment Horizon (Years)
                  </label>
                  <span className="font-serif font-bold text-[#8C7355] text-[15px]">
                    {holdingYears} Years ({new Date().getFullYear()} – {new Date().getFullYear() + holdingYears})
                  </span>
                </div>
                <input
                  id="param-years"
                  type="range"
                  min={1}
                  max={15}
                  value={holdingYears}
                  onChange={(e) => setHoldingYears(Number(e.target.value))}
                  className="w-full accent-[#8C7355] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-sans text-[#1A1A1A]/50 uppercase tracking-wider">
                  <span>1 Yr (Short)</span>
                  <span>5 Yrs (Standard)</span>
                  <span>10 Yrs (Generational)</span>
                  <span>15 Yrs</span>
                </div>
              </div>

              {/* 5. Trajectory Modeling Scenarios */}
              <div className="pt-2 border-t border-[#1A1A1A]/10">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/75 mb-2">
                  Appreciation Trajectory Scenario
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setScenario('historical')}
                    className={`p-2 rounded-sm text-left border transition-all cursor-pointer ${
                      scenario === 'historical'
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] border-[#1A1A1A]'
                        : 'bg-[#F5F2ED]/40 text-[#1A1A1A] border-[#1A1A1A]/15 hover:border-[#8C7355]'
                    }`}
                  >
                    <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] opacity-75">
                      Momentum
                    </div>
                    <div className="font-serif font-medium text-[13px]">Historical Trend</div>
                    <div className="text-[10px] opacity-70 mt-0.5">~{DISTRICT_RATES[district]?.baseGrowth}% / yr</div>
                  </button>

                  <button
                    onClick={() => setScenario('baseline')}
                    className={`p-2 rounded-sm text-left border transition-all cursor-pointer ${
                      scenario === 'baseline'
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] border-[#1A1A1A]'
                        : 'bg-[#F5F2ED]/40 text-[#1A1A1A] border-[#1A1A1A]/15 hover:border-[#8C7355]'
                    }`}
                  >
                    <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] opacity-75">
                      Consensus
                    </div>
                    <div className="font-serif font-medium text-[13px]">Balanced 3.9%</div>
                    <div className="text-[10px] opacity-70 mt-0.5">Master Plan Parity</div>
                  </button>

                  <button
                    onClick={() => setScenario('conservative')}
                    className={`p-2 rounded-sm text-left border transition-all cursor-pointer ${
                      scenario === 'conservative'
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] border-[#1A1A1A]'
                        : 'bg-[#F5F2ED]/40 text-[#1A1A1A] border-[#1A1A1A]/15 hover:border-[#8C7355]'
                    }`}
                  >
                    <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] opacity-75">
                      Defensive
                    </div>
                    <div className="font-serif font-medium text-[13px]">Conservative 2.4%</div>
                    <div className="text-[10px] opacity-70 mt-0.5">High-Rate Regime</div>
                  </button>

                  <button
                    onClick={() => setScenario('accelerated')}
                    className={`p-2 rounded-sm text-left border transition-all cursor-pointer ${
                      scenario === 'accelerated'
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] border-[#1A1A1A]'
                        : 'bg-[#F5F2ED]/40 text-[#1A1A1A] border-[#1A1A1A]/15 hover:border-[#8C7355]'
                    }`}
                  >
                    <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] opacity-75">
                      Catalyst
                    </div>
                    <div className="font-serif font-medium text-[13px]">Accelerated 6.4%</div>
                    <div className="text-[10px] opacity-70 mt-0.5">Transit & Waterfront</div>
                  </button>
                </div>

                {/* Custom Growth Selector */}
                <div className="mt-2">
                  <button
                    onClick={() => setScenario('custom')}
                    className={`w-full py-1.5 px-2 rounded-sm text-center border transition-all font-sans text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer ${
                      scenario === 'custom'
                        ? 'bg-[#8C7355] text-[#F5F2ED] border-[#8C7355]'
                        : 'bg-[#F5F2ED]/20 text-[#1A1A1A]/70 border-[#1A1A1A]/15 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Custom Annual Calibration ({customGrowth.toFixed(1)}%)
                  </button>
                  {scenario === 'custom' && (
                    <div className="mt-2 p-3 bg-[#E2DFD8]/30 rounded-sm border border-[#1A1A1A]/10">
                      <div className="flex justify-between items-center text-[12px] mb-1">
                        <span className="font-serif">Custom Annual Appreciation:</span>
                        <span className="font-bold text-[#8C7355]">{customGrowth.toFixed(1)}% / yr</span>
                      </div>
                      <input
                        type="range"
                        min={-1.0}
                        max={10.0}
                        step={0.1}
                        value={customGrowth}
                        onChange={(e) => setCustomGrowth(Number(e.target.value))}
                        className="w-full accent-[#8C7355] cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Cashflow & Leverage Options */}
              <div className="pt-3 border-t border-[#1A1A1A]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/75">
                    Include Rental Cashflow
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeRental}
                      onChange={(e) => setIncludeRental(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#c4c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c4c6cd] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8C7355]" />
                  </label>
                </div>
                {includeRental && (
                  <div className="flex items-center justify-between text-[12px] bg-[#E2DFD8]/30 p-2 rounded-sm border border-[#1A1A1A]/10">
                    <span className="font-serif">Gross Rental Yield (% p.a.):</span>
                    <input
                      type="number"
                      step={0.1}
                      min={1.0}
                      max={8.0}
                      value={rentalYield}
                      onChange={(e) => setRentalYield(Number(e.target.value) || 0)}
                      className="w-16 bg-white border border-[#1A1A1A]/20 rounded-xs px-2 py-0.5 text-right font-bold text-[#1A1A1A]"
                    />
                  </div>
                )}
              </div>

              {/* Reset to Default */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentPrice(1850000);
                    setSqft(1150);
                    setPropertyType('private');
                    setDistrict('ccr');
                    setHoldingYears(5);
                    setScenario('historical');
                  }}
                  className="w-full text-center text-[#1A1A1A]/50 hover:text-[#1A1A1A] font-sans text-[9px] font-bold uppercase tracking-[0.2em] py-1 cursor-pointer transition-colors"
                >
                  Reset to Equilibrium Baseline
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visualization & Trajectory Analytics (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Metric Cards: 4 Key Predicted Outcomes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {/* Card 1: Projected Exit Valuation */}
              <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#1A1A1A]/10 shadow-[0_10px_25px_-10px_rgba(26,26,26,0.04)]">
                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C7355] block mb-1">
                  Projected Valuation ({new Date().getFullYear() + holdingYears})
                </span>
                <div className="font-serif text-[26px] md:text-[28px] font-light text-[#1A1A1A] leading-tight">
                  ${(predictionResult.finalProjectedValue / 1000000).toFixed(2)}M
                </div>
                <div className="font-sans text-[10px] text-[#1A1A1A]/60 mt-1">
                  Spread: ${(predictionResult.finalProjectedValueLow / 1000000).toFixed(2)}M – ${(predictionResult.finalProjectedValueHigh / 1000000).toFixed(2)}M
                </div>
              </div>

              {/* Card 2: Cumulative Capital Gain */}
              <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#1A1A1A]/10 shadow-[0_10px_25px_-10px_rgba(26,26,26,0.04)]">
                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C7355] block mb-1">
                  Capital Appreciation
                </span>
                <div className="font-serif text-[26px] md:text-[28px] font-light text-[#1A1A1A] leading-tight flex items-baseline gap-1">
                  <span className="text-[#8C7355]">+</span>${(predictionResult.totalCapitalGain / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
                </div>
                <div className="font-sans text-[10px] font-semibold text-[#8C7355] mt-1 uppercase tracking-wider">
                  +{predictionResult.totalGainPct}% Total Gain
                </div>
              </div>

              {/* Card 3: Annualized CAGR */}
              <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#1A1A1A]/10 shadow-[0_10px_25px_-10px_rgba(26,26,26,0.04)]">
                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C7355] block mb-1">
                  Annualized Trajectory
                </span>
                <div className="font-serif text-[26px] md:text-[28px] font-light text-[#1A1A1A] leading-tight">
                  {predictionResult.annualizedCAGR}%
                </div>
                <div className="font-sans text-[10px] text-[#1A1A1A]/60 mt-1 uppercase tracking-wider">
                  Compound Annual Rate
                </div>
              </div>

              {/* Card 4: Projected PSF */}
              <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#1A1A1A]/10 shadow-[0_10px_25px_-10px_rgba(26,26,26,0.04)]">
                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C7355] block mb-1">
                  Projected PSF
                </span>
                <div className="font-serif text-[26px] md:text-[28px] font-light text-[#1A1A1A] leading-tight">
                  ${predictionResult.finalPsf.toLocaleString()}
                </div>
                <div className="font-sans text-[10px] text-[#1A1A1A]/60 mt-1">
                  Baseline: ${Math.round(currentPrice / sqft).toLocaleString()} psf
                </div>
              </div>
            </div>

            {/* Main Interactive Trajectory Curve Chart Card */}
            <div className="bg-[#FFFFFF] rounded-sm p-6 sm:p-8 border border-[#1A1A1A]/10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)]">
              {/* Header with toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4 mb-6">
                <div>
                  <span className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-1">
                    Temporal Valuation Curve • {holdingYears}-Year Horizon
                  </span>
                  <h2 className="font-serif text-[24px] font-normal text-[#1A1A1A]">
                    Forward Asset Trajectory & Confidence Corridor
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 bg-[#E2DFD8]/40 p-1 rounded-sm border border-[#1A1A1A]/5 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveChartTab('valuation')}
                    className={`px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.15em] rounded-sm transition-all cursor-pointer ${
                      activeChartTab === 'valuation'
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] shadow-xs'
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Asset Valuation ($)
                  </button>
                  <button
                    onClick={() => setActiveChartTab('equity')}
                    className={`px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.15em] rounded-sm transition-all cursor-pointer ${
                      activeChartTab === 'equity'
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] shadow-xs'
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Net Equity Wealth ($)
                  </button>
                </div>
              </div>

              {/* Active Scrubber Indicator Banner */}
              <div className="bg-[#F5F2ED]/60 border border-[#1A1A1A]/10 rounded-sm p-4 mb-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-[#1A1A1A] text-[#F5F2ED] flex flex-col items-center justify-center">
                    <span className="font-sans text-[8px] uppercase tracking-wider text-[#8C7355]">Yr</span>
                    <span className="font-serif text-[15px] font-bold leading-none">{activeDataPoint.year}</span>
                  </div>
                  <div>
                    <div className="font-serif text-[18px] font-medium text-[#1A1A1A]">
                      Calendar Year {activeDataPoint.calendarYear}
                    </div>
                    <div className="font-sans text-[10px] text-[#1A1A1A]/60 uppercase tracking-wider">
                      {activeDataPoint.year === 0
                        ? 'Baseline Acquisition Inception'
                        : `Cumulative Horizon: ${activeDataPoint.year} Year${activeDataPoint.year > 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] text-[#8C7355] block">
                      {activeChartTab === 'valuation' ? 'Projected Valuation' : 'Accumulated Net Equity'}
                    </span>
                    <span className="font-serif text-[20px] font-light text-[#1A1A1A]">
                      ${(activeChartTab === 'valuation' ? activeDataPoint.projectedValue : activeDataPoint.netEquity).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] text-[#8C7355] block">
                      Appreciation Gain
                    </span>
                    <span className="font-serif text-[20px] font-light text-[#8C7355]">
                      +${activeDataPoint.capitalGain.toLocaleString()} (+{activeDataPoint.gainPct}%)
                    </span>
                  </div>

                  <div className="hidden sm:block">
                    <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] text-[#8C7355] block">
                      Projected PSF
                    </span>
                    <span className="font-serif text-[20px] font-light text-[#1A1A1A]">
                      ${activeDataPoint.projectedPsf}
                    </span>
                  </div>
                </div>
              </div>

              {/* SVG Chart */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto select-none overflow-visible"
                  style={{ minWidth: '550px' }}
                >
                  <defs>
                    {/* Linear gradient for area fill */}
                    <linearGradient id="trajectoryFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8C7355" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8C7355" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Subtle grid pattern */}
                    <pattern id="gridLines" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A1A1A" strokeWidth="0.5" strokeOpacity="0.04" />
                    </pattern>
                  </defs>

                  {/* Grid background */}
                  <rect x={padLeft} y={padTop} width={innerW} height={innerH} fill="url(#gridLines)" />

                  {/* Horizontal Guide Lines and Y-Axis Labels */}
                  {yTicks.map((tick, i) => (
                    <g key={i}>
                      <line
                        x1={padLeft}
                        y1={tick.y}
                        x2={padLeft + innerW}
                        y2={tick.y}
                        stroke="#1A1A1A"
                        strokeWidth="1"
                        strokeOpacity="0.08"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padLeft - 10}
                        y={tick.y + 4}
                        textAnchor="end"
                        className="font-sans text-[10px] fill-[#1A1A1A]/50"
                      >
                        ${(tick.val / 1000000).toFixed(2)}M
                      </text>
                    </g>
                  ))}

                  {/* Confidence Interval Corridor (Valuation tab only) */}
                  {activeChartTab === 'valuation' && (
                    <path d={areaCorridorPath} fill="#8C7355" fillOpacity="0.07" />
                  )}

                  {/* Area fill under curve */}
                  <path d={fillAreaPath} fill="url(#trajectoryFill)" />

                  {/* Main Curve Line */}
                  <path
                    d={mainPath}
                    fill="none"
                    stroke="#1A1A1A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Confidence bounds dotted lines */}
                  {activeChartTab === 'valuation' && (
                    <>
                      <path
                        d={upperPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')}
                        fill="none"
                        stroke="#8C7355"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        strokeOpacity="0.6"
                      />
                      <path
                        d={lowerPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')}
                        fill="none"
                        stroke="#8C7355"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        strokeOpacity="0.6"
                      />
                    </>
                  )}

                  {/* Year Data Nodes & Interactive Scrub Targets */}
                  {predictionResult.yearlyBreakdown.map((item, idx) => {
                    const cx = getChartX(idx);
                    const cy = getChartY(activeChartTab === 'valuation' ? item.projectedValue : item.netEquity);
                    const isHovered = hoveredYear === idx;
                    const isFinal = idx === predictionResult.yearlyBreakdown.length - 1;

                    return (
                      <g
                        key={idx}
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredYear(idx)}
                        onMouseLeave={() => setHoveredYear(null)}
                      >
                        {/* Hover vertical guide line */}
                        {isHovered && (
                          <line
                            x1={cx}
                            y1={padTop}
                            x2={cx}
                            y2={padTop + innerH}
                            stroke="#8C7355"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                        )}

                        {/* Node circle */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 7 : isFinal ? 5.5 : 4}
                          fill={isHovered ? '#8C7355' : isFinal ? '#1A1A1A' : '#FFFFFF'}
                          stroke={isHovered ? '#1A1A1A' : '#8C7355'}
                          strokeWidth={isHovered ? 2.5 : 2}
                          className="transition-all"
                        />

                        {/* X-axis label */}
                        <text
                          x={cx}
                          y={padTop + innerH + 18}
                          textAnchor="middle"
                          className={`font-sans text-[10px] uppercase tracking-wider ${
                            isHovered ? 'fill-[#8C7355] font-bold' : 'fill-[#1A1A1A]/60'
                          }`}
                        >
                          Yr {item.year}
                        </text>
                        <text
                          x={cx}
                          y={padTop + innerH + 30}
                          textAnchor="middle"
                          className="font-serif text-[9px] fill-[#1A1A1A]/40"
                        >
                          '{String(item.calendarYear).slice(-2)}
                        </text>

                        {/* Expanded hit target for comfortable touch / cursor scrub */}
                        <rect
                          x={cx - (innerW / (predictionResult.yearlyBreakdown.length || 1)) / 2}
                          y={padTop}
                          width={innerW / (predictionResult.yearlyBreakdown.length || 1)}
                          height={innerH + 40}
                          fill="transparent"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Chart Legend & Context Notes */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#1A1A1A]/10 text-[11px] font-sans">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-[#1A1A1A]" />
                    <span className="font-semibold text-[#1A1A1A] uppercase tracking-wider">Median Trajectory</span>
                  </div>
                  {activeChartTab === 'valuation' && (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-2 bg-[#8C7355]/20 border border-[#8C7355]/50 rounded-xs" />
                      <span className="text-[#1A1A1A]/70 uppercase tracking-wider">Confidence Corridor (±{(2 + holdingYears * 1.2).toFixed(1)}%)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8C7355]" />
                    <span className="text-[#1A1A1A]/70 uppercase tracking-wider">Scrub Year to Inspect</span>
                  </div>
                </div>

                <div className="text-[#8C7355] font-serif italic text-xs">
                  Assumes {annualTrajectoryRate}% annualized CAGR based on {scenario.toUpperCase()} model
                </div>
              </div>
            </div>

            {/* Year-by-Year Ledger Table */}
            <div className="bg-[#FFFFFF] rounded-sm p-6 sm:p-8 border border-[#1A1A1A]/10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)]">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-4">
                <div>
                  <span className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-0.5">
                    Yearly Schedule
                  </span>
                  <h3 className="font-serif text-[22px] font-normal text-[#1A1A1A]">
                    Trajectory Amortization & Value Schedule
                  </h3>
                </div>

                <button
                  onClick={handleCopySummary}
                  className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/70 hover:text-[#1A1A1A] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedLink ? <Check size={13} className="text-[#8C7355]" /> : <Share2 size={13} />}
                  <span>{copiedLink ? 'Copied Summary' : 'Share Projection'}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#1A1A1A]/10 font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
                      <th className="py-2.5 px-3">Horizon</th>
                      <th className="py-2.5 px-3">Projected Valuation</th>
                      <th className="py-2.5 px-3">Cumulative Gain</th>
                      <th className="py-2.5 px-3">Est. PSF</th>
                      {includeRental && <th className="py-2.5 px-3">Cumul. Rent</th>}
                      <th className="py-2.5 px-3">Net Equity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/5 font-serif">
                    {predictionResult.yearlyBreakdown.map((row) => (
                      <tr
                        key={row.year}
                        className={`transition-colors hover:bg-[#F5F2ED]/60 ${
                          hoveredYear === row.year ? 'bg-[#E2DFD8]/40' : ''
                        }`}
                        onMouseEnter={() => setHoveredYear(row.year)}
                        onMouseLeave={() => setHoveredYear(null)}
                      >
                        <td className="py-3 px-3">
                          <span className="font-sans font-bold text-[#1A1A1A]">Yr {row.year}</span>{' '}
                          <span className="text-[#1A1A1A]/50 text-xs font-sans">({row.calendarYear})</span>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#1A1A1A]">
                          ${row.projectedValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-[#8C7355] font-medium">
                          {row.year === 0 ? '—' : `+$${row.capitalGain.toLocaleString()} (+${row.gainPct}%)`}
                        </td>
                        <td className="py-3 px-3 text-[#1A1A1A]/80">
                          ${row.projectedPsf}
                        </td>
                        {includeRental && (
                          <td className="py-3 px-3 text-[#1A1A1A]/80">
                            {row.cumulativeRentalIncome > 0
                              ? `+$${row.cumulativeRentalIncome.toLocaleString()}`
                              : '—'}
                          </td>
                        )}
                        <td className="py-3 px-3 font-medium text-[#1A1A1A]">
                          ${row.netEquity.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Property Price Index & Location Benchmarks (Spec Section 3 & 5) */}
            <PropertyPriceIndexCard
              stats={districtStats}
              sqft={sqft}
            />

            {/* Gemini AI Econometric Insight Monograph (Role: Buyer) */}
            <GeminiInsightPanel
              role="buyer"
              district={normalizedDistrict}
              districtName={districtInfo.name}
              propertyType={propertyType}
              size={sqft}
              level="mid"
              tenure="99-year Leasehold"
              leaseRemaining={92}
              facing="North-South"
              amenities="Transit & Schools"
              condition="Well-Maintained"
              valuationMedian={currentPrice}
              valuationMin={districtStats.minPrice}
              valuationMax={districtStats.maxPrice}
              medianPsf={Math.round(currentPrice / (sqft || 1))}
              trajectoryCAGR={predictionResult.annualizedCAGR}
              projected5Y={predictionResult.yearlyBreakdown[Math.min(5, predictionResult.yearlyBreakdown.length - 1)]?.projectedValue}
              projected10Y={predictionResult.finalProjectedValue}
            />

            {/* Strategic Advice Callout & Surveyor Booking */}
            <div className="bg-[#FFFFFF] rounded-sm p-6 sm:p-8 border border-[#1A1A1A]/10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.04)] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-1">
                  Advisory Monograph Validation
                </span>
                <h4 className="font-serif text-[22px] font-normal text-[#1A1A1A] mb-1">
                  Verify Trajectory with Chartered Surveyors
                </h4>
                <p className="font-serif text-[14px] text-[#1A1A1A]/70 max-w-lg">
                  Trajectory algorithms model macroeconomic trends. For specific unit layout nuances, tenure decay, and acoustic strata, book an institutional RICS valuation audit.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  id="pred-book-appraisal-cta"
                  onClick={() =>
                    onOpenBookAppraisal({
                      propertyType,
                      size: sqft,
                      district,
                    })
                  }
                  className="bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] px-6 py-3.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 text-center cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Book Official Appraisal
                </button>
                <button
                  onClick={() => onNavigateTab('trends')}
                  className="border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] px-5 py-3.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-center cursor-pointer whitespace-nowrap"
                >
                  View Market Trends
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
