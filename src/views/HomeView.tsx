import React, { useState } from 'react';
import { ActiveScreen } from '../components/Navbar';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';
import { CampusEvent } from '../types';
import { CampusMap } from '../components/CampusMap';
import {
  ArrowRight,
  CheckCircle2,
  Recycle,
  Users,
  ShieldCheck,
  Calendar,
  Check,
  Droplets,
  Zap,
  Leaf,
  Trash2,
  TreePine,
  Presentation,
  CheckCircle,
  MapPin,
  Navigation,
  Sparkles,
  Trees,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (screen: ActiveScreen) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenReportModal: () => void;
  onSelectEvent: (event: CampusEvent) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenAuth,
  onOpenReportModal,
  onSelectEvent,
}) => {
  const { metrics, challenges, events, joinChallenge, completeChallenge, registerEvent } = useSync();
  const { isAuthenticated } = useAuth();
  const [activeMonthHover, setActiveMonthHover] = useState<string | null>(null);

  // Take first 3 challenges for home view cards
  const featuredChallenges = challenges.slice(0, 3);
  // Take first 3 events for home view cards
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: HERO */}
      <section className="w-full py-10 lg:py-20 bg-background transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Editorial Statement */}
            <div className="lg:col-span-7 flex flex-col justify-center pr-0 lg:pr-6">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-pastel-sky text-on-pastel-sky border border-sky-200/60 w-fit">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-xs uppercase tracking-wider font-semibold">
                  Sanjay Ghodawat University · Kolhapur
                </span>
              </div>

              <h1 className="font-headline text-3xl sm:text-4xl lg:text-[4rem] lg:leading-[1.08] font-bold text-primary tracking-tight mb-4">
                A Greener SGU Starts With Us.
              </h1>

              <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-xl mb-8">
                Discover simple ways to live sustainably at Sanjay Ghodawat University. Join Atigre campus initiatives, monitor CREAM solar telemetry, and turn everyday student actions into collective environmental progress.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button
                  onClick={() => onNavigate('ecoguide')}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all group cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Ask EcoGuide AI</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('waste-sorting')}
                  className="inline-flex items-center gap-2 bg-surface-container-low hover:bg-surface-container text-primary font-semibold px-6 py-3.5 rounded-xl text-sm shadow-xs transition-all border border-card-border cursor-pointer"
                >
                  <Recycle className="w-4 h-4 text-primary" />
                  <span>AI Waste Sorting</span>
                </button>

                <button
                  onClick={() => onNavigate('trees')}
                  className="inline-flex items-center gap-2 bg-surface-container-low hover:bg-surface-container text-on-surface px-5 py-3.5 rounded-xl text-sm font-medium shadow-xs transition-all border border-card-border cursor-pointer"
                >
                  <Trees className="w-4 h-4 text-secondary" />
                  <span>Tree Monitoring</span>
                </button>

                <button
                  onClick={() => onNavigate('reports')}
                  className="inline-flex items-center bg-surface-container-low hover:bg-surface-container text-on-surface px-5 py-3.5 rounded-xl text-sm font-medium shadow-xs transition-all border border-card-border cursor-pointer"
                >
                  Sustainability Reports
                </button>
              </div>

              <div className="pt-4 border-t border-card-border">
                <p className="text-xs text-secondary tracking-wide">
                  SGU Atigre Campus · Better habits. Stronger communities. Greener university.
                </p>
              </div>
            </div>

            {/* Right Column: Visual Anchor */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative w-full aspect-[4/3] rounded-[22px] overflow-hidden shadow-md bg-surface-container border border-card-border">
                <img
                  alt="Sanjay Ghodawat University (SGU) Green Campus, Kolhapur"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  src="/images/sgu-campus.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent pointer-events-none"></div>

                {/* Overlaid Restrained Impact Badge */}
                <div className="absolute bottom-5 left-5 right-5 sm:right-auto bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-md flex items-center gap-3 max-w-sm border border-emerald-200/60">
                  <span className="text-base select-none">🌿</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-primary">Sanjay Ghodawat University</span>
                    <span className="text-xs text-on-surface-variant">Kolhapur Campus · sguk.ac.in</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CAMPUS IMPACT SNAPSHOT */}
      <section className="w-full py-12 lg:py-20 bg-surface-container-low transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
                SGU Collective Progress
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-primary font-bold tracking-tight">
                Every action moves Sanjay Ghodawat University forward.
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <p className="text-sm text-on-surface-variant max-w-md mb-2">
                Small student & faculty contributions build an environmentally verified SGU campus in Kolhapur.
              </p>
              <span className="text-[11px] text-secondary bg-surface-container-highest px-3 py-1 rounded-full border border-card-border">
                [SGU Atigre Campus Telemetry · Institutional verification pending]
              </span>
            </div>
          </div>

          {/* Metric Grid with light pastel accents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border border-card-border">
              <div className="flex items-center justify-between mb-6">
                <span className="font-headline text-3xl lg:text-[2.5rem] font-bold text-primary tracking-tight leading-none tabular-nums">
                  {metrics.studentsParticipating.toLocaleString()}+
                </span>
                <div className="w-10 h-10 rounded-xl bg-pastel-sky flex items-center justify-center text-on-pastel-sky border border-sky-200/50">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-headline text-base text-on-surface font-semibold mb-1">
                  Students Participating
                </h3>
                <p className="text-xs text-on-surface-variant">+22% this term across Engineering & Pharmacy</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border border-card-border">
              <div className="flex items-center justify-between mb-6">
                <span className="font-headline text-3xl lg:text-[2.5rem] font-bold text-primary tracking-tight leading-none tabular-nums">
                  {metrics.challengesCompleted.toLocaleString()}
                </span>
                <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center text-on-pastel-mint border border-emerald-200/50">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-headline text-base text-on-surface font-semibold mb-1">
                  Challenges Completed
                </h3>
                <p className="text-xs text-on-surface-variant">Hostel & lab eco-habit logs</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border border-card-border">
              <div className="flex items-center justify-between mb-6">
                <span className="font-headline text-3xl lg:text-[2.5rem] font-bold text-primary tracking-tight leading-none tabular-nums">
                  {metrics.wasteDivertedTons} T
                </span>
                <div className="w-10 h-10 rounded-xl bg-pastel-amber flex items-center justify-center text-on-pastel-amber border border-amber-200/50">
                  <Recycle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-headline text-base text-on-surface font-semibold mb-1">
                  Waste Diverted
                </h3>
                <p className="text-xs text-on-surface-variant">SGU Canteen & campus diversion rate</p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border border-card-border">
              <div className="flex items-center justify-between mb-6">
                <span className="font-headline text-3xl lg:text-[2.5rem] font-bold text-primary tracking-tight leading-none tabular-nums">
                  {metrics.issuesResolved}
                </span>
                <div className="w-10 h-10 rounded-xl bg-pastel-rose flex items-center justify-center text-on-pastel-rose border border-rose-200/50">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-headline text-base text-on-surface font-semibold mb-1">
                  Issues Resolved
                </h3>
                <p className="text-xs text-on-surface-variant">96% average 24-hour turnaround rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ECO CHALLENGES */}
      <section className="w-full py-12 lg:py-20 bg-surface transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
                Start With Something Small
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-primary font-bold tracking-tight">
                Better habits begin here.
              </h2>
              <p className="text-sm text-on-surface-variant max-w-xl mt-1">
                Simple actions, repeated consistently, can help create a greener campus culture.
              </p>
            </div>
            <button
              onClick={() => onNavigate('challenges')}
              className="hidden md:inline-flex items-center gap-2 bg-surface-container hover:bg-surface-container-high text-primary px-6 py-3 rounded-xl text-sm font-medium transition-colors border border-card-border cursor-pointer"
            >
              <span>Explore All Challenges</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Challenge Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredChallenges.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-card-border group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-medium">
                      {item.categoryLabel}
                    </span>
                    <span className="text-xs font-semibold text-primary">{item.points} pts</span>
                  </div>
                  <h3 className="font-headline text-xl text-on-surface font-semibold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-card-border flex items-center justify-between">
                  <span className="text-xs text-secondary">{item.durationLabel}</span>
                  {item.completed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Completed!</span>
                    </span>
                  ) : item.joined ? (
                    <button
                      onClick={() => completeChallenge(item.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-container hover:text-primary cursor-pointer hover:underline"
                    >
                      <span>Check In Log</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => joinChallenge(item.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <span>Join Challenge</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center md:hidden">
            <button
              onClick={() => onNavigate('challenges')}
              className="inline-flex items-center justify-center gap-2 bg-surface-container hover:bg-surface-container-high text-primary px-6 py-3 rounded-xl text-sm font-medium transition-colors w-full border border-card-border cursor-pointer"
            >
              <span>Explore All Challenges</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: CAMPUS INITIATIVES */}
      <section className="w-full py-12 lg:py-20 bg-surface-container-low transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
              Change Starts At SGU
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-primary font-bold tracking-tight mb-2">
              Small systems. Meaningful change.
            </h2>
            <p className="text-sm text-on-surface-variant">
              Campus programs engineered with SGU Facilities and CREAM researchers to reduce resource consumption across Kolhapur campus quads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div
              onClick={() => onNavigate('initiatives')}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-card-border cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-pastel-mint text-on-pastel-mint flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-emerald-200/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-lg text-primary font-semibold mb-2">
                Waste & Composting
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Vermicomposting food waste at SGU Food Court and student dining halls, plus certified e-waste sorting in engineering labs.
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              onClick={() => onNavigate('initiatives')}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-card-border cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-pastel-sky text-on-pastel-sky flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-sky-200/50">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-lg text-primary font-semibold mb-2">
                Water Stewardship
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Rainwater harvesting in Atigre lake, RO refill stations across hostels, and sub-metered leak turnaround.
              </p>
            </div>

            {/* Pillar 3 */}
            <div
              onClick={() => onNavigate('initiatives')}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-card-border cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-pastel-amber text-on-pastel-amber flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-amber-200/50">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-lg text-primary font-semibold mb-2">
                CREAM Solar & Energy
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                SGU 1 MW rooftop solar plant, daytime peak clipping, and evening lab power audits in CAD & hardware suites.
              </p>
            </div>

            {/* Pillar 4 */}
            <div
              onClick={() => onNavigate('initiatives')}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-card-border cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-pastel-rose text-on-pastel-rose flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-rose-200/50">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-lg text-primary font-semibold mb-2">
                Green Campus Flora
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Sahyadri hillock native Western Ghats afforestation, School of Pharmacy herbal garden, and campus sports perimeter trees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CAMPUS IMPACT PREVIEW (DASHBOARD PREVIEW UI) */}
      <section className="w-full py-12 lg:py-20 bg-surface transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Text intro */}
            <div className="lg:col-span-5">
              <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
                Progress You Can See
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-primary font-bold tracking-tight mb-4">
                Measure what matters at SGU.
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed mb-6">
                Follow SGU student participation, CREAM clean energy telemetry, and hostel benchmarking with clear, actionable telemetry.
              </p>

              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-3 text-on-surface">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Real-time Sahyadri & Kaveri hostel benchmarking</span>
                </div>
                <div className="flex items-center gap-3 text-on-surface">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Facility maintenance leak-to-repair turnaround times</span>
                </div>
                <div className="flex items-center gap-3 text-on-surface">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Verified NSS student engagement and green credits</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('campus-impact')}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline cursor-pointer"
                >
                  <span>Explore Full SGU Impact Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-on-surface-variant hidden sm:inline">·</span>
                <button
                  onClick={onOpenReportModal}
                  className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer underline"
                >
                  Report a Campus Leak
                </button>
              </div>
            </div>

            {/* Dashboard Preview Card Module */}
            <div className="lg:col-span-7">
              <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-card-border relative">
                <div className="flex items-center justify-between pb-4 border-b border-card-border mb-6">
                  <div>
                    <h3 className="font-headline text-lg sm:text-xl text-primary font-semibold">
                      Semester Telemetry Overview
                    </h3>
                    <span className="text-xs text-on-surface-variant">
                      SGU Atigre Campus Quad & Hostels
                    </span>
                  </div>
                  <span className="text-[11px] bg-pastel-mint text-on-pastel-mint px-3 py-1 rounded-full font-medium border border-emerald-200/50">
                    Live Synced
                  </span>
                </div>

                {/* Visualization: Bar Chart Comparison */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-secondary font-semibold uppercase tracking-wider">
                      Monthly Active Action Trend
                    </span>
                    <span className="text-xs text-primary font-semibold">+24.6% vs Spring</span>
                  </div>

                  <div className="w-full h-32 flex items-end gap-3 pt-4">
                    {[
                      { month: 'Aug', pct: 45, val: '2,400' },
                      { month: 'Sep', pct: 60, val: '3,200' },
                      { month: 'Oct', pct: 82, val: '4,150' },
                      { month: 'Nov', pct: 94, val: '4,890', isCurrent: true },
                      { month: 'Dec (Est)', pct: 70, val: '3,600 (Est)', isEst: true },
                    ].map((bar) => (
                      <div
                        key={bar.month}
                        onMouseEnter={() => setActiveMonthHover(`${bar.month}: ${bar.val} actions`)}
                        onMouseLeave={() => setActiveMonthHover(null)}
                        className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                      >
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            bar.isCurrent
                              ? 'bg-primary shadow-sm group-hover:bg-primary-container'
                              : bar.isEst
                              ? 'bg-surface-container-highest group-hover:bg-secondary-container'
                              : 'bg-secondary-container group-hover:bg-primary-container'
                          }`}
                          style={{ height: `${bar.pct}%` }}
                        ></div>
                        <span
                          className={`text-[11px] ${
                            bar.isCurrent ? 'text-primary font-semibold' : 'text-secondary'
                          }`}
                        >
                          {bar.month}
                        </span>
                      </div>
                    ))}
                  </div>

                  {activeMonthHover && (
                    <div className="mt-2 text-center text-xs font-medium text-primary">
                      {activeMonthHover}
                    </div>
                  )}
                </div>

                {/* Stat Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-card-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-on-surface-variant">Challenge Completion</span>
                      <span className="text-xs font-semibold text-primary">86%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '86%' }}></div>
                    </div>
                    <span className="text-[11px] text-secondary mt-1 block">
                      Completed within logged schedule
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low border border-card-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-on-surface-variant">Facility Leak Turnaround</span>
                      <span className="text-xs font-semibold text-primary">24h Avg</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className="h-full bg-primary-container rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <span className="text-[11px] text-secondary mt-1 block">
                      18 out of 19 reported this week
                    </span>
                  </div>
                </div>

                {/* Target Progress Bar */}
                <div className="p-4 rounded-xl bg-surface-container border border-card-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-on-surface">
                      Semester Waste Diversion Target
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {Math.round((metrics.wasteDivertedTons / metrics.semesterTargetTons) * 100)}% Achieved
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-tertiary-fixed-dim rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((metrics.wasteDivertedTons / metrics.semesterTargetTons) * 100)
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[11px]">
                    <span className="text-secondary">Baseline: 14.0 T</span>
                    <span className="text-primary font-semibold">SGU Goal: {metrics.semesterTargetTons}.0 T</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: UPCOMING EVENTS */}
      <section className="w-full py-12 lg:py-20 bg-surface-container-low transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
                SGU Community Calendar
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-primary font-bold tracking-tight">
                Good things grow together at SGU.
              </h2>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline cursor-pointer"
            >
              <span>View All Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-card-border"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] bg-pastel-sky text-on-pastel-sky px-2.5 py-1 rounded font-medium border border-sky-200/50">
                      [{ev.category}]
                    </span>
                    {ev.iconName === 'calendar_month' && <Calendar className="w-5 h-5 text-secondary" />}
                    {ev.iconName === 'potted_plant' && <TreePine className="w-5 h-5 text-secondary" />}
                    {ev.iconName === 'co_present' && <Presentation className="w-5 h-5 text-secondary" />}
                  </div>
                  <h3 className="font-headline text-xl text-on-surface font-semibold mb-1">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-primary font-semibold mb-1">{ev.dateStr}</p>
                  <p className="text-xs text-on-surface-variant mb-4">{ev.location}</p>
                </div>

                <div className="pt-4 border-t border-card-border flex items-center justify-between">
                  <span className="text-xs text-secondary">{ev.spotsLeft} spots left</span>
                  <button
                    onClick={() => onSelectEvent(ev)}
                    className={`inline-flex items-center text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      ev.registered
                        ? 'bg-pastel-mint text-on-pastel-mint border border-emerald-200/50'
                        : 'bg-primary-container text-white hover:bg-primary'
                    }`}
                  >
                    {ev.registered ? 'Registered' : 'Register'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: COMMUNITY PARTICIPATION (SPLIT EDITORIAL LAYOUT) */}
      <section className="w-full py-12 lg:py-20 bg-surface transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
              Participation Pathways
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-primary font-bold tracking-tight">
              Your actions are part of something bigger at SGU.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pathway 1: Students */}
            <div className="bg-surface-container-low rounded-2xl p-6 lg:p-8 flex flex-col justify-between border border-card-border">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-2">
                  01 / SGU Student Cohort
                </span>
                <h3 className="font-headline text-xl text-on-surface font-semibold mb-2">
                  For Students
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  Log hostel habits, participate in green marathon cleanup drives, track mess composting, and earn NSS service credits.
                </p>
              </div>
              <button
                onClick={() => (isAuthenticated ? onNavigate('challenges') : onOpenAuth('register'))}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline cursor-pointer"
              >
                <span>Join student network</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pathway 2: Faculty */}
            <div className="bg-surface-container rounded-2xl p-6 lg:p-8 flex flex-col justify-between border border-card-border">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-2">
                  02 / Academic Leadership & CREAM
                </span>
                <h3 className="font-headline text-xl text-on-surface font-semibold mb-2">
                  For Faculty
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  Lead lab energy audits, mentor research papers with real SGU microgrid data, and guide green campus innovations.
                </p>
              </div>
              <button
                onClick={() => onNavigate('initiatives')}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline cursor-pointer"
              >
                <span>Curriculum resources</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pathway 3: Administrators */}
            <div className="bg-surface-container-low rounded-2xl p-6 lg:p-8 flex flex-col justify-between border border-card-border">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-2">
                  03 / Estate & Campus Facilities
                </span>
                <h3 className="font-headline text-xl text-on-surface font-semibold mb-2">
                  For Administrators
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  Coordinate Atigre campus water cisterns, monitor rooftop solar yields, and accelerate rapid hostel repair cycles.
                </p>
              </div>
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline cursor-pointer"
              >
                <span>Institutional access</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7.5: SANJAY GHODAWAT UNIVERSITY LOCATION & MAP */}
      <section className="w-full py-12 lg:py-20 bg-surface-container-low transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-mint text-on-pastel-mint border border-emerald-200/60 text-xs font-semibold mb-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Atigre, Kolhapur · 150+ Acre Campus Coordinates</span>
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-primary font-bold tracking-tight">
                Sanjay Ghodawat University Campus Map
              </h2>
              <p className="text-sm text-on-surface-variant max-w-xl mt-1">
                Pinpoint CREAM solar microgrids, academic faculties, student hostels, and organic mess composting facilities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('campus-map')}
                className="inline-flex items-center gap-2 bg-pastel-mint text-on-pastel-mint hover:bg-emerald-100 border border-emerald-200/80 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Full Map Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="https://maps.google.com/?q=Sanjay+Ghodawat+University+Kolhapur+Atigre"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-primary-container hover:bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          <div className="shadow-xs rounded-2xl overflow-hidden border border-card-border">
            <CampusMap heightClass="h-[460px] lg:h-[520px]" showSidebar={true} />
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL CTA (LIGHT GREEN PASTEL THEME, ZERO DARK COLOURS) */}
      <section className="w-full py-16 lg:py-24 bg-pastel-mint/50 border-t border-card-border text-on-surface transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-primary mb-2 block font-semibold px-3 py-1 rounded-full bg-surface-container-lowest border border-emerald-200/60">
              Sanjay Ghodawat University · Kolhapur
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl lg:text-[3.25rem] font-bold text-primary tracking-tight mb-4 leading-tight">
              Your Campus. Your Impact.
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed mb-8">
              Join SGU students, scholars, and staff committed to a cleaner, greener university in Kolhapur. Every individual habit counts toward our institutional footprint.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center bg-primary-container hover:bg-primary text-white px-8 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
              >
                Join SGU EcoTrack
              </button>
              <button
                onClick={() => onNavigate('campus-map')}
                className="inline-flex items-center bg-surface-container-lowest hover:bg-surface-container-low text-primary px-8 py-3.5 rounded-xl text-sm font-semibold transition-all border border-card-border cursor-pointer shadow-2xs"
              >
                Explore SGU Campus Map
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
