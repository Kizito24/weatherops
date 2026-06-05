import React from 'react';
import * as Icons from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  iconName: keyof typeof Icons;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  id,
  iconName,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <div
      id={id || 'empty-state-container'}
      className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4 ring-4 ring-indigo-50 dark:ring-indigo-950/20">
        {IconComponent && <IconComponent className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
        {title}
      </h3>
      <p className="max-w-xs mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {actionText && onAction && (
        <button
          id={actionText.toLowerCase().replace(/\s+/g, '-')}
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
