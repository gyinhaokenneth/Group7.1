import React, { useState, useMemo } from 'react';
import {
  TabType,
  ValuationFormValues,
  ValuationResult,
  TrajectoryPredictionParams,
  UserPersonaRole,
} from '../types';
import {
  SINGAPORE_DISTRICTS,
  getBalasTableFactor,
  getDistrictPriceStats,
} from '../data/singaporeDistricts';
import { GeminiInsightPanel } from './GeminiInsightPanel';
import { URATransactionFeed } from './URATransactionFeed';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Share2,
  Bookmark,
  Sparkles,
  TrendingUp,
  LineChart,
  DollarSign,
  Layers,
  MapPin,
  Building,
  Info,
  ShieldAlert,
  Download,
} from 'lucide-react';

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
  // Form Values State according to technical specification
  const [formValues, setFormValues] = useState<ValuationFormValues>({
    role: 'buyer',
    district: 'D09',
    propertyType: 'private',
    subType: 'Condominium',
    size: 1200,
    level: 'mid',
    tenure: 'freehold',
    leaseRemainingYears: 99,
    facing: 'north_south',
    amenityProximity: 'mrt_300m',
    condition: 'well_maintained',
    transportProximity: '5',
    // Seller inputs
    outstandingLoan: 450000,
    cpfRefund: 185000,
    sellerHoldingYears: 4,
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<ValuationResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Active district information
  const selectedDistrictInfo = useMemo(() => {
    return SINGAPORE_DISTRICTS[formValues.district] || SINGAPORE_DISTRICTS.D09;
  }, [formValues.district]);

  // Real-time location stats (Min, Median, Max)
  const locationStats = useMemo(() => {
    return getDistrictPriceStats(
      formValues.district,
      (formValues.propertyType === 'landed'
        ? 'landed'
        : formValues.propertyType === 'hdb'
        ? 'hdb'
        : 'private'),
      Number(formValues.size) || 1200
    );
  }, [formValues.district, formValues.propertyType, formValues.size]);

  // Bala's Table Leasehold Factor
  const leaseholdFactor = useMemo(() => {
    if (formValues.tenure === 'freehold' || formValues.tenure === '999yr') {
      return 1.0;
    }
    return getBalasTableFactor(formValues.leaseRemainingYears || 99);
  }, [formValues.tenure, formValues.leaseRemainingYears]);

  const handleRoleChange = (role: UserPersonaRole) => {
    setFormValues((prev) => ({ ...prev, role }));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.size || Number(formValues.size) <= 0) {
      setFormError('Please provide a valid property size in square feet.');
      return;
    }

    setFormError(null);
    setIsCalculating(true);

    setTimeout(() => {
      const sizeNum = Number(formValues.size);
      const district = selectedDistrictInfo;

      // Base PSF selection
      let basePsf = district.basePsfPrivate;
      if (formValues.propertyType === 'landed') basePsf = district.basePsfLanded;
      if (formValues.propertyType === 'hdb') basePsf = district.basePsfHdb || 680;

      // Facing Adjustments
      let facingMultiplier = 1.0;
      let facingFactorPct = 0;
      if (formValues.facing === 'north_south' || formValues.facing === 'sea_view' || formValues.facing === 'greenery') {
        facingMultiplier = formValues.facing === 'sea_view' ? 1.08 : 1.04;
        facingFactorPct = formValues.facing === 'sea_view' ? 8.0 : 4.0;
      } else if (formValues.facing === 'east') {
        facingMultiplier = 1.02;
        facingFactorPct = 2.0;
      } else if (formValues.facing === 'west') {
        facingMultiplier = 0.97;
        facingFactorPct = -3.0;
      }

      // Floor Level Adjustments
      let levelMultiplier = 1.0;
      let levelFactorPct = 0;
      if (formValues.level === 'penthouse') {
        levelMultiplier = 1.12;
        levelFactorPct = 12.0;
      } else if (formValues.level === 'high') {
        levelMultiplier = 1.05;
        levelFactorPct = 5.0;
      } else if (formValues.level === 'mid') {
        levelMultiplier = 1.0;
        levelFactorPct = 0;
      } else {
        levelMultiplier = 0.96;
        levelFactorPct = -4.0;
      }

      // Amenities Adjustments
      let transitMultiplier = 1.0;
      let transitFactorPct = 0;
      if (formValues.amenityProximity === 'mrt_300m') {
        transitMultiplier = 1.06;
        transitFactorPct = 6.0;
      } else if (formValues.amenityProximity === 'school_1km') {
        transitMultiplier = 1.04;
        transitFactorPct = 4.0;
      } else if (formValues.amenityProximity === 'mall_hub') {
        transitMultiplier = 1.05;
        transitFactorPct = 5.0;
      }

      // Condition Adjustments
      let conditionMultiplier = 1.0;
      let conditionFactorPct = 0;
      if (formValues.condition === 'designer') {
        conditionMultiplier = 1.08;
        conditionFactorPct = 8.0;
      } else if (formValues.condition === 'well_maintained') {
        conditionMultiplier = 1.02;
        conditionFactorPct = 2.0;
      } else if (formValues.condition === 'needs_overhaul') {
        conditionMultiplier = 0.93;
        conditionFactorPct = -7.0;
      }

      // Leasehold decay multiplier via Bala's Table
      const leaseMultiplier = leaseholdFactor;
      const leaseFactorPct = Number(((leaseMultiplier - 1.0) * 100).toFixed(1));

      // Calculate composite median PSF
      const compositePsf = Math.round(
        basePsf *
          facingMultiplier *
          levelMultiplier *
          transitMultiplier *
          conditionMultiplier *
          leaseMultiplier
      );

      const psfMin = Math.round(compositePsf * district.minPsfMultiplier);
      const psfMax = Math.round(compositePsf * district.maxPsfMultiplier);
      const estimatedMedian = Math.round(compositePsf * sizeNum);
      const estimatedMin = Math.round(psfMin * sizeNum);
      const estimatedMax = Math.round(psfMax * sizeNum);

      const annualYieldRate =
        formValues.propertyType === 'landed' ? 2.7 : formValues.propertyType === 'hdb' ? 4.8 : 3.6;
      const monthlyRentalEstimate = Math.round((estimatedMedian * (annualYieldRate / 100)) / 12);

      // Seller Proceeds Calculation if role === 'seller'
      let sellerNetProceeds = undefined;
      if (formValues.role === 'seller') {
        const sellingPrice = estimatedMedian;
        const outstandingLoan = formValues.outstandingLoan || 0;
        const cpfRefund = formValues.cpfRefund || 0;
        const agentCommission = Math.round(sellingPrice * 0.02); // standard 2%
        const legalFee = 3000;

        // Seller's Stamp Duty (SSD)
        const holdingYears = formValues.sellerHoldingYears || 4;
        let ssdRate = 0;
        if (holdingYears <= 1) ssdRate = 0.12;
        else if (holdingYears <= 2) ssdRate = 0.08;
        else if (holdingYears <= 3) ssdRate = 0.04;
        else ssdRate = 0.0;

        const ssdAmount = Math.round(sellingPrice * ssdRate);
        const netCashInHand = Math.max(
          0,
          sellingPrice - outstandingLoan - cpfRefund - agentCommission - legalFee - ssdAmount
        );

        sellerNetProceeds = {
          sellingPrice,
          outstandingLoan,
          cpfRefund,
          agentCommission,
          legalFee,
          ssdRate: ssdRate * 100,
          ssdAmount,
          netCashInHand,
        };
      }

      const result: ValuationResult = {
        role: formValues.role,
        estimatedMin,
        estimatedMax,
        estimatedMedian,
        psfMin,
        psfMax,
        psfMedian: compositePsf,
        confidenceScore: 97.8,
        annualYieldRate,
        monthlyRentalEstimate,
        facingFactorPct,
        transitFactorPct,
        levelFactorPct,
        conditionFactorPct,
        leaseFactorPct,
        districtMultiplier: Number((compositePsf / basePsf).toFixed(2)),
        districtPriceIndex: district.districtPriceIndex,
        nationalPriceIndex: district.nationalIndex,
        indexSpreadPct: locationStats.spreadVsNational,
        sellerNetProceeds,
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      setCalculationResult(result);
      setIsCalculating(false);
      setShowResultModal(true);
      setSavedSuccess(false);
    }, 550);
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
      <section className="relative w-full overflow-hidden bg-[#F5F2ED] pt-10 md:pt-16 pb-16 md:pb-24 border-b border-[#1A1A1A]/10">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0 opacity-10 pointer-events-none mix-blend-multiply"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXdx5b7y4IyDp_uwJIUo9fX2KPJEXWpO-jqmlxEMdmkbvS_Anmw1vBc-Ch5kuJNAbDLcEVz0G-ESu7FqqOVYxv3OfanouPJwaTDtwllrc1_SbGddyLzueEIxGGsx4dySHwZiYGzuyeLon7RWSrWL1F3GAnzyPWFwXwMuE0GFqfRPT4hXt92zB-TEnOKCQOT9_YIS1b4dQ2ejvKcVLiUH4JZ0iVxfTImfPzwZNtUEytnbG-OB-e91Owag')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5F2ED] via-[#F5F2ED]/90 to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 max-w-[1240px] mx-auto px-5 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Heading & Role Context */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
              Real Estate Intelligence • All Singapore Districts
            </span>
            <h1 className="font-display text-[34px] sm:text-[42px] md:text-[48px] leading-[1.08] tracking-tight font-light text-[#1A1A1A]">
              Residential Property <br className="hidden sm:inline" />
              <span className="italic font-normal">Analytics & Appraisal</span>
            </h1>
            <div className="editorial-rule my-1" />
            <p className="text-[16px] md:text-[17px] leading-[1.65] text-[#1A1A1A]/80 font-display">
              Tailored for <strong>Buyers, Sellers, and Investors</strong>. Compute leasehold decay, evaluate net seller proceeds, benchmark against live URA transaction records, and generate Gemini AI macroeconomic advisories.
            </p>

            {/* Quick Live Indicators */}
            <div className="p-4 bg-[#FFFFFF] rounded-xs border border-[#1A1A1A]/10 shadow-2xs space-y-2 text-[12px] font-sans">
              <div className="flex justify-between items-center text-[#1A1A1A]">
                <span className="text-[#8C7355] font-bold uppercase tracking-[0.15em]">National Private PPI</span>
                <span className="font-bold">196.4 pts (+3.2% YoY)</span>
              </div>
              <div className="flex justify-between items-center text-[#1A1A1A]">
                <span className="text-[#8C7355] font-bold uppercase tracking-[0.15em]">National HDB Resale RPI</span>
                <span className="font-bold">189.2 pts (+4.8% YoY)</span>
              </div>
              <div className="flex justify-between items-center text-[#1A1A1A]">
                <span className="text-[#8C7355] font-bold uppercase tracking-[0.15em]">Selected District ({selectedDistrictInfo.code})</span>
                <span className="font-bold">{selectedDistrictInfo.districtPriceIndex} pts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Full Feature Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#FFFFFF] rounded-sm p-6 sm:p-8 shadow-[0_15px_35px_-10px_rgba(26,26,26,0.06)] border border-[#1A1A1A]/10">
              {/* Role Selection Switcher (Mandated by Technical Spec) */}
              <div className="mb-6">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-2">
                  Select User Persona
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'buyer', label: 'Property Buyer' },
                    { key: 'seller', label: 'Property Seller' },
                    { key: 'investor', label: 'Property Investor' },
                  ].map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => handleRoleChange(r.key as UserPersonaRole)}
                      className={`py-2 px-2 text-center text-[11px] font-sans font-bold uppercase tracking-[0.12em] rounded-xs border transition-all cursor-pointer ${
                        formValues.role === r.key
                          ? 'bg-[#1A1A1A] text-[#F5F2ED] border-[#1A1A1A] shadow-xs'
                          : 'bg-[#FAF8F5] text-[#1A1A1A]/70 border-[#1A1A1A]/15 hover:border-[#8C7355]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="mb-6 p-3 bg-red-50 border-l-2 border-red-500 text-red-800 text-sm font-display">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* 1. Location / District */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="form-district"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/80"
                  >
                    Location / District
                  </label>
                  <select
                    id="form-district"
                    value={formValues.district}
                    onChange={(e) => setFormValues({ ...formValues, district: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2.5 text-[14px] font-display text-[#1A1A1A] cursor-pointer"
                  >
                    <optgroup label="Core Central Region (CCR)">
                      <option value="D01">D01 - Marina Bay / Boat Quay / Raffles Place</option>
                      <option value="D02">D02 - Chinatown / Tanjong Pagar</option>
                      <option value="D04">D04 - Harbourfront / Telok Blangah / Sentosa</option>
                      <option value="D09">D09 - Orchard / River Valley / Cairnhill</option>
                      <option value="D10">D10 - Bukit Timah / Holland / Tanglin</option>
                      <option value="D11">D11 - Newton / Novena / Dunearn</option>
                    </optgroup>
                    <optgroup label="Rest of Central Region (RCR)">
                      <option value="D03">D03 - Queenstown / Tiong Bahru / Alexandra</option>
                      <option value="D05">D05 - Buona Vista / West Coast / Clementi</option>
                      <option value="D12">D12 - Balestier / Toa Payoh / Serangoon</option>
                      <option value="D14">D14 - Geylang / Eunos / Paya Lebar</option>
                      <option value="D15">D15 - East Coast / Marine Parade / Katong</option>
                      <option value="D20">D20 - Bishan / Ang Mo Kio / Thomson</option>
                      <option value="D21">D21 - Upper Bukit Timah / Clementi Park</option>
                    </optgroup>
                    <optgroup label="Outside Central Region (OCR)">
                      <option value="D19">D19 - Serangoon / Hougang / Punggol / Sengkang</option>
                      <option value="D22">D22 - Jurong / Boon Lay / Lakeside</option>
                      <option value="D23">D23 - Bukit Batok / Bukit Panjang / Hillview</option>
                      <option value="D27">D27 - Yishun / Sembawang / Canberra</option>
                    </optgroup>
                  </select>
                </div>

                {/* 2. Property Type */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="form-prop-type"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/80"
                  >
                    Property Type
                  </label>
                  <select
                    id="form-prop-type"
                    value={formValues.propertyType}
                    onChange={(e) => setFormValues({ ...formValues, propertyType: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2.5 text-[14px] font-display text-[#1A1A1A] cursor-pointer"
                  >
                    <option value="private">Private (Condominium / Apartment)</option>
                    <option value="landed">Landed (Bungalow / Semi-D / Terrace)</option>
                    <option value="hdb">HDB (Public Housing Resale)</option>
                  </select>
                </div>

                {/* 3. Size (Sqft + Sqm conversion) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="form-size"
                      className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/80"
                    >
                      Size (Sqft)
                    </label>
                    <span className="font-sans text-[10px] text-[#8C7355] font-semibold">
                      ≈ {((Number(formValues.size) || 0) * 0.0929).toFixed(1)} sqm
                    </span>
                  </div>
                  <input
                    id="form-size"
                    type="number"
                    value={formValues.size}
                    onChange={(e) =>
                      setFormValues({ ...formValues, size: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                    placeholder="e.g. 1200"
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2.5 text-[14px] font-display text-[#1A1A1A]"
                  />
                </div>

                {/* 4. Floor Level */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="form-level"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/80"
                  >
                    Floor Level
                  </label>
                  <select
                    id="form-level"
                    value={formValues.level}
                    onChange={(e) => setFormValues({ ...formValues, level: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2.5 text-[14px] font-display text-[#1A1A1A] cursor-pointer"
                  >
                    <option value="low">Ground / Low Floor (Level 1–5)</option>
                    <option value="mid">Mid Floor (Level 6–15)</option>
                    <option value="high">High Floor (Level 16–25)</option>
                    <option value="penthouse">Penthouse / Ultra High (Level 26+)</option>
                  </select>
                </div>

                {/* 5. Tenure */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="form-tenure"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/80"
                  >
                    Tenure
                  </label>
                  <select
                    id="form-tenure"
                    value={formValues.tenure}
                    onChange={(e) => setFormValues({ ...formValues, tenure: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2.5 text-[14px] font-display text-[#1A1A1A] cursor-pointer"
                  >
                    <option value="freehold">Freehold (Estate in Perpetuity)</option>
                    <option value="999yr">999-Year Leasehold</option>
                    <option value="99yr">99-Year Leasehold</option>
                  </select>
                </div>

                {/* 6. Lease Remaining & Bala's Table */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="form-lease-years"
                      className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/80"
                    >
                      Years of Lease Remaining
                    </label>
                    <span className="font-sans text-[10px] text-[#8C7355] font-semibold">
                      Bala's Factor: {(leaseholdFactor * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    id="form-lease-years"
                    type="number"
                    min={30}
                    max={999}
                    disabled={formValues.tenure === 'freehold' || formValues.tenure === '999yr'}
                    value={formValues.tenure === 'freehold' ? 999 : formValues.leaseRemainingYears}
                    onChange={(e) =>
                      setFormValues({ ...formValues, leaseRemainingYears: Number(e.target.value) || 99 })
                    }
                    className="w-full bg-[#FFFFFF] disabled:bg-[#F5F2ED] border border-[#1A1A1A]/20 rounded-xs p-2.5 text-[14px] font-display text-[#1A1A1A]"
                  />
                </div>

                {/* 7. Facing Orientation */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="form-facing"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/80"
                  >
                    Facing Orientation
                  </label>
                  <select
                    id="form-facing"
                    value={formValues.facing}
                    onChange={(e) => setFormValues({ ...formValues, facing: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2.5 text-[14px] font-display text-[#1A1A1A] cursor-pointer"
                  >
                    <option value="north_south">North-South (Optimal Breeze, No West Sun)</option>
                    <option value="sea_view">South / Panoramic Sea View</option>
                    <option value="greenery">Unblocked Greenery / Nature View</option>
                    <option value="east">East (Gentle Morning Sun)</option>
                    <option value="west">West (Afternoon Sun Exposure)</option>
                  </select>
                </div>

                {/* 8. Proximity to Amenities */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="form-amenities"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/80"
                  >
                    Proximity to Key Amenities
                  </label>
                  <select
                    id="form-amenities"
                    value={formValues.amenityProximity}
                    onChange={(e) => setFormValues({ ...formValues, amenityProximity: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2.5 text-[14px] font-display text-[#1A1A1A] cursor-pointer"
                  >
                    <option value="mrt_300m">&lt; 300m to MRT Station (Sheltered Walk)</option>
                    <option value="school_1km">Within 1km of Top Primary School</option>
                    <option value="mall_hub">Adjacent to Major Retail Mall & Transit Interchange</option>
                    <option value="park_nature">Park Connector & Nature Reserve Frontage</option>
                  </select>
                </div>

                {/* 9. Maintenance & Condition */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label
                    htmlFor="form-condition"
                    className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/80"
                  >
                    Maintenance & Renovation Condition
                  </label>
                  <select
                    id="form-condition"
                    value={formValues.condition}
                    onChange={(e) => setFormValues({ ...formValues, condition: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2.5 text-[14px] font-display text-[#1A1A1A] cursor-pointer"
                  >
                    <option value="well_maintained">Well-Maintained (Move-in Condition, minor touch-ups)</option>
                    <option value="designer">High-End Designer Renovation (&lt; 3 years old)</option>
                    <option value="original">Original Developer Bare / Basic Condition</option>
                    <option value="needs_overhaul">Needs Major Overhaul / Heavy Renovation</option>
                  </select>
                </div>

                {/* Conditional Seller Inputs if role === 'seller' */}
                {formValues.role === 'seller' && (
                  <div className="md:col-span-2 p-4 bg-[#FAF8F5] rounded-xs border border-[#8C7355]/30 space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[#8C7355]" />
                      <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C7355]">
                        Seller Conveyance & Net Proceeds Ledger
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/70 block mb-1">
                          Outstanding Bank Loan ($)
                        </label>
                        <input
                          type="number"
                          value={formValues.outstandingLoan}
                          onChange={(e) =>
                            setFormValues({ ...formValues, outstandingLoan: Number(e.target.value) || 0 })
                          }
                          className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2 text-sm font-display"
                        />
                      </div>
                      <div>
                        <label className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/70 block mb-1">
                          CPF Principal + 2.5% Accrued ($)
                        </label>
                        <input
                          type="number"
                          value={formValues.cpfRefund}
                          onChange={(e) =>
                            setFormValues({ ...formValues, cpfRefund: Number(e.target.value) || 0 })
                          }
                          className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2 text-sm font-display"
                        />
                      </div>
                      <div>
                        <label className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/70 block mb-1">
                          Years Held (SSD Check)
                        </label>
                        <select
                          value={formValues.sellerHoldingYears}
                          onChange={(e) =>
                            setFormValues({ ...formValues, sellerHoldingYears: Number(e.target.value) || 4 })
                          }
                          className="w-full bg-[#FFFFFF] border border-[#1A1A1A]/20 rounded-xs p-2 text-sm font-display"
                        >
                          <option value="1">≤ 1 Year (12% SSD)</option>
                          <option value="2">1 to 2 Years (8% SSD)</option>
                          <option value="3">2 to 3 Years (4% SSD)</option>
                          <option value="4">&gt; 3 Years (0% SSD - Exempt)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="md:col-span-2 mt-2">
                  <button
                    id="valuation-calculate-btn"
                    type="submit"
                    disabled={isCalculating}
                    className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-4 rounded-xs font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-[#F5F2ED] border-t-transparent rounded-full" />
                        Synthesizing URA Ledgers & Price Indices...
                      </span>
                    ) : (
                      <>
                        <span>
                          Run {formValues.role === 'buyer' ? 'Buyer Acquisition' : formValues.role === 'seller' ? 'Seller Liquidation' : 'Market'} Appraisal
                        </span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Official Singapore URA DataService Live Transaction Registry */}
      <section className="max-w-[1240px] mx-auto px-5 md:px-12 pb-12">
        <URATransactionFeed
          district={formValues.district}
          districtName={selectedDistrictInfo.name}
          subjectPropertyType={formValues.propertyType}
        />
      </section>

      {/* Gemini AI Insight Panel Section */}
      <section className="max-w-[1240px] mx-auto px-5 md:px-12 pb-16">
        <GeminiInsightPanel
          role={formValues.role}
          district={formValues.district}
          districtName={selectedDistrictInfo.name}
          propertyType={formValues.propertyType}
          size={Number(formValues.size) || 1200}
          level={formValues.level}
          tenure={formValues.tenure}
          leaseRemaining={formValues.leaseRemainingYears}
          facing={formValues.facing}
          amenities={formValues.amenityProximity}
          condition={formValues.condition}
          valuationMedian={locationStats.medianPrice}
          valuationMin={locationStats.minPrice}
          valuationMax={locationStats.maxPrice}
          medianPsf={locationStats.medianPsf}
          trajectoryCAGR={selectedDistrictInfo.annualGrowthRate}
        />
      </section>

      {/* Trajectory Predictor Banner for Home Buyers */}
      <section className="max-w-[1240px] mx-auto px-5 md:px-12 pb-20">
        <div className="bg-[#1A1A1A] text-[#F5F2ED] rounded-sm p-8 md:p-12 border border-[#8C7355]/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl relative z-10">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-2">
              Forward Horizon Modeling • Spec Section 4
            </span>
            <h3 className="font-display text-[28px] md:text-[34px] font-light text-[#F5F2ED] mb-3">
              Home Buyer Price Trajectory & Confidence Predictor
            </h3>
            <p className="font-display text-[15px] md:text-[16px] text-[#F5F2ED]/75 leading-relaxed">
              Model price trajectories with 90% confidence intervals for {formValues.district} across 1 to 10 years. Includes loan amortization curves, rental cashflow yield compounding, and Seller's Stamp Duty (SSD) holding milestones.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              id="launch-trajectory-banner-btn"
              onClick={() => {
                if (onPredictTrajectory) {
                  onPredictTrajectory({
                    currentPrice: locationStats.medianPrice,
                    sqft: Number(formValues.size) || 1200,
                    propertyType: formValues.propertyType,
                    district: formValues.district.toLowerCase(),
                  });
                } else {
                  onNavigateTab('trajectory');
                }
              }}
              className="bg-[#8C7355] hover:bg-[#A38A6D] text-[#F5F2ED] px-7 py-4 rounded-xs font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <span>Forecast Trajectory (1–10 Yrs)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Valuation Result Modal / Full Report */}
      {showResultModal && calculationResult && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F5F2ED] text-[#1A1A1A] rounded-sm max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-[#1A1A1A]/20 relative animate-scaleUp my-8 max-h-[90vh] overflow-y-auto">
            <div className="relative z-10 flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-6">
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
                  Automated Valuation Report • {calculationResult.role.toUpperCase()}
                </span>
                <h3 className="font-display text-[28px] font-light text-[#1A1A1A]">
                  Certified Market Valuation
                </h3>
              </div>
              <button
                id="close-valuation-modal-btn"
                onClick={() => setShowResultModal(false)}
                className="p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-full hover:bg-[#E2DFD8]/40 cursor-pointer"
                aria-label="Close valuation report"
              >
                ✕
              </button>
            </div>

            {/* Estimated Value Hero Card */}
            <div className="relative z-10 bg-[#FFFFFF] rounded-sm p-6 border border-[#1A1A1A]/10 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                <span className="font-sans text-[10px] uppercase font-bold text-[#8C7355] tracking-[0.2em]">
                  Indicative Valuation Median
                </span>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-sm bg-[#E2DFD8] text-[#1A1A1A]">
                  {calculationResult.confidenceScore}% Algorithm Confidence
                </span>
              </div>

              <div className="font-display text-[38px] sm:text-[46px] font-light text-[#1A1A1A] leading-none mb-2">
                ${calculationResult.estimatedMedian.toLocaleString()}
              </div>

              <div className="font-display text-[15px] text-[#1A1A1A]/70">
                Recommended Price Corridor:{' '}
                <strong className="text-[#1A1A1A] font-semibold">
                  ${calculationResult.estimatedMin.toLocaleString()} – ${calculationResult.estimatedMax.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* If Seller Mode, Display Net Proceeds Breakdown */}
            {calculationResult.sellerNetProceeds && (
              <div className="relative z-10 bg-[#FAF8F5] p-5 rounded-xs border-2 border-[#8C7355]/40 mb-6">
                <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-2 mb-3">
                  <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C7355]">
                    Seller Net Proceeds Breakdown
                  </h4>
                  <span className="text-[11px] font-sans text-emerald-800 font-bold">
                    SSD Status: {calculationResult.sellerNetProceeds.ssdRate === 0 ? 'Exempt (0%)' : `${calculationResult.sellerNetProceeds.ssdRate}%`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                  <div className="p-2 bg-[#FFFFFF] rounded-xs border border-[#1A1A1A]/10">
                    <span className="text-[10px] uppercase text-[#1A1A1A]/60 font-sans block">Selling Price</span>
                    <span className="font-display text-[16px] text-[#1A1A1A]">
                      ${calculationResult.sellerNetProceeds.sellingPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-[#FFFFFF] rounded-xs border border-[#1A1A1A]/10">
                    <span className="text-[10px] uppercase text-[#1A1A1A]/60 font-sans block">Bank Loan</span>
                    <span className="font-display text-[16px] text-red-700">
                      -${calculationResult.sellerNetProceeds.outstandingLoan.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-[#FFFFFF] rounded-xs border border-[#1A1A1A]/10">
                    <span className="text-[10px] uppercase text-[#1A1A1A]/60 font-sans block">CPF Refund</span>
                    <span className="font-display text-[16px] text-red-700">
                      -${calculationResult.sellerNetProceeds.cpfRefund.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-[#FFFFFF] rounded-xs border border-[#1A1A1A]/10">
                    <span className="text-[10px] uppercase text-[#1A1A1A]/60 font-sans block">Agent (2%) + Legal</span>
                    <span className="font-display text-[16px] text-red-700">
                      -${(calculationResult.sellerNetProceeds.agentCommission + calculationResult.sellerNetProceeds.legalFee).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#FFFFFF] rounded-xs border border-emerald-600/30 flex justify-between items-center">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]">
                    Estimated Net Cash in Hand
                  </span>
                  <span className="font-display text-[24px] font-normal text-emerald-800">
                    ${calculationResult.sellerNetProceeds.netCashInHand.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Metric Breakdown Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-[14px]">
              <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#1A1A1A]/10">
                <div className="font-sans text-[#8C7355] text-[10px] uppercase font-bold tracking-[0.15em]">Unit PSF</div>
                <div className="font-display text-[22px] font-normal text-[#1A1A1A] mt-1">
                  ${calculationResult.psfMedian} psf
                </div>
                <div className="font-sans text-[11px] text-[#1A1A1A]/60 mt-0.5">
                  Range: ${calculationResult.psfMin} – ${calculationResult.psfMax}
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#1A1A1A]/10">
                <div className="font-sans text-[#8C7355] text-[10px] uppercase font-bold tracking-[0.15em]">Est. Gross Rental</div>
                <div className="font-display text-[22px] font-normal text-[#8C7355] mt-1">
                  ${calculationResult.monthlyRentalEstimate.toLocaleString()}/mo
                </div>
                <div className="font-sans text-[11px] text-[#1A1A1A]/60 mt-0.5">
                  {calculationResult.annualYieldRate}% Gross Yield
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#1A1A1A]/10 col-span-2 sm:col-span-1">
                <div className="font-sans text-[#8C7355] text-[10px] uppercase font-bold tracking-[0.15em]">Location Index</div>
                <div className="font-display text-[22px] font-normal text-[#1A1A1A] mt-1">
                  {calculationResult.districtPriceIndex} pts
                </div>
                <div className="font-sans text-[11px] text-[#1A1A1A]/60 mt-0.5">
                  Nat'l: {calculationResult.nationalPriceIndex} ({calculationResult.indexSpreadPct >= 0 ? `+${calculationResult.indexSpreadPct}%` : `${calculationResult.indexSpreadPct}%`})
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex flex-col gap-3 pt-2">
              <button
                id="modal-predict-trajectory-btn"
                onClick={() => {
                  setShowResultModal(false);
                  if (onPredictTrajectory) {
                    onPredictTrajectory({
                      currentPrice: calculationResult.estimatedMedian,
                      sqft: Number(formValues.size) || 1200,
                      propertyType: formValues.propertyType,
                      district: formValues.district.toLowerCase(),
                      estimatedGrossYield: calculationResult.annualYieldRate,
                    });
                  } else {
                    onNavigateTab('trajectory');
                  }
                }}
                className="w-full bg-[#8C7355] hover:bg-[#A38A6D] text-[#F5F2ED] py-3.5 px-4 rounded-xs font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-center transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <TrendingUp size={15} />
                <span>Forecast Price Trajectory with Confidence Intervals (1–10 Yrs) →</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="book-certified-appraisal-btn"
                  onClick={() => {
                    setShowResultModal(false);
                    onOpenBookAppraisal(formValues);
                  }}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-3.5 px-4 rounded-xs font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-center transition-colors cursor-pointer"
                >
                  Book Valuation Surveyor Consultation
                </button>
                <button
                  id="save-valuation-record-btn"
                  onClick={handleSaveResult}
                  className="sm:w-auto bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] py-3.5 px-5 rounded-xs font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 size={16} className="text-[#8C7355]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} />
                      <span>Save Valuation</span>
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
