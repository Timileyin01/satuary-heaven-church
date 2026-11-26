import {
  AppNotification,
  AuditEntry,
  BuildingInfo,
  ChurchProgramme,
  ConventionBlock,
  DeskQueueItem,
  FeaturedSuite,
  GuestBooking,
  RoomRecord,
  RoomStatus,
} from '../types';

export const CONTACT_DETAILS = {
  phone: '08066947526',
  phoneIntl: '+2348066947526',
  email: 'oluwaseyiisreal4@gmail.com',
};

export const IMAGES = {
  logo: '/src/assets/images/sanctuary_logo_1795596576625.jpg',
  pastoralSuite: '/src/assets/images/pastoral_suite_1795596577339.jpg',
  familyFlat: '/src/assets/images/family_flat_1795596577687.jpg',
  graceGarden: '/src/assets/images/grace_garden_room_1795596578102.jpg',
  shilohTwin: '/src/assets/images/shiloh_twin_room_1795596579095.jpg',
  conventionHall: '/src/assets/images/convention_auditorium_1795596579430.jpg',
  clergyPortrait: '/src/assets/images/clergy_portrait_1795596579926.jpg',
};

export const BUILDINGS: BuildingInfo[] = [
  {
    id: 'BLD-01',
    slug: 'bethel',
    name: 'Bethel House',
    shortName: 'Bethel House',
    wingDescription: 'Clergy & Pastors Wing • Executive Suites & Pastoral Lodges',
    totalRooms: 24,
    standardRate: 45000,
    floors: [
      { floorNumber: 1, title: 'Floor 1 — Ground Pastoral Wing (6 Suites)', subtitle: 'Elevator Access / East Cloister' },
      { floorNumber: 2, title: 'Floor 2 — Visiting Bishops Wing', subtitle: '8 Executive Suites' },
      { floorNumber: 3, title: 'Floor 3 — Contemplative Hermitage', subtitle: '10 Quiet Study Suites' },
    ],
  },
  {
    id: 'BLD-02',
    slug: 'zion',
    name: 'Mount Zion Lodge',
    shortName: 'Mt Zion Lodge',
    wingDescription: 'Executive Suites & Family Apartments',
    totalRooms: 28,
    standardRate: 55000,
    floors: [
      { floorNumber: 1, title: 'Floor 1 — Garden Family Flats (10 Flats)', subtitle: 'Ground Access / Kitchenette Wing' },
      { floorNumber: 2, title: 'Floor 2 — Delegation Suites (10 Flats)', subtitle: 'Parlour & Lounge Wing' },
      { floorNumber: 3, title: 'Floor 3 — Ridge Residences (8 Flats)', subtitle: 'Panoramic Courtyard View' },
    ],
  },
  {
    id: 'BLD-03',
    slug: 'grace',
    name: 'Grace Haven',
    shortName: 'Grace Haven',
    wingDescription: 'Prayer Garden View • Deluxe & Family Apartments',
    totalRooms: 22,
    standardRate: 32000,
    floors: [
      { floorNumber: 1, title: 'Floor 1 — Prayer Garden Terrace (12 Rooms)', subtitle: 'Direct Cloister Walkway' },
      { floorNumber: 2, title: 'Floor 2 — Upper Sanctuary View (10 Rooms)', subtitle: 'Private Balconies' },
    ],
  },
  {
    id: 'BLD-04',
    slug: 'shiloh',
    name: 'Shiloh Pavilion',
    shortName: 'Shiloh Pavilion',
    wingDescription: 'Convention Block • Standard Doubles with Study Desks',
    totalRooms: 26,
    standardRate: 24000,
    floors: [
      { floorNumber: 1, title: 'Floor 1 — Conference Delegate Wing (12 Rooms)', subtitle: 'Auditorium Shuttle Gate' },
      { floorNumber: 2, title: 'Floor 2 — Ministry Delegates Block (14 Rooms)', subtitle: 'High-Speed Fiber Wing' },
    ],
  },
  {
    id: 'BLD-05',
    slug: 'ebenezer',
    name: 'Ebenezer Hall',
    shortName: 'Ebenezer Hall',
    wingDescription: 'Dormitory & Group Quarters • Choir & Youth Delegations',
    totalRooms: 20,
    standardRate: 36000,
    floors: [
      { floorNumber: 1, title: 'Floor 1 — Parish Group Quad Wing (10 Suites)', subtitle: 'Luggage Lockers & Study Bay' },
      { floorNumber: 2, title: 'Floor 2 — Youth & Choir Quarters (10 Suites)', subtitle: 'Fellowship Hall Access' },
    ],
  },
  {
    id: 'BLD-06',
    slug: 'moriah',
    name: 'Moriah Court',
    shortName: 'Moriah Court',
    wingDescription: 'Standard En-Suite • Quiet Pilgrim Lodging',
    totalRooms: 18,
    standardRate: 28000,
    floors: [
      { floorNumber: 1, title: 'Floor 1 — Courtyard Standard Wing (9 Rooms)', subtitle: 'Quiet Courtyard Access' },
      { floorNumber: 2, title: 'Floor 2 — Upper En-Suite Wing (9 Rooms)', subtitle: 'East Garden Breeze' },
    ],
  },
  {
    id: 'BLD-07',
    slug: 'peniel',
    name: 'Peniel Court',
    shortName: 'Peniel Court',
    wingDescription: 'Private Prayer Cells • Solo Retreat & Fasting Suites',
    totalRooms: 16,
    standardRate: 22000,
    floors: [
      { floorNumber: 1, title: 'Floor 1 — Stillness Cloister (8 Cells)', subtitle: 'Sacred Silence Zone' },
      { floorNumber: 2, title: 'Floor 2 — Contemplative Upper Cells (8 Cells)', subtitle: 'Chapel Bell Proximity' },
    ],
  },
  {
    id: 'BLD-08',
    slug: 'hermon',
    name: 'Hermon Heights',
    shortName: 'Hermon Heights',
    wingDescription: 'Upper Ridge Lodging • Visiting Choirs & Stewards',
    totalRooms: 20,
    standardRate: 26000,
    floors: [
      { floorNumber: 1, title: 'Floor 1 — Ridge Standard Wing (10 Rooms)', subtitle: 'Hillside Breeze' },
      { floorNumber: 2, title: 'Floor 2 — Steward & Worker Suites (10 Rooms)', subtitle: 'Main Gate Access' },
    ],
  },
  {
    id: 'BLD-09',
    slug: 'covenant',
    name: 'Covenant Rest',
    shortName: 'Covenant Rest',
    wingDescription: 'VIP Bishopric & Guest Prelates Residence',
    totalRooms: 16,
    standardRate: 65000,
    floors: [
      { floorNumber: 1, title: 'Floor 1 — Prelate Protocol Wing (8 VIP Suites)', subtitle: 'Private Concierge Entry' },
      { floorNumber: 2, title: 'Floor 2 — Apostolic Residence (8 VIP Suites)', subtitle: 'Private Chapel Lounge' },
    ],
  },
];

