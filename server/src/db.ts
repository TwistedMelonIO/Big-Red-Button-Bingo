import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';

let db: Database.Database;

export interface LogEntry {
  id: number;
  session_id: string;
  number: number;
  timestamp: string;
  source: string;
}

export interface Session {
  id: string;
  started_at: string;
  ended_at: string | null;
}

export function initDb(): void {
  fs.mkdirSync(config.dataDir, { recursive: true });
  const dbPath = path.join(config.dataDir, 'bingo.db');
  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      ended_at TEXT
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      number INTEGER NOT NULL CHECK(number >= 1 AND number <= 90),
      timestamp TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'qlab-osc',
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_logs_session ON logs(session_id);
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
  `);
}

export function createSession(id: string): Session {
  const now = new Date().toISOString();
  db.prepare('INSERT INTO sessions (id, started_at) VALUES (?, ?)').run(id, now);
  return { id, started_at: now, ended_at: null };
}

export function endSession(id: string): void {
  const now = new Date().toISOString();
  db.prepare('UPDATE sessions SET ended_at = ? WHERE id = ?').run(now, id);
}

export function getSession(id: string): Session | undefined {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined;
}

export function insertLog(sessionId: string, number: number, source: string = 'qlab-osc'): LogEntry {
  const now = new Date().toISOString();
  const info = db.prepare(
    'INSERT INTO logs (session_id, number, timestamp, source) VALUES (?, ?, ?, ?)'
  ).run(sessionId, number, now, source);
  return {
    id: info.lastInsertRowid as number,
    session_id: sessionId,
    number,
    timestamp: now,
    source,
  };
}

export function getLogs(range?: string): LogEntry[] {
  let whereClause = '';
  if (range === 'today') {
    whereClause = `WHERE date(timestamp) = date('now')`;
  } else if (range === '7d') {
    whereClause = `WHERE timestamp >= datetime('now', '-7 days')`;
  } else if (range === '30d') {
    whereClause = `WHERE timestamp >= datetime('now', '-30 days')`;
  }
  return db.prepare(`SELECT * FROM logs ${whereClause} ORDER BY timestamp DESC`).all() as LogEntry[];
}

export function getLogsForExport(range?: string): LogEntry[] {
  return getLogs(range);
}

export function getSessionLogs(sessionId: string): LogEntry[] {
  return db.prepare('SELECT * FROM logs WHERE session_id = ? ORDER BY timestamp ASC').all(sessionId) as LogEntry[];
}
