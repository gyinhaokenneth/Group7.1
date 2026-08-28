import { URADistrictStats, URATransaction, URAStatusResponse } from '../types';

/**
 * Client-side URA DataService API client
 * Connects directly to our full-stack server proxy at /api/ura
 */

export async function fetchURAStatus(): Promise<URAStatusResponse | null> {
  try {
    const res = await fetch('/api/ura/status');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch URA status:', err);
    return null;
  }
}

export async function fetchURADistrictStats(districtCode: string): Promise<URADistrictStats | null> {
  try {
    const res = await fetch(`/api/ura/district-stats?district=${encodeURIComponent(districtCode)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.stats || null;
  } catch (err) {
    console.warn(`Failed to fetch URA district stats for ${districtCode}:`, err);
    return null;
  }
}

export async function fetchURATransactions(
  districtCode: string,
  options: { propertyType?: string; saleType?: string; limit?: number } = {}
): Promise<{ totalMatching: number; transactions: URATransaction[] }> {
  try {
    const params = new URLSearchParams({
      district: districtCode,
      propertyType: options.propertyType || 'all',
      saleType: options.saleType || 'all',
      limit: String(options.limit || 50),
    });
    const res = await fetch(`/api/ura/transactions?${params.toString()}`);
    if (!res.ok) return { totalMatching: 0, transactions: [] };
    const data = await res.json();
    return {
      totalMatching: data.totalMatching || 0,
      transactions: data.transactions || [],
    };
  } catch (err) {
    console.warn(`Failed to fetch URA transactions for ${districtCode}:`, err);
    return { totalMatching: 0, transactions: [] };
  }
}

export async function syncAllURABatches(): Promise<{
  success: boolean;
  totalDevelopments: number;
  totalTransactions: number;
  elapsedMs: number;
} | null> {
  try {
    const res = await fetch('/api/ura/sync', { method: 'POST' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to sync all URA batches:', err);
    return null;
  }
}