export const FEATURED_SUITES: FeaturedSuite[] = [
  {
    id: 'suite-bethel-104',
    roomNumber: '104',
    buildingSlug: 'bethel',
    buildingName: 'Bethel House',
    buildingCode: 'BLD-01',
    wingTag: 'Pastoral Wing',
    title: 'Pastoral Suite',
    subtitle: 'Executive King Ensuite • Quiet Study Desk & Prayer Altar',
    statusLabel: 'Available',
    image: IMAGES.pastoralSuite,
    gallery: [IMAGES.pastoralSuite, IMAGES.graceGarden, IMAGES.familyFlat, IMAGES.shilohTwin, IMAGES.conventionHall, IMAGES.pastoralSuite],
    standardRate: 45000,
    memberRate: 38250,
    features: [
      { icon: 'wifi', label: 'High-Speed Wi-Fi' },
      { icon: 'bolt', label: '24/7 Generator' },
      { icon: 'bath', label: 'Ensuite' },
      { icon: 'book', label: 'Prayer Desk' },
    ],
    specs: {
      bed: '1 King Bed',
      bedNote: 'Orthopedic',
      guests: '2 Adults',
      guestsNote: 'Max Guests',
      area: '42 m²',
      areaNote: 'High Ceilings',
      view: 'Balcony',
      viewNote: 'Prayer View',
    },
    description:
      'A consecrated sanctuary of stillness featuring cedar wood furnishings, morning garden vistas, and dedicated devotional corners tailored for visiting ministers, retreatants, and reflection.',
  },
  {
    id: 'suite-zion-202',
    roomNumber: '202',
    buildingSlug: 'zion',
    buildingName: 'Mount Zion Lodge',
    buildingCode: 'BLD-02',
    wingTag: 'Family & Delegation',
    title: 'Family Flat',
    subtitle: '2 Queen Beds • Ensuite Parlour & Kitchenette',
    statusLabel: 'Available',
    image: IMAGES.familyFlat,
    gallery: [IMAGES.familyFlat, IMAGES.pastoralSuite, IMAGES.graceGarden, IMAGES.shilohTwin],
    standardRate: 55000,
    memberRate: 46750,
    features: [
      { icon: 'kitchen', label: 'Kitchenette' },
      { icon: 'bolt', label: '24/7 Generator' },
      { icon: 'ac', label: 'Full AC' },
      { icon: 'lounge', label: 'Lounge' },
    ],
    specs: {
      bed: '2 Queen Beds',
      bedNote: 'Plush Cotton',
      guests: '4 Guests',
      guestsNote: 'Family Size',
      area: '64 m²',
      areaNote: 'With Parlour',
      view: 'Courtyard',
      viewNote: 'Garden Terrace',
    },
    description:
      'Spacious family and delegation flat designed for visiting households and parish teams, complete with an enclosed sitting parlour, kitchenette, and quiet terrace.',
  },
  {
    id: 'suite-grace-112',
    roomNumber: '112',
    buildingSlug: 'grace',
    buildingName: 'Grace Haven',
    buildingCode: 'BLD-03',
    wingTag: 'Prayer Garden View',
    title: 'Deluxe Double',
    subtitle: '1 Queen Bed • Private Balcony overlooking Prayer Garden',
    statusLabel: 'Instant Confirm',
    image: IMAGES.graceGarden,
    gallery: [IMAGES.graceGarden, IMAGES.pastoralSuite, IMAGES.familyFlat],
    standardRate: 32000,
    memberRate: 27200,
    features: [
      { icon: 'balcony', label: 'Balcony' },
      { icon: 'bolt', label: '24/7 Generator' },
      { icon: 'wifi', label: 'Wi-Fi' },
      { icon: 'shower', label: 'Hot Shower' },
    ],
    specs: {
      bed: '1 Queen Bed',
      bedNote: 'Crisp Linen',
      guests: '2 Adults',
      guestsNote: 'Max Guests',
      area: '34 m²',
      areaNote: 'Oak Timber',
      view: 'Garden',
      viewNote: 'Chapel Lawn',
    },
    description:
      'Bright deluxe room opening onto a private balcony above the Sanctuary Prayer Garden, ideal for peaceful rest between church assemblies.',
  },
  {
    id: 'suite-shiloh-305',
    roomNumber: '305',
    buildingSlug: 'shiloh',
    buildingName: 'Shiloh Pavilion',
    buildingCode: 'BLD-04',
    wingTag: 'Conference & Delegates',
    title: 'Conference Retreat Room',
    subtitle: '2 Single Beds • High-Speed Wi-Fi & Workstations',
    statusLabel: 'Popular',
    image: IMAGES.shilohTwin,
    gallery: [IMAGES.shilohTwin, IMAGES.graceGarden, IMAGES.pastoralSuite],
    standardRate: 24000,
    memberRate: 20400,
    features: [
      { icon: 'wifi', label: 'Fiber Net' },
      { icon: 'bolt', label: '24/7 Generator' },
      { icon: 'bath', label: 'Private Bath' },
      { icon: 'quiet', label: 'Soundproof' },
    ],
    specs: {
      bed: '2 Twin Beds',
      bedNote: 'Linen Finish',
      guests: '2 Delegates',
      guestsNote: 'Twin Share',
      area: '28 m²',
      areaNote: 'Study Desk',
      view: 'Shuttle',
      viewNote: 'Gate Access',
    },
    description:
      'Purpose-built conference delegate twin accommodation located steps from the Auditorium Shuttle station with dual study lamps and fiber connectivity.',
  },
  {
    id: 'suite-ebenezer-108',
    roomNumber: '108',
    buildingSlug: 'ebenezer',
    buildingName: 'Ebenezer Hall',
    buildingCode: 'BLD-05',
    wingTag: 'Group & Choir Wing',
    title: 'Delegation Quad Suite',
    subtitle: '4 Beds Ensuite • Study Table & Luggage Lockers',
    statusLabel: 'Limited',
    image: IMAGES.shilohTwin,
    gallery: [IMAGES.shilohTwin, IMAGES.familyFlat],
    standardRate: 36000,
    memberRate: 30600,
    features: [
      { icon: 'users', label: '4 Guests' },
      { icon: 'bolt', label: '24/7 Power' },
      { icon: 'bath', label: 'Ensuite Bath' },
      { icon: 'book', label: 'Study Bay' },
    ],
    specs: {
      bed: '4 Single Beds',
      bedNote: 'Hardwood',
      guests: '4 Delegates',
      guestsNote: 'Parish Team',
      area: '46 m²',
      areaNote: 'Locker Bay',
      view: 'Campus',
      viewNote: 'East Lawn',
    },
    description:
      'Structured group suite crafted for choir teams, youth fellowships, and visiting parish workers seeking clean communal lodging at subsidized rates.',
  },
  {
    id: 'suite-moriah-106',
    roomNumber: '106',
    buildingSlug: 'moriah',
    buildingName: 'Moriah Court',
    buildingCode: 'BLD-06',
    wingTag: 'Standard En-Suite',
    title: 'Pilgrim Courtyard Room',
    subtitle: '1 Double Bed • Quiet Enclosed Courtyard & Desk',
    statusLabel: 'Available',
    image: IMAGES.graceGarden,
    gallery: [IMAGES.graceGarden, IMAGES.pastoralSuite],
    standardRate: 28000,
    memberRate: 23800,
    features: [
      { icon: 'wifi', label: 'Wi-Fi' },
      { icon: 'bolt', label: '24/7 Power' },
      { icon: 'ac', label: 'Inverter AC' },
      { icon: 'shower', label: 'Hot Water' },
    ],
    specs: {
      bed: '1 Double Bed',
      bedNote: 'Orthopedic',
      guests: '2 Adults',
      guestsNote: 'Max Guests',
      area: '26 m²',
      areaNote: 'Quiet Wing',
      view: 'Courtyard',
      viewNote: 'Cloister',
    },
    description:
      'Serene standard ensuite room tucked in the Moriah Court quadrangle with tranquil morning light and filtered water service.',
  },
  {
    id: 'suite-peniel-102',
    roomNumber: '102',
    buildingSlug: 'peniel',
    buildingName: 'Peniel Court',
    buildingCode: 'BLD-07',
    wingTag: 'Private Prayer Cell',
    title: 'Contemplative Prayer Cell',
    subtitle: '1 Single Bed • Leather Kneeler & Silent Cloister',
    statusLabel: 'Available',
    image: IMAGES.pastoralSuite,
    gallery: [IMAGES.pastoralSuite, IMAGES.graceGarden],
    standardRate: 22000,
    memberRate: 18700,
    features: [
      { icon: 'book', label: 'Prayer Altar' },
      { icon: 'quiet', label: 'Sacred Silence' },
      { icon: 'bolt', label: '24/7 Power' },
      { icon: 'bath', label: 'Private Bath' },
    ],
    specs: {
      bed: '1 Single Bed',
      bedNote: 'Natural Wool',
      guests: '1 Retreatant',
      guestsNote: 'Solo Retreat',
      area: '20 m²',
      areaNote: 'Reading Nook',
      view: 'Chapel',
      viewNote: 'Adoration Walk',
    },
    description:
      'Intentionally minimal solo retreat room in our dedicated silence wing, equipped with a cedar writing desk, kneeler, and direct access to the perpetual adoration chapel.',
  },
  {
    id: 'suite-hermon-204',
    roomNumber: '204',
    buildingSlug: 'hermon',
    buildingName: 'Hermon Heights',
    buildingCode: 'BLD-08',
    wingTag: 'Upper Ridge',
    title: 'Hermon Ridge Double',
    subtitle: '1 Queen Bed • Elevated Cross-Ventilation & Study',
    statusLabel: 'Available',
    image: IMAGES.graceGarden,
    gallery: [IMAGES.graceGarden, IMAGES.shilohTwin],
    standardRate: 26000,
    memberRate: 22100,
    features: [
      { icon: 'wifi', label: 'Fiber Wi-Fi' },
      { icon: 'bolt', label: '24/7 Power' },
      { icon: 'ac', label: 'AC + Fan' },
      { icon: 'shower', label: 'Ensuite' },
    ],
    specs: {
      bed: '1 Queen Bed',
      bedNote: 'Cotton Linen',
      guests: '2 Adults',
      guestsNote: 'Max Guests',
      area: '30 m²',
      areaNote: 'Upper Ridge',
      view: 'Sanctuary',
      viewNote: 'Ridge Vista',
    },
    description:
      'Breezy upper-ridge lodging overlooking the Sanctuary grounds, favored by visiting church stewards, choir directors, and conference guests.',
  },
  {
    id: 'suite-covenant-101',
    roomNumber: '101',
    buildingSlug: 'covenant',
    buildingName: 'Covenant Rest',
    buildingCode: 'BLD-09',
    wingTag: 'VIP Bishopric',
    title: 'Prelate Protocol Suite',
    subtitle: 'King Master + Reception Parlour • Private Devotional Study',
    statusLabel: 'Limited',
    image: IMAGES.pastoralSuite,
    gallery: [IMAGES.pastoralSuite, IMAGES.familyFlat, IMAGES.graceGarden],
    standardRate: 65000,
    memberRate: 55250,
    features: [
      { icon: 'lounge', label: 'Private Parlour' },
      { icon: 'bolt', label: '24/7 Redundant' },
      { icon: 'book', label: 'Bishop Study' },
      { icon: 'coffee', label: 'Morning Tea' },
    ],
    specs: {
      bed: '1 King Bed',
      bedNote: 'Executive Plush',
      guests: '2 VIP Guests',
      guestsNote: 'Protocol Wing',
      area: '72 m²',
      areaNote: 'Reception Room',
      view: 'Chapel',
      viewNote: 'Private Patio',
    },
    description:
      'Our flagship diocesan residence for visiting bishops, general overseers, and guest prelates, featuring a private meeting parlour and complimentary morning hospitality.',
  },
];

