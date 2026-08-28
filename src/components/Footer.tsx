import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Headphones, TrendingUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'support' | 'investor' | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setNewsletterEmail('');
      }, 3500);
    }
  };

  return (
    <>
      <footer className="w-full bg-[#1A1A1A] text-[#F5F2ED] mt-24">
        {/* Curated Monograph Bulletin Strip */}
        <div className="border-b border-[#F5F2ED]/10">
          <div className="max-w-[1200px] mx-auto px-5 md:px-16 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-2">
                Weekly Intelligence Monograph
              </span>
              <h3 className="font-serif text-[28px] md:text-[34px] font-light leading-tight text-[#F5F2ED]">
                Curated property valuation & spatial indices in your inbox.
              </h3>
            </div>
            <div className="md:col-span-5">
              {subscribed ? (
                <div className="text-[13px] text-[#8C7355] font-sans tracking-wide">
                  ✓ Monograph subscription confirmed. Welcome to the advisory ledger.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex border-b border-[#F5F2ED]/30 pb-2 justify-between items-center">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Institutional Email Address"
                    className="bg-transparent border-none outline-none text-[#F5F2ED] placeholder:text-[#F5F2ED]/40 text-[13px] font-sans italic w-full pr-4"
                  />
                  <button
                    type="submit"
                    className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C7355] hover:text-[#F5F2ED] cursor-pointer whitespace-nowrap"
                  >
                    Subscribe →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Primary Footer Links & Imprint */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-16 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="font-serif text-[22px] italic font-semibold tracking-tighter text-[#F5F2ED]">
              ESTATEANALYTICS
            </div>
            <p className="text-[12px] text-[#F5F2ED]/60 font-sans max-w-md tracking-wider">
              An institutional research desk and appraisal methodology publishing house.
            </p>
          </div>

          <nav className="flex flex-wrap gap-6 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5F2ED]/60">
            <button
              id="footer-privacy-btn"
              onClick={() => setModalType('privacy')}
              className="hover:text-[#F5F2ED] transition-colors cursor-pointer text-left"
            >
              Privacy Policy
            </button>
            <button
              id="footer-terms-btn"
              onClick={() => setModalType('terms')}
              className="hover:text-[#F5F2ED] transition-colors cursor-pointer text-left"
            >
              Terms of Service
            </button>
            <button
              id="footer-support-btn"
              onClick={() => setModalType('support')}
              className="hover:text-[#F5F2ED] transition-colors cursor-pointer text-left"
            >
              Contact Support
            </button>
            <button
              id="footer-investor-btn"
              onClick={() => setModalType('investor')}
              className="hover:text-[#F5F2ED] transition-colors cursor-pointer text-left"
            >
              Investor Relations
            </button>
          </nav>
        </div>

        {/* Editorial Sub-Footer */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-16 py-6 border-t border-[#F5F2ED]/10 flex justify-between items-center">
          <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#F5F2ED]/40">
            © 2024 EstateAnalytics Publishing House. All rights reserved.
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-1.5 h-1.5 bg-[#8C7355] rounded-full" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5F2ED]/80">
              Issue No. 042
            </span>
          </div>
        </div>
      </footer>

      {/* Info Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5F2ED] text-[#1A1A1A] rounded-sm max-w-lg w-full p-8 shadow-2xl border border-[#1A1A1A]/15 relative animate-scaleUp">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-full hover:bg-[#E2DFD8]/40 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {modalType === 'privacy' && (
              <div className="space-y-4">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
                  Data Governance
                </span>
                <h3 className="font-serif text-[28px] font-light text-[#1A1A1A]">Privacy Policy</h3>
                <div className="h-[1px] w-12 bg-[#1A1A1A]" />
                <p className="text-[14px] leading-relaxed text-[#1A1A1A]/80 font-serif">
                  EstateAnalytics treats client property data and valuation records with absolute institutional-grade confidentiality. We do not sell or rent proprietary valuation inquiries or ownership portfolios to marketing aggregators. All data is processed on encrypted channels.
                </p>
                <div className="pt-4 border-t border-[#1A1A1A]/10">
                  <button
                    onClick={() => setModalType(null)}
                    className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
                  >
                    Understood
                  </button>
                </div>
              </div>
            )}

            {modalType === 'terms' && (
              <div className="space-y-4">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
                  Chartered Protocol
                </span>
                <h3 className="font-serif text-[28px] font-light text-[#1A1A1A]">Terms of Service</h3>
                <div className="h-[1px] w-12 bg-[#1A1A1A]" />
                <p className="text-[14px] leading-relaxed text-[#1A1A1A]/80 font-serif">
                  Valuation estimates provided through EstateAnalytics are computed utilizing automated regression models, historical transaction indices, and spatial attributes. They serve as indicative benchmarks and do not substitute for formal physical appraisals certified by chartered valuation surveyors.
                </p>
                <div className="pt-4 border-t border-[#1A1A1A]/10">
                  <button
                    onClick={() => setModalType(null)}
                    className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
                  >
                    Accept & Continue
                  </button>
                </div>
              </div>
            )}

            {modalType === 'support' && (
              <div className="space-y-4">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
                  Concierge Desk
                </span>
                <h3 className="font-serif text-[28px] font-light text-[#1A1A1A]">Contact Support</h3>
                <div className="h-[1px] w-12 bg-[#1A1A1A]" />
                <p className="text-[14px] leading-relaxed text-[#1A1A1A]/80 font-serif">
                  Have inquiries about property valuations, corporate API access, or appraisal scheduling?
                </p>
                <div className="bg-[#E2DFD8]/40 p-4 rounded-sm border border-[#1A1A1A]/10 text-[13px] space-y-2 text-[#1A1A1A] font-sans">
                  <div><strong className="text-[#1A1A1A]">Email:</strong> concierge@estateanalytics.com</div>
                  <div><strong className="text-[#1A1A1A]">Desk:</strong> +1 (800) 482-9020 (Mon–Fri, 8am–7pm EST)</div>
                  <div><strong className="text-[#1A1A1A]">Headquarters:</strong> 100 Marina Boulevard, Tower 2, Level 38</div>
                </div>
                <div className="pt-4 border-t border-[#1A1A1A]/10">
                  <button
                    onClick={() => setModalType(null)}
                    className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {modalType === 'investor' && (
              <div className="space-y-4">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
                  Institutional Portal
                </span>
                <h3 className="font-serif text-[28px] font-light text-[#1A1A1A]">Investor Relations</h3>
                <div className="h-[1px] w-12 bg-[#1A1A1A]" />
                <p className="text-[14px] leading-relaxed text-[#1A1A1A]/80 font-serif">
                  EstateAnalytics delivers spatial analytics infrastructure for commercial REITs, private wealth family offices, and sovereign real estate desks. Institutional data feeds and customized API sandbox access are available upon accreditation.
                </p>
                <div className="pt-4 border-t border-[#1A1A1A]/10">
                  <button
                    onClick={() => setModalType(null)}
                    className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
