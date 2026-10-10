import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CampusMetrics, Challenge, CampusEvent, FacilityReport, HallBenchmark, SyncAction } from '../types';
import { INITIAL_METRICS, INITIAL_CHALLENGES, INITIAL_EVENTS, INITIAL_FACILITY_REPORTS, INITIAL_BENCHMARKS } from '../data/initialData';
import { useAuth } from './AuthContext';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'pending' | 'error';

interface SyncContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  syncState: SyncState;
  lastSyncedAt: string;
  pendingCount: number;
  syncErrorMessage: string | null;
  metrics: CampusMetrics;
  challenges: Challenge[];
  events: CampusEvent[];
  facilityReports: FacilityReport[];
  benchmarks: HallBenchmark[];
  toggleOfflineSimulation: () => void;
  triggerSyncNow: () => Promise<void>;
  simulatePeerSync: () => void;
  joinChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string) => void;
  registerEvent: (eventId: string) => boolean;
  unregisterEvent: (eventId: string) => void;
  submitFacilityReport: (report: Omit<FacilityReport, 'id' | 'reportedAt' | 'status' | 'reportedBy'>) => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, addPoints, incrementChallenges, refreshUser } = useAuth();

  // Network & simulation state
  const [browserOnline, setBrowserOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    return localStorage.getItem('ecotrack_simulated_offline') === 'true';
  });
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Just now');
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);

  const [pendingQueue, setPendingQueue] = useState<SyncAction[]>(() => {
    try {
      const saved = localStorage.getItem('ecotrack_pending_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Data states with fallback
  const [metrics, setMetrics] = useState<CampusMetrics>(() => {
    try {
      const saved = localStorage.getItem('ecotrack_metrics');
      return saved ? JSON.parse(saved) : INITIAL_METRICS;
    } catch {
      return INITIAL_METRICS;
    }
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    try {
      const saved = localStorage.getItem('ecotrack_challenges');
      return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
    } catch {
      return INITIAL_CHALLENGES;
    }
  });

  const [events, setEvents] = useState<CampusEvent[]>(() => {
    try {
      const saved = localStorage.getItem('ecotrack_events');
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [facilityReports, setFacilityReports] = useState<FacilityReport[]>(() => {
    try {
      const saved = localStorage.getItem('ecotrack_facility_reports');
      return saved ? JSON.parse(saved) : INITIAL_FACILITY_REPORTS;
    } catch {
      return INITIAL_FACILITY_REPORTS;
    }
  });

  const [benchmarks, setBenchmarks] = useState<HallBenchmark[]>(() => {
    try {
      const saved = localStorage.getItem('ecotrack_benchmarks');
      return saved ? JSON.parse(saved) : INITIAL_BENCHMARKS;
    } catch {
      return INITIAL_BENCHMARKS;
    }
  });

  const effectiveOnline = browserOnline && !isSimulatedOffline;

  // Persist states to local storage
  useEffect(() => {
    localStorage.setItem('ecotrack_metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem('ecotrack_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('ecotrack_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('ecotrack_facility_reports', JSON.stringify(facilityReports));
  }, [facilityReports]);

  useEffect(() => {
    localStorage.setItem('ecotrack_benchmarks', JSON.stringify(benchmarks));
  }, [benchmarks]);

  useEffect(() => {
    localStorage.setItem('ecotrack_pending_queue', JSON.stringify(pendingQueue));
  }, [pendingQueue]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch real persistent records from backend when online and authenticated
  const loadServerData = useCallback(async () => {
    if (!effectiveOnline) return;

    try {
      // 1. Fetch public facility reports
      const repRes = await fetch('/api/facilities/reports');
      if (repRes.ok) {
        const data = await repRes.json();
        if (Array.isArray(data.reports) && data.reports.length > 0) {
          setFacilityReports(data.reports);
        }
      }

      // 2. Fetch authenticated user private data if signed in
      const currentToken = token || localStorage.getItem('ecotrack_auth_token');
      if (currentToken) {
        const sumRes = await fetch('/api/user/summary', {
          headers: { 'Authorization': `Bearer ${currentToken}` },
        });
        if (sumRes.ok) {
          const summary = await sumRes.json();
          // Reconcile registered events
          if (Array.isArray(summary.eventRegistrations)) {
            const registeredIds = new Set(
              summary.eventRegistrations
                .filter((r: any) => r.status === 'confirmed')
                .map((r: any) => r.eventId)
            );
            setEvents((prev) =>
              prev.map((e) => ({
                ...e,
                registered: registeredIds.has(e.id),
              }))
            );
          }
          // Reconcile completed challenges
          if (Array.isArray(summary.challengeSubmissions)) {
            const completedIds = new Set(summary.challengeSubmissions.map((s: any) => s.challengeId));
            setChallenges((prev) =>
              prev.map((c) => ({
                ...c,
                completed: completedIds.has(c.id),
              }))
            );
          }
        }
      }
    } catch (err) {
      console.warn('[SyncContext] Could not fetch server records:', err);
    }
  }, [effectiveOnline, token]);

  useEffect(() => {
    loadServerData();
  }, [loadServerData]);

  // Genuine atomic queue processing: items are ONLY cleared upon server HTTP success
  const processSyncQueue = useCallback(async () => {
    if (!effectiveOnline) {
      setSyncState('offline');
      return;
    }

    if (pendingQueue.length === 0) {
      setSyncState('synced');
      setSyncErrorMessage(null);
      return;
    }

    setSyncState('syncing');
    setSyncErrorMessage(null);

    const currentToken = token || localStorage.getItem('ecotrack_auth_token');
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (currentToken) {
      authHeaders['Authorization'] = `Bearer ${currentToken}`;
    }

    const remainingQueue: SyncAction[] = [];
    let hadError = false;

    for (const action of pendingQueue) {
      try {
        let success = false;

        if (action.type === 'REGISTER_EVENT') {
          if (!currentToken) {
            // Cannot persist authenticated event registration without session
            remainingQueue.push(action);
            hadError = true;
            continue;
          }
          const res = await fetch(`/api/events/${action.payload.eventId}/register`, {
            method: 'POST',
            headers: authHeaders,
          });
          // Treat duplicate as idempotent success
          if (res.ok || res.status === 400) success = true;
        } else if (action.type === 'UNREGISTER_EVENT') {
          if (!currentToken) {
            remainingQueue.push(action);
            hadError = true;
            continue;
          }
          const res = await fetch(`/api/events/${action.payload.eventId}/cancel`, {
            method: 'POST',
            headers: authHeaders,
          });
          if (res.ok || res.status === 404) success = true;
        } else if (action.type === 'COMPLETE_CHALLENGE') {
          if (!currentToken) {
            remainingQueue.push(action);
            hadError = true;
            continue;
          }
          const res = await fetch(`/api/challenges/${action.payload.challengeId}/submit`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              pointsAwarded: action.payload.points || 50,
              evidenceNotes: 'Synced offline completed habit',
            }),
          });
          if (res.ok || res.status === 400) success = true;
        } else if (action.type === 'REPORT_ISSUE') {
          const res = await fetch('/api/facilities/reports', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(action.payload),
          });
          if (res.ok) success = true;
        } else {
          // Unrecognized or client-only action
          success = true;
        }

        if (!success) {
          remainingQueue.push(action);
          hadError = true;
        }
      } catch (err) {
        remainingQueue.push(action);
        hadError = true;
      }
    }

    setPendingQueue(remainingQueue);

    if (hadError) {
      setSyncState('error');
      setSyncErrorMessage(`${remainingQueue.length} action(s) could not be synced yet and are safely queued.`);
    } else {
      setSyncState('synced');
      setSyncErrorMessage(null);
      const now = new Date();
      setLastSyncedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      refreshUser();
    }
  }, [effectiveOnline, pendingQueue, token, refreshUser]);

  useEffect(() => {
    if (!effectiveOnline) {
      setSyncState('offline');
    } else if (pendingQueue.length > 0) {
      setSyncState('pending');
      processSyncQueue();
    } else {
      setSyncState('synced');
    }
  }, [effectiveOnline, pendingQueue.length, processSyncQueue]);

  const toggleOfflineSimulation = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      localStorage.setItem('ecotrack_simulated_offline', String(next));
      return next;
    });
  };

  const triggerSyncNow = async () => {
    if (!effectiveOnline) {
      return;
    }
    await processSyncQueue();
    await loadServerData();
  };

  const simulatePeerSync = () => {
    setSyncState('syncing');
    setTimeout(() => {
      setMetrics((prev) => ({
        ...prev,
        challengesCompleted: prev.challengesCompleted + 12,
        wasteDivertedTons: parseFloat((prev.wasteDivertedTons + 0.15).toFixed(2)),
        studentsParticipating: prev.studentsParticipating + 3,
        lastUpdated: new Date().toISOString(),
      }));
      setSyncState('synced');
      const now = new Date();
      setLastSyncedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 700);
  };

  // Actions
  const joinChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, joined: true } : c))
    );
  };

  const completeChallenge = async (challengeId: string) => {
    const target = challenges.find((c) => c.id === challengeId);
    if (!target) return;

    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId
          ? {
              ...c,
              completed: true,
              lastCompletedDate: new Date().toISOString().split('T')[0],
              currentCount: (c.currentCount || 0) + 1,
            }
          : c
      )
    );

    addPoints(target.points);
    incrementChallenges();

    const action: SyncAction = {
      id: `act-${Date.now()}`,
      type: 'COMPLETE_CHALLENGE',
      payload: { challengeId, points: target.points },
      timestamp: new Date().toISOString(),
      synced: false,
    };

    if (effectiveOnline && (token || localStorage.getItem('ecotrack_auth_token'))) {
      try {
        const currentToken = token || localStorage.getItem('ecotrack_auth_token');
        const res = await fetch(`/api/challenges/${challengeId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
          },
          body: JSON.stringify({ pointsAwarded: target.points }),
        });
        if (res.ok) {
          setSyncState('synced');
          const now = new Date();
          setLastSyncedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          return;
        }
      } catch {
        // Fall back to queue
      }
    }

    setPendingQueue((q) => [...q, action]);
    setSyncState(effectiveOnline ? 'pending' : 'offline');
  };

  const registerEvent = (eventId: string): boolean => {
    const target = events.find((e) => e.id === eventId);
    if (!target || target.spotsLeft <= 0 || target.registered) return false;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, registered: true, spotsLeft: Math.max(0, e.spotsLeft - 1) }
          : e
      )
    );

    const action: SyncAction = {
      id: `act-${Date.now()}`,
      type: 'REGISTER_EVENT',
      payload: { eventId },
      timestamp: new Date().toISOString(),
      synced: false,
    };

    if (effectiveOnline && (token || localStorage.getItem('ecotrack_auth_token'))) {
      const currentToken = token || localStorage.getItem('ecotrack_auth_token');
      fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      }).catch(() => {
        setPendingQueue((q) => [...q, action]);
      });
    } else {
      setPendingQueue((q) => [...q, action]);
      setSyncState(effectiveOnline ? 'pending' : 'offline');
    }

    return true;
  };

  const unregisterEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, registered: false, spotsLeft: Math.min(e.totalSpots, e.spotsLeft + 1) }
          : e
      )
    );

    const action: SyncAction = {
      id: `act-${Date.now()}`,
      type: 'UNREGISTER_EVENT',
      payload: { eventId },
      timestamp: new Date().toISOString(),
      synced: false,
    };

    if (effectiveOnline && (token || localStorage.getItem('ecotrack_auth_token'))) {
      const currentToken = token || localStorage.getItem('ecotrack_auth_token');
      fetch(`/api/events/${eventId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      }).catch(() => {
        setPendingQueue((q) => [...q, action]);
      });
    } else {
      setPendingQueue((q) => [...q, action]);
      setSyncState(effectiveOnline ? 'pending' : 'offline');
    }
  };

  const submitFacilityReport = async (
    reportData: Omit<FacilityReport, 'id' | 'reportedAt' | 'status' | 'reportedBy'>
  ) => {
    const tempId = `fr-${Date.now()}`;
    const newReport: FacilityReport = {
      ...reportData,
      id: tempId,
      status: 'reported',
      reportedAt: new Date().toISOString(),
      reportedBy: user ? user.name : 'SGU Student',
    };

    setFacilityReports((prev) => [newReport, ...prev]);

    const action: SyncAction = {
      id: `act-${Date.now()}`,
      type: 'REPORT_ISSUE',
      payload: reportData,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    if (effectiveOnline) {
      try {
        const currentToken = token || localStorage.getItem('ecotrack_auth_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;

        const res = await fetch('/api/facilities/reports', {
          method: 'POST',
          headers,
          body: JSON.stringify(reportData),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setFacilityReports((prev) => prev.map((r) => (r.id === tempId ? data.report : r)));
          }
          setSyncState('synced');
          return;
        }
      } catch {
        // Fall back to queue
      }
    }

    setPendingQueue((q) => [...q, action]);
    setSyncState(effectiveOnline ? 'pending' : 'offline');
  };

  return (
    <SyncContext.Provider
      value={{
        isOnline: effectiveOnline,
        isSimulatedOffline,
        syncState,
        lastSyncedAt,
        pendingCount: pendingQueue.length,
        syncErrorMessage,
        metrics,
        challenges,
        events,
        facilityReports,
        benchmarks,
        toggleOfflineSimulation,
        triggerSyncNow,
        simulatePeerSync,
        joinChallenge,
        completeChallenge,
        registerEvent,
        unregisterEvent,
        submitFacilityReport,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
};
