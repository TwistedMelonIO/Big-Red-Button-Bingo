import { Server as OscServer, Client as OscClient } from 'node-osc';
import { config } from './config.js';
import { callNumber, getState } from './state.js';
import { broadcastNumberCalled } from './ws.js';

let oscServer: OscServer | null = null;
let oscClient: OscClient | null = null;
let lastMessageAt: string | null = null;
let lastScoreboardSentAt: string | null = null;
let listening = false;

export function initOsc(): void {
  try {
    oscServer = new OscServer(config.oscPort, config.oscInterface);

    oscServer.on('message', (msg: any[]) => {
      const address = msg[0];
      lastMessageAt = new Date().toISOString();

      console.log(`[OSC] Received: ${address} ${msg.slice(1).join(' ')}`);

      if (address === '/brbingo/number') {
        const num = parseInt(msg[1], 10);
        if (isNaN(num)) {
          console.error(`[OSC] Invalid payload for /brbingo/number: ${msg[1]}`);
          return;
        }

        const result = callNumber(num, 'qlab-osc');
        if (result.success && result.logEntry) {
          console.log(`[OSC] Number ${num} called successfully`);
          broadcastNumberCalled(num, result.logEntry);
          sendScoreboard();
        } else {
          console.warn(`[OSC] Rejected: ${result.error}`);
        }
      } else {
        console.warn(`[OSC] Unknown address: ${address}`);
      }
    });

    oscServer.on('error', (err: Error) => {
      console.error('[OSC] Error:', err.message);
      listening = false;
    });

    listening = true;
    console.log(`[OSC] Listening on ${config.oscInterface}:${config.oscPort}`);
  } catch (err: any) {
    console.error('[OSC] Failed to start:', err.message);
    listening = false;
  }
}

export function initOscClient(): void {
  oscClient = new OscClient(config.qlabHost, config.qlabOscPort);
  console.log(`[OSC] Outbound client targeting ${config.qlabHost}:${config.qlabOscPort}`);
}

export function sendScoreboard(): void {
  if (!oscClient) return;

  const { history } = getState();
  const count = Math.min(history.length, 11);

  // Update QLab text cues: cue 0 = current number, cues 1-10 = previous
  for (let i = 0; i < count; i++) {
    oscClient.send(`/cue/${i}/text`, String(history[i]));
  }

  lastScoreboardSentAt = new Date().toISOString();
  console.log(`[OSC] Scoreboard sent: ${count} cue(s) to ${config.qlabHost}:${config.qlabOscPort}`);
}

export function clearScoreboard(): void {
  if (!oscClient) return;

  for (let i = 0; i <= 10; i++) {
    oscClient.send(`/cue/${i}/text`, '');
  }

  console.log(`[OSC] Scoreboard cleared: 11 cue(s) blanked on ${config.qlabHost}:${config.qlabOscPort}`);
}

export function getOscStatus() {
  return {
    listening,
    port: config.oscPort,
    interface: config.oscInterface,
    outbound: {
      host: config.qlabHost,
      port: config.qlabOscPort,
      lastScoreboardSentAt,
    },
    lastMessageAt,
  };
}