export const INITIAL_PROGRAMMES: ChurchProgramme[] = [
  {
    id: 'prog-holy-ghost-2025',
    title: 'Annual Holy Ghost & Faith Convention 2025',
    category: 'Conventions',
    badge: 'Diocesan Flagship',
    dates: 'Dec 12 – 16, 2025',
    venue: 'Main Auditorium & Amphitheatre',
    theme: '“Rivers of Living Water & Unshakable Grace”',
    delegationCount: '1,200+ Ministers & Delegates',
    wingAllocation: 'Shiloh Pavilion & Ebenezer Hall (60 Rooms Allocated)',
    roomsOpenLabel: '20 Block Rooms Left',
    quotaPercent: 75,
    ctaLabel: 'Book Convention Lodging Block',
    targetBuilding: 'shiloh',
    isFlagship: true,
  },
  {
    id: 'prog-ministers-retreat',
    title: 'Ministers & Workers Leadership Retreat',
    category: 'Leadership Retreats',
    badge: 'Clergy & Pastors',
    dates: 'Nov 28 – 30, 2025',
    venue: 'Grace Hall',
    theme: 'Leading with Apostolic Integrity',
    delegationCount: '320 Senior Pastors & Deacons',
    wingAllocation: 'Grace Haven & Bethel House (Pastoral Wing)',
    roomsOpenLabel: '18 Pastoral Rooms Open',
    ctaLabel: 'View & Reserve',
    targetBuilding: 'grace',
  },
  {
    id: 'prog-youth-camp',
    title: 'National Youth & Campus Discipleship Camp',
    category: 'Youth & Workers',
    badge: 'Youth Synod',
    dates: 'Jan 08 – 11, 2026',
    venue: 'Shiloh Camp Grounds',
    delegationCount: '800+ Expected Registrants',
    wingAllocation: 'Mount Zion Lodge & Moriah Court',
    roomsOpenLabel: 'Early Bird Tier Active',
    ctaLabel: 'Book Youth Pass',
    targetBuilding: 'zion',
  },
  {
    id: 'prog-women-faith',
    title: 'Women of Faith Annual Fellowship & Prayer Summit',
    category: 'Conventions',
    badge: 'General Fellowship',
    dates: 'Feb 20 – 22, 2026',
    venue: 'Covenant Auditorium',
    delegationCount: '650+ Registered Sisters',
    wingAllocation: 'Peniel Court & Mount Zion',
    roomsOpenLabel: 'Lodging Quota Releases Dec 20',
    ctaLabel: 'Notify Me',
    targetBuilding: 'peniel',
    isUpcomingRelease: true,
    releaseNote: 'Lodging Quota Releases Dec 20',
  },
  {
    id: 'prog-choir-convocation',
    title: 'Diocesan Sacred Music & Levites Convocation',
    category: 'Youth & Workers',
    badge: 'Choir & Worship',
    dates: 'Mar 14 – 16, 2026',
    venue: 'Main Sanctuary Choir Loft',
    delegationCount: '410 Choristers & Organists',
    wingAllocation: 'Hermon Heights & Ebenezer Hall',
    roomsOpenLabel: '24 Group Beds Open',
    ctaLabel: 'Reserve Choir Wing',
    targetBuilding: 'hermon',
  },
  {
    id: 'prog-elders-council',
    title: 'Synod Elders & Parish Trustees Governance Summit',
    category: 'Leadership Retreats',
    badge: 'Episcopal Council',
    dates: 'Apr 04 – 06, 2026',
    venue: 'Synod Chapter House',
    delegationCount: '140 Elders & Trustees',
    wingAllocation: 'Covenant Rest & Bethel House',
    roomsOpenLabel: '12 Executive Suites Open',
    ctaLabel: 'Book Clergy Suite',
    targetBuilding: 'covenant',
  },
  {
    id: 'prog-easter-archive',
    title: 'Easter Renewal & Watchnight Vigil 2025 (Archive)',
    category: 'Past Archive',
    badge: 'Completed • 98% Full',
    dates: 'Apr 17 – 20, 2025',
    venue: 'Main Auditorium & Prayer Gardens',
    delegationCount: '1,480 Delegates Hosted',
    wingAllocation: 'All 9 Campus Buildings Utilized',
    roomsOpenLabel: 'Archive Summary Available',
    ctaLabel: 'View Lodge Report',
    targetBuilding: 'bethel',
  },
];

