import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';

let db: Database.Database;

export interface LogEntry {
  id: number;
  session_id: string;
  game_number: number;
  number: number;
  timestamp: string;
  source: string;
}

export interface Session {
  id: string;
  game_number: number;
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
      game_number INTEGER NOT NULL DEFAULT 0,
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

  // Migration: add game_number column to existing sessions tables
  const columns = db.prepare("PRAGMA table_info(sessions)").all() as { name: string }[];
  if (!columns.some(c => c.name === 'game_number')) {
    db.exec(`ALTER TABLE sessions ADD COLUMN game_number INTEGER NOT NULL DEFAULT 0`);
    // Backfill game numbers for existing sessions by order of creation
    const sessions = db.prepare('SELECT id FROM sessions ORDER BY started_at ASC').all() as { id: string }[];
    const update = db.prepare('UPDATE sessions SET game_number = ? WHERE id = ?');
    sessions.forEach((s, i) => update.run(i + 1, s.id));
  }
}

export function createSession(id: string): Session {
  const now = new Date().toISOString();
  const row = db.prepare('SELECT COALESCE(MAX(game_number), 0) AS max_num FROM sessions').get() as { max_num: number };
  const gameNumber = row.max_num + 1;
  db.prepare('INSERT INTO sessions (id, game_number, started_at) VALUES (?, ?, ?)').run(id, gameNumber, now);
  return { id, game_number: gameNumber, started_at: now, ended_at: null };
}

export function endSession(id: string): void {
  const now = new Date().toISOString();
  db.prepare('UPDATE sessions SET ended_at = ? WHERE id = ?').run(now, id);
}

export function getSession(id: string): Session | undefined {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined;
}

export function insertLog(sessionId: string, number: number, source: string = 'qlab-osc', gameNumber: number = 0): LogEntry {
  const now = new Date().toISOString();
  const info = db.prepare(
    'INSERT INTO logs (session_id, number, timestamp, source) VALUES (?, ?, ?, ?)'
  ).run(sessionId, number, now, source);
  return {
    id: info.lastInsertRowid as number,
    session_id: sessionId,
    game_number: gameNumber,
    number,
    timestamp: now,
    source,
  };
}

export function getLogs(range?: string): LogEntry[] {
  let whereClause = '';
  if (range === 'today') {
    whereClause = `WHERE date(l.timestamp) = date('now')`;
  } else if (range === '7d') {
    whereClause = `WHERE l.timestamp >= datetime('now', '-7 days')`;
  } else if (range === '30d') {
    whereClause = `WHERE l.timestamp >= datetime('now', '-30 days')`;
  }
  return db.prepare(`
    SELECT l.id, l.session_id, s.game_number, l.number, l.timestamp, l.source
    FROM logs l
    JOIN sessions s ON s.id = l.session_id
    ${whereClause}
    ORDER BY l.timestamp DESC
  `).all() as LogEntry[];
}

export function getLogsForExport(range?: string): LogEntry[] {
  return getLogs(range);
}

export function getSessionLogs(sessionId: string): LogEntry[] {
  return db.prepare(`
    SELECT l.id, l.session_id, s.game_number, l.number, l.timestamp, l.source
    FROM logs l
    JOIN sessions s ON s.id = l.session_id
    WHERE l.session_id = ?
    ORDER BY l.timestamp ASC
  `).all(sessionId) as LogEntry[];
}
