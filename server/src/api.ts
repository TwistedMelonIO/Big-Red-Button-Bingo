import { Router, Request, Response } from 'express';
import { getState, resetSession, callNumber } from './state.js';
import { getLogs, getLogsForExport } from './db.js';
import { getOscStatus, sendScoreboard, clearScoreboard } from './osc.js';
import { broadcastSessionReset, broadcastNumberCalled, getConnectedCount } from './ws.js';

const router = Router();

// Current game state
router.get('/api/state', (_req: Request, res: Response) => {
  res.json(getState());
});

// Diagnostics
router.get('/api/diagnostics', (_req: Request, res: Response) => {
  res.json({
    osc: getOscStatus(),
    connectedClients: getConnectedCount(),
    uptime: process.uptime(),
  });
});

// Logs with optional range filter
router.get('/api/logs', (req: Request, res: Response) => {
  const range = req.query.range as string | undefined;
  const logs = getLogs(range);
  res.json(logs);
});

// Export logs as CSV
router.get('/api/logs/export', (req: Request, res: Response) => {
  const range = req.query.range as string | undefined;
  const logs = getLogsForExport(range);

  res.setHeader('Content-Disposition', 'attachment; filename=bingo-logs.csv');
  res.setHeader('Content-Type', 'text/csv');

  const header = 'id,session_id,number,timestamp,source\n';
  const rows = logs
    .map((l) => `${l.id},"${l.session_id}",${l.number},"${l.timestamp}","${l.source}"`)
    .join('\n');
  res.send(header + rows);
});

// Reset session
router.post('/api/session/reset', (_req: Request, res: Response) => {
  const newState = resetSession();
  broadcastSessionReset(newState);
  clearScoreboard();
  res.json({ success: true, session: newState });
});

// Manual number call (for testing / manual override)
router.post('/api/call/:number', (req: Request, res: Response) => {
  const num = parseInt(req.params.number, 10);
  const result = callNumber(num, 'manual');
  if (result.success && result.logEntry) {
    broadcastNumberCalled(num, result.logEntry);
    sendScoreboard();
    res.json({ success: true, number: num });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

export default router;