export const CONVENTION_BLOCKS: ConventionBlock[] = [
  {
    id: 'block-shiloh-twin',
    buildingTag: 'Shiloh Pavilion • BLD-04',
    buildingSlug: 'shiloh',
    title: 'Deluxe Delegate Twin',
    remaining: 14,
    badgeTone: 'amber',
    image: IMAGES.shilohTwin,
    shuttleNote: 'Auditorium Shuttle 1 Station',
    features: ['2 Twin Deluxe Beds', 'High-Speed Study Wi-Fi', '24/7 Redundant Power', 'Gate Shuttle Pickup'],
    standardRate: 24000,
    delegateRate: 20400,
    rateNote: 'with Delegate Pass',
    ctaLabel: 'Reserve Room',
  },
  {
    id: 'block-ebenezer-quad',
    buildingTag: 'Ebenezer Hall • Group Wing',
    buildingSlug: 'ebenezer',
    title: 'Delegation Quad Suite',
    remaining: 6,
    badgeTone: 'red',
    image: IMAGES.familyFlat,
    shuttleNote: 'Ideal for Parish Teams',
    features: ['4 Beds Ensuite Bath', 'Communal Study Table', 'Secure Luggage Bay', 'Daily Housekeeping'],
    standardRate: 36000,
    delegateRate: 36000,
    rateNote: '(₦9,000 per delegate)',
    ctaLabel: 'Book Block',
  },
];

