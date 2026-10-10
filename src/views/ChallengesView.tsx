import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';
import { ChallengeCategory } from '../types';
import {
  CheckCircle2,
  Trophy,
  Flame,
  Award,
  Check,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
  PlusCircle,
} from 'lucide-react';

interface ChallengesViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ onOpenAuth }) => {
  const { challenges, joinChallenge, completeChallenge, isOnline } = useSync();
  const { user, isAuthenticated } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Challenges' },
    { id: 'waste', label: 'Waste Reduction' },
    { id: 'water', label: 'Water Conservation' },
    { id: 'mobility', label: 'Sustainable Mobility' },
    { id: 'energy', label: 'Energy Efficiency' },
    { id: 'food', label: 'Green Spaces' },
  ];

  const filteredChallenges = challenges.filter((c) => {
    const matchCat = activeCategory === 'all' || c.category === activeCategory;
    const matchQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleComplete = (id: string) => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    completeChallenge(id);
    setJustCompletedId(id);
    setTimeout(() => setJustCompletedId(null), 2500);
  };

  const handleJoin = (id: string) => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    joinChallenge(id);
  };

  return (
    <div className="w-full py-8 lg:py-12 bg-background min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
            Collegiate Habit & Action Engine
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-headline text-on-surface">
            Campus Eco Challenges
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            Turn daily actions into institutional impact. Complete challenges to earn collegiate eco-points, climb dormitory leaderboards, and reduce university carbon footprint.
          </p>
        </div>

        {/* User Engagement Banner */}
        {isAuthenticated && user && (
          <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-lowest border border-card-border mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary font-bold text-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-on-surface">{user.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-secondary-container text-on-secondary-container font-semibold uppercase">
                    {user.residenceHall || user.department}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Current Streak: <span className="font-semibold text-primary">{user.streakDays} Days</span> ·{' '}
                  Completed: <span className="font-semibold text-primary">{user.completedChallengesCount} Habits</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 self-start md:self-auto">
              <div className="text-right">
                <span className="text-xs text-secondary">Earned Points</span>
                <p className="text-2xl font-bold font-headline text-primary tabular-nums">
                  {user.points} pts
                </p>
              </div>
              <div className="h-8 w-px bg-card-border"></div>
              <div className="text-right">
                <span className="text-xs text-secondary">Campus Rank</span>
                <p className="text-2xl font-bold font-headline text-on-surface">#14</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Segmented Category Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-card-border">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-card-border bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl p-6 transition-all flex flex-col justify-between border ${
                item.completed
                  ? 'bg-secondary-container/30 border-primary/40'
                  : 'bg-surface-container-lowest border-card-border shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-medium">
                    {item.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1 text-primary font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{item.points} pts</span>
                  </div>
                </div>

                <h3 className="font-headline text-xl text-on-surface font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div>
                <div className="pt-4 border-t border-card-border flex items-center justify-between mb-3 text-xs text-secondary">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.durationLabel}</span>
                  </div>
                  {item.currentCount !== undefined && item.currentCount > 0 && (
                    <span>Logged {item.currentCount} times</span>
                  )}
                </div>

                {justCompletedId === item.id ? (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>+{item.points} Points Added! Synced</span>
                  </div>
                ) : item.completed ? (
                  <button
                    onClick={() => handleComplete(item.id)}
                    className="w-full py-2.5 px-4 rounded-xl border border-card-border bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Log Again Today (+{item.points} pts)</span>
                  </button>
                ) : item.joined ? (
                  <button
                    onClick={() => handleComplete(item.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Check In & Complete</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(item.id)}
                    className="w-full py-2.5 px-4 rounded-xl border border-primary-container text-primary-container hover:bg-secondary-container text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Join This Challenge</span>
                    <PlusCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
