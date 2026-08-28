import React, { useState } from 'react';
import { TabType } from '../types';
import { Bell, User, Menu, X, Building2 } from 'lucide-react';

interface TopNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenBookModal: () => void;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentTab,
  onTabChange,
  onOpenBookModal,
  onOpenNotifications,
  onOpenAccount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: TabType; label: string }[] = [
    { id: 'valuation', label: 'Valuation' },
    { id: 'trajectory', label: 'Price Predictor' },
    { id: 'rent', label: 'Rent' },
    { id: 'trends', label: 'Market Trends' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="w-full sticky top-0 z-40 bg-[#F5F2ED]/95 backdrop-blur-md border-b border-[#1A1A1A]/10 transition-all">
      <div className="max-w-[1200px] mx-auto px-5 md:px-16 py-4 flex items-center justify-between">
        {/* Brand */}
        <button
          id="nav-brand-logo"
          onClick={() => {
            onTabChange('valuation');
            setMobileMenuOpen(false);
          }}
          className="text-left cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xs bg-[#1A1A1A] text-[#F5F2ED] flex items-center justify-center border border-[#8C7355]/30 group-hover:bg-[#8C7355] transition-colors shrink-0 shadow-2xs">
            <Building2 size={18} className="text-[#F5F2ED]" />
          </div>
          <div className="flex flex-col text-left justify-center">
            <span className="font-serif text-[21px] md:text-[24px] font-normal tracking-tight text-[#1A1A1A] leading-[0.92] group-hover:text-[#8C7355] transition-colors">
              Estate
            </span>
            <span className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] text-[#8C7355] leading-none mt-1">
              Analytics
            </span>
          </div>
          <div className="hidden lg:block h-6 w-px bg-[#1A1A1A]/15 ml-1.5" />
          <span className="hidden lg:inline font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-[#1A1A1A]/50">
            Monograph No. 042
          </span>
        </button>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-[11px] font-bold uppercase tracking-[0.2em]">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`cursor-pointer transition-all pb-1 ${
                  isActive
                    ? 'text-[#1A1A1A] border-b border-[#1A1A1A]'
                    : 'text-[#1A1A1A] opacity-40 hover:opacity-90'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications */}
          <button
            id="nav-notifications-btn"
            onClick={onOpenNotifications}
            className="p-2 text-[#1A1A1A] hover:opacity-60 transition-opacity relative cursor-pointer rounded-full hover:bg-[#E2DFD8]/40"
            title="Notifications"
            aria-label="View notifications"
          >
            <span className="material-symbols-outlined text-[22px]" data-icon="notifications">
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#8C7355] rounded-full ring-2 ring-[#F5F2ED]" />
          </button>

          {/* Account */}
          <button
            id="nav-account-btn"
            onClick={onOpenAccount}
            className="p-2 text-[#1A1A1A] hover:opacity-60 transition-opacity cursor-pointer rounded-full hover:bg-[#E2DFD8]/40"
            title="User Profile & Portfolio"
            aria-label="View account profile"
          >
            <span className="material-symbols-outlined text-[22px]" data-icon="account_circle">
              account_circle
            </span>
          </button>

          {/* Book Appraisal CTA */}
          <button
            id="nav-book-appraisal-btn"
            onClick={onOpenBookModal}
            className="hidden sm:inline-flex items-center justify-center bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] px-5 md:px-6 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-200 shadow-xs cursor-pointer active:scale-98"
          >
            Book Appraisal
          </button>

          {/* Mobile Menu Button */}
          <button
            id="nav-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1A1A1A] hover:opacity-60 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F5F2ED] border-t border-[#1A1A1A]/10 px-6 py-5 flex flex-col gap-3 shadow-md animate-fadeIn">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2.5 px-3 rounded-sm transition-all font-sans text-[11px] font-bold uppercase tracking-[0.2em] ${
                  isActive
                    ? 'text-[#1A1A1A] bg-[#E2DFD8]/60 border-l-2 border-[#1A1A1A]'
                    : 'text-[#1A1A1A] opacity-60 hover:opacity-100 hover:bg-[#E2DFD8]/30'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenBookModal();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-3 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-center transition-colors shadow-xs"
            >
              Book Appraisal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
