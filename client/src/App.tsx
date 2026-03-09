import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSocket } from './hooks/useSocket';
import { Board } from './components/Board';
import { LastCalled } from './components/LastCalled';
import { RecentHistory } from './components/RecentHistory';
import { StatsBar } from './components/StatsBar';
import { LogsView } from './components/LogsView';

export default function App() {
  const { state, connected } = useSocket();
  const [showLogs, setShowLogs] = useState(false);

  if (!state) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brb-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-sm text-brb-text-muted">Connecting to server…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Scanline overlay for show-control aesthetic */}
      <div className="scanline-overlay" />

      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-brb-border bg-brb-surface/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Logo / title */}
          <div className="w-8 h-8 rounded-lg bg-brb-red flex items-center justify-center shadow-lg shadow-brb-red/20">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-base sm:text-lg tracking-tight text-brb-text leading-none">
              Big Red Button Bingo
            </h1>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brb-text-muted">
              Show Control
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowLogs(true)}
          className="px-3 py-1.5 rounded-lg text-sm font-mono bg-brb-card text-brb-text-dim
                     border border-brb-border hover:border-brb-border-bright hover:text-brb-text
                     transition-all"
        >
          Settings / Logs
        </button>
      </header>

      {/* Stats bar */}
      <div className="shrink-0 px-4 sm:px-6 py-3">
        <StatsBar
          calledCount={state.calledCount}
          total={90}
          sessionStartedAt={state.sessionStartedAt}
          connected={connected}
        />
      </div>

      {/* Main content: Board + Sidebar */}
      <div className="flex-1 min-h-0 flex gap-4 sm:gap-6 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Board area */}
        <div className="flex-1 min-w-0 flex items-start justify-center overflow-auto">
          <div className="w-full max-w-4xl">
            <Board numbers={state.numbers} lastCalled={state.lastCalled} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden md:flex w-44 lg:w-52 shrink-0 flex-col gap-6">
          <LastCalled number={state.lastCalled} />
          <RecentHistory history={state.history} />
        </div>
      </div>

      {/* Mobile: Last called + recent shown below board */}
      <div className="md:hidden shrink-0 px-4 pb-4 flex gap-4 items-end">
        <LastCalled number={state.lastCalled} />
        <div className="flex-1 min-w-0">
          <RecentHistory history={state.history} max={5} />
        </div>
      </div>

      {/* Logs overlay */}
      <AnimatePresence>
        {showLogs && <LogsView onClose={() => setShowLogs(false)} />}
      </AnimatePresence>
    </div>
  );
}
