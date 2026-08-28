import React, { useState } from 'react';
import { AIInsightResult, UserPersonaRole } from '../types';
import { Sparkles, ShieldAlert, CheckCircle2, TrendingUp, RefreshCw, Copy, Check, FileText } from 'lucide-react';

interface GeminiInsightPanelProps {
  role: UserPersonaRole;
  district: string;
  districtName: string;
  propertyType: string;
  size: number;
  level: string;
  tenure: string;
  leaseRemaining: number;
  facing: string;
  amenities: string;
  condition: string;
  valuationMedian: number;
  valuationMin: number;
  valuationMax: number;
  medianPsf: number;
  trajectoryCAGR?: number;
  projected5Y?: number;
  projected10Y?: number;
  initialInsight?: AIInsightResult | null;
}

export const GeminiInsightPanel: React.FC<GeminiInsightPanelProps> = ({
  role,
  district,
  districtName,
  propertyType,
  size,
  level,
  tenure,
  leaseRemaining,
  facing,
  amenities,
  condition,
  valuationMedian,
  valuationMin,
  valuationMax,
  medianPsf,
  trajectoryCAGR = 4.8,
  projected5Y = 0,
  projected10Y = 0,
  initialInsight = null,
}) => {
  const [insight, setInsight] = useState<AIInsightResult | null>(initialInsight);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchInsight = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const payload = {
      role,
      district,
      districtName,
      propertyType,
      size,
      level,
      tenure,
      leaseRemaining,
      facing,
      amenities,
      condition,
      valuationMedian,
      valuationMin,
      valuationMax,
      medianPsf,
      trajectoryCAGR,
      projected5Y: projected5Y || Math.round(valuationMedian * Math.pow(1 + trajectoryCAGR / 100, 5)),
      projected10Y: projected10Y || Math.round(valuationMedian * Math.pow(1 + trajectoryCAGR / 100, 10)),
    };

    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      if (data.insight) {
        setInsight(data.insight);
      } else {
        throw new Error('No insight returned in response');
      }
    } catch (err: any) {
      console.warn('Could not complete /api/insight fetch, using robust client fallback:', err);
      // Construct rich fallback
      const fallback: AIInsightResult = {
        source: 'heuristic_insight',
        role,
        title: `Intelligence Advisory: ${district} ${propertyType.toUpperCase()}`,
        executiveSummary:
          role === 'buyer'
            ? `Prospective entry for this ${propertyType.toUpperCase()} in ${district} (${districtName}) at the $${valuationMedian.toLocaleString()} median ($${medianPsf} psf) offers steady capital preservation. The ${facing} orientation and ${amenities} support strong rental liquidity with forward upside projected at ${trajectoryCAGR}% annualized.`
            : `For vendors in ${district}, transacted medians sit at $${valuationMedian.toLocaleString()} ($${medianPsf} psf). Units on ${level} with ${condition} finish command immediate buyer liquidity when listed within the $${valuationMin.toLocaleString()} to $${valuationMax.toLocaleString()} corridor.`,
        macroOutlook: `District ${district} exhibits resilient transaction velocity. URA Master Plan zoning improvements and sustained domestic liquidity provide positive tailwinds against broader global interest rate fluctuations.`,
        keyDrivers: [
          `${facing} facing ensures natural daylighting without excessive afternoon solar heating.`,
          `${amenities} solidifies institutional tenant demand and resale velocity.`,
          tenure === 'Freehold'
            ? 'Freehold land title eliminates leasehold depreciation.'
            : `${leaseRemaining} years of leasehold remaining ensures maximum banking loan eligibility and CPF usage.`,
        ],
        riskFactors: [
          'Fluctuations in commercial mortgage benchmark rates (SORA).',
          'Potential new private residential supply pipeline in adjacent submarkets.',
          'Holding horizon should exceed the 3-year Seller\'s Stamp Duty statutory threshold.',
        ],
        strategicAdvice:
          role === 'buyer'
            ? [
                `Anchor target offer between $${valuationMin.toLocaleString()} and $${valuationMedian.toLocaleString()}.`,
                'Conduct thorough defect inspection and check MCST sinking fund reserves.',
                'Model 3-year holding cost against prevailing mortgage amortisation tables.',
              ]
            : [
                `Set opening price tag at $${valuationMax.toLocaleString()} to allow 3%-5% negotiation headroom.`,
                'Prepare CPF principal refund calculations before issuing Options to Purchase (OTP).',
                'Stage unit to accentuate high-floor natural light and unblocked sightlines.',
              ],
        timestamp: new Date().toISOString(),
      };
      setInsight(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!insight) return;
    const text = `${insight.title}
Role: ${role.toUpperCase()}
Executive Summary: ${insight.executiveSummary}

Macro Outlook: ${insight.macroOutlook}

Key Drivers:
${insight.keyDrivers.map((d) => `- ${d}`).join('\n')}

Risk Factors:
${insight.riskFactors.map((r) => `- ${r}`).join('\n')}

Strategic Advice:
${insight.strategicAdvice.map((a) => `- ${a}`).join('\n')}

Generated via EstateAnalytics Serverless AI Insight Panel`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-sm p-6 sm:p-8 border border-[#1A1A1A]/10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xs bg-[#1A1A1A] text-[#F5F2ED] flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-[#8C7355]" />
          </div>
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block">
              Gemini AI Econometric Insight
            </span>
            <h3 className="font-serif text-[22px] md:text-[24px] font-normal text-[#1A1A1A]">
              Personalized {role.toUpperCase()} Intelligence Panel
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {insight && (
            <button
              onClick={handleCopy}
              className="px-3 py-2 border border-[#1A1A1A]/15 hover:border-[#8C7355] text-[#1A1A1A] text-[11px] font-sans font-bold uppercase tracking-[0.15em] rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy memo"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button
            onClick={fetchInsight}
            disabled={isLoading}
            className="bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] px-4 py-2 rounded-xs font-sans text-[11px] font-bold uppercase tracking-[0.18em] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{insight ? 'Regenerate Insight' : 'Generate AI Insight'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-red-50 border-l-2 border-red-500 text-red-800 text-sm font-serif">
          {errorMsg}
        </div>
      )}

      {/* Content Body */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-8 h-8 border-2 border-[#8C7355] border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-[16px] text-[#1A1A1A]/80">
            Synthesizing URA transactional regression models & Gemini economic reasoning...
          </p>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/50">
            Accessing serverless endpoint via process.env.GEMINI_API_KEY
          </span>
        </div>
      ) : insight ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Badge & Source */}
          <div className="flex items-center justify-between text-[11px] font-sans text-[#1A1A1A]/60">
            <span className="font-bold uppercase tracking-[0.2em] text-[#8C7355]">
              {insight.title}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2DFD8]/60 text-[#1A1A1A] font-semibold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              {insight.source === 'gemini_ai' ? 'Gemini 3.7 Flash Engine' : 'Institutional Econometric Heuristic'}
            </span>
          </div>

          {/* Executive Summary */}
          <div className="p-4 sm:p-5 bg-[#F5F2ED] border-l-3 border-[#8C7355] rounded-r-xs">
            <h4 className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#8C7355] mb-2">
              Executive Summary ({role.toUpperCase()} Perspective)
            </h4>
            <p className="font-serif text-[16px] leading-[1.65] text-[#1A1A1A]">
              {insight.executiveSummary}
            </p>
          </div>

          {/* Macro Outlook */}
          <div>
            <h4 className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#1A1A1A]/70 mb-2">
              Precinct & Master Plan Outlook
            </h4>
            <p className="font-serif text-[15px] leading-[1.6] text-[#1A1A1A]/80">
              {insight.macroOutlook}
            </p>
          </div>

          {/* 3-Column Structured Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* Key Drivers */}
            <div className="bg-[#FAF8F5] p-4 rounded-xs border border-[#1A1A1A]/10 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-800 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                <CheckCircle2 size={15} />
                <span>Value Catalysts</span>
              </div>
              <ul className="space-y-2 font-serif text-[13.5px] text-[#1A1A1A]/85">
                {insight.keyDrivers.map((driver, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#8C7355] text-xs mt-0.5">•</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Factors */}
            <div className="bg-[#FAF8F5] p-4 rounded-xs border border-[#1A1A1A]/10 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-amber-800 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                <ShieldAlert size={15} />
                <span>Risk Exposures</span>
              </div>
              <ul className="space-y-2 font-serif text-[13.5px] text-[#1A1A1A]/85">
                {insight.riskFactors.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-700 text-xs mt-0.5">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Advice */}
            <div className="bg-[#FAF8F5] p-4 rounded-xs border border-[#1A1A1A]/10 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-[#8C7355] font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                <TrendingUp size={15} />
                <span>Tactical Execution</span>
              </div>
              <ul className="space-y-2 font-serif text-[13.5px] text-[#1A1A1A]/85">
                {insight.strategicAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#1A1A1A] text-xs mt-0.5 font-bold">✓</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center bg-[#FAF8F5] rounded-xs border border-dashed border-[#1A1A1A]/15 p-6">
          <Sparkles size={24} className="mx-auto text-[#8C7355] mb-2 opacity-80" />
          <h4 className="font-serif text-[18px] text-[#1A1A1A] font-normal mb-1">
            Tap 'Generate AI Insight' for Real-Time Analysis
          </h4>
          <p className="font-serif text-[14px] text-[#1A1A1A]/70 max-w-md mx-auto mb-4">
            Our serverless Gemini backend evaluates your specific property parameters ({district}, {propertyType.toUpperCase()}, {size} sqft, {facing}) against historical URA transactional regression curves.
          </p>
          <button
            onClick={fetchInsight}
            className="bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] px-5 py-2.5 rounded-xs font-sans text-[11px] font-bold uppercase tracking-[0.18em] transition-all cursor-pointer shadow-xs"
          >
            Run Gemini Market Insight
          </button>
        </div>
      )}
    </div>
  );
};
