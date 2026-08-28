import React, { useState, useEffect, useCallback } from 'react';
import { URADistrictStats, URATransaction, URAStatusResponse } from '../types';
import { fetchURADistrictStats, fetchURATransactions, fetchURAStatus, syncAllURABatches } from '../services/uraService';
import { URAMonthlyPriceChart } from './URAMonthlyPriceChart';
import { Building, CheckCircle2, RefreshCw, Layers, MapPin, Filter, ShieldCheck, Database, Calendar, Tag } from 'lucide-react';

interface URATransactionFeedProps {
  district: string;
  districtName?: string;
  /**
   * The Property Type chosen in the valuation form above. Drives the monthly
   * trend chart. The table keeps its own propTypeFilter below.
   */
  subjectPropertyType?: string;
}

export const URATransactionFeed: React.FC<URATransactionFeedProps> = ({
  district,
  districtName,
  subjectPropertyType,
}) => {
  const [stats, setStats] = useState<URADistrictStats | null>(null);
  const [transactions, setTransactions] = useState<URATransaction[]>([]);
  const [status, setStatus] = useState<URAStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Filters
  const [saleTypeFilter, setSaleTypeFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [propTypeFilter, setPropTypeFilter] = useState<string>('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string | null>(null);

  // Load status and district stats
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, statsRes] = await Promise.all([
        fetchURAStatus(),
        fetchURADistrictStats(district),
      ]);
      setStatus(statusRes);
      setStats(statsRes);
      if (statsRes && statsRes.recentTransactions) {
        setTransactions(statsRes.recentTransactions);
      }
    } catch (err) {
      console.error('Error loading URA data:', err);
    } finally {
      setLoading(false);
    }
  }, [district]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Full 4-Batch Sync
  const handleSyncAll = async () => {
    setSyncingAll(true);
    setSyncNotice(null);
    try {
      const res = await syncAllURABatches();
      if (res && res.success) {
        setSyncNotice(`Successfully synchronized and merged 4 batches: ${res.totalDevelopments.toLocaleString()} developments & ${res.totalTransactions.toLocaleString()} transactions (${res.elapsedMs}ms).`);
        await loadData();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncingAll(false);
    }
  };

  // Filter transactions
  const displayedTransactions = transactions.filter((t) => {
    if (saleTypeFilter !== 'all' && t.typeOfSale !== saleTypeFilter) return false;
    if (selectedProjectFilter && t.project !== selectedProjectFilter) return false;
    if (propTypeFilter !== 'all') {
      const p = (t.propertyType || '').toLowerCase();
      if (propTypeFilter === 'condo' && !p.includes('condominium') && !p.includes('apartment')) return false;
      if (propTypeFilter === 'landed' && !p.includes('terrace') && !p.includes('semi-detached') && !p.includes('detached')) return false;
    }
    return true;
  });

  return (
    <div id="ura-transaction-feed" className="bg-[#FFFFFF] rounded-sm p-6 sm:p-8 border border-[#1A1A1A]/10 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)] space-y-6">
      {/* Header lockup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xs bg-[#1A1A1A] text-[#FAF8F5] flex items-center justify-center shrink-0 mt-0.5">
            <Database className="w-5 h-5 text-[#C5A880]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355]">
                Official URA DataService API • Daily Token Authenticated
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Connected
              </span>
            </div>
            <h3 className="font-display text-[22px] sm:text-[26px] font-light text-[#1A1A1A] mt-0.5">
              Live Singapore Real Estate Registry: {district} {districtName ? `(${districtName})` : ''}
            </h3>
            <p className="font-display text-xs sm:text-sm text-[#1A1A1A]/70 max-w-xl">
              Authentic transaction records retrieved from Urban Redevelopment Authority (URA). Dual-header verified via daily token exchange.
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            id="ura-refresh-btn"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-display text-[#1A1A1A]/80 hover:text-[#1A1A1A] bg-[#FAF8F5] border border-[#1A1A1A]/15 hover:border-[#1A1A1A]/30 rounded-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh District</span>
          </button>

          <button
            type="button"
            id="ura-sync-all-btn"
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-display text-[#FAF8F5] bg-[#1A1A1A] hover:bg-[#8C7355] rounded-xs transition-colors cursor-pointer shadow-xs"
          >
            <Layers className={`w-3.5 h-3.5 text-[#C5A880] ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Merging 4 Batches...' : 'Merge All 4 Batches'}</span>
          </button>
        </div>
      </div>

      {/* Sync notice banner */}
      {syncNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* District Empirical Stat Cards */}
      {stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-xs">
            <span className="block font-sans text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/70">
              URA Median PSF
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-2xl sm:text-3xl font-light text-[#1A1A1A]">
                ${stats.medianPsf.toLocaleString()}
              </span>
              <span className="font-display text-xs text-[#1A1A1A]/70">/sqft</span>
            </div>
            <span className="block text-[10px] text-[#8C7355] mt-1 font-display">
              District empirical median
            </span>
          </div>

          <div className="p-4 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-xs">
            <span className="block font-sans text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/70">
              PSF Spread Range
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-lg sm:text-xl font-light text-[#1A1A1A]">
                ${stats.minPsf.toLocaleString()} – ${stats.maxPsf.toLocaleString()}
              </span>
            </div>
            <span className="block text-[10px] text-[#1A1A1A]/70 mt-1 font-display">
              25th: ${stats.p25Psf.toLocaleString()} | 75th: ${stats.p75Psf.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-xs">
            <span className="block font-sans text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/70">
              Verified Records
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-2xl sm:text-3xl font-light text-[#1A1A1A]">
                {stats.totalTransactions.toLocaleString()}
              </span>
              <span className="font-display text-xs text-[#1A1A1A]/70">units</span>
            </div>
            <span className="block text-[10px] text-[#1A1A1A]/70 mt-1 font-display">
              Across {stats.uniqueDevelopments} developments
            </span>
          </div>

          <div className="p-4 bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-xs">
            <span className="block font-sans text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/70">
              Transaction Mix
            </span>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-sans">
              <span className="px-1.5 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                {stats.bySaleType.newSale} New
              </span>
              <span className="px-1.5 py-0.5 rounded-xs bg-amber-50 text-amber-800 border border-amber-200">
                {stats.bySaleType.resale} Resale
              </span>
              <span className="px-1.5 py-0.5 rounded-xs bg-blue-50 text-blue-800 border border-blue-200">
                {stats.bySaleType.subSale} Sub
              </span>
            </div>
            <span className="block text-[10px] text-[#1A1A1A]/70 mt-1.5 font-display">
              Batch {stats.batch} of 4 merged
            </span>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#FAF8F5] border border-[#1A1A1A]/10 rounded-xs">
          <RefreshCw className="w-6 h-6 mx-auto text-[#8C7355] animate-spin mb-2" />
          <p className="font-display text-sm text-[#1A1A1A]/70">Loading verified URA data for {district}...</p>
        </div>
      )}

      {/* 6-month min / median / max transacted price trend for this district */}
      <URAMonthlyPriceChart
        district={district}
        districtName={districtName}
        propertyType={subjectPropertyType || propTypeFilter}
        saleType={saleTypeFilter}
        months={6}
      />

      {/* Top developments in this district spotlight */}
      {stats && stats.topProjects && stats.topProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/70">
              Most Active Developments in {district} (Click to Filter)
            </span>
            {selectedProjectFilter && (
              <button
                type="button"
                onClick={() => setSelectedProjectFilter(null)}
                className="text-[11px] font-display text-[#8C7355] hover:underline cursor-pointer"
              >
                Clear Project Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.topProjects.slice(0, 8).map((proj) => {
              const isSelected = selectedProjectFilter === proj.project;
              return (
                <button
                  key={proj.project}
                  type="button"
                  onClick={() => setSelectedProjectFilter(isSelected ? null : proj.project)}
                  className={`text-left px-3 py-2 rounded-xs border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-[#FAF8F5] border-[#1A1A1A]'
                      : 'bg-[#FAF8F5] text-[#1A1A1A] border-[#1A1A1A]/10 hover:border-[#8C7355]'
                  }`}
                >
                  <div className="font-display font-medium truncate max-w-[180px]">{proj.project}</div>
                  <div className="text-[10px] opacity-80 flex items-center gap-2 mt-0.5">
                    <span>${proj.medianPsf.toLocaleString()} psf</span>
                    <span>•</span>
                    <span>{proj.transactionCount} txns</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/70 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={saleTypeFilter}
            onChange={(e) => setSaleTypeFilter(e.target.value as any)}
            className="bg-[#FAF8F5] border border-[#1A1A1A]/15 rounded-xs px-2.5 py-1.5 text-xs font-display text-[#1A1A1A] cursor-pointer"
          >
            <option value="all">All Sale Types</option>
            <option value="1">New Sale (Developer)</option>
            <option value="3">Resale (Secondary)</option>
            <option value="2">Sub Sale</option>
          </select>

          <select
            value={propTypeFilter}
            onChange={(e) => setPropTypeFilter(e.target.value)}
            className="bg-[#FAF8F5] border border-[#1A1A1A]/15 rounded-xs px-2.5 py-1.5 text-xs font-display text-[#1A1A1A] cursor-pointer"
          >
            <option value="all">All Property Types</option>
            <option value="condo">Condominiums / Apartments</option>
            <option value="landed">Landed Houses</option>
          </select>
        </div>

        <span className="font-display text-xs text-[#1A1A1A]/70">
          Showing {displayedTransactions.length} recent transactions
        </span>
      </div>

      {/* Real-time Transactions Table */}
      <div className="overflow-x-auto border border-[#1A1A1A]/10 rounded-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#1A1A1A]/10 text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/70">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Project / Street</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Area</th>
              <th className="py-2.5 px-3">Floor</th>
              <th className="py-2.5 px-3">Price</th>
              <th className="py-2.5 px-3">PSF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]/5 text-xs font-display">
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((tx, idx) => (
                <tr
                  key={`${tx.project}-${tx.contractDate}-${idx}`}
                  className="hover:bg-[#FAF8F5]/60 transition-colors"
                >
                  <td className="py-2.5 px-3 whitespace-nowrap text-[#1A1A1A]/80 font-sans text-[11px]">
                    {tx.contractDateFormatted}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-[#1A1A1A]">{tx.project}</div>
                    <div className="text-[10px] text-[#1A1A1A]/60 font-sans truncate max-w-[160px]">{tx.street}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-xs text-[10px] font-sans font-medium ${
                        tx.typeOfSale === '1'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : tx.typeOfSale === '3'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {tx.typeOfSaleLabel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-medium">{tx.areaSqft.toLocaleString()} sqft</div>
                    <div className="text-[10px] text-[#1A1A1A]/60 font-sans">{tx.areaSqm} sqm</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-sans text-[11px] text-[#1A1A1A]/70">
                    {tx.floorRange}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-medium text-[#1A1A1A]">
                    ${tx.price.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-medium text-[#8C7355]">${tx.psf.toLocaleString()}</span>
                    <span className="text-[10px] text-[#1A1A1A]/60"> psf</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#1A1A1A]/60 font-display">
                  No transactions match current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer verification note */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1A1A1A]/10 text-[11px] text-[#1A1A1A]/70 font-display">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#8C7355] shrink-0" />
          <span>Government data source: Urban Redevelopment Authority (URA) DataService API v1.</span>
        </div>
        <div className="text-[10px] font-sans text-[#1A1A1A]/60">
          Daily token refreshed automatically • All 4 batches synchronized
        </div>
      </div>
    </div>
  );
};
