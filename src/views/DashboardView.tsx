import React, { useState, useMemo } from 'react';
import { ActiveScreen } from '../components/Navbar';
import { useSync } from '../context/SyncContext';
import { DateRangeFilter, DateRangePreset, HallBenchmark } from '../types';
import {
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  Search,
  Droplets,
  Zap,
  Trash2,
  RefreshCw,
  PlusCircle,
  BarChart3,
  Building,
  CheckCircle,
  MapPin,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenExportModal: (dateRange: DateRangeFilter) => void;
  onOpenReportModal: () => void;
  onNavigate?: (screen: ActiveScreen) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenExportModal,
  onOpenReportModal,
  onNavigate,
}) => {
  const { metrics, benchmarks, facilityReports, syncState, triggerSyncNow, isOnline } = useSync();

  // Date range filter
  const [datePreset, setDatePreset] = useState<DateRangePreset>('semester');
  const [customStart, setCustomStart] = useState('2025-08-15');
  const [customEnd, setCustomEnd] = useState('2025-12-15');

  // Search & sorting for dormitory benchmarking
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof HallBenchmark>('wasteDiversionPct');
  const [sortAsc, setSortAsc] = useState(false);

  // Active chart metric view
  const [selectedChartMetric, setSelectedChartMetric] = useState<'actions' | 'waste' | 'energy'>('actions');

  const dateRangeConfig: DateRangeFilter = useMemo(() => {
    switch (datePreset) {
      case '7d':
        return { preset: '7d', startDate: 'Oct 03, 2025', endDate: 'Oct 10, 2025', label: 'Last 7 Days' };
      case '30d':
        return { preset: '30d', startDate: 'Sep 10, 2025', endDate: 'Oct 10, 2025', label: 'Last 30 Days' };
      case 'year':
        return { preset: 'year', startDate: 'Jan 01, 2025', endDate: 'Dec 31, 2025', label: 'Academic Year 2025' };
      case 'custom':
        return { preset: 'custom', startDate: customStart, endDate: customEnd, label: `Custom (${customStart} to ${customEnd})` };
      case 'semester':
      default:
        return { preset: 'semester', startDate: 'Aug 25, 2025', endDate: 'Dec 18, 2025', label: 'Fall Semester 2025' };
    }
  }, [datePreset, customStart, customEnd]);

  // Dynamic metrics modulated by date range preset for realistic behavior
  const modulatedMetrics = useMemo(() => {
    let multiplier = 1.0;
    if (datePreset === '7d') multiplier = 0.12;
    if (datePreset === '30d') multiplier = 0.42;
    if (datePreset === 'year') multiplier = 1.65;

    return {
      students: Math.round(metrics.studentsParticipating * (datePreset === '7d' ? 0.8 : 1.0)),
      challenges: Math.round(metrics.challengesCompleted * multiplier),
      wasteTons: parseFloat((metrics.wasteDivertedTons * multiplier).toFixed(2)),
      kwhSaved: Math.round(428500 * multiplier),
      waterGallons: (1.85 * multiplier).toFixed(2),
      issues: Math.round(metrics.issuesResolved * multiplier),
    };
  }, [datePreset, metrics]);

  // Filtered & sorted benchmarks
  const processedBenchmarks = useMemo(() => {
    return benchmarks
      .filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return 0;
      });
  }, [benchmarks, searchQuery, sortField, sortAsc]);

  const handleSort = (field: keyof HallBenchmark) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="w-full py-8 lg:py-12 bg-background min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary font-semibold uppercase tracking-wider mb-1 px-2.5 py-0.5 rounded-full bg-pastel-sky text-on-pastel-sky border border-sky-200/50 w-fit">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Sanjay Ghodawat University · CREAM Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-headline text-on-surface">
              SGU Campus Impact & Telemetry Dashboard
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Real-time resource performance metrics, Sahyadri & Kaveri hostel benchmarks, and CREAM clean energy logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigate && (
              <button
                onClick={() => onNavigate('campus-map')}
                className="px-3 py-2 rounded-xl border border-emerald-200/80 bg-pastel-mint text-on-pastel-mint hover:bg-emerald-100 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>View SGU Map</span>
              </button>
            )}

            <button
              onClick={() => triggerSyncNow()}
              disabled={!isOnline || syncState === 'syncing'}
              className="px-3 py-2 rounded-xl border border-card-border bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncState === 'syncing' ? 'Syncing...' : 'Sync Telemetry'}</span>
            </button>

            <button
              onClick={() => onOpenExportModal(dateRangeConfig)}
              className="px-4 py-2 rounded-xl bg-primary-container text-white hover:bg-primary transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export SGU Report</span>
            </button>
          </div>
        </div>

        {/* Date Range Selector Bar */}
        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-card-border mb-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                Telemetry Date Window:
              </span>
            </div>

            {/* Segmented Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: '7d', label: 'Last 7 Days' },
                  { id: '30d', label: 'Last 30 Days' },
                  { id: 'semester', label: 'Academic Term 2025' },
                  { id: 'year', label: 'Annual SGU Cycle' },
                  { id: 'custom', label: 'Custom Range' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setDatePreset(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    datePreset === preset.id
                      ? 'bg-primary-container text-white shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Inputs if 'custom' is active */}
          {datePreset === 'custom' && (
            <div className="mt-4 pt-3 border-t border-card-border flex flex-wrap items-center gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <label className="text-xs text-on-surface-variant">From:</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-card-border bg-surface-container-low text-on-surface"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-on-surface-variant">To:</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-card-border bg-surface-container-low text-on-surface"
                />
              </div>
              <span className="text-xs text-secondary italic">
                Telemetry automatically filters to the selected timestamp window.
              </span>
            </div>
          )}
        </div>

        {/* 4 Core Performance KPI Cards with pastel badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Waste Diverted */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Waste Diverted
              </span>
              <div className="w-8 h-8 rounded-lg bg-pastel-amber text-on-pastel-amber flex items-center justify-center border border-amber-200/50">
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-headline text-primary tabular-nums">
                {modulatedMetrics.wasteTons} T
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+16.4% vs baseline</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                77% towards {metrics.semesterTargetTons} T semester target
              </p>
            </div>
          </div>

          {/* Card 2: Energy Conservation */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                CREAM Solar Yield
              </span>
              <div className="w-8 h-8 rounded-lg bg-pastel-sky text-on-pastel-sky flex items-center justify-center border border-sky-200/50">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-headline text-primary tabular-nums">
                {(modulatedMetrics.kwhSaved / 1000).toFixed(1)}k kWh
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>1 MW Rooftop Grid active</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Tata Tech & BOSCH lab nighttime offsets
              </p>
            </div>
          </div>

          {/* Card 3: Water Conservation */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Water Preserved
              </span>
              <div className="w-8 h-8 rounded-lg bg-pastel-mint text-on-pastel-mint flex items-center justify-center border border-emerald-200/50">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-headline text-primary tabular-nums">
                {modulatedMetrics.waterGallons}M Gal
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Atigre Lake catchment</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Avoided 42,000 PET bottles in hostels
              </p>
            </div>
          </div>

          {/* Card 4: Facility Leak Turnaround */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Issues Managed
              </span>
              <div className="w-8 h-8 rounded-lg bg-pastel-rose text-on-pastel-rose flex items-center justify-center border border-rose-200/50">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-headline text-primary tabular-nums">
                {modulatedMetrics.issues} / 360
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-primary font-semibold">
                <span>96% within 24 hours</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Rapid hostel & lab maintenance cycle
              </p>
            </div>
          </div>
        </div>

        {/* Action Trends Visualizer & Composition Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Main Visualizer Bar Chart */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-2xl border border-card-border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-card-border mb-6 gap-3">
              <div>
                <h3 className="text-lg font-bold font-headline text-on-surface">
                  Monthly Campus Action Trajectory
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Quantified logs across student cohorts and academic departments
                </p>
              </div>

              {/* Metric filter buttons */}
              <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-card-border">
                <button
                  onClick={() => setSelectedChartMetric('actions')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedChartMetric === 'actions'
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Actions
                </button>
                <button
                  onClick={() => setSelectedChartMetric('waste')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedChartMetric === 'waste'
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Waste (T)
                </button>
                <button
                  onClick={() => setSelectedChartMetric('energy')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedChartMetric === 'energy'
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Energy (MWh)
                </button>
              </div>
            </div>

            {/* Interactive chart display */}
            <div className="h-64 flex items-end gap-4 pt-6 px-2">
              {[
                { label: 'Week 1 (Aug)', value: 45, displayVal: '2,400 logs' },
                { label: 'Week 2 (Sep)', value: 62, displayVal: '3,250 logs' },
                { label: 'Week 3 (Sep)', value: 75, displayVal: '3,890 logs' },
                { label: 'Week 4 (Oct)', value: 88, displayVal: '4,450 logs' },
                { label: 'Week 5 (Oct)', value: 96, displayVal: '5,100 logs', isCurrent: true },
                { label: 'Week 6 (Nov)', value: 82, displayVal: '4,200 logs (Est)', isEst: true },
              ].map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-primary bg-secondary-container px-2 py-0.5 rounded shadow-xs mb-1">
                    {point.displayVal}
                  </div>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      point.isCurrent
                        ? 'bg-primary shadow-sm'
                        : point.isEst
                        ? 'bg-surface-container-highest border border-dashed border-outline-variant'
                        : 'bg-secondary-container group-hover:bg-primary-container'
                    }`}
                    style={{ height: `${point.value}%` }}
                  ></div>
                  <span className="text-[11px] text-secondary text-center truncate max-w-full">
                    {point.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-card-border text-xs text-on-surface-variant">
              <span>Baseline: 1,800 weekly actions</span>
              <span className="text-primary font-semibold">+24.6% growth in recurring participation</span>
            </div>
          </div>

          {/* Waste Composition Breakdown */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-2xl border border-card-border shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-1">
                Waste Diversion Breakdown
              </h3>
              <p className="text-xs text-on-surface-variant mb-5">
                Distribution across 18.4 total tons diverted
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-on-surface">Composting & Organic Waste</span>
                    <span className="text-primary font-semibold tabular-nums">44% (8.1 T)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '44%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-on-surface">Paper & Corrugated Cardboard</span>
                    <span className="text-primary font-semibold tabular-nums">30% (5.5 T)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-on-surface">Recycled Metal & Glass</span>
                    <span className="text-primary font-semibold tabular-nums">17% (3.1 T)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: '17%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-on-surface">Electronics & Battery E-Waste</span>
                    <span className="text-primary font-semibold tabular-nums">9% (1.7 T)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '9%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-surface-container-low border border-card-border text-xs text-on-surface-variant">
              <p className="font-semibold text-on-surface mb-0.5">Collegiate Audit Compliance</p>
              <p>Campus zero-contamination diversion threshold reached in 5 of 6 dining halls.</p>
            </div>
          </div>
        </div>

        {/* Residence Hall & Dormitory Benchmarking Leaderboard */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-card-border shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-card-border mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold font-headline text-on-surface">
                  Residence Hall Benchmarking Leaderboard
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Benchmarking diversion rates and per-capita habit points across residential dorms
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search residence hall..."
                className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-card-border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-card-border text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-3 font-semibold">Rank</th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-on-surface"
                  >
                    <div className="flex items-center gap-1">
                      <span>Dormitory / Quad</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('studentsCount')}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-on-surface text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Enrolled</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('wasteDiversionPct')}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-on-surface text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Diversion Rate</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('pointsPerCapita')}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-on-surface text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Points / Capita</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('leakTurnaroundHours')}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-on-surface text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Avg Turnaround</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 font-semibold text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {processedBenchmarks.map((hall, idx) => (
                  <tr key={hall.name} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 font-bold text-primary tabular-nums">#{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-on-surface">{hall.name}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-on-surface-variant">
                      {hall.studentsCount}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-primary">
                      {hall.wasteDiversionPct}%
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-on-surface font-medium">
                      {hall.pointsPerCapita} pts
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-on-surface-variant">
                      {hall.leakTurnaroundHours}h
                    </td>
                    <td className="py-3 px-3 text-center">
                      {hall.trend === 'up' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Rising</span>
                        </span>
                      )}
                      {hall.trend === 'stable' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-secondary">
                          <Minus className="w-3.5 h-3.5" />
                          <span>Stable</span>
                        </span>
                      )}
                      {hall.trend === 'down' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Dip</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Facility Maintenance & Incident Resolution Section */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-card-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-card-border mb-6 gap-3">
            <div>
              <h3 className="text-lg font-bold font-headline text-on-surface">
                Campus Facility Maintenance Telemetry
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Student-submitted leak reports and university operations turnaround logs
              </p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report New Leak / Incident</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilityReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-surface-container-low border border-card-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-secondary-container text-on-secondary-container font-semibold uppercase">
                      {report.type}
                    </span>
                    <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span className="capitalize">{report.status}</span>
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-on-surface mb-1">{report.title}</h4>
                  <p className="text-xs text-on-surface-variant mb-2">
                    {report.building} {report.room ? `· ${report.room}` : ''}
                  </p>
                </div>
                <div className="pt-2 border-t border-card-border flex items-center justify-between text-[11px] text-secondary">
                  <span>Reported by {report.reportedBy}</span>
                  <span>Turnaround: {report.turnaroundHours ? `${report.turnaroundHours}h` : 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
