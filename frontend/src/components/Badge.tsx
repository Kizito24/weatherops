import React from 'react';
import { SeverityLevel } from '../types';

interface BadgeProps {
  id?: string;
  variant: SeverityLevel | 'ACTIVE' | 'INACTIVE' | 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'MAINTENANCE';
  className?: string;
}

export default function Badge({ id, variant, className = '' }: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'MEDIUM':
      case 'DEGRADED':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'LOW':
      case 'HEALTHY':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'ACTIVE':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'INACTIVE':
      case 'MAINTENANCE':
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span
      id={id || `badge-${variant.toLowerCase()}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono tracking-tight border uppercase ${getColors()} ${className}`}
    >
      {variant}
    </span>
  );
}
