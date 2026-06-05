import React from 'react';
import * as Icons from 'lucide-react';
import Badge from './Badge';

interface KPICardProps {
  id?: string;
  title: string;
  value: string | number;
  iconName: keyof typeof Icons;
  subtitle?: string;
  subtitleBadge?: 'LOW' | 'MEDIUM' | 'HIGH' | 'ACTIVE' | 'INACTIVE' | 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'MAINTENANCE';
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
}

export default function KPICard({
  id,
  title,
  value,
  iconName,
  subtitle,
  subtitleBadge,
  trend,
}: KPICardProps) {
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <div
      id={id || `kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-sm transition-all duration-150 hover:border-slate-250 dark:hover:border-slate-755"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider font-sans">
          {title}
        </span>
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
          {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1.5">
        <span className="text-2xl font-extrabold text-slate-950 dark:text-white font-sans tracking-tight leading-none">
          {value}
        </span>
        {trend && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center font-mono ${
              trend.isNeutral
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                : trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
            }`}
          >
            {trend.isNeutral ? '' : trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {(subtitle || subtitleBadge) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/40 flex items-center gap-1.5 text-[11px] text-slate-550 dark:text-slate-400">
          {subtitleBadge && (
            <Badge variant={subtitleBadge} className="scale-90 origin-left" />
          )}
          {subtitle && (
            <span className="truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
