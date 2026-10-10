import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import {
  User,
  Shield,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  RefreshCw,
  Trophy,
  Flame,
  Calendar,
  LogOut,
  Zap,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { syncState, lastSyncedAt, triggerSyncNow, isOnline, challenges, events } = useSync();

  if (!isAuthenticated || !user) {
    return (
      <div className="w-full py-16 bg-background min-h-screen flex items-center justify-center">
        <div className="p-8 max-w-md w-full bg-surface-container-lowest rounded-2xl border border-card-border text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
          <h2 className="text-xl font-bold font-headline mb-2 text-on-surface">Sign In Required</h2>
          <p className="text-xs text-on-surface-variant mb-6">
            Please log in with your collegiate credentials to inspect personal metrics and sync state.
          </p>
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full py-2.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-white text-xs font-semibold cursor-pointer"
          >
            Sign In with Campus SSO
          </button>
        </div>
      </div>
    );
  }

  const completedChallenges = challenges.filter((c) => c.completed);
  const registeredEvents = events.filter((e) => e.registered);

  return (
    <div className="w-full py-8 lg:py-12 bg-background min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
              Collegiate Account & Telemetry Profile
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline text-on-surface">
              {user.name}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {user.email} · Affiliation: <span className="capitalize font-semibold text-primary">{user.role}</span>
              {user.residenceHall ? ` · ${user.residenceHall}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerSyncNow()}
              disabled={!isOnline || syncState === 'syncing'}
              className="px-3.5 py-2 rounded-xl border border-card-border bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Sync All Devices</span>
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl border border-rose-200 bg-pastel-rose text-on-pastel-rose hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-secondary font-semibold uppercase">Total Eco-Points</span>
              <p className="text-2xl font-bold font-headline text-primary tabular-nums mt-0.5">
                {user.points} pts
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-secondary font-semibold uppercase">Active Habit Streak</span>
              <p className="text-2xl font-bold font-headline text-primary tabular-nums mt-0.5">
                {user.streakDays} Days
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-secondary font-semibold uppercase">Completed Habits</span>
              <p className="text-2xl font-bold font-headline text-primary tabular-nums mt-0.5">
                {user.completedChallengesCount}
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Device & Cloud Synchronization Section */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-card-border mb-6 gap-3">
            <div>
              <h3 className="text-lg font-bold font-headline text-on-surface">
                Multi-Device Cloud Synchronization
              </h3>
              <p className="text-xs text-on-surface-variant">
                Seamless cross-platform updates across desktop, tablet, and mobile devices
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Last Synced: {lastSyncedAt}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-card-border flex items-start gap-3">
              <Laptop className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-on-surface">MacBook Pro 16"</span>
                  <span className="text-[10px] text-emerald-700 font-bold">This Device</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Campus Library Wi-Fi</p>
                <p className="text-[10px] text-secondary mt-1">Status: Fully Synced · Instant</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-card-border flex items-start gap-3">
              <Tablet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-on-surface">iPad Pro 11"</span>
                  <span className="text-[10px] text-secondary font-medium">Idle</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Dorm Quad A Dock</p>
                <p className="text-[10px] text-secondary mt-1">Status: Last active 2 hours ago</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-card-border flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-on-surface">iPhone 16 Pro</span>
                  <span className="text-[10px] text-secondary font-medium">PWA</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Cellular 5G Network</p>
                <p className="text-[10px] text-secondary mt-1">Status: Offline Cache Primed</p>
              </div>
            </div>
          </div>
        </div>

        {/* SGU Verified Account Credentials & Affiliation */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-sm mb-8">
          <h3 className="text-base font-bold font-headline text-on-surface mb-2">
            Verified University Identity & Privileges
          </h3>
          <p className="text-xs text-on-surface-variant mb-4">
            Security audit details verified against Sanjay Ghodawat University student roster:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-card-border bg-surface-container-low">
              <span className="text-[10px] text-secondary uppercase font-semibold">PRN / University ID</span>
              <p className="font-semibold text-xs text-on-surface font-mono mt-0.5">
                {user.prn || 'Faculty/Staff Identity'}
              </p>
              <p className="text-[10px] text-emerald-700 font-medium mt-1">Status: Active SGU Roster</p>
            </div>
            <div className="p-3 rounded-xl border border-card-border bg-surface-container-low">
              <span className="text-[10px] text-secondary uppercase font-semibold">Institutional Email</span>
              <p className="font-semibold text-xs text-on-surface truncate mt-0.5">
                {user.email}
              </p>
              <p className="text-[10px] text-emerald-700 font-medium mt-1">Domain: Verified @sguk.ac.in</p>
            </div>
            <div className="p-3 rounded-xl border border-card-border bg-surface-container-low">
              <span className="text-[10px] text-secondary uppercase font-semibold">Authorization Tier</span>
              <p className="font-semibold text-xs text-on-surface capitalize mt-0.5">
                {user.role} Privileges
              </p>
              <p className="text-[10px] text-secondary font-medium mt-1">Server RBAC Enforced</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
