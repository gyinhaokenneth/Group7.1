import React, { useEffect } from 'react';
import { TabType } from '../types';

const DISQUS_SHORTNAME = 'testing-mpmo7rcwjp';

// Each tab is its own "page" in this SPA, so give each one its own thread.
const THREAD_TITLES: Record<TabType, string> = {
  valuation: 'Residential Property Analytics & Appraisal',
  trajectory: 'Price Trajectory Predictor',
  trends: 'Market Trends',
  about: 'About EstateAnalytics',
};

// StrictMode invokes effects twice in dev; without this the embed script
// gets injected twice before window.DISQUS exists.
let scriptInjected = false;

declare global {
  interface Window {
    DISQUS?: { reset: (config: { reload: boolean; config: () => void }) => void };
    disqus_config?: () => void;
  }
}

interface DisqusCommentsProps {
  currentTab: TabType;
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({ currentTab }) => {
  useEffect(() => {
    const identifier = `estate-analytics-${currentTab}`;
    const url = `${window.location.origin}/${currentTab}`;
    const title = THREAD_TITLES[currentTab];

    // Disqus reads this off window when embed.js boots and on every reset.
    window.disqus_config = function (this: any) {
      this.page.url = url;
      this.page.identifier = identifier;
      this.page.title = title;
    };

    if (window.DISQUS) {
      // Script already loaded: swap the thread instead of re-injecting.
      window.DISQUS.reset({
        reload: true,
        config: window.disqus_config,
      });
    } else if (!scriptInjected) {
      scriptInjected = true;
      const s = document.createElement('script');
      s.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;
      (document.head || document.body).appendChild(s);
    }
  }, [currentTab]);

  return (
    <section className="w-full bg-[#F5F2ED] border-t border-[#1A1A1A]/10">
      <div className="max-w-[1200px] mx-auto px-5 md:px-16 py-16">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-2">
          Reader Correspondence
        </span>
        <h3 className="font-display text-[28px] md:text-[34px] font-light leading-tight text-[#1A1A1A] mb-8">
          Discussion
        </h3>
        <div id="disqus_thread" />
        <noscript>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
        </noscript>
      </div>
    </section>
  );
};
