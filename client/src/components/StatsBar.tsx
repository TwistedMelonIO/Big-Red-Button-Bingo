interface StatsBarProps {
  calledCount: number;
  total: number;
  gameNumber: number;
  sessionStartedAt: string;
  connected: boolean;
}

export function StatsBar({ calledCount, total, gameNumber, sessionStartedAt, connected }: StatsBarProps) {
  const pct = Math.round((calledCount / total) * 100);
  const startTime = new Date(sessionStartedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 bg-brb-surface/80 rounded-xl border border-brb-border backdrop-blur-sm">
      {/* Numbers called counter */}
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl text-brb-text tracking-wider">
            {calledCount}
          </span>
          <span className="font-mono text-sm text-brb-text-muted">/ {total}</span>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:block w-36 h-2.5 bg-brb-card rounded-full overflow-hidden border border-brb-border/50">
          <div
            className="h-full bg-gradient-to-r from-brb-red-dark via-brb-red to-brb-red-glow rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <span className="hidden sm:inline text-xs font-mono text-brb-text-muted">
          {pct}%
        </span>
      </div>

      {/* Session info */}
      <div className="flex items-center gap-5">
        <span className="text-xs font-mono text-brb-text-muted">
          Game {gameNumber} — started {startTime}
        </span>

        {/* Connection indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected
                ? 'bg-brb-green status-pulse'
                : 'bg-brb-red'
            }`}
          />
          <span className={`text-xs font-mono ${connected ? 'text-brb-green' : 'text-brb-red'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
