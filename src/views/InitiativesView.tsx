import React, { useState } from 'react';
import { ActiveScreen } from '../components/Navbar';
import { useSync } from '../context/SyncContext';
import {
  Trash2,
  Droplets,
  Zap,
  Leaf,
  Building,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

interface InitiativesViewProps {
  onOpenReportModal: () => void;
  onNavigate?: (screen: ActiveScreen) => void;
}

export const InitiativesView: React.FC<InitiativesViewProps> = ({ onOpenReportModal, onNavigate }) => {
  const { metrics, facilityReports } = useSync();
  const [selectedPillar, setSelectedPillar] = useState<'waste' | 'water' | 'energy' | 'green'>('waste');

  const pillars = [
    {
      id: 'waste',
      title: 'Waste Diversion & Circularity',
      icon: Trash2,
      stat: `${metrics.wasteDivertedTons} Tons`,
      statSub: 'Diverted from landfill this semester',
      desc: 'Institutional program implementing aerated organic composting chutes across all collegiate dining halls, electronic recycling depots, and zero-single-use campus policies.',
      milestones: [
        '95% zero-contamination diversion threshold reached in Sahyadri & Kaveri Quads',
        '8,400 kg post-consumer food scraps converted to SGU botanical garden bio-compost',
        '3 tons reusable textbook & move-out donation cycles managed across hostels',
      ],
      initiativesList: [
        'SGU Food Court Trayless Protocol',
        'CREAM Electronic Waste E-Depots',
        'Zero Single-Use Plastic Mandate',
      ],
    },
    {
      id: 'water',
      title: 'Water Stewardship & Leak Detection',
      icon: Droplets,
      stat: '1.85M Gallons',
      statSub: 'Conserved via low-flow & smart refilling stations',
      desc: 'High-frequency telemetry infrastructure coupled with student crowdsourced reporting to detect slow faucet and pipe leaks across athletic complexes, lab restrooms, and residence dorms.',
      milestones: [
        'Average leak-to-repair cycle stabilized at 24 hours',
        '124 hydration refilling stations installed across campus',
        'Dual-flush retrofits completed in 80% of academic halls',
      ],
      initiativesList: [
        'Smart Hydration Refill Grid',
        'Rainwater Harvesting Cisterns',
        'Acoustic Pipe Leak Probing',
      ],
    },
    {
      id: 'energy',
      title: 'Grid Efficiency & Clean Energy',
      icon: Zap,
      stat: '428.5 MWh',
      statSub: 'Avoided through peak shedding & LED transitions',
      desc: 'Collaborative energy audits between facilities staff and engineering students to shut down idle lab hoods, eliminate vampire power draws, and optimize central campus HVAC schedules.',
      milestones: [
        'Central Library HVAC setback algorithms saved 18% peak cooling demand',
        'Engineering Plaza rooftop solar microgrid producing 45 kW clean continuous power',
        'Dormitory vampire load audits conducted every Thursday night',
      ],
      initiativesList: [
        'Solar Quad Array Microgrid',
        'Nighttime Lab Equipment Fumehood Closures',
        'Smart Thermostat Dorm Optimization',
      ],
    },
    {
      id: 'green',
      title: 'Biodiversity & Native Bioswales',
      icon: Leaf,
      stat: '42 Acres',
      statSub: 'Designated monarch & native flora corridors',
      desc: 'Preserving native collegiate flora, mitigating stormwater runoff through engineered bioswales, and maintaining student-operated organic agricultural plots.',
      milestones: [
        '120 native drought-tolerant oak saplings planted in North Arboretum',
        '4 new bioswales filtering 98% sediment runoff along Creek Trail',
        'Campus apiary honey harvest supporting student environmental scholarships',
      ],
      initiativesList: [
        'Creek Trail Bioswale Restoration',
        'Pollinator Butterfly Meadow Plots',
        'Collegiate Agroecology Garden',
      ],
    },
  ];

  const currentPillar = pillars.find((p) => p.id === selectedPillar) || pillars[0];
  const IconComponent = currentPillar.icon;

  return (
    <div className="w-full py-8 lg:py-12 bg-background min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1 block">
              University Operations & Programs
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-headline text-on-surface">
              Campus Sustainability Initiatives
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
              Collaborative programs between University Facilities, student coalitions, and academic departments engineered for long-term ecological resilience.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 rounded-xl bg-primary-container text-white hover:bg-primary transition-colors text-xs font-semibold flex items-center gap-2 shadow-sm self-start md:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Facility Issue</span>
          </button>
        </div>

        {/* Pillar Switcher Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pillars.map((p) => {
            const PIcon = p.icon;
            const isSelected = selectedPillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(p.id as any)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-secondary-container/40 border-primary shadow-sm'
                    : 'bg-surface-container-lowest border-card-border hover:bg-surface-container-low'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-primary text-white' : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  <PIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-on-surface mb-1">{p.title}</h3>
                <p className="text-xs text-primary font-semibold">{p.stat}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Deep Dive Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-card-border shadow-sm mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-card-border mb-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <IconComponent className="w-4 h-4" />
                <span>Pillar Overview</span>
              </div>
              <h2 className="text-2xl font-bold font-headline text-on-surface mb-3">
                {currentPillar.title}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-3xl">
                {currentPillar.desc}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-low border border-card-border min-w-[240px]">
              <span className="text-xs text-secondary uppercase font-semibold">Impact Metric</span>
              <div className="text-3xl font-bold font-headline text-primary mt-1 mb-0.5">
                {currentPillar.stat}
              </div>
              <p className="text-xs text-on-surface-variant">{currentPillar.statSub}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-sm text-on-surface mb-3">Key Verified Milestones</h4>
              <ul className="space-y-2.5">
                {currentPillar.milestones.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface mb-3">Active Operational Workstreams</h4>
              <div className="space-y-2">
                {currentPillar.initiativesList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-container-low border border-card-border flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-on-surface">{item}</span>
                    <span className="text-primary font-semibold">Active · Synced</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Building Efficiency Scorecard Table */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-card-border mb-6 gap-3">
            <div>
              <h3 className="text-lg font-bold font-headline text-on-surface">
                Academic & Residential Facility Scorecard
              </h3>
              <p className="text-xs text-on-surface-variant">
                Live building automation telemetry: HVAC efficiency, smart meter uptime, and water sensor health
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('campus-map')}
                  className="px-3 py-1.5 rounded-lg bg-pastel-mint text-on-pastel-mint hover:bg-emerald-100 border border-emerald-200/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>View on SGU Map</span>
                </button>
              )}
              <button
                onClick={onOpenReportModal}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                Notice an anomaly? Report leak
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'School of Technology (Block A)', grade: 'A', score: '95/100', hvac: 'Solar Powered', leakStatus: '0 Active' },
              { name: 'Central Knowledge Resource Centre', grade: 'A-', score: '91/100', hvac: 'Setback Active', leakStatus: '0 Active' },
              { name: 'Sahyadri Boys Hostel (Quad A)', grade: 'B+', score: '88/100', hvac: 'Nominal', leakStatus: '1 Resolved' },
              { name: 'SGU Central Food Court', grade: 'B', score: '84/100', hvac: 'Peak Shift', leakStatus: '1 Resolved' },
              { name: 'CREAM Renewable Energy Lab', grade: 'A+', score: '98/100', hvac: 'Optimized', leakStatus: '0 Active' },
              { name: 'SGU International Sports Arena', grade: 'B-', score: '80/100', hvac: 'Audit Due', leakStatus: 'Inspection Sched' },
            ].map((facility) => (
              <div
                key={facility.name}
                className="p-4 rounded-xl bg-surface-container-low border border-card-border flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-on-surface">{facility.name}</span>
                  <span className="w-7 h-7 rounded-lg bg-secondary-container text-primary font-bold text-xs flex items-center justify-center">
                    {facility.grade}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-on-surface-variant mt-2 pt-2 border-t border-card-border">
                  <div className="flex justify-between">
                    <span>Efficiency Score:</span>
                    <span className="font-semibold text-primary">{facility.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HVAC Status:</span>
                    <span>{facility.hvac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facility Turnaround:</span>
                    <span>{facility.leakStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
