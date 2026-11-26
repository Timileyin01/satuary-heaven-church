import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Send,
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

type DispatchChannel = 'both' | 'whatsapp' | 'email';
type BookingMethod = 'Email & WhatsApp' | 'Paystack' | 'Flutterwave';

interface ChannelDeliveryResult {
  requested: boolean;
  status: 'sent' | 'dispatched_relay' | 'skipped' | 'error';
  recipient: string;
  provider: string;
  detail: string;
}

interface BookingDispatchResponse {
  ok: boolean;
  error?: string;
  dispatchId?: string;
  timestamp?: string;
  channel?: DispatchChannel;
  contacts?: {
    phone: string;
    email: string;
  };
  emailResult?: ChannelDeliveryResult;
  whatsappResult?: ChannelDeliveryResult;
  whatsappUrl?: string;
  mailtoUrl?: string;
}

interface BookingModalProps {
  draft: BookingDraft | null;
  onClose: () => void;
  onConfirmBooking: (booking: GuestBooking) => void;
}

function isSafeActionUrl(url: string | undefined, expectedPrefix: 'https://wa.me/' | 'mailto:'): url is string {
  return typeof url === 'string' && url.startsWith(expectedPrefix);
}

export const BookingModal: React.FC<BookingModalProps> = ({
  draft,
  onClose,
  onConfirmBooking,
}) => {
  const [guestName, setGuestName] = useState('Pastor Samuel Oladele');
  const [guestPhone, setGuestPhone] = useState('0803 442 8819');
  const [guestEmail, setGuestEmail] = useState('samuel.oladele@parish.org');
  const [notes, setNotes] = useState('');
  const [bookingMethod, setBookingMethod] = useState<BookingMethod>('Email & WhatsApp');
  const [dispatchChannel, setDispatchChannel] = useState<DispatchChannel>('both');
  const [voucher, setVoucher] = useState(draft?.voucherCode || '');
  const [voucherApplied, setVoucherApplied] = useState(Boolean(draft?.voucherCode));
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedRef, setGeneratedRef] = useState('');
  const [dispatchResult, setDispatchResult] = useState<BookingDispatchResponse | null>(null);

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

  const resolvePaymentLabel = (mode: 'primary' | 'hold'): GuestBooking['paymentMethod'] => {
    if (mode === 'hold') return 'Desk Hold (2h)';
    if (bookingMethod === 'Email & WhatsApp') {
      if (dispatchChannel === 'whatsapp') return 'WhatsApp API';
      if (dispatchChannel === 'email') return 'Email API';
      return 'Email & WhatsApp';
    }
    return bookingMethod;
  };

  const submitReservation = async (mode: 'primary' | 'hold') => {
    setErrorMessage(null);
    const cleanName = guestName.trim();
    const cleanPhone = guestPhone.trim();
    const cleanEmail = guestEmail.trim();

    if (!cleanName) {
      setErrorMessage('Please enter the guest full name.');
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 7) {
      setErrorMessage('Please enter a valid guest phone number.');
      return;
    }
    if (dispatchChannel !== 'whatsapp' && !cleanEmail) {
      setErrorMessage('Please provide your email address for booking confirmation.');
      return;
    }

    setProcessingState('processing');
    const newRef = `#CH-2025-${Math.floor(9510 + Math.random() * 480)}`;
    const resolvedMethod = resolvePaymentLabel(mode);

    try {
      const response = await fetch('/api/bookings/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: newRef,
          channel: dispatchChannel,
          guestName: cleanName,
          guestPhone: cleanPhone,
          guestEmail: cleanEmail,
          buildingName: draft.buildingName,
          roomNumber: draft.roomNumber,
          suiteTitle: draft.suiteTitle,
          checkInDate: draft.checkInDate,
          checkOutDate: draft.checkOutDate,
          nights: draft.nights,
          guestsLabel: draft.guestsLabel,
          totalAmount: totalPayable,
          paymentMethod: resolvedMethod,
          notes: notes.trim(),
        }),
      });

      const data = (await response.json()) as BookingDispatchResponse;

      if (!response.ok || !data.ok) {
        setProcessingState('idle');
        setErrorMessage(data.error || 'Could not dispatch booking. Please verify your inputs.');
        return;
      }

      const booking: GuestBooking = {
        id: `bk-${Date.now()}`,
        ref: newRef,
        guestName: cleanName,
        guestPhone: cleanPhone,
        guestEmail: cleanEmail || CONTACT_DETAILS.email,
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
        paymentMethod: resolvedMethod,
        dispatchId: data.dispatchId,
        bookingChannel: dispatchChannel,
        status: mode === 'hold' ? 'Hold Pending' : 'Confirmed',
        createdAt: 'Just now',
      };

      setGeneratedRef(newRef);
      setDispatchResult(data);
      onConfirmBooking(booking);
      setProcessingState('done');
    } catch {
      setProcessingState('idle');
      setErrorMessage('Unable to reach the Sanctuary booking API. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-primary/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-semibold text-primary">
                {processingState === 'done' ? 'Booking Dispatched & Confirmed' : 'Room Reservation'}
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

        {processingState === 'done' && dispatchResult ? (
          <div className="py-2 flex flex-col items-center text-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="font-serif-display text-xl font-semibold text-primary">
                Booking Sent via Sanctuary API
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                Ref <span className="font-mono font-semibold text-primary">{generatedRef}</span>
                {dispatchResult.dispatchId ? (
                  <>
                    {' '}
                    · Dispatch <span className="font-mono font-semibold text-secondary">{dispatchResult.dispatchId}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="w-full p-3.5 rounded-xl bg-surface-container-low text-left text-xs space-y-1.5 border border-outline-variant/30">
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">Guest</span>
                <span className="font-semibold text-primary text-right">{guestName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">Guest Contact</span>
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

            {/* Real API Channel Delivery Breakdown */}
            <div className="w-full space-y-2 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Desk API Delivery Status
              </p>
              {dispatchResult.whatsappResult?.requested && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/25 flex items-start justify-between gap-2 text-xs">
                  <div className="flex items-start gap-2 min-w-0">
                    <MessageSquare className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-primary tabular-nums">
                        WhatsApp · {dispatchResult.whatsappResult.recipient}
                      </p>
                      <p className="text-on-surface-variant text-[11px]">
                        {dispatchResult.whatsappResult.detail}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      dispatchResult.whatsappResult.status === 'error'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-[#ebf7ee] text-[#1c6934]'
                    }`}
                  >
                    {dispatchResult.whatsappResult.status === 'sent'
                      ? 'Delivered'
                      : dispatchResult.whatsappResult.status === 'error'
                      ? 'Fallback Ready'
                      : 'API Dispatched'}
                  </span>
                </div>
              )}

              {dispatchResult.emailResult?.requested && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/25 flex items-start justify-between gap-2 text-xs">
                  <div className="flex items-start gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-primary break-all">
                        Email · {dispatchResult.emailResult.recipient}
                      </p>
                      <p className="text-on-surface-variant text-[11px]">
                        {dispatchResult.emailResult.detail}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      dispatchResult.emailResult.status === 'error'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-[#ebf7ee] text-[#1c6934]'
                    }`}
                  >
                    {dispatchResult.emailResult.status === 'sent'
                      ? 'Delivered'
                      : dispatchResult.emailResult.status === 'error'
                      ? 'Fallback Ready'
                      : 'API Dispatched'}
                  </span>
                </div>
              )}
            </div>

            {/* Direct WhatsApp & Email App Deep-Links */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
              {isSafeActionUrl(dispatchResult.whatsappUrl, 'https://wa.me/') && (
                <a
                  href={dispatchResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-3 rounded-xl bg-[#1c6934] hover:bg-[#155429] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open WhatsApp ({CONTACT_DETAILS.phone})</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
              {isSafeActionUrl(dispatchResult.mailtoUrl, 'mailto:') && (
                <a
                  href={dispatchResult.mailtoUrl}
                  className="h-10 px-3 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Email Draft</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
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

            {/* Destination Desk Contact Banner */}
            <div className="p-3 rounded-xl bg-secondary-container/20 border border-secondary/20 text-xs space-y-1">
              <p className="font-semibold text-primary flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>Booking API Dispatches Directly to Sanctuary Desk:</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant pl-5">
                <span className="inline-flex items-center gap-1 font-semibold text-primary tabular-nums">
                  <MessageSquare className="w-3 h-3 text-secondary" />
                  WhatsApp: {CONTACT_DETAILS.phone}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary break-all">
                  <Mail className="w-3 h-3 text-secondary" />
                  Email: {CONTACT_DETAILS.email}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

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
                    Guest Phone / WhatsApp
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
                    Guest Email Address
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
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Arrival / Pastoral Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Late arrival after vigil, ground-floor preferred"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Booking Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'Email & WhatsApp', label: 'Email & WhatsApp', icon: Send },
                      { id: 'Paystack', label: 'Paystack', icon: CreditCard },
                      { id: 'Flutterwave', label: 'Flutterwave', icon: CreditCard },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBookingMethod(item.id)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                          bookingMethod === item.id
                            ? 'bg-primary-container text-on-primary border-primary-container'
                            : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  API Contact Dispatch Target
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'both', label: 'Both Channels' },
                      { id: 'whatsapp', label: 'WhatsApp Only' },
                      { id: 'email', label: 'Email Only' },
                    ] as const
                  ).map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setDispatchChannel(ch.id)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                        dispatchChannel === ch.id
                          ? 'bg-secondary text-on-secondary border-secondary'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={processingState === 'processing'}
                onClick={() => submitReservation('primary')}
                className="w-full h-11 rounded-xl bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70"
              >
                {processingState === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Booking via API...</span>
                  </>
                ) : bookingMethod === 'Email & WhatsApp' ? (
                  <>
                    <Send className="w-4 h-4 text-secondary-fixed" />
                    <span>
                      Book ₦{totalPayable.toLocaleString()} via{' '}
                      {dispatchChannel === 'both'
                        ? 'Email & WhatsApp'
                        : dispatchChannel === 'whatsapp'
                        ? 'WhatsApp'
                        : 'Email'}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-secondary-fixed" />
                    <span>Pay ₦{totalPayable.toLocaleString()} via {bookingMethod}</span>
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
                <span>Hold for 2 Hours & Notify Desk ({CONTACT_DETAILS.phone})</span>
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