// Deterministic status target per building so all 9 buildings = 190 rooms
// Exact campus totals: Occupied 128, Available 38, Reserved 15, Turnover 7, Locked 2 = 190
const BUILDING_STATUS_PLAN: Record<
  string,
  { Occupied: number; Available: number; Reserved: number; Turnover: number; Locked: number }
> = {
  'BLD-01': { Occupied: 20, Available: 2, Reserved: 1, Turnover: 1, Locked: 0 }, // 24
  'BLD-02': { Occupied: 22, Available: 3, Reserved: 2, Turnover: 1, Locked: 0 }, // 28
  'BLD-03': { Occupied: 15, Available: 4, Reserved: 2, Turnover: 1, Locked: 0 }, // 22
  'BLD-04': { Occupied: 18, Available: 2, Reserved: 4, Turnover: 1, Locked: 1 }, // 26
  'BLD-05': { Occupied: 10, Available: 8, Reserved: 1, Turnover: 0, Locked: 1 }, // 20
  'BLD-06': { Occupied: 13, Available: 3, Reserved: 1, Turnover: 1, Locked: 0 }, // 18
  'BLD-07': { Occupied: 10, Available: 5, Reserved: 1, Turnover: 0, Locked: 0 }, // 16
  'BLD-08': { Occupied: 12, Available: 6, Reserved: 1, Turnover: 1, Locked: 0 }, // 20
  'BLD-09': { Occupied: 8, Available: 5, Reserved: 2, Turnover: 1, Locked: 0 },  // 16
};
// Check sum:
// Occupied: 20+22+15+18+10+13+10+12+8 = 128
// Available: 2+3+4+2+8+3+5+6+5 = 38
// Reserved: 1+2+2+4+1+1+1+1+2 = 15
// Turnover: 1+1+1+1+0+1+0+1+1 = 7
// Locked: 0+0+0+1+1+0+0+0+0 = 2
// Total = 190!

const SAMPLE_CLERGY_GUESTS = [
  'Bishop D. Oyedepo Entourage',
  'Pastor E. Adebayo',
  'Rev. Fr. C. Okafor',
  'Dr. & Mrs. Okonjo',
  'Pastor Mrs. F. Kumuyi',
  'Ven. Dr. T. Balogun',
  'Evang. B. Idahosa Delegation',
  'Deaconess G. Nwankwo',
  'Rev. M. Bakare',
  'Sis. Comfort Eze',
  'Bro. Tunde Olawale',
  'Pastor S. Adeyemi',
  'Mrs. Folashade Adeleke',
  'Canon J. Akinola',
  'Minister K. Osei',
  'Bro. Daniel Kalu',
  'Elder P. Uche',
  'Deaconess R. Nwosu',
];

