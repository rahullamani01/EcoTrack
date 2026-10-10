import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';
import { CampusEvent } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle,
  Plus,
  Download,
  CalendarCheck,
} from 'lucide-react';

interface EventsViewProps {
  onSelectEvent: (event: CampusEvent) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onSelectEvent, onOpenAuth }) => {
  const { events, registerEvent, unregisterEvent } = useSync();
  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'registered'>('all');

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterMode === 'all' || (filterMode === 'registered' && ev.registered);

    return matchesSearch && matchesFilter;
  });

  const handleRegisterToggle = (e: React.MouseEvent, ev: CampusEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    if (ev.registered) {
      unregisterEvent(ev.id);
    } else {
      registerEvent(ev.id);
    }
  };

  return (
    <div className="w-full py-8 lg:py-12 bg-background min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
            Campus Community Engagement
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-headline text-on-surface">
            Sustainability Events & Actions
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            Volunteer for ecological restoration, participate in energy auditing workshops, and earn collegiate engagement service credits.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-card-border">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setFilterMode('registered')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'registered'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>My Registrations ({events.filter((e) => e.registered).length})</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events or locations..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-card-border bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-card-border">
            <Calendar className="w-12 h-12 text-secondary mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-on-surface">No events found</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Try adjusting your search criteria or register for upcoming activities above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`rounded-2xl p-6 transition-all flex flex-col justify-between border cursor-pointer group ${
                  ev.registered
                    ? 'bg-secondary-container/20 border-primary/40 shadow-sm'
                    : 'bg-surface-container-lowest border-card-border shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] bg-surface-container-high text-on-surface px-2.5 py-1 rounded font-medium">
                      [{ev.category}]
                    </span>
                    <span className="text-xs text-secondary font-semibold">
                      {ev.spotsLeft} spots left
                    </span>
                  </div>

                  <h3 className="font-headline text-xl text-on-surface font-semibold mb-2 group-hover:text-primary transition-colors">
                    {ev.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-on-surface-variant mb-4">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ev.dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ev.timeStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ev.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed mb-6 line-clamp-3">
                    {ev.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-card-border flex items-center justify-between">
                  <span className="text-xs text-secondary">
                    {ev.registered ? 'RSVP Active' : `${ev.totalSpots - ev.spotsLeft} Attending`}
                  </span>

                  <button
                    onClick={(e) => handleRegisterToggle(e, ev)}
                    className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      ev.registered
                        ? 'bg-secondary-container text-on-secondary-container hover:bg-rose-100 hover:text-red-700'
                        : 'bg-primary-container text-white hover:bg-primary shadow-xs'
                    }`}
                  >
                    {ev.registered ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Registered</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Register</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
