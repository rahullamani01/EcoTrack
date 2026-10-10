import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Menu, X, User as UserIcon, LogOut, Shield } from 'lucide-react';

export type ActiveScreen =
  | 'home'
  | 'ecoguide'
  | 'waste-sorting'
  | 'reports'
  | 'trees'
  | 'campus-map'
  | 'initiatives'
  | 'challenges'
  | 'campus-impact'
  | 'events'
  | 'profile';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate, onOpenAuth }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: { id: ActiveScreen; label: string; badge?: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'ecoguide', label: 'EcoGuide AI', badge: 'AI' },
    { id: 'waste-sorting', label: 'AI Waste Sorting', badge: 'Vision' },
    { id: 'reports', label: 'Sustainability Reports' },
    { id: 'trees', label: 'Tree Monitoring' },
    { id: 'campus-map', label: 'Campus Map' },
    { id: 'initiatives', label: 'Initiatives' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'events', label: 'Events' },
  ];

  const handleNavClick = (screen: ActiveScreen) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-card-border">
      <div className="h-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Zone */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-xs border border-card-border group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/images/sgu-logo.png"
                alt="SGU Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to text initials if image ever fails
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline text-lg sm:text-xl text-primary font-bold tracking-tight">
                  EcoTrack
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] rounded-full bg-pastel-mint text-on-pastel-mint font-semibold border border-emerald-200/50">
                  sguk.ac.in
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium hidden md:inline">
                Sanjay Ghodawat University · Kolhapur
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 ml-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-xs xl:text-sm py-1 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'text-primary font-bold border-b-2 border-primary pb-0.5'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-pastel-mint text-primary border border-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* User Auth controls */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-on-surface line-clamp-1 max-w-[100px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-primary font-semibold capitalize">
                    {user.points} pts
                  </span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container-lowest border border-card-border p-2 shadow-xl z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-card-border mb-1">
                    <p className="text-xs font-semibold text-on-surface">{user.name}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full bg-secondary-container text-on-secondary-container capitalize font-medium">
                      {user.role} · {user.points} Eco-Points
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleNavClick('profile');
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-surface-container text-on-surface flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-primary" />
                    <span>My Dashboard & Sync Audit</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:inline-flex text-sm text-on-surface-variant hover:text-primary transition-colors px-3 py-2 cursor-pointer font-medium"
              >
                Log in
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center justify-center text-sm font-medium bg-primary-container text-white hover:bg-primary transition-colors px-4 sm:px-5 py-2.5 rounded-xl shadow-[0_1px_4px_rgba(35,79,61,0.12)] cursor-pointer"
              >
                Join the Movement
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-b border-card-border px-6 py-5 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                  currentScreen === item.id
                    ? 'bg-secondary-container text-on-surface font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-3 border-t border-card-border flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="text-left py-2 px-3 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-primary" />
                    <span>My Profile & Device Sync</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-2 px-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl text-sm font-medium border border-card-border text-on-surface hover:bg-surface-container text-center"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl text-sm font-medium bg-primary-container text-white hover:bg-primary text-center"
                  >
                    Join the Movement
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
