import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';
import { X, Droplets, Zap, Trash2, Wind, CheckCircle2 } from 'lucide-react';

interface FacilityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FacilityReportModal: React.FC<FacilityReportModalProps> = ({ isOpen, onClose }) => {
  const { submitFacilityReport, isOnline } = useSync();
  const { addPoints } = useAuth();

  const [type, setType] = useState<'leak' | 'energy' | 'waste' | 'hvac'>('leak');
  const [title, setTitle] = useState('');
  const [building, setBuilding] = useState('School of Technology (Block A)');
  const [room, setRoom] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    submitFacilityReport({
      type,
      title,
      building,
      room: room || undefined,
      severity,
    });

    addPoints(35); // Reward 35 eco-points for campus stewardship
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-card-border rounded-2xl max-w-lg w-full p-6 shadow-xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-14 h-14 text-primary mb-3 animate-bounce" />
            <h3 className="text-xl font-bold font-headline text-on-surface">Report Dispatched!</h3>
            <p className="text-sm text-on-surface-variant max-w-xs mt-1">
              Thank you for prompt reporting. Campus Facilities has received telemetry and you earned 35 eco-points.
              {!isOnline && ' (Logged in offline queue; will sync once connected)'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                Facilities Maintenance Portal
              </span>
              <h2 className="text-2xl font-bold font-headline text-on-surface">
                Report Campus Resource Issue
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Helps university operations achieve the target 24h average leak & HVAC turnaround.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Issue Type Selector */}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  Issue Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('leak')}
                    className={`py-2 px-1 text-xs rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      type === 'leak'
                        ? 'border-primary bg-secondary-container text-on-surface font-semibold'
                        : 'border-card-border bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <Droplets className="w-4 h-4 text-primary" />
                    <span>Water Leak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('energy')}
                    className={`py-2 px-1 text-xs rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      type === 'energy'
                        ? 'border-primary bg-secondary-container text-on-surface font-semibold'
                        : 'border-card-border bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Lighting</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('hvac')}
                    className={`py-2 px-1 text-xs rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      type === 'hvac'
                        ? 'border-primary bg-secondary-container text-on-surface font-semibold'
                        : 'border-card-border bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <Wind className="w-4 h-4 text-primary" />
                    <span>HVAC Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('waste')}
                    className={`py-2 px-1 text-xs rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      type === 'waste'
                        ? 'border-primary bg-secondary-container text-on-surface font-semibold'
                        : 'border-card-border bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 text-primary" />
                    <span>Overflow</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Issue Summary
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2nd floor hydration station slow faucet leak"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-card-border bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">
                    Campus Facility
                  </label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-card-border bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="School of Technology (Block A)">School of Technology (Block A)</option>
                    <option value="Central Knowledge Resource Centre (Library)">Knowledge Resource Centre (Library)</option>
                    <option value="Sahyadri Boys Hostel (Quad A)">Sahyadri Boys Hostel (Quad A)</option>
                    <option value="Kaveri Girls Hostel (Quad B)">Kaveri Girls Hostel (Quad B)</option>
                    <option value="SGU Central Food Court">SGU Central Food Court</option>
                    <option value="CREAM Renewable Energy Lab">CREAM Renewable Energy Lab</option>
                    <option value="SGU International Sports Arena">SGU International Sports Arena</option>
                    <option value="School of Pharmaceutical Sciences">School of Pharmaceutical Sciences</option>
                    <option value="School of Management & Commerce">School of Management & Commerce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">
                    Room / Specific Zone
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. West wing restroom #2"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-card-border bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Urgency / Resource Impact
                </label>
                <div className="flex gap-4">
                  {(['low', 'medium', 'high'] as const).map((sev) => (
                    <label key={sev} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                      <input
                        type="radio"
                        name="severity"
                        value={sev}
                        checked={severity === sev}
                        onChange={() => setSeverity(sev)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="capitalize">{sev} Impact</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">
                  {isOnline ? 'Online Synced' : 'Offline Mode (Local Storage)'}
                </span>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-primary-container hover:bg-primary text-white font-medium text-sm transition-colors shadow-sm"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
