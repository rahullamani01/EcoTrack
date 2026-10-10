import React, { useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Compass,
  Zap,
  GraduationCap,
  Home,
  Coffee,
  Trophy,
  ExternalLink,
  Navigation,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';

export interface CampusLocation {
  id: string;
  name: string;
  category: 'admin' | 'energy' | 'academic' | 'hostel' | 'dining' | 'sports' | 'entrance';
  categoryLabel: string;
  lat: number;
  lng: number;
  description: string;
  ecoFeature: string;
  status: string;
}

export const SGU_CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'sgu-main',
    name: 'SGU Administrative Tower & Central Quad',
    category: 'admin',
    categoryLabel: 'Administration',
    lat: 16.7454,
    lng: 74.3752,
    description: 'Central university administrative headquarters, vice-chancellor office, and student services.',
    ecoFeature: 'Paperless digital governance & LEED silver energy-efficient lighting',
    status: 'Operational · Telemetry Active',
  },
  {
    id: 'sgu-cream',
    name: 'CREAM Renewable Energy & Solar Farm',
    category: 'energy',
    categoryLabel: 'Clean Energy',
    lat: 16.7461,
    lng: 74.3746,
    description: 'Center for Renewable Energy & Advanced Materials; campus rooftop solar generation grid.',
    ecoFeature: '428.5 MWh clean power generated, real-time smart inverter monitoring',
    status: 'Active Generation · 45 kW Peak',
  },
  {
    id: 'sgu-tech',
    name: 'School of Technology (Engineering Blocks A & B)',
    category: 'academic',
    categoryLabel: 'Academic',
    lat: 16.7448,
    lng: 74.3758,
    description: 'Computer Science, Mechanical, Civil & Aeronautical Engineering laboratories and lecture halls.',
    ecoFeature: 'Motion-activated LED retrofits & computer lab power-down scheduler',
    status: 'High Efficiency · 95/100 Score',
  },
  {
    id: 'sgu-library',
    name: 'Central Knowledge Resource Centre (Library)',
    category: 'academic',
    categoryLabel: 'Academic',
    lat: 16.7459,
    lng: 74.3756,
    description: 'Multi-story library with digital archives, research desks, and natural airflow design.',
    ecoFeature: 'Smart HVAC temperature setback system saving 18% cooling energy',
    status: 'Optimized · Air Quality Clean',
  },
  {
    id: 'sgu-sahyadri',
    name: 'Sahyadri Boys Hostel (Quad A)',
    category: 'hostel',
    categoryLabel: 'Residence',
    lat: 16.7442,
    lng: 74.3744,
    description: 'Residential quarters for engineering & management students with dedicated study halls.',
    ecoFeature: '#1 Campus Leaderboard: 72% waste diversion rate & solar water heaters',
    status: 'Rank #1 · Zero Contamination',
  },
  {
    id: 'sgu-kaveri',
    name: 'Kaveri Girls Hostel (Quad B)',
    category: 'hostel',
    categoryLabel: 'Residence',
    lat: 16.7440,
    lng: 74.3762,
    description: 'Secure, modern campus residence surrounded by landscaped green courtyard.',
    ecoFeature: 'Dual-flush plumbing retrofits & student compost initiative',
    status: 'Rank #2 · 68% Waste Diverted',
  },
  {
    id: 'sgu-foodcourt',
    name: 'SGU Central Food Court & Mess Commons',
    category: 'dining',
    categoryLabel: 'Dining',
    lat: 16.7450,
    lng: 74.3748,
    description: 'Primary student dining hub serving fresh meals across regional and multi-cuisine counters.',
    ecoFeature: 'Trayless food policy & aerated bio-waste composting chutes',
    status: 'Zero Plastic Zone',
  },
  {
    id: 'sgu-sports',
    name: 'SGU International Sports Arena & Stadium',
    category: 'sports',
    categoryLabel: 'Recreation',
    lat: 16.7468,
    lng: 74.3738,
    description: 'Outdoor athletic grounds, cricket pavilion, basketball courts, and running track.',
    ecoFeature: 'Perimeter rainwater bioswales capturing 98% storm runoff',
    status: 'Native Green Buffer',
  },
  {
    id: 'sgu-gate',
    name: 'SGU Main Highway Entrance (Atigre Gate)',
    category: 'entrance',
    categoryLabel: 'Campus Gateway',
    lat: 16.7436,
    lng: 74.3755,
    description: 'Main university portal on the Kolhapur - Sangli National Highway corridor.',
    ecoFeature: 'Electric shuttle pickup station & campus bicycle share hub',
    status: '24/7 Security & EV Access',
  },
];

// Helper camera controller
const MapCameraController: React.FC<{ target: { lat: number; lng: number; zoom: number } | null }> = ({
  target,
}) => {
  const map = useMap();
  React.useEffect(() => {
    if (map && target) {
      map.panTo({ lat: target.lat, lng: target.lng });
      map.setZoom(target.zoom);
    }
  }, [map, target]);
  return null;
};

interface CampusMapProps {
  apiKey?: string;
  heightClass?: string;
  showSidebar?: boolean;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  heightClass = 'h-[500px] lg:h-[580px]',
  showSidebar = true,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(
    SGU_CAMPUS_LOCATIONS[0]
  );
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [cameraTarget, setCameraTarget] = useState<{ lat: number; lng: number; zoom: number } | null>({
    lat: 16.7454,
    lng: 74.3752,
    zoom: 16,
  });

  const filteredLocations = SGU_CAMPUS_LOCATIONS.filter((loc) => {
    if (activeCategoryFilter === 'all') return true;
    return loc.category === activeCategoryFilter;
  });

