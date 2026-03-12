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
      <div className="h-full flex items-center justify-center relative z-10">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-brb-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-sm text-brb-text-muted tracking-wider">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative z-10">
      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Header with red accent line */}
      <header className="shrink-0 flex items-center justify-between px-5 sm:px-8 py-2 red-accent-line bg-brb-surface/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Logo image */}
          <img
            src="/brbb_logo.png"
            alt="Big Red Button Bingo"
            className="h-12 sm:h-14 w-auto"
          />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brb-red">
            Show Control
          </span>
        </div>

        <button
          onClick={() => setShowLogs(true)}
          className="px-4 py-2 rounded-lg text-sm font-mono bg-brb-card text-brb-text-dim
                     border border-brb-border hover:border-brb-red/50 hover:text-brb-text
                     hover:bg-brb-red-deep/30 transition-all duration-200"
        >
          Settings / Logs
        </button>
      </header>

      {/* Stats bar */}
      <div className="shrink-0 px-5 sm:px-8 py-3">
        <StatsBar
          calledCount={state.calledCount}
          total={90}
          gameNumber={state.gameNumber}
          sessionStartedAt={state.sessionStartedAt}
          connected={connected}
        />
      </div>

      {/* Main content: Board + Sidebar */}
      <div className="flex-1 min-h-0 flex gap-5 sm:gap-8 px-5 sm:px-8 pb-5 sm:pb-8">
        {/* Board area */}
        <div className="flex-1 min-w-0 flex items-start justify-center overflow-auto">
          <div className="w-full max-w-4xl">
            <Board numbers={state.numbers} lastCalled={state.lastCalled} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden md:flex w-48 lg:w-56 shrink-0 flex-col gap-6">
          <LastCalled number={state.lastCalled} />
          <RecentHistory history={state.history} />
        </div>
      </div>

      {/* Mobile: Last called + recent below board */}
      <div className="md:hidden shrink-0 px-5 pb-5 flex gap-4 items-end">
        <LastCalled number={state.lastCalled} />
        <div className="flex-1 min-w-0">
          <RecentHistory history={state.history} max={5} />
        </div>
      </div>

      {/* Twisted Melon logo — bottom right */}
      <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
        <img
          src="/twistedmelon_logo.png"
          alt="Twisted Melon"
          className="h-6 sm:h-7 opacity-40"
          style={{ filter: 'hue-rotate(295deg) saturate(1.5) brightness(1.1)' }}
        />
      </div>

      {/* Logs overlay */}
      <AnimatePresence>
        {showLogs && <LogsView onClose={() => setShowLogs(false)} />}
      </AnimatePresence>
    </div>
  );
}
