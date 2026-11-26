import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Ticket,
  X,
} from 'lucide-react';
import { CONTACT_DETAILS } from '../data/sanctuaryData';
import { BuildingSlug, GuestBooking } from '../types';

export interface BookingDraft {
  suiteTitle: string;
  buildingName: string;
  buildingSlug: BuildingSlug;
  roomNumber: string;
  standardRate: number;
  memberRate: number;
  nights: number;
  checkInDate: string;
  checkOutDate: string;
  guestsLabel: string;
  isMemberMode: boolean;
  voucherCode?: string;
}

interface BookingModalProps {
  draft: BookingDraft | null;
  onClose: () => void;
  onConfirmBooking: (booking: GuestBooking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  draft,
  onClose,
  onConfirmBooking,
}) => {
  const [guestName, setGuestName] = useState('Pastor Samuel Oladele');
  const [guestPhone, setGuestPhone] = useState(CONTACT_DETAILS.phone);
  const [guestEmail, setGuestEmail] = useState(CONTACT_DETAILS.email);
  const [paymentChannel, setPaymentChannel] = useState<'Paystack' | 'Flutterwave'>('Paystack');
  const [voucher, setVoucher] = useState(draft?.voucherCode || '');
  const [voucherApplied, setVoucherApplied] = useState(Boolean(draft?.voucherCode));
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [generatedRef, setGeneratedRef] = useState('');

  if (!draft) return null;

  const baseNightly = draft.isMemberMode ? draft.memberRate : draft.standardRate;
  const voucherDiscount = voucherApplied ? 0.1 : 0;
  const effectiveNightly = Math.round(baseNightly * (1 - voucherDiscount));
  const totalPayable = effectiveNightly * draft.nights;

  const handleApplyVoucher = () => {
    if (voucher.trim().length >= 4) {
      setVoucherApplied(true);
    }
  };

  const submitReservation = (mode: 'paid' | 'hold') => {
    setProcessingState('processing');
    const newRef = `#CH-2025-${Math.floor(9510 + Math.random() * 480)}`;
    setGeneratedRef(newRef);

    setTimeout(() => {
      const booking: GuestBooking = {
        id: `bk-${Date.now()}`,
        ref: newRef,
        guestName: guestName.trim() || 'Sanctuary Guest',
        guestPhone: guestPhone.trim() || CONTACT_DETAILS.phone,
        guestEmail: guestEmail.trim() || CONTACT_DETAILS.email,
        buildingName: draft.buildingName,
        buildingSlug: draft.buildingSlug,
        roomNumber: draft.roomNumber,
        suiteTitle: `${draft.suiteTitle} ${draft.roomNumber}`,
        checkInDate: draft.checkInDate,
        checkOutDate: draft.checkOutDate,
        nights: draft.nights,
        guestsLabel: draft.guestsLabel,
        isMemberRate: draft.isMemberMode,
        voucherCode: voucherApplied ? voucher.trim().toUpperCase() : undefined,
        totalAmount: totalPayable,
        paymentMethod: mode === 'hold' ? 'Desk Hold (2h)' : paymentChannel,
        status: mode === 'hold' ? 'Hold Pending' : 'Confirmed',
        createdAt: 'Just now',
      };

      onConfirmBooking(booking);
      setProcessingState('done');
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-primary/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-semibold text-primary">
                {processingState === 'done' ? 'Reservation Confirmed' : 'Room Reservation'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {draft.buildingName} · Room {draft.roomNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {processingState === 'done' ? (
          <div className="py-4 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="font-serif-display text-xl font-semibold text-primary">
                SMS Pass & Folio Generated
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                Reference <span className="font-mono font-semibold text-primary">{generatedRef}</span> is now synced with Reception Desk #1.
              </p>
            </div>
            <div className="w-full p-3.5 rounded-xl bg-surface-container-low text-left text-xs space-y-1.5 border border-outline-variant/30">
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">Guest</span>
                <span className="font-semibold text-primary text-right">{guestName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">Booking Contact</span>
                <span className="font-semibold text-primary text-right tabular-nums">
                  {guestPhone} · {guestEmail}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">Stay</span>
                <span className="font-semibold text-primary">
                  {draft.checkInDate} — {draft.checkOutDate} ({draft.nights} nights)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Total Tariff</span>
                <span className="font-bold text-primary tabular-nums">
                  ₦{totalPayable.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/25">
              <div className="flex items-center justify-between">
                <span className="font-serif-display text-lg font-semibold text-primary">
                  {draft.suiteTitle} {draft.roomNumber}
                </span>
                {draft.isMemberMode && (
                  <span className="text-xs font-semibold text-secondary">15% Member Rate</span>
                )}
              </div>
              <span className="text-xs text-on-surface-variant">
                {draft.checkInDate} — {draft.checkOutDate} · {draft.nights} Nights · {draft.guestsLabel}
              </span>
              <div className="flex items-baseline justify-between pt-2 mt-1 border-t border-outline-variant/30">
                <span className="text-xs text-on-surface-variant">Total Payable</span>
                <span className="text-lg font-bold text-primary tabular-nums">
                  ₦{totalPayable.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Guest Full Name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Phone Number (SMS Slip)
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Email (Booking Receipt)
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Diocesan Voucher (Optional)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={voucher}
                      onChange={(e) => {
                        setVoucher(e.target.value);
                        setVoucherApplied(false);
                      }}
                      placeholder="e.g. LAGOS-DIOCESE-2025"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary cursor-pointer"
                  >
                    {voucherApplied ? 'Applied (-10%)' : 'Apply'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Payment Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Paystack', 'Flutterwave'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setPaymentChannel(ch)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                        paymentChannel === ch
                          ? 'bg-primary-container text-on-primary border-primary-container'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{ch}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={processingState === 'processing'}
                onClick={() => submitReservation('paid')}
                className="w-full h-11 rounded-xl bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70"
              >
                {processingState === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to {paymentChannel}...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-secondary-fixed" />
                    <span>Pay ₦{totalPayable.toLocaleString()} via {paymentChannel}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={processingState === 'processing'}
                onClick={() => submitReservation('hold')}
                className="w-full h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-secondary" />
                <span>Hold for 2 Hours (Pay at Reception Desk)</span>
              </button>

              <div className="pt-2 border-t border-outline-variant/25 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-on-surface-variant">
                <a
                  href={`tel:${CONTACT_DETAILS.phone}`}
                  className="inline-flex items-center gap-1 hover:text-primary font-medium"
                >
                  <Phone className="w-3 h-3 text-secondary" />
                  <span className="tabular-nums">{CONTACT_DETAILS.phone}</span>
                </a>
                <a
                  href={`mailto:${CONTACT_DETAILS.email}`}
                  className="inline-flex items-center gap-1 hover:text-primary font-medium"
                >
                  <Mail className="w-3 h-3 text-secondary" />
                  <span>{CONTACT_DETAILS.email}</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
