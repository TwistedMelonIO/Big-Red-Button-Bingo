interface StatsBarProps {
  calledCount: number;
  total: number;
  sessionStartedAt: string;
  connected: boolean;
}

export function StatsBar({ calledCount, total, sessionStartedAt, connected }: StatsBarProps) {
  const pct = Math.round((calledCount / total) * 100);
  const startTime = new Date(sessionStartedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-brb-surface rounded-xl border border-brb-border">
      {/* Numbers called counter */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-2xl text-brb-text">
            {calledCount}
          </span>
          <span className="font-mono text-sm text-brb-text-muted">/ {total}</span>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:block w-32 h-2 bg-brb-card rounded-full overflow-hidden">
          <div
            className="h-full bg-brb-red rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <span className="hidden sm:inline text-xs font-mono text-brb-text-muted">
          {pct}%
        </span>
      </div>

      {/* Session info */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-brb-text-muted">
          Session started {startTime}
        </span>

        {/* Connection indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              connected
                ? 'bg-brb-green status-pulse'
                : 'bg-brb-red'
            }`}
          />
          <span className="text-xs font-mono text-brb-text-muted">
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
