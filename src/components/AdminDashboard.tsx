import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  CreditCard,
  Download,
  FileText,
  Hotel,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Moon,
  Receipt,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { BUILDINGS } from '../data/sanctuaryData';
import {
  BuildingSlug,
  DeskQueueItem,
  RoomRecord,
  RoomStatus,
  StaffSubTab,
} from '../types';

interface DepartingGuestBlueprint {
  id: string;
  roomId: string;
  guestName: string;
  bookingRef: string;
  checkoutTime: string;
  departureState: 'Checked Out' | 'Late Checkout';
  initialDispatched?: boolean;
}

const DAILY_DEPARTURES_BLUEPRINT: DepartingGuestBlueprint[] = [
  {
    id: 'dep-01',
    roomId: 'BLD-06-106',
    guestName: 'Elder P. Uche',
    bookingRef: '#CH-2025-9380',
    checkoutTime: '09:15 AM',
    departureState: 'Checked Out',
    initialDispatched: true,
  },
  {
    id: 'dep-02',
    roomId: 'BLD-04-205',
    guestName: 'Bro. Daniel Kalu',
    bookingRef: '#CH-2025-9384',
    checkoutTime: '03:00 PM (Ext.)',
    departureState: 'Late Checkout',
  },
  {
    id: 'dep-03',
    roomId: 'BLD-01-105',
    guestName: 'Ven. Dr. T. Balogun',
    bookingRef: '#CH-2025-9371',
    checkoutTime: '08:40 AM',
    departureState: 'Checked Out',
    initialDispatched: true,
  },
  {
    id: 'dep-04',
    roomId: 'BLD-01-201',
    guestName: 'Rev. Fr. C. Okafor',
    bookingRef: '#CH-2025-9392',
    checkoutTime: '09:30 AM',
    departureState: 'Checked Out',
  },
  {
    id: 'dep-05',
    roomId: 'BLD-02-101',
    guestName: 'Pastor Mrs. F. Kumuyi',
    bookingRef: '#CH-2025-9395',
    checkoutTime: '09:50 AM',
    departureState: 'Checked Out',
  },
  {
    id: 'dep-06',
    roomId: 'BLD-02-102',
    guestName: 'Canon J. Akinola',
    bookingRef: '#CH-2025-9398',
    checkoutTime: '10:05 AM',
    departureState: 'Checked Out',
  },
  {
    id: 'dep-07',
    roomId: 'BLD-03-101',
    guestName: 'Deaconess G. Nwankwo',
    bookingRef: '#CH-2025-9401',
    checkoutTime: '10:15 AM',
    departureState: 'Checked Out',
  },
  {
    id: 'dep-08',
    roomId: 'BLD-03-102',
    guestName: 'Sis. Comfort Eze',
    bookingRef: '#CH-2025-9404',
    checkoutTime: '10:20 AM',
    departureState: 'Checked Out',
  },
  {
    id: 'dep-09',
    roomId: 'BLD-04-401',
    guestName: 'Bro. Tunde Olawale',
    bookingRef: '#CH-2025-9407',
    checkoutTime: '10:30 AM',
    departureState: 'Checked Out',
  },
  {
    id: 'dep-10',
    roomId: 'BLD-05-101',
    guestName: 'Minister K. Osei',
    bookingRef: '#CH-2025-9410',
    checkoutTime: '10:45 AM',
    departureState: 'Checked Out',
  },
  {
    id: 'dep-11',
    roomId: 'BLD-07-101',
    guestName: 'Pastor S. Adeyemi',
    bookingRef: '#CH-2025-9412',
    checkoutTime: '11:00 AM',
    departureState: 'Checked Out',
  },
  {
    id: 'dep-12',
    roomId: 'BLD-08-101',
    guestName: 'Rev. M. Bakare',
    bookingRef: '#CH-2025-9415',
    checkoutTime: '11:10 AM',
    departureState: 'Checked Out',
  },
  {
    id: 'dep-13',
    roomId: 'BLD-09-101',
    guestName: 'Bishop D. Oyedepo Delegation',
    bookingRef: '#CH-2025-9418',
    checkoutTime: '02:30 PM (Ext.)',
    departureState: 'Late Checkout',
  },
  {
    id: 'dep-14',
    roomId: 'BLD-01-102',
    guestName: 'Evang. B. Idahosa Guest',
    bookingRef: '#CH-2025-9365',
    checkoutTime: '08:15 AM',
    departureState: 'Checked Out',
    initialDispatched: true,
  },
];