export function generateAll190Rooms(): RoomRecord[] {
  const rooms: RoomRecord[] = [];
  let guestCursor = 0;

  BUILDINGS.forEach((bld, bIdx) => {
    const plan = BUILDING_STATUS_PLAN[bld.id];
    const statuses: RoomStatus[] = [];

    // For BLD-01 (Bethel House), pin the first 6 rooms to exact Stitch screen order
    if (bld.id === 'BLD-01') {
      const pinnedFloor1: RoomStatus[] = [
        'Occupied',  // 101 Bishop Oyedepo Guest
        'Available', // 102 Vacant & Inspected
        'Reserved',  // 103 Rev. Mbaka Arrival 3 PM
        'Occupied',  // 104 Pastor E. Adebayo
        'Turnover',  // 105 A/C Service & Kneeler Polish
        'Available', // 106 Queen Suite Ready
      ];
      statuses.push(...pinnedFloor1);
      // Remaining 18 rooms on floors 2 & 3
      const remOccupied = plan.Occupied - 2;
      const remAvailable = plan.Available - 2;
      const remReserved = plan.Reserved - 1;
      const remTurnover = plan.Turnover - 1;
      const remLocked = plan.Locked;
      for (let i = 0; i < remOccupied; i++) statuses.push('Occupied');
      for (let i = 0; i < remReserved; i++) statuses.push('Reserved');
      for (let i = 0; i < remTurnover; i++) statuses.push('Turnover');
      for (let i = 0; i < remLocked; i++) statuses.push('Locked');
      for (let i = 0; i < remAvailable; i++) statuses.push('Available');
    } else if (bld.id === 'BLD-04') {
      // Shiloh Pavilion: keep rooms 404 & 409 Available as spotlighted in Stitch HTML
      const basePool: RoomStatus[] = [];
      for (let i = 0; i < plan.Occupied; i++) basePool.push('Occupied');
      for (let i = 0; i < plan.Reserved; i++) basePool.push('Reserved');
      for (let i = 0; i < plan.Turnover; i++) basePool.push('Turnover');
      for (let i = 0; i < plan.Locked; i++) basePool.push('Locked');
      // Put 2 Available at indices 3 and 8 (404 and 409)
      for (let i = 0; i < 26; i++) {
        if (i === 3 || i === 8) {
          statuses.push('Available');
        } else {
          statuses.push(basePool.shift() || 'Occupied');
        }
      }
    } else {
      for (let i = 0; i < plan.Occupied; i++) statuses.push('Occupied');
      for (let i = 0; i < plan.Available; i++) statuses.push('Available');
      for (let i = 0; i < plan.Reserved; i++) statuses.push('Reserved');
      for (let i = 0; i < plan.Turnover; i++) statuses.push('Turnover');
      for (let i = 0; i < plan.Locked; i++) statuses.push('Locked');
    }

    let statusIdx = 0;
    bld.floors.forEach((fl, fIdx) => {
      // Split totalRooms across floors matching floor titles
      let floorCount = Math.floor(bld.totalRooms / bld.floors.length);
      if (bld.id === 'BLD-01') floorCount = fIdx === 0 ? 6 : fIdx === 1 ? 8 : 10;
      if (bld.id === 'BLD-02') floorCount = fIdx === 0 ? 10 : fIdx === 1 ? 10 : 8;
      if (bld.id === 'BLD-03') floorCount = fIdx === 0 ? 12 : 10;
      if (bld.id === 'BLD-04') floorCount = fIdx === 0 ? 12 : 14;
      if (bld.id === 'BLD-06') floorCount = 9;
      if (bld.id === 'BLD-07') floorCount = 8;

      for (let r = 1; r <= floorCount; r++) {
        const status = statuses[statusIdx] || 'Available';
        statusIdx++;

        let roomNumber = `${fl.floorNumber}${String(r).padStart(2, '0')}`;
        if (bld.id === 'BLD-04' && fl.floorNumber === 1) {
          roomNumber = `4${String(r).padStart(2, '0')}`;
        }

        // Exact Stitch spotlights
        if (bld.id === 'BLD-01' && roomNumber === '101') {
          rooms.push({
            id: `${bld.id}-101`,
            buildingId: bld.id,
            buildingSlug: bld.slug,
            buildingName: bld.name,
            roomNumber: '101',
            floor: 1,
            roomType: 'Executive Pastoral Suite',
            status: 'Occupied',
            guestName: 'Bishop Oyedepo Guest',
            guestRole: 'VIP Protocol Pre-cleared',
            bookingRef: '#CH-2025-9411',
            keyId: 'Key #201',
            stayPeriod: 'Nov 14 - Nov 18 (2d left)',
            ratePerNight: 65000,
            memberRate: 55250,
            notes: 'VIP Protocol Pre-cleared. Dedicated shuttle standby at East Cloister.',
            paymentStatus: 'Paid',
            badgeTag: 'VERIFIED',
          });
          continue;
        }
        if (bld.id === 'BLD-01' && roomNumber === '102') {
          rooms.push({
            id: `${bld.id}-102`,
            buildingId: bld.id,
            buildingSlug: bld.slug,
            buildingName: bld.name,
            roomNumber: '102',
            floor: 1,
            roomType: 'Deluxe Pastoral Lodge',
            status: 'Available',
            guestName: 'Vacant & Inspected',
            keyId: 'Master Box #A12',
            stayPeriod: 'Immediate',
            ratePerNight: 45000,
            memberRate: 38250,
            notes: 'Deep cleaned by Sis. Dorcas. Fresh linens installed 10:30 AM.',
            assignedStaff: 'Sis. Dorcas',
            paymentStatus: 'N/A',
          });
          continue;
        }
        if (bld.id === 'BLD-01' && roomNumber === '103') {
          rooms.push({
            id: `${bld.id}-103`,
            buildingId: bld.id,
            buildingSlug: bld.slug,
            buildingName: bld.name,
            roomNumber: '103',
            floor: 1,
            roomType: 'Executive Suite & Study',
            status: 'Reserved',
            guestName: 'Rev. Mbaka Arrival 3 PM',
            guestRole: 'Visiting Clergy Delegation',
            bookingRef: '#CH-2025-9478',
            keyId: 'Pre-programmed #303',
            stayPeriod: 'ETA in 2 hrs 15 mins',
            ratePerNight: 55000,
            memberRate: 46750,
            notes: 'Paystack Direct Confirmation. Airport Transfer set & Welcome Basket placed.',
            paymentStatus: 'Paid',
          });
          continue;
        }
        if (bld.id === 'BLD-01' && roomNumber === '104') {
          rooms.push({
            id: `${bld.id}-104`,
            buildingId: bld.id,
            buildingSlug: bld.slug,
            buildingName: bld.name,
            roomNumber: '104',
            floor: 1,
            roomType: 'Executive Pastoral Lodge',
            status: 'Occupied',
            guestName: 'Pastor E. Adebayo',
            guestRole: 'Senior District Overseer',
            bookingRef: '#CH-2025-9481',
            keyId: 'Card Key #204',
            stayPeriod: 'Nov 12 - Nov 19 (7 Nights)',
            ratePerNight: 45000,
            memberRate: 38250,
            notes: 'Guest requires daily morning intercessory communion wine service at 6:30 AM. Strictly low-sodium parish kitchen menu.',
            paymentStatus: 'Paid',
            badgeTag: 'SPEAKER',
          });
          continue;
        }
        if (bld.id === 'BLD-01' && roomNumber === '105') {
          rooms.push({
            id: `${bld.id}-105`,
            buildingId: bld.id,
            buildingSlug: bld.slug,
            buildingName: bld.name,
            roomNumber: '105',
            floor: 1,
            roomType: 'Standard Double Pastoral',
            status: 'Turnover',
            guestName: 'A/C Service & Kneeler Polish',
            keyId: 'Master Key Required',
            stayPeriod: 'Est. Completion: 5:00 PM',
            ratePerNight: 45000,
            memberRate: 38250,
            notes: 'A/C Filter & Kneeler Polish assigned to Bro. Samuel (Estate Dept).',
            assignedStaff: 'Bro. Samuel (Estate Dept)',
            paymentStatus: 'N/A',
          });
          continue;
        }
        if (bld.id === 'BLD-01' && roomNumber === '106') {
          rooms.push({
            id: `${bld.id}-106`,
            buildingId: bld.id,
            buildingSlug: bld.slug,
            buildingName: bld.name,
            roomNumber: '106',
            floor: 1,
            roomType: 'Pastoral Queen Suite',
            status: 'Available',
            guestName: 'Queen Suite (Quiet Courtyard)',
            keyId: 'Master Box #A16',
            stayPeriod: 'Ready for Occupancy',
            ratePerNight: 45000,
            memberRate: 38250,
            notes: 'Ready for immediate occupancy • Prayer nook prepared.',
            paymentStatus: 'N/A',
          });
          continue;
        }

        const guest =
          status === 'Available'
            ? 'Vacant & Sanitized'
            : status === 'Turnover'
            ? 'Housekeeping & Coil Check'
            : status === 'Locked'
            ? 'Convention Delegation Hold'
            : SAMPLE_CLERGY_GUESTS[(guestCursor + bIdx + r) % SAMPLE_CLERGY_GUESTS.length];
        guestCursor++;

        rooms.push({
          id: `${bld.id}-${roomNumber}`,
          buildingId: bld.id,
          buildingSlug: bld.slug,
          buildingName: bld.name,
          roomNumber,
          floor: fl.floorNumber,
          roomType:
            bld.id === 'BLD-09'
              ? 'Prelate Protocol Suite'
              : bld.id === 'BLD-02'
              ? 'Family Residence Flat'
              : bld.id === 'BLD-04'
              ? 'Convention Delegate Twin'
              : bld.id === 'BLD-05'
              ? 'Delegation Quad Suite'
              : 'Standard Sanctuary Room',
          status,
          guestName: guest,
          bookingRef:
            status === 'Occupied' || status === 'Reserved'
              ? `#CH-2025-${9400 + ((bIdx * 31 + r * 3) % 580)}`
              : undefined,
          keyId: status === 'Occupied' ? `Smart Key #${roomNumber}` : status === 'Reserved' ? `Encoded #${roomNumber}` : `Box #${bld.id.slice(-2)}-${roomNumber}`,
          stayPeriod:
            status === 'Occupied'
              ? 'Nov 14 – Nov 18'
              : status === 'Reserved'
              ? 'Arriving Today'
              : status === 'Turnover'
              ? 'Est. Ready 3:30 PM'
              : status === 'Locked'
              ? 'Convention Dec 12–16'
              : 'Ready Now',
          ratePerNight: bld.standardRate,
          memberRate: Math.round(bld.standardRate * 0.85),
          notes:
            status === 'Turnover'
              ? 'Scheduled linen refresh and HVAC inspection.'
              : status === 'Locked'
              ? 'Reserved under Diocesan Holy Ghost Convention block.'
              : 'Standard ministerial hospitality protocol applies.',
          assignedStaff: status === 'Turnover' ? 'Bro. Samuel' : status === 'Available' ? 'Sis. Dorcas' : undefined,
          paymentStatus: status === 'Occupied' || status === 'Reserved' ? 'Paid' : 'N/A',
        });
      }
    });
  });

  return rooms;
}

