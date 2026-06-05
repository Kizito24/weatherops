import React from 'react';

export function KPISkeleton({ id }: { id?: string }) {
  return (
    <div id={id || 'kpi-skeleton'} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-xs animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded-md mb-2" />
      <div className="h-3 w-32 bg-slate-150 dark:bg-slate-800 rounded-sm" />
    </div>
  );
}

export function TableSkeleton({ id, rows = 5 }: { id?: string; rows?: number }) {
  return (
    <div id={id || 'table-skeleton'} className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between gap-4 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
            <div className="h-4 w-1/4 bg-slate-250 dark:bg-slate-800 rounded-sm" />
            <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800 rounded-sm" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-sm" />
            <div className="h-4 w-16 bg-slate-150 dark:bg-slate-800 rounded-sm" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WidgetSkeleton({ id }: { id?: string }) {
  return (
    <div id={id || 'widget-skeleton'} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>
      <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-10 bg-slate-150 dark:bg-slate-800 rounded-md" />
        <div className="h-10 bg-slate-150 dark:bg-slate-800 rounded-md" />
        <div className="h-10 bg-slate-150 dark:bg-slate-800 rounded-md" />
      </div>
    </div>
  );
}
