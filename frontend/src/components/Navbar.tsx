import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Zap,
  User,
  ExternalLink,
  Laptop,
  Download
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  id?: string;
  activePage: string;
  user: UserProfile | null;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onSimulateIncident: () => void;
  isSimulating: boolean;
  onExport?: () => void;
}

export default function Navbar({
  id = 'weatherops-navbar',
  activePage,
  user,
  sidebarCollapsed,
  setSidebarCollapsed,
  darkMode,
  setDarkMode,
  onSimulateIncident,
  isSimulating,
  onExport,
}: NavbarProps) {
  const getPageTitle = () => {
    switch (activePage) {
      case 'overview':
        return 'Intelligence Overview';
      case 'locations':
        return 'Location Monitoring Registry';
      case 'rules':
        return 'Automated Weather Rules';
      case 'alerts':
        return 'Weather-Triggered Alerts';
      case 'settings':
        return 'Platform Settings';
      default:
        return 'WeatherOps Console';
    }
  };

  const getPageSubtitle = () => {
    switch (activePage) {
      case 'overview':
        return 'Real-time weather KPI matrices, status indicators and incidents.';
      case 'locations':
        return 'Manage and provision geographic critical response monitoring units.';
      case 'rules':
        return 'Define metric thresholds and notification triggers.';
      case 'alerts':
        return 'Audit log of automated alarm excursions and critical weather conditions.';
      case 'settings':
        return 'Configure your user profile, manage security API keys, and notification channels.';
      default:
        return 'Event-Driven Weather Intelligence Platform.';
    }
  };

  return (
    <header
      id={id}
      className={`fixed top-0 right-0 z-20 h-14 bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
        user ? (sidebarCollapsed ? 'left-16' : 'left-64') : 'left-0'
      }`}
    >
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {user && (
          <button
            id="mobile-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer text-slate-400 hover:text-slate-950"
            title="Toggle sidebar"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        )}
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-slate-950 dark:text-white leading-tight font-display tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 hidden md:block font-medium">
            {getPageSubtitle()}
          </p>
        </div>
      </div>

      {/* Primary Actions (Incident Trigger, Theme Toggle, Profile summary) */}
      <div className="flex items-center gap-3">
        {/* Export Data button */}
        {user && onExport && (
          <button
            id="export-data-button"
            type="button"
            onClick={onExport}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all duration-150 border bg-indigo-600 hover:bg-indigo-700 text-white border-transparent dark:bg-indigo-700 dark:hover:bg-indigo-600"
            title="Export data to CSV or JSON"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Export</span>
          </button>
        )}

        {/* Incident Trigger Simulator button */}
        {user && (
          <button
            id="trigger-incident-button"
            type="button"
            disabled={isSimulating}
            onClick={onSimulateIncident}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all duration-150 border ${
              isSimulating
                ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 animate-pulse'
                : 'bg-slate-900 hover:bg-black text-white border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${isSimulating ? 'animate-bounce text-amber-500' : 'text-amber-400 dark:text-indigo-400'}`} />
            <span className="hidden xs:inline">
              {isSimulating ? 'Processing Sim...' : 'Simulate Event'}
            </span>
          </button>
        )}

        {/* Theme select dropdown or cycle switch */}
        <button
          id="theme-slider-switch"
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-md bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-150 dark:border-slate-750 transition-all cursor-pointer"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-slate-655" />
          )}
        </button>

        {/* API Connection Indicator */}
        <div className="hidden xs:flex items-center gap-1.2 px-2 py-1.2 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15 text-[10px] font-mono font-bold uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Simulated Mode</span>
        </div>
      </div>
    </header>
  );
}
