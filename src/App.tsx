/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TabType,
  ValuationFormValues,
  ValuationResult,
  SavedTrajectoryPrediction,
  TrajectoryPredictionParams,
} from './types';
import { TopNavBar } from './components/TopNavBar';
import { Footer } from './components/Footer';
import { ValuationView } from './components/ValuationView';
import { PriceTrajectoryPredictor } from './components/PriceTrajectoryPredictor';
import { RentView } from './components/RentView';
import { MarketTrendsView } from './components/MarketTrendsView';
import { AboutView } from './components/AboutView';
import { BookAppraisalModal } from './components/BookAppraisalModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AccountModal } from './components/AccountModal';
import { DisqusComments } from './components/DisqusComments';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('valuation');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [prefillAppraisal, setPrefillAppraisal] = useState<Partial<ValuationFormValues> | undefined>(undefined);
  const [trajectoryPrefill, setTrajectoryPrefill] = useState<Partial<TrajectoryPredictionParams> | undefined>(undefined);

  // Persistent user state in memory
  const [savedValuations, setSavedValuations] = useState<
    Array<{ id: string; result: ValuationResult; values: ValuationFormValues }>
  >([
    {
      id: 'val-seed-1',
      values: {
        propertyType: 'private',
        size: 1200,
        facing: 'north',
        transportProximity: '5',
      },
      result: {
        estimatedMin: 1840000,
        estimatedMax: 2040000,
        estimatedMedian: 1940000,
        psfMin: 1533,
        psfMax: 1700,
        confidenceScore: 97.4,
        annualYieldRate: 3.8,
        monthlyRentalEstimate: 6140,
        facingFactorPct: 4.0,
        transitFactorPct: 7.0,
        districtMultiplier: 1.15,
        timestamp: 'Aug 24, 2024',
      },
    },
  ]);

  const [savedPredictions, setSavedPredictions] = useState<SavedTrajectoryPrediction[]>([
    {
      id: 'pred-seed-1',
      title: 'Marina Bay Waterfront Condo (5-Yr Trajectory)',
      createdAt: 'Aug 26, 2024',
      result: {
        params: {
          currentPrice: 2450000,
          sqft: 1100,
          propertyType: 'private',
          district: 'marina',
          holdingYears: 5,
          scenario: 'historical',
          customAnnualGrowth: 5.6,
          includeRentalYield: true,
          estimatedGrossYield: 3.8,
          mortgageInterestRate: 3.2,
          downPaymentPct: 25,
        },
        startPrice: 2450000,
        finalProjectedValue: 3217000,
        finalProjectedValueLow: 2959000,
        finalProjectedValueHigh: 3474000,
        totalCapitalGain: 767000,
        totalGainPct: 31.3,
        annualizedCAGR: 5.6,
        finalPsf: 2925,
        yearlyBreakdown: [],
        cumulativeRent: 485000,
        estimatedNetProfit: 1252000,
        confidenceRating: 94.8,
        recommendationTag: 'High-Growth Capital Catalyst',
        timestamp: 'Aug 26, 2024',
      },
    },
  ]);

  const [favoritedIds, setFavoritedIds] = useState<string[]>(['prop-1', 'prop-3']);
  const [bookings, setBookings] = useState<any[]>([
    {
      id: 'APP-842910',
      fullName: 'Julian Vance',
      email: 'julian@investor.com',
      phone: '+1 (555) 019-2834',
      propertyAddress: '18 Marina Boulevard, #34-02',
      propertyType: 'condominium',
      preferredDate: '2024-09-15',
      preferredTime: '10:00 AM',
      consultationType: 'in-person',
      surveyor: 'Eleanor Vance, Senior Chartered Surveyor (RICS)',
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleOpenBookAppraisal = (prefill?: Partial<ValuationFormValues>) => {
    setPrefillAppraisal(prefill);
    setIsBookModalOpen(true);
  };

  const handleOpenTrajectoryWithData = (params: Partial<TrajectoryPredictionParams>) => {
    setTrajectoryPrefill(params);
    setCurrentTab('trajectory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveValuation = (result: ValuationResult, values: ValuationFormValues) => {
    const newItem = {
      id: `val-${Date.now()}`,
      result,
      values,
    };
    setSavedValuations((prev) => [newItem, ...prev]);
  };

  const handleSavePrediction = (prediction: SavedTrajectoryPrediction) => {
    setSavedPredictions((prev) => [prediction, ...prev]);
  };

  const handleToggleFavorite = (propertyId: string) => {
    setFavoritedIds((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  const handleRemoveValuation = (id: string) => {
    setSavedValuations((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRemovePrediction = (id: string) => {
    setSavedPredictions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRemoveFavorite = (id: string) => {
    setFavoritedIds((prev) => prev.filter((pId) => pId !== id));
  };

  const handleBookingConfirmed = (booking: any) => {
    setBookings((prev) => [booking, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#8C7355]/25 selection:text-[#1A1A1A]">
      {/* Primary Navigation Header */}
      <TopNavBar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenBookModal={() => handleOpenBookAppraisal()}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Main View Container */}
      <div className="flex-grow">
        {currentTab === 'valuation' && (
          <ValuationView
            onNavigateTab={setCurrentTab}
            onOpenBookAppraisal={handleOpenBookAppraisal}
            onSaveValuation={handleSaveValuation}
            onPredictTrajectory={handleOpenTrajectoryWithData}
          />
        )}

        {currentTab === 'trajectory' && (
          <PriceTrajectoryPredictor
            onNavigateTab={setCurrentTab}
            onOpenBookAppraisal={handleOpenBookAppraisal}
            onSavePrediction={handleSavePrediction}
            initialParams={trajectoryPrefill}
          />
        )}

        {currentTab === 'rent' && (
          <RentView
            onOpenBookAppraisal={() => handleOpenBookAppraisal()}
            onFavoriteToggle={handleToggleFavorite}
            favoritedIds={favoritedIds}
          />
        )}

        {currentTab === 'trends' && (
          <MarketTrendsView
            onOpenBookAppraisal={() => handleOpenBookAppraisal()}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'about' && (
          <AboutView
            onOpenBookAppraisal={() => handleOpenBookAppraisal()}
          />
        )}
      </div>

      {/* Disqus discussion at the bottom of every screen */}
      <DisqusComments currentTab={currentTab} />

      {/* Shared Footer across all screens */}
      <Footer />

      {/* Interactive Modals */}
      <BookAppraisalModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        prefill={prefillAppraisal}
        onBookingConfirmed={handleBookingConfirmed}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        savedValuations={savedValuations}
        savedPredictions={savedPredictions}
        favoritedIds={favoritedIds}
        bookings={bookings}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRemoveValuation={handleRemoveValuation}
        onRemovePrediction={handleRemovePrediction}
        onRemoveFavorite={handleRemoveFavorite}
      />
    </div>
  );
}
