import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LogEntry } from '../types';
import { fetchLogs, exportLogs, resetSession } from '../lib/api';
import { DiagnosticsCard } from './DiagnosticsCard';

interface LogsViewProps {
  onClose: () => void;
}

type TimeRange = 'today' | '7d' | '30d' | 'all';

export function LogsView({ onClose }: LogsViewProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [range, setRange] = useState<TimeRange>('today');
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const rangeParam = range === 'all' ? undefined : range;
      const data = await fetchLogs(rangeParam);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [range]);

  const handleExport = () => {
    const rangeParam = range === 'all' ? undefined : range;
    exportLogs(rangeParam);
  };

  const handleReset = async () => {
    await resetSession();
    setShowResetConfirm(false);
    loadLogs();
  };

  const rangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-brb-bg/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-brb-text tracking-tight">
            Settings & Logs
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-brb-card border border-brb-border text-brb-text-dim
                       hover:bg-brb-border hover:text-brb-text transition-all text-sm font-mono"
          >
            ← Back to Board
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Logs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {rangeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRange(opt.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-mono transition-all
                    ${range === opt.value
                      ? 'bg-brb-red text-white'
                      : 'bg-brb-card text-brb-text-dim border border-brb-border hover:border-brb-border-bright'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}

              <div className="flex-1" />

              {/* Export button */}
              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded-lg text-sm font-mono bg-brb-card text-brb-text-dim
                           border border-brb-border hover:border-brb-gold hover:text-brb-gold transition-all"
              >
                Export CSV
              </button>
            </div>

            {/* Log table */}
            <div className="bg-brb-surface rounded-xl border border-brb-border overflow-hidden">
              <div className="grid grid-cols-[60px_80px_1fr_120px] gap-2 px-4 py-2.5
                              text-xs font-mono uppercase tracking-wider text-brb-text-muted
                              border-b border-brb-border bg-brb-card/50">
                <span>#</span>
                <span>Number</span>
                <span>Session</span>
                <span>Time</span>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-brb-text-muted font-mono text-sm">
                    Loading...
                  </div>
                ) : logs.length === 0 ? (
                  <div className="p-8 text-center text-brb-text-muted font-mono text-sm">
                    No log entries for this period.
                  </div>
                ) : (
                  logs.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[60px_80px_1fr_120px] gap-2 px-4 py-2
                                 text-sm font-mono border-b border-brb-border/50
                                 hover:bg-brb-card/30 transition-colors"
                    >
                      <span className="text-brb-text-muted">{entry.id}</span>
                      <span className="font-display font-bold text-brb-red">
                        {entry.number}
                      </span>
                      <span className="text-brb-text-muted truncate text-xs">
                        {entry.session_id.slice(0, 8)}…
                      </span>
                      <span className="text-brb-text-dim text-xs">
                        {new Date(entry.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-brb-border bg-brb-card/30
                              text-xs font-mono text-brb-text-muted">
                {logs.length} entries
              </div>
            </div>
          </div>

          {/* Right column: Controls + Diagnostics */}
          <div className="space-y-4">
            {/* Session controls */}
            <div className="p-4 bg-brb-surface rounded-xl border border-brb-border space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-brb-text-muted">
                Session Controls
              </h3>

              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full px-4 py-3 rounded-lg text-sm font-mono font-bold
                             bg-brb-red/10 text-brb-red border border-brb-red/30
                             hover:bg-brb-red/20 hover:border-brb-red/50 transition-all"
                >
                  New Session / Clear Board
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-brb-gold">
                    Are you sure? This will clear the board and start a new session.
                    History is preserved in logs.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-mono font-bold
                                 bg-brb-red text-white hover:bg-brb-red-glow transition-all"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-mono
                                 bg-brb-card text-brb-text-dim border border-brb-border
                                 hover:bg-brb-border transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnostics */}
            <DiagnosticsCard />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
