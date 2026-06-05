/**
 * Reusable form input component with validation support
 */

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormInputProps {
  id?: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  description?: string;
  success?: boolean;
}

export default function FormInput({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  min,
  max,
  step,
  className = '',
  description,
  success = false,
}: FormInputProps) {
  const inputId = id || `input-${name}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`
            w-full px-3 py-2 text-sm
            border rounded-lg
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-offset-0 transition
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-800 focus:ring-red-500/20 bg-red-950/20'
                : success
                  ? 'border-emerald-800 focus:ring-emerald-500/20 bg-emerald-950/20'
                  : 'border-slate-700 focus:ring-indigo-500/20 bg-slate-800 hover:bg-slate-700'
            }
          `}
        />

        {/* Status icons */}
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
        )}
        {success && !error && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
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
