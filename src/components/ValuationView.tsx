import React, { useState } from 'react';
import { TabType, ValuationFormValues, ValuationResult, TrajectoryPredictionParams } from '../types';
import { ArrowRight, CheckCircle2, ChevronRight, Share2, Bookmark, Sparkles, TrendingUp, LineChart } from 'lucide-react';

interface ValuationViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenBookAppraisal: (prefillData?: Partial<ValuationFormValues>) => void;
  onSaveValuation: (result: ValuationResult, values: ValuationFormValues) => void;
  onPredictTrajectory?: (params: Partial<TrajectoryPredictionParams>) => void;
}

export const ValuationView: React.FC<ValuationViewProps> = ({
  onNavigateTab,
  onOpenBookAppraisal,
  onSaveValuation,
  onPredictTrajectory,
}) => {
  const [formValues, setFormValues] = useState<ValuationFormValues>({
    propertyType: '',
    size: 1200,
    facing: '',
    transportProximity: '',
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<ValuationResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.propertyType) {
      setFormError('Please select a property type.');
      return;
    }
    if (!formValues.size || Number(formValues.size) <= 0) {
      setFormError('Please provide a valid property size.');
      return;
    }
    if (!formValues.facing) {
      setFormError('Please select the property facing direction.');
      return;
    }
    if (!formValues.transportProximity) {
      setFormError('Please select proximity to public transport.');
      return;
    }

    setFormError(null);
    setIsCalculating(true);

    // Realistic valuation formula simulation based on Singapore/global prime market metrics
    setTimeout(() => {
      const sizeNum = Number(formValues.size);
      let basePsf = 1450;
      if (formValues.propertyType === 'private') basePsf = 1850;
      if (formValues.propertyType === 'landed') basePsf = 2400;
      if (formValues.propertyType === 'hdb') basePsf = 680;

      // Facing adjustments
      let facingMultiplier = 1.0;
      let facingFactorPct = 0;
      if (formValues.facing === 'north' || formValues.facing === 'south') {
        facingMultiplier = 1.04; // avoid west sun
        facingFactorPct = 4.0;
      } else if (formValues.facing === 'east') {
        facingMultiplier = 1.02; // morning sun
        facingFactorPct = 2.0;
      } else if (formValues.facing === 'west') {
        facingMultiplier = 0.98; // afternoon sun
        facingFactorPct = -2.0;
      }

      // Transit adjustments
      let transitMultiplier = 1.0;
      let transitFactorPct = 0;
      if (formValues.transportProximity === '5') {
        transitMultiplier = 1.07;
        transitFactorPct = 7.0;
      } else if (formValues.transportProximity === '10') {
        transitMultiplier = 1.03;
        transitFactorPct = 3.0;
      } else {
        transitMultiplier = 0.98;
        transitFactorPct = -2.0;
      }

      const calculatedPsfMedian = Math.round(basePsf * facingMultiplier * transitMultiplier);
      const psfMin = Math.round(calculatedPsfMedian * 0.95);
      const psfMax = Math.round(calculatedPsfMedian * 1.05);

      const estimatedMedian = Math.round(calculatedPsfMedian * sizeNum);
      const estimatedMin = Math.round(psfMin * sizeNum);
      const estimatedMax = Math.round(psfMax * sizeNum);

      const annualYieldRate = formValues.propertyType === 'landed' ? 2.8 : 3.8;
      const monthlyRentalEstimate = Math.round((estimatedMedian * (annualYieldRate / 100)) / 12);

      const result: ValuationResult = {
        estimatedMin,
        estimatedMax,
        estimatedMedian,
        psfMin,
        psfMax,
        confidenceScore: 97.4,
        annualYieldRate,
        monthlyRentalEstimate,
        facingFactorPct,
        transitFactorPct,
        districtMultiplier: 1.15,
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      setCalculationResult(result);
      setIsCalculating(false);
      setShowResultModal(true);
      setSavedSuccess(false);
    }, 600);
  };

  const handleSaveResult = () => {
    if (calculationResult) {
      onSaveValuation(calculationResult, formValues);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-[#F5F2ED] pt-12 md:pt-20 pb-20 md:pb-28 border-b border-[#1A1A1A]/10">
        {/* Background Image with soft tone */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0 opacity-15 pointer-events-none mix-blend-multiply"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXdx5b7y4IyDp_uwJIUo9fX2KPJEXWpO-jqmlxEMdmkbvS_Anmw1vBc-Ch5kuJNAbDLcEVz0G-ESu7FqqOVYxv3OfanouPJwaTDtwllrc1_SbGddyLzueEIxGGsx4dySHwZiYGzuyeLon7RWSrWL1F3GAnzyPWFwXwMuE0GFqfRPT4hXt92zB-TEnOKCQOT9_YIS1b4dQ2ejvKcVLiUH4JZ0iVxfTImfPzwZNtUEytnbG-OB-e91Owag')`,
          }}
        />

        {/* Ambient Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5F2ED] via-[#F5F2ED]/90 to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Text */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
              Intelligence Monograph • Issue No. 042
            </span>
            <h1 className="font-serif text-[36px] sm:text-[44px] md:text-[52px] leading-[1.05] tracking-tight font-light text-[#1A1A1A]">
              Precise valuation <br className="hidden sm:inline" />
              <span className="italic font-normal">for the modern investor.</span>
            </h1>
            <div className="editorial-rule my-1" />
            <p className="text-[17px] md:text-[18px] leading-[1.65] text-[#1A1A1A]/80 max-w-md font-serif">
              Discover the true market value of your property with our advanced, data-driven appraisal algorithms and expert market insights.
            </p>

            <div className="pt-2 hidden sm:flex items-center gap-6 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C7355]" />
                <span>Live Transaction Ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />
                <span>97.4% Spatial Accuracy</span>
              </div>
            </div>
          </div>

          {/* Valuation Search Tool Card */}
          <div className="lg:col-span-7">
            <div className="bg-[#FFFFFF] rounded-sm p-6 sm:p-8 md:p-10 shadow-[0_15px_35px_-10px_rgba(26,26,26,0.06)] border border-[#1A1A1A]/10">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-6 sm:mb-8">
                <h2 className="font-serif text-[24px] sm:text-[28px] font-light text-[#1A1A1A] leading-[1.2]">
                  Property Market Rate Inquiry
                </h2>
                <span className="hidden sm:inline-flex font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-[#8C7355] bg-[#E2DFD8]/60 px-2.5 py-1 rounded-sm">
                  Instant Algorithmic Rate
                </span>
              </div>

              {formError && (
                <div className="mb-6 p-3 bg-[#E2DFD8]/50 border-l-2 border-[#8C7355] text-[#1A1A1A] font-serif text-[14px]">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Property Type */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="valuation-prop-type"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#1A1A1A]/80"
                  >
                    Property Type
                  </label>
                  <div className="relative">
                    <select
                      id="valuation-prop-type"
                      value={formValues.propertyType}
                      onChange={(e) => setFormValues({ ...formValues, propertyType: e.target.value })}
                      className="premium-input w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-sm p-3 text-[15px] font-serif text-[#1A1A1A] appearance-none cursor-pointer pr-10"
                    >
                      <option value="">Select type</option>
                      <option value="private">Private Condominium</option>
                      <option value="landed">Landed Estate</option>
                      <option value="hdb">HDB (Public Housing)</option>
                    </select>
                    <span
                      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 pointer-events-none text-[20px]"
                      data-icon="expand_more"
                    >
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Size */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="valuation-size"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#1A1A1A]/80"
                  >
                    Size (SQFT / SQM)
                  </label>
                  <input
                    id="valuation-size"
                    type="number"
                    value={formValues.size}
                    onChange={(e) =>
                      setFormValues({ ...formValues, size: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                    placeholder="e.g. 1200"
                    className="premium-input w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-sm p-3 text-[15px] font-serif text-[#1A1A1A] placeholder:text-[#1A1A1A]/30"
                  />
                </div>

                {/* Facing */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="valuation-facing"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#1A1A1A]/80"
                  >
                    Facing Orientation
                  </label>
                  <div className="relative">
                    <select
                      id="valuation-facing"
                      value={formValues.facing}
                      onChange={(e) => setFormValues({ ...formValues, facing: e.target.value })}
                      className="premium-input w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-sm p-3 text-[15px] font-serif text-[#1A1A1A] appearance-none cursor-pointer pr-10"
                    >
                      <option value="">Select facing</option>
                      <option value="north">North (Unobstructed Natural Light)</option>
                      <option value="south">South (Cool Cross-Breeze)</option>
                      <option value="east">East (Gentle Morning Sun)</option>
                      <option value="west">West (Sunset Panorama)</option>
                    </select>
                    <span
                      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 pointer-events-none text-[20px]"
                      data-icon="expand_more"
                    >
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Proximity to Transport */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="valuation-transit"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#1A1A1A]/80"
                  >
                    Transit Proximity
                  </label>
                  <div className="relative">
                    <select
                      id="valuation-transit"
                      value={formValues.transportProximity}
                      onChange={(e) => setFormValues({ ...formValues, transportProximity: e.target.value })}
                      className="premium-input w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-sm p-3 text-[15px] font-serif text-[#1A1A1A] appearance-none cursor-pointer pr-10"
                    >
                      <option value="">Select distance</option>
                      <option value="5">Under 5 mins walk (Direct / Sheltered)</option>
                      <option value="10">5-10 mins walk</option>
                      <option value="15">10+ mins walk</option>
                    </select>
                    <span
                      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 pointer-events-none text-[20px]"
                      data-icon="expand_more"
                    >
                      expand_more
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="md:col-span-2 mt-3">
                  <button
                    id="valuation-calculate-btn"
                    type="submit"
                    disabled={isCalculating}
                    className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-4 rounded-sm font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75"
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-[#F5F2ED] border-t-transparent rounded-full" />
                        Synthesizing Market Transactions...
                      </span>
                    ) : (
                      <>
                        <span>Calculate Valuation</span>
                        <span className="text-xs">→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-16 py-20 md:py-28">
        <div className="text-center mb-14 md:mb-16">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-2">
            Analytical Foundation
          </span>
          <h2 className="font-serif text-[32px] md:text-[40px] text-[#1A1A1A] font-light">
            Precision Meets Insight
          </h2>
          <div className="editorial-rule mx-auto my-4" />
          <p className="font-serif text-[17px] text-[#1A1A1A]/75 max-w-2xl mx-auto leading-relaxed">
            Our platform integrates millions of data points to deliver unparalleled accuracy in an ever-shifting market landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1: Real-time Valuations */}
          <div className="bg-[#FFFFFF] rounded-sm p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] border border-[#1A1A1A]/10 flex flex-col justify-between hover:border-[#8C7355] transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#E2DFD8]/60 flex items-center justify-center text-[#1A1A1A] mb-6">
                <span className="material-symbols-outlined text-[24px]" data-icon="monitoring">
                  monitoring
                </span>
              </div>
              <h3 className="font-serif text-[26px] font-normal text-[#1A1A1A] mb-3 group-hover:italic transition-all">
                Real-time Valuations
              </h3>
              <p className="font-serif text-[16px] leading-[1.65] text-[#1A1A1A]/75">
                Our proprietary algorithms constantly ingest live transactional data to ensure your property's appraisal reflects the exact pulse of the current market down to the minute.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#1A1A1A]/10">
              <button
                id="feature-explore-methodology-btn"
                onClick={() => onNavigateTab('about')}
                className="text-[#8C7355] hover:text-[#1A1A1A] font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore Methodology</span>
                <span className="text-xs">→</span>
              </button>
            </div>
          </div>

          {/* Feature 2: Expert Market Insights */}
          <div className="bg-[#FFFFFF] rounded-sm p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] border border-[#1A1A1A]/10 flex flex-col justify-between hover:border-[#8C7355] transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#E2DFD8]/60 flex items-center justify-center text-[#1A1A1A] mb-6">
                <span className="material-symbols-outlined text-[24px]" data-icon="lightbulb">
                  lightbulb
                </span>
              </div>
              <h3 className="font-serif text-[26px] font-normal text-[#1A1A1A] mb-3 group-hover:italic transition-all">
                Expert Market Insights
              </h3>
              <p className="font-serif text-[16px] leading-[1.65] text-[#1A1A1A]/75">
                Go beyond the numbers. Read exclusive reports, trend forecasts, and neighborhood analysis curated by top-tier real estate economists and architectural authorities.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#1A1A1A]/10">
              <button
                id="feature-read-reports-btn"
                onClick={() => onNavigateTab('trends')}
                className="text-[#8C7355] hover:text-[#1A1A1A] font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Read Latest Reports</span>
                <span className="text-xs">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full-width Trajectory Predictor Banner for Home Buyers */}
        <div className="mt-10 bg-[#1A1A1A] text-[#F5F2ED] rounded-sm p-8 md:p-12 border border-[#8C7355]/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl relative z-10">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-2">
              Forward Horizon Modeling
            </span>
            <h3 className="font-serif text-[28px] md:text-[34px] font-light text-[#F5F2ED] mb-3">
              Home Buyer Price Trajectory Predictor
            </h3>
            <p className="font-serif text-[15px] md:text-[16px] text-[#F5F2ED]/75 leading-relaxed">
              Will your prospective property compound, plateau, or accelerate? Simulate forward macroeconomic trajectories across 3 to 15 years with Monte Carlo corridors, cumulative rental returns, and mortgage equity projections.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              id="launch-trajectory-banner-btn"
              onClick={() => onNavigateTab('trajectory')}
              className="bg-[#8C7355] hover:bg-[#A38A6D] text-[#F5F2ED] px-7 py-4 rounded-sm font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <span>Launch Predictor</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Valuation Result Modal / Report */}
      {showResultModal && calculationResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F5F2ED] text-[#1A1A1A] rounded-sm max-w-2xl w-full p-6 sm:p-10 shadow-2xl border border-[#1A1A1A]/20 relative animate-scaleUp my-8">
            {/* Framed Inset Line */}
            <div className="absolute inset-3 border border-[#1A1A1A]/10 pointer-events-none rounded-xs" />

            <div className="relative z-10 flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-6">
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
                  Automated Valuation Report
                </span>
                <h3 className="font-serif text-[28px] font-light text-[#1A1A1A]">
                  Estimated Market Appraisal
                </h3>
              </div>
              <button
                id="close-valuation-modal-btn"
                onClick={() => setShowResultModal(false)}
                className="p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-full hover:bg-[#E2DFD8]/40 cursor-pointer"
                aria-label="Close valuation report"
              >
                <span className="material-symbols-outlined" data-icon="close">
                  close
                </span>
              </button>
            </div>

            {/* Estimated Value Hero Card */}
            <div className="relative z-10 bg-[#FFFFFF] rounded-sm p-6 border border-[#1A1A1A]/10 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                <span className="font-sans text-[10px] uppercase font-bold text-[#8C7355] tracking-[0.2em]">
                  Indicative Market Value
                </span>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-sm bg-[#E2DFD8] text-[#1A1A1A]">
                  {calculationResult.confidenceScore}% Algorithm Confidence
                </span>
              </div>

              <div className="font-serif text-[38px] sm:text-[46px] font-light text-[#1A1A1A] leading-none mb-2">
                ${calculationResult.estimatedMedian.toLocaleString()}
              </div>

              <div className="font-serif text-[15px] text-[#1A1A1A]/70">
                Expected Range:{' '}
                <strong className="text-[#1A1A1A] font-semibold">
                  ${calculationResult.estimatedMin.toLocaleString()} – ${calculationResult.estimatedMax.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Metric Breakdown Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-[14px]">
              <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#1A1A1A]/10">
                <div className="font-sans text-[#8C7355] text-[10px] uppercase font-bold tracking-[0.15em]">Price per Sqft</div>
                <div className="font-serif text-[22px] font-normal text-[#1A1A1A] mt-1">
                  ${Math.round(calculationResult.estimatedMedian / Number(formValues.size || 1)).toLocaleString()} psf
                </div>
                <div className="font-sans text-[11px] text-[#1A1A1A]/60 mt-0.5">
                  Range: ${calculationResult.psfMin} – ${calculationResult.psfMax}
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#1A1A1A]/10">
                <div className="font-sans text-[#8C7355] text-[10px] uppercase font-bold tracking-[0.15em]">Est. Gross Rental</div>
                <div className="font-serif text-[22px] font-normal text-[#8C7355] mt-1">
                  ${calculationResult.monthlyRentalEstimate.toLocaleString()}/mo
                </div>
                <div className="font-sans text-[11px] text-[#1A1A1A]/60 mt-0.5">
                  {calculationResult.annualYieldRate}% Est. Gross Yield
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#1A1A1A]/10 col-span-2 sm:col-span-1">
                <div className="font-sans text-[#8C7355] text-[10px] uppercase font-bold tracking-[0.15em]">Property Specs</div>
                <div className="font-serif text-[22px] font-normal text-[#1A1A1A] mt-1">
                  {formValues.size} sqft
                </div>
                <div className="font-sans text-[11px] text-[#1A1A1A]/60 mt-0.5 capitalize">
                  {formValues.propertyType} • {formValues.facing} Facing
                </div>
              </div>
            </div>

            {/* Driver Breakdown */}
            <div className="relative z-10 border-t border-[#1A1A1A]/10 pt-4 mb-6">
              <h4 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7355] mb-3">
                Key Value Drivers
              </h4>
              <div className="space-y-2 text-[14px] text-[#1A1A1A]/80 font-serif">
                <div className="flex justify-between items-center py-1 border-b border-[#1A1A1A]/5">
                  <span>Facing Orientation Premium ({formValues.facing})</span>
                  <span className="font-sans font-semibold text-[#1A1A1A] text-xs">
                    {calculationResult.facingFactorPct >= 0 ? `+${calculationResult.facingFactorPct}%` : `${calculationResult.facingFactorPct}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#1A1A1A]/5">
                  <span>Transit Proximity Factor</span>
                  <span className="font-sans font-semibold text-[#1A1A1A] text-xs">
                    {calculationResult.transitFactorPct >= 0 ? `+${calculationResult.transitFactorPct}%` : `${calculationResult.transitFactorPct}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Market Trajectory (Trailing 12 Mo)</span>
                  <span className="font-sans font-semibold text-[#8C7355] text-xs">+2.4% QoQ</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex flex-col gap-3 pt-2">
              {onPredictTrajectory && (
                <button
                  id="modal-predict-trajectory-btn"
                  onClick={() => {
                    setShowResultModal(false);
                    onPredictTrajectory({
                      currentPrice: calculationResult.estimatedMedian,
                      sqft: formValues.size,
                      propertyType: formValues.propertyType === 'landed' ? 'landed' : 'private',
                      estimatedGrossYield: calculationResult.annualYieldRate,
                    });
                  }}
                  className="w-full bg-[#8C7355] hover:bg-[#A38A6D] text-[#F5F2ED] py-3.5 px-4 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-center transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <TrendingUp size={15} />
                  <span>Forecast Price Trajectory for this Property (3–15 Yrs) →</span>
                </button>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="book-certified-appraisal-btn"
                  onClick={() => {
                    setShowResultModal(false);
                    onOpenBookAppraisal(formValues);
                  }}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-3.5 px-4 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-center transition-colors cursor-pointer"
                >
                  Book In-Person Appraisal
                </button>
                <button
                  id="save-valuation-record-btn"
                  onClick={handleSaveResult}
                  className="sm:w-auto bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] py-3.5 px-5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 size={16} className="text-[#8C7355]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} />
                      <span>Save Record</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
