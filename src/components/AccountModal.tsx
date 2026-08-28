import React, { useState } from 'react';
import { X, User, Bookmark, Heart, Calendar, ArrowUpRight, Trash2, TrendingUp } from 'lucide-react';
import { ValuationResult, ValuationFormValues, TabType, SavedTrajectoryPrediction } from '../types';

interface SavedValuationItem {
  id: string;
  result: ValuationResult;
  values: ValuationFormValues;
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedValuations: SavedValuationItem[];
  savedPredictions?: SavedTrajectoryPrediction[];
  bookings: any[];
  onNavigateTab: (tab: TabType) => void;
  onRemoveValuation?: (id: string) => void;
  onRemovePrediction?: (id: string) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  savedValuations,
  savedPredictions = [],
  bookings,
  onNavigateTab,
  onRemoveValuation,
  onRemovePrediction,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'valuations' | 'predictions' | 'appraisals'>('valuations');

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-sm max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#1A1A1A]/15 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-sm hover:bg-[#E2DFD8]/40 cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 border-b border-[#1A1A1A]/10 pb-6 mb-6">
          <div className="w-14 h-14 rounded-sm bg-[#E2DFD8]/60 text-[#1A1A1A] border border-[#8C7355]/30 flex items-center justify-center font-display text-[20px] font-normal">
            JV
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-display text-[24px] font-light text-[#1A1A1A]">
                Julian Vance
              </h3>
              <span className="bg-[#8C7355]/15 text-[#8C7355] border border-[#8C7355]/30 font-sans text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm">
                Verified Portfolio
              </span>
            </div>
            <p className="font-display text-[13px] text-[#1A1A1A]/60 mt-0.5">
              Executive Private Client • Folio: EA-890214
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1A1A1A]/10 gap-6 mb-6">
          <button
            onClick={() => setActiveSubTab('valuations')}
            className={`pb-2.5 cursor-pointer font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
              activeSubTab === 'valuations'
                ? 'text-[#1A1A1A] border-b-2 border-[#8C7355]'
                : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            Valuations ({savedValuations.length})
          </button>
          <button
            onClick={() => setActiveSubTab('predictions')}
            className={`pb-2.5 cursor-pointer font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
              activeSubTab === 'predictions'
                ? 'text-[#1A1A1A] border-b-2 border-[#8C7355]'
                : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            Trajectories ({savedPredictions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('appraisals')}
            className={`pb-2.5 cursor-pointer font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
              activeSubTab === 'appraisals'
                ? 'text-[#1A1A1A] border-b-2 border-[#8C7355]'
                : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            Consultations ({bookings.length})
          </button>
        </div>

        {/* Tab Content: Saved Valuations */}
        {activeSubTab === 'valuations' && (
          <div className="space-y-3">
            {savedValuations.length === 0 ? (
              <div className="text-center py-10 bg-[#F5F2ED]/30 rounded-sm border border-[#1A1A1A]/10">
                <Bookmark size={28} className="mx-auto text-[#1A1A1A]/40 mb-2" />
                <p className="font-display text-[16px] text-[#1A1A1A]">No archived valuation appraisals</p>
                <p className="font-display text-[13px] text-[#1A1A1A]/60 mb-4">Calculate a property appraisal and click Save Valuation.</p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('valuation');
                  }}
                  className="bg-[#1A1A1A] text-[#F5F2ED] px-5 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#8C7355] transition-colors"
                >
                  Open Appraisal Engine
                </button>
              </div>
            ) : (
              savedValuations.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#F5F2ED]/40 rounded-sm border border-[#1A1A1A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1A1A1A]/20 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[10px] font-bold text-[#8C7355] uppercase tracking-[0.2em] capitalize">
                        {item.values.propertyType} • {item.values.size} sqft
                      </span>
                      <span className="font-sans text-[10px] text-[#1A1A1A]/50 uppercase tracking-wider">({item.result.timestamp})</span>
                    </div>
                    <div className="font-display text-[24px] font-light text-[#1A1A1A] mt-0.5">
                      ${item.result.estimatedMedian.toLocaleString()}
                    </div>
                    <div className="font-display text-[13px] text-[#1A1A1A]/65">
                      Spread: ${item.result.estimatedMin.toLocaleString()} – ${item.result.estimatedMax.toLocaleString()} • Facing: {item.values.facing}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onRemoveValuation && (
                      <button
                        onClick={() => onRemoveValuation(item.id)}
                        className="p-2 text-[#1A1A1A]/40 hover:text-red-700 rounded-sm cursor-pointer transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Saved Trajectories */}
        {activeSubTab === 'predictions' && (
          <div className="space-y-3">
            {savedPredictions.length === 0 ? (
              <div className="text-center py-10 bg-[#F5F2ED]/30 rounded-sm border border-[#1A1A1A]/10">
                <TrendingUp size={28} className="mx-auto text-[#1A1A1A]/40 mb-2" />
                <p className="font-display text-[16px] text-[#1A1A1A]">No archived trajectory predictions</p>
                <p className="font-display text-[13px] text-[#1A1A1A]/60 mb-4">Run the forward price trajectory predictor and save your forecast model.</p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('trajectory');
                  }}
                  className="bg-[#1A1A1A] text-[#F5F2ED] px-5 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#8C7355] transition-colors"
                >
                  Open Price Predictor
                </button>
              </div>
            ) : (
              savedPredictions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#F5F2ED]/40 rounded-sm border border-[#1A1A1A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1A1A1A]/20 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[10px] font-bold text-[#8C7355] uppercase tracking-[0.2em]">
                        {item.title}
                      </span>
                      <span className="font-sans text-[10px] text-[#1A1A1A]/50 uppercase tracking-wider">({item.createdAt})</span>
                    </div>
                    <div className="font-display text-[24px] font-light text-[#1A1A1A] mt-0.5">
                      ${item.result.finalProjectedValue.toLocaleString()}
                    </div>
                    <div className="font-display text-[13px] text-[#1A1A1A]/65">
                      Gain: +${item.result.totalCapitalGain.toLocaleString()} (+{item.result.totalGainPct}%) • CAGR: {item.result.annualizedCAGR}% p.a.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab('trajectory');
                      }}
                      className="text-[#8C7355] hover:text-[#1A1A1A] font-sans text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1"
                    >
                      View
                    </button>
                    {onRemovePrediction && (
                      <button
                        onClick={() => onRemovePrediction(item.id)}
                        className="p-2 text-[#1A1A1A]/40 hover:text-red-700 rounded-sm cursor-pointer transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Saved Rentals */}
        {activeSubTab === 'appraisals' && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-10 bg-[#F5F2ED]/30 rounded-sm border border-[#1A1A1A]/10">
                <Calendar size={28} className="mx-auto text-[#1A1A1A]/40 mb-2" />
                <p className="font-display text-[16px] text-[#1A1A1A]">No active appraisal appointments</p>
                <p className="font-display text-[13px] text-[#1A1A1A]/60 mb-4">Book a physical or virtual chartered surveyor consultation.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 bg-[#F5F2ED]/40 rounded-sm border border-[#1A1A1A]/10 text-[14px] space-y-2"
                >
                  <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-2">
                    <span className="font-mono font-semibold text-[#1A1A1A]">{booking.id}</span>
                    <span className="px-2 py-0.5 bg-[#8C7355]/15 text-[#8C7355] border border-[#8C7355]/30 font-sans text-[10px] font-bold uppercase tracking-[0.15em] rounded-sm">
                      Confirmed
                    </span>
                  </div>
                  <div className="flex justify-between font-display text-[13px] text-[#1A1A1A]/75">
                    <span>Date & Window:</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {booking.preferredDate} ({booking.preferredTime})
                    </span>
                  </div>
                  <div className="flex justify-between font-display text-[13px] text-[#1A1A1A]/75">
                    <span>Appointed Surveyor:</span>
                    <span className="text-[#1A1A1A]">{booking.surveyor}</span>
                  </div>
                  <div className="flex justify-between font-display text-[13px] text-[#1A1A1A]/75">
                    <span>Target Property:</span>
                    <span className="text-[#1A1A1A] text-right truncate max-w-[240px]">
                      {booking.propertyAddress}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
