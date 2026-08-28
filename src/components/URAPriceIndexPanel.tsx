import React from 'react';
import { URAPriceIndex, URAPriceIndexSegment } from '../types';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

interface URAPriceIndexPanelProps {
  /** Supplied by the parent so the card and panel share one fetch. */
  data: URAPriceIndex | null;
  loading: boolean;
  /** Highlights the locality tile matching the district under valuation. */
  region?: 'CCR' | 'RCR' | 'OCR';
  /** Highlights Landed or Non-Landed to match the property being valued. */
  propertyType?: string;
}

const INK = '#8C7355';

/** Compact trend line for a stat tile - shape only, no axes. */
const Sparkline: React.FC<{ segment: URAPriceIndexSegment }> = ({ segment }) => {
  const values = segment.series.map((p) => p.index).filter((v): v is number => v !== null);
  if (values.length < 2) return null;

  const w = 100;
  const h = 26;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const d = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - lo) / span) * (h - 4) - 2}`)
    .join('L');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[26px] mt-2" preserveAspectRatio="none" aria-hidden="true">
      <path d={`M${d}`} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const Delta: React.FC<{ value: number | null; label: string }> = ({ value, label }) => {
  if (value === null) return null;
  const up = value > 0;
  const flat = value === 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const tone = flat ? 'text-[#1A1A1A]/60' : up ? 'text-emerald-700' : 'text-amber-700';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-sans font-bold ${tone}`}>
      <Icon size={12} />
      {up ? '+' : ''}
      {value.toFixed(1)}%
      <span className="font-normal text-[#1A1A1A]/50 ml-0.5">{label}</span>
    </span>
  );
};

export const URAPriceIndexPanel: React.FC<URAPriceIndexPanelProps> = ({ data, loading, region, propertyType }) => {
  const isLanded = (propertyType || '').toLowerCase().includes('landed');
  const highlighted = (seg: URAPriceIndexSegment) => {
    if (seg.group === 'locality') return region ? seg.label === region : false;
    return isLanded ? seg.key === 'landed' : seg.key === 'nonLanded';
  };

  const byGroup = (g: 'type' | 'locality') => (data?.segments || []).filter((s) => s.group === g);

  const renderTile = (seg: URAPriceIndexSegment) => {
    const active = highlighted(seg);
    return (
      <div
        key={seg.key}
        className={`p-4 rounded-xs border transition-colors ${
          active
            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#F5F2ED]'
            : 'bg-[#FAF8F5] border-[#1A1A1A]/10 text-[#1A1A1A]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-sans text-[10px] font-bold uppercase tracking-[0.2em] ${
              active ? 'text-[#C5A880]' : 'text-[#1A1A1A]/60'
            }`}
          >
            {seg.label}
          </span>
          {active && (
            <span className="font-sans text-[8px] uppercase tracking-[0.15em] text-[#C5A880] shrink-0">
              Your selection
            </span>
          )}
        </div>
        <div className={`font-serif text-[30px] font-light mt-1 ${active ? 'text-[#F5F2ED]' : 'text-[#1A1A1A]'}`}>
          {seg.latest !== null ? seg.latest.toFixed(1) : '—'}
        </div>
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 ${active ? 'opacity-90' : ''}`}>
          <Delta value={seg.yoy} label="YoY" />
          <Delta value={seg.qoq} label="QoQ" />
        </div>
        {seg.group === 'locality' && (
          <span className={`block font-serif text-[11px] mt-1 ${active ? 'text-[#F5F2ED]/60' : 'text-[#1A1A1A]/55'}`}>
            {seg.fullLabel}
          </span>
        )}
        <Sparkline segment={seg} />
      </div>
    );
  };

  return (
    <div className="p-5 bg-[#FFFFFF] rounded-xs border border-[#1A1A1A]/15 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
        <div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7355] block">
            Official URA Property Price Index
          </span>
          <h4 className="font-serif text-[18px] text-[#1A1A1A] font-normal">
            By Property Type & Market Segment
          </h4>
        </div>
        {data?.latestQuarter && (
          <div className="text-right shrink-0">
            <span className="block font-sans text-[11px] font-bold text-[#1A1A1A]">
              {data.latestQuarter}
            </span>
            <span className="block text-[10px] font-sans text-[#1A1A1A]/55 uppercase tracking-wide">
              Base {data.basePeriod}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-[150px] flex items-center justify-center font-serif text-sm text-[#1A1A1A]/50">
          Loading official URA price index…
        </div>
      ) : !data || data.segments.length === 0 ? (
        <div className="h-[150px] flex items-center justify-center gap-2 font-serif text-sm text-[#1A1A1A]/60">
          <AlertCircle className="w-4 h-4" />
          Price index unavailable right now.
        </div>
      ) : (
        <>
          <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/50 mb-2">
            By Property Type — All Singapore
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">{byGroup('type').map(renderTile)}</div>

          <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/50 mb-2">
            By Market Segment — Non-Landed
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{byGroup('locality').map(renderTile)}</div>

          <p className="mt-4 pt-3 border-t border-[#1A1A1A]/8 font-serif text-[11px] text-[#1A1A1A]/55">
            Published quarterly by the {data.source.publisher}, distributed via {data.source.distributedVia}.{' '}
            {data.source.note} Sparklines show the last {data.quarters.length} quarters.
          </p>
        </>
      )}
    </div>
  );
};
