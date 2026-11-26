export type PrimaryTab = 'explore' | 'events' | 'my-bookings' | 'staff-ops';
export type StaffSubTab = 'operations' | 'inventory' | 'checkin';

export type RoomStatus = 'Occupied' | 'Available' | 'Reserved' | 'Turnover' | 'Locked';

export type BuildingSlug =
  | 'bethel'
  | 'zion'
  | 'grace'
  | 'shiloh'
  | 'ebenezer'
  | 'moriah'
  | 'peniel'
  | 'hermon'
  | 'covenant';

export interface BuildingInfo {
  id: string; // e.g., BLD-01
  slug: BuildingSlug;
  name: string;
  shortName: string;
  wingDescription: string;
  totalRooms: number;
  floors: {
    floorNumber: number;
    title: string;
    subtitle: string;
  }[];
  standardRate: number;
}

export interface RoomRecord {
  id: string; // e.g., BLD-01-104
  buildingId: string;
  buildingSlug: BuildingSlug;
  buildingName: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  status: RoomStatus;
  guestName: string;
  guestRole?: string;
  bookingRef?: string;
  keyId: string;
  stayPeriod: string;
  ratePerNight: number;
  memberRate: number;
  notes: string;
  assignedStaff?: string;
  badgeTag?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Diocese Voucher' | 'N/A';
}

export interface FeaturedSuite {
  id: string;
  roomNumber: string;
  buildingSlug: BuildingSlug;
  buildingName: string;
  buildingCode: string;
  wingTag: string;
  title: string;
  subtitle: string;
  statusLabel: 'Available' | 'Instant Confirm' | 'Popular' | 'Limited';
  image: string;
  gallery: string[];
  standardRate: number;
  memberRate: number;
  features: { icon: string; label: string }[];
  specs: {
    bed: string;
    bedNote: string;
    guests: string;
    guestsNote: string;
    area: string;
    areaNote: string;
    view: string;
    viewNote: string;
  };
  description: string;
}

export type ProgrammeCategory =
  | 'Conventions'
  | 'Leadership Retreats'
  | 'Youth & Workers'
  | 'Past Archive';

export interface ChurchProgramme {
  id: string;
  title: string;
  category: ProgrammeCategory;
  badge: string;
  dates: string;
  venue: string;
  theme?: string;
  delegationCount: string;
  wingAllocation: string;
  roomsOpenLabel: string;
  quotaPercent?: number;
  ctaLabel: string;
  targetBuilding?: BuildingSlug;
  isUpcomingRelease?: boolean;
  releaseNote?: string;
  isFlagship?: boolean;
}

export interface ConventionBlock {
  id: string;
  buildingTag: string;
  buildingSlug: BuildingSlug;
  title: string;
  remaining: number;
  badgeTone: 'amber' | 'red';
  image: string;
  shuttleNote: string;
  features: string[];
  standardRate: number;
  delegateRate: number;
  rateNote: string;
  ctaLabel: string;
}

export interface GuestBooking {
  id: string;
  ref: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  buildingName: string;
  buildingSlug: BuildingSlug;
  roomNumber: string;
  suiteTitle: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsLabel: string;
  isMemberRate: boolean;
  voucherCode?: string;
  totalAmount: number;
  paymentMethod:
    | 'Paystack'
    | 'Flutterwave'
    | 'Desk Hold (2h)'
    | 'Diocese Voucher'
    | 'Email & WhatsApp'
    | 'WhatsApp API'
    | 'Email API';
  dispatchId?: string;
  bookingChannel?: 'email' | 'whatsapp' | 'both';
  status: 'Confirmed' | 'Hold Pending' | 'Checked In' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface DeskQueueItem {
  id: string;
  initials: string;
  guestName: string;
  roleSubtitle: string;
  parish?: string;
  buildingName: string;
  roomLabel: string;
  roomNumber?: string;
  bookingRef: string;
  statusBadge: 'Awaiting Check-in' | 'Checked In' | 'Approval Needed' | 'Maintenance Hold' | 'Lobby Waiting' | 'Unpaid';
  paymentLabel: string;
  paymentVerified: boolean;
  amount: number;
  nightsLabel?: string;
  datesLabel?: string;
  keyLabel?: string;
  devotionNote?: string;
  techNote?: string;
  actionType: 'checkin' | 'folio' | 'approve-group' | 'release-maintenance' | 'inspect' | 'collect-pos';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
}

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  targetTab?: PrimaryTab;
}
