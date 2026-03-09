import type { GameState, LogEntry, Diagnostics } from '../types';

const BASE = '';

export async function fetchState(): Promise<GameState> {
  const res = await fetch(`${BASE}/api/state`);
  return res.json();
}

export async function fetchDiagnostics(): Promise<Diagnostics> {
  const res = await fetch(`${BASE}/api/diagnostics`);
  return res.json();
}

export async function fetchLogs(range?: string): Promise<LogEntry[]> {
  const params = range ? `?range=${range}` : '';
  const res = await fetch(`${BASE}/api/logs${params}`);
  return res.json();
}

export async function exportLogs(range?: string): Promise<void> {
  const params = new URLSearchParams();
  if (range) params.set('range', range);

  const url = `${BASE}/api/logs/export?${params.toString()}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bingo-logs.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function resetSession(): Promise<void> {
  await fetch(`${BASE}/api/session/reset`, { method: 'POST' });
}

export async function manualCall(num: number): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BASE}/api/call/${num}`, { method: 'POST' });
  return res.json();
}
