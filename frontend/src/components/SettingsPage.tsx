import React, { useState } from 'react';
import {
  User,
  Key,
  Bell,
  Check,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  Shield,
  Smartphone,
  Save,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsPageProps {
  id?: string;
  user: UserProfile | null;
  onUpdateUser: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

export default function SettingsPage({
  id = 'weatherops-settings-view',
  user,
  onUpdateUser,
}: SettingsPageProps) {
  if (!user) return null;

  // Local state copy
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [email, setEmail] = useState(user.email);
  const [apiKey, setApiKey] = useState(user.apiKey);

  const [emailNotif, setEmailNotif] = useState(user.notifications.email);
  const [smsNotif, setSmsNotif] = useState(user.notifications.sms);
  const [systemNotif, setSystemNotif] = useState(user.notifications.system);

  // UI state
  const [isCopied, setIsCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerateKey = async () => {
    setIsRegenerating(true);
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    const randomHex = Array.from({ length: 26 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const newKey = `wops_live_${randomHex}`;
    setApiKey(newKey);
    setIsRegenerating(false);
    
    // Save generated keys straight to user database
    await onUpdateUser({ apiKey: newKey });
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const updated = await onUpdateUser({
      name,
      role,
      email,
      notifications: {
        email: emailNotif,
        sms: smsNotif,
        system: systemNotif,
      },
    });

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div id={id} className="max-w-3xl mx-auto space-y-5">
      <form onSubmit={handleSaveAll} className="space-y-5">
        {/* Save success feedback banner */}
        {saveSuccess && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/15 rounded-lg text-emerald-700 dark:text-emerald-400 text-xs flex gap-2 items-center justify-between">
            <div className="flex gap-2 items-center font-semibold">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Platform profile & settings synced successfully.</span>
            </div>
          </div>
        )}

        {/* Section 1: User Profile details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-4.5 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5">
            <User className="h-4.5 w-4.5 text-slate-850 dark:text-indigo-400" />
            <h3 className="text-sm font-bold font-display text-slate-950 dark:text-white tracking-tight uppercase">
              Operational Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="set-name" className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                Authorized Personnel Name
              </label>
              <input
                id="set-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 border border-slate-150 dark:border-slate-750 focus:border-indigo-650 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="set-role" className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                Command Role
              </label>
              <input
                id="set-role"
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 border border-slate-150 dark:border-slate-750 focus:border-indigo-650 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="set-email" className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                E-mail Route
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <input
                  id="set-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 border border-slate-150 dark:border-slate-750 focus:border-indigo-650 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Command Notification Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-4.5 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5">
            <Bell className="h-4.5 w-4.5 text-slate-850 dark:text-indigo-400" />
            <h3 className="text-sm font-bold font-display text-slate-955 dark:text-white tracking-tight uppercase">
              Incident Alert Dispatch Channels
            </h3>
          </div>

          <div className="space-y-3">
            {/* Email dispatch */}
            <div className="flex items-start justify-between py-2">
              <div className="flex gap-2.5">
                <div className="h-8 w-8 rounded-md bg-slate-50 dark:bg-indigo-950/20 text-slate-500 flex items-center justify-center shrink-0 border border-slate-150 dark:border-slate-800">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-205">
                    Email Digest Notifications
                  </span>
                  <span className="block text-[11px] text-slate-505 dark:text-slate-400 mt-0.5 leading-tight">
                    Receive operational reports and weather triggers automatically.
                  </span>
                </div>
              </div>
              <input
                id="toggle-email-alerts"
                type="checkbox"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer mt-0.5"
              />
            </div>

            {/* SMS Emergency alert */}
            <div className="flex items-start justify-between py-2 border-t border-slate-105 dark:border-slate-805">
              <div className="flex gap-2.5">
                <div className="h-8 w-8 rounded-md bg-slate-50 dark:bg-orange-950/20 text-slate-500 flex items-center justify-center shrink-0 border border-slate-150 dark:border-slate-800">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-205">
                    SMS Escalations (Emergency)
                  </span>
                  <span className="block text-[11px] text-slate-505 dark:text-slate-400 mt-0.5 leading-tight">
                    Sms alerts dispatched to on-call engineers for all high-risk weather incidents.
                  </span>
                </div>
              </div>
              <input
                id="toggle-sms-alerts"
                type="checkbox"
                checked={smsNotif}
                onChange={(e) => setSmsNotif(e.target.checked)}
                className="h-4 w-4 text-indigo-605 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer mt-0.5"
              />
            </div>

            {/* System console live */}
            <div className="flex items-start justify-between py-2 border-t border-slate-105 dark:border-slate-805">
              <div className="flex gap-2.5">
                <div className="h-8 w-8 rounded-md bg-slate-50 dark:bg-emerald-950/20 text-slate-500 flex items-center justify-center shrink-0 border border-slate-150 dark:border-slate-800">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-205">
                    Live UI Logs
                  </span>
                  <span className="block text-[11px] text-slate-505 dark:text-slate-400 mt-0.5 leading-tight">
                    Display transient real-time toast popups inside active browse tabs.
                  </span>
                </div>
              </div>
              <input
                id="toggle-system-alerts"
                type="checkbox"
                checked={systemNotif}
                onChange={(e) => setSystemNotif(e.target.checked)}
                className="h-4 w-4 text-indigo-605 focus:ring-indigo-505 border-slate-300 rounded cursor-pointer mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Developer API keys */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-4.5 shadow-xs">
          <div className="flex items-start justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-slate-805 dark:text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold font-display text-slate-950 dark:text-white tracking-tight uppercase">
                  Developer Command Keys
                </h3>
                <p className="text-[11px] text-slate-500 leading-none mt-1">
                  Authenticate custom alert rules, Slack hooks, or monitoring web endpoints.
                </p>
              </div>
            </div>
            <span className="text-[9px] bg-slate-100 dark:bg-indigo-950/30 text-slate-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
              Active Key
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="developer-api-key"
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="w-full pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-750 rounded-md text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden select-all"
                />
                <button
                  id="toggle-visibility-key"
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Copy control */}
              <button
                id="copy-api-key-btn"
                type="button"
                onClick={handleCopyKey}
                className="cursor-pointer p-1.5 rounded-md border border-slate-150 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 text-slate-500 hover:text-slate-850 dark:hover:text-white flex items-center justify-center transition"
                title="Copy API key"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              {/* Regenerate key */}
              <button
                id="regenerate-api-key-btn"
                type="button"
                disabled={isRegenerating}
                onClick={handleRegenerateKey}
                className="cursor-pointer p-1.5 rounded-md border border-slate-150 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 text-slate-500 hover:text-indigo-650 flex items-center justify-center hover:border-indigo-150 transition disabled:opacity-50"
                title="Regenerate keys"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-850/40 border border-slate-150 dark:border-slate-800 text-[11px] text-slate-505 dark:text-slate-400 rounded-md flex gap-2">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Do not share this key in public repositories. Anyone with access to this credential can trigger system alerts and command telemetry.
              </span>
            </div>
          </div>
        </div>

        {/* Form Global submission control trigger button */}
        <div className="flex gap-3 justify-end items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hidden sm:inline">
            Saving updates profile instantly
          </span>
          <button
            id="save-settings-form-btn"
            type="submit"
            disabled={isSaving}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#111827] hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-705 rounded-md shadow-2xs hover:shadow-xs transition-all disabled:opacity-55 uppercase tracking-wider"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Syncing...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
