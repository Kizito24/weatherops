import React from 'react';
import {
  CloudSun,
  LayoutDashboard,
  MapPin,
  Sliders,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Dot
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  id?: string;
  activePage: string;
  setActivePage: (page: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  alertCount: number;
}

export default function Sidebar({
  id = 'weatherops-sidebar',
  activePage,
  setActivePage,
  user,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  alertCount,
}: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'rules', label: 'Rules', icon: Sliders },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) return null;

  return (
    <aside
      id={id}
      className={`fixed top-0 left-0 z-30 h-screen bg-white dark:bg-slate-900 border-r border-slate-205 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Logo & Banner */}
      <div>
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div
            className="flex items-center gap-2 overflow-hidden cursor-pointer"
            onClick={() => setActivePage('overview')}
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 shrink-0 shadow-xs">
              <CloudSun className="h-4.5 w-4.5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Weather<span className="text-slate-600 dark:text-slate-405">Ops</span>
              </span>
            )}
          </div>

          {!isCollapsed && (
            <button
              id="collapse-sidebar-btn"
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-405 hover:text-slate-800 dark:hover:text-white cursor-pointer hidden md:block"
              title="Collapse menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer group ${
                  isActive
                    ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-102 ${
                      isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    id={`sidebar-badge-${item.id}`}
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                      isActive
                        ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                        : 'bg-red-100 text-red-655 dark:bg-red-950/40 dark:text-red-400 animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Quick Logout Actions */}
      <div className="border-t border-slate-150 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/20">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold flex items-center justify-center shrink-0 uppercase shadow-xs text-xs select-none">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100 leading-normal">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5 font-medium">{user.role}</p>
              </div>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="p-1.5 rounded-md hover:bg-red-55/15 dark:hover:bg-red-500/15 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-8 w-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center uppercase shadow-inner text-xs cursor-pointer"
              onClick={() => setActivePage('settings')}
              title={user.name}
            >
              {user.name.charAt(0)}
            </div>
            <button
              id="sidebar-collapsed-logout"
              onClick={onLogout}
              className="p-1 rounded-md text-slate-400 hover:text-red-500 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
