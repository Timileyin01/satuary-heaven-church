import React, { useCallback, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  KeyRound,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingDraft, BookingModal } from './components/BookingModal';
import { CheckInConsole } from './components/CheckInConsole';
import { EnquiryDraft, EnquiryModal } from './components/EnquiryModal';
import { GuestPortal } from './components/GuestPortal';
import { InventoryMatrix } from './components/InventoryMatrix';
import { MyBookingsView } from './components/MyBookingsView';
import { ProgrammesView } from './components/ProgrammesView';
import { RoomDetailsView } from './components/RoomDetailsView';
import { StaffLoginView } from './components/StaffLoginView';
import { TopBar } from './components/TopBar';
import {
  BUILDINGS,
  generateAll190Rooms,
  INITIAL_AUDIT_LOG,
  INITIAL_BOOKINGS,
  INITIAL_DESK_QUEUE,
  INITIAL_NOTIFICATIONS,
} from './data/sanctuaryData';
import {
  AppNotification,
  AuditEntry,
  BuildingSlug,
  DeskQueueItem,
  FeaturedSuite,
  GuestBooking,
  PrimaryTab,
  RoomRecord,
  RoomStatus,
  StaffSubTab,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<PrimaryTab>('explore');
  const [staffSubTab, setStaffSubTab] = useState<StaffSubTab>('operations');
  const [selectedSuite, setSelectedSuite] = useState<FeaturedSuite | null>(null);
  const [isMemberMode, setIsMemberMode] = useState(false);
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false);
  const [staffOfficer, setStaffOfficer] = useState('Sister Joy');

  const [rooms, setRooms] = useState<RoomRecord[]>(() => generateAll190Rooms());
  const [bookings, setBookings] = useState<GuestBooking[]>(INITIAL_BOOKINGS);
  const [deskQueue, setDeskQueue] = useState<DeskQueueItem[]>(INITIAL_DESK_QUEUE);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(INITIAL_AUDIT_LOG);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [matrixBuilding, setMatrixBuilding] = useState<'all' | BuildingSlug>('all');
  const [matrixStatus, setMatrixStatus] = useState<'all' | 'Booked' | RoomStatus>('all');
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null);
  const [enquiryDraft, setEnquiryDraft] = useState<EnquiryDraft | null>(null);
  const [blockRemainingOverrides, setBlockRemainingOverrides] = useState<Record<string, number>>({
    'block-shiloh-twin': 14,
    'block-ebenezer-quad': 6,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const addAudit = useCallback((action: string, target: string, actor = 'Sister Joy (Desk #1)') => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')} WAT`;
    setAuditLog((prev) => [
      { id: `aud-${Date.now()}`, timestamp, actor, action, target },
      ...prev,
    ]);
  }, []);

  const handleSelectTab = (tab: PrimaryTab) => {
    setActiveTab(tab);
    if (tab !== 'explore') {
      setSelectedSuite(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmBooking = (newBooking: GuestBooking) => {
    setBookings((prev) => [newBooking, ...prev]);

    // Sync corresponding room in 190-room inventory to Reserved
    setRooms((prev) => {
      const targetIdx = prev.findIndex(
        (r) =>
          r.buildingSlug === newBooking.buildingSlug &&
          (r.roomNumber === newBooking.roomNumber || r.status === 'Available')
      );
      if (targetIdx === -1) return prev;
      const updated = [...prev];
      updated[targetIdx] = {
        ...updated[targetIdx],
        status: 'Reserved',
        guestName: newBooking.guestName,
        bookingRef: newBooking.ref,
        stayPeriod: `${newBooking.checkInDate} – ${newBooking.checkOutDate}`,
        paymentStatus: newBooking.paymentMethod === 'Desk Hold (2h)' ? 'Pending' : 'Paid',
      };
      return updated;
    });

    // Push into Staff Desk Queue
    const initials = newBooking.guestName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('');
    setDeskQueue((prev) => [
      {
        id: `dq-${newBooking.id}`,
        initials: initials || 'SG',
        guestName: newBooking.guestName,
        roleSubtitle: newBooking.isMemberRate ? 'Parish Member Pass' : 'Sanctuary Guest',
        buildingName: newBooking.buildingName,
        roomLabel: `${newBooking.buildingName} · Rm ${newBooking.roomNumber}`,
        roomNumber: newBooking.roomNumber,
        bookingRef: newBooking.ref,
        statusBadge: 'Awaiting Check-in',
        paymentLabel: `${newBooking.paymentMethod} ₦${newBooking.totalAmount.toLocaleString()}`,
        paymentVerified: newBooking.paymentMethod !== 'Desk Hold (2h)',
        amount: newBooking.totalAmount,
        nightsLabel: `${newBooking.nights} Nights`,
        datesLabel: `${newBooking.checkInDate} – ${newBooking.checkOutDate}`,
        actionType: 'checkin',
      },
      ...prev,
    ]);

    addAudit(
      `New Reservation (${newBooking.paymentMethod})`,
      `${newBooking.guestName} · ${newBooking.buildingName} Rm ${newBooking.roomNumber}`,
      'Booking Portal'
    );
  };

  const handleCancelBooking = (id: string) => {
    const target = bookings.find((b) => b.id === id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b))
    );
    if (target) {
      showToast(`Reservation ${target.ref} cancelled.`);
      addAudit(`Cancelled Booking ${target.ref}`, `${target.buildingName} Rm ${target.roomNumber}`);
    }
  };

  const handleUpdateRoomStatus = (
    roomId: string,
    status: RoomStatus,
    guestName?: string
  ) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          status,
          guestName: guestName ?? r.guestName,
          stayPeriod:
            status === 'Available'
              ? 'Ready Now'
              : status === 'Turnover'
              ? 'Housekeeping Active'
              : status === 'Locked'
              ? 'Convention Block'
              : r.stayPeriod,
        };
      })
    );
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      addAudit(`Updated Room ${room.roomNumber} → ${status}`, room.buildingName);
      showToast(`${room.buildingName} Room ${room.roomNumber} marked ${status}.`);
    }
  };

  const handleBatchUpdateRooms = (roomIds: string[], status: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (!roomIds.includes(r.id)) return r;
        return {
          ...r,
          status,
          guestName:
            status === 'Available'
              ? 'Vacant & Sanitized'
              : status === 'Locked'
              ? 'Convention Delegation Hold'
              : r.guestName,
        };
      })
    );
    addAudit(`Batch Updated ${roomIds.length} Rooms → ${status}`, 'Inventory Matrix');
    showToast(`${roomIds.length} room(s) updated to ${status}.`);
  };

  const handleAddRoom = (newRoom: RoomRecord) => {
    setRooms((prev) => [newRoom, ...prev]);
    addAudit(`Commissioned Room ${newRoom.roomNumber}`, newRoom.buildingName);
    showToast(`Added ${newRoom.buildingName} Room ${newRoom.roomNumber} to inventory.`);
  };

  const handleDispatchHousekeeping = (
    assignments: { roomId: string; staffName: string }[],
    summaryLabel: string
  ) => {
    const map = new Map(assignments.map((a) => [a.roomId, a.staffName]));
    setRooms((prev) =>
      prev.map((r) => {
        const assignedStaff = map.get(r.id);
        if (!assignedStaff) return r;
        return {
          ...r,
          status: r.status === 'Available' ? 'Available' : 'Turnover',
          assignedStaff,
          stayPeriod: r.status === 'Available' ? r.stayPeriod : 'Housekeeping Dispatched',
          notes: `Automated departure turnover dispatched to ${assignedStaff}.`,
        };
      })
    );
    addAudit('Automated Housekeeping Dispatch', summaryLabel, staffOfficer);
    showToast(`Automated housekeeping dispatched: ${summaryLabel}`);
  };

  const handleCheckInQueueItem = (itemId: string) => {
    const target = deskQueue.find((d) => d.id === itemId);
    setDeskQueue((prev) =>
      prev.map((d) =>
        d.id === itemId
          ? {
              ...d,
              statusBadge: 'Checked In',
              actionType: 'folio',
              keyLabel: `Smart Key #${d.roomNumber || '104'} Active`,
            }
          : d
      )
    );
    if (target) {
      addAudit(`Issued Key & Checked In`, `${target.guestName} · ${target.roomLabel}`);
      showToast(`Keycard issued for ${target.guestName} (${target.roomLabel}).`);
    }
  };

  const handleApproveGroupItem = (itemId: string) => {
    setDeskQueue((prev) =>
      prev.map((d) =>
        d.id === itemId
          ? {
              ...d,
              statusBadge: 'Checked In',
              actionType: 'folio',
              keyLabel: '12 Delegation Keys Active',
            }
          : d
      )
    );
    addAudit('Approved 12-Room Delegation Block', 'Youth Conference Delegation · Shiloh');
    showToast('Youth Conference delegation approved! 12 rooms in Shiloh Pavilion allocated.');
  };

  const handleReleaseMaintenanceItem = (itemId: string) => {
    const item = deskQueue.find((d) => d.id === itemId);
    setDeskQueue((prev) =>
      prev.map((d) =>
        d.id === itemId ? { ...d, statusBadge: 'Checked In', paymentLabel: 'Released to Live Inventory' } : d
      )
    );
    if (item?.roomNumber) {
      setRooms((prev) =>
        prev.map((r) =>
          r.buildingName.includes('Moriah') && r.roomNumber === item.roomNumber
            ? { ...r, status: 'Available', guestName: 'Vacant & Sanitized' }
            : r
        )
      );
    }
    addAudit('Released Maintenance Hold', item?.roomLabel || 'Moriah Court Rm 106');
    showToast(`${item?.roomLabel || 'Room 106'} released to live available inventory.`);
  };

  const handleAddGroupBlock = (parishName: string, buildingSlug: BuildingSlug, count: number) => {
    const bld = BUILDINGS.find((b) => b.slug === buildingSlug) || BUILDINGS[4];
    let updatedCount = 0;
    setRooms((prev) =>
      prev.map((r) => {
        if (r.buildingSlug === buildingSlug && r.status === 'Available' && updatedCount < count) {
          updatedCount++;
          return {
            ...r,
            status: 'Reserved',
            guestName: parishName,
            stayPeriod: 'Group Block · 4 Nights',
          };
        }
        return r;
      })
    );
    addAudit(`Allocated ${count} Rooms`, `${parishName} · ${bld.name}`);
    showToast(`Reserved ${count} room block in ${bld.name} for ${parishName}.`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        staffSubTab={staffSubTab}
        onSelectStaffSubTab={(sub) => {
          setStaffSubTab(sub);
          setActiveTab('staff-ops');
        }}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
        }
        isMemberMode={isMemberMode}
        onToggleMemberMode={() => setIsMemberMode((v) => !v)}
        isStaffAuthenticated={isStaffAuthenticated}
        onStaffLogout={() => {
          setIsStaffAuthenticated(false);
          addAudit('Staff Portal Locked / Signed Out', 'Synod Desk #1', staffOfficer);
          showToast('Staff Operations portal locked.');
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium max-w-[92vw]"
        >
          <CheckCircle2 className="w-4 h-4 text-secondary-fixed shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 pt-16 md:pt-20 pb-20 md:pb-8">
        {activeTab === 'explore' && !selectedSuite && (
          <GuestPortal
            rooms={rooms}
            isMemberMode={isMemberMode}
            onToggleMemberMode={setIsMemberMode}
            onOpenSuiteDetails={(suite) => {
              setSelectedSuite(suite);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenBookingModal={(draft) => setBookingDraft(draft)}
            onOpenEnquiryModal={(draft) => setEnquiryDraft(draft)}
            onNavigateToEvents={() => handleSelectTab('events')}
          />
        )}

        {activeTab === 'explore' && selectedSuite && (
          <RoomDetailsView
            suite={selectedSuite}
            isMemberMode={isMemberMode}
            onToggleMemberMode={() => setIsMemberMode((v) => !v)}
            onBack={() => setSelectedSuite(null)}
            onReserve={(draft) => setBookingDraft(draft)}
            onOpenEnquiryModal={(draft) => setEnquiryDraft(draft)}
            onToast={showToast}
          />
        )}

        {activeTab === 'events' && (
          <ProgrammesView
            onBackToBrowse={() => handleSelectTab('explore')}
            onOpenBookingModal={(draft) => setBookingDraft(draft)}
            onOpenEnquiryModal={(draft) => setEnquiryDraft(draft)}
            onToast={showToast}
            blockRemainingOverrides={blockRemainingOverrides}
            onDecrementBlock={(blockId) =>
              setBlockRemainingOverrides((prev) => ({
                ...prev,
                [blockId]: Math.max(1, (prev[blockId] ?? 10) - 1),
              }))
            }
          />
        )}

        {activeTab === 'my-bookings' && (
          <MyBookingsView
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onBrowseRooms={() => handleSelectTab('explore')}
            onOpenStaffCheckin={() => {
              setStaffSubTab('checkin');
              handleSelectTab('staff-ops');
            }}
            onOpenEnquiryModal={(draft) => setEnquiryDraft(draft)}
          />
        )}

        {activeTab === 'staff-ops' && !isStaffAuthenticated && (
          <StaffLoginView
            intendedSubTabLabel={
              staffSubTab === 'inventory'
                ? '9 Buildings & 190 Rooms Matrix'
                : staffSubTab === 'checkin'
                ? 'Check-in & Key Console'
                : 'Operations Dashboard'
            }
            onLoginSuccess={(officerName) => {
              setStaffOfficer(officerName);
              setIsStaffAuthenticated(true);
              addAudit('Admin/Staff Portal Unlocked', 'Synod Operations Suite', officerName);
              showToast(`Welcome, ${officerName}. Staff Operations unlocked.`);
            }}
            onBackToGuest={() => handleSelectTab('explore')}
          />
        )}

        {activeTab === 'staff-ops' && isStaffAuthenticated && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6 pb-12 space-y-6">
            {/* Staff Operations Workspace Toolbar */}
            <div className="bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/25 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                {
                  id: 'operations' as StaffSubTab,
                  label: 'Operations Dashboard',
                  icon: LayoutDashboard,
                },
                {
                  id: 'inventory' as StaffSubTab,
                  label: `9 Buildings · ${rooms.length} Rooms Matrix`,
                  icon: Building2,
                },
                {
                  id: 'checkin' as StaffSubTab,
                  label: 'Check-in & Key Console',
                  icon: KeyRound,
                },
              ].map((sub) => {
                const Icon = sub.icon;
                const active = staffSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setStaffSubTab(sub.id)}
                    className={`flex-1 min-w-[165px] py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setIsStaffAuthenticated(false);
                  addAudit('Staff Portal Locked / Signed Out', 'Synod Desk #1', staffOfficer);
                  showToast('Signed out of Staff Operations.');
                }}
                title={`Signed in as ${staffOfficer} — Click to Lock`}
                className="py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface-variant transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Lock Desk</span>
              </button>
            </div>

            {staffSubTab === 'operations' && (
              <AdminDashboard
                rooms={rooms}
                deskQueue={deskQueue}
                onSwitchSubTab={(sub, bld, st) => {
                  if (bld) setMatrixBuilding(bld);
                  if (st) setMatrixStatus(st);
                  setStaffSubTab(sub);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onCheckInQueueItem={handleCheckInQueueItem}
                onApproveGroupItem={handleApproveGroupItem}
                onReleaseMaintenanceItem={handleReleaseMaintenanceItem}
                onAddGroupBlock={handleAddGroupBlock}
                onDispatchHousekeeping={handleDispatchHousekeeping}
                onMarkRoomReady={(roomId) =>
                  handleUpdateRoomStatus(roomId, 'Available', 'Vacant & Sanitized')
                }
                onToast={showToast}
              />
            )}

            {staffSubTab === 'inventory' && (
              <InventoryMatrix
                rooms={rooms}
                selectedBuilding={matrixBuilding}
                onSelectBuilding={setMatrixBuilding}
                statusFilter={matrixStatus}
                onSelectStatusFilter={setMatrixStatus}
                onUpdateRoomStatus={handleUpdateRoomStatus}
                onBatchUpdateRooms={handleBatchUpdateRooms}
                onAddRoom={handleAddRoom}
                onToast={showToast}
              />
            )}

            {staffSubTab === 'checkin' && (
              <CheckInConsole
                rooms={rooms}
                bookings={bookings}
                auditLog={auditLog}
                onCompletePastorCheckIn={() => handleCheckInQueueItem('dq-adebayo')}
                onCheckInGuest={(payload) => {
                  // Sync booking record if matched
                  setBookings((prev) =>
                    prev.map((b) =>
                      b.ref.toUpperCase() === payload.ref.toUpperCase()
                        ? { ...b, status: 'Checked In' }
                        : b
                    )
                  );
                  // Sync 190-room inventory
                  setRooms((prev) =>
                    prev.map((r) => {
                      const refMatch =
                        r.bookingRef &&
                        r.bookingRef.toUpperCase() === payload.ref.toUpperCase();
                      const roomMatch =
                        payload.roomNumber &&
                        r.roomNumber === payload.roomNumber &&
                        r.buildingName.toLowerCase().includes(payload.buildingName.toLowerCase().split(' ')[0]);
                      if (refMatch || roomMatch) {
                        return {
                          ...r,
                          status: 'Occupied',
                          guestName: payload.guestName,
                          bookingRef: payload.ref,
                          paymentStatus: 'Paid',
                        };
                      }
                      return r;
                    })
                  );
                  // Sync desk queue
                  setDeskQueue((prev) => {
                    const exists = prev.some(
                      (d) => d.bookingRef.toUpperCase() === payload.ref.toUpperCase()
                    );
                    if (exists) {
                      return prev.map((d) =>
                        d.bookingRef.toUpperCase() === payload.ref.toUpperCase()
                          ? {
                              ...d,
                              statusBadge: 'Checked In',
                              actionType: 'folio',
                              keyLabel: `Smart Key #${payload.keyNumber} Active`,
                            }
                          : d
                      );
                    }
                    const initials = payload.guestName
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((s) => s[0].toUpperCase())
                      .join('');
                    return [
                      {
                        id: `dq-qr-${Date.now()}`,
                        initials: initials || 'SG',
                        guestName: payload.guestName,
                        roleSubtitle: payload.roleSubtitle,
                        parish: payload.parish,
                        buildingName: payload.buildingName,
                        roomLabel: `${payload.buildingName} · Rm ${payload.roomNumber}`,
                        roomNumber: payload.roomNumber,
                        bookingRef: payload.ref,
                        statusBadge: 'Checked In',
                        paymentLabel: `${payload.paymentMethod} ₦${payload.totalAmount.toLocaleString()}`,
                        paymentVerified: true,
                        amount: payload.totalAmount,
                        nightsLabel: `${payload.nights} Nights`,
                        datesLabel: payload.stayDates,
                        keyLabel: `Smart Key #${payload.keyNumber} Active`,
                        actionType: 'folio',
                      },
                      ...prev,
                    ];
                  });
                }}
                onUpdateRoomStatus={handleUpdateRoomStatus}
                onAddAudit={(action, target) => addAudit(action, target)}
                onToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* Interactive Booking & Payment Sheet Modal */}
      <BookingModal
        draft={bookingDraft}
        onClose={() => setBookingDraft(null)}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* Interactive Email & WhatsApp Enquiry Modal */}
      <EnquiryModal
        draft={enquiryDraft}
        onClose={() => setEnquiryDraft(null)}
        onSubmitted={(ticketRef, summary) => {
          addAudit(`Enquiry Dispatched (${ticketRef})`, summary, 'Enquiry API');
          showToast(`Enquiry ${ticketRef} sent via Email & WhatsApp API.`);
        }}
      />
    </div>
  );
}
