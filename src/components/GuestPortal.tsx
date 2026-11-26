import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bath,
  BedDouble,
  BookOpen,
  Calendar,
  CheckCircle2,
  Church,
  Coffee,
  Compass,
  Footprints,
  HelpCircle,
  Mail,
  MailCheck,
  Minus,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trees,
  Users,
  Utensils,
  VolumeX,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import { BUILDINGS, CONTACT_DETAILS, FEATURED_SUITES, IMAGES, INITIAL_PROGRAMMES } from '../data/sanctuaryData';
import { BuildingSlug, FeaturedSuite, RoomRecord } from '../types';
import { BookingDraft } from './BookingModal';

interface GuestPortalProps {
  rooms: RoomRecord[];
  isMemberMode: boolean;
  onToggleMemberMode: (enabled: boolean) => void;
  onOpenSuiteDetails: (suite: FeaturedSuite) => void;
  onOpenBookingModal: (draft: BookingDraft) => void;
  onNavigateToEvents: (buildingFilter?: BuildingSlug) => void;
}

const DATE_PRESETS = [
  { id: 'nov14', label: '14 Nov — 18 Nov', checkIn: '14 Nov 2025', checkOut: '18 Nov 2025', nights: 4 },
  { id: 'nov28', label: '28 Nov — 30 Nov', checkIn: '28 Nov 2025', checkOut: '30 Nov 2025', nights: 2 },
  { id: 'dec12', label: '12 Dec — 16 Dec', checkIn: '12 Dec 2025', checkOut: '16 Dec 2025', nights: 4 },
  { id: 'dec19', label: '19 Dec — 22 Dec', checkIn: '19 Dec 2025', checkOut: '22 Dec 2025', nights: 3 },
];

