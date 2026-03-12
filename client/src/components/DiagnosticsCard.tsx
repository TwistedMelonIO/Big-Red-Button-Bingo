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
    <div className="p-5 bg-brb-surface rounded-xl border border-brb-border space-y-4">
      <h3 className="text-[11px] font-mono uppercase tracking-[0.3em] text-brb-red">
        Diagnostics
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <span className="text-[11px] text-brb-text-muted font-mono">OSC Status</span>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                diag.osc.listening ? 'bg-brb-green status-pulse' : 'bg-brb-red'
              }`}
            />
            <span className={`font-mono ${diag.osc.listening ? 'text-brb-green' : 'text-brb-red'}`}>
              {diag.osc.listening ? 'Listening' : 'Down'}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-brb-text-muted font-mono">OSC Port</span>
          <span className="font-mono text-brb-text block">
            {diag.osc.interface}:{diag.osc.port}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-brb-text-muted font-mono">Last OSC Message</span>
          <span className="font-mono text-brb-text block">{lastMsg}</span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-brb-text-muted font-mono">Clients</span>
          <span className="font-mono text-brb-text block">{diag.connectedClients}</span>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-brb-text-muted font-mono">Uptime</span>
          <span className="font-mono text-brb-text block">{upMins}m</span>
        </div>
      </div>
    </div>
  );
}
