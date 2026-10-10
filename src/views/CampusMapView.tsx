import React, { useState } from 'react';
import { CampusMap, SGU_CAMPUS_LOCATIONS } from '../components/CampusMap';
import {
  MapPin,
  Navigation,
  Compass,
  Bus,
  Train,
  Car,
  Leaf,
  Sun,
  Droplets,
  Building,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

interface CampusMapViewProps {
  onOpenReportModal: () => void;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({ onOpenReportModal }) => {
  return (
    <div className="w-full py-8 lg:py-12 bg-background min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-pastel-mint text-on-pastel-mint border border-emerald-200/60 w-fit text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Sanjay Ghodawat University · Kolhapur - Sangli Highway, Atigre</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-headline text-on-surface">
              SGU Campus Location & Green Infrastructure Map
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
              Explore the 150+ acre Sanjay Ghodawat University campus in Atigre, Kolhapur. Navigate academic faculties, rooftop CREAM solar arrays, student residence halls, and eco-stewardship monitoring points.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2.5 rounded-xl bg-pastel-mint text-on-pastel-mint hover:bg-emerald-100 border border-emerald-200/80 transition-colors text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>Report Anomaly on Map</span>
            </button>
            <a
              href="https://maps.google.com/?q=Sanjay+Ghodawat+University+Kolhapur+Atigre"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-primary-container text-white hover:bg-primary transition-colors text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Driving Directions</span>
            </a>
          </div>
        </div>

        {/* Quick Location Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-card-border shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center text-primary shrink-0 border border-emerald-200/50">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-[11px] text-secondary font-medium">Solar Microgrid</span>
              <p className="text-base font-bold text-on-surface">428.5 MWh</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-card-border shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pastel-sky flex items-center justify-center text-on-pastel-sky shrink-0 border border-sky-200/50">
              <Droplets className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <span className="text-[11px] text-secondary font-medium">Water Cisterns</span>
              <p className="text-base font-bold text-on-surface">1.85M Gal</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-card-border shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center text-primary shrink-0 border border-emerald-200/50">
              <Leaf className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-[11px] text-secondary font-medium">Campus Acreage</span>
              <p className="text-base font-bold text-on-surface">150+ Acres</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-card-border shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pastel-amber flex items-center justify-center text-on-pastel-amber shrink-0 border border-amber-200/50">
              <Building className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="text-[11px] text-secondary font-medium">Active Quads</span>
              <p className="text-base font-bold text-on-surface">9 Sites</p>
            </div>
          </div>
        </div>

        {/* Primary Interactive Google Maps Component */}
        <div className="mb-10">
          <CampusMap heightClass="h-[520px] lg:h-[620px]" showSidebar={true} />
        </div>

        {/* Getting to Sanjay Ghodawat University (Transit & Directions Guide) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: By Road */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center text-primary mb-3 border border-emerald-200/50">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-headline text-base text-on-surface mb-2">
              By Road (NH 166 Corridor)
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
              Directly connected via the 4-lane Kolhapur - Sangli Highway. Approximately 18 km from Central Kolhapur and 30 km from Sangli city center.
            </p>
            <div className="text-[11px] text-primary font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus parking with EV charging bays</span>
            </div>
          </div>

          {/* Card 2: Public Bus & University Shuttles */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-pastel-sky flex items-center justify-center text-on-pastel-sky mb-3 border border-sky-200/50">
              <Bus className="w-5 h-5 text-sky-700" />
            </div>
            <h3 className="font-bold font-headline text-base text-on-surface mb-2">
              University Shuttles & KMT/MSRTC
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
              Fleet of 100+ eco-certified university buses connecting Kolhapur CBS, Jaysingpur, Ichalkaranji, Sangli, and Miraj daily for students and faculty.
            </p>
            <div className="text-[11px] text-primary font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Regular Atigre Bus Stop service</span>
            </div>
          </div>

          {/* Card 3: Railway & Airport Connections */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-card-border shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-pastel-amber flex items-center justify-center text-on-pastel-amber mb-3 border border-amber-200/50">
              <Train className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-bold font-headline text-base text-on-surface mb-2">
              Train & Flight Connectivity
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
              Chhatrapati Shahu Maharaj Terminus (Kolhapur) is ~20 km away. Kolhapur Airport (KLH) at Ujalaiwadi is 24 km via highway bypass.
            </p>
            <div className="text-[11px] text-primary font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus pickup upon orientation</span>
            </div>
          </div>
        </div>

        {/* Address Card & Contact Footer */}
        <div className="p-6 rounded-2xl bg-pastel-mint/40 border border-emerald-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary font-bold shadow-xs border border-emerald-200">
              <Navigation className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">
                Sanjay Ghodawat University Postal Coordinates
              </h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Kolhapur - Sangli Highway, A/P Atigre, Tal. Hatkanangale, Dist. Kolhapur, Maharashtra 416118, India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.sguk.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-primary border border-card-border transition-colors flex items-center gap-1.5"
            >
              <span>sguk.ac.in Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://maps.google.com/?q=Sanjay+Ghodawat+University+Kolhapur+Atigre"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-container text-white hover:bg-primary transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
