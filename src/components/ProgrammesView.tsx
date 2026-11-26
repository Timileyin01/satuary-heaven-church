import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BedDouble,
  BookOpen,
  Building2,
  Bus,
  CheckCircle2,
  Coffee,
  Luggage,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  QrCode,
  Shield,
  Sparkles,
  Ticket,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import {
  CONTACT_DETAILS,
  CONVENTION_BLOCKS,
  IMAGES,
  INITIAL_PROGRAMMES,
} from '../data/sanctuaryData';
import { BuildingSlug, ProgrammeCategory } from '../types';
import { BookingDraft } from './BookingModal';
import { EnquiryDraft } from './EnquiryModal';

interface ProgrammesViewProps {
  onBackToBrowse: () => void;
  onOpenBookingModal: (draft: BookingDraft) => void;
  onOpenEnquiryModal: (draft: EnquiryDraft) => void;
  onToast: (msg: string) => void;
  blockRemainingOverrides: Record<string, number>;
  onDecrementBlock: (blockId: string) => void;
}

export const ProgrammesView: React.FC<ProgrammesViewProps> = ({
  onBackToBrowse,
  onOpenBookingModal,
  onOpenEnquiryModal,
  onToast,
  blockRemainingOverrides,
  onDecrementBlock,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProgrammeCategory>('all');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [notifyRequested, setNotifyRequested] = useState<Record<string, boolean>>({});

  const filteredProgrammes = useMemo(() => {
    if (selectedCategory === 'all') return INITIAL_PROGRAMMES;
    return INITIAL_PROGRAMMES.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const flagship = INITIAL_PROGRAMMES[0];
  const calendarProgrammes = filteredProgrammes.filter((p) => !p.isFlagship);

  const handleApplyVoucher = () => {
    const clean = voucherCode.trim().toUpperCase();
    if (!clean) {
      onToast('Enter a Diocesan or Parish group code (e.g. LAGOS-DIOCESE-2025).');
      return;
    }
    setAppliedVoucher(clean);
    onToast(`Diocesan subsidy voucher "${clean}" verified! 10% delegation discount ready.`);
  };

  const reserveConventionBlock = (
    blockId: string,
    buildingName: string,
    buildingSlug: BuildingSlug,
    suiteTitle: string,
    standardRate: number,
    delegateRate: number
  ) => {
    onDecrementBlock(blockId);
    onOpenBookingModal({
      suiteTitle,
      buildingName,
      buildingSlug,
      roomNumber: blockId === 'block-shiloh-twin' ? '404' : '108',
      standardRate,
      memberRate: delegateRate,
      nights: 4,
      checkInDate: '12 Dec 2025',
      checkOutDate: '16 Dec 2025',
      guestsLabel: blockId === 'block-shiloh-twin' ? '2 Delegates' : '4 Delegates',
      isMemberMode: true,
      voucherCode: appliedVoucher || undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-12 space-y-8">
      {/* Sub-Navigation & Context */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToBrowse}
            className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-xs font-semibold uppercase tracking-wider transition-colors py-1 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Browse</span>
          </button>

          <span className="text-xs font-medium text-secondary">Lagos GMT+1</span>
        </div>

        <div className="space-y-1.5">
          <h1 className="font-serif-display text-3xl md:text-4xl text-primary tracking-tight">
            Church Programmes & Event Lodging
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl">
            Reserve guaranteed lodging blocks for annual conventions, ministerial retreats, and youth synods with direct auditorium shuttle access.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(
            [
              { id: 'all', label: `All Programmes (${INITIAL_PROGRAMMES.length})` },
              { id: 'Conventions', label: 'Conventions' },
              { id: 'Leadership Retreats', label: 'Leadership Retreats' },
              { id: 'Youth & Workers', label: 'Youth & Workers' },
              { id: 'Past Archive', label: 'Past Archive' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Major Convention (Show on All or Conventions) */}
      {(selectedCategory === 'all' || selectedCategory === 'Conventions') && (
        <section className="rounded-2xl bg-surface-container-low shadow-sm border border-outline-variant/25 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 relative min-h-[240px] lg:min-h-[380px]">
            <img
              src={IMAGES.conventionHall}
              alt="Annual Holy Ghost and Faith Convention Main Auditorium"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/45 to-primary/15" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {flagship.badge}
              </span>
              <span className="px-3 py-1 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md text-xs font-semibold text-primary tabular-nums">
                {flagship.dates}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-on-primary">
              <p className="text-[11px] uppercase tracking-widest text-secondary-fixed font-semibold">
                Annual Convention
              </p>
              <h2 className="font-serif-display text-2xl md:text-3xl font-medium leading-snug mt-0.5">
                {flagship.title}
              </h2>
            </div>
          </div>

          <div className="lg:col-span-6 p-5 md:p-7 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container text-primary text-xs md:text-sm">
                <BookOpen className="w-4 h-4 text-secondary shrink-0" />
                <p className="italic text-on-surface-variant">
                  Theme: <span className="font-semibold text-primary not-italic">{flagship.theme}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-container-lowest flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold block">
                      Venue
                    </span>
                    <span className="text-xs font-medium text-primary block truncate">
                      {flagship.venue}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest flex items-start gap-2">
                  <Users className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold block">
                      Delegation
                    </span>
                    <span className="text-xs font-medium text-primary block truncate">
                      {flagship.delegationCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Room Quota Gauge */}
              <div className="p-3.5 rounded-xl bg-surface-container-lowest space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase text-secondary font-bold tracking-wider">
                    Accommodation Quota
                  </span>
                  <span className="font-bold text-error tabular-nums">75% Reserved</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-xs text-on-surface-variant">
                  Dedicated Block: <strong className="text-primary">60 Rooms Allocated</strong> (40 Shiloh Pavilion, 20 Ebenezer Hall). Subsidized Diocese tariffs applied.
                </p>
              </div>

              {/* Key Assemblies */}
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  Key Assemblies
                </span>
                <div className="divide-y divide-surface-container text-xs">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-primary font-medium">Opening Anointing Service</span>
                    <span className="text-on-surface-variant tabular-nums">Dec 12 · 5:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-primary font-medium">All-Night Apostolic Vigil</span>
                    <span className="text-on-surface-variant tabular-nums">Dec 14 · 10:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-primary font-medium">Ordination & Farewell Communion</span>
                    <span className="text-on-surface-variant tabular-nums">Dec 16 · 9:00 AM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-outline-variant/30 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-on-surface-variant">Convention Package from:</span>
                <div className="text-right">
                  <span className="font-serif-display text-xl font-bold text-primary tabular-nums">
                    ₦20,400
                  </span>
                  <span className="text-xs text-on-surface-variant"> / night</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  reserveConventionBlock(
                    'block-shiloh-twin',
                    'Shiloh Pavilion',
                    'shiloh',
                    'Deluxe Delegate Twin',
                    24000,
                    20400
                  )
                }
                className="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
              >
                <BedDouble className="w-4 h-4" />
                <span>Book Convention Lodging Block</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Convention Room Quotas */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-outline-variant/30 pb-2.5">
          <div>
            <span className="text-xs uppercase tracking-wider text-secondary font-bold">
              Official Room Wings
            </span>
            <h2 className="font-serif-display text-2xl text-primary font-medium">
              Convention Room Quotas
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant">2 Room Types</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONVENTION_BLOCKS.map((block) => {
            const remaining = blockRemainingOverrides[block.id] ?? block.remaining;
            return (
              <div
                key={block.id}
                className="rounded-2xl bg-surface-container-low p-5 flex flex-col justify-between gap-4 shadow-sm border border-outline-variant/25"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-semibold text-secondary block">
                        {block.buildingTag}
                      </span>
                      <h3 className="font-serif-display text-xl font-semibold text-primary mt-0.5">
                        {block.title}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums shrink-0 ${
                        block.badgeTone === 'red'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-secondary-fixed text-on-secondary-fixed'
                      }`}
                    >
                      {block.badgeTone === 'red' ? `Only ${remaining} Left` : `${remaining} Left`}
                    </span>
                  </div>

                  <div className="relative w-full h-40 rounded-xl overflow-hidden">
                    <img
                      src={block.image}
                      alt={block.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-primary/85 backdrop-blur-sm text-on-primary px-2.5 py-1 rounded-md text-xs font-medium">
                      {block.shuttleNote}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                    {block.features.map((feat, i) => (
                      <div key={feat} className="flex items-center gap-1.5">
                        {i === 0 ? (
                          <BedDouble className="w-3.5 h-3.5 text-secondary shrink-0" />
                        ) : i === 1 ? (
                          <Wifi className="w-3.5 h-3.5 text-secondary shrink-0" />
                        ) : i === 2 ? (
                          <Zap className="w-3.5 h-3.5 text-secondary shrink-0" />
                        ) : block.id === 'block-shiloh-twin' ? (
                          <Bus className="w-3.5 h-3.5 text-secondary shrink-0" />
                        ) : (
                          <Luggage className="w-3.5 h-3.5 text-secondary shrink-0" />
                        )}
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                  <div>
                    {block.standardRate > block.delegateRate && (
                      <span className="text-xs line-through text-on-surface-variant block tabular-nums">
                        ₦{block.standardRate.toLocaleString()}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif-display text-xl font-bold text-primary tabular-nums">
                        ₦{block.delegateRate.toLocaleString()}
                      </span>
                      <span className="text-xs text-secondary font-medium">{block.rateNote}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      reserveConventionBlock(
                        block.id,
                        block.buildingTag.split('•')[0].trim(),
                        block.buildingSlug,
                        block.title,
                        block.standardRate,
                        block.delegateRate
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    {block.ctaLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Calendar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2.5">
          <h2 className="font-serif-display text-2xl text-primary font-medium">
            Upcoming Calendar
          </h2>
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            {calendarProgrammes.length} Scheduled Synods
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendarProgrammes.map((prog) => {
            const notified = Boolean(notifyRequested[prog.id]);
            return (
              <div
                key={prog.id}
                className="rounded-2xl bg-surface-container-low p-5 flex flex-col justify-between gap-3 border border-outline-variant/25 shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-semibold uppercase tracking-wider text-primary">
                      {prog.badge}
                    </span>
                    <span className="font-bold text-secondary tabular-nums shrink-0">{prog.dates}</span>
                  </div>

                  <div>
                    <h3 className="font-serif-display text-lg font-semibold text-primary leading-snug">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Venue: {prog.venue} · {prog.delegationCount}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest text-xs text-on-surface">
                    <Building2 className="w-4 h-4 text-secondary shrink-0" />
                    <span className="truncate">
                      Wing: <strong className="text-primary">{prog.wingAllocation}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/25 gap-2">
                  <span className="text-xs font-medium text-on-surface-variant">
                    {prog.roomsOpenLabel}
                  </span>

                  {prog.isUpcomingRelease ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNotifyRequested((prev) => ({ ...prev, [prog.id]: true }));
                        onToast(`SMS reminder scheduled for ${prog.title} quota release.`);
                      }}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        notified
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : 'bg-surface-container text-primary hover:bg-surface-container-high'
                      }`}
                    >
                      {notified ? 'Reminder Set' : 'Notify Me'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenBookingModal({
                          suiteTitle: prog.title.split(' ').slice(0, 3).join(' '),
                          buildingName: prog.wingAllocation.split('&')[0].trim(),
                          buildingSlug: prog.targetBuilding || 'grace',
                          roomNumber: '112',
                          standardRate: 32000,
                          memberRate: 27200,
                          nights: 3,
                          checkInDate: prog.dates.split('–')[0].trim(),
                          checkOutDate: prog.dates,
                          guestsLabel: '1 Delegate',
                          isMemberMode: true,
                          voucherCode: appliedVoucher || undefined,
                        })
                      }
                      className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      {prog.ctaLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Perks + Diocesan Voucher Verification Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl bg-primary-container text-on-primary p-6 flex flex-col gap-4 shadow-md">
          <div className="flex items-center gap-2.5">
            <BadgeCheck className="w-6 h-6 text-secondary-fixed" />
            <h2 className="font-serif-display text-2xl text-on-primary">
              Why Book Official Lodging?
            </h2>
          </div>
          <p className="text-xs md:text-sm text-on-primary-container">
            Official sanctuary accommodation keeps delegates rested, spiritually centered, and logistically secure throughout long prayer programs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {[
              {
                icon: QrCode,
                title: 'Priority Auditorium Shuttle',
                desc: 'Scheduled vans leave every 15 minutes connecting all 9 campus lodges directly to sanctuary gates.',
              },
              {
                icon: BadgeCheck,
                title: 'Fast-Track Registration',
                desc: 'Pick up your official badge, delegate kit, and hymn manual straight from your lodge reception desk.',
              },
              {
                icon: Shield,
                title: 'Post-Vigil Security Escort',
                desc: 'Campus security patrols and illuminated pastoral pathways ensure peace of mind after late-night prayers.',
              },
              {
                icon: Coffee,
                title: "Ministers' Morning Refreshes",
                desc: 'Complimentary early morning herbal tea, hot beverages, and fresh light breakfast before dawn sessions.',
              },
            ].map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.title} className="flex items-start gap-3 p-3 rounded-xl bg-primary/45">
                  <Icon className="w-4 h-4 text-secondary-fixed shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-on-primary">{perk.title}</h3>
                    <p className="text-xs text-on-primary-container mt-1 leading-relaxed">{perk.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diocesan Voucher Box */}
        <div className="lg:col-span-5 rounded-2xl bg-surface-container-high p-6 flex flex-col justify-between gap-4 border border-outline-variant/25">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-secondary">
              <Ticket className="w-5 h-5" />
              <h3 className="font-serif-display text-xl font-semibold text-primary">
                Diocesan Voucher or Bulk Group Code?
              </h3>
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              Parish delegations and sponsored church workers can apply diocesan subsidy vouchers to cover collective hostel bookings directly.
            </p>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="e.g. LAGOS-DIOCESE-2025"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-sm text-primary placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold shrink-0 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

            {appliedVoucher && (
              <div className="p-2.5 rounded-xl bg-primary-fixed text-on-primary-fixed text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Voucher {appliedVoucher} active (-10% subsidy)
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedVoucher(null)}
                  className="underline text-[11px] cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-outline-variant/30 space-y-1.5 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-secondary shrink-0" />
              <span>
                Booking &amp; Enquiries Line:{' '}
                <a
                  href={`tel:${CONTACT_DETAILS.phone}`}
                  className="font-bold text-primary hover:underline tabular-nums"
                >
                  {CONTACT_DETAILS.phone}
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-secondary shrink-0" />
              <span>
                Enquiries Email:{' '}
                <a
                  href={`mailto:${CONTACT_DETAILS.email}`}
                  className="font-bold text-primary hover:underline break-all"
                >
                  {CONTACT_DETAILS.email}
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-secondary shrink-0" />
              <span>
                WhatsApp Support:{' '}
                <strong className="text-primary tabular-nums">{CONTACT_DETAILS.phone}</strong>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiryModal({
                    subject: 'Convention Group Lodging & Voucher Enquiry',
                    buildingName: 'Shiloh Pavilion / Ebenezer Hall',
                    presetMessage:
                      'Hello Sanctuary Desk, our parish delegation would like to enquire about group convention lodging.',
                  })
                }
                className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-secondary-fixed" />
                <span>Send Group Enquiry via Email &amp; WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={onBackToBrowse}
                className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline cursor-pointer"
              >
                <span>Browse All 9 Residence Buildings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
