import React, { useState, useMemo } from 'react';
import { TRAILING_12_MONTHS_TREND, HOTSPOT_AREAS } from '../data/trends';
import { HotspotArea, TabType } from '../types';
import { TrendingUp, MapPin, X, ArrowUpRight, Layers, ZoomIn, Info, Sparkles, ArrowRight, Building } from 'lucide-react';
import { PropertyPriceIndexCard } from './PropertyPriceIndexCard';
import { URATransactionFeed } from './URATransactionFeed';
import { SINGAPORE_DISTRICTS, getDistrictPriceStats } from '../data/singaporeDistricts';

interface MarketTrendsViewProps {
  onOpenBookAppraisal: () => void;
  onNavigateTab?: (tab: TabType) => void;
}

export const MarketTrendsView: React.FC<MarketTrendsViewProps> = ({
  onOpenBookAppraisal,
  onNavigateTab,
}) => {
  const [activeSector, setActiveSector] = useState<'both' | 'private' | 'landed'>('both');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotArea | null>(null);
  const [showFullMapModal, setShowFullMapModal] = useState(false);
  const [selectedExplorerDistrict, setSelectedExplorerDistrict] = useState<string>('D09');
  const [selectedExplorerPropType, setSelectedExplorerPropType] = useState<'private' | 'landed' | 'hdb'>('private');
  const [explorerSqft, setExplorerSqft] = useState<number>(1200);

  const explorerStats = useMemo(() => {
    return getDistrictPriceStats(selectedExplorerDistrict, selectedExplorerPropType, explorerSqft);
  }, [selectedExplorerDistrict, selectedExplorerPropType, explorerSqft]);

  // SVG Chart sizing
  const chartWidth = 720;
  const chartHeight = 260;
  const paddingX = 45;
  const paddingY = 30;

  const minIndex = 168;
  const maxIndex = 206;

  // Coordinate mapping functions
  const getX = (index: number) => {
    const step = (chartWidth - paddingX * 2) / (TRAILING_12_MONTHS_TREND.length - 1);
    return paddingX + index * step;
  };

  const getY = (val: number) => {
    const range = maxIndex - minIndex;
    const ratio = (val - minIndex) / range;
    return chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
  };

  // Generate SVG path for Private series
  const privatePoints = TRAILING_12_MONTHS_TREND.map((d, i) => `${getX(i)},${getY(d.privateIndex)}`).join(' ');
  // Smooth curve using cubic beziers
  const generateSmoothPath = (indices: number[]) => {
    if (indices.length === 0) return '';
    const points = indices.map((val, i) => ({ x: getX(i), y: getY(val) }));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const privatePath = generateSmoothPath(TRAILING_12_MONTHS_TREND.map((d) => d.privateIndex));
  const landedPath = generateSmoothPath(TRAILING_12_MONTHS_TREND.map((d) => d.landedIndex));

  // Area under private curve
  const areaPath = `${privatePath} L ${getX(TRAILING_12_MONTHS_TREND.length - 1)} ${chartHeight - paddingY} L ${getX(0)} ${chartHeight - paddingY} Z`;

  return (
    <div className="w-full">
      <main className="max-w-[1200px] mx-auto px-5 md:px-16 py-12">
        {/* Page Title & Intro */}
        <section className="mb-10">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-2">
            Macro Trends & Capital Flows • Issue No. 042
          </span>
          <h1 className="font-serif text-[36px] md:text-[44px] font-light text-[#1A1A1A] mb-3">
            Market Trends & Insights
          </h1>
          <div className="editorial-rule my-3" />
          <p className="font-serif text-[17px] text-[#1A1A1A]/75 max-w-3xl leading-relaxed">
            Analyze price movements, yield compressions, and emerging value hotspots across the urban real estate sector over the trailing 12-month ledger.
          </p>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Visualizer: Price Index Trajectory (8 cols) */}
          <div className="lg:col-span-8 bg-[#FFFFFF] rounded-sm p-6 sm:p-8 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] border border-[#1A1A1A]/10 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-5 mb-6">
                <div>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-1">
                    Temporal Valuation Index
                  </span>
                  <h2 className="font-serif text-[24px] font-normal text-[#1A1A1A]">
                    Price Index Trajectory
                  </h2>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-[#E2DFD8]/40 p-1 rounded-sm border border-[#1A1A1A]/5">
                  <button
                    id="trend-filter-both"
                    onClick={() => setActiveSector('both')}
                    className={`px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.15em] rounded-sm transition-all cursor-pointer ${
                      activeSector === 'both'
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] shadow-xs'
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                    }`}
                  >
                    All Sectors
                  </button>
                  <button
                    id="trend-filter-private"
                    onClick={() => setActiveSector('private')}
                    className={`px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.15em] rounded-sm transition-all cursor-pointer ${
                      activeSector === 'private'
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] shadow-xs'
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Private
                  </button>
                  <button
                    id="trend-filter-landed"
                    onClick={() => setActiveSector('landed')}
                    className={`px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.15em] rounded-sm transition-all cursor-pointer ${
                      activeSector === 'landed'
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] shadow-xs'
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                    }`}
                  >
                    Landed
                  </button>
                </div>
              </div>

              {/* Interactive SVG Chart */}
              <div className="relative w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto min-w-[540px] select-none"
                >
                  <defs>
                    <linearGradient id="privateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8C7355" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#8C7355" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[170, 180, 190, 200].map((val) => {
                    const y = getY(val);
                    return (
                      <g key={val}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="#1A1A1A"
                          strokeOpacity="0.08"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#1A1A1A"
                          fillOpacity="0.45"
                          fontFamily="Hanken Grotesk"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill for Private */}
                  {(activeSector === 'both' || activeSector === 'private') && (
                    <path d={areaPath} fill="url(#privateGradient)" />
                  )}

                  {/* Private curve (Solid line - Bronze) */}
                  {(activeSector === 'both' || activeSector === 'private') && (
                    <path
                      d={privatePath}
                      fill="none"
                      stroke="#8C7355"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Landed curve (Dashed line - Charcoal) */}
                  {(activeSector === 'both' || activeSector === 'landed') && (
                    <path
                      d={landedPath}
                      fill="none"
                      stroke="#1A1A1A"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                    />
                  )}

                  {/* X Axis Labels & Interactive trigger points */}
                  {TRAILING_12_MONTHS_TREND.map((d, i) => {
                    const x = getX(i);
                    const yBottom = chartHeight - 8;
                    const isHovered = hoveredPointIndex === i;

                    return (
                      <g
                        key={d.month}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      >
                        {/* Month text */}
                        <text
                          x={x}
                          y={yBottom}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight={isHovered ? '700' : '400'}
                          fill={isHovered ? '#1A1A1A' : '#1A1A1A'}
                          fillOpacity={isHovered ? '1' : '0.5'}
                          fontFamily="Hanken Grotesk"
                        >
                          {d.month}
                        </text>

                        {/* Interactive vertical hover indicator */}
                        {isHovered && (
                          <line
                            x1={x}
                            y1={paddingY}
                            x2={x}
                            y2={chartHeight - paddingY}
                            stroke="#8C7355"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                          />
                        )}

                        {/* Points */}
                        {(activeSector === 'both' || activeSector === 'private') && (
                          <circle
                            cx={x}
                            cy={getY(d.privateIndex)}
                            r={isHovered ? 5 : 3.5}
                            fill="#8C7355"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="transition-all"
                          />
                        )}

                        {(activeSector === 'both' || activeSector === 'landed') && (
                          <circle
                            cx={x}
                            cy={getY(d.landedIndex)}
                            r={isHovered ? 5 : 3}
                            fill="#1A1A1A"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="transition-all"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Tooltip detail readout below graph */}
              <div className="mt-4 p-3.5 bg-[#F5F2ED] rounded-sm border border-[#1A1A1A]/10 flex flex-wrap items-center justify-between gap-3 text-[13px]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-0.5 bg-[#8C7355]" />
                    <span className="font-sans text-[11px] uppercase font-bold tracking-wider text-[#1A1A1A]">
                      Private Condominium:
                    </span>
                    <span className="font-serif text-[#8C7355] font-semibold text-sm">
                      {hoveredPointIndex !== null
                        ? `${TRAILING_12_MONTHS_TREND[hoveredPointIndex].privateIndex} pts`
                        : `${TRAILING_12_MONTHS_TREND[TRAILING_12_MONTHS_TREND.length - 1].privateIndex} pts`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-0.5 border-b border-dashed border-[#1A1A1A]" />
                    <span className="font-sans text-[11px] uppercase font-bold tracking-wider text-[#1A1A1A]">
                      Landed Housing:
                    </span>
                    <span className="font-serif text-[#1A1A1A] font-semibold text-sm">
                      {hoveredPointIndex !== null
                        ? `${TRAILING_12_MONTHS_TREND[hoveredPointIndex].landedIndex} pts`
                        : `${TRAILING_12_MONTHS_TREND[TRAILING_12_MONTHS_TREND.length - 1].landedIndex} pts`}
                    </span>
                  </div>
                </div>

                <div className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                  {hoveredPointIndex !== null
                    ? `Month: ${TRAILING_12_MONTHS_TREND[hoveredPointIndex].month} • Vol: ${TRAILING_12_MONTHS_TREND[hoveredPointIndex].volume} units`
                    : 'Hover over data points to inspect monthly indices'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* QoQ Growth Card */}
            <div className="bg-[#FFFFFF] rounded-sm p-6 sm:p-7 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] border border-[#1A1A1A]/10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355]">
                    QoQ Trajectory
                  </span>
                  <span className="w-7 h-7 rounded-full bg-[#E2DFD8]/60 flex items-center justify-center text-[#1A1A1A]">
                    <TrendingUp size={15} />
                  </span>
                </div>
                <div className="font-serif text-[44px] font-light text-[#1A1A1A] leading-none mb-3">
                  +2.4%
                </div>
                <p className="font-serif text-[15px] leading-relaxed text-[#1A1A1A]/75">
                  Private residential sector demonstrating sustained pricing resilience amidst structural capital inflows.
                </p>
              </div>
            </div>

            {/* Avg Yield Card */}
            <div className="bg-[#FFFFFF] rounded-sm p-6 sm:p-7 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] border border-[#1A1A1A]/10 flex flex-col justify-between">
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-2">
                  Average Gross Yield
                </span>
                <div className="font-serif text-[44px] font-light text-[#8C7355] leading-none mb-4">
                  3.8%
                </div>

                <div className="border-t border-[#1A1A1A]/10 pt-3 space-y-2 font-serif text-[14px]">
                  <div className="flex justify-between items-center text-[#1A1A1A]/80">
                    <span>Core Central Region (CCR)</span>
                    <span className="font-sans font-semibold text-xs text-[#1A1A1A]">2.9%</span>
                  </div>
                  <div className="flex justify-between items-center text-[#1A1A1A]/80">
                    <span>Rest of Central Region (RCR)</span>
                    <span className="font-sans font-semibold text-xs text-[#1A1A1A]">3.4%</span>
                  </div>
                  <div className="flex justify-between items-center text-[#1A1A1A]/80">
                    <span>Outside Central Region (OCR)</span>
                    <span className="font-sans font-semibold text-xs text-[#1A1A1A]">4.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proximity Value Hotspots Section (12 cols) */}
          <div className="lg:col-span-12 bg-[#FFFFFF] rounded-sm p-6 sm:p-8 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] border border-[#1A1A1A]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-1">
                  Spatial Density Analysis
                </span>
                <h2 className="font-serif text-[24px] sm:text-[28px] font-light text-[#1A1A1A]">
                  Proximity Value Hotspots
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="view-full-map-btn"
                  onClick={() => setShowFullMapModal(true)}
                  className="px-4 py-2 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] rounded-sm font-sans text-[10px] font-bold tracking-[0.2em] uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers size={14} />
                  <span>View Full Map</span>
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative rounded-sm overflow-hidden bg-[#1A1A1A] aspect-[16/9] sm:aspect-[21/9] w-full border border-[#1A1A1A]/20 shadow-inner group">
              {/* Satellite / Urban Heatmap image */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk2UWhEesWoNyEGYS9KQsDGxFrenqPAA1nY2xgCu10klpjkrNBieweFLrrPB7e68yl_rNIQVIUoMjzqam16I2Zvc4K3LipQeUkp8DbhFGFwsziRmrCfzXPSoBLOz816vABSjNzUaezlhieTDic8E0vetkRQzKqtAOCpwtGYU1tELW_uB1tp-ndnuJfUfxKhyCyM93P_f8fR9md9cZ2CVH13wCkX8CK_s-XnzpNjbS2kRyXdVjhwmfsyA"
                alt="Proximity Value Density Heatmap"
                className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
              />

              {/* Clickable Hotspot Pins */}
              {HOTSPOT_AREAS.map((spot) => {
                const isSelected = selectedHotspot?.id === spot.id;
                return (
                  <button
                    key={spot.id}
                    id={`hotspot-pin-${spot.id}`}
                    onClick={() => setSelectedHotspot(spot)}
                    style={{ left: `${spot.xPct}%`, top: `${spot.yPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 p-1.5 group/pin cursor-pointer focus:outline-none z-20"
                    title={spot.name}
                  >
                    <span className="relative flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8C7355] opacity-60" />
                      <span className={`relative inline-flex rounded-full h-6 w-6 items-center justify-center border border-white text-[10px] font-bold shadow-lg transition-transform hover:scale-125 ${
                        isSelected ? 'bg-[#8C7355] text-white scale-125 ring-2 ring-[#F5F2ED]' : 'bg-[#1A1A1A] text-white'
                      }`}>
                        <MapPin size={12} />
                      </span>
                    </span>

                    {/* Compact preview pin tag */}
                    <span className="absolute top-7 left-1/2 -translate-x-1/2 bg-[#1A1A1A]/90 text-[#F5F2ED] font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-sm whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none shadow-md">
                      {spot.name}: ${spot.avgPsf} psf
                    </span>
                  </button>
                );
              })}

              {/* Floating Legend / Value Density gradient scale */}
              <div className="absolute bottom-4 left-4 bg-[#F5F2ED]/95 backdrop-blur-md rounded-sm p-3 sm:p-4 border border-[#1A1A1A]/10 shadow-md text-[#1A1A1A] max-w-xs z-10">
                <div className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7355] mb-2 flex items-center gap-1.5">
                  <Info size={13} />
                  <span>Value Density Index</span>
                </div>
                <div className="h-2 w-44 sm:w-56 rounded-none bg-gradient-to-r from-amber-200 via-[#8C7355] to-[#1A1A1A] mb-1.5" />
                <div className="flex justify-between font-sans text-[9px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60">
                  <span>Low ($1,200 psf)</span>
                  <span>Moderate</span>
                  <span>High ($4,000+ psf)</span>
                </div>
              </div>

              {/* Interactive Hotspot Inspector Card (when pin clicked) */}
              {selectedHotspot && (
                <div className="absolute top-4 right-4 bg-[#F5F2ED] rounded-sm p-5 border border-[#1A1A1A]/15 shadow-2xl text-[#1A1A1A] max-w-sm z-30 animate-fadeIn">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block">
                        {selectedHotspot.density} Density Corridor
                      </span>
                      <h4 className="font-serif text-[20px] font-normal text-[#1A1A1A] leading-snug">
                        {selectedHotspot.name}
                      </h4>
                      <p className="font-sans text-[11px] text-[#1A1A1A]/60">{selectedHotspot.subzone}</p>
                    </div>
                    <button
                      onClick={() => setSelectedHotspot(null)}
                      className="p-1 text-[#1A1A1A]/60 hover:text-[#1A1A1A] cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-[#FFFFFF] p-3 rounded-sm border border-[#1A1A1A]/10 my-3 text-[12px]">
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/60">Avg Transaction</span>
                      <div className="font-serif font-medium text-[16px] text-[#1A1A1A]">${selectedHotspot.avgPsf} psf</div>
                    </div>
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/60">YoY Appreciation</span>
                      <div className="font-serif font-medium text-[16px] text-[#8C7355]">+{selectedHotspot.yoyGrowth}%</div>
                    </div>
                  </div>

                  <p className="font-serif text-[13px] text-[#1A1A1A]/80 leading-relaxed mb-3">
                    {selectedHotspot.highlights}
                  </p>

                  <button
                    onClick={() => {
                      setSelectedHotspot(null);
                      onOpenBookAppraisal();
                    }}
                    className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
                  >
                    Request Submarket Dossier
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* District Benchmark & Price Index Explorer (Spec Section 3 & 5) */}
        <div className="mt-14 space-y-6">
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-sm border border-[#1A1A1A]/10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1A1A1A]/10 pb-6 mb-6">
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-1">
                  Location Specific Price Index Explorer • Spec Section 3 & 5
                </span>
                <h3 className="font-serif text-[26px] sm:text-[30px] font-light text-[#1A1A1A]">
                  Singapore National vs District Benchmark Index
                </h3>
                <p className="font-serif text-[14px] text-[#1A1A1A]/70 max-w-2xl mt-1">
                  Compare the official National Property Price Index against individual planning sectors. Query minimum, median, and maximum transaction prices across Core Central, Fringe, and Suburban zones.
                </p>
              </div>

              {/* Selector Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/70 mb-1">
                    District
                  </label>
                  <select
                    value={selectedExplorerDistrict}
                    onChange={(e) => setSelectedExplorerDistrict(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#1A1A1A]/20 rounded-xs px-3 py-2 text-sm font-serif text-[#1A1A1A] cursor-pointer"
                  >
                    <optgroup label="Core Central Region (CCR)">
                      <option value="D01">D01 - Marina Bay / Raffles</option>
                      <option value="D02">D02 - Chinatown / Tanjong Pagar</option>
                      <option value="D04">D04 - Sentosa / Harbourfront</option>
                      <option value="D09">D09 - Orchard / River Valley</option>
                      <option value="D10">D10 - Bukit Timah / Holland</option>
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

                <div>
                  <label className="block font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/70 mb-1">
                    Property Type
                  </label>
                  <select
                    value={selectedExplorerPropType}
                    onChange={(e) => setSelectedExplorerPropType(e.target.value as any)}
                    className="bg-[#FAF8F5] border border-[#1A1A1A]/20 rounded-xs px-3 py-2 text-sm font-serif text-[#1A1A1A] cursor-pointer"
                  >
                    <option value="private">Private Condominium</option>
                    <option value="landed">Landed Housing</option>
                    <option value="hdb">HDB Resale</option>
                  </select>
                </div>

                <div>
                  <label className="block font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/70 mb-1">
                    Floor Area (Sqft)
                  </label>
                  <input
                    type="number"
                    value={explorerSqft}
                    onChange={(e) => setExplorerSqft(Number(e.target.value) || 1200)}
                    className="w-24 bg-[#FAF8F5] border border-[#1A1A1A]/20 rounded-xs px-3 py-2 text-sm font-serif text-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>

            <PropertyPriceIndexCard stats={explorerStats} sqft={explorerSqft} />

            {/* Official Singapore URA DataService Integration */}
            <div className="mt-8">
              <URATransactionFeed
                district={selectedExplorerDistrict}
                districtName={explorerStats.districtName}
              />
            </div>
          </div>
        </div>

        {/* Forward Trajectory CTA Section for Buyers */}
        {onNavigateTab && (
          <div className="mt-12 bg-[#FFFFFF] rounded-sm p-8 sm:p-10 border border-[#1A1A1A]/10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#8C7355]" />
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355]">
                  Home Buyer Analytical Toolkit
                </span>
              </div>
              <h3 className="font-serif text-[24px] sm:text-[28px] font-light text-[#1A1A1A] mb-2">
                Translate Macro Trends into Personal Property Projections
              </h3>
              <p className="font-serif text-[15px] text-[#1A1A1A]/70 leading-relaxed">
                Connect the historical market indexes and district CAGR trends directly to your prospective acquisition. Simulate 3 to 15-year equity growth, cash flow, and risk corridors.
              </p>
            </div>
            <button
              id="market-trends-to-trajectory-btn"
              onClick={() => {
                onNavigateTab('trajectory');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="shrink-0 bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] px-6 py-3.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Trajectory Predictor</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </main>

      {/* Full Map Modal */}
      {showFullMapModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5F2ED] rounded-sm max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-[#1A1A1A]/20 relative flex flex-col max-h-[92vh]">
            <div className="flex justify-between items-center pb-4 border-b border-[#1A1A1A]/10">
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-1">
                  Cartographic Dossier
                </span>
                <h3 className="font-serif text-[28px] font-light text-[#1A1A1A]">
                  Spatial Density & Urban Valuation Map
                </h3>
                <p className="font-serif text-[14px] text-[#1A1A1A]/70">
                  High-resolution geospatial transaction cluster overlay across core metro sectors.
                </p>
              </div>
              <button
                onClick={() => setShowFullMapModal(false)}
                className="p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-full hover:bg-[#E2DFD8]/40 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative flex-grow overflow-hidden rounded-sm mt-4 bg-black border border-[#1A1A1A]/10">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk2UWhEesWoNyEGYS9KQsDGxFrenqPAA1nY2xgCu10klpjkrNBieweFLrrPB7e68yl_rNIQVIUoMjzqam16I2Zvc4K3LipQeUkp8DbhFGFwsziRmrCfzXPSoBLOz816vABSjNzUaezlhieTDic8E0vetkRQzKqtAOCpwtGYU1tELW_uB1tp-ndnuJfUfxKhyCyM93P_f8fR9md9cZ2CVH13wCkX8CK_s-XnzpNjbS2kRyXdVjhwmfsyA"
                alt="Full Map"
                className="w-full h-full object-cover"
              />

              {HOTSPOT_AREAS.map((spot) => (
                <div
                  key={spot.id}
                  style={{ left: `${spot.xPct}%`, top: `${spot.yPct}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 bg-[#1A1A1A]/95 text-[#F5F2ED] border border-[#8C7355] px-3 py-1 rounded-sm text-[11px] font-serif flex items-center gap-1.5 shadow-lg"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C7355]" />
                  <span>{spot.name}: ${spot.avgPsf} psf</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 font-sans text-[11px] text-[#1A1A1A]/60">
              <span>Cartographic Data Sources: Urban Redevelopment Authority & Private Land Titles Registry</span>
              <button
                onClick={() => setShowFullMapModal(false)}
                className="bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] px-5 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
