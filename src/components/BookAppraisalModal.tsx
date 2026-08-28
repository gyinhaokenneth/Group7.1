import React, { useState } from 'react';
import { ValuationFormValues } from '../types';
import { X, Calendar, Clock, CheckCircle2, Shield, User, Mail, Phone, Home } from 'lucide-react';

interface BookAppraisalModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: Partial<ValuationFormValues>;
  onBookingConfirmed?: (booking: any) => void;
}

export const BookAppraisalModal: React.FC<BookAppraisalModalProps> = ({
  isOpen,
  onClose,
  prefill,
  onBookingConfirmed,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    propertyType: prefill?.propertyType || 'condominium',
    preferredDate: '',
    preferredTime: '10:00 AM',
    consultationType: 'in-person',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const bookingRecord = {
        id: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
        ...formData,
        timestamp: new Date().toISOString(),
        surveyor: 'Eleanor Vance, Senior Chartered Surveyor (RICS)',
      };
      setConfirmedBooking(bookingRecord);
      setIsSubmitting(false);
      if (onBookingConfirmed) onBookingConfirmed(bookingRecord);
    }, 700);
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] rounded-sm max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#1A1A1A]/15 relative my-8 animate-scaleUp max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-sm hover:bg-[#E2DFD8]/40 cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {confirmedBooking ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#E2DFD8]/60 text-[#1A1A1A] mx-auto flex items-center justify-center mb-4 border border-[#8C7355]/30">
              <CheckCircle2 size={26} className="text-[#8C7355]" />
            </div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-1">
              Dossier Registered
            </span>
            <h3 className="font-serif text-[28px] font-light text-[#1A1A1A] mb-2">
              Appraisal Confirmed
            </h3>
            <div className="editorial-rule max-w-xs mx-auto my-3" />
            <p className="font-serif text-[15px] text-[#1A1A1A]/75 mb-6 max-w-md mx-auto">
              Your appointment has been registered with our senior valuation desk. A certified surveyor will conduct the assessment in accordance with institutional Red Book standards.
            </p>

            <div className="bg-[#F5F2ED]/50 border border-[#1A1A1A]/15 rounded-sm p-5 text-left text-[14px] space-y-2.5 mb-6">
              <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                <span className="font-sans text-[11px] font-semibold text-[#1A1A1A]/60 uppercase tracking-wider">Reference ID:</span>
                <span className="font-mono font-semibold text-[#1A1A1A]">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                <span className="font-sans text-[11px] font-semibold text-[#1A1A1A]/60 uppercase tracking-wider">Appointment:</span>
                <span className="font-serif font-medium text-[#1A1A1A]">
                  {confirmedBooking.preferredDate} at {confirmedBooking.preferredTime}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                <span className="font-sans text-[11px] font-semibold text-[#1A1A1A]/60 uppercase tracking-wider">Assigned Surveyor:</span>
                <span className="font-serif font-medium text-[#1A1A1A]">{confirmedBooking.surveyor}</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                <span className="font-sans text-[11px] font-semibold text-[#1A1A1A]/60 uppercase tracking-wider">Mode:</span>
                <span className="font-serif font-medium capitalize text-[#1A1A1A]">{confirmedBooking.consultationType} Valuation</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-[11px] font-semibold text-[#1A1A1A]/60 uppercase tracking-wider">Property:</span>
                <span className="font-serif font-medium text-[#1A1A1A] text-right truncate max-w-[240px]">
                  {confirmedBooking.propertyAddress || 'Address on file'}
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-3.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
            >
              Conclude
            </button>
          </div>
        ) : (
          <div>
            <div className="border-b border-[#1A1A1A]/10 pb-4 mb-6">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355]">
                Official Consultation Protocol
              </span>
              <h3 className="font-serif text-[26px] sm:text-[30px] font-light text-[#1A1A1A] mt-1">
                Book a Certified Appraisal
              </h3>
              <p className="font-serif text-[14px] text-[#1A1A1A]/70 mt-1">
                Audited by certified valuation surveyors adhering to RICS Red Book and SISV statutory mandates.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                    Principal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Julian Vance"
                    className="w-full border border-[#1A1A1A]/20 rounded-sm p-2.5 text-[14px] font-serif focus:outline-none focus:border-[#8C7355] bg-[#F5F2ED]/20 text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                    Confidential Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="julian@investor.com"
                    className="w-full border border-[#1A1A1A]/20 rounded-sm p-2.5 text-[14px] font-serif focus:outline-none focus:border-[#8C7355] bg-[#F5F2ED]/20 text-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Phone & Property Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                    Direct Line
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full border border-[#1A1A1A]/20 rounded-sm p-2.5 text-[14px] font-serif focus:outline-none focus:border-[#8C7355] bg-[#F5F2ED]/20 text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                    Asset Class
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full border border-[#1A1A1A]/20 rounded-sm p-2.5 text-[14px] font-serif focus:outline-none focus:border-[#8C7355] bg-[#F5F2ED]/20 text-[#1A1A1A]"
                  >
                    <option value="condominium">Prime Condominium</option>
                    <option value="landed">Landed Estate / Good Class Bungalow</option>
                    <option value="apartment">Executive Residence</option>
                    <option value="commercial">Commercial / Mixed-Use</option>
                  </select>
                </div>
              </div>

              {/* Property Address */}
              <div>
                <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                  Property Address / Folio Reference
                </label>
                <input
                  type="text"
                  required
                  value={formData.propertyAddress}
                  onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                  placeholder="e.g. 18 Marina Boulevard, #34-02"
                  className="w-full border border-[#1A1A1A]/20 rounded-sm p-2.5 text-[14px] font-serif focus:outline-none focus:border-[#8C7355] bg-[#F5F2ED]/20 text-[#1A1A1A]"
                />
              </div>

              {/* Date, Time & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full border border-[#1A1A1A]/20 rounded-sm p-2.5 text-[13px] font-serif focus:outline-none focus:border-[#8C7355] bg-[#F5F2ED]/20 text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                    Time Window
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full border border-[#1A1A1A]/20 rounded-sm p-2.5 text-[13px] font-serif focus:outline-none focus:border-[#8C7355] bg-[#F5F2ED]/20 text-[#1A1A1A]"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                    Audit Format
                  </label>
                  <select
                    value={formData.consultationType}
                    onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                    className="w-full border border-[#1A1A1A]/20 rounded-sm p-2.5 text-[13px] font-serif focus:outline-none focus:border-[#8C7355] bg-[#F5F2ED]/20 text-[#1A1A1A]"
                  >
                    <option value="in-person">On-Site Physical Audit</option>
                    <option value="virtual">Virtual Dossier Review</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                  Appraisal Objective / Asset Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Portfolio refinancing, estate succession, or prospective acquisition audit."
                  className="w-full border border-[#1A1A1A]/20 rounded-sm p-2.5 text-[14px] font-serif focus:outline-none focus:border-[#8C7355] bg-[#F5F2ED]/20 text-[#1A1A1A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1A1A1A] hover:bg-[#8C7355] text-[#F5F2ED] py-3.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer disabled:opacity-70 shadow-sm"
                >
                  {isSubmitting ? 'Registering Consultation...' : 'Submit Appraisal Dossier Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
