import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { getState, GameState } from './state.js';
import type { LogEntry } from './db.js';

let wss: WebSocketServer;

export interface WsMessage {
  type: 'state' | 'number-called' | 'session-reset';
  payload: any;
}

export function initWs(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected');
    // Send full state on connect
    const msg: WsMessage = { type: 'state', payload: getState() };
    ws.send(JSON.stringify(msg));

    ws.on('close', () => {
      console.log('[WS] Client disconnected');
    });
  });

  return wss;
}

export function broadcastNumberCalled(number: number, logEntry: LogEntry): void {
  const msg: WsMessage = {
    type: 'number-called',
    payload: { number, logEntry, state: getState() },
  };
  broadcast(msg);
}

export function broadcastSessionReset(state: GameState): void {
  const msg: WsMessage = {
    type: 'session-reset',
    payload: state,
  };
  broadcast(msg);
}

function broadcast(msg: WsMessage): void {
  if (!wss) return;
  const data = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

export function getConnectedCount(): number {
  if (!wss) return 0;
  let count = 0;
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) count++;
  });
  return count;
}