  const handleSelectLocation = useCallback((loc: CampusLocation) => {
    setSelectedLocation(loc);
    setCameraTarget({
      lat: loc.lat,
      lng: loc.lng,
      zoom: 17,
    });
  }, []);

  const handleResetView = () => {
    setSelectedLocation(null);
    setCameraTarget({
      lat: 16.7454,
      lng: 74.3752,
      zoom: 16,
    });
  };

  const getCategoryIcon = (category: CampusLocation['category']) => {
    switch (category) {
      case 'energy':
        return <Zap className="w-3.5 h-3.5 text-emerald-700" />;
      case 'academic':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />;
      case 'hostel':
        return <Home className="w-3.5 h-3.5 text-emerald-700" />;
      case 'dining':
        return <Coffee className="w-3.5 h-3.5 text-emerald-700" />;
      case 'sports':
        return <Trophy className="w-3.5 h-3.5 text-emerald-700" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-emerald-700" />;
    }
  };

  return (
    <div className="w-full rounded-2xl border border-card-border bg-surface-container-lowest overflow-hidden shadow-sm">
      {/* Top Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-card-border bg-pastel-mint/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pastel-mint flex items-center justify-center text-primary font-bold shadow-xs border border-emerald-200/60">
            <Navigation className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-base text-primary">
                Sanjay Ghodawat University (SGU) Campus Map
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pastel-mint text-on-pastel-mint border border-emerald-200/50">
                Kolhapur · Atigre
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Kolhapur - Sangli Highway, Atigre, Maharashtra 416118 · Real-time Green Telemetry Sites
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetView}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-container-low hover:bg-surface-container text-primary border border-card-border transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Recenter SGU</span>
          </button>
          <a
            href="https://maps.google.com/?q=Sanjay+Ghodawat+University+Kolhapur+Atigre"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-container text-white hover:bg-primary transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Open in Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Category Filter Pills (Light pastel aesthetic) */}
      <div className="px-4 py-2.5 border-b border-card-border bg-surface-container-lowest flex items-center gap-1.5 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'All SGU Sites' },
          { id: 'energy', label: '☀️ Solar & Clean Tech' },
          { id: 'academic', label: '🎓 Academic Halls' },
          { id: 'hostel', label: '🏡 Student Hostels' },
          { id: 'dining', label: '🥗 Food Court & Mess' },
          { id: 'sports', label: '🏆 Sports & Grounds' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveCategoryFilter(filter.id)}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
              activeCategoryFilter === filter.id
                ? 'bg-pastel-mint text-on-pastel-mint border border-emerald-200/60 font-semibold shadow-2xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Main Map + Location List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Interactive Google Map Section */}
        <div className={`relative ${showSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} ${heightClass}`}>
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={{ lat: 16.7454, lng: 74.3752 }}
              defaultZoom={16}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_git_agentskills_v1']}
              style={{ width: '100%', height: '100%' }}
              gestureHandling="greedy"
              disableDefaultUI={false}
              fullscreenControl={false}
              streetViewControl={false}
            >
              <MapCameraController target={cameraTarget} />

              {/* Advanced Markers for Campus Locations */}
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <AdvancedMarker
                    key={loc.id}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    onClick={() => handleSelectLocation(loc)}
                    title={loc.name}
                  >
                    <Pin
                      background={isSelected ? '#195b32' : '#dcfce7'}
                      borderColor={isSelected ? '#dcfce7' : '#195b32'}
                      glyphColor={isSelected ? '#ffffff' : '#14532d'}
                      scale={isSelected ? 1.25 : 1.0}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for Selected Location */}
              {selectedLocation && (
                <InfoWindow
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  onCloseClick={() => setSelectedLocation(null)}
                  pixelOffset={[0, -38]}
                >
                  <div className="p-2 max-w-[260px] text-left text-slate-800">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                      {getCategoryIcon(selectedLocation.category)}
                      <span>{selectedLocation.categoryLabel}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight mb-1">
                      {selectedLocation.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                      {selectedLocation.description}
                    </p>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 mb-2">
                      <span className="text-[10px] font-semibold text-emerald-800 block">Eco Feature:</span>
                      <span className="text-[10px] text-emerald-700">{selectedLocation.ecoFeature}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                      <span className="text-emerald-700 font-semibold">{selectedLocation.status}</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-800 font-bold underline hover:text-emerald-950 flex items-center gap-0.5"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Map Overlay Badge */}
          <div className="absolute bottom-4 left-4 z-10 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-card-border shadow-xs text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-primary">SGU Campus Coordinates:</span>
              <span className="text-on-surface-variant font-mono text-[11px]">16.7454° N, 74.3752° E</span>
            </div>
          </div>
        </div>

        {/* Sidebar POI Explorer */}
        {showSidebar && (
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-card-border bg-surface-container-lowest flex flex-col max-h-[580px] overflow-hidden">
            <div className="p-3.5 border-b border-card-border bg-surface-container-low flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Explore SGU Buildings ({filteredLocations.length})
              </span>
              <span className="text-[11px] text-on-surface-variant">Click to focus map</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pastel-mint border-primary shadow-xs'
                        : 'bg-surface-container-lowest border-card-border hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(loc.category)}
                        <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
                          {loc.categoryLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-primary font-semibold">
                        {loc.status.split('·')[0]}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-on-surface mb-1 leading-snug">
                      {loc.name}
                    </h4>

                    <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed mb-1.5">
                      {loc.description}
                    </p>

                    <div className="pt-1.5 border-t border-card-border/60 flex items-center gap-1 text-[10px] text-primary font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{loc.ecoFeature}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