export const INITIAL_DESK_QUEUE: DeskQueueItem[] = [
  {
    id: 'dq-adebayo',
    initials: 'PA',
    guestName: 'Pastor E. Adebayo',
    roleSubtitle: 'Senior District Overseer',
    parish: 'Grace Parish, Ikeja',
    buildingName: 'Bethel House',
    roomLabel: 'Bethel House • Rm 104',
    roomNumber: '104',
    bookingRef: '#CH-2025-9481',
    statusBadge: 'Awaiting Check-in',
    paymentLabel: 'Paystack ₦114,750 (Member Rate)',
    paymentVerified: true,
    amount: 153000,
    nightsLabel: '4 Nights',
    datesLabel: '14 – 18 Nov',
    keyLabel: 'Smart Key Card #204',
    devotionNote: 'Extra quiet hours for contemplative prayer. Request early 5:30 AM chapel bell wake-up call.',
    actionType: 'checkin',
  },
  {
    id: 'dq-okonjo',
    initials: 'DO',
    guestName: 'Dr. & Mrs. Okonjo',
    roleSubtitle: 'Visiting Parish Patrons',
    parish: 'Abuja Cathedral',
    buildingName: 'Mount Zion Lodge',
    roomLabel: 'Mount Zion • Rm 202 (Suite)',
    roomNumber: '202',
    bookingRef: '#CH-2025-9482',
    statusBadge: 'Checked In',
    paymentLabel: 'Paid via Flutterwave',
    paymentVerified: true,
    amount: 220000,
    nightsLabel: '4 Nights',
    datesLabel: '14 – 18 Nov',
    keyLabel: 'Smart Key #202 Active',
    actionType: 'folio',
  },
  {
    id: 'dq-youth-conf',
    initials: 'YC',
    guestName: 'Youth Conference Delegation',
    roleSubtitle: 'Lead: Bro. Kenneth • 24 Guests',
    parish: 'Lagos Diocese Youth Wing',
    buildingName: 'Shiloh Pavilion',
    roomLabel: 'Shiloh Pavilion • 12 Rooms',
    bookingRef: '#CH-2025-9483',
    statusBadge: 'Approval Needed',
    paymentLabel: 'Diocese Voucher #VCH-LAGOS-2025',
    paymentVerified: true,
    amount: 979200,
    nightsLabel: '4 Nights',
    datesLabel: '14 – 18 Nov',
    actionType: 'approve-group',
  },
  {
    id: 'dq-danladi',
    initials: 'SM',
    guestName: 'Sister Mary Danladi',
    roleSubtitle: 'Room Inspection & Maintenance',
    parish: 'Moriah Court',
    buildingName: 'Moriah Court',
    roomLabel: 'Moriah Court • Room 106',
    roomNumber: '106',
    bookingRef: '#MNT-106',
    statusBadge: 'Maintenance Hold',
    paymentLabel: 'A/C Inspection & Coil Servicing',
    paymentVerified: false,
    amount: 0,
    techNote: 'Tech: Bro. Samuel',
    actionType: 'release-maintenance',
  },
];

