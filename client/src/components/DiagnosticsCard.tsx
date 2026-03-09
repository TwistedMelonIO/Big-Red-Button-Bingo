import { useState, useEffect } from 'react';
import type { Diagnostics } from '../types';
import { fetchDiagnostics } from '../lib/api';

export function DiagnosticsCard() {
  const [diag, setDiag] = useState<Diagnostics | null>(null);

  useEffect(() => {
    const load = () => fetchDiagnostics().then(setDiag).catch(console.error);
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!diag) return null;

  const lastMsg = diag.osc.lastMessageAt
    ? new Date(diag.osc.lastMessageAt).toLocaleTimeString()
    : 'Never';

  const upMins = Math.floor(diag.uptime / 60);

  return (
    <div className="p-4 bg-brb-surface rounded-xl border border-brb-border space-y-3">
      <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-brb-text-muted">
        Diagnostics
      </h3>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <span className="text-xs text-brb-text-muted">OSC Status</span>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                diag.osc.listening ? 'bg-brb-green status-pulse' : 'bg-brb-red'
              }`}
            />
            <span className="font-mono text-brb-text">
              {diag.osc.listening ? 'Listening' : 'Down'}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-brb-text-muted">OSC Port</span>
          <span className="font-mono text-brb-text block">
            {diag.osc.interface}:{diag.osc.port}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-brb-text-muted">Last OSC Message</span>
          <span className="font-mono text-brb-text block">{lastMsg}</span>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-brb-text-muted">Clients</span>
          <span className="font-mono text-brb-text block">{diag.connectedClients}</span>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-brb-text-muted">Uptime</span>
          <span className="font-mono text-brb-text block">{upMins}m</span>
        </div>
      </div>
    </div>
  );
}
