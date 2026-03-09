import { v4 as uuidv4 } from 'uuid';
import { createSession, endSession, insertLog, getSessionLogs, LogEntry } from './db.js';

export interface NumberState {
  number: number;
  called: boolean;
  calledAt: string | null;
}

export interface GameState {
  sessionId: string;
  sessionStartedAt: string;
  numbers: NumberState[];
  lastCalled: number | null;
  calledCount: number;
  history: number[];
}

let state: GameState;

export function initState(): GameState {
  const sessionId = uuidv4();
  const now = new Date().toISOString();
  createSession(sessionId);

  state = {
    sessionId,
    sessionStartedAt: now,
    numbers: Array.from({ length: 90 }, (_, i) => ({
      number: i + 1,
      called: false,
      calledAt: null,
    })),
    lastCalled: null,
    calledCount: 0,
    history: [],
  };

  return state;
}

export function getState(): GameState {
  return state;
}

export interface CallResult {
  success: boolean;
  error?: string;
  number?: number;
  logEntry?: LogEntry;
}

export function callNumber(num: number, source: string = 'qlab-osc'): CallResult {
  if (num < 1 || num > 90) {
    return { success: false, error: `Invalid number: ${num}. Must be 1–90.` };
  }

  const idx = num - 1;
  if (state.numbers[idx].called) {
    return { success: false, error: `Number ${num} already called this session.` };
  }

  const now = new Date().toISOString();
  state.numbers[idx].called = true;
  state.numbers[idx].calledAt = now;
  state.lastCalled = num;
  state.calledCount++;
  state.history.unshift(num);

  const logEntry = insertLog(state.sessionId, num, source);

  return { success: true, number: num, logEntry };
}

export function resetSession(): GameState {
  endSession(state.sessionId);
  return initState();
}
