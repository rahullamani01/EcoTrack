import React from 'react';
import { CampusEvent } from '../types';
import { useSync } from '../context/SyncContext';
import { X, Calendar, MapPin, Clock, Users, CheckCircle, Download } from 'lucide-react';

interface EventRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent | null;
}

export const EventRegisterModal: React.FC<EventRegisterModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { registerEvent, unregisterEvent } = useSync();

  if (!isOpen || !event) return null;

  const handleToggleRegistration = () => {
    if (event.registered) {
      unregisterEvent(event.id);
    } else {
      registerEvent(event.id);
    }
  };

  const handleDownloadIcs = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EcoTrack Campus Sustainability//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title} - EcoTrack`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      `DTSTART:${event.isoDate.replace(/[-:]/g, '')}`,
      `DTEND:${event.isoDate.replace(/[-:]/g, '')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        <div className="mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
            {event.category}
          </span>
          <h2 className="text-2xl font-bold font-headline text-on-surface">
            {event.title}
          </h2>
        </div>

        <div className="p-4 bg-surface-container-low rounded-xl mb-4 space-y-2 border border-card-border">
          <div className="flex items-center gap-2 text-sm text-on-surface">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold">{event.dateStr}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Clock className="w-4 h-4 text-primary" />
            <span>{event.timeStr}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Users className="w-4 h-4 text-primary" />
            <span>
              {event.spotsLeft} spots available ({event.totalSpots - event.spotsLeft} confirmed attendees)
            </span>
          </div>
        </div>

        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          {event.description}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleRegistration}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              event.registered
                ? 'bg-secondary-container text-on-secondary-container hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-700'
                : 'bg-primary-container text-white hover:bg-primary shadow-sm'
            }`}
          >
            {event.registered ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>RSVP Confirmed (Click to Cancel)</span>
              </>
            ) : (
              <span>Register for Event</span>
            )}
          </button>

          <button
            onClick={handleDownloadIcs}
            title="Download .ics calendar event"
            className="py-3 px-3 rounded-xl border border-card-border bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Download className="w-4 h-4" />
            <span>.ICS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
