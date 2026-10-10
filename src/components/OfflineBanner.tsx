import React from 'react';
import { useSync } from '../context/SyncContext';
import { WifiOff, RefreshCw, Smartphone, Check } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const {
    isOnline,
    isSimulatedOffline,
    pendingCount,
    toggleOfflineSimulation,
    triggerSyncNow,
    syncState,
    simulatePeerSync,
  } = useSync();

  return (
    <div className="bg-surface-container border-b border-card-border px-4 py-2 text-xs text-on-surface">
      <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              <span>Offline Mode Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Cloud Synced</span>
            </span>
          )}

          <span className="text-on-surface-variant hidden sm:inline">·</span>
          <span className="text-on-surface-variant">
            {pendingCount > 0
              ? `${pendingCount} local updates waiting to synchronize`
              : 'Local storage primed for uninterrupted offline productivity'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-device sync simulator */}
          <button
            onClick={simulatePeerSync}
            disabled={!isOnline}
            title="Simulate data incoming from another student or tablet"
            className="px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border border-card-border transition-colors flex items-center gap-1 text-[11px] disabled:opacity-50 cursor-pointer"
          >
            <Smartphone className="w-3 h-3 text-primary" />
            <span className="hidden md:inline">Simulate Peer Device</span>
          </button>

          {/* Toggle offline mode simulation */}
          <button
            onClick={toggleOfflineSimulation}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors cursor-pointer ${
              isSimulatedOffline
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border-card-border'
            }`}
          >
            {isSimulatedOffline ? 'End Offline Simulation' : 'Simulate Offline'}
          </button>

          {/* Sync now button */}
          <button
            onClick={() => triggerSyncNow()}
            disabled={!isOnline || syncState === 'syncing'}
            className="px-2.5 py-1 rounded-md bg-primary-container text-white hover:bg-primary transition-colors flex items-center gap-1 text-[11px] font-medium disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{syncState === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
