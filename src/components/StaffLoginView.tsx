import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { IMAGES } from '../data/sanctuaryData';

interface StaffLoginViewProps {
  intendedSubTabLabel: string;
  onLoginSuccess: (staffName: string) => void;
  onBackToGuest: () => void;
}

const STAFF_ROLES = [
  'Sister Joy — Front Office Admin (Desk #1)',
  'Bro. Emmanuel — Night Duty & Key Warden',
  'Sister Grace — Diocesan Hospitality Manager',
  'Synod Operations Supervisor',
];

export const StaffLoginView: React.FC<StaffLoginViewProps> = ({
  intendedSubTabLabel,
  onLoginSuccess,
  onBackToGuest,
}) => {
  const [selectedStaff, setSelectedStaff] = useState(STAFF_ROLES[0]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '12345678') {
      setError(null);
      const shortName = selectedStaff.split('—')[0].trim();
      onLoginSuccess(shortName);
    } else {
      setError('Invalid staff password. Please verify your Desk #1 credentials and try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-6 md:pt-12 pb-16">
      <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/35 space-y-6">
        {/* Header Identity */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm relative">
            <img
              src={IMAGES.logo}
              alt="Sanctuary Haven"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shadow-xs border-2 border-surface-container-lowest">
              <Lock className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorized Staff Only</span>
            </div>
            <h1 className="font-serif-display text-2xl md:text-3xl font-semibold text-primary">
              Staff & Admin Sign In
            </h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Sign in to access <strong className="text-primary">{intendedSubTabLabel}</strong> and
              manage Sanctuary Haven&apos;s 9 buildings &amp; 190-room inventory.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="staff-role-select"
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-secondary" />
              <span>Duty Officer / Role</span>
            </label>
            <select
              id="staff-role-select"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/35 text-xs font-medium text-primary focus:outline-none focus:border-primary"
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="staff-password-input"
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-secondary" />
              <span>Admin / Staff Password</span>
            </label>
            <div className="relative">
              <input
                id="staff-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter staff password"
                autoComplete="current-password"
                autoFocus
                required
                className={`w-full h-11 pl-3.5 pr-11 rounded-xl bg-surface-container-low border text-sm text-primary placeholder:text-outline focus:outline-none transition-colors ${
                  error
                    ? 'border-error focus:border-error'
                    : 'border-outline-variant/35 focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4 text-secondary-fixed" />
            <span>Unlock Admin &amp; Staff Dashboard</span>
          </button>
        </form>

        <div className="pt-3 border-t border-outline-variant/25 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={onBackToGuest}
            className="inline-flex items-center gap-1.5 font-semibold text-on-surface-variant hover:text-primary cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Guest Portal</span>
          </button>
          <span className="text-[11px] text-on-surface-variant">Synod Desk #1 Security</span>
        </div>
      </div>
    </div>
  );
};
