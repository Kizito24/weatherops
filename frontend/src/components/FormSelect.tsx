/**
 * Reusable form select component with validation support
 */

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  id?: string;
  name: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  description?: string;
  success?: boolean;
  placeholder?: string;
}

export default function FormSelect({
  id,
  name,
  label,
  options,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  className = '',
  description,
  success = false,
  placeholder,
}: FormSelectProps) {
  const selectId = id || `select-${name}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm
            border rounded-lg appearance-none
            focus:outline-none focus:ring-2 focus:ring-offset-0 transition
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-300 dark:border-red-800 focus:ring-red-500/20 bg-red-50 dark:bg-red-950/10'
                : success
                  ? 'border-emerald-300 dark:border-emerald-800 focus:ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 bg-white dark:bg-slate-800'
            }
          `}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Status icons */}
        {error && (
          <AlertCircle className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
        )}
        {success && !error && (
          <CheckCircle2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
        )}
      </div>

      {/* Description text */}
      {description && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      )}

      {/* Error message */}
      {error && <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">{error}</p>}
    </div>
  );
}
