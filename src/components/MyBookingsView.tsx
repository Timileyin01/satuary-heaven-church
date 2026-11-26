import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Mail,
  Phone,
  QrCode,
  Receipt,
  X,
} from 'lucide-react';
import { CONTACT_DETAILS } from '../data/sanctuaryData';
import { GuestBooking } from '../types';
import { EnquiryDraft } from './EnquiryModal';

interface MyBookingsViewProps {
  bookings: GuestBooking[];
  onCancelBooking: (id: string) => void;
  onBrowseRooms: () => void;
  onOpenStaffCheckin: () => void;
  onOpenEnquiryModal: (draft: EnquiryDraft) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onCancelBooking,
  onBrowseRooms,
  onOpenStaffCheckin,
  onOpenEnquiryModal,
}) => {
  const [selectedPass, setSelectedPass] = useState<GuestBooking | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!selectedPass) {
      setQrDataUrl('');
      return;
    }
    const payload = JSON.stringify({
      type: 'sanctuary-checkin-pass',
      ref: selectedPass.ref,
      guestName: selectedPass.guestName,
      guestPhone: selectedPass.guestPhone,
      guestEmail: selectedPass.guestEmail || CONTACT_DETAILS.email,
      buildingName: selectedPass.buildingName,
      roomNumber: selectedPass.roomNumber,
      suiteTitle: selectedPass.suiteTitle,
      checkInDate: selectedPass.checkInDate,
      checkOutDate: selectedPass.checkOutDate,
      nights: selectedPass.nights,
      guestsLabel: selectedPass.guestsLabel,
      totalAmount: selectedPass.totalAmount,
      paymentMethod: selectedPass.paymentMethod,
      isMemberRate: selectedPass.isMemberRate,
      status: selectedPass.status,
    });
    let cancelled = false;
    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: { dark: '#002215', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPass]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
            Guest Folio & Passes
          </span>
          <h1 className="font-serif-display text-3xl text-primary font-medium mt-0.5">
            My Sanctuary Reservations
          </h1>
        </div>
        <button
          type="button"
          onClick={onBrowseRooms}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <span>New Reservation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="p-10 rounded-2xl bg-surface-container-low text-center space-y-3 border border-outline-variant/25">
          <p className="font-serif-display text-xl text-primary">No active reservations yet</p>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Explore our 9 residence buildings or reserve a convention lodging block to receive an instant SMS & QR boarding pass.
          </p>
          <button
            type="button"
            onClick={onBrowseRooms}
            className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold cursor-pointer"
          >
            Explore 190 Rooms
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bookings.map((bk) => (
            <div
              key={bk.id}
              className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-secondary">
                      {bk.ref}
                    </span>
                    <h2 className="font-serif-display text-xl font-semibold text-primary mt-0.5">
                      {bk.suiteTitle}
                    </h2>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-secondary" />
                      {bk.buildingName} · Room {bk.roomNumber}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                      bk.status === 'Checked In'
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : bk.status === 'Hold Pending'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : bk.status === 'Cancelled'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-primary-container text-on-primary'
                    }`}
                  >
                    {bk.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                      Stay Dates
                    </span>
                    <span className="font-semibold text-primary tabular-nums">
                      {bk.checkInDate} — {bk.checkOutDate} ({bk.nights}n)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-secondary" />
                      Channel
                    </span>
                    <span className="font-medium text-primary">
                      {bk.paymentMethod} {bk.isMemberRate ? '· Member 15% Off' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-outline-variant/25">
                    <span className="text-on-surface-variant">Total Folio</span>
                    <span className="text-sm font-bold text-primary tabular-nums">
                      ₦{bk.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedPass(bk)}
                  className="flex-1 h-10 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View QR Lodging Pass</span>
                </button>
                {bk.status !== 'Cancelled' && bk.status !== 'Checked In' && (
                  <button
                    type="button"
                    onClick={() => onCancelBooking(bk.id)}
                    className="h-10 px-3 rounded-xl bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface-variant text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Support & Enquiries Strip */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-on-surface-variant font-medium">
          Need to modify a booking or make lodging enquiries?
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`tel:${CONTACT_DETAILS.phone}`}
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline tabular-nums"
          >
            <Phone className="w-3.5 h-3.5 text-secondary" />
            <span>{CONTACT_DETAILS.phone}</span>
          </a>
          <a
            href={`mailto:${CONTACT_DETAILS.email}`}
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            <Mail className="w-3.5 h-3.5 text-secondary" />
            <span>{CONTACT_DETAILS.email}</span>
          </a>
          <button
            type="button"
            onClick={() =>
              onOpenEnquiryModal({
                subject: 'Booking Modification / Support Enquiry',
              })
            }
            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
          >
            Enquire via API
          </button>
        </div>
      </div>

      {/* QR Lodging Pass Modal */}
      {selectedPass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
          onClick={() => setSelectedPass(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl space-y-4 border border-outline-variant/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-secondary" />
                <h3 className="font-serif-display text-lg font-semibold text-primary">
                  Diocesan Lodging Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low flex flex-col items-center text-center gap-3">
              <div className="w-36 h-36 rounded-xl bg-white p-2 border-2 border-primary/20 flex items-center justify-center text-primary shadow-xs">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Check-in QR code for ${selectedPass.ref}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-24 h-24" />
                )}
              </div>
              <div>
                <p className="font-mono text-sm font-bold text-primary">{selectedPass.ref}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Scan at Reception Desk #1 to auto-populate booking & encode key
                </p>
              </div>
            </div>

            <div className="text-xs space-y-1.5 bg-surface-container/50 p-3.5 rounded-xl">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Guest</span>
                <span className="font-semibold text-primary">{selectedPass.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Residence</span>
                <span className="font-semibold text-primary">
                  {selectedPass.buildingName} · Rm {selectedPass.roomNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status</span>
                <span className="font-semibold text-secondary flex items-center gap-1">
                  {selectedPass.status === 'Hold Pending' ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {selectedPass.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`Sanctuary-Pass-${selectedPass.ref.replace('#', '')}.png`}
                  className="h-10 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save QR</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedPass(null);
                  onOpenStaffCheckin();
                }}
                className="flex-1 h-10 rounded-xl bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary/90 cursor-pointer"
              >
                Open in Staff Check-In Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
