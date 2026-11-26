import React, { useState } from 'react';
import {
  BedDouble,
  Bell,
  BookOpenCheck,
  Check,
  Church,
  ShieldCheck,
  SlidersHorizontal,
  User,
  X,
} from 'lucide-react';
import { IMAGES } from '../data/sanctuaryData';
import { AppNotification, PrimaryTab, StaffSubTab } from '../types';

interface TopBarProps {
  activeTab: PrimaryTab;
  onSelectTab: (tab: PrimaryTab) => void;
  staffSubTab: StaffSubTab;
  onSelectStaffSubTab: (sub: StaffSubTab) => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  isMemberMode: boolean;
  onToggleMemberMode: () => void;
  isStaffAuthenticated: boolean;
  onStaffLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  staffSubTab,
  onSelectStaffSubTab,
  notifications,
  onMarkAllRead,
  isMemberMode,
  onToggleMemberMode,
  isStaffAuthenticated,
  onStaffLogout,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const isStaffActive = activeTab === 'staff-ops';

  const handleModeSwitch = () => {
    if (isStaffActive) {
      onSelectTab('explore');
    } else {
      onSelectTab('staff-ops');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 pt-safe">
        <div className="max-w-7xl mx-auto h-16 md:h-20 px-4 md:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Mark (single-line wordmark) */}
          <button
            type="button"
            onClick={() => onSelectTab('explore')}
            className="flex items-center gap-3 text-left shrink-0 focus-visible:outline-2 focus-visible:outline-primary rounded-lg py-1"
          >
            <img
              src={IMAGES.logo}
              alt="Sanctuary Haven Emblem"
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-lg object-cover border border-outline-variant/40 shrink-0"
            />
            <span className="font-serif-display text-xl md:text-2xl font-semibold text-primary tracking-tight whitespace-nowrap shrink-0">
              Sanctuary Haven
            </span>
          </button>

          {/* Zone 2: Clean Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary Navigation">
            {[
              { id: 'explore' as PrimaryTab, label: 'Explore' },
              { id: 'events' as PrimaryTab, label: 'Events' },
              { id: 'my-bookings' as PrimaryTab, label: 'Bookings' },
              { id: 'staff-ops' as PrimaryTab, label: 'Staff Ops' },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Mode Action + Functional Utilities */}
          <div className="flex items-center gap-2 shrink-0 relative">
            <button
              type="button"
              onClick={handleModeSwitch}
              className="h-10 px-3.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-2 hover:bg-primary transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-secondary-fixed" />
              <span>
                {isStaffActive ? 'Guest View' : isStaffAuthenticated ? 'Staff Ops' : 'Staff Login'}
              </span>
            </button>

            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifs((v) => !v);
                setShowProfile(false);
              }}
              className="w-10 h-10 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary" />
              )}
            </button>

            <button
              type="button"
              aria-label="Parishioner & Role Profile"
              onClick={() => {
                setShowProfile((v) => !v);
                setShowNotifs(false);
              }}
              className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Notifications Popover */}
            {showNotifs && (
              <div className="absolute right-0 top-13 w-80 sm:w-96 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                  <span className="text-sm font-semibold text-primary">Parish Hospitality Alerts</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNotifs(false)}
                      className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-surface-container max-h-72 overflow-y-auto mt-1">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        if (n.targetTab) onSelectTab(n.targetTab);
                        setShowNotifs(false);
                      }}
                      className="w-full text-left py-3 hover:bg-surface-container-low/60 px-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-primary">{n.title}</span>
                        <span className="text-[11px] text-on-surface-variant tabular-nums shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{n.detail}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Profile & Role Popover */}
            {showProfile && (
              <div className="absolute right-0 top-13 w-72 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                  <div>
                    <p className="text-sm font-semibold text-primary">Diocesan Hospitality Pass</p>
                    <p className="text-xs text-on-surface-variant">Lagos Sanctuary Complex</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProfile(false)}
                    className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="py-3 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMemberMode();
                      setShowProfile(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-medium text-primary cursor-pointer"
                  >
                    <span>Church Member Rate (15% Off)</span>
                    <span className={`px-2 py-0.5 rounded-md font-semibold ${isMemberMode ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                      {isMemberMode ? 'Active' : 'Off'}
                    </span>
                  </button>
                  <div className="pt-1 space-y-1">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                        Staff Operations Screens
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          isStaffAuthenticated ? 'text-primary' : 'text-secondary'
                        }`}
                      >
                        {isStaffAuthenticated ? 'Unlocked' : 'Login Req.'}
                      </span>
                    </div>
                    {[
                      { id: 'operations' as StaffSubTab, label: 'Operations Dashboard' },
                      { id: 'inventory' as StaffSubTab, label: '9 Buildings • 190 Rooms Matrix' },
                      { id: 'checkin' as StaffSubTab, label: 'Front Desk & Key Console' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          onSelectStaffSubTab(s.id);
                          onSelectTab('staff-ops');
                          setShowProfile(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-xs text-primary cursor-pointer"
                      >
                        <span>{s.label}</span>
                        {activeTab === 'staff-ops' && staffSubTab === s.id && (
                          <Check className="w-3.5 h-3.5 text-secondary" />
                        )}
                      </button>
                    ))}
                    {isStaffAuthenticated && (
                      <button
                        type="button"
                        onClick={() => {
                          onStaffLogout();
                          setShowProfile(false);
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-error-container/60 hover:bg-error-container text-on-error-container text-xs font-semibold text-left cursor-pointer"
                      >
                        Lock / Sign Out Staff Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Thumb Zone) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-2px_12px_rgba(23,56,41,0.06)]"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-4 items-center h-16 px-1">
          {[
            { id: 'explore' as PrimaryTab, label: 'Explore', icon: BedDouble },
            { id: 'events' as PrimaryTab, label: 'Events', icon: Church },
            { id: 'my-bookings' as PrimaryTab, label: 'Bookings', icon: BookOpenCheck },
            { id: 'staff-ops' as PrimaryTab, label: 'Staff Ops', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors cursor-pointer ${
                  active ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-on-surface-variant'}`} />
                <span className="text-[11px] mt-0.5 whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
