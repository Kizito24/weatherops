import React, { useState } from 'react';
import { CloudSun, ArrowRight, Lock, Mail, User, ShieldAlert, Sparkles } from 'lucide-react';
import { authApi } from '../lib/api/auth';
import { UserProfile } from '../types';

interface AuthPageProps {
  id?: string;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthPage({
  id = 'weatherops-auth-portal',
  onAuthSuccess,
  initialMode = 'login',
}: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        await authApi.login(email, password);
        // Tokens are stored by authApi.login
        // Create a basic user profile from email
        const user: UserProfile = {
          name: email.split('@')[0],
          email,
          role: 'User',
          apiKey: '',
          notifications: { email: true, sms: false, system: true },
        };
        onAuthSuccess(user);
      } else {
        await authApi.register(email, password);
        // Tokens are stored by authApi.register
        const user: UserProfile = {
          name: name || email.split('@')[0],
          email,
          role: 'User',
          apiKey: '',
          notifications: { email: true, sms: false, system: true },
        };
        onAuthSuccess(user);
      }
    } catch (err: any) {
      // Handle axios errors
      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.message ||
                          (mode === 'login' ? 'Invalid email or password.' : 'Registration failed.');
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id={id}
      className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-slate-950 p-4 transition-colors duration-200"
    >
      <div className="absolute inset-0 bg-[radial-gradient(100rem_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-xl shadow-lg p-7 relative z-10 transition-colors">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#111827] dark:bg-slate-800 text-white shadow-xs mb-2">
            <CloudSun className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Weather<span className="text-indigo-600 dark:text-indigo-400">Ops</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-center font-medium">
            {mode === 'login'
              ? 'Sign in to access event-driven weather intelligence.'
              : 'Register your organization command center control node.'}
          </p>
        </div>

        {/* Diagnostic / Alert Banner */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-450 text-xs flex gap-2 items-start">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label htmlFor="reg-name" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase font-mono tracking-wider">
                Full Operational Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-450">
                  <User className="h-3.5 w-3.5" />
                </span>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-755 focus:border-[#111827] dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase font-mono tracking-wider">
              Control Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-455">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="ops@weatherops.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-755 focus:border-[#111827] dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="auth-password" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
                Encryption Password
              </label>
              {mode === 'login' && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-bold">
                  Forgot key?
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-455">
                <Lock className="h-3.5 w-3.5" />
              </span>
              <input
                id="auth-password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-755 focus:border-[#111827] dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Prompt quick actions or instructions */}
          {mode === 'login' && (
            <div className="p-2 rounded-md bg-slate-50 dark:bg-indigo-950/20 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-150 dark:border-slate-800/60 leading-normal">
              <span className="font-bold flex items-center gap-1 text-[#111827] dark:text-indigo-300">
                <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                Live Sandbox Node:
              </span>
              Use prefilled details or specify credentials to initialize an operational dashboard.
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#111827] hover:bg-black active:bg-slate-950 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-md shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2 uppercase tracking-wider"
          >
            {isLoading ? (
              <span className="inline-block h-3.5 w-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <span>Access Dashboard Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <span>Initialize Command Center</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* View Toggle */}
        <div className="mt-5 pt-3 border-t border-slate-150 dark:border-slate-800/80 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {mode === 'login' ? (
            <p>
              New to WeatherOps Platform?{' '}
              <button
                id="switch-to-register-btn"
                type="button"
                onClick={() => setMode('register')}
                className="font-extrabold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already deployed?{' '}
              <button
                id="switch-to-login-btn"
                type="button"
                onClick={() => setMode('login')}
                className="font-extrabold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
