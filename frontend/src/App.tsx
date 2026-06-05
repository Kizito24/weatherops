import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  BellRing
} from 'lucide-react';
import { authApi } from './lib/api/auth';
import { locationsApi } from './lib/api/locations';
import { rulesApi } from './lib/api/rules';
import { alertsApi } from './lib/api/alerts';
import { tokenManager } from './lib/auth/tokenManager';
import { Location, Rule, Alert, UserProfile, WeatherMetric, RuleOperator } from './types';

// Page components imports
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import OverviewPage from './components/OverviewPage';
import LocationsPage from './components/LocationsPage';
import RulesPage from './components/RulesPage';
import AlertsPage from './components/AlertsPage';
import SettingsPage from './components/SettingsPage';

interface Toast {
  id: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'INFO';
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activePage, setActivePage] = useState<string>('login');
  
  // App Data State
  const [locations, setLocations] = useState<Location[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Layout state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('weatherops_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulatingTrigger, setIsSimulatingTrigger] = useState(false);

  // Toast alert states
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 1. Add/Remove dark theme root class dynamically
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('weatherops_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('weatherops_theme', 'light');
    }
  }, [darkMode]);

  // 2. User & Session routing sync
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const validPages = ['overview', 'locations', 'rules', 'alerts', 'settings'];

    if (tokenManager.isAuthenticated()) {
      // User is authenticated, set default page
      if (validPages.includes(hash)) {
        setActivePage(hash);
      } else {
        setActivePage('overview');
        window.location.hash = 'overview';
      }
      // Create user profile from stored data (email from token if available)
      const user: UserProfile = {
        name: 'User',
        email: '',
        role: 'User',
        apiKey: '',
        notifications: { email: true, sms: false, system: true },
      };
      setUser(user);
    } else {
      // User is not authenticated
      if (hash === 'register') {
        setActivePage('register');
      } else {
        setActivePage('login');
      }
    }
  }, []);

  // Sync state router on direct hash change events
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');

      if (!tokenManager.isAuthenticated()) {
        if (hash === 'register') setActivePage('register');
        else setActivePage('login');
        return;
      }

      const validPages = ['overview', 'locations', 'rules', 'alerts', 'settings'];
      if (validPages.includes(hash)) {
        setActivePage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  // Collapse sidebar on mobile automatically from screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Data loading effects when session activates
  const loadPlatformData = async () => {
    if (!tokenManager.isAuthenticated()) return;
    setIsLoading(true);
    try {
      const [locList, aList] = await Promise.all([
        locationsApi.list(),
        alertsApi.list(),
      ]);

      setLocations(locList);
      setAlerts(aList);

      // Load rules for each location
      const allRules: Rule[] = [];
      for (const loc of locList) {
        try {
          const locRules = await rulesApi.list(loc.id);
          allRules.push(...locRules);
        } catch (e) {
          console.error(`Failed to load rules for location ${loc.id}:`, e);
        }
      }
      setRules(allRules);
    } catch (e) {
      console.error('Data loading error: ', e);
      showToast('Data Sync Error', 'Failed to load weather data. Please refresh.', 'MEDIUM');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && tokenManager.isAuthenticated()) {
      loadPlatformData();
    }
  }, [user]);

  // Page hash setter
  const navigateTo = (pageName: string) => {
    setActivePage(pageName);
    window.location.hash = pageName;
  };

  // Toast Dispatcher Helper
  const showToast = (title: string, message: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'INFO' = 'INFO') => {
    const newToast: Toast = {
      id: 'toast-' + Math.random().toString(36).substring(2, 9),
      title,
      message,
      severity,
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 4. Operational Trigger handlers
  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    showToast(`Welcome`, `Logged in as ${authenticatedUser.email}. Operational console synchronized.`, 'INFO');
    navigateTo('overview');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setLocations([]);
    setRules([]);
    setAlerts([]);
    showToast('Decommissioned Session', 'You have been disconnected safely from WeatherOps nodes.', 'INFO');
    navigateTo('login');
  };

  const handleUpdateUserProfile = async (updates: Partial<UserProfile>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null);
    showToast('Profile Synced', 'Global console parameters updated successfully.', 'INFO');
    return user;
  };

  // Location CRUD callbacks
  const handleAddLocation = async (name: string, lat: number, lng: number) => {
    try {
      const res = await locationsApi.create(name, lat, lng);
      showToast('Location Provisioned', `Position "${res.name}" added to global weather registry.`, 'LOW');
      await loadPlatformData();
      return res;
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || 'Failed to create location';
      throw new Error(errorMsg);
    }
  };

  const handleEditLocation = async (id: string, name: string, lat: number, lng: number) => {
    try {
      const res = await locationsApi.update(id, name, lat, lng);
      showToast('Coordinates Corrected', `Configuration for "${res.name}" successfully updated.`, 'LOW');
      await loadPlatformData();
      return res;
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || 'Failed to update location';
      throw new Error(errorMsg);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      const locToDelete = locations.find((l) => l.id === id);
      await locationsApi.delete(id);
      showToast('Decommissioned Station', `Monitoring station "${locToDelete?.name || ''}" dismantled. Associated rules wiped.`, 'INFO');
      await loadPlatformData();
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || 'Failed to delete location';
      throw new Error(errorMsg);
    }
  };

  // Weather Rules callbacks
  const handleCreateRule = async (locationId: string, metric: WeatherMetric, operator: RuleOperator, threshold: number) => {
    try {
      const res = await rulesApi.create(locationId, metric, operator, threshold);
      const loc = locations.find((l) => l.id === locationId);
      showToast('Alert Rule Armed', `Incident trigger defined for "${loc?.name || ''}": ${metric} ${operator} ${threshold}`, 'LOW');
      await loadPlatformData();
      return res;
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || 'Failed to create rule';
      throw new Error(errorMsg);
    }
  };

  const handleToggleRuleActive = async (id: string, active: boolean) => {
    try {
      const targetRule = rules.find((r) => r.id === id);
      if (!targetRule) throw new Error('Rule not found');

      const res = await rulesApi.toggleActive(id, !active);
      const loc = locations.find((l) => l.id === targetRule.locationId);
      showToast(
        res.isActive ? 'Incident Trigger Armed' : 'Incident Trigger Paused',
        `Automated rule limits and scanning for "${loc?.name || ''}" is now ${res.isActive ? 'dispatched' : 'halted'}.`,
        'INFO'
      );
      await loadPlatformData();
      return res;
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || 'Failed to toggle rule';
      throw new Error(errorMsg);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await rulesApi.delete(id);
      showToast('Weather Rule Deleted', 'The selected weather automation constraint was completely uninstalled.', 'INFO');
      await loadPlatformData();
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || 'Failed to delete rule';
      throw new Error(errorMsg);
    }
  };

  // Weather alerts log callbacks
  const handleDeleteAlert = async (id: string) => {
    try {
      const alertItem = alerts.find((a) => a.id === id);
      const locItem = locations.find((l) => l.id === alertItem?.locationId);
      await alertsApi.resolve(id);
      showToast(
        'Incident Acknowledged',
        `Excursion breach alert at "${locItem?.name || ''}" acknowledged and resolved.`,
        'LOW'
      );
      await loadPlatformData();
      return true;
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || 'Failed to resolve alert';
      showToast('Error', errorMsg, 'MEDIUM');
      return false;
    }
  };

  const handleClearAllAlerts = async () => {
    // Not implemented in new API - would need to resolve each alert individually
    showToast('Not Available', 'Use individual alert resolution instead.', 'INFO');
    return false;
  };

  // Real-Time Dynamic weather simulator (alerts are generated automatically by backend)
  const handleSimulateIncident = async () => {
    showToast('Note', 'Alerts are generated automatically by the backend when rules are triggered by real weather data.', 'INFO');
  };

  // Calculate outstanding high incidents for sidebar alert badge and headers
  const activeUnresolvedAlarms = alerts.filter(a => {
    // Recent within 24 hours
    const gap = Date.now() - new Date(a.timestamp).getTime();
    return gap < 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className={`min-h-screen bg-[#F9FAFB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 antialiased`}>
      {/* Unauthenticated view (Login/Register) */}
      {!user ? (
        <AuthPage
          id="auth-canvas-portal"
          onAuthSuccess={handleAuthSuccess}
          initialMode={activePage === 'register' ? 'register' : 'login'}
        />
      ) : (
        /* Authenticated Command Dashboard Layout */
        <div className="flex">
          {/* Sidebar Navigation */}
          <Sidebar
            activePage={activePage}
            setActivePage={navigateTo}
            user={user}
            onLogout={handleLogout}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            alertCount={activeUnresolvedAlarms}
          />

          {/* Main Workspace Frame container */}
          <div
            className={`flex-1 min-h-screen transition-all duration-300 relative ${
              isSidebarCollapsed ? 'pl-16' : 'pl-64'
            }`}
          >
            {/* Top Navigation bar */}
            <Navbar
              activePage={activePage}
              user={user}
              sidebarCollapsed={isSidebarCollapsed}
              setSidebarCollapsed={setIsSidebarCollapsed}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onSimulateIncident={handleSimulateIncident}
              isSimulating={isSimulatingTrigger}
            />

            {/* View Shell pages selection */}
            <main id="dashboard-scroller-viewport" className="px-8 pb-8 pt-20 min-h-screen overflow-y-auto max-w-7xl mx-auto">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                {activePage === 'overview' && (
                  <OverviewPage
                    locations={locations}
                    rules={rules}
                    alerts={alerts}
                    onNavigateToPage={navigateTo}
                    onRefreshAll={loadPlatformData}
                    isLoading={isLoading}
                  />
                )}

                {activePage === 'locations' && (
                  <LocationsPage
                    locations={locations}
                    onAddLocation={handleAddLocation}
                    onEditLocation={handleEditLocation}
                    onDeleteLocation={handleDeleteLocation}
                    isLoading={isLoading}
                  />
                )}

                {activePage === 'rules' && (
                  <RulesPage
                    rules={rules}
                    locations={locations}
                    onCreateRule={handleCreateRule}
                    onToggleRule={handleToggleRuleActive}
                    onDeleteRule={handleDeleteRule}
                    isLoading={isLoading}
                  />
                )}

                {activePage === 'alerts' && (
                  <AlertsPage
                    alerts={alerts}
                    locations={locations}
                    onDeleteAlert={handleDeleteAlert}
                    onClearAllAlerts={handleClearAllAlerts}
                    isLoading={isLoading}
                  />
                )}

                {activePage === 'settings' && (
                  <SettingsPage
                    user={user}
                    onUpdateUser={handleUpdateUserProfile}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* --- LIVE INTERACTIVE TOAST SYSTEM EXPRESSION --- */}
      <div
        id="weatherops-live-toasts"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full font-sans pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`system-toast-${toast.id}`}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex gap-3 relative transition-all duration-300 animate-in slide-in-from-right-8 ${
              toast.severity === 'HIGH'
                ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-900/60 text-slate-900 dark:text-rose-100 ring-2 ring-rose-500/25'
                : toast.severity === 'MEDIUM'
                ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900/40 text-slate-900 dark:text-amber-100'
                : toast.severity === 'LOW'
                ? 'bg-emerald-50 dark:bg-emerald-1000 dark:bg-emerald-950 border-emerald-250 dark:border-emerald-900 text-slate-900 dark:text-emerald-100'
                : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-900 dark:text-slate-100'
            }`}
          >
            {/* Visual badge matching category */}
            <div className="shrink-0 mt-0.5">
              {toast.severity === 'HIGH' ? (
                <Flame className="h-5 w-5 text-rose-500" />
              ) : toast.severity === 'MEDIUM' ? (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              ) : toast.severity === 'LOW' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Info className="h-5 w-5 text-indigo-505" />
              )}
            </div>

            {/* Message parameters */}
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-xs font-bold font-display tracking-tight leading-tight">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-sans">
                {toast.message}
              </p>
            </div>

            {/* Quick close button */}
            <button
              id={`close-system-toast-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer transition"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
