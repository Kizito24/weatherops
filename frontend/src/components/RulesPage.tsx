import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Info,
  Check,
  Clock
} from 'lucide-react';
import { Rule, Location, WeatherMetric, RuleOperator } from '../types';
import EmptyState from './EmptyState';
import { TableSkeleton } from './Skeletons';

interface RulesPageProps {
  id?: string;
  rules: Rule[];
  locations: Location[];
  onCreateRule: (locationId: string, metric: WeatherMetric, operator: RuleOperator, threshold: number) => Promise<any>;
  onToggleRule: (id: string) => Promise<any>;
  onDeleteRule: (id: string) => Promise<any>;
  isLoading: boolean;
}

export default function RulesPage({
  id = 'weatherops-rules-view',
  rules,
  locations,
  onCreateRule,
  onToggleRule,
  onDeleteRule,
  isLoading,
}: RulesPageProps) {
  // Modals Local states
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form Fields
  const [selectedLocId, setSelectedLocId] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<WeatherMetric>('temperature');
  const [selectedOperator, setSelectedOperator] = useState<RuleOperator>('>');
  const [threshold, setThreshold] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getMetricIcon = (metric: WeatherMetric, sizeClass = "h-5 w-5") => {
    switch (metric) {
      case 'temperature':
        return <Thermometer className={`${sizeClass} text-rose-505`} />;
      case 'rainfall':
        return <CloudRain className={`${sizeClass} text-blue-505`} />;
      case 'wind_speed':
        return <Wind className={`${sizeClass} text-teal-400`} />;
      case 'humidity':
        return <Droplets className={`${sizeClass} text-indigo-400`} />;
      default:
        return <HelpCircle className={sizeClass} />;
    }
  };

  const getMetricUnits = (metric: WeatherMetric) => {
    switch (metric) {
      case 'temperature': return '°C';
      case 'rainfall': return 'mm';
      case 'wind_speed': return 'm/s';
      case 'humidity': return '%';
      default: return '';
    }
  };

  const handleOpenAdd = () => {
    setSelectedLocId(locations.length > 0 ? locations[0].id : '');
    setSelectedMetric('temperature');
    setSelectedOperator('>');
    setThreshold('');
    setActionError(null);
    setActionSuccess(null);
    setValidationErrors({});
    setIsAddOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedLocId) {
      errors.location = 'Please select a geographic location';
    }

    const thresholdVal = parseFloat(threshold);
    if (threshold === '') {
      errors.threshold = 'Threshold value is required';
    } else if (isNaN(thresholdVal)) {
      errors.threshold = 'Must be a valid number';
    } else if (thresholdVal < -50 || thresholdVal > 200) {
      errors.threshold = 'Value seems unusual for this metric';
    }

    return errors;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    setValidationErrors({});
    setIsSubmitting(true);

    const thresholdVal = parseFloat(threshold);
    const res = await onCreateRule(selectedLocId, selectedMetric, selectedOperator, thresholdVal);
    setIsSubmitting(false);

    if (res && res.error) {
      setActionError(res.error);
    } else {
      setActionSuccess('Rule created successfully!');
      setTimeout(() => {
        setIsAddOpen(false);
        setActionSuccess(null);
      }, 1500);
    }
  };

  const toggleRuleActive = async (id: string) => {
    await onToggleRule(id);
  };

  const deleteRuleItem = async (id: string, detail: string) => {
    if (confirm(`Are you sure you want to delete the weather alert rule for: "${detail}"?`)) {
      await onDeleteRule(id);
    }
  };
  return (
    <div id={id} className="space-y-5">
      {/* Call to action and short prompt */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3.5 rounded-lg shadow-xs">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
            WeatherOps automates platform alerts when climate coordinates cross these defined thresholds.
          </p>
        </div>

        <button
          id="open-create-rule-modal"
          onClick={handleOpenAdd}
          disabled={locations.length === 0}
          className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#111827] hover:bg-black dark:bg-slate-850 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-md shadow-2xs hover:shadow-xs transition-all uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          <span>Define Rule</span>
        </button>
      </div>

      {/* Main Grid of Rule Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
          <div className="h-40 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl" />
          <div className="h-40 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl" />
          <div className="h-40 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl" />
        </div>
      ) : rules.length === 0 ? (
        <EmptyState
          id="no-rules-defined-state"
          iconName="Sliders"
          title="No climate rules defined"
          description="Without automated rule limits, WeatherOps is observing climates but won't trigger containment alerts."
          actionText={locations.length > 0 ? "Define Rule" : "First, Provision Location"}
          onAction={locations.length > 0 ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rules.map((rule) => {
            const loc = locations.find(l => l.id === rule.locationId);
            const locationName = loc ? loc.name : 'Unknown Registry';
            const ruleText = `${rule.metric.replace('_', ' ')} ${rule.operator} ${rule.threshold}${getMetricUnits(rule.metric)}`;

            return (
              <div
                key={rule.id}
                id={`rule-card-${rule.id}`}
                className={`relative bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-150 flex flex-col justify-between ${
                  rule.isActive
                    ? 'border-indigo-200 dark:border-indigo-900 hover:border-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-90'
                }`}
              >
                {/* Rule Header */}
                <div className="px-4 py-3 border-b border-slate-150 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/60 flex justify-between items-start">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                      CRITICAL MONITOR
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {locationName}
                    </h4>
                  </div>
                  <button
                    id={`delete-rule-${rule.id}`}
                    onClick={() => deleteRuleItem(rule.id, `${locationName} matching ${ruleText}`)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                    title="Delete weather rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Rule parameters displays */}
                <div className="px-4 py-3.5 flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 flex items-center justify-center shrink-0">
                    {getMetricIcon(rule.metric, "h-4.5 w-4.5")}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-405 dark:text-slate-500 uppercase tracking-wider block leading-none">
                      Boundary Rule
                    </span>
                    <span className="text-sm font-extrabold text-slate-950 dark:text-white capitalize block mt-1 leading-none">
                      {rule.metric.replace('_', ' ')}{' '}
                      <span className="font-mono text-indigo-650 dark:text-indigo-400 font-bold px-0.5">
                        {rule.operator}
                      </span>{' '}
                      {rule.threshold}
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-0.5">
                        {getMetricUnits(rule.metric)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Switch Toggles for rule activity */}
                <div className="px-4 py-2 border-t border-slate-150 dark:border-slate-805 bg-[#F9FAFB] dark:bg-slate-900/30 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] font-mono">
                    Trigger:{' '}
                    <span className={`font-extrabold font-mono ${rule.isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-450'}`}>
                      {rule.isActive ? 'ARMED' : 'PAUSED'}
                    </span>
                  </span>
                  <button
                    id={`toggle-rule-${rule.id}`}
                    type="button"
                    onClick={() => toggleRuleActive(rule.id)}
                    className={`cursor-pointer focus:outline-hidden transition-colors rounded-full leading-none p-0.5 ${
                      rule.isActive ? 'text-indigo-605' : 'text-slate-350'
                    }`}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="h-6 w-6 text-slate-900" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- DEFINE WEATHER RULE DRAWER MODAL --- */}
      {isAddOpen && (
        <div id="create-rule-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div id="create-rule-modal" className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-tight">Define Weather Rule</h3>
              </div>
              <button
                id="close-create-rule"
                onClick={() => setIsAddOpen(false)}
                className="p-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-lg text-red-750 dark:text-red-400 text-xs flex gap-2 animate-in slide-in-from-top">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/15 rounded-lg text-green-700 dark:text-green-400 text-xs flex gap-2 animate-in slide-in-from-top">
                  <Check className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Select Location Field */}
              <div>
                <label htmlFor="rule-loc-select" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                  Target Geographic Registry
                </label>
                <select
                  id="rule-loc-select"
                  value={selectedLocId}
                  onChange={(e) => {
                    setSelectedLocId(e.target.value);
                    if (validationErrors.location) {
                      setValidationErrors({ ...validationErrors, location: '' });
                    }
                  }}
                  required
                  className={`w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer transition-colors ${
                    validationErrors.location
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-150 dark:border-slate-750 focus:border-indigo-650'
                  }`}
                >
                  <option value="" disabled>--- Select Location ---</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {validationErrors.location && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {validationErrors.location}
                  </p>
                )}
              </div>

              {/* Metric & Operator inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rule-metric-select" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                    Weather Metric
                  </label>
                  <select
                    id="rule-metric-select"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as WeatherMetric)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 border border-slate-150 focus:outline-hidden rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="temperature">Temperature (°C)</option>
                    <option value="rainfall">Rainfall (mm)</option>
                    <option value="wind_speed">Wind Speed (m/s)</option>
                    <option value="humidity">Humidity (%)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="rule-op-select" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                    Operator
                  </label>
                  <select
                    id="rule-op-select"
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(e.target.value as RuleOperator)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-150 rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value=">">&#62; (Greater than)</option>
                    <option value="<">&#60; (Less than)</option>
                    <option value=">=">&#62;= (Greater or equal)</option>
                    <option value="<=">&#60;= (Less or equal)</option>
                    <option value="==">== (Exactly equal)</option>
                  </select>
                </div>
              </div>

              {/* Numeric Threshold Input */}
              <div>
                <label htmlFor="rule-threshold" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                  Operational Threshold Limit Value
                </label>
                <div className="relative">
                  <input
                    id="rule-threshold"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 40"
                    value={threshold}
                    onChange={(e) => {
                      setThreshold(e.target.value);
                      if (validationErrors.threshold) {
                        setValidationErrors({ ...validationErrors, threshold: '' });
                      }
                    }}
                    className={`w-full text-sm px-4 py-2 bg-slate-50 hover:bg-slate-100 border rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden transition-colors ${
                      validationErrors.threshold
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-slate-150 focus:border-indigo-650'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-mono font-bold text-slate-400">
                    {getMetricUnits(selectedMetric)}
                  </div>
                </div>
                {validationErrors.threshold && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {validationErrors.threshold}
                  </p>
                )}
              </div>

              {/* Help notification details */}
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-[11px] text-indigo-755 dark:text-indigo-400 rounded-lg flex gap-2">
                <Info className="h-4.5 w-4.5 text-indigo-505 shrink-0 mt-0.5" />
                <span>
                  WeatherOps will continuously evaluate real-world parameters matching this rule. Armed violations trigger instant alert state flows.
                </span>
              </div>

              {/* Submission panel controls */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  id="cancel-create-rule"
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 dark:text-slate-250 dark:bg-slate-850 dark:hover:bg-slate-805 border border-slate-150 dark:border-slate-750 rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-rule"
                  type="submit"
                  disabled={isSubmitting || Object.keys(validationErrors).length > 0}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-750 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? 'Arming Rule...' : 'Arm Weather Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
