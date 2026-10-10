import React, { useState } from 'react';
import { ActiveScreen } from './Navbar';
import { ShieldCheck, CheckCircle2, Mail, Phone, MapPin, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (screen: ActiveScreen) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  const [modalContent, setModalContent] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  return (
    <>
      <footer className="w-full bg-surface-container-low text-on-surface py-12 lg:py-16 border-t border-card-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10 mb-12">
            {/* Left Brand Column */}
            <div className="lg:col-span-2 flex flex-col justify-between pr-0 lg:pr-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-primary font-bold text-xs border border-card-border">
                    <span className="font-headline font-extrabold text-primary">SGU</span>
                  </div>
                  <span className="font-headline text-lg text-primary font-bold tracking-tight">
                    SGU EcoTrack
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mb-6 max-w-sm leading-relaxed">
                  Sanjay Ghodawat University, Kolhapur. Small Actions. Greener Campus. Empowering students and faculty with quantified climate intelligence.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pastel-sky rounded-xl text-on-pastel-sky max-w-fit text-xs border border-sky-200/50">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SGU Official Portal · sguk.ac.in</span>
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                Platform & AI Tools
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm text-on-surface-variant">
                <li>
                  <button onClick={() => onNavigate('ecoguide')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    EcoGuide AI Assistant
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('waste-sorting')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    AI Waste Sorting
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('trees')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Campus Tree Monitoring
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('campus-map')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    SGU Campus Map & Sites
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('initiatives')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Sustainability Initiatives
                  </button>
                </li>
              </ul>
            </div>

            {/* Impact & Data Column */}
            <div>
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                Impact & Analytics
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm text-on-surface-variant">
                <li>
                  <button onClick={() => onNavigate('reports')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Sustainability Reports
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('campus-impact')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Live Telemetry Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('challenges')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Campus Challenges
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('events')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Scheduled Events
                  </button>
                </li>
              </ul>
            </div>

            {/* Community Column */}
            <div>
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                Community
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm text-on-surface-variant">
                <li>
                  <button onClick={() => onNavigate('events')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Student Coalition
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('initiatives')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Faculty Liaisons
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('challenges')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Leaderboards
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Partner Facilities
                  </button>
                </li>
              </ul>
            </div>

            {/* Institutional Column */}
            <div>
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                Institutional
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm text-on-surface-variant">
                <li>
                  <button onClick={() => setModalContent('contact')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Contact Officers
                  </button>
                </li>
                <li>
                  <button onClick={() => setModalContent('privacy')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setModalContent('terms')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenAuth('login')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Portal Access
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-6 border-t border-card-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
            <p>© 2025 SGU EcoTrack · Sanjay Ghodawat University (sguk.ac.in). All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button onClick={() => setModalContent('privacy')} className="hover:text-primary transition-colors cursor-pointer">
                Privacy
              </button>
              <button onClick={() => setModalContent('terms')} className="hover:text-primary transition-colors cursor-pointer">
                Terms
              </button>
              <button onClick={() => setModalContent('contact')} className="hover:text-primary transition-colors cursor-pointer">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Info Modals */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest border border-card-border rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setModalContent(null)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {modalContent === 'privacy' && (
              <div>
                <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">Campus Privacy Policy</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                  EcoTrack safeguards student and faculty data in compliance with university privacy guidelines. All individual habit logs are aggregated into anonymized dormitory benchmarking telemetry. Personal names are only displayed within chosen peer coalitions.
                </p>
                <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant space-y-1">
                  <p>• Data encrypted in transit and locally cached in device storage.</p>
                  <p>• Opt-out controls available for residence hall public leaderboards.</p>
                  <p>• Zero third-party behavioral advertising.</p>
                </div>
              </div>
            )}

            {modalContent === 'terms' && (
              <div>
                <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">Collegiate Terms of Use</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                  By utilizing EcoTrack, participants agree to submit truthful sustainability actions and facility leak telemetry. Service credits and eco-points awarded through the platform are governed by campus student engagement charters.
                </p>
                <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant space-y-1">
                  <p>• Valid campus affiliation (.edu email) required for verification.</p>
                  <p>• Facility reports dispatch directly to University Operations.</p>
                </div>
              </div>
            )}

            {modalContent === 'contact' && (
              <div>
                <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">SGU Sustainability & Facilities Office</h3>
                <p className="text-sm text-on-surface-variant mb-4">
                  Get in touch with Sanjay Ghodawat University green campus coordinators, CREAM researchers, and hostel student leaders.
                </p>
                <div className="space-y-3 text-sm text-on-surface">
                  <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-card-border">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-xs text-on-surface-variant">General Sustainability Inquiries</p>
                      <p className="text-sm font-medium">sustainability@sguk.ac.in</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-card-border">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-xs text-on-surface-variant">Campus Facilities Emergency Line</p>
                      <p className="text-sm font-medium">+91 230 2463700 · Toll Free 1800 31300 1566</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-card-border">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-xs text-on-surface-variant">Atigre Campus Headquarters</p>
                      <p className="text-sm font-medium">Kolhapur - Sangli Highway, Atigre, Dist. Kolhapur, Maharashtra 416118</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={() => setModalContent(null)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary-container text-white hover:bg-primary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
