import React, { useState } from 'react';
import { Database, Compass, Cpu, Award, Download, Check, PhoneCall } from 'lucide-react';

interface AboutViewProps {
  onOpenBookAppraisal: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onOpenBookAppraisal,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownloadMethodology = () => {
    setDownloading(true);
    setTimeout(() => {
      // Create a markdown/text blob and trigger download
      const content = `ESTATEANALYTICS - INSTITUTIONAL APPRAISAL METHODOLOGY
======================================================
Version 4.2 | Released Q3 2024

1. EXECUTIVE SUMMARY
EstateAnalytics utilizes a multi-layered econometric regression framework combined with spatial machine learning algorithms to compute property market valuations with 97.4% historical back-tested precision.

2. FOUR-STAGE APPRAISAL ARCHITECTURE
- Stage 1: Data Ingestion (Government Land Registries, Lodged Caveats, Tenancy Contracts)
- Stage 2: Spatial & Micro-Attribute Calibration (Sun paths, Facing, Floor height, MRT buffers)
- Stage 3: Neural Predictive Modeling (Yield compression curves, interest rate sensitivity)
- Stage 4: Chartered Surveyor Audit (RICS-aligned computational checks)

3. CONTACT
Concierge: concierge@estateanalytics.com | Desk: +1 (800) 482-9020
© 2024 EstateAnalytics. All rights reserved.
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'EstateAnalytics-Appraisal-Methodology-v4.2.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloading(false);
      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 4000);
    }, 800);
  };

  return (
    <div className="w-full">
      <main className="max-w-[1200px] mx-auto px-5 md:px-16 py-12">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-20 md:mb-28">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
              Institutional Advisory • Monograph
            </span>
            <h1 className="font-display text-[38px] sm:text-[46px] md:text-[52px] leading-[1.12] font-light text-[#1A1A1A] tracking-tight">
              Precision Meets Architectural Aspiration.
            </h1>
            <div className="editorial-rule" />
            <p className="font-display text-[18px] leading-[1.65] text-[#1A1A1A]/85">
              At EstateAnalytics, we synthesize quantitative econometric modeling with deep prime-market stewardship to deliver valuations that serve as dependable capital benchmarks.
            </p>
            <p className="font-display text-[15px] leading-relaxed text-[#1A1A1A]/70">
              Founded by real estate economists, computational urban architects, and institutional wealth advisors, our mandate is to eradicate information asymmetry across high-density metro corridors.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-sm overflow-hidden shadow-[0_15px_40px_-10px_rgba(26,26,26,0.08)] border border-[#1A1A1A]/15 bg-[#E2DFD8]/40 aspect-[4/3]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL0TK4fx6Xf4Drw6BV7s4xN_Kl7l9BRIyjd3i80b1QLVfyyq3iT5p1FmwZJupe6EN7AQLXoYzEwqzcOtAhmhrduEO-C7sey6IIBxwQ1HDCsbFdnTDBiHaR1oJ4gJI8U4yaHr5I7Ki1txMPyu6RUGitvfcJdb19wQAoYCxtVJvLCqGgywHKT0wMgEc8Bv0-ScHbktV6EHrlbmO9u3QQMo7xYyqJWBaJ-8uo3khxrTHWnckyMWex_YwjBw"
                alt="EstateAnalytics Executive Advisory Suite"
                className="w-full h-full object-cover object-center filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 font-sans text-[9px] uppercase tracking-[0.25em] text-[#F5F2ED]/90 bg-[#1A1A1A]/80 px-3 py-1 rounded-sm backdrop-blur-xs">
                Private Advisory Salon • Singapore CCR
              </div>
            </div>
          </div>
        </section>

        {/* Methodology Bento Grid */}
        <section className="mb-20 md:mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-2">
              Computational Architecture
            </span>
            <h2 className="font-display text-[32px] md:text-[40px] font-light text-[#1A1A1A] mb-3">
              Our Valuation Methodology
            </h2>
            <div className="editorial-rule max-w-xs mx-auto my-4" />
            <p className="font-display text-[16px] text-[#1A1A1A]/75 leading-relaxed">
              A multi-layered analytical framework engineered to isolate empirical drivers of prime residential value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-[#FFFFFF] rounded-sm p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.04)] border border-[#1A1A1A]/10 flex flex-col justify-between hover:border-[#8C7355]/40 transition-all">
              <div>
                <div className="w-10 h-10 rounded-sm bg-[#E2DFD8]/50 flex items-center justify-center text-[#1A1A1A] mb-6">
                  <span className="material-symbols-outlined text-[20px]" data-icon="database">
                    database
                  </span>
                </div>
                <h3 className="font-display text-[22px] md:text-[24px] font-normal text-[#1A1A1A] mb-3">
                  Comprehensive Data Ingestion
                </h3>
                <p className="font-display text-[15px] leading-[1.65] text-[#1A1A1A]/75">
                  We ingest decades of authenticated transaction records, macro monetary flows, statutory master plans, and hyper-local infrastructure milestones.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10 flex items-center gap-2 font-sans text-[10px] font-bold text-[#8C7355] uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C7355]" />
                <span>Over 12M Verified Ledgers</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FFFFFF] rounded-sm p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.04)] border border-[#1A1A1A]/10 flex flex-col justify-between hover:border-[#8C7355]/40 transition-all">
              <div>
                <div className="w-10 h-10 rounded-sm bg-[#E2DFD8]/50 flex items-center justify-center text-[#1A1A1A] mb-6">
                  <span className="material-symbols-outlined text-[20px]" data-icon="architecture">
                    architecture
                  </span>
                </div>
                <h3 className="font-display text-[22px] md:text-[24px] font-normal text-[#1A1A1A] mb-3">
                  Spatial & Attribute Calibration
                </h3>
                <p className="font-display text-[15px] leading-[1.65] text-[#1A1A1A]/75">
                  Every property is evaluated on micro attributes: solar azimuths, floor-tier premiums, acoustic damping, and discrete walking radius to transit junctions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10 flex items-center gap-2 font-sans text-[10px] font-bold text-[#8C7355] uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C7355]" />
                <span>Sub-meter Spatial Accuracy</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FFFFFF] rounded-sm p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.04)] border border-[#1A1A1A]/10 flex flex-col justify-between hover:border-[#8C7355]/40 transition-all">
              <div>
                <div className="w-10 h-10 rounded-sm bg-[#E2DFD8]/50 flex items-center justify-center text-[#1A1A1A] mb-6">
                  <span className="material-symbols-outlined text-[20px]" data-icon="psychiatry">
                    psychiatry
                  </span>
                </div>
                <h3 className="font-display text-[22px] md:text-[24px] font-normal text-[#1A1A1A] mb-3">
                  Algorithmic Predictive Modeling
                </h3>
                <p className="font-display text-[15px] leading-[1.65] text-[#1A1A1A]/75">
                  Our regression engines model future cash flows, yield compressions, and capital appreciation trajectories under evolving macroeconomic interest rate regimes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10 flex items-center gap-2 font-sans text-[10px] font-bold text-[#8C7355] uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C7355]" />
                <span>Monte Carlo Scenario Simulations</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FFFFFF] rounded-sm p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.04)] border border-[#1A1A1A]/10 flex flex-col justify-between hover:border-[#8C7355]/40 transition-all">
              <div>
                <div className="w-10 h-10 rounded-sm bg-[#E2DFD8]/50 flex items-center justify-center text-[#1A1A1A] mb-6">
                  <span className="material-symbols-outlined text-[20px]" data-icon="gavel">
                    gavel
                  </span>
                </div>
                <h3 className="font-display text-[22px] md:text-[24px] font-normal text-[#1A1A1A] mb-3">
                  Chartered Surveyor Audit
                </h3>
                <p className="font-display text-[15px] leading-[1.65] text-[#1A1A1A]/75">
                  Computational outputs are continuously audited and peer-reviewed by certified chartered valuation surveyors adhering to institutional Red Book standards.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10 flex items-center gap-2 font-sans text-[10px] font-bold text-[#8C7355] uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C7355]" />
                <span>RICS & SISV Aligned Protocols</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact / Consultation Banner */}
        <section className="bg-[#FFFFFF] rounded-sm p-8 sm:p-14 border border-[#1A1A1A]/10 text-center shadow-[0_10px_30px_-10px_rgba(26,26,26,0.04)]">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-2">
            Private Client Engagement
          </span>
          <h3 className="font-display text-[28px] sm:text-[36px] font-light text-[#1A1A1A] mb-3">
            Require an Institutional Appraisal?
          </h3>
          <p className="font-display text-[16px] text-[#1A1A1A]/75 max-w-xl mx-auto mb-8 leading-relaxed">
            For prime residences, family office estates, and cross-border portfolios, engage our senior appraisal desk for a confidential advisory dossier.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="about-contact-experts-btn"
              onClick={onOpenBookAppraisal}
              className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] px-8 py-3.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm cursor-pointer"
            >
              Contact Our Experts
            </button>

            <button
              id="about-download-methodology-btn"
              onClick={handleDownloadMethodology}
              disabled={downloading}
              className="w-full sm:w-auto border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] px-8 py-3.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              {downloadComplete ? (
                <>
                  <Check size={16} className="text-[#8C7355]" />
                  <span>Dossier Downloaded</span>
                </>
              ) : downloading ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#1A1A1A] border-t-transparent rounded-full" />
                  <span>Preparing Monograph...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download Methodology PDF</span>
                </>
              )}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
