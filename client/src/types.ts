export interface NumberState {
  number: number;
  called: boolean;
  calledAt: string | null;
}

export interface GameState {
  sessionId: string;
  gameNumber: number;
  sessionStartedAt: string;
  numbers: NumberState[];
  lastCalled: number | null;
  calledCount: number;
  history: number[];
}

export interface LogEntry {
  id: number;
  session_id: string;
  game_number: number;
  number: number;
  timestamp: string;
  source: string;
}

export interface Diagnostics {
  osc: {
    listening: boolean;
    port: number;
    interface: string;
    lastMessageAt: string | null;
  };
  connectedClients: number;
  uptime: number;
}

export interface WsMessage {
  type: 'state' | 'number-called' | 'session-reset';
  payload: any;
}