export const INITIAL_BOOKINGS: GuestBooking[] = [
  {
    id: 'bk-9481',
    ref: '#CH-2025-9481',
    guestName: 'Pastor E. Adebayo',
    guestPhone: '+234 803 441 9920',
    buildingName: 'Bethel House',
    buildingSlug: 'bethel',
    roomNumber: '104',
    suiteTitle: 'Pastoral Suite 104',
    checkInDate: '14 Nov 2025',
    checkOutDate: '18 Nov 2025',
    nights: 4,
    guestsLabel: '1 Minister',
    isMemberRate: true,
    totalAmount: 153000,
    paymentMethod: 'Paystack',
    status: 'Confirmed',
    createdAt: 'Today, 08:15 AM',
  },
  {
    id: 'bk-9482',
    ref: '#CH-2025-9482',
    guestName: 'Dr. & Mrs. Okonjo',
    guestPhone: '+234 809 211 4501',
    buildingName: 'Mount Zion Lodge',
    buildingSlug: 'zion',
    roomNumber: '202',
    suiteTitle: 'Family Flat 202',
    checkInDate: '14 Nov 2025',
    checkOutDate: '18 Nov 2025',
    nights: 4,
    guestsLabel: '2 Adults, 1 Child',
    isMemberRate: false,
    totalAmount: 220000,
    paymentMethod: 'Flutterwave',
    status: 'Checked In',
    createdAt: 'Yesterday, 04:40 PM',
  },
];

export const INITIAL_AUDIT_LOG: AuditEntry[] = [
  {
    id: 'aud-1',
    timestamp: '09:38 WAT',
    actor: 'Sister Joy (Desk #1)',
    action: 'Encoded Smart Key #202',
    target: 'Dr. & Mrs. Okonjo • Mount Zion Rm 202',
  },
  {
    id: 'aud-2',
    timestamp: '09:15 WAT',
    actor: 'Bro. Samuel (Estate)',
    action: 'Flagged A/C Coil Service',
    target: 'Moriah Court • Rm 106',
  },
  {
    id: 'aud-3',
    timestamp: '08:42 WAT',
    actor: 'Paystack Webhook',
    action: 'Settled Folio ₦153,000',
    target: 'Pastor E. Adebayo • #CH-2025-9481',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Holy Ghost Convention Quota at 75%',
    detail: '40 rooms in Shiloh Pavilion and 20 in Ebenezer Hall are locked for delegates.',
    time: '12m ago',
    unread: true,
    targetTab: 'events',
  },
  {
    id: 'n2',
    title: 'Pastor E. Adebayo Arriving at Desk #1',
    detail: 'Paystack webhook confirmed (#CH-2025-9481). Smart Key #204 ready for encoding.',
    time: '25m ago',
    unread: true,
    targetTab: 'staff-ops',
  },
  {
    id: 'n3',
    title: 'Parish Pass 15% Member Rate Active',
    detail: 'Diocesan verified members receive automatic 15% tariff subsidy across all 9 lodges.',
    time: '1h ago',
    unread: false,
    targetTab: 'explore',
  },
];
