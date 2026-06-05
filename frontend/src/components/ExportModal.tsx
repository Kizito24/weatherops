import React, { useState } from 'react';
import { Download, X, Calendar, FileText } from 'lucide-react';
import { Alert, Rule } from '../types';
import {
  exportAlertsToCSV,
  exportAlertsToJSON,
  exportRulesToCSV,
  exportRulesToJSON,
} from '../lib/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts?: Alert[];
  rules?: Rule[];
  locations: Map<string, string>;
}

type ExportType = 'alerts' | 'rules';
type ExportFormat = 'csv' | 'json';

export default function ExportModal({
  isOpen,
  onClose,
  alerts = [],
  rules = [],
  locations,
}: ExportModalProps) {
  const [exportType, setExportType] = useState<ExportType>('alerts');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    const options = {
      dateRangeStart: dateRangeStart ? new Date(dateRangeStart) : undefined,
      dateRangeEnd: dateRangeEnd ? new Date(dateRangeEnd) : undefined,
    };

    try {
      if (exportType === 'alerts') {
        if (exportFormat === 'csv') {
          exportAlertsToCSV(alerts, locations, options);
        } else {
          exportAlertsToJSON(alerts, locations, options);
        }
      } else {
        if (exportFormat === 'csv') {
          exportRulesToCSV(rules, locations, options);
        } else {
          exportRulesToJSON(rules, locations, options);
        }
      }

      setTimeout(() => {
        onClose();
        setIsExporting(false);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const dataCount = exportType === 'alerts' ? alerts.length : rules.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Export Data
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Export Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase font-mono tracking-wider">
              Export Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportType('alerts')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  exportType === 'alerts'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Alerts ({alerts.length})
              </button>
              <button
                onClick={() => setExportType('rules')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  exportType === 'rules'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Rules ({rules.length})
              </button>
            </div>
          </div>

          {/* Export Format Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase font-mono tracking-wider">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportFormat('csv')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  exportFormat === 'csv'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  exportFormat === 'json'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                JSON
              </button>
            </div>
          </div>

          {/* Date Range Filter (Alerts only) */}
          {exportType === 'alerts' && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase font-mono tracking-wider">
                Date Range (Optional)
              </label>
              <div className="space-y-2">
                <div>
                  <label htmlFor="date-start" className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                    Start Date
                  </label>
                  <input
                    id="date-start"
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-750 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label htmlFor="date-end" className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                    End Date
                  </label>
                  <input
                    id="date-end"
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-750 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Data Summary */}
          <div className="bg-slate-50 dark:bg-slate-850 rounded-lg p-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <FileText className="h-4 w-4 shrink-0" />
            <span>
              {dataCount === 0
                ? 'No data to export'
                : `Exporting ${dataCount} ${exportType}${dataCount !== 1 ? 's' : ''} as ${exportFormat.toUpperCase()}`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 dark:text-slate-250 dark:bg-slate-850 dark:hover:bg-slate-805 border border-slate-150 dark:border-slate-750 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || dataCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
