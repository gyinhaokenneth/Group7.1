import React from 'react';
import { CalculatedDistrictStats } from '../data/singaporeDistricts';
import { Activity, TrendingUp, BarChart3, MapPin, Layers, Info } from 'lucide-react';

interface PropertyPriceIndexCardProps {
  stats: CalculatedDistrictStats;
  sqft: number;
}

export const PropertyPriceIndexCard: React.FC<PropertyPriceIndexCardProps> = ({ stats, sqft }) => {
  const isPremium = stats.spreadVsNational >= 0;

  // Normalized bar widths for Min, Median, Max PSF
  const maxBenchmark = Math.max(stats.maxPsf * 1.05, 3500);
  const minPct = Math.round((stats.minPsf / maxBenchmark) * 100);
  const medianPct = Math.round((stats.medianPsf / maxBenchmark) * 100);
  const maxPct = Math.round((stats.maxPsf / maxBenchmark) * 100);

  return (
    <div className="bg-[#FFFFFF] rounded-sm p-6 sm:p-8 border border-[#1A1A1A]/10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-4">
        <div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-1">
            Official Price Indices & Location Benchmarks
          </span>
          <h3 className="font-serif text-[22px] md:text-[24px] font-normal text-[#1A1A1A] flex items-center gap-2">
            <MapPin size={18} className="text-[#8C7355]" />
            <span>{stats.districtCode} — {stats.districtName}</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-[0.15em] bg-[#F5F2ED] text-[#1A1A1A] rounded-xs border border-[#1A1A1A]/10">
            Region: {stats.region}
          </span>
          <span className="px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-[0.15em] bg-[#1A1A1A] text-[#F5F2ED] rounded-xs">
            {stats.propertyType.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 2-Column Comparison: National vs District Index */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* National Index */}
        <div className="p-5 bg-[#FAF8F5] rounded-xs border border-[#1A1A1A]/10 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
              Singapore National Price Index
            </span>
            <span className="text-[10px] font-sans text-[#1A1A1A]/50 uppercase">Base Q1 2020 = 100</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[36px] font-light text-[#1A1A1A]">
              {stats.nationalPriceIndex.toFixed(1)}
            </span>
            <span className="text-emerald-700 text-[12px] font-sans font-bold flex items-center gap-0.5">
              <TrendingUp size={14} /> +3.2% YoY
            </span>
          </div>
          <p className="font-serif text-[13px] text-[#1A1A1A]/70 mt-1">
            Aggregate residential resale composite benchmark across all 28 Singapore sectors.
          </p>
        </div>

        {/* District Specific Index */}
        <div className="p-5 bg-[#FAF8F5] rounded-xs border border-[#1A1A1A]/10 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C7355]">
              {stats.districtCode} Location Price Index
            </span>
            <span className="text-[10px] font-sans text-[#8C7355] font-bold uppercase">Submarket Composite</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[36px] font-light text-[#1A1A1A]">
              {stats.districtPriceIndex.toFixed(1)}
            </span>
            <span
              className={`text-[12px] font-sans font-bold flex items-center gap-0.5 ${
                isPremium ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              <TrendingUp size={14} /> {isPremium ? `+${stats.spreadVsNational}%` : `${stats.spreadVsNational}%`} vs Nat'l
            </span>
          </div>
          <p className="font-serif text-[13px] text-[#1A1A1A]/70 mt-1">
            Historical 5-year annualized capital appreciation rate: <strong>{stats.annualGrowthRate}% p.a.</strong>
          </p>
        </div>
      </div>

      {/* Min, Median, Max Price Distribution for Selected Location */}
      <div className="p-5 bg-[#FFFFFF] rounded-xs border border-[#1A1A1A]/15 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7355] block">
              Empirical Location Distribution (Trailing 12 Months)
            </span>
            <h4 className="font-serif text-[18px] text-[#1A1A1A] font-normal">
              Min, Median & Max Valuation for {sqft} sqft in {stats.districtCode}
            </h4>
          </div>
          <span className="text-[11px] font-sans text-[#1A1A1A]/60">
            Sample pool: {stats.sampleCount} recorded transactions
          </span>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Min */}
          <div className="p-4 bg-[#FAF8F5] rounded-xs border border-[#1A1A1A]/10">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60 block mb-1">
              Minimum (10th Percentile)
            </span>
            <div className="font-serif text-[22px] font-light text-[#1A1A1A]">
              ${stats.minPrice.toLocaleString()}
            </div>
            <span className="text-[12px] font-sans text-[#1A1A1A]/70">
              ${stats.minPsf} psf
            </span>
          </div>

          {/* Median */}
          <div className="p-4 bg-[#F5F2ED] rounded-xs border-2 border-[#8C7355]">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7355] block mb-1">
              Median (Transacted Benchmark)
            </span>
            <div className="font-serif text-[24px] font-normal text-[#1A1A1A]">
              ${stats.medianPrice.toLocaleString()}
            </div>
            <span className="text-[12px] font-sans font-bold text-[#8C7355]">
              ${stats.medianPsf} psf
            </span>
          </div>

          {/* Max */}
          <div className="p-4 bg-[#FAF8F5] rounded-xs border border-[#1A1A1A]/10">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60 block mb-1">
              Maximum (90th Percentile)
            </span>
            <div className="font-serif text-[22px] font-light text-[#1A1A1A]">
              ${stats.maxPrice.toLocaleString()}
            </div>
            <span className="text-[12px] font-sans text-[#1A1A1A]/70">
              ${stats.maxPsf} psf
            </span>
          </div>
        </div>

        {/* Visual Corridor Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-sans text-[#1A1A1A]/70">
            <span>Entry Corridor: ${stats.minPsf} psf</span>
            <span className="font-bold text-[#8C7355]">Median: ${stats.medianPsf} psf</span>
            <span>Premium Corridor: ${stats.maxPsf} psf</span>
          </div>

          <div className="h-3 bg-[#E2DFD8] rounded-full relative overflow-hidden flex items-center">
            {/* Range highlight */}
            <div
              className="absolute h-full bg-gradient-to-r from-[#C2B5A0] via-[#8C7355] to-[#4A3E31] rounded-full"
              style={{
                left: `${minPct}%`,
                width: `${maxPct - minPct}%`,
              }}
            />
            {/* Median pin */}
            <div
              className="absolute w-2 h-5 bg-[#1A1A1A] -top-1 rounded-xs shadow-xs"
              style={{ left: `calc(${medianPct}% - 4px)` }}
              title={`Median: $${stats.medianPsf} psf`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
