import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  KeyRound,
  Layers,
  Lock,
  PieChart,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { BUILDINGS } from '../data/sanctuaryData';
import { BuildingSlug, RoomRecord, RoomStatus } from '../types';

interface InventoryMatrixProps {
  rooms: RoomRecord[];
  selectedBuilding: 'all' | BuildingSlug;
  onSelectBuilding: (b: 'all' | BuildingSlug) => void;
  statusFilter: 'all' | 'Booked' | RoomStatus;
  onSelectStatusFilter: (s: 'all' | 'Booked' | RoomStatus) => void;
  onUpdateRoomStatus: (roomId: string, status: RoomStatus, guestName?: string) => void;
  onBatchUpdateRooms: (roomIds: string[], status: RoomStatus) => void;
  onAddRoom: (room: RoomRecord) => void;
  onToast: (msg: string) => void;
}

export const InventoryMatrix: React.FC<InventoryMatrixProps> = ({
  rooms,
  selectedBuilding,
  onSelectBuilding,
  statusFilter,
  onSelectStatusFilter,
  onUpdateRoomStatus,
  onBatchUpdateRooms,
  onAddRoom,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [drawerRoomId, setDrawerRoomId] = useState<string | null>(null);
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({
    floor1: true,
    floor2: false,
    floor3: false,
  });
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomNum, setNewRoomNum] = useState('312');
  const [newRoomBuilding, setNewRoomBuilding] = useState<BuildingSlug>('bethel');
  const [newRoomType, setNewRoomType] = useState('Pastoral Guest Suite');
  const [walkInRoom, setWalkInRoom] = useState<RoomRecord | null>(null);
  const [walkInGuest, setWalkInGuest] = useState('');
  const [showFolioDrawer, setShowFolioDrawer] = useState(false);

  const counts = useMemo(() => {
    const map: Record<RoomStatus, number> = {
      Occupied: 0,
      Available: 0,
      Reserved: 0,
      Turnover: 0,
      Locked: 0,
    };
    rooms.forEach((r) => {
      map[r.status] = (map[r.status] || 0) + 1;
    });
    return map;
  }, [rooms]);

  const totalRooms = rooms.length;
  const avgOccupancy = Math.round(((counts.Occupied + counts.Reserved) / totalRooms) * 100);

  const drawerRoom = useMemo(
    () => rooms.find((r) => r.id === drawerRoomId) || null,
    [rooms, drawerRoomId]
  );

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rooms.filter((r) => {
      if (selectedBuilding !== 'all' && r.buildingSlug !== selectedBuilding) return false;
      if (statusFilter === 'Booked') {
        if (r.status !== 'Occupied' && r.status !== 'Reserved' && r.status !== 'Locked') return false;
      } else if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }
      if (q) {
        const hay = `${r.roomNumber} ${r.guestName} ${r.buildingName} ${r.bookingRef || ''} ${r.roomType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rooms, selectedBuilding, statusFilter, searchQuery]);

  const activeBuildingInfo = useMemo(() => {
    if (selectedBuilding === 'all') return BUILDINGS[0]; // BLD-01 Bethel spotlight
    return BUILDINGS.find((b) => b.slug === selectedBuilding) || BUILDINGS[0];
  }, [selectedBuilding]);

  const spotlightRooms = useMemo(() => {
    if (selectedBuilding === 'all' && statusFilter === 'all' && !searchQuery.trim()) {
      return rooms.filter((r) => r.buildingId === 'BLD-01');
    }
    return filteredRooms;
  }, [rooms, selectedBuilding, statusFilter, searchQuery, filteredRooms]);

  const shilohRooms = useMemo(
    () => rooms.filter((r) => r.buildingId === 'BLD-04').slice(0, 12),
    [rooms]
  );

  const toggleBatchSelect = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const applyBatch = (status: RoomStatus) => {
    if (selectedRoomIds.length === 0) return;
    onBatchUpdateRooms(selectedRoomIds, status);
    setSelectedRoomIds([]);
    setBatchMode(false);
  };

  const handleCreateRoom = () => {
    const bld = BUILDINGS.find((b) => b.slug === newRoomBuilding) || BUILDINGS[0];
    const room: RoomRecord = {
      id: `${bld.id}-${newRoomNum}-${Date.now()}`,
      buildingId: bld.id,
      buildingSlug: bld.slug,
      buildingName: bld.name,
      roomNumber: newRoomNum.trim() || '312',
      floor: 3,
      roomType: newRoomType.trim() || 'Pastoral Guest Suite',
      status: 'Available',
      guestName: 'Vacant & Sanitized',
      keyId: `Master Box #${newRoomNum}`,
      stayPeriod: 'Immediate',
      ratePerNight: bld.standardRate,
      memberRate: Math.round(bld.standardRate * 0.85),
      notes: 'Newly commissioned suite ready for parish lodging.',
      paymentStatus: 'N/A',
    };
    onAddRoom(room);
    setShowAddRoomModal(false);
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Occupied':
        return 'bg-primary-container text-primary-fixed';
      case 'Available':
        return 'bg-[#ebf7ee] text-[#1c6934]';
      case 'Reserved':
        return 'bg-secondary-fixed text-on-secondary-fixed-variant';
      case 'Turnover':
        return 'bg-error-container text-on-error-container';
      case 'Locked':
        return 'bg-surface-container-highest text-on-surface-variant';
    }
  };

  const getRoomNumberTileStyle = (status: RoomStatus) => {
    switch (status) {
      case 'Occupied':
        return 'bg-primary-container text-on-primary';
      case 'Available':
        return 'bg-[#34784a] text-on-primary';
      case 'Reserved':
        return 'bg-secondary-container text-on-secondary-container';
      case 'Turnover':
        return 'bg-error-container text-on-error-container';
      case 'Locked':
        return 'bg-outline text-on-primary';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Operational Banner & Stats Overview */}
      <section className="rounded-2xl bg-surface-container-low p-4 md:p-6 space-y-4 border border-outline-variant/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif-display text-2xl md:text-3xl text-primary font-medium">
                Room Inventory Matrix
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-xs font-bold tabular-nums">
                Live {totalRooms}
              </span>
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant mt-0.5 tabular-nums">
              {BUILDINGS.length} Buildings · 3 Conventions · {counts.Turnover} Pending Turnovers
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setBatchMode((b) => !b);
                setSelectedRoomIds([]);
              }}
              className={`h-10 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                batchMode
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'bg-surface-container-lowest text-primary hover:bg-surface-container shadow-xs'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>{batchMode ? `Batch (${selectedRoomIds.length})` : 'Batch'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddRoomModal(true)}
              className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Room</span>
            </button>
          </div>
        </div>

        {/* Batch Action Toolbar */}
        {batchMode && (
          <div className="p-3 rounded-xl bg-primary text-on-primary flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium tabular-nums">
              {selectedRoomIds.length} room(s) selected — click rooms below to toggle selection
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyBatch('Available')}
                className="px-3 py-1.5 rounded-lg bg-[#34784a] text-white font-semibold cursor-pointer"
              >
                Mark Available
              </button>
              <button
                type="button"
                onClick={() => applyBatch('Turnover')}
                className="px-3 py-1.5 rounded-lg bg-error text-white font-semibold cursor-pointer"
              >
                Mark Turnover
              </button>
              <button
                type="button"
                onClick={() => applyBatch('Locked')}
                className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-semibold cursor-pointer"
              >
                Event Lock
              </button>
            </div>
          </div>
        )}

        {/* Quick Search Bar */}
        <div className="flex items-center rounded-xl bg-surface-container-lowest px-3.5 py-2.5 shadow-xs border border-outline-variant/25 gap-2.5">
          <Search className="w-4 h-4 text-outline shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search room (e.g. 104, 201), guest name, or lodge..."
            className="w-full bg-transparent text-sm text-primary placeholder:text-outline focus:outline-none"
          />
          {(searchQuery || statusFilter !== 'all' || selectedBuilding !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSelectStatusFilter('all');
                onSelectBuilding('all');
              }}
              className="text-xs font-semibold text-secondary hover:underline shrink-0 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Real-time Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectStatusFilter('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer tabular-nums ${
              statusFilter === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            All ({totalRooms})
          </button>

          <button
            type="button"
            onClick={() => onSelectStatusFilter(statusFilter === 'Booked' ? 'all' : 'Booked')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-2 transition-colors cursor-pointer tabular-nums ${
              statusFilter === 'Booked'
                ? 'bg-primary-container text-on-primary shadow-xs'
                : 'bg-surface-container-lowest text-primary hover:bg-surface-container shadow-xs'
            }`}
          >
            <span>Already Booked</span>
            <span className="font-bold">{counts.Occupied + counts.Reserved + counts.Locked}</span>
          </button>

          {(
            [
              { status: 'Available' as RoomStatus, count: counts.Available, label: 'Available' },
              { status: 'Occupied' as RoomStatus, count: counts.Occupied, label: 'Occupied' },
              { status: 'Reserved' as RoomStatus, count: counts.Reserved, label: 'Reserved' },
              { status: 'Turnover' as RoomStatus, count: counts.Turnover, label: 'Turnover' },
              { status: 'Locked' as RoomStatus, count: counts.Locked, label: 'Locked' },
            ] as const
          ).map((item) => {
            const active = statusFilter === item.status;
            return (
              <button
                key={item.status}
                type="button"
                onClick={() => onSelectStatusFilter(active ? 'all' : item.status)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-2 transition-colors cursor-pointer tabular-nums ${
                  active
                    ? 'bg-primary-container text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-primary hover:bg-surface-container shadow-xs'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-bold">{item.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Buildings Horizontal Navigation Slider */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase tracking-wider text-secondary font-semibold">
            Parish & Diocesan Lodges ({BUILDINGS.length})
          </span>
          <span className="text-on-surface-variant tabular-nums">
            Avg Occupancy: <strong className="text-primary">{avgOccupancy}%</strong>
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectBuilding('all')}
            className={`flex flex-col items-start px-3.5 py-2.5 rounded-xl shrink-0 min-w-[132px] shadow-xs transition-all text-left cursor-pointer border ${
              selectedBuilding === 'all'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-lowest text-on-surface border-outline-variant/25 hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center justify-between w-full text-[11px] opacity-85">
              <span>ALL LODGES</span>
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold mt-1 tabular-nums">{totalRooms} Rooms</span>
            <span
              className={`text-[11px] mt-0.5 tabular-nums ${
                selectedBuilding === 'all' ? 'text-primary-fixed' : 'text-secondary font-semibold'
              }`}
            >
              {counts.Available} Free
            </span>
          </button>

          {BUILDINGS.map((b) => {
            const bRooms = rooms.filter((r) => r.buildingId === b.id);
            const occ = bRooms.filter((r) => r.status === 'Occupied' || r.status === 'Reserved').length;
            const pct = Math.round((occ / bRooms.length) * 100);
            const active = selectedBuilding === b.slug;

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBuilding(b.slug)}
                className={`flex flex-col items-start px-3.5 py-2.5 rounded-xl shrink-0 min-w-[144px] shadow-xs transition-all text-left cursor-pointer border ${
                  active
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface border-outline-variant/25 hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      active ? 'text-secondary-fixed' : 'text-secondary'
                    }`}
                  >
                    {b.id}
                  </span>
                  <span
                    className={`text-[11px] font-bold tabular-nums ${
                      active ? 'text-primary-fixed' : 'text-primary'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
                <span className="text-sm font-semibold mt-1 truncate w-full">{b.shortName}</span>
                <span
                  className={`text-[11px] mt-0.5 tabular-nums ${
                    active ? 'text-on-primary/80' : 'text-on-surface-variant'
                  }`}
                >
                  {occ}/{bRooms.length} Occ.
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Campus Lodging Allocation Stacked Distribution Bar */}
      <section className="bg-surface-container-low rounded-2xl p-4 shadow-xs border border-outline-variant/25 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-primary flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-secondary" />
            Campus Lodging Allocation ({totalRooms})
          </span>
          <span className="text-on-surface-variant tabular-nums">Check-outs Today: 14</span>
        </div>

        <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden flex">
          <div
            className="h-full bg-primary-container transition-all"
            style={{ width: `${(counts.Occupied / totalRooms) * 100}%` }}
            title={`Occupied (${counts.Occupied})`}
          />
          <div
            className="h-full bg-[#447f57] transition-all"
            style={{ width: `${(counts.Available / totalRooms) * 100}%` }}
            title={`Available (${counts.Available})`}
          />
          <div
            className="h-full bg-secondary transition-all"
            style={{ width: `${(counts.Reserved / totalRooms) * 100}%` }}
            title={`Reserved (${counts.Reserved})`}
          />
          <div
            className="h-full bg-error transition-all"
            style={{ width: `${(counts.Turnover / totalRooms) * 100}%` }}
            title={`Maintenance / Turnover (${counts.Turnover})`}
          />
          <div
            className="h-full bg-outline transition-all"
            style={{ width: `${(counts.Locked / totalRooms) * 100}%` }}
            title={`Locked (${counts.Locked})`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-on-surface-variant tabular-nums">
          <span>{Math.round((counts.Occupied / totalRooms) * 100)}% In-House ({counts.Occupied})</span>
          <span>{Math.round((counts.Available / totalRooms) * 100)}% Vacant ({counts.Available})</span>
          <span>{Math.round((counts.Reserved / totalRooms) * 100)}% Due ({counts.Reserved})</span>
          <span>{Math.round((counts.Turnover / totalRooms) * 100)}% Turnover ({counts.Turnover})</span>
          <span>{counts.Locked} Event Locked</span>
        </div>
      </section>

      {/* Main Matrix Grid + Shiloh Quick Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Building Spotlight / Filtered Room List */}
        <div className="lg:col-span-8 space-y-4">
          {selectedBuilding === 'all' && statusFilter === 'all' && !searchQuery.trim() ? (
            <>
              {/* Bethel House Spotlight Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/25 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed text-xs font-mono font-bold">
                        {activeBuildingInfo.id}
                      </span>
                      <h2 className="font-serif-display text-xl font-semibold text-primary">
                        {activeBuildingInfo.name}
                      </h2>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {activeBuildingInfo.wingDescription} · 3 Floors · {spotlightRooms.length} Suites Total
                    </p>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-base font-bold text-primary block">
                      {spotlightRooms.filter((r) => r.status === 'Occupied').length}/{spotlightRooms.length}
                    </span>
                    <span className="text-xs font-semibold text-secondary">
                      {Math.round(
                        (spotlightRooms.filter((r) => r.status === 'Occupied' || r.status === 'Reserved').length /
                          spotlightRooms.length) *
                          100
                      )}
                      % Filled
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container text-xs text-on-surface-variant tabular-nums">
                  <div className="flex items-center gap-3">
                    <span>{spotlightRooms.filter((r) => r.status === 'Available').length} Available</span>
                    <span>{spotlightRooms.filter((r) => r.status === 'Turnover').length} Turnover</span>
                    <span>{spotlightRooms.filter((r) => r.status === 'Reserved').length} Reserved</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectBuilding('bethel')}
                    className="text-secondary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Building View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Floor 1 Ground Pastoral Wing */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-secondary" />
                    Floor 1 — Ground Pastoral Wing (6 Suites)
                  </span>
                  <span className="text-on-surface-variant">Elevator Access / East Cloister</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {spotlightRooms
                    .filter((r) => r.floor === 1)
                    .map((room) => {
                      const isSelected = selectedRoomIds.includes(room.id);
                      return (
                        <div
                          key={room.id}
                          onClick={() => {
                            if (batchMode) toggleBatchSelect(room.id);
                            else setDrawerRoomId(room.id);
                          }}
                          className={`bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                            isSelected
                              ? 'border-secondary ring-2 ring-secondary/30'
                              : 'border-outline-variant/25 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold shrink-0 ${getRoomNumberTileStyle(
                                  room.status
                                )}`}
                              >
                                <span className="text-[9px] uppercase opacity-80 leading-none">RM</span>
                                <span className="text-sm leading-none mt-0.5 tabular-nums">
                                  {room.roomNumber}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-semibold text-primary truncate">
                                    {room.guestName}
                                  </span>
                                  {room.badgeTag && (
                                    <span className="text-[10px] font-bold text-secondary bg-surface-container px-1.5 py-0.5 rounded">
                                      {room.badgeTag}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-on-surface-variant block truncate">
                                  {room.bookingRef ? `Ref: ${room.bookingRef} · ` : ''}
                                  {room.roomType}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${getStatusBadge(
                                room.status
                              )}`}
                            >
                              {room.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-container">
                            <span className="text-on-surface-variant flex items-center gap-1 truncate">
                              <KeyRound className="w-3.5 h-3.5 text-secondary shrink-0" />
                              <span className="truncate">{room.keyId}</span>
                            </span>
                            {room.status === 'Available' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWalkInRoom(room);
                                  setWalkInGuest('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-secondary text-on-secondary text-[11px] font-semibold cursor-pointer shrink-0"
                              >
                                Assign Walk-in
                              </button>
                            ) : room.status === 'Turnover' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateRoomStatus(room.id, 'Available', 'Vacant & Sanitized');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-[11px] font-semibold cursor-pointer shrink-0"
                              >
                                Inspect & Release
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-primary shrink-0">
                                {room.stayPeriod}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Floors 2 & 3 Expandable Drawers */}
              <div className="space-y-2.5">
                {[
                  {
                    key: 'floor2',
                    floor: 2,
                    title: 'Floor 2 — Visiting Bishops Wing',
                    subtitle: `${spotlightRooms.filter((r) => r.floor === 2).length} Rooms`,
                  },
                  {
                    key: 'floor3',
                    floor: 3,
                    title: 'Floor 3 — Contemplative Hermitage',
                    subtitle: `${spotlightRooms.filter((r) => r.floor === 3).length} Rooms`,
                  },
                ].map((fl) => {
                  const flRooms = spotlightRooms.filter((r) => r.floor === fl.floor);
                  const open = expandedFloors[fl.key];
                  return (
                    <div key={fl.key} className="rounded-xl bg-surface-container-low overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedFloors((prev) => ({ ...prev, [fl.key]: !prev[fl.key] }))
                        }
                        className="w-full p-3.5 flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-primary" />
                          <div>
                            <span className="text-sm font-semibold text-primary block">
                              {fl.title}
                            </span>
                            <span className="text-xs text-on-surface-variant tabular-nums">
                              {fl.subtitle} · {flRooms.filter((r) => r.status === 'Occupied').length} Occupied
                            </span>
                          </div>
                        </div>
                        {open ? (
                          <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                        )}
                      </button>

                      {open && (
                        <div className="p-3.5 pt-1 grid grid-cols-4 sm:grid-cols-5 gap-2">
                          {flRooms.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setDrawerRoomId(r.id)}
                              className={`py-2 px-2 rounded-lg text-xs font-bold tabular-nums cursor-pointer transition-transform active:scale-95 ${getRoomNumberTileStyle(
                                r.status
                              )}`}
                            >
                              {r.roomNumber}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Filtered / Specific Building Matrix View */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif-display text-xl font-semibold text-primary">
                  {selectedBuilding === 'all'
                    ? `Filtered Rooms (${filteredRooms.length})`
                    : `${activeBuildingInfo.name} (${filteredRooms.length} Rooms)`}
                </h2>
                <span className="text-xs text-on-surface-variant">
                  Tap any room to manage status or assign guest
                </span>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="p-8 rounded-2xl bg-surface-container-low text-center space-y-2">
                  <p className="text-sm font-semibold text-primary">No rooms match this filter</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      onSelectStatusFilter('all');
                      onSelectBuilding('all');
                    }}
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold cursor-pointer"
                  >
                    Reset Matrix Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredRooms.map((room) => {
                    const isSelected = selectedRoomIds.includes(room.id);
                    return (
                      <div
                        key={room.id}
                        onClick={() => {
                          if (batchMode) toggleBatchSelect(room.id);
                          else setDrawerRoomId(room.id);
                        }}
                        className={`bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'border-secondary ring-2 ring-secondary/30'
                            : 'border-outline-variant/25 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold shrink-0 ${getRoomNumberTileStyle(
                                room.status
                              )}`}
                            >
                              <span className="text-[9px] uppercase opacity-80 leading-none">
                                {room.buildingId.slice(-2)}
                              </span>
                              <span className="text-sm leading-none mt-0.5 tabular-nums">
                                {room.roomNumber}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-primary block truncate">
                                {room.guestName}
                              </span>
                              <span className="text-xs text-on-surface-variant block truncate">
                                {room.buildingName} · Floor {room.floor}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${getStatusBadge(
                              room.status
                            )}`}
                          >
                            {room.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-surface-container text-on-surface-variant">
                          <span className="truncate">{room.keyId}</span>
                          <span className="font-semibold text-primary shrink-0 tabular-nums">
                            ₦{room.ratePerNight.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Shiloh Pavilion High-Density Matrix + Housekeeping Dispatch */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-outline-variant/25 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[11px] font-mono font-bold">
                    BLD-04
                  </span>
                  <h3 className="font-serif-display text-lg font-semibold text-primary">
                    Shiloh Pavilion
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Convention Block · 26 Rooms
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectBuilding('shiloh')}
                className="text-xs font-semibold text-secondary hover:underline cursor-pointer shrink-0"
              >
                Inspect All
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-1.5 text-center text-xs">
              {shilohRooms.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setDrawerRoomId(r.id)}
                  className={`py-2 rounded-lg font-semibold tabular-nums cursor-pointer transition-transform active:scale-95 ${getRoomNumberTileStyle(
                    r.status
                  )}`}
                >
                  {r.roomNumber}
                  {r.status === 'Available' ? '*' : ''}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-on-surface-variant text-center">
              * Green rooms available for Diocesan Youth Delegates tonight
            </p>
          </div>

          {/* Evening Housekeeping Run Card */}
          <div className="bg-primary text-on-primary rounded-2xl p-4 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary-fixed shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-semibold block truncate">
                  Evening Housekeeping Run
                </span>
                <span className="text-xs text-primary-fixed-dim block tabular-nums">
                  {counts.Turnover} turnovers active · Shift 2
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onToast(
                  `Housekeeping dispatch sent to Estate Team for ${counts.Turnover} turnover rooms.`
                )
              }
              className="h-9 px-3.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold shrink-0 cursor-pointer"
            >
              Dispatch
            </button>
          </div>
        </div>
      </section>

      {/* Slide-Over Room Detail Drawer */}
      {drawerRoom && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
          onClick={() => {
            setDrawerRoomId(null);
            setShowFolioDrawer(false);
          }}
        >
          <div
            className="w-full max-w-md bg-surface h-full shadow-2xl p-5 flex flex-col gap-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center font-bold">
                  <span className="text-[9px] uppercase opacity-80">ROOM</span>
                  <span className="text-base tabular-nums">{drawerRoom.roomNumber}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-primary">{drawerRoom.roomType}</h3>
                  <p className="text-xs font-semibold text-secondary">
                    {drawerRoom.buildingName} ({drawerRoom.buildingId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDrawerRoomId(null);
                  setShowFolioDrawer(false);
                }}
                className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs space-y-3 border border-outline-variant/25">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Occupant Manifest
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getStatusBadge(drawerRoom.status)}`}>
                  {drawerRoom.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
                  {drawerRoom.guestName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{drawerRoom.guestName}</p>
                  <p className="text-xs text-on-surface-variant">{drawerRoom.stayPeriod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-container text-xs">
                <div>
                  <span className="text-on-surface-variant block">Access Key</span>
                  <span className="font-semibold text-primary">{drawerRoom.keyId}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Billing Rate</span>
                  <span className="font-semibold text-primary tabular-nums">
                    ₦{drawerRoom.ratePerNight.toLocaleString()} / Night
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                Hostel Notes & Dietary
              </span>
              <p className="text-xs text-on-surface leading-relaxed">{drawerRoom.notes}</p>
            </div>

            {showFolioDrawer && (
              <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-secondary/30 text-xs space-y-1.5">
                <p className="font-semibold text-primary">Guest Ledger Summary</p>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Booking Ref</span>
                  <span className="font-mono font-semibold text-primary">
                    {drawerRoom.bookingRef || 'Walk-In / Ready'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Settlement</span>
                  <span className="font-semibold text-secondary">{drawerRoom.paymentStatus}</span>
                </div>
              </div>
            )}

            <div className="mt-auto pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next: RoomStatus =
                      drawerRoom.status === 'Available'
                        ? 'Occupied'
                        : drawerRoom.status === 'Occupied'
                        ? 'Turnover'
                        : 'Available';
                    onUpdateRoomStatus(
                      drawerRoom.id,
                      next,
                      next === 'Available' ? 'Vacant & Sanitized' : drawerRoom.guestName
                    );
                  }}
                  className="h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Cycle State</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateRoomStatus(drawerRoom.id, 'Locked', 'Convention Delegation Hold')
                  }
                  className="h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Event Lock</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onUpdateRoomStatus(drawerRoom.id, 'Turnover', 'Priority Housekeeping');
                }}
                className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Request Priority Housekeeping</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFolioDrawer((v) => !v)}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>{showFolioDrawer ? 'Hide Guest Folio' : 'View Guest Folio & Ledger'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Walk-in Modal */}
      {walkInRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
          onClick={() => setWalkInRoom(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-lg font-semibold text-primary">
                Assign Walk-in · Room {walkInRoom.roomNumber}
              </h3>
              <button
                type="button"
                onClick={() => setWalkInRoom(null)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Guest / Minister Name
              </label>
              <input
                type="text"
                value={walkInGuest}
                onChange={(e) => setWalkInGuest(e.target.value)}
                placeholder="e.g. Pastor Gabriel Okafor"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onUpdateRoomStatus(
                  walkInRoom.id,
                  'Occupied',
                  walkInGuest.trim() || 'Walk-in Pilgrim'
                );
                setWalkInRoom(null);
              }}
              className="w-full h-10 rounded-xl bg-primary text-on-primary text-xs font-semibold cursor-pointer"
            >
              Confirm Walk-in & Issue Key
            </button>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm"
          onClick={() => setShowAddRoomModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-lg font-semibold text-primary">
                Commission Room to Matrix
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">Building</label>
                <select
                  value={newRoomBuilding}
                  onChange={(e) => setNewRoomBuilding(e.target.value as BuildingSlug)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none"
                >
                  {BUILDINGS.map((b) => (
                    <option key={b.id} value={b.slug}>
                      {b.id} · {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">Room Number</label>
                <input
                  type="text"
                  value={newRoomNum}
                  onChange={(e) => setNewRoomNum(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm font-mono text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">Suite Category</label>
                <input
                  type="text"
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCreateRoom}
              className="w-full h-10 rounded-xl bg-primary text-on-primary text-xs font-semibold cursor-pointer"
            >
              Add Room to Live Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
