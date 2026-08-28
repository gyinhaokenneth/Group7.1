import React, { useState, useMemo } from 'react';
import { Property, PropertyType } from '../types';
import { PROPERTIES_DATA } from '../data/properties';
import { Heart, X, Check, Calendar, Phone, Mail, ChevronLeft, ChevronRight, Bed, Bath, Train, MapPin, Maximize2 } from 'lucide-react';

interface RentViewProps {
  onOpenBookAppraisal: () => void;
  onFavoriteToggle?: (propertyId: string) => void;
  favoritedIds?: string[];
}

export const RentView: React.FC<RentViewProps> = ({
  onOpenBookAppraisal,
  onFavoriteToggle,
  favoritedIds = [],
}) => {
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(['apartment', 'condominium']);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Gym', 'Near MRT']);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Selected property for detail modal
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  // Viewing schedule state
  const [scheduleSent, setScheduleSent] = useState(false);
  const [viewingDate, setViewingDate] = useState('');
  const [viewingName, setViewingName] = useState('');
  const [viewingPhone, setViewingPhone] = useState('');

  const togglePropertyType = (type: PropertyType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedTypes(['apartment', 'condominium', 'landed']);
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenities([]);
    setCurrentPage(1);
  };

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return PROPERTIES_DATA.filter((prop) => {
      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(prop.propertyType)) {
        return false;
      }
      // Price min
      if (minPrice !== '' && prop.price < Number(minPrice)) {
        return false;
      }
      // Price max
      if (maxPrice !== '' && prop.price > Number(maxPrice)) {
        return false;
      }
      // Amenities filter (must have all selected amenities)
      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every((amenity) => prop.amenities.includes(amenity));
        if (!hasAll) return false;
      }
      return true;
    });
  }, [selectedTypes, minPrice, maxPrice, selectedAmenities]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(start, start + itemsPerPage);
  }, [filteredProperties, currentPage]);

  const handleScheduleViewing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingDate || !viewingName) return;
    setScheduleSent(true);
    setTimeout(() => {
      setScheduleSent(false);
      setActiveProperty(null);
      setViewingDate('');
      setViewingName('');
      setViewingPhone('');
    }, 2500);
  };

  return (
    <div className="w-full">
      <main className="max-w-[1200px] w-full mx-auto px-5 md:px-16 py-12 flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-1/4 shrink-0 flex flex-col gap-7">
          {/* Property Type */}
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-3">
              Sector Classification
            </span>
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none font-serif text-[15px] text-[#1A1A1A]">
                <input
                  id="filter-type-apartment"
                  type="checkbox"
                  checked={selectedTypes.includes('apartment')}
                  onChange={() => togglePropertyType('apartment')}
                  className="w-4 h-4 rounded-none border-[#1A1A1A]/30 text-[#1A1A1A] focus:ring-[#1A1A1A] accent-[#1A1A1A] cursor-pointer"
                />
                <span>Apartment</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none font-serif text-[15px] text-[#1A1A1A]">
                <input
                  id="filter-type-condo"
                  type="checkbox"
                  checked={selectedTypes.includes('condominium')}
                  onChange={() => togglePropertyType('condominium')}
                  className="w-4 h-4 rounded-none border-[#1A1A1A]/30 text-[#1A1A1A] focus:ring-[#1A1A1A] accent-[#1A1A1A] cursor-pointer"
                />
                <span>Condominium</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none font-serif text-[15px] text-[#1A1A1A]">
                <input
                  id="filter-type-landed"
                  type="checkbox"
                  checked={selectedTypes.includes('landed')}
                  onChange={() => togglePropertyType('landed')}
                  className="w-4 h-4 rounded-none border-[#1A1A1A]/30 text-[#1A1A1A] focus:ring-[#1A1A1A] accent-[#1A1A1A] cursor-pointer"
                />
                <span>Landed House</span>
              </label>
            </div>
          </div>

          <div className="editorial-rule" />

          {/* Price Range */}
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-3">
              Monthly Rental ($ SGD)
            </span>
            <div className="flex gap-2">
              <input
                id="filter-price-min"
                type="number"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value === '' ? '' : Number(e.target.value));
                  setCurrentPage(1);
                }}
                placeholder="Min"
                className="w-full rounded-sm border border-[#1A1A1A]/15 bg-[#FFFFFF] px-3 py-2 font-serif text-[14px] text-[#1A1A1A] focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] outline-none transition-all"
              />
              <input
                id="filter-price-max"
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value === '' ? '' : Number(e.target.value));
                  setCurrentPage(1);
                }}
                placeholder="Max"
                className="w-full rounded-sm border border-[#1A1A1A]/15 bg-[#FFFFFF] px-3 py-2 font-serif text-[14px] text-[#1A1A1A] focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] outline-none transition-all"
              />
            </div>
          </div>

          <div className="editorial-rule" />

          {/* Amenities */}
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-3">
              Amenities & Inclusions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Gym', 'Pool', 'Security', 'Near MRT'].map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    id={`filter-amenity-${amenity.toLowerCase().replace(' ', '-')}`}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer ${
                      isSelected
                        ? 'border border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] shadow-xs'
                        : 'border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:border-[#1A1A1A] bg-transparent'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              id="rent-apply-filters-btn"
              onClick={() => setCurrentPage(1)}
              className="w-full py-3 bg-[#1A1A1A] text-[#F5F2ED] hover:bg-[#8C7355] rounded-sm font-sans text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer"
            >
              Filter Portfolio
            </button>
            {(selectedTypes.length !== 2 || minPrice !== '' || maxPrice !== '' || selectedAmenities.length !== 2) && (
              <button
                id="rent-reset-filters-btn"
                onClick={handleResetFilters}
                className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A]/50 hover:text-[#8C7355] py-1 text-center cursor-pointer transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Results Grid */}
        <section className="flex-grow flex flex-col gap-6">
          <div className="flex justify-between items-baseline border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-1">
                Curated Listings • Issue No. 042
              </span>
              <h1 className="font-serif text-[30px] md:text-[36px] font-light text-[#1A1A1A]">
                Available Properties
              </h1>
            </div>
            <span className="font-serif italic text-[15px] text-[#1A1A1A]/60">
              Showing {filteredProperties.length} residences
            </span>
          </div>

          {currentItems.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-sm p-12 text-center border border-[#1A1A1A]/10 my-8 shadow-[0_10px_30px_-10px_rgba(26,26,26,0.05)]">
              <p className="font-serif text-[20px] text-[#1A1A1A] font-light mb-2">No residences match your exact criteria</p>
              <p className="font-serif text-[14px] text-[#1A1A1A]/70 mb-6">Broaden your monthly rental threshold or clear amenity selections.</p>
              <button
                onClick={handleResetFilters}
                className="bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] px-6 py-2.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentItems.map((prop) => {
                const isFavorited = favoritedIds.includes(prop.id);
                return (
                  <div
                    key={prop.id}
                    id={`property-card-${prop.id}`}
                    onClick={() => setActiveProperty(prop)}
                    className="group bg-[#FFFFFF] rounded-sm overflow-hidden shadow-[0_10px_30px_-10px_rgba(26,26,26,0.04)] hover:shadow-[0_15px_40px_-10px_rgba(26,26,26,0.08)] transition-all duration-300 cursor-pointer border border-[#1A1A1A]/10 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative h-48 sm:h-52 overflow-hidden bg-[#E2DFD8]/40">
                        <img
                          src={prop.image}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                          loading="lazy"
                        />
                        {/* Tag */}
                        {prop.tag && (
                          <div
                            className={`absolute top-3.5 left-3.5 font-sans text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm shadow-xs ${
                              prop.tag === 'High Value'
                                ? 'bg-[#8C7355] text-[#F5F2ED]'
                                : 'bg-[#1A1A1A] text-[#F5F2ED]'
                            }`}
                          >
                            {prop.tag}
                          </div>
                        )}
                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onFavoriteToggle) onFavoriteToggle(prop.id);
                          }}
                          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#F5F2ED]/90 hover:bg-[#F5F2ED] text-[#1A1A1A] flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer backdrop-blur-xs"
                          aria-label="Favorite property"
                        >
                          <Heart
                            size={15}
                            className={isFavorited ? 'fill-[#8C7355] text-[#8C7355]' : 'text-[#1A1A1A]'}
                          />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5 sm:p-6 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <h2 className="font-serif text-[21px] sm:text-[22px] font-normal text-[#1A1A1A] group-hover:text-[#8C7355] transition-colors leading-snug">
                            {prop.title}
                          </h2>
                          <span className="font-serif text-[17px] sm:text-[19px] font-normal text-[#8C7355] whitespace-nowrap">
                            {prop.priceFormatted}
                          </span>
                        </div>
                        <p className="font-serif text-[14px] text-[#1A1A1A]/65 flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#8C7355]" />
                          <span>{prop.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Specs Row */}
                    <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between font-sans text-[11px] uppercase tracking-wider text-[#1A1A1A]/70">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#8C7355]" data-icon="square_foot">
                          square_foot
                        </span>
                        <span>{prop.sqft.toLocaleString()} sqft</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#8C7355]" data-icon="bed">
                          bed
                        </span>
                        <span>{prop.beds} Bed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#8C7355]" data-icon="train">
                          train
                        </span>
                        <span>{prop.mrtDist}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                id="pagination-prev"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-sm border border-[#1A1A1A]/20 flex items-center justify-center text-[#1A1A1A]/60 hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  id={`pagination-page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-sm font-sans text-[11px] font-bold tracking-wider flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#1A1A1A] text-[#F5F2ED]'
                      : 'border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                id="pagination-next"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-sm border border-[#1A1A1A]/20 flex items-center justify-center text-[#1A1A1A]/60 hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Property Details Modal */}
      {activeProperty && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F5F2ED] rounded-sm max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#1A1A1A]/20 relative animate-scaleUp my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setActiveProperty(null);
                setScheduleSent(false);
              }}
              className="absolute top-4 right-4 p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-full hover:bg-[#E2DFD8]/50 cursor-pointer"
              aria-label="Close details"
            >
              <X size={20} />
            </button>

            {/* Modal Image */}
            <div className="rounded-sm overflow-hidden h-64 mb-6 relative bg-[#E2DFD8]/40 border border-[#1A1A1A]/10">
              <img
                src={activeProperty.image}
                alt={activeProperty.title}
                className="w-full h-full object-cover"
              />
              {activeProperty.tag && (
                <div className="absolute top-4 left-4 bg-[#1A1A1A] text-[#F5F2ED] font-sans text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-sm shadow-xs">
                  {activeProperty.tag}
                </div>
              )}
            </div>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#1A1A1A]/10 pb-4 mb-4">
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7355] block mb-1">
                  Residence Dossier
                </span>
                <h3 className="font-serif text-[26px] font-normal text-[#1A1A1A]">
                  {activeProperty.title}
                </h3>
                <p className="font-serif text-[14px] text-[#1A1A1A]/70 flex items-center gap-1 mt-0.5">
                  <MapPin size={14} className="text-[#8C7355]" />
                  <span>
                    {activeProperty.location} • {activeProperty.district}
                  </span>
                </p>
              </div>
              <div className="font-serif text-[26px] font-light text-[#8C7355]">
                {activeProperty.priceFormatted}
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-4 gap-2 text-center bg-[#FFFFFF] p-4 rounded-sm mb-6 border border-[#1A1A1A]/10 shadow-xs">
              <div>
                <div className="font-sans text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C7355]">Size</div>
                <div className="font-serif font-normal text-[#1A1A1A] text-[16px] mt-0.5">{activeProperty.sqft} sqft</div>
              </div>
              <div>
                <div className="font-sans text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C7355]">Bedrooms</div>
                <div className="font-serif font-normal text-[#1A1A1A] text-[16px] mt-0.5">{activeProperty.beds} Bed</div>
              </div>
              <div>
                <div className="font-sans text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C7355]">Baths</div>
                <div className="font-serif font-normal text-[#1A1A1A] text-[16px] mt-0.5">{activeProperty.baths} Bath</div>
              </div>
              <div>
                <div className="font-sans text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C7355]">Facing</div>
                <div className="font-serif font-normal text-[#1A1A1A] text-[16px] mt-0.5">{activeProperty.facing}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-sans text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C7355] mb-2">
                Property Overview
              </h4>
              <p className="font-serif text-[15px] leading-relaxed text-[#1A1A1A]/80">
                {activeProperty.description}
              </p>
            </div>

            {/* Amenities tags */}
            <div className="mb-6">
              <h4 className="font-sans text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C7355] mb-2">
                Featured Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeProperty.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-[#FFFFFF] border border-[#1A1A1A]/10 text-[#1A1A1A] font-serif text-[13px] rounded-sm"
                  >
                    {amenity}
                  </span>
                ))}
                <span className="px-3 py-1 bg-[#FFFFFF] border border-[#1A1A1A]/10 text-[#1A1A1A] font-serif text-[13px] rounded-sm">
                  {activeProperty.furnished}
                </span>
                <span className="px-3 py-1 bg-[#FFFFFF] border border-[#1A1A1A]/10 text-[#1A1A1A] font-serif text-[13px] rounded-sm">
                  Built {activeProperty.yearBuilt}
                </span>
              </div>
            </div>

            {/* Schedule a Viewing Form */}
            <div className="border-t border-[#1A1A1A]/10 pt-6">
              <h4 className="font-serif text-[20px] font-normal text-[#1A1A1A] mb-3">
                Schedule a Private Inspection
              </h4>

              {scheduleSent ? (
                <div className="p-4 bg-[#FFFFFF] border border-[#8C7355] text-[#1A1A1A] rounded-sm flex items-center gap-3">
                  <Check size={20} className="text-[#8C7355]" />
                  <p className="font-serif text-[14px]">
                    Viewing request registered. The concierge team will contact you with gate clearance instructions.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleScheduleViewing} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={viewingName}
                    onChange={(e) => setViewingName(e.target.value)}
                    className="p-2.5 bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-sm font-serif text-[14px] focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <input
                    type="date"
                    required
                    value={viewingDate}
                    onChange={(e) => setViewingDate(e.target.value)}
                    className="p-2.5 bg-[#FFFFFF] border border-[#1A1A1A]/15 rounded-sm font-serif text-[14px] focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <button
                    type="submit"
                    className="bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] py-2.5 transition-colors cursor-pointer"
                  >
                    Request Slot
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
