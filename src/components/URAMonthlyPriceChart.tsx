import React, { useState, useEffect, useMemo, useRef } from 'react';
import { URAMonthlyTrend, URAMonthlyPricePoint } from '../types';
import { fetchURAMonthlyTrend } from '../services/uraService';
import { LineChart, Table2, AlertCircle } from 'lucide-react';

interface URAMonthlyPriceChartProps {
  district: string;
  districtName?: string;
  propertyType?: string;
  saleType?: string;
  months?: number;
}

// Single hue, light -> dark: the range band recedes, the median line leads.
const BAND_FILL = '#C5A880';
const MEDIAN_INK = '#8C7355';
const GRID_INK = 'rgba(26,26,26,0.08)';
const AXIS_INK = 'rgba(26,26,26,0.55)';

// viewBox units - the SVG scales to its container.
const VB_W = 760;
const VB_H = 300;
const PAD = { top: 20, right: 24, bottom: 40, left: 68 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;

// Companion median panel
const MED_VB_H = 132;
const MED_PAD_TOP = 16;
const MED_PLOT_H = MED_VB_H - MED_PAD_TOP - 32;

function formatPrice(v: number | null): string {
  if (v === null) return '—';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

function formatAxis(v: number): string {
  if (v === 0) return '$0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(v / 1_000)}K`;
}

/**
 * A nice round domain + ticks that hugs the data instead of anchoring at zero.
 * Zero-anchoring a $0.8M-$14M price axis throws away most of the plot height.
 */
function niceDomain(min: number, max: number, count = 4) {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = ([1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) as number) || mag * 10;
  const yMin = Math.floor(min / step) * step;
  const yMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + step * 0.5; v += step) ticks.push(Math.round(v));
  return { yMin, yMax, ticks };
}

/** Build x/y scales for a given value domain over the shared month axis. */
function buildScale(points: URAMonthlyPricePoint[], lo: number, hi: number, plotH: number, top: number) {
  const { yMin, yMax, ticks } = niceDomain(lo, hi);
  const x = (i: number) =>
    PAD.left + (points.length === 1 ? PLOT_W / 2 : (i / (points.length - 1)) * PLOT_W);
  const y = (v: number) => top + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;
  return { x, y, ticks, yMin, yMax };
}

export const URAMonthlyPriceChart: React.FC<URAMonthlyPriceChartProps> = ({
  district,
  districtName,
  propertyType = 'all',
  saleType = 'all',
  months = 6,
}) => {
  const [trend, setTrend] = useState<URAMonthlyTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchURAMonthlyTrend(district, { months, propertyType, saleType })
      .then((res) => {
        if (!cancelled) setTrend(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [district, months, propertyType, saleType]);

  const points = trend?.months ?? [];
  const populated = points.filter((p) => p.medianPrice !== null);

  const scale = useMemo(() => {
    if (populated.length === 0) return null;
    const lo = Math.min(...populated.map((p) => p.minPrice as number));
    const hi = Math.max(...populated.map((p) => p.maxPrice as number));
    return buildScale(points, lo, hi, PLOT_H, PAD.top);
  }, [points, populated]);

  // The median moves within a few percent of the full min-max span, so on the
  // shared axis it flattens into a straight line. Give it a second panel at its
  // own resolution rather than a second y-scale on the same plot.
  const medianScale = useMemo(() => {
    if (populated.length === 0) return null;
    const meds = populated.map((p) => p.medianPrice as number);
    const lo = Math.min(...meds);
    const hi = Math.max(...meds);
    const pad = (hi - lo || hi * 0.05) * 0.35;
    return buildScale(points, lo - pad, hi + pad, MED_PLOT_H, MED_PAD_TOP);
  }, [points, populated]);

  // Band and median path, broken at months with no transactions so a gap
  // reads as "no data" rather than a straight interpolated line.
  const shapes = useMemo(() => {
    if (!scale) return { bands: [] as string[], lines: [] as string[] };
    const bands: string[] = [];
    const lines: string[] = [];
    let run: { p: URAMonthlyPricePoint; i: number }[] = [];

    const flush = () => {
      if (run.length === 0) return;
      const top = run.map(({ p, i }) => `${scale.x(i)},${scale.y(p.maxPrice as number)}`);
      const bottom = [...run]
        .reverse()
        .map(({ p, i }) => `${scale.x(i)},${scale.y(p.minPrice as number)}`);
      bands.push(`M${top.join('L')}L${bottom.join('L')}Z`);
      lines.push(
        `M${run.map(({ p, i }) => `${scale.x(i)},${scale.y(p.medianPrice as number)}`).join('L')}`
      );
      run = [];
    };

    points.forEach((p, i) => {
      if (p.medianPrice === null) flush();
      else run.push({ p, i });
    });
    flush();
    return { bands, lines };
  }, [points, scale]);

  const medianLines = useMemo(() => {
    if (!medianScale) return [] as string[];
    const segs: string[] = [];
    let run: string[] = [];
    const flush = () => {
      if (run.length > 0) segs.push(`M${run.join('L')}`);
      run = [];
    };
    points.forEach((p, i) => {
      if (p.medianPrice === null) flush();
      else run.push(`${medianScale.x(i)},${medianScale.y(p.medianPrice)}`);
    });
    flush();
    return segs;
  }, [points, medianScale]);

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const vbX = ((e.clientX - rect.left) / rect.width) * VB_W;
    const ratio = (vbX - PAD.left) / PLOT_W;
    const idx = Math.round(ratio * (points.length - 1));
    setHoverIdx(Math.max(0, Math.min(points.length - 1, idx)));
  };

  const active = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="p-5 sm:p-6 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-xs">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <div>
          <span className="block font-sans text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/70">
            Monthly Transacted Price Trend
          </span>
          <h4 className="font-serif text-[18px] sm:text-[20px] font-light text-[#1A1A1A] mt-1">
            {district} {districtName ? `(${districtName})` : ''} · Last {months} Months
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif text-[#1A1A1A]/80 hover:text-[#1A1A1A] bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A]/30 rounded-xs transition-colors cursor-pointer shrink-0"
        >
          {showTable ? <LineChart className="w-3.5 h-3.5" /> : <Table2 className="w-3.5 h-3.5" />}
          <span>{showTable ? 'View Chart' : 'View Table'}</span>
        </button>
      </div>

      {/* Legend - identity is never colour-alone; both keys are labelled. */}
      <div className="flex flex-wrap items-center gap-4 mt-3 mb-2">
        <span className="inline-flex items-center gap-1.5 font-serif text-[11px] text-[#1A1A1A]/70">
          <svg width="18" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="18" y2="4" stroke={MEDIAN_INK} strokeWidth="2" />
          </svg>
          Median price
        </span>
        <span className="inline-flex items-center gap-1.5 font-serif text-[11px] text-[#1A1A1A]/70">
          <svg width="18" height="10" aria-hidden="true">
            <rect x="0" y="1" width="18" height="8" fill={BAND_FILL} fillOpacity="0.35" />
          </svg>
          Min–max range
        </span>
      </div>

      {loading ? (
        <div className="h-[260px] flex items-center justify-center font-serif text-sm text-[#1A1A1A]/50">
          Loading URA monthly trend…
        </div>
      ) : populated.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center gap-2 font-serif text-sm text-[#1A1A1A]/60">
          <AlertCircle className="w-4 h-4" />
          No transactions recorded in {district} for this window.
        </div>
      ) : showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-serif text-[13px]">
            <caption className="sr-only">
              Monthly minimum, median and maximum transacted price for {district}
            </caption>
            <thead>
              <tr className="border-b border-[#1A1A1A]/15">
                {['Month', 'Txns', 'Min', 'Median', 'Max', 'Median PSF'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="py-2 pr-4 font-sans text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/70 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.sortKey} className="border-b border-[#1A1A1A]/8">
                  <th scope="row" className="py-2 pr-4 font-serif font-normal whitespace-nowrap">
                    {p.label}
                  </th>
                  <td className="py-2 pr-4 text-[#1A1A1A]/70">{p.transactionCount || '—'}</td>
                  <td className="py-2 pr-4">{formatPrice(p.minPrice)}</td>
                  <td className="py-2 pr-4 font-medium">{formatPrice(p.medianPrice)}</td>
                  <td className="py-2 pr-4">{formatPrice(p.maxPrice)}</td>
                  <td className="py-2 pr-4 text-[#1A1A1A]/70">
                    {p.medianPsf ? `$${p.medianPsf.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full h-auto touch-none"
            role="img"
            aria-label={`Monthly minimum, median and maximum transacted price for ${district} over the last ${months} months`}
            onPointerMove={handleMove}
            onPointerLeave={() => setHoverIdx(null)}
          >
            {/* Recessive gridlines + y axis */}
            {scale?.ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  y1={scale.y(t)}
                  x2={VB_W - PAD.right}
                  y2={scale.y(t)}
                  stroke={GRID_INK}
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 10}
                  y={scale.y(t) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill={AXIS_INK}
                  fontFamily="ui-serif, Georgia, serif"
                >
                  {formatAxis(t)}
                </text>
              </g>
            ))}

            {/* Min-max range band */}
            {shapes.bands.map((d, i) => (
              <path key={`band-${i}`} d={d} fill={BAND_FILL} fillOpacity="0.28" />
            ))}

            {/* Hover crosshair, behind the marks */}
            {active && scale && active.medianPrice !== null && hoverIdx !== null && (
              <line
                x1={scale.x(hoverIdx)}
                y1={PAD.top}
                x2={scale.x(hoverIdx)}
                y2={PAD.top + PLOT_H}
                stroke={MEDIAN_INK}
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.5"
              />
            )}

            {/* Median line */}
            {shapes.lines.map((d, i) => (
              <path
                key={`line-${i}`}
                d={d}
                fill="none"
                stroke={MEDIAN_INK}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Median markers - 2px surface ring keeps them legible over the band */}
            {scale &&
              points.map((p, i) =>
                p.medianPrice === null ? null : (
                  <circle
                    key={p.sortKey}
                    cx={scale.x(i)}
                    cy={scale.y(p.medianPrice)}
                    r={hoverIdx === i ? 5.5 : 4}
                    fill={MEDIAN_INK}
                    stroke="#FAF8F5"
                    strokeWidth="2"
                  />
                )
              )}

            {/* X axis month labels */}
            {scale &&
              points.map((p, i) => (
                <text
                  key={`x-${p.sortKey}`}
                  x={scale.x(i)}
                  y={VB_H - 16}
                  textAnchor="middle"
                  fontSize="11"
                  fill={AXIS_INK}
                  fontFamily="ui-serif, Georgia, serif"
                >
                  {p.shortLabel}
                  <tspan fontSize="9" opacity="0.75">
                    {' '}
                    {String(p.year).slice(2)}
                  </tspan>
                </text>
              ))}
          </svg>

          {/* Companion panel: the median at its own resolution. Same x axis,
              its own y domain - two single-axis charts, never a dual axis. */}
          {medianScale && (
            <div className="mt-1 pt-3 border-t border-[#1A1A1A]/8">
              <span className="block font-sans text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/70 mb-1">
                Median, zoomed · {formatPrice(Math.min(...populated.map((p) => p.medianPrice as number)))}–
                {formatPrice(Math.max(...populated.map((p) => p.medianPrice as number)))}
              </span>
              <svg
                viewBox={`0 0 ${VB_W} ${MED_VB_H}`}
                className="w-full h-auto touch-none"
                role="img"
                aria-label={`Median transacted price for ${district}, shown at its own scale`}
                onPointerMove={handleMove}
                onPointerLeave={() => setHoverIdx(null)}
              >
                {medianScale.ticks.map((t) => (
                  <g key={`m-${t}`}>
                    <line
                      x1={PAD.left}
                      y1={medianScale.y(t)}
                      x2={VB_W - PAD.right}
                      y2={medianScale.y(t)}
                      stroke={GRID_INK}
                      strokeWidth="1"
                    />
                    <text
                      x={PAD.left - 10}
                      y={medianScale.y(t) + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill={AXIS_INK}
                      fontFamily="ui-serif, Georgia, serif"
                    >
                      {formatAxis(t)}
                    </text>
                  </g>
                ))}

                {hoverIdx !== null && points[hoverIdx]?.medianPrice !== null && (
                  <line
                    x1={medianScale.x(hoverIdx)}
                    y1={MED_PAD_TOP}
                    x2={medianScale.x(hoverIdx)}
                    y2={MED_PAD_TOP + MED_PLOT_H}
                    stroke={MEDIAN_INK}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  />
                )}

                {medianLines.map((d, i) => (
                  <path
                    key={`ml-${i}`}
                    d={d}
                    fill="none"
                    stroke={MEDIAN_INK}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {points.map((p, i) =>
                  p.medianPrice === null ? null : (
                    <circle
                      key={`mc-${p.sortKey}`}
                      cx={medianScale.x(i)}
                      cy={medianScale.y(p.medianPrice)}
                      r={hoverIdx === i ? 5.5 : 4}
                      fill={MEDIAN_INK}
                      stroke="#FAF8F5"
                      strokeWidth="2"
                    />
                  )
                )}

                {points.map((p, i) => (
                  <text
                    key={`mx-${p.sortKey}`}
                    x={medianScale.x(i)}
                    y={MED_VB_H - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill={AXIS_INK}
                    fontFamily="ui-serif, Georgia, serif"
                  >
                    {p.shortLabel}
                  </text>
                ))}
              </svg>
            </div>
          )}

          {/* Tooltip */}
          {active && scale && hoverIdx !== null && (
            <div
              className="pointer-events-none absolute z-10 min-w-[168px] bg-[#1A1A1A] text-[#F5F2ED] px-3 py-2 rounded-xs shadow-lg"
              style={{
                left: `${(scale.x(hoverIdx) / VB_W) * 100}%`,
                top: 8,
                transform:
                  hoverIdx > points.length / 2 ? 'translateX(-108%)' : 'translateX(8%)',
              }}
            >
              <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C5A880]">
                {active.label}
              </div>
              {active.medianPrice === null ? (
                <div className="font-serif text-xs mt-1 text-[#F5F2ED]/70">No transactions</div>
              ) : (
                <>
                  <dl className="mt-1.5 space-y-0.5 font-serif text-[12px]">
                    {(
                      [
                        ['Max', active.maxPrice],
                        ['Median', active.medianPrice],
                        ['Min', active.minPrice],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="text-[#F5F2ED]/65">{k}</dt>
                        <dd className={k === 'Median' ? 'font-medium' : ''}>{formatPrice(v)}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-1.5 pt-1.5 border-t border-[#F5F2ED]/15 font-serif text-[11px] text-[#F5F2ED]/65">
                    {active.transactionCount.toLocaleString()} transactions
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <p className="mt-3 font-serif text-[11px] text-[#1A1A1A]/55">
        Aggregated from official URA contract records. Window anchors on the latest published
        contract month, not today — URA publishes with a reporting lag.
      </p>
    </div>
  );
};
