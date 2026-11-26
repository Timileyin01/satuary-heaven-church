import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Church,
  Clock,
  Coffee,
  CreditCard,
  History,
  Hourglass,
  KeyRound,
  Loader2,
  LogOut,
  Luggage,
  Mail,
  MessageSquare,
  Nfc,
  Phone,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  SwitchCamera,
  Timer,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { CONTACT_DETAILS, IMAGES } from '../data/sanctuaryData';
import { AuditEntry, GuestBooking, RoomRecord } from '../types';

export interface ActiveDeskGuest {
  ref: string;
  guestName: string;
  roleSubtitle: string;
  parish: string;
  guestPhone: string;
  buildingName: string;
  roomNumber: string;
  suiteTitle: string;
  nights: number;
  stayDates: string;
  totalAmount: number;
  paymentMethod: string;
  paymentRef: string;
  paymentStatusLabel: string;
  isPaid: boolean;
  devotionNote: string;
  keyNumber: string;
  vipBadge: string;
  source: 'default' | 'qr-camera' | 'qr-upload' | 'qr-sample';
  alreadyCheckedIn?: boolean;
}

interface CheckInConsoleProps {
  rooms: RoomRecord[];
  bookings: GuestBooking[];
  auditLog: AuditEntry[];
  onCompletePastorCheckIn: () => void;
  onCheckInGuest: (payload: ActiveDeskGuest) => void;
  onUpdateRoomStatus: (roomId: string, status: RoomRecord['status'], guestName?: string) => void;
  onAddAudit: (action: string, target: string) => void;
  onToast: (msg: string) => void;
}

const DEFAULT_DESK_GUEST: ActiveDeskGuest = {
  ref: '#CH-2025-9481',
  guestName: 'Pastor E. Adebayo',
  roleSubtitle: 'Senior District Overseer',
  parish: 'Grace Parish, Ikeja',
  guestPhone: '+234 803 441 9920',
  buildingName: 'Bethel House',
  roomNumber: '104',
  suiteTitle: 'Pastoral Executive Suite (Floor 1)',
  nights: 4,
  stayDates: '14 – 18 Nov',
  totalAmount: 153000,
  paymentMethod: 'Paystack',
  paymentRef: 'Paystack Ref: PSTK_8921849',
  paymentStatusLabel: 'Webhook Confirmed',
  isPaid: true,
  devotionNote:
    'Extra quiet hours for contemplative prayer. Request early 5:30 AM chapel bell wake-up call.',
  keyNumber: '204',
  vipBadge: 'Clergy VIP',
  source: 'default',
};

const PRESET_QR_PASSES: Record<string, Omit<ActiveDeskGuest, 'source'>> = {
  '#CH-2025-9481': {
    ...DEFAULT_DESK_GUEST,
  },
  '#CH-2025-9502': {
    ref: '#CH-2025-9502',
    guestName: 'Deaconess Ruth Nwosu',
    roleSubtitle: 'Visiting Parish Delegate',
    parish: 'Enugu Central Parish',
    guestPhone: '+234 806 772 3104',
    buildingName: 'Grace Haven',
    roomNumber: '112',
    suiteTitle: 'Standard Pilgrim Room (Floor 1)',
    nights: 2,
    stayDates: '14 – 16 Nov',
    totalAmount: 32000,
    paymentMethod: 'POS / Desk Hold',
    paymentRef: 'Folio Balance Due: ₦32,000',
    paymentStatusLabel: 'Pay at Desk',
    isPaid: false,
    devotionNote:
      'Prefers ground-floor access near Prayer Garden walkway. Arriving with choir luggage.',
    keyNumber: '112',
    vipBadge: 'Pilgrim Pass',
  },
  '#VCH-LAGOS-2025': {
    ref: '#VCH-LAGOS-2025',
    guestName: 'Bro. Kenneth (Youth Delegation)',
    roleSubtitle: '12 Rooms · 24 Delegates',
    parish: 'Lagos Diocese Youth Wing',
    guestPhone: '+234 812 509 4418',
    buildingName: 'Shiloh Pavilion',
    roomNumber: '101–112',
    suiteTitle: 'Convention Delegate Twin Block',
    nights: 4,
    stayDates: '14 – 18 Nov',
    totalAmount: 979200,
    paymentMethod: 'Diocese Voucher',
    paymentRef: 'Grant Ref: #VCH-LAGOS-2025',
    paymentStatusLabel: 'Diocese Grant',
    isPaid: true,
    devotionNote:
      'Bulk 12-key encoding authorized for Youth Conference Delegation. Shuttle pickup at Gate 2.',
    keyNumber: '401–412',
    vipBadge: 'Group Lead',
  },
  '#CH-2025-9482': {
    ref: '#CH-2025-9482',
    guestName: 'Dr. & Mrs. Okonjo',
    roleSubtitle: 'Visiting Parish Patrons',
    parish: 'Abuja Cathedral',
    guestPhone: '+234 809 211 4501',
    buildingName: 'Mount Zion Lodge',
    roomNumber: '202',
    suiteTitle: 'Family Flat 202 (Floor 2)',
    nights: 4,
    stayDates: '14 – 18 Nov',
    totalAmount: 220000,
    paymentMethod: 'Flutterwave',
    paymentRef: 'Flutterwave Ref: FLW_441092',
    paymentStatusLabel: 'Webhook Confirmed',
    isPaid: true,
    devotionNote:
      'Family residence suite with kitchenette stocked with bottled water and welcome fruit tray.',
    keyNumber: '202',
    vipBadge: 'Patron Pass',
    alreadyCheckedIn: true,
  },
};

