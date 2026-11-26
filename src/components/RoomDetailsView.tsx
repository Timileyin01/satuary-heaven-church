import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Bookmark,
  BookOpen,
  Camera,
  CheckCircle2,
  Church,
  Coffee,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  Maximize2,
  Minus,
  Moon,
  Phone,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Trees,
  Users,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import { CONTACT_DETAILS } from '../data/sanctuaryData';
import { FeaturedSuite } from '../types';
import { BookingDraft } from './BookingModal';
import { EnquiryDraft } from './EnquiryModal';

interface RoomDetailsViewProps {
  suite: FeaturedSuite;
  isMemberMode: boolean;
  onToggleMemberMode: () => void;
  onBack: () => void;
  onReserve: (draft: BookingDraft) => void;
  onOpenEnquiryModal: (draft: EnquiryDraft) => void;
  onToast: (msg: string) => void;
}

export const RoomDetailsView: React.FC<RoomDetailsViewProps> = ({
  suite,
  isMemberMode,
  onToggleMemberMode,
  onBack,
  onReserve,
  onOpenEnquiryModal,
  onToast,
}) => {
  const [saved, setSaved] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [nights, setNights] = useState(4);

  const photos = suite.gallery.length > 0 ? suite.gallery : [suite.image];
  const standardTotal = suite.standardRate * nights;
  const memberDiscount = isMemberMode ? Math.round(standardTotal * 0.15) : 0;
  const totalPayable = standardTotal - memberDiscount;

  const checkOutDay = 14 + nights;
  const checkOutLabel = `Tue, ${checkOutDay} Nov '25`;

  const handleShare = () => {
    onToast(`Copied share link for ${suite.buildingName} · Room ${suite.roomNumber}`);
  };

  const handleToggleSave = () => {
    const next = !saved;
    setSaved(next);
    onToast(next ? `Saved ${suite.title} to your Sanctuary favorites` : 'Removed from favorites');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-28 md:pb-14 space-y-6">
      {/* Top Action Strip */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-primary hover:text-secondary text-sm font-medium transition-colors py-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Accommodations</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share room details"
            className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary flex items-center justify-center transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToggleSave}
            aria-label="Save to favorites"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              saved
                ? 'bg-secondary-container/40 text-secondary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-secondary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Split on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Hero Photo Stage + Amenities + Sanctuary Policies */}
        <div className="lg:col-span-7 space-y-6">
          {/* 4:3 Hero Visual Stage */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-surface-container-low aspect-[4/3]">
            <img
              src={photos[photoIdx]}
              alt={`${suite.title} gallery view ${photoIdx + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/25 pointer-events-none" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container/90 backdrop-blur-md text-on-primary text-xs font-semibold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary-fixed" />
                {suite.buildingName} · Suite {suite.roomNumber}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-bright/95 backdrop-blur-md text-primary text-xs font-semibold shadow-sm">
                <Zap className="w-3.5 h-3.5 text-secondary" />
                Instant Confirmed
              </span>
            </div>

            {/* Bottom Photo Switcher */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
              <button
                type="button"
                onClick={() => setPhotoIdx((idx) => (idx + 1) % photos.length)}
                className="flex items-center gap-1.5 bg-primary/75 hover:bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="tabular-nums">
                  {photoIdx + 1} of {photos.length} Photos
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`View photo ${idx + 1}`}
                    onClick={() => setPhotoIdx(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      photoIdx === idx ? 'w-5 bg-secondary-fixed' : 'w-1.5 bg-surface-container-lowest/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 4-Spec Dimensions Bar */}
          <div className="grid grid-cols-4 gap-2.5 py-4 px-3 rounded-2xl bg-surface-container shadow-xs text-center">
            <div className="flex flex-col items-center justify-center p-1">
              <BedDouble className="w-5 h-5 text-secondary mb-1" />
              <span className="text-xs font-semibold text-primary">{suite.specs.bed}</span>
              <span className="text-[11px] text-on-surface-variant">{suite.specs.bedNote}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1">
              <Users className="w-5 h-5 text-secondary mb-1" />
              <span className="text-xs font-semibold text-primary">{suite.specs.guests}</span>
              <span className="text-[11px] text-on-surface-variant">{suite.specs.guestsNote}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1">
              <Maximize2 className="w-5 h-5 text-secondary mb-1" />
              <span className="text-xs font-semibold text-primary tabular-nums">{suite.specs.area}</span>
              <span className="text-[11px] text-on-surface-variant">{suite.specs.areaNote}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1">
              <Trees className="w-5 h-5 text-secondary mb-1" />
              <span className="text-xs font-semibold text-primary">{suite.specs.view}</span>
              <span className="text-[11px] text-on-surface-variant">{suite.specs.viewNote}</span>
            </div>
          </div>

          {/* Consecrated Amenities Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-xl font-semibold text-primary">
                Consecrated Amenities
              </h2>
              <span className="text-xs font-medium text-secondary">All inclusive</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Zap, title: '24/7 Redundant Power', desc: 'Twin industrial generators with zero switchover latency.' },
                { icon: BookOpen, title: 'Study Desk & Prayer Altar', desc: 'Solid mahogany study with reading lamp and leather kneeler.' },
                { icon: Wifi, title: 'High-Speed Fiber Wi-Fi', desc: 'Dedicated link suitable for sermons and video study.' },
                { icon: Bath, title: 'Ensuite Marble Bath', desc: 'Solar hot water pressure rain shower & organic toiletries.' },
                { icon: Wind, title: 'Dual Climate Control', desc: 'Silent inverter air conditioning plus natural timber ceiling fan.' },
                { icon: Coffee, title: 'Morning Pastoral Tea Service', desc: 'Complimentary herbal teas, fresh seasonal fruit basket & biscuits.' },
                { icon: Church, title: 'Sanctuary Walkway', desc: 'Sheltered garden cloister connecting directly to main chapel altar.' },
                { icon: Sparkles, title: 'Daily Dignified Housekeeping', desc: 'Linen freshening, prayer room tidying, and silent morning turn-down.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low">
                    <div className="w-9 h-9 rounded-lg bg-surface-bright flex items-center justify-center text-primary shrink-0 shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary">{item.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sanctuary Guidelines & Quietude */}
          <div className="space-y-3">
            <h2 className="font-serif-display text-xl font-semibold text-primary">
              Sanctuary Guidelines & Quietude
            </h2>
            <div className="p-5 rounded-2xl bg-surface-container-low space-y-3.5">
              {[
                {
                  icon: Moon,
                  title: 'Sacred Silence Hours (10:00 PM – 6:00 AM)',
                  desc: 'Guests observe hushed corridors and cloister walkways to support prayer and uninterrupted rest.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Modest Decorum on Holy Grounds',
                  desc: 'Respectful, conservative attire requested across public gardens, chapel halls, and dining commons.',
                },
                {
                  icon: Sparkles,
                  title: 'Pure Haven Policy',
                  desc: 'Strictly alcohol-free and smoke-free facility across all suites and adjoining garden terraces.',
                },
                {
                  icon: KeyRound,
                  title: 'Late Arrival & Night Vigil Passes',
                  desc: 'Reception closes at 10:00 PM. Registered vigil attendees receive night gate clearance passes upon arrival.',
                },
              ].map((policy) => {
                const Icon = policy.icon;
                return (
                  <div key={policy.title} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-primary">{policy.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{policy.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Title, Tariff Overview, Stay Calculator & CTA */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="uppercase tracking-wider text-secondary font-semibold">
                Clergy & Pilgrim Haven
              </span>
              <span aria-hidden="true">·</span>
              <span>{suite.wingTag} (1st Floor)</span>
            </div>
            <h1 className="font-serif-display text-3xl text-primary font-medium leading-tight">
              Executive {suite.title} {suite.roomNumber}
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {suite.description}
            </p>
          </div>

          {/* Pricing Card with Diocesan Member Toggle */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                  {isMemberMode ? 'Diocesan Member Rate' : 'Standard Sanctuary Rate'}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-serif-display text-2xl font-semibold text-primary tabular-nums">
                    ₦{(isMemberMode ? suite.memberRate : suite.standardRate).toLocaleString()}
                  </span>
                  <span className="text-xs text-on-surface-variant">/ night</span>
                </div>
              </div>
              <div className="text-right">
                {isMemberMode && (
                  <span className="text-xs line-through text-on-surface-variant block tabular-nums">
                    ₦{suite.standardRate.toLocaleString()} standard
                  </span>
                )}
                <span className="text-xs font-semibold text-secondary">
                  {isMemberMode ? 'Save 15%' : '15% Member Subsidy Available'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleMemberMode}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-bright hover:bg-surface-container-lowest transition-colors text-left cursor-pointer border border-outline-variant/25"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-primary block">
                    Parishioner / Clergy ID {isMemberMode ? 'Applied' : 'Available'}
                  </span>
                  <span className="text-[11px] text-secondary">
                    {isMemberMode ? 'Verified with Lagos Diocesan Registry' : 'Tap to activate 15% clergy & member discount'}
                  </span>
                </div>
              </div>
              <CheckCircle2
                className={`w-5 h-5 shrink-0 ${
                  isMemberMode ? 'text-primary' : 'text-outline-variant'
                }`}
              />
            </button>
          </div>

          {/* Stay Duration & Dates */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-primary">Stay Duration & Dates</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNights((n) => Math.max(1, n - 1))}
                  className="w-7 h-7 rounded-md bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-primary cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold text-secondary tabular-nums min-w-[68px] text-center">
                  {nights} {nights === 1 ? 'Night' : 'Nights'}
                </span>
                <button
                  type="button"
                  onClick={() => setNights((n) => Math.min(14, n + 1))}
                  className="w-7 h-7 rounded-md bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-primary cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-1.5 text-secondary mb-1 text-[11px] font-semibold uppercase">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Check-in</span>
                </div>
                <span className="text-sm font-semibold text-primary block">Fri, 14 Nov &apos;25</span>
                <span className="text-[11px] text-on-surface-variant">From 2:00 PM</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-1.5 text-secondary mb-1 text-[11px] font-semibold uppercase">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Check-out</span>
                </div>
                <span className="text-sm font-semibold text-primary block">{checkOutLabel}</span>
                <span className="text-[11px] text-on-surface-variant">Before 11:00 AM</span>
              </div>
            </div>

            {/* Tariff Calculation Breakdown */}
            <div className="p-4 rounded-xl bg-surface-container space-y-2 text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>
                  Standard Guest Rate ({nights} nights × ₦{suite.standardRate.toLocaleString()})
                </span>
                <span className="font-semibold text-primary tabular-nums">
                  ₦{standardTotal.toLocaleString()}
                </span>
              </div>
              {isMemberMode && (
                <div className="flex items-center justify-between text-secondary">
                  <span>Diocesan Grace Subsidy (15%)</span>
                  <span className="font-semibold tabular-nums">-₦{memberDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Complimentary Sanctuary Hospitality Pack</span>
                <span className="font-semibold uppercase text-primary">Free</span>
              </div>
              <div className="h-px bg-outline-variant/40 my-1" />
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-sm font-semibold text-primary block">Total Payable</span>
                  <span className="text-[11px] text-on-surface-variant">
                    Includes all municipal & chapel levies
                  </span>
                </div>
                <span className="font-serif-display text-2xl font-bold text-primary tabular-nums">
                  ₦{totalPayable.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onReserve({
                  suiteTitle: suite.title,
                  buildingName: suite.buildingName,
                  buildingSlug: suite.buildingSlug,
                  roomNumber: suite.roomNumber,
                  standardRate: suite.standardRate,
                  memberRate: suite.memberRate,
                  nights,
                  checkInDate: '14 Nov 2025',
                  checkOutDate: `${checkOutDay} Nov 2025`,
                  guestsLabel: suite.specs.guests,
                  isMemberMode,
                })
              }
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Reserve Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 border-t border-outline-variant/25 space-y-2.5 text-xs text-on-surface-variant">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">Booking Enquiries:</span>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${CONTACT_DETAILS.phone}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline tabular-nums"
                  >
                    <Phone className="w-3.5 h-3.5 text-secondary" />
                    <span>{CONTACT_DETAILS.phone}</span>
                  </a>
                  <a
                    href={`mailto:${CONTACT_DETAILS.email}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5 text-secondary" />
                    <span>{CONTACT_DETAILS.email}</span>
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiryModal({
                    subject: `Enquiry for ${suite.buildingName} · Room ${suite.roomNumber}`,
                    buildingName: suite.buildingName,
                    roomNumber: suite.roomNumber,
                    presetMessage: `Hello Sanctuary Desk, I would like to enquire about booking ${suite.title} (Room ${suite.roomNumber}, ${suite.buildingName}) for ${nights} nights.`,
                  })
                }
                className="w-full h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-secondary" />
                <span>Book or Enquire via Email &amp; WhatsApp API</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Reservation Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-surface-bright/95 backdrop-blur-xl px-4 py-2.5 border-t border-outline-variant/30 shadow-[0_-6px_16px_rgba(23,56,41,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif-display text-lg font-semibold text-primary tabular-nums">
                ₦{totalPayable.toLocaleString()}
              </span>
              <span className="text-xs text-secondary font-medium tabular-nums">{nights} nights</span>
            </div>
            <span className="text-[11px] text-primary block truncate">
              {isMemberMode ? 'Diocesan Member Rate Active' : 'Standard Rate'}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onReserve({
                suiteTitle: suite.title,
                buildingName: suite.buildingName,
                buildingSlug: suite.buildingSlug,
                roomNumber: suite.roomNumber,
                standardRate: suite.standardRate,
                memberRate: suite.memberRate,
                nights,
                checkInDate: '14 Nov 2025',
                checkOutDate: `${checkOutDay} Nov 2025`,
                guestsLabel: suite.specs.guests,
                isMemberMode,
              })
            }
            className="h-11 px-5 rounded-xl bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Reserve Suite</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
