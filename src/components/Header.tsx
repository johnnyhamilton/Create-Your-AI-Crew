import React from 'react';
import { User } from 'firebase/auth';
import { ShieldCheck, RotateCcw, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { AppState } from '../types';
import { ADMIN_EMAIL } from '../lib/firebase';

interface HeaderProps {
  appState: AppState;
  onReset: () => void;
  user?: User | null;
  onSignIn: () => void;
  onSignOut?: () => void;
  onGoDashboard?: () => void;
  onGoAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appState,
  onReset,
  user,
  onSignIn,
  onSignOut,
  onGoDashboard,
  onGoAdmin,
}) => {
  const isAdmin = Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  return (
    <header className="w-full border-b border-stone-200 bg-white/95 backdrop-blur-xs sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="font-sans text-lg font-bold text-[#004364] tracking-tight hover:opacity-80 transition-opacity text-left cursor-pointer"
          >
            Create Your AI Crew
          </button>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {appState !== 'dashboard' && onGoDashboard && (
                <button
                  onClick={onGoDashboard}
                  className="text-xs text-[#004364] font-medium hover:bg-stone-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg border border-stone-200"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>My Crew</span>
                </button>
              )}

              {isAdmin && onGoAdmin && appState !== 'admin' && (
                <button
                  onClick={onGoAdmin}
                  className="text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-stone-100"
                >
                  Admin
                </button>
              )}

              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#1B1B1B]/80 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                <UserIcon className="w-3.5 h-3.5 text-[#004364]" />
                <span className="font-medium truncate max-w-[120px]">{user.displayName || user.email}</span>
              </div>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-xs text-stone-500 hover:text-[#881719] inline-flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#1B1B1B]/70 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#649940]" />
                <span>Ephemeral Session</span>
              </div>
              {onSignIn && (
                <button
                  onClick={onSignIn}
                  className="text-xs font-semibold bg-[#649940] hover:bg-[#527d34] text-white px-2.5 py-1 rounded-full transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign in to your dashboard</span>
                </button>
              )}
            </div>
          )}

          {appState !== 'welcome' && appState !== 'dashboard' && (
            <button
              onClick={onReset}
              className="text-xs text-[#1B1B1B]/70 hover:text-[#004364] inline-flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-stone-100"
              title="Start fresh conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Fresh</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