export const GuestPortal: React.FC<GuestPortalProps> = ({
  rooms,
  isMemberMode,
  onToggleMemberMode,
  onOpenSuiteDetails,
  onOpenBookingModal,
  onNavigateToEvents,
}) => {
  const [selectedHall, setSelectedHall] = useState<'all' | BuildingSlug>('all');
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [directoryFilter, setDirectoryFilter] = useState<'both' | 'available' | 'booked'>('both');
  const [directorySearch, setDirectorySearch] = useState('');
  const [showAllAvailable, setShowAllAvailable] = useState(false);
  const [showAllBooked, setShowAllBooked] = useState(false);

  const activeDate = DATE_PRESETS[selectedDateIdx];
  const guestsLabel = `${adults} ${adults === 1 ? 'Adult' : 'Adults'}${children > 0 ? `, ${children} ${children === 1 ? 'Child' : 'Children'}` : ''}`;

  const hallFilteredRooms = useMemo(() => {
    const q = directorySearch.trim().toLowerCase();
    return rooms.filter((r) => {
      if (selectedHall !== 'all' && r.buildingSlug !== selectedHall) return false;
      if (q) {
        const hay = `${r.roomNumber} ${r.buildingName} ${r.roomType} ${r.status}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rooms, selectedHall, directorySearch]);

  const availableRoomsList = useMemo(
    () => hallFilteredRooms.filter((r) => r.status === 'Available'),
    [hallFilteredRooms]
  );

  const bookedRoomsList = useMemo(
    () =>
      hallFilteredRooms.filter(
        (r) => r.status === 'Occupied' || r.status === 'Reserved' || r.status === 'Locked'
      ),
    [hallFilteredRooms]
  );

  const availableRoomsTotal = useMemo(
    () => rooms.filter((r) => r.status === 'Available').length,
    [rooms]
  );

  const filteredSuites = useMemo(() => {
    if (selectedHall === 'all') return FEATURED_SUITES;
    return FEATURED_SUITES.filter((s) => s.buildingSlug === selectedHall);
  }, [selectedHall]);

  const hallAvailableCount = useMemo(() => {
    if (selectedHall === 'all') return availableRoomsTotal;
    return rooms.filter(
      (r) => r.buildingSlug === selectedHall && r.status === 'Available'
    ).length;
  }, [rooms, selectedHall, availableRoomsTotal]);

  const renderFeatureIcon = (icon: string) => {
    const cls = 'w-3.5 h-3.5 text-secondary shrink-0';
    switch (icon) {
      case 'wifi':
        return <Wifi className={cls} />;
      case 'bolt':
        return <Zap className={cls} />;
      case 'bath':
      case 'shower':
        return <Bath className={cls} />;
      case 'book':
        return <BookOpen className={cls} />;
      case 'kitchen':
        return <Utensils className={cls} />;
      case 'ac':
        return <Wind className={cls} />;
      case 'lounge':
      case 'balcony':
        return <Sparkles className={cls} />;
      case 'quiet':
        return <VolumeX className={cls} />;
      case 'users':
        return <Users className={cls} />;
      case 'coffee':
        return <Coffee className={cls} />;
      default:
        return <BedDouble className={cls} />;
    }
  };

  const scrollToInventory = () => {
    const el = document.getElementById('room-inventory');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-12 space-y-8">
      {/* Hero Hospitality Banner + Search & Booking Engine Split on Desktop */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Hero Hospitality Banner */}
        <div className="lg:col-span-7 relative rounded-2xl bg-surface-container-low p-5 md:p-8 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-secondary-container/25 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-16 w-56 h-56 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
              <Church className="w-4 h-4" />
              <span>Parish & Diocesan Lodging</span>
              <span aria-hidden="true">·</span>
              <span>9 Buildings</span>
            </div>

            <h1 className="font-serif-display text-3xl md:text-4xl lg:text-[42px] text-primary tracking-tight leading-tight text-balance">
              Comfortable Accommodation.{' '}
              <span className="italic font-normal text-secondary">A Peaceful Place to Stay.</span>
            </h1>

            <p className="text-sm md:text-base text-on-surface-variant max-w-xl leading-relaxed">
              Thoughtful, peaceful hospitality across our 9 residence buildings for ministers, families, conference attendees & visitors.
            </p>

            {/* Visual Vignette Strip */}
            <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden shadow-sm mt-1">
              <img
                src={IMAGES.pastoralSuite}
                alt="Serene sanctuary lodge interior with warm sunlight and ivory linens"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-on-primary">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Sun className="w-4 h-4 text-secondary-fixed" />
                  <span>Prayer Gardens & Chimes Open Daily</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-container-lowest/20 backdrop-blur-md tabular-nums">
                  {rooms.length} Rooms
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={scrollToInventory}
                className="flex-1 sm:flex-initial h-11 px-5 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Search {rooms.length} Rooms</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleMemberMode(!isMemberMode);
                }}
                className={`h-11 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isMemberMode
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'bg-secondary-container/40 text-on-secondary-container hover:bg-secondary-container/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isMemberMode ? 'Member Rates Active' : 'Member Rates (15% Off)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Search & Booking Engine Card */}
        <div className="lg:col-span-5 rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-md border border-outline-variant/25 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* Guest Category Toggle */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container-low">
              <button
                type="button"
                onClick={() => onToggleMemberMode(false)}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  !isMemberMode
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                General Guest
              </button>
              <button
                type="button"
                onClick={() => onToggleMemberMode(true)}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  isMemberMode
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>
                  Church Member <span className="text-secondary font-bold">(15% Off)</span>
                </span>
              </button>
            </div>

            {/* Dates & Occupancy Selectors */}
            <div className="grid grid-cols-2 gap-2.5 relative">
              <button
                type="button"
                onClick={() => {
                  setShowDatePicker((v) => !v);
                  setShowGuestPicker(false);
                }}
                className="flex flex-col text-left p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                  Check-in / Out
                </span>
                <span className="text-sm font-semibold text-primary mt-1 truncate tabular-nums">
                  {activeDate.label}
                </span>
                <span className="text-xs font-medium text-secondary tabular-nums">
                  {activeDate.nights} Nights
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowGuestPicker((v) => !v);
                  setShowDatePicker(false);
                }}
                className="flex flex-col text-left p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-secondary" />
                  Occupancy
                </span>
                <span className="text-sm font-semibold text-primary mt-1 truncate tabular-nums">
                  {guestsLabel}
                </span>
                <span className="text-xs text-on-surface-variant">1 Ensuite Room</span>
              </button>

              {showDatePicker && (
                <div className="col-span-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-primary">
                    <span>Select Retreat / Stay Window</span>
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="text-secondary hover:underline cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DATE_PRESETS.map((preset, idx) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedDateIdx(idx);
                          setShowDatePicker(false);
                        }}
                        className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          selectedDateIdx === idx
                            ? 'bg-primary text-on-primary font-semibold'
                            : 'bg-surface-container-lowest text-primary hover:bg-surface-container'
                        }`}
                      >
                        <div>{preset.label}</div>
                        <div className="text-[11px] opacity-80 tabular-nums">{preset.nights} Nights</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showGuestPicker && (
                <div className="col-span-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-primary">
                    <span>Adjust Room Occupancy</span>
                    <button
                      type="button"
                      onClick={() => setShowGuestPicker(false)}
                      className="text-secondary hover:underline cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-primary font-medium">Adults / Ministers</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdults((a) => Math.max(1, a - 1))}
                        className="w-7 h-7 rounded-md bg-surface-container-lowest flex items-center justify-center text-primary cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-semibold tabular-nums">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults((a) => Math.min(6, a + 1))}
                        className="w-7 h-7 rounded-md bg-surface-container-lowest flex items-center justify-center text-primary cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-primary font-medium">Children</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildren((c) => Math.max(0, c - 1))}
                        className="w-7 h-7 rounded-md bg-surface-container-lowest flex items-center justify-center text-primary cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-semibold tabular-nums">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren((c) => Math.min(4, c + 1))}
                        className="w-7 h-7 rounded-md bg-surface-container-lowest flex items-center justify-center text-primary cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Residence Hall Horizontal Carousel */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-on-surface-variant">
                  Residence Hall
                </span>
                <span className="font-medium text-secondary">
                  {selectedHall === 'all'
                    ? 'Showing All 9 Halls'
                    : BUILDINGS.find((b) => b.slug === selectedHall)?.name}
                </span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedHall('all')}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedHall === 'all'
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  All 9 Buildings
                </button>
                {BUILDINGS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedHall(b.slug)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedHall === b.slug
                        ? 'bg-primary-container text-on-primary font-semibold'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Reactive Search Trigger Button */}
            <button
              type="button"
              onClick={scrollToInventory}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-between px-4 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-secondary-fixed" />
                <span>Find Available Rooms</span>
              </span>
              <span className="text-xs bg-surface-container-lowest/20 px-2.5 py-1 rounded-md tabular-nums">
                {selectedHall === 'all'
                  ? `${availableRoomsTotal} Available`
                  : `${hallAvailableCount} Available in Hall`}
              </span>
            </button>

            {isMemberMode && (
              <div className="p-2.5 rounded-xl bg-secondary-container/25 text-on-secondary-container flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>
                  <strong>Parish Pass Activated:</strong> 15% discount applied across all 9 residence lodges.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Available Accommodations */}
      <section id="room-inventory" className="space-y-4">
        <div className="flex items-end justify-between border-b border-outline-variant/30 pb-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
              Lodging Inventory
            </span>
            <h2 className="font-serif-display text-2xl md:text-3xl text-primary font-medium mt-0.5">
              Featured Residences
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span>{filteredSuites.length} Residences Shown</span>
            {selectedHall !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedHall('all')}
                className="text-secondary font-semibold hover:underline cursor-pointer"
              >
                Show All 9 Halls
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredSuites.map((suite) => {
            const activePrice = isMemberMode ? suite.memberRate : suite.standardRate;
            return (
              <article
                key={suite.id}
                className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm border border-outline-variant/25 flex flex-col hover:shadow-md transition-shadow"
              >
                <div
                  onClick={() => onOpenSuiteDetails(suite)}
                  className="relative w-full h-52 md:h-56 bg-surface-container cursor-pointer group overflow-hidden"
                >
                  <img
                    src={suite.image}
                    alt={`${suite.title} inside ${suite.buildingName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/65 via-transparent to-black/20" />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-surface-container-lowest/95 text-primary backdrop-blur-md shadow-xs">
                      {suite.buildingName} · Suite {suite.roomNumber}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs ${
                        suite.statusLabel === 'Instant Confirm'
                          ? 'bg-secondary text-on-secondary'
                          : suite.statusLabel === 'Popular'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-primary-container text-on-primary'
                      }`}
                    >
                      {suite.statusLabel}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
                    <span className="text-xs font-medium bg-primary/75 backdrop-blur-sm px-2.5 py-1 rounded-md">
                      {suite.wingTag}
                    </span>
                    <span className="text-xs font-semibold underline-offset-2 group-hover:underline">
                      View Details
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => onOpenSuiteDetails(suite)}
                        className="text-left cursor-pointer group"
                      >
                        <h3 className="font-serif-display text-xl font-semibold text-primary group-hover:text-secondary transition-colors">
                          {suite.title}
                        </h3>
                      </button>
                      <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
                        {suite.subtitle}
                      </p>
                    </div>

                    {/* Clean unboxed feature metadata row */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {suite.features.map((feat) => (
                        <div
                          key={feat.label}
                          className="px-2.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant text-xs flex items-center gap-1.5"
                        >
                          {renderFeatureIcon(feat.icon)}
                          <span className="truncate">{feat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Booking Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-container">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif-display text-xl font-semibold text-primary tabular-nums">
                          ₦{activePrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-on-surface-variant">/ night</span>
                      </div>
                      <span className="text-xs font-medium text-secondary tabular-nums">
                        {isMemberMode
                          ? `Standard: ₦${suite.standardRate.toLocaleString()}`
                          : `Member Rate: ₦${suite.memberRate.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenSuiteDetails(suite)}
                        className="h-10 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenBookingModal({
                            suiteTitle: suite.title,
                            buildingName: suite.buildingName,
                            buildingSlug: suite.buildingSlug,
                            roomNumber: suite.roomNumber,
                            standardRate: suite.standardRate,
                            memberRate: suite.memberRate,
                            nights: activeDate.nights,
                            checkInDate: activeDate.checkIn,
                            checkOutDate: activeDate.checkOut,
                            guestsLabel,
                            isMemberMode,
                          })
                        }
                        className="h-10 px-4 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <span>Book Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Live Directory: Available Rooms & Already Booked Rooms */}
      <section id="live-room-directory" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
              Live 190-Room Registry
            </span>
            <h2 className="font-serif-display text-2xl md:text-3xl text-primary font-medium mt-0.5">
              Available &amp; Already Booked Rooms
            </h2>
            <p className="text-xs md:text-sm text-on-surface-variant mt-0.5 tabular-nums">
              {availableRoomsList.length} available to book now · {bookedRoomsList.length} already booked across{' '}
              {selectedHall === 'all'
                ? 'all 9 residence buildings'
                : BUILDINGS.find((b) => b.slug === selectedHall)?.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low">
              {[
                { id: 'both' as const, label: 'Both Lists' },
                { id: 'available' as const, label: `Available (${availableRoomsList.length})` },
                { id: 'booked' as const, label: `Already Booked (${bookedRoomsList.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDirectoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                    directoryFilter === tab.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search inside room lists */}
        <div className="flex items-center gap-2 rounded-xl bg-surface-container-lowest px-3.5 py-2.5 border border-outline-variant/30 shadow-xs">
          <Search className="w-4 h-4 text-outline shrink-0" />
          <input
            type="search"
            value={directorySearch}
            onChange={(e) => setDirectorySearch(e.target.value)}
            placeholder="Filter rooms by number (e.g. 102, 404), building, or suite type..."
            className="w-full bg-transparent text-sm text-primary placeholder:text-outline focus:outline-none"
          />
          {directorySearch && (
            <button
              type="button"
              onClick={() => setDirectorySearch('')}
              className="text-xs font-semibold text-secondary hover:underline shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div
          className={`grid gap-6 items-start ${
            directoryFilter === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Available Rooms Column */}
          {(directoryFilter === 'both' || directoryFilter === 'available') && (
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs overflow-hidden">
              <div className="px-4 py-3.5 bg-surface-container-low border-b border-outline-variant/25 flex items-center justify-between">
                <div>
                  <h3 className="font-serif-display text-lg font-semibold text-primary">
                    Available Rooms
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Sanitized &amp; ready for immediate reservation
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#ebf7ee] text-[#1c6934] text-xs font-bold tabular-nums">
                  {availableRoomsList.length} Open
                </span>
              </div>

              {availableRoomsList.length === 0 ? (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  No available rooms match the current hall or search filter.
                </div>
              ) : (
                <div className="divide-y divide-surface-container">
                  {(showAllAvailable || directoryFilter === 'available' || selectedHall !== 'all'
                    ? availableRoomsList
                    : availableRoomsList.slice(0, 8)
                  ).map((room) => {
                    const activeRate = isMemberMode ? room.memberRate : room.ratePerNight;
                    return (
                      <div
                        key={room.id}
                        className="p-3.5 hover:bg-surface-container-low/60 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[#34784a] text-white flex flex-col items-center justify-center font-bold shrink-0">
                            <span className="text-[9px] uppercase opacity-80 leading-none">RM</span>
                            <span className="text-xs leading-none mt-0.5 tabular-nums">
                              {room.roomNumber}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary truncate">
                              {room.buildingName} · Room {room.roomNumber}
                            </p>
                            <p className="text-xs text-on-surface-variant truncate">
                              {room.roomType} · Floor {room.floor}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-bold text-primary block tabular-nums">
                              ₦{activeRate.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-secondary">/ night</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onOpenBookingModal({
                                suiteTitle: room.roomType,
                                buildingName: room.buildingName,
                                buildingSlug: room.buildingSlug,
                                roomNumber: room.roomNumber,
                                standardRate: room.ratePerNight,
                                memberRate: room.memberRate,
                                nights: activeDate.nights,
                                checkInDate: activeDate.checkIn,
                                checkOutDate: activeDate.checkOut,
                                guestsLabel,
                                isMemberMode,
                              })
                            }
                            className="h-9 px-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold cursor-pointer whitespace-nowrap"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {directoryFilter === 'both' &&
                selectedHall === 'all' &&
                availableRoomsList.length > 8 && (
                  <div className="p-3 bg-surface-container-low/60 border-t border-outline-variant/25 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllAvailable((v) => !v)}
                      className="text-xs font-semibold text-secondary hover:underline cursor-pointer tabular-nums"
                    >
                      {showAllAvailable
                        ? 'Show Fewer Available Rooms'
                        : `Show All ${availableRoomsList.length} Available Rooms`}
                    </button>
                  </div>
                )}
            </div>
          )}

          {/* Already Booked Rooms Column */}
          {(directoryFilter === 'both' || directoryFilter === 'booked') && (
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs overflow-hidden">
              <div className="px-4 py-3.5 bg-surface-container-low border-b border-outline-variant/25 flex items-center justify-between">
                <div>
                  <h3 className="font-serif-display text-lg font-semibold text-primary">
                    Already Booked Rooms
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Occupied, reserved, or held for church delegations
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-primary-container text-on-primary text-xs font-bold tabular-nums">
                  {bookedRoomsList.length} Booked
                </span>
              </div>

              {bookedRoomsList.length === 0 ? (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  No booked rooms match the current hall or search filter.
                </div>
              ) : (
                <div className="divide-y divide-surface-container">
                  {(showAllBooked || directoryFilter === 'booked' || selectedHall !== 'all'
                    ? bookedRoomsList
                    : bookedRoomsList.slice(0, 8)
                  ).map((room) => (
                    <div
                      key={room.id}
                      className="p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold shrink-0 ${
                            room.status === 'Reserved'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : room.status === 'Locked'
                              ? 'bg-outline text-on-primary'
                              : 'bg-primary-container text-on-primary'
                          }`}
                        >
                          <span className="text-[9px] uppercase opacity-80 leading-none">RM</span>
                          <span className="text-xs leading-none mt-0.5 tabular-nums">
                            {room.roomNumber}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-primary truncate">
                            {room.buildingName} · Room {room.roomNumber}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {room.roomType} · {room.stayPeriod}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-block ${
                            room.status === 'Reserved'
                              ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                              : room.status === 'Locked'
                              ? 'bg-surface-container-highest text-on-surface-variant'
                              : 'bg-primary-fixed text-on-primary-fixed'
                          }`}
                        >
                          {room.status === 'Occupied'
                            ? 'Booked · Occupied'
                            : room.status === 'Reserved'
                            ? 'Booked · Reserved'
                            : 'Convention Hold'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {directoryFilter === 'both' &&
                selectedHall === 'all' &&
                bookedRoomsList.length > 8 && (
                  <div className="p-3 bg-surface-container-low/60 border-t border-outline-variant/25 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllBooked((v) => !v)}
                      className="text-xs font-semibold text-secondary hover:underline cursor-pointer tabular-nums"
                    >
                      {showAllBooked
                        ? 'Show Fewer Booked Rooms'
                        : `Show All ${bookedRoomsList.length} Booked Rooms`}
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Church Programmes Section (Event-to-Room Linkage) */}
      <section className="rounded-2xl bg-primary-container text-on-primary p-5 md:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-fixed">
                <Calendar className="w-4 h-4" />
                <span>Special Programmes</span>
              </div>
              <h2 className="font-serif-display text-2xl md:text-3xl text-on-primary mt-1">
                Staying for an Upcoming Convention?
              </h2>
              <p className="text-sm text-on-primary-container mt-1 max-w-2xl">
                Certain residences are prioritized for ministry delegations and attendees with direct auditorium shuttle access.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToEvents()}
              className="self-start md:self-auto px-4 py-2 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary/90 transition-colors cursor-pointer whitespace-nowrap"
            >
              All 7 Programmes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_PROGRAMMES.slice(0, 2).map((prog) => (
              <div
                key={prog.id}
                className="p-4 rounded-xl bg-surface-container-lowest text-on-surface shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-secondary">
                      {prog.dates} · {prog.venue}
                    </span>
                    <span className="font-semibold text-primary-container">{prog.badge}</span>
                  </div>
                  <h3 className="font-serif-display text-lg font-semibold text-primary">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant">{prog.delegationCount} · {prog.wingAllocation}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToEvents(prog.targetBuilding)}
                  className="w-full py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{prog.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4 text-secondary" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Hospitality Pillars + Payment Assurance */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
              Sanctuary Peace of Mind
            </span>
            <h2 className="font-serif-display text-2xl text-primary font-medium mt-0.5">
              Why Stay at Sanctuary Haven
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: Zap,
                title: '24/7 Power & Clean Treated Water',
                desc: 'Dedicated dual industrial generators and constant borehole filtration ensure uninterrupted rest.',
              },
              {
                icon: ShieldCheck,
                title: 'Secure Gated Compound',
                desc: '24-hour uniformed parish patrol, perimeter CCTV surveillance, and serene curfew protection.',
              },
              {
                icon: Trees,
                title: 'Chapel & Quiet Prayer Gardens',
                desc: 'Perpetual adoration chapel and shaded benches for personal meditation and restorative prayer.',
              },
              {
                icon: Footprints,
                title: 'Walking Distance to Sanctuary',
                desc: 'Only a 3-minute shaded walkway stroll to the main church auditorium and parish administration.',
              },
              {
                icon: Coffee,
                title: 'Complimentary Breakfast for Ministers',
                desc: 'Nourishing morning tea, fresh fruits, and warm continental service delivered to all pastoral suites.',
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">{pillar.title}</h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nigerian Payment Assurance & Verified Channels */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center gap-4 border border-outline-variant/25">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-display text-xl font-semibold text-primary">
              Guaranteed Secure Reservation
            </h3>
            <p className="text-xs text-on-surface-variant max-w-xs mt-1 leading-relaxed">
              Instant booking confirmation sent directly via SMS & Official Parish Email.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs font-semibold text-primary shadow-xs">
              Paystack Verified
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs font-semibold text-primary shadow-xs">
              Flutterwave Secure
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs font-semibold text-primary shadow-xs inline-flex items-center gap-1.5">
              <MailCheck className="w-3.5 h-3.5 text-secondary" />
              Instant SMS Slip
            </span>
          </div>
          <div className="w-full pt-3 border-t border-outline-variant/30 space-y-2 text-xs text-on-surface-variant">
            <div className="flex items-center justify-center gap-1.5 font-semibold text-primary">
              <HelpCircle className="w-4 h-4 text-secondary shrink-0" />
              <span>Bookings &amp; Enquiries Desk</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={`tel:${CONTACT_DETAILS.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-semibold shadow-xs transition-colors tabular-nums"
              >
                <Phone className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>{CONTACT_DETAILS.phone}</span>
              </a>
              <a
                href={`mailto:${CONTACT_DETAILS.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-semibold shadow-xs transition-colors break-all"
              >
                <Mail className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>{CONTACT_DETAILS.email}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