function getAutoHousekeepingAssignee(buildingId: string): string {
  if (buildingId === 'BLD-01' || buildingId === 'BLD-03' || buildingId === 'BLD-09') {
    return 'Sis. Dorcas (Pastoral Team)';
  }
  if (buildingId === 'BLD-02' || buildingId === 'BLD-04' || buildingId === 'BLD-05') {
    return 'Sis. Esther (Lodge Wing)';
  }
  return 'Bro. Samuel (Floor Tech)';
}

interface AdminDashboardProps {
  rooms: RoomRecord[];
  deskQueue: DeskQueueItem[];
  onSwitchSubTab: (sub: StaffSubTab, buildingFilter?: BuildingSlug | 'all', statusFilter?: RoomStatus | 'all') => void;
  onCheckInQueueItem: (itemId: string) => void;
  onApproveGroupItem: (itemId: string) => void;
  onReleaseMaintenanceItem: (itemId: string) => void;
  onAddGroupBlock: (parishName: string, buildingSlug: BuildingSlug, count: number) => void;
  onDispatchHousekeeping: (
    assignments: { roomId: string; staffName: string }[],
    summaryLabel: string
  ) => void;
  onMarkRoomReady: (roomId: string) => void;
  onToast: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  rooms,
  deskQueue,
  onSwitchSubTab,
  onCheckInQueueItem,
  onApproveGroupItem,
  onReleaseMaintenanceItem,
  onAddGroupBlock,
  onDispatchHousekeeping,
  onMarkRoomReady,
  onToast,
}) => {
  const [shift, setShift] = useState<'morning' | 'evening'>('morning');
  const [watTime, setWatTime] = useState('');
  const [folioModalItem, setFolioModalItem] = useState<DeskQueueItem | null>(null);
  const [showVerifyPaymentModal, setShowVerifyPaymentModal] = useState(false);
  const [verifyRefInput, setVerifyRefInput] = useState('PSTK_8921849');
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupParish, setGroupParish] = useState('Ikeja Provincial Delegation');
  const [groupBuilding, setGroupBuilding] = useState<BuildingSlug>('ebenezer');
  const [groupCount, setGroupCount] = useState(4);

  // Daily Departures & Automated Housekeeping state
  const [departureFilter, setDepartureFilter] = useState<
    'all' | 'pending' | 'dispatched' | 'ready' | 'late'
  >('all');
  const [dispatchedRoomLog, setDispatchedRoomLog] = useState<
    Record<string, { staff: string; time: string }>
  >({
    'BLD-06-106': { staff: 'Bro. Samuel (Floor Tech)', time: '09:18 WAT' },
    'BLD-01-105': { staff: 'Bro. Samuel (Estate Dept)', time: '08:45 WAT' },
    'BLD-01-102': { staff: 'Sis. Dorcas (Pastoral Team)', time: '08:20 WAT' },
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date());
        setWatTime(`${formatted} WAT`);
      } catch {
        const now = new Date();
        setWatTime(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WAT`
        );
      }
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const total = rooms.length;
    const occupiedOrReserved = rooms.filter(
      (r) => r.status === 'Occupied' || r.status === 'Reserved'
    ).length;
    const occupancyPct = ((occupiedOrReserved / total) * 100).toFixed(1);
    const awaitingCount = deskQueue.filter((d) => d.statusBadge === 'Awaiting Check-in').length;
    return { total, occupiedOrReserved, occupancyPct, awaitingCount };
  }, [rooms, deskQueue]);

  const buildingMetrics = useMemo(() => {
    return BUILDINGS.map((b) => {
      const bRooms = rooms.filter((r) => r.buildingId === b.id);
      const occ = bRooms.filter((r) => r.status === 'Occupied' || r.status === 'Reserved').length;
      const avail = bRooms.filter((r) => r.status === 'Available').length;
      const pct = Math.round((occ / bRooms.length) * 100);
      return { ...b, occ, avail, pct };
    });
  }, [rooms]);

  const departingSummary = useMemo(() => {
    const roomById = new Map(rooms.map((r) => [r.id, r]));
    return DAILY_DEPARTURES_BLUEPRINT.map((dep) => {
      const liveRoom = roomById.get(dep.roomId);
      const buildingId = dep.roomId.slice(0, 6);
      const bld = BUILDINGS.find((b) => b.id === buildingId);
      const roomStatus: RoomStatus = liveRoom?.status || 'Occupied';
      const dispatchInfo = dispatchedRoomLog[dep.roomId];
      const isDispatched =
        Boolean(dispatchInfo) || roomStatus === 'Turnover' || roomStatus === 'Available';
      const assignedStaff =
        dispatchInfo?.staff ||
        liveRoom?.assignedStaff ||
        getAutoHousekeepingAssignee(buildingId);

      return {
        ...dep,
        buildingId,
        buildingName: liveRoom?.buildingName || bld?.name || 'Sanctuary Lodge',
        roomNumber: liveRoom?.roomNumber || dep.roomId.slice(-3),
        roomType: liveRoom?.roomType || 'Standard Sanctuary Room',
        roomStatus,
        isDispatched,
        dispatchedAt: dispatchInfo?.time || (roomStatus === 'Turnover' ? 'Active' : undefined),
        assignedStaff,
        needsDispatch: dep.departureState === 'Checked Out' && !isDispatched,
      };
    });
  }, [rooms, dispatchedRoomLog]);

  const departureCounts = useMemo(() => {
    const total = departingSummary.length;
    const checkedOut = departingSummary.filter((d) => d.departureState === 'Checked Out').length;
    const late = departingSummary.filter((d) => d.departureState === 'Late Checkout').length;
    const pendingDispatch = departingSummary.filter((d) => d.needsDispatch).length;
    const inTurnover = departingSummary.filter((d) => d.roomStatus === 'Turnover').length;
    const cleanedReady = departingSummary.filter((d) => d.roomStatus === 'Available').length;
    return { total, checkedOut, late, pendingDispatch, inTurnover, cleanedReady };
  }, [departingSummary]);

  const filteredDepartures = useMemo(() => {
    return departingSummary.filter((d) => {
      if (departureFilter === 'pending') return d.needsDispatch;
      if (departureFilter === 'dispatched') return d.isDispatched && d.roomStatus !== 'Available';
      if (departureFilter === 'ready') return d.roomStatus === 'Available';
      if (departureFilter === 'late') return d.departureState === 'Late Checkout';
      return true;
    });
  }, [departingSummary, departureFilter]);

  const triggerSingleDispatch = (dep: (typeof departingSummary)[number]) => {
    const nowLabel = watTime || '09:45 WAT';
    const assignee = getAutoHousekeepingAssignee(dep.buildingId);
    setDispatchedRoomLog((prev) => ({
      ...prev,
      [dep.roomId]: { staff: assignee, time: nowLabel },
    }));
    onDispatchHousekeeping(
      [{ roomId: dep.roomId, staffName: assignee }],
      `${dep.buildingName} Rm ${dep.roomNumber} → ${assignee}`
    );
  };

  const triggerBulkAutoDispatch = () => {
    const pending = departingSummary.filter((d) => d.needsDispatch);
    if (pending.length === 0) {
      onToast('All checked-out rooms already have housekeeping dispatched or sanitized.');
      return;
    }
    const nowLabel = watTime || '09:45 WAT';
    const nextLog: Record<string, { staff: string; time: string }> = {};
    const assignments = pending.map((d) => {
      const staffName = getAutoHousekeepingAssignee(d.buildingId);
      nextLog[d.roomId] = { staff: staffName, time: nowLabel };
      return { roomId: d.roomId, staffName };
    });
    setDispatchedRoomLog((prev) => ({ ...prev, ...nextLog }));
    onDispatchHousekeeping(
      assignments,
      `${assignments.length} Departing Rooms Auto-Routed to Floor Teams`
    );
  };

  const openDailyReport = () => {
    setReportGeneratedAt(watTime || '09:45 WAT');
    setShowReportModal(true);
  };

  const buildReportPlainText = () => {
    const lines = [
      `SANCTUARY HAVEN — DAILY DEPARTURES SUMMARY REPORT`,
      `Generated: ${reportGeneratedAt || watTime || '09:45 WAT'} | Shift: ${
        shift === 'morning' ? 'Morning Shift' : 'Evening Handover'
      }`,
      `Summary: ${departureCounts.total} Scheduled | ${departureCounts.checkedOut} Checked Out | ${departureCounts.late} Late Checkout | ${departureCounts.inTurnover} In Turnover | ${departureCounts.cleanedReady} Cleaned Ready | ${departureCounts.pendingDispatch} Pending Dispatch`,
      `--------------------------------------------------------------------------------`,
      ...departingSummary.map(
        (d) =>
          `${d.buildingName} Rm ${d.roomNumber} | ${d.guestName} (${d.bookingRef}) | Checkout: ${d.checkoutTime} (${d.departureState}) | Room Status: ${d.roomStatus} | Housekeeping: ${
            d.isDispatched ? `Dispatched (${d.assignedStaff})` : 'Pending Dispatch'
          }`
      ),
    ];
    return lines.join('\n');
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildReportPlainText());
      onToast('Daily Departures Summary Report copied to clipboard.');
    } catch {
      onToast('Summary report ready — use Download CSV to export file.');
    }
  };

  const handleDownloadCsvReport = () => {
    const headers = [
      'Booking Ref',
      'Guest Name',
      'Building',
      'Room',
      'Checkout Time',
      'Departure State',
      'Live Room Status',
      'Housekeeping Dispatch',
      'Assigned Staff',
    ];
    const rows = departingSummary.map((d) => [
      d.bookingRef,
      `"${d.guestName.replace(/"/g, '""')}"`,
      `"${d.buildingName}"`,
      d.roomNumber,
      `"${d.checkoutTime}"`,
      d.departureState,
      d.roomStatus,
      d.isDispatched ? 'Dispatched' : 'Pending',
      `"${d.assignedStaff}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sanctuary-daily-departures-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast('Downloaded daily departures summary CSV report.');
  };

  const handleVerifyRef = () => {
    const clean = verifyRefInput.trim().toUpperCase();
    if (!clean) return;
    setVerifyResult(
      `Verified: ${clean} · Settled ₦153,000 via Paystack Live Webhook (Pastor E. Adebayo · Bethel Rm 104)`
    );
  };

  return (
    <div className="space-y-6">
      {/* Facility & Operations Header Banner */}
      <section className="bg-primary-container text-on-primary rounded-2xl p-5 md:p-7 shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-secondary/15 pointer-events-none blur-2xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-fixed">
              <ShieldCheck className="w-4 h-4" />
              <span>Live Control Console</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{watTime || '14:38 WAT'}</span>
            </div>
            <h1 className="font-serif-display text-2xl md:text-3xl text-on-primary">
              Operations Center
            </h1>
            <p className="text-xs md:text-sm text-on-primary-container">
              Role: Senior Receptionist / Facility Admin · {BUILDINGS.length} Buildings · {rooms.length} Total Rooms · Africa/Lagos
            </p>
          </div>

          {/* Shift Switcher */}
          <div className="flex items-center gap-1 bg-surface-container-lowest/10 p-1 rounded-xl self-start lg:self-auto">
            <button
              type="button"
              onClick={() => {
                setShift('morning');
                onToast('Switched to Morning Shift (06:00 – 14:00 WAT)');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                shift === 'morning'
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'text-on-primary-container hover:text-on-primary'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Morning Shift</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShift('evening');
                onToast('Switched to Evening Handover (14:00 – 22:00 WAT)');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                shift === 'evening'
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'text-on-primary-container hover:text-on-primary'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Evening Handover</span>
            </button>
          </div>
        </div>
      </section>

      {/* Operational KPIs Matrix (2x2 Mobile, 4-col Desktop) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-5 shadow-xs border border-outline-variant/25 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              <span>Occupancy</span>
              <Hotel className="w-4 h-4 text-secondary" />
            </div>
            <div className="mt-2 font-serif-display text-2xl md:text-3xl font-bold text-primary tabular-nums">
              {stats.occupancyPct}%
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 tabular-nums">
              {stats.occupiedOrReserved} / {stats.total} In House
            </p>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary-container h-full rounded-full transition-all"
              style={{ width: `${stats.occupancyPct}%` }}
            />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-5 shadow-xs border border-outline-variant/25 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              <span>Arrivals</span>
              <LogIn className="w-4 h-4 text-primary-container" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-serif-display text-2xl md:text-3xl font-bold text-primary tabular-nums">
                18
              </span>
              <span className="text-xs font-semibold text-secondary">Today</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 tabular-nums">
              {18 - (6 + stats.awaitingCount)} In · {6 + stats.awaitingCount} Pending
            </p>
          </div>
          <div className="text-xs font-semibold text-secondary mt-3 tabular-nums">
            61% Processed
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('daily-departures-report');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl p-4 md:p-5 shadow-xs border border-outline-variant/25 flex flex-col justify-between text-left transition-colors cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              <span>Departures</span>
              <LogOut className="w-4 h-4 text-on-surface-variant" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-serif-display text-2xl md:text-3xl font-bold text-primary tabular-nums">
                {departureCounts.total}
              </span>
              <span className="text-xs text-on-surface-variant">Today</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 tabular-nums">
              {departureCounts.checkedOut} Checked Out · {departureCounts.late} Late
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary-container mt-3 tabular-nums">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>
              {departureCounts.cleanedReady} Cleaned · {departureCounts.pendingDispatch} Pending
            </span>
          </div>
        </button>

        <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-5 shadow-xs border border-outline-variant/25 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              <span>Revenue</span>
              <CreditCard className="w-4 h-4 text-secondary" />
            </div>
            <div className="mt-2 font-serif-display text-2xl md:text-3xl font-bold text-primary tabular-nums">
              ₦14.85M
            </div>
            <p className="text-xs text-secondary mt-0.5 tabular-nums">₦2.4M Subsidized</p>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant mt-3 tabular-nums">
            <span>Target: ₦18M</span>
            <span className="font-semibold text-primary">82%</span>
          </div>
        </div>
      </section>

      {/* Convention Sync Banner */}
      <section className="bg-secondary-container text-on-secondary-container rounded-2xl p-4 md:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <CalendarClock className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-on-secondary-container">
                Convention Sync Active
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                · In 14 Days
              </span>
            </div>
            <p className="text-xs md:text-sm text-on-secondary-container/90 mt-0.5">
              Annual Holy Ghost Convention: <strong>60 Rooms locked</strong> in Shiloh Pavilion & Ebenezer Hall for guest pastors, speakers & choir delegations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
          <span className="flex items-center gap-1 bg-surface-container-lowest/60 px-2.5 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-secondary" />
            40 Shiloh
          </span>
          <span className="flex items-center gap-1 bg-surface-container-lowest/60 px-2.5 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-secondary" />
            20 Ebenezer
          </span>
        </div>
      </section>

      {/* Quick Reception Actions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-display text-xl font-semibold text-primary">
            Quick Reception Actions
          </h2>
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Desk Fast-Track
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onSwitchSubTab('checkin')}
            className="flex items-center gap-3 p-3.5 bg-surface-container-lowest hover:bg-surface-container-low rounded-xl border border-outline-variant/25 shadow-xs transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-primary block truncate">Express Check-in</span>
              <span className="text-xs text-on-surface-variant block truncate">Walk-ins & Keys</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setVerifyResult(null);
              setShowVerifyPaymentModal(true);
            }}
            className="flex items-center gap-3 p-3.5 bg-surface-container-lowest hover:bg-surface-container-low rounded-xl border border-outline-variant/25 shadow-xs transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-primary block truncate">Verify Payment</span>
              <span className="text-xs text-on-surface-variant block truncate">Paystack / Bank Ref</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSwitchSubTab('inventory', 'all', 'Turnover')}
            className="flex items-center gap-3 p-3.5 bg-surface-container-lowest hover:bg-surface-container-low rounded-xl border border-outline-variant/25 shadow-xs transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-primary block truncate">Room Turnover</span>
              <span className="text-xs text-on-surface-variant block truncate">Audit Housekeeping</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-3 p-3.5 bg-surface-container-lowest hover:bg-surface-container-low rounded-xl border border-outline-variant/25 shadow-xs transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-primary block truncate">Group Retreat</span>
              <span className="text-xs text-on-surface-variant block truncate">Parish Block Booking</span>
            </div>
          </button>
        </div>
      </section>

      {/* Daily Departures Summary Report & Automated Housekeeping Dispatch */}
      <section
        id="daily-departures-report"
        className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-sm border border-outline-variant/30 space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-container pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
              <ClipboardCheck className="w-4 h-4" />
              <span>Daily Turnover &amp; Housekeeping Automation</span>
            </div>
            <h2 className="font-serif-display text-xl md:text-2xl font-semibold text-primary">
              Departing Guests Summary &amp; Housekeeping Dispatch
            </h2>
            <p className="text-xs text-on-surface-variant tabular-nums">
              {departureCounts.total} departing rooms · {departureCounts.pendingDispatch} awaiting
              housekeeping dispatch · {departureCounts.inTurnover} in turnover ·{' '}
              {departureCounts.cleanedReady} sanitized &amp; ready
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openDailyReport}
              className="h-10 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-secondary" />
              <span>Generate Daily Report</span>
            </button>
            <button
              type="button"
              onClick={triggerBulkAutoDispatch}
              className="h-10 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Send className="w-4 h-4 text-secondary-fixed" />
              <span>
                Auto-Dispatch Housekeeping ({departureCounts.pendingDispatch})
              </span>
            </button>
          </div>
        </div>

        {/* Summary Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all' as const, label: `All Departures (${departureCounts.total})` },
            { id: 'pending' as const, label: `Needs Dispatch (${departureCounts.pendingDispatch})` },
            { id: 'dispatched' as const, label: `In Turnover (${departureCounts.inTurnover})` },
            { id: 'ready' as const, label: `Cleaned Ready (${departureCounts.cleanedReady})` },
            { id: 'late' as const, label: `Late Checkout (${departureCounts.late})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDepartureFilter(tab.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                departureFilter === tab.id
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Departing Guests Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant/25">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/25">
                <th className="py-2.5 px-3.5 font-bold">Departing Guest</th>
                <th className="py-2.5 px-3.5 font-bold">Building &amp; Room</th>
                <th className="py-2.5 px-3.5 font-bold">Checkout</th>
                <th className="py-2.5 px-3.5 font-bold">Live Room Status</th>
                <th className="py-2.5 px-3.5 font-bold">Housekeeping Team</th>
                <th className="py-2.5 px-3.5 font-bold text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs">
              {filteredDepartures.map((dep) => (
                <tr key={dep.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-3.5">
                    <p className="font-semibold text-primary">{dep.guestName}</p>
                    <p className="font-mono text-[11px] text-secondary">{dep.bookingRef}</p>
                  </td>
                  <td className="py-3 px-3.5">
                    <p className="font-semibold text-primary">
                      {dep.buildingName} · Rm {dep.roomNumber}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">{dep.roomType}</p>
                  </td>
                  <td className="py-3 px-3.5 tabular-nums">
                    <p className="font-medium text-primary">{dep.checkoutTime}</p>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        dep.departureState === 'Late Checkout'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {dep.departureState}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block ${
                        dep.roomStatus === 'Available'
                          ? 'bg-[#ebf7ee] text-[#1c6934]'
                          : dep.roomStatus === 'Turnover'
                          ? 'bg-[#fff2e0] text-[#b45309]'
                          : dep.roomStatus === 'Reserved'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-primary-container text-on-primary'
                      }`}
                    >
                      {dep.roomStatus === 'Available' ? 'Available · Clean' : dep.roomStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <p className="font-medium text-primary">{dep.assignedStaff}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {dep.isDispatched
                        ? dep.roomStatus === 'Available'
                          ? 'Turnover Completed'
                          : `Dispatched ${dep.dispatchedAt || 'Active'}`
                        : 'Auto-Route Ready'}
                    </p>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {dep.roomStatus === 'Available' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1c6934]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready for Guest
                      </span>
                    ) : dep.isDispatched ? (
                      <button
                        type="button"
                        onClick={() => onMarkRoomReady(dep.roomId)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Mark Sanitized
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => triggerSingleDispatch(dep)}
                        className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Dispatch</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDepartures.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-on-surface-variant">
                    No departing rooms in this category right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Main Split: Active Desk Queue + Building Capacity Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Desk Queue */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-serif-display text-xl font-semibold text-primary">
                Active Desk Queue
              </h2>
              <span className="text-xs font-semibold text-secondary tabular-nums">
                {deskQueue.length} Live
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToast('Desk queue refreshed from live reservation stream.')}
              className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>
          </div>

          <div className="space-y-3">
            {deskQueue.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/25 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        item.statusBadge === 'Maintenance Hold'
                          ? 'bg-error-container text-on-error-container'
                          : item.statusBadge === 'Checked In'
                          ? 'bg-secondary text-on-secondary'
                          : item.statusBadge === 'Approval Needed'
                          ? 'bg-tertiary-container text-on-tertiary'
                          : 'bg-primary-container text-on-primary'
                      }`}
                    >
                      {item.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">{item.guestName}</p>
                      <p className="text-xs text-on-surface-variant truncate">{item.roomLabel}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 ${
                      item.statusBadge === 'Checked In'
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : item.statusBadge === 'Maintenance Hold'
                        ? 'bg-error-container text-on-error-container'
                        : item.statusBadge === 'Approval Needed'
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {item.statusBadge}
                  </span>
                </div>

                <div className="bg-surface-container-low rounded-xl px-3 py-2 flex items-center justify-between text-xs gap-2">
                  <span className="font-mono text-on-surface-variant truncate">{item.bookingRef}</span>
                  <span
                    className={`font-semibold truncate ${
                      item.statusBadge === 'Maintenance Hold' ? 'text-error' : 'text-primary-container'
                    }`}
                  >
                    {item.paymentLabel}
                  </span>
                </div>

                {item.actionType === 'checkin' && item.statusBadge === 'Awaiting Check-in' && (
                  <button
                    type="button"
                    onClick={() => onCheckInQueueItem(item.id)}
                    className="w-full h-10 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Check In & Issue Key</span>
                  </button>
                )}

                {(item.actionType === 'folio' || item.statusBadge === 'Checked In') && (
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-secondary" />
                      {item.keyLabel || `Smart Key #${item.roomNumber || '104'} Active`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFolioModalItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Print Folio</span>
                    </button>
                  </div>
                )}

                {item.actionType === 'approve-group' && item.statusBadge === 'Approval Needed' && (
                  <button
                    type="button"
                    onClick={() => onApproveGroupItem(item.id)}
                    className="w-full h-10 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve & Allocate 12 Rooms</span>
                  </button>
                )}

                {item.actionType === 'release-maintenance' && (
                  <button
                    type="button"
                    disabled={item.statusBadge !== 'Maintenance Hold'}
                    onClick={() => onReleaseMaintenanceItem(item.id)}
                    className="w-full h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {item.statusBadge === 'Maintenance Hold' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Release Room {item.roomNumber} to Inventory</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="w-4 h-4 text-primary" />
                        <span>Released to Live System</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Building Occupancy & Capacity Matrix (All 9 Buildings) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-primary">
                Building Capacity Matrix
              </h2>
              <p className="text-xs text-on-surface-variant">
                Real-time room distribution across 9 facilities (click any hall to inspect)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container-highest text-xs font-semibold text-primary tabular-nums">
              {stats.occupiedOrReserved}/{stats.total} Beds
            </span>
          </div>

          <div className="space-y-2.5">
            {buildingMetrics.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onSwitchSubTab('inventory', b.slug, 'all')}
                className="w-full text-left bg-surface-container-lowest hover:bg-surface-container-low rounded-xl p-3.5 shadow-xs border border-outline-variant/25 flex flex-col gap-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                        b.id === 'BLD-09'
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-primary-container text-on-primary'
                      }`}
                    >
                      {b.id}
                    </span>
                    <span className="text-sm font-semibold text-primary truncate">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs tabular-nums shrink-0">
                    <span className="font-bold text-primary">{b.pct}%</span>
                    <span className="text-secondary font-semibold">{b.avail} Avail</span>
                  </div>
                </div>

                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.pct >= 80
                        ? 'bg-primary-container'
                        : b.id === 'BLD-09'
                        ? 'bg-secondary-fixed-dim'
                        : 'bg-secondary'
                    }`}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
                  <span className="tabular-nums">
                    Occupied: {b.occ} / {b.totalRooms}
                  </span>
                  <span className="text-secondary font-medium truncate ml-2">
                    {b.wingDescription.split('•')[0]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Footer */}
      <div className="text-center pt-2 text-xs text-on-surface-variant space-y-0.5">
        <p className="font-medium text-primary">Sanctuary Haven Management System · Synod Edition</p>
        <p className="text-secondary">
          All church guest logs archived for diocesan hospitality review
        </p>
      </div>

      {/* Print Folio Modal */}
      {folioModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
          onClick={() => setFolioModalItem(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl space-y-4 border border-outline-variant/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-primary">
                  Guest Folio & Welcome Slip
                </h3>
                <p className="font-mono text-xs text-secondary">{folioModalItem.bookingRef}</p>
              </div>
              <button
                type="button"
                onClick={() => setFolioModalItem(null)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs bg-surface-container-low p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Guest</span>
                <span className="font-semibold text-primary">{folioModalItem.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Assignment</span>
                <span className="font-semibold text-primary">{folioModalItem.roomLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Settlement</span>
                <span className="font-semibold text-primary">{folioModalItem.paymentLabel}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline-variant/25">
                <span className="text-on-surface-variant">Total Folio</span>
                <span className="font-bold text-primary tabular-nums">
                  ₦{(folioModalItem.amount || 220000).toLocaleString()}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFolioModalItem(null);
                onToast(`Folio ${folioModalItem.bookingRef} sent to Desk #1 thermal printer.`);
              }}
              className="w-full h-10 rounded-xl bg-primary text-on-primary text-xs font-semibold cursor-pointer"
            >
              Print Slip at Desk #1
            </button>
          </div>
        </div>
      )}

      {/* Verify Payment Reference Modal */}
      {showVerifyPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
          onClick={() => setShowVerifyPaymentModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl space-y-4 border border-outline-variant/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-lg font-semibold text-primary">
                Verify Paystack / Bank Reference
              </h3>
              <button
                type="button"
                onClick={() => setShowVerifyPaymentModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyRefInput}
                onChange={(e) => setVerifyRefInput(e.target.value)}
                placeholder="Enter PSTK_... or #CH-2025-..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-surface-container-low text-sm font-mono text-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleVerifyRef}
                className="px-4 py-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-semibold cursor-pointer"
              >
                Verify
              </button>
            </div>
            {verifyResult && (
              <div className="p-3 rounded-xl bg-primary-fixed text-on-primary-fixed text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{verifyResult}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Group Retreat Block Modal */}
      {showGroupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
          onClick={() => setShowGroupModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl space-y-4 border border-outline-variant/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-lg font-semibold text-primary">
                Allocate Group Retreat Block
              </h3>
              <button
                type="button"
                onClick={() => setShowGroupModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">
                  Parish / Delegation Name
                </label>
                <input
                  type="text"
                  value={groupParish}
                  onChange={(e) => setGroupParish(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1">
                    Residence Building
                  </label>
                  <select
                    value={groupBuilding}
                    onChange={(e) => setGroupBuilding(e.target.value as BuildingSlug)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none"
                  >
                    {BUILDINGS.map((b) => (
                      <option key={b.id} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1">
                    Rooms Needed
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={groupCount}
                    onChange={(e) => setGroupCount(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary tabular-nums focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onAddGroupBlock(groupParish, groupBuilding, groupCount);
                setShowGroupModal(false);
              }}
              className="w-full h-11 rounded-xl bg-primary text-on-primary text-xs font-semibold cursor-pointer"
            >
              Reserve {groupCount} Rooms for Delegation
            </button>
          </div>
        </div>
      )}

      {/* Daily Departures Summary Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/65 backdrop-blur-sm"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-2xl space-y-4 border border-outline-variant/30 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-secondary">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Daily Operations Digest</span>
                </div>
                <h3 className="font-serif-display text-xl font-semibold text-primary mt-0.5">
                  Daily Departures &amp; Room Status Summary Report
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5 tabular-nums">
                  Generated {reportGeneratedAt || watTime || '09:45 WAT'} ·{' '}
                  {shift === 'morning' ? 'Morning Shift' : 'Evening Handover'} · Desk #1
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Report KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-surface-container-low">
                <span className="text-lg font-bold text-primary tabular-nums block">
                  {departureCounts.total}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Total Departing
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low">
                <span className="text-lg font-bold text-[#b45309] tabular-nums block">
                  {departureCounts.inTurnover}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  In Turnover
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low">
                <span className="text-lg font-bold text-[#1c6934] tabular-nums block">
                  {departureCounts.cleanedReady}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Cleaned Ready
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low">
                <span className="text-lg font-bold text-secondary tabular-nums block">
                  {departureCounts.pendingDispatch}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Pending Dispatch
                </span>
              </div>
            </div>

            {/* Scrollable Report Breakdown */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-outline-variant/25 divide-y divide-surface-container text-xs">
              {departingSummary.map((d) => (
                <div
                  key={d.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-primary">
                        {d.buildingName} · Rm {d.roomNumber}
                      </span>
                      <span className="font-mono text-[11px] text-secondary">{d.bookingRef}</span>
                    </div>
                    <p className="text-on-surface-variant mt-0.5">
                      {d.guestName} · {d.checkoutTime} ({d.departureState})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        d.roomStatus === 'Available'
                          ? 'bg-[#ebf7ee] text-[#1c6934]'
                          : d.roomStatus === 'Turnover'
                          ? 'bg-[#fff2e0] text-[#b45309]'
                          : 'bg-primary-container text-on-primary'
                      }`}
                    >
                      {d.roomStatus}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {d.isDispatched ? `✓ ${d.assignedStaff.split('(')[0].trim()}` : 'Unassigned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Report Export & Dispatch Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="h-10 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-secondary" />
                  <span>Copy Summary</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsvReport}
                  className="h-10 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-secondary" />
                  <span>Download CSV</span>
                </button>
              </div>

              <button
                type="button"
                onClick={triggerBulkAutoDispatch}
                className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-secondary-fixed" />
                <span>
                  Auto-Dispatch Pending ({departureCounts.pendingDispatch})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