function resolveGuestFromQr(
  rawText: string,
  bookings: GuestBooking[],
  rooms: RoomRecord[],
  source: ActiveDeskGuest['source']
): ActiveDeskGuest {
  const trimmed = rawText.trim();
  let parsedJson: Record<string, unknown> | null = null;

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const candidate = JSON.parse(trimmed);
      if (candidate && typeof candidate === 'object') {
        parsedJson = candidate as Record<string, unknown>;
      }
    } catch {
      parsedJson = null;
    }
  }

  // Extract ref candidate from JSON, URL query, or raw string
  let refCandidate = '';
  if (parsedJson && typeof parsedJson.ref === 'string') {
    refCandidate = parsedJson.ref;
  } else {
    const match = trimmed.match(/(#?(?:CH|VCH|BK)-[A-Z0-9-]+)/i);
    if (match) {
      refCandidate = match[1].startsWith('#') ? match[1].toUpperCase() : `#${match[1].toUpperCase()}`;
    } else if (trimmed.includes('ref=')) {
      const urlMatch = trimmed.match(/ref=([^&\s]+)/i);
      if (urlMatch) refCandidate = decodeURIComponent(urlMatch[1]).toUpperCase();
    }
  }

  const normalizedRef = refCandidate
    ? refCandidate.startsWith('#')
      ? refCandidate.toUpperCase()
      : `#${refCandidate.toUpperCase()}`
    : '';

  // 1. Check live bookings from Guest Portal / App state
  const matchedBooking = bookings.find(
    (b) =>
      (normalizedRef && b.ref.toUpperCase() === normalizedRef) ||
      (parsedJson?.guestName &&
        b.guestName.toLowerCase() === String(parsedJson.guestName).toLowerCase())
  );

  if (parsedJson) {
    const ref =
      typeof parsedJson.ref === 'string' && parsedJson.ref.trim()
        ? parsedJson.ref.trim()
        : matchedBooking?.ref || normalizedRef || `#QR-${Date.now().toString().slice(-4)}`;
    const guestName =
      typeof parsedJson.guestName === 'string' && parsedJson.guestName.trim()
        ? parsedJson.guestName.trim()
        : matchedBooking?.guestName || 'Sanctuary QR Guest';
    const guestPhone =
      typeof parsedJson.guestPhone === 'string' && parsedJson.guestPhone.trim()
        ? parsedJson.guestPhone.trim()
        : matchedBooking?.guestPhone || '+234 800 000 0000';
    const buildingName =
      typeof parsedJson.buildingName === 'string' && parsedJson.buildingName.trim()
        ? parsedJson.buildingName.trim()
        : matchedBooking?.buildingName || 'Bethel House';
    const roomNumber =
      typeof parsedJson.roomNumber === 'string' && parsedJson.roomNumber.trim()
        ? parsedJson.roomNumber.trim()
        : matchedBooking?.roomNumber || '102';
    const suiteTitle =
      typeof parsedJson.suiteTitle === 'string' && parsedJson.suiteTitle.trim()
        ? parsedJson.suiteTitle.trim()
        : matchedBooking?.suiteTitle || 'Sanctuary Residence Suite';
    const nights =
      typeof parsedJson.nights === 'number' && parsedJson.nights > 0
        ? parsedJson.nights
        : matchedBooking?.nights || 2;
    const checkIn =
      typeof parsedJson.checkInDate === 'string' ? parsedJson.checkInDate : matchedBooking?.checkInDate;
    const checkOut =
      typeof parsedJson.checkOutDate === 'string' ? parsedJson.checkOutDate : matchedBooking?.checkOutDate;
    const stayDates =
      checkIn && checkOut
        ? `${checkIn.replace(/\s20\d{2}/, '')} – ${checkOut.replace(/\s20\d{2}/, '')}`
        : typeof parsedJson.stayDates === 'string'
        ? parsedJson.stayDates
        : 'Confirmed Stay';
    const totalAmount =
      typeof parsedJson.totalAmount === 'number'
        ? parsedJson.totalAmount
        : matchedBooking?.totalAmount || 45000;
    const paymentMethod =
      typeof parsedJson.paymentMethod === 'string' && parsedJson.paymentMethod.trim()
        ? parsedJson.paymentMethod.trim()
        : matchedBooking?.paymentMethod || 'Paystack';
    const isPaid = paymentMethod !== 'Desk Hold (2h)' && paymentMethod !== 'POS / Desk Hold';
    const preset = PRESET_QR_PASSES[ref.toUpperCase()];

    return {
      ref,
      guestName,
      roleSubtitle:
        typeof parsedJson.roleSubtitle === 'string'
          ? parsedJson.roleSubtitle
          : preset?.roleSubtitle ||
            (parsedJson.isMemberRate ? 'Verified Parish Member' : 'Sanctuary Lodging Guest'),
      parish:
        typeof parsedJson.parish === 'string'
          ? parsedJson.parish
          : preset?.parish || `${buildingName} Desk Check-in`,
      guestPhone,
      buildingName,
      roomNumber,
      suiteTitle,
      nights,
      stayDates,
      totalAmount,
      paymentMethod,
      paymentRef:
        isPaid
          ? `${paymentMethod} Ref: ${ref.replace('#', '')}`
          : `2-Hr Desk Hold · Due ₦${totalAmount.toLocaleString()}`,
      paymentStatusLabel: isPaid ? 'QR Pass Paid' : 'Collect at Desk',
      isPaid,
      devotionNote:
        typeof parsedJson.devotionNote === 'string'
          ? parsedJson.devotionNote
          : preset?.devotionNote ||
            `Digital QR Lodging Pass verified via camera scan. ${
              typeof parsedJson.guestsLabel === 'string' ? `Party: ${parsedJson.guestsLabel}.` : ''
            }`,
      keyNumber: roomNumber.replace(/\D/g, '') || '201',
      vipBadge: parsedJson.isMemberRate ? 'Member Pass' : 'QR Verified',
      source,
      alreadyCheckedIn:
        matchedBooking?.status === 'Checked In' || parsedJson.status === 'Checked In',
    };
  }

  // 2. Match known booking from live App bookings state
  if (matchedBooking) {
    const preset = PRESET_QR_PASSES[matchedBooking.ref.toUpperCase()];
    const isPaid = matchedBooking.paymentMethod !== 'Desk Hold (2h)';
    return {
      ref: matchedBooking.ref,
      guestName: matchedBooking.guestName,
      roleSubtitle:
        preset?.roleSubtitle ||
        (matchedBooking.isMemberRate ? 'Verified Parish Member' : 'Sanctuary Guest'),
      parish: preset?.parish || 'Diocesan Guest Portal',
      guestPhone: matchedBooking.guestPhone,
      buildingName: matchedBooking.buildingName,
      roomNumber: matchedBooking.roomNumber,
      suiteTitle: matchedBooking.suiteTitle,
      nights: matchedBooking.nights,
      stayDates: `${matchedBooking.checkInDate.replace(/\s20\d{2}/, '')} – ${matchedBooking.checkOutDate.replace(/\s20\d{2}/, '')}`,
      totalAmount: matchedBooking.totalAmount,
      paymentMethod: matchedBooking.paymentMethod,
      paymentRef: isPaid
        ? `${matchedBooking.paymentMethod} Ref: ${matchedBooking.ref.replace('#', '')}`
        : `Desk Hold Due: ₦${matchedBooking.totalAmount.toLocaleString()}`,
      paymentStatusLabel: isPaid ? 'Webhook Confirmed' : 'Collect at Desk',
      isPaid,
      devotionNote:
        preset?.devotionNote ||
        `Digital pass verified for ${matchedBooking.guestsLabel}. Ready for keycard encoding.`,
      keyNumber: matchedBooking.roomNumber,
      vipBadge: matchedBooking.isMemberRate ? 'Member Pass' : 'QR Verified',
      source,
      alreadyCheckedIn: matchedBooking.status === 'Checked In',
    };
  }

  // 3. Match preset passes (Deaconess Ruth, Youth Delegation, etc.)
  if (normalizedRef && PRESET_QR_PASSES[normalizedRef]) {
    return {
      ...PRESET_QR_PASSES[normalizedRef],
      source,
    };
  }

  // 4. Match across 190-room inventory
  const matchedRoom = rooms.find(
    (r) =>
      (normalizedRef && r.bookingRef?.toUpperCase() === normalizedRef) ||
      r.roomNumber === trimmed ||
      (trimmed.length > 3 && r.guestName.toLowerCase().includes(trimmed.toLowerCase()))
  );
  if (matchedRoom) {
    return {
      ref: matchedRoom.bookingRef || normalizedRef || `#RM-${matchedRoom.roomNumber}`,
      guestName: matchedRoom.guestName,
      roleSubtitle: matchedRoom.guestRole || 'Sanctuary Guest',
      parish: `${matchedRoom.buildingName} Wing`,
      guestPhone: '+234 803 550 1820',
      buildingName: matchedRoom.buildingName,
      roomNumber: matchedRoom.roomNumber,
      suiteTitle: `${matchedRoom.roomType} (Floor ${matchedRoom.floor})`,
      nights: 3,
      stayDates: matchedRoom.stayPeriod,
      totalAmount: matchedRoom.ratePerNight * 3,
      paymentMethod: matchedRoom.paymentStatus === 'Paid' ? 'Paystack' : 'Desk Hold',
      paymentRef: `Inventory Folio · ${matchedRoom.keyId}`,
      paymentStatusLabel: matchedRoom.paymentStatus === 'Paid' ? 'Paid in Full' : 'Verify Folio',
      isPaid: matchedRoom.paymentStatus === 'Paid',
      devotionNote: matchedRoom.notes,
      keyNumber: matchedRoom.roomNumber,
      vipBadge: matchedRoom.badgeTag || 'QR Verified',
      source,
      alreadyCheckedIn: matchedRoom.status === 'Occupied',
    };
  }

  // 5. Fallback for any external QR text (still auto-populates cleanly)
  return {
    ref: normalizedRef || `#QR-${trimmed.slice(0, 10).toUpperCase().replace(/\s+/g, '-')}`,
    guestName: trimmed.length <= 42 ? trimmed : `${trimmed.slice(0, 40)}...`,
    roleSubtitle: 'External Digital Check-In QR',
    parish: 'Scanned Guest Credential',
    guestPhone: '+234 800 000 0000',
    buildingName: 'Bethel House',
    roomNumber: '102',
    suiteTitle: 'Deluxe Pastoral Lodge (Floor 1)',
    nights: 2,
    stayDates: 'Today – +2 Nights',
    totalAmount: 90000,
    paymentMethod: 'QR Pass Scan',
    paymentRef: `Raw QR: ${trimmed.slice(0, 32)}`,
    paymentStatusLabel: 'QR Decoded',
    isPaid: true,
    devotionNote: `Scanned payload auto-populated from guest QR pass: "${trimmed.slice(0, 110)}"`,
    keyNumber: '102',
    vipBadge: 'QR Scanned',
    source,
  };
}

export const CheckInConsole: React.FC<CheckInConsoleProps> = ({
  rooms,
  bookings,
  auditLog,
  onCompletePastorCheckIn,
  onCheckInGuest,
  onUpdateRoomStatus,
  onAddAudit,
  onToast,
}) => {
  const [consoleTab, setConsoleTab] = useState<'arrivals' | 'departures' | 'keys'>('arrivals');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGuest, setActiveGuest] = useState<ActiveDeskGuest>(DEFAULT_DESK_GUEST);
  const [checks, setChecks] = useState({
    credentials: true,
    phone: true,
    keyEncoded: true,
  });
  const [keyState, setKeyState] = useState<'ready' | 'encoding' | 'completed'>('ready');
  const [adelekeInspected, setAdelekeInspected] = useState(false);
  const [nwosuPaid, setNwosuPaid] = useState(false);
  const [groupDispatched, setGroupDispatched] = useState(false);
  const [moriahCleaned, setMoriahCleaned] = useState(false);

  const [showQrModal, setShowQrModal] = useState(false);
  const [showFolioModal, setShowFolioModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Camera QR Scanner state
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'starting' | 'streaming' | 'error'
  >('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [lastScannedPreview, setLastScannedPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastDecodeTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus('idle');
  }, []);

  const applyScannedQr = useCallback(
    (rawPayload: string, source: ActiveDeskGuest['source']) => {
      const resolved = resolveGuestFromQr(rawPayload, bookings, rooms, source);
      setActiveGuest(resolved);
      setSearchQuery(resolved.ref);
      setConsoleTab('arrivals');
      setKeyState(resolved.alreadyCheckedIn ? 'completed' : 'ready');
      setChecks({ credentials: true, phone: true, keyEncoded: true });
      setLastScannedPreview(resolved.guestName);
      stopCamera();
      setShowQrModal(false);
      onAddAudit(
        'QR Pass Scanned & Auto-Populated',
        `${resolved.guestName} · ${resolved.ref} (${resolved.buildingName} Rm ${resolved.roomNumber})`
      );
      onToast(
        `Booking auto-populated from QR: ${resolved.guestName} (${resolved.buildingName} · Rm ${resolved.roomNumber})`
      );
    },
    [bookings, rooms, onAddAudit, onToast, stopCamera]
  );

  const startCamera = useCallback(
    async (requestedFacing: 'environment' | 'user') => {
      stopCamera();
      setCameraError(null);
      setCameraStatus('starting');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('error');
        setCameraError(
          'Camera access is unavailable in this browser context. Upload a QR pass image or select a pass below.'
        );
        return;
      }

      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: requestedFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback to any available video input if environment constraint fails on desktop webcams
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;

        if (!videoRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraStatus('streaming');

        const scanFrame = (now: number) => {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas || !streamRef.current) return;

          if (video.readyState >= video.HAVE_ENOUGH_DATA && now - lastDecodeTimeRef.current >= 110) {
            lastDecodeTimeRef.current = now;
            const w = video.videoWidth;
            const h = video.videoHeight;
            if (w > 0 && h > 0) {
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(video, 0, 0, w, h);
                const imageData = ctx.getImageData(0, 0, w, h);
                const code = jsQR(imageData.data, w, h, {
                  inversionAttempts: 'attemptBoth',
                });
                if (code && code.data) {
                  applyScannedQr(code.data, 'qr-camera');
                  return;
                }
              }
            }
          }
          rafRef.current = requestAnimationFrame(scanFrame);
        };

        rafRef.current = requestAnimationFrame(scanFrame);
      } catch (err) {
        const message =
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow camera access in your browser bar and click Retry Camera, or upload a QR image below.'
            : err instanceof DOMException && err.name === 'NotFoundError'
            ? 'No camera device was detected on this machine. You can upload a saved QR pass image or test with a pass below.'
            : 'Unable to start device camera. Please verify camera permissions or upload a QR pass image.';
        setCameraStatus('error');
        setCameraError(message);
      }
    },
    [applyScannedQr, stopCamera]
  );

  // Automatically trigger device camera when QR scanner modal opens; clean up on close/unmount
  useEffect(() => {
    if (showQrModal) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showQrModal, facingMode, startCamera, stopCamera]);

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onToast('Could not inspect uploaded image.');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          applyScannedQr(code.data, 'qr-upload');
        } else {
          onToast('No readable QR code found in the selected image.');
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const keyRooms = useMemo(
    () =>
      rooms
        .filter((r) =>
          searchQuery.trim()
            ? `${r.roomNumber} ${r.guestName} ${r.buildingName} ${r.bookingRef || ''}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            : true
        )
        .slice(0, 18),
    [rooms, searchQuery]
  );

  const handleCompleteCheckIn = () => {
    if (!checks.credentials || !checks.phone || !checks.keyEncoded) {
      onToast('Please verify all 3 Check-In Handshake checklist items first.');
      return;
    }
    setKeyState('encoding');
    setTimeout(() => {
      setKeyState('completed');
      if (activeGuest.ref === '#CH-2025-9481') {
        onCompletePastorCheckIn();
      }
      onCheckInGuest(activeGuest);
      onAddAudit(
        `Encoded Key #${activeGuest.keyNumber} & Checked In`,
        `${activeGuest.guestName} · ${activeGuest.buildingName} Rm ${activeGuest.roomNumber}`
      );
      onToast(
        `${activeGuest.guestName} checked in! Smart Key Card #${activeGuest.keyNumber} handed over.`
      );
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Operational Header & Duty Shift Status */}
      <section className="bg-surface-container-low rounded-2xl p-5 md:p-6 shadow-xs border border-outline-variant/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
              <ShieldCheck className="w-4 h-4" />
              <span>Morning Shift Live</span>
            </div>
            <h1 className="font-serif-display text-2xl md:text-3xl text-primary font-medium mt-0.5">
              Front Desk & Key Registry
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
              <Users className="w-4 h-4 text-primary" />
              <span>Sister Joy & Bro. Emmanuel on duty</span>
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
            <span className="px-3 py-1 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-semibold flex items-center gap-1.5 tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              09:42 AM
            </span>
            <span className="text-xs text-on-surface-variant">Synod Office Desk #1</span>
          </div>
        </div>

        {/* Desk Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-on-surface-variant">
                Expected Arrivals
              </span>
              <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed text-xs font-bold tabular-nums">
                18 Total
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2 tabular-nums">
              <span className="text-xl font-bold text-primary">
                {keyState === 'completed' ? 12 : 11}
              </span>
              <span className="text-xs text-on-surface-variant">In</span>
              <span className="text-outline-variant font-bold">/</span>
              <span className="text-xl font-bold text-secondary">
                {keyState === 'completed' ? 6 : 7}
              </span>
              <span className="text-xs font-semibold text-secondary">Pending</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2.5 overflow-hidden flex">
              <div
                className="bg-primary-container h-full transition-all"
                style={{ width: keyState === 'completed' ? '67%' : '61%' }}
              />
              <div
                className="bg-secondary-container h-full transition-all"
                style={{ width: keyState === 'completed' ? '33%' : '39%' }}
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-on-surface-variant">
                Departures
              </span>
              <span className="px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant text-xs font-bold tabular-nums">
                14 Total
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2 tabular-nums">
              <span className="text-xl font-bold text-primary">12</span>
              <span className="text-xs text-on-surface-variant">Out</span>
              <span className="text-outline-variant font-bold">/</span>
              <span className="text-xl font-bold text-error">2</span>
              <span className="text-xs font-semibold text-error">Late</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2.5 overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: '86%' }} />
              <div className="bg-error h-full" style={{ width: '14%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Segmented Mode Switcher + Search & Camera QR Bar */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        <div className="lg:col-span-6 bg-surface-container-low p-1 rounded-xl grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setConsoleTab('arrivals')}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              consoleTab === 'arrivals'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Luggage className="w-4 h-4" />
            <span>Arrivals ({keyState === 'completed' ? 6 : 7})</span>
          </button>
          <button
            type="button"
            onClick={() => setConsoleTab('departures')}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              consoleTab === 'departures'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Departures (2)</span>
          </button>
          <button
            type="button"
            onClick={() => setConsoleTab('keys')}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              consoleTab === 'keys'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Keys & Rooms</span>
          </button>
        </div>

        <div className="lg:col-span-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Guest name, phone or ref (#CH-2025-9481)..."
              className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest text-sm text-primary placeholder:text-outline rounded-xl shadow-xs border border-outline-variant/25 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="h-10 px-4 bg-secondary hover:bg-secondary/90 text-on-secondary rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Guest QR</span>
          </button>
        </div>
      </section>

      {/* Tab 1: Arrivals (At Reception Desk Now + Pending Arrivals Queue) */}
      {consoleTab === 'arrivals' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* At Reception Desk Now — Auto-populated via Camera QR Scan or Default */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  At Reception Desk Now
                </span>
                {activeGuest.source !== 'default' && (
                  <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[11px] font-bold inline-flex items-center gap-1">
                    <ScanLine className="w-3 h-3" />
                    QR Auto-Populated
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {activeGuest.source !== 'default' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGuest(DEFAULT_DESK_GUEST);
                      setSearchQuery('');
                      setKeyState('ready');
                    }}
                    className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                <span className="px-2.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed text-xs font-semibold">
                  {keyState === 'completed'
                    ? `Checked In · Key #${activeGuest.keyNumber} Active`
                    : 'Ready to Key-Encode'}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-4">
              {/* Guest Identity */}
              <div className="flex items-start gap-3.5">
                <img
                  src={IMAGES.clergyPortrait}
                  alt={activeGuest.guestName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-outline-variant/30"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-serif-display text-xl font-semibold text-primary truncate">
                      {activeGuest.guestName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[11px] font-bold shrink-0">
                      {activeGuest.vipBadge}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-secondary">{activeGuest.roleSubtitle}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                      {activeGuest.parish}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-semibold text-primary">{activeGuest.ref}</span>
                  </div>
                </div>
              </div>

              {/* Room & Payment Bento */}
              <div className="bg-surface-container-low rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-primary block">
                      {activeGuest.buildingName} · Rm {activeGuest.roomNumber}
                    </span>
                    <span className="text-xs text-on-surface-variant">{activeGuest.suiteTitle}</span>
                  </div>
                  <div className="text-right tabular-nums shrink-0">
                    <span className="text-xs font-bold uppercase text-secondary block">
                      {activeGuest.nights} {activeGuest.nights === 1 ? 'Night' : 'Nights'}
                    </span>
                    <span className="text-xs text-on-surface-variant">{activeGuest.stayDates}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/25">
                  <div>
                    <span className="text-xs font-bold text-primary block tabular-nums">
                      ₦{activeGuest.totalAmount.toLocaleString()}{' '}
                      {activeGuest.isPaid ? 'Paid in Full' : 'Due at Desk'}
                    </span>
                    <span className="text-[11px] font-mono text-on-surface-variant">
                      {activeGuest.paymentRef}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${
                      activeGuest.isPaid
                        ? 'bg-primary-fixed-dim text-on-primary-fixed-variant'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {activeGuest.paymentStatusLabel}
                  </span>
                </div>
              </div>

              {/* Liturgical / Check-In Note */}
              <div className="bg-surface-container p-3 rounded-xl flex items-start gap-2.5">
                <Church className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-primary">Guest Devotion & Desk Note:</strong>{' '}
                  {activeGuest.devotionNote}
                </p>
              </div>

              {/* Verification Handshake Checklist */}
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant block">
                  Check-In Handshake Verification
                </span>

                {[
                  {
                    key: 'credentials' as const,
                    label: `Guest Credentials & Ref (${activeGuest.ref}) Verified`,
                    icon: CheckCircle2,
                  },
                  {
                    key: 'phone' as const,
                    label: `Contact Phone (${activeGuest.guestPhone}) Confirmed`,
                    icon: CheckCircle2,
                  },
                  {
                    key: 'keyEncoded' as const,
                    label: `Physical Smart Key Card #${activeGuest.keyNumber} Encoded`,
                    icon: Nfc,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface hover:bg-surface-container-low transition-colors cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={checks[item.key]}
                        onChange={(e) =>
                          setChecks((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                        className="w-4 h-4 accent-primary-container cursor-pointer"
                      />
                      <span className="flex-1 text-primary font-medium">{item.label}</span>
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                    </label>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={keyState !== 'ready'}
                  onClick={handleCompleteCheckIn}
                  className={`w-full h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                    keyState === 'completed'
                      ? 'bg-primary text-on-primary'
                      : keyState === 'encoding'
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-primary-container hover:bg-primary text-on-primary'
                  }`}
                >
                  {keyState === 'encoding' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Encoding Key Card #{activeGuest.keyNumber} & Syncing...</span>
                    </>
                  ) : keyState === 'completed' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{activeGuest.guestName} Checked In! (Key Dispatched)</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Complete Check-In & Hand Over Key</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFolioModal(true)}
                    className="h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Print Folio Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-secondary" />
                    <span>Scan Next QR</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Arrivals Queue */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Hourglass className="w-4 h-4 text-primary" />
                <h3 className="font-serif-display text-xl font-semibold text-primary">
                  Pending Arrivals Queue
                </h3>
              </div>
              <span className="text-xs font-bold text-secondary">6 More Incoming</span>
            </div>

            <div className="space-y-3">
              {/* Item 1: Mrs. Folashade Adeleke & Family */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/25 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-primary">
                        Mrs. Folashade Adeleke & Family
                      </span>
                      <span className="text-xs text-on-surface-variant">· 4 Guests</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Mount Zion Lodge · Flat 202 (Family Flat)
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${
                      adelekeInspected
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {adelekeInspected ? 'Ready for Key' : 'Lobby Waiting'}
                  </span>
                </div>

                <div className="bg-surface-container-low rounded-xl px-3 py-2 flex items-center justify-between text-xs gap-2">
                  <span className="text-primary font-medium tabular-nums">
                    Paid ₦187,000 (Flutterwave)
                  </span>
                  <span className={`font-semibold ${adelekeInspected ? 'text-primary' : 'text-error'}`}>
                    {adelekeInspected ? 'Flat 202 Cleared' : 'Awaiting Final Clean'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={adelekeInspected}
                    onClick={() => {
                      setAdelekeInspected(true);
                      onAddAudit('Fast-Track Inspected Flat 202', 'Mrs. Folashade Adeleke & Family');
                      onToast('Mount Zion Flat 202 passed final housekeeping inspection!');
                    }}
                    className="flex-1 h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{adelekeInspected ? 'Inspection Cleared' : 'Fast-Track Inspect'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onToast('Courtesy herbal tea & water tray dispatched to Lobby Reception.')
                    }
                    className="h-9 px-3 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Tea Offer</span>
                  </button>
                </div>
              </div>

              {/* Item 2: Deaconess Ruth Nwosu */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/25 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">
                        Deaconess Ruth Nwosu
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          nwosuPaid
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {nwosuPaid ? 'Paid POS' : 'Unpaid'}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Grace Haven · Rm 112 (Standard Pilgrim Room)
                    </p>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant">#CH-2025-9502</span>
                </div>

                <div className="bg-surface-container-low rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Outstanding Folio Amount:</span>
                  <span className="font-bold text-primary tabular-nums">
                    {nwosuPaid ? '₦0.00 (Settled)' : '₦32,000.00'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={nwosuPaid}
                    onClick={() => {
                      setNwosuPaid(true);
                      onAddAudit('Collected ₦32,000 POS & Checked In', 'Deaconess Ruth Nwosu · Grace Rm 112');
                      onToast('₦32,000 POS settled & Key issued for Grace Haven Rm 112.');
                    }}
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{nwosuPaid ? 'Settled & Checked In' : 'Collect POS / Cash & Check In'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToast('Paystack SMS payment link sent to Deaconess Ruth Nwosu.')}
                    aria-label="Send SMS Payment Link"
                    className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Item 3: Youth Conference Delegation */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/25 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-primary">
                        Youth Conference Delegation
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                        12 Rooms
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Shiloh Pavilion · Rooms 101–112 · Lead: Bro. Kenneth
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-primary-fixed-dim text-on-primary-fixed-variant text-[11px] font-bold shrink-0">
                    Diocese Grant
                  </span>
                </div>

                <div className="bg-surface-container-low rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Diocese Voucher Confirmed:</span>
                  <span className="font-mono font-bold text-primary">#VCH-LAGOS-2025</span>
                </div>

                <button
                  type="button"
                  disabled={groupDispatched}
                  onClick={() => {
                    setGroupDispatched(true);
                    onAddAudit('Bulk Group Check-In (12 Keys)', 'Youth Conference Delegation · Shiloh');
                    onToast('12 Smart Keys encoded and dispatched to Bro. Kenneth (Shiloh Pavilion).');
                  }}
                  className="w-full h-10 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {groupDispatched
                      ? '12 Keys Dispatched to Delegation'
                      : 'Bulk Group Check-In (Dispatch 12 Keys)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Departures & Active Turnover */}
      {consoleTab === 'departures' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/25 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-primary">
                  Rm 305 Shiloh · Bro. Daniel Kalu
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                  Late Checkout
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Flight delayed to 3:00 PM. Extension approved by Sister Grace (Front Office Mgr).
              </p>
              <button
                type="button"
                onClick={() => setShowPermissionModal(true)}
                className="text-xs font-bold text-secondary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Permission Note</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/25 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-primary">Moriah Court · Rm 106</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    moriahCleaned
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant'
                  }`}
                >
                  {moriahCleaned ? 'Cleaned Ready' : 'In Turnover'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Departed 09:15 AM. Housekeeping assigned to Bro. Samuel (Floor Tech).
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-on-surface-variant tabular-nums">
                  Est. Completion: 10:15 AM
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToast('Intercom ping sent to Bro. Samuel on Moriah Floor 1.')}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold cursor-pointer"
                  >
                    Ping Staff
                  </button>
                  {!moriahCleaned && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoriahCleaned(true);
                        onUpdateRoomStatus('BLD-06-106', 'Available', 'Vacant & Sanitized');
                        onAddAudit('Cleared Turnover Rm 106', 'Moriah Court · Ready for Check-in');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold cursor-pointer"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Keys & Rooms Quick Registry */}
      {consoleTab === 'keys' && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {keyRooms.map((r) => (
            <div
              key={r.id}
              className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-outline-variant/25 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary truncate">
                  {r.buildingName} · Rm {r.roomNumber}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">{r.keyId}</p>
                <p className="text-[11px] text-secondary truncate">{r.guestName}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAddAudit(`Re-encoded ${r.keyId}`, `${r.buildingName} Rm ${r.roomNumber}`);
                  onToast(`${r.keyId} re-encoded at Desk #1 NFC cradle.`);
                }}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Encode Key
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Supervisor Override & Diocese Audit Vault Footer */}
      <section className="bg-surface-container rounded-2xl p-5 text-center space-y-3 border border-outline-variant/25">
        <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm">
          <ShieldCheck className="w-5 h-5 text-secondary" />
          <span>Need Reception Supervisor Override?</span>
        </div>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          For room reassignments, honorary fee waivers, or clergy priority escalations:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={`tel:${CONTACT_DETAILS.phone}`}
            onClick={() => onToast(`Dialing Booking & Enquiries Desk (${CONTACT_DETAILS.phone})...`)}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-surface-container-lowest text-primary text-xs font-semibold shadow-xs hover:bg-surface-container-high cursor-pointer tabular-nums"
          >
            <Phone className="w-3.5 h-3.5 text-secondary" />
            <span>{CONTACT_DETAILS.phone}</span>
          </a>
          <a
            href={`mailto:${CONTACT_DETAILS.email}`}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-surface-container-lowest text-primary text-xs font-semibold shadow-xs hover:bg-surface-container-high cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-secondary" />
            <span>{CONTACT_DETAILS.email}</span>
          </a>
          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-surface-container-lowest text-primary text-xs font-semibold shadow-xs hover:bg-surface-container-high cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-primary" />
            <span>Audit Log ({auditLog.length})</span>
          </button>
        </div>
      </section>

      {/* Live Device Camera QR Scanner Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/65 backdrop-blur-sm"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-2xl space-y-4 border border-outline-variant/30 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-semibold text-primary leading-tight">
                    Camera QR Check-In Scanner
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Point device camera at guest&apos;s Diocesan Lodging Pass QR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                aria-label="Close scanner"
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Camera Viewfinder */}
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-primary-container text-on-primary flex items-center justify-center border border-outline-variant/30">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  cameraStatus === 'streaming' ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Reticle Overlay */}
              {cameraStatus === 'streaming' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 relative">
                    <span className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-secondary-fixed rounded-tl-lg" />
                    <span className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-secondary-fixed rounded-tr-lg" />
                    <span className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-secondary-fixed rounded-bl-lg" />
                    <span className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-secondary-fixed rounded-br-lg" />
                    <div className="absolute inset-x-2 top-1/2 h-0.5 bg-secondary-fixed/85 shadow-[0_0_10px_rgba(255,215,140,0.9)] animate-pulse" />
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-primary/80 text-on-primary text-[11px] font-medium whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
                    <span>Live Camera Active · Auto-Detecting QR</span>
                  </div>
                </div>
              )}

              {cameraStatus === 'starting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 text-center">
                  <Loader2 className="w-8 h-8 text-secondary-fixed animate-spin" />
                  <p className="text-xs font-medium text-primary-fixed">
                    Activating device camera...
                  </p>
                </div>
              )}

              {cameraStatus === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center bg-primary-container">
                  <AlertCircle className="w-9 h-9 text-secondary-fixed" />
                  <p className="text-xs text-primary-fixed leading-relaxed max-w-xs">
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-3.5 py-2 rounded-lg bg-secondary text-on-secondary text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera</span>
                  </button>
                </div>
              )}
            </div>

            {/* Camera Controls & Image Upload Fallback */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                }
                className="flex-1 h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <SwitchCamera className="w-3.5 h-3.5 text-secondary" />
                <span>{facingMode === 'environment' ? 'Use Front Camera' : 'Use Rear Camera'}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-secondary" />
                <span>Upload QR Image</span>
              </button>
            </div>

            {lastScannedPreview && (
              <div className="px-3 py-2 rounded-lg bg-primary-fixed/60 text-on-primary-fixed text-[11px] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Last scanned guest: {lastScannedPreview}</span>
              </div>
            )}

            {/* Quick-Scan Sample Passes (Auto-populates Reception Desk immediately) */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/25 text-xs">
              <p className="font-semibold text-on-surface-variant flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-secondary" />
                <span>Or Test Auto-Populate with Active Pass:</span>
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {[
                  ...bookings.map((b) => ({
                    code: b.ref,
                    label: `${b.ref} (${b.guestName} · ${b.buildingName} Rm ${b.roomNumber})`,
                  })),
                  {
                    code: '#CH-2025-9502',
                    label: '#CH-2025-9502 (Deaconess Ruth Nwosu · Grace Haven Rm 112)',
                  },
                  {
                    code: '#VCH-LAGOS-2025',
                    label: '#VCH-LAGOS-2025 (Youth Conference Delegation · Shiloh)',
                  },
                ]
                  .filter(
                    (item, idx, arr) =>
                      arr.findIndex((x) => x.code.toUpperCase() === item.code.toUpperCase()) === idx
                  )
                  .slice(0, 5)
                  .map((sample) => (
                    <button
                      key={sample.code}
                      type="button"
                      onClick={() => applyScannedQr(sample.code, 'qr-sample')}
                      className="w-full text-left px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-medium cursor-pointer truncate"
                    >
                      {sample.label}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Folio Slip Modal */}
      {showFolioModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
          onClick={() => setShowFolioModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-primary">
                  Welcome Package & Folio Slip
                </h3>
                <p className="text-xs font-mono text-secondary">{activeGuest.ref}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFolioModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low text-xs space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">Guest</span>
                <span className="font-semibold text-primary text-right">{activeGuest.guestName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">Residence</span>
                <span className="font-semibold text-primary text-right">
                  {activeGuest.buildingName} · Rm {activeGuest.roomNumber}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">Smart Key</span>
                <span className="font-semibold text-primary">Card Key #{activeGuest.keyNumber}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant">Total Folio</span>
                <span className="font-semibold text-secondary tabular-nums">
                  ₦{activeGuest.totalAmount.toLocaleString()} ({activeGuest.paymentMethod})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowFolioModal(false);
                onToast(`Welcome package slip printed for ${activeGuest.guestName} at Synod Desk #1.`);
              }}
              className="w-full h-10 rounded-xl bg-primary text-on-primary text-xs font-semibold cursor-pointer"
            >
              Print Slip Now
            </button>
          </div>
        </div>
      )}

      {/* Permission Note Modal */}
      {showPermissionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
          onClick={() => setShowPermissionModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-lg font-semibold text-primary">
                Late Checkout Authorization
              </h3>
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Approved complimentary checkout extension until <strong>3:00 PM</strong> for Bro. Daniel Kalu (Shiloh Pavilion Rm 305) due to domestic flight reschedule. Signed by Sister Grace (Front Office Mgr).
            </p>
            <button
              type="button"
              onClick={() => setShowPermissionModal(false)}
              className="w-full h-10 rounded-xl bg-primary text-on-primary text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Audit Vault Modal */}
      {showAuditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
          onClick={() => setShowAuditModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-serif-display text-lg font-semibold text-primary">
                Diocese Key & Desk Audit Vault
              </h3>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {auditLog.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-surface-container-low text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{entry.action}</span>
                    <span className="font-mono text-[11px] text-secondary tabular-nums">
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="text-on-surface-variant">
                    {entry.target} · <span className="text-primary">{entry.actor}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
