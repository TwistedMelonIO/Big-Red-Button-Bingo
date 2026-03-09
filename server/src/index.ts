import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initDb } from './db.js';
import { initState } from './state.js';
import { initWs } from './ws.js';
import { initOsc, initOscClient } from './osc.js';
import apiRoutes from './api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize
console.log('[INIT] Starting Big Red Button Bingo server...');
initDb();
initState();

const app = express();
app.use(express.json());

// API routes
app.use(apiRoutes);

// Serve static frontend in production
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Create HTTP server and attach WebSocket
const server = createServer(app);
initWs(server);

// Start OSC listener and outbound client
initOsc();
initOscClient();

server.listen(config.port, () => {
  console.log(`[HTTP] Server running on port ${config.port}`);
  console.log(`[WS]   WebSocket available at ws://localhost:${config.port}/ws`);
  console.log(`[OSC]  Listening for UDP on ${config.oscInterface}:${config.oscPort}`);
  console.log(`[OSC]  Outbound to QLab at ${config.qlabHost}:${config.qlabOscPort}`);
});
