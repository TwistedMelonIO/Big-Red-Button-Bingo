# Big Red Button Bingo

A QLab-driven bingo game control interface. Physical button press → QLab video cue → OSC message → live web dashboard for the operator.

![Stack: React + Node + SQLite + OSC](https://img.shields.io/badge/stack-React%20%7C%20Node%20%7C%20SQLite%20%7C%20OSC-e63946)

---

## Quick Start (Docker)

```bash
# Build
docker build -t brb-bingo .

# Run (note: OSC uses UDP!)
docker run -d \
  --name brb-bingo \
  -p 3000:3000 \
  -p 8001:8001/udp \
  -v brb-bingo-data:/app/data \
  brb-bingo
```

Or with Docker Compose:

```bash
docker compose up -d
```

Open **http://localhost:3000** in your browser.

---

## Quick Start (New Machine)

```bash
git clone https://github.com/TwistedMelonIO/Big-Red-Button-Bingo.git
cd Big-Red-Button-Bingo
cp .env.example .env   # set QLAB_HOST to your QLab machine's IP
cd server && npm install && cd ../client && npm install && cd ..
```

Then follow the dev or production steps below.

---

## Quick Start (Development)

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### Run dev

In two terminals:

```bash
# Terminal 1: Server (with hot reload)
cd server && npm run dev

# Terminal 2: Client (Vite dev server with proxy)
cd client && npm run dev
```

The UI is at **http://localhost:5173** (proxies API/WS to port 3000).

### Build for production

```bash
cd client && npm run build
cd ../server && npm run build && npm start
```

---

## Architecture

```
┌──────────────┐     OSC/UDP      ┌──────────────────────────────────┐
│   QLab Mac   │ ───────────────► │  Docker Container                │
│              │  /brbingo/number │                                  │
│  Button      │                  │  ┌──────────┐   ┌────────────┐  │
│  → Video Cue │                  │  │ OSC      │──►│ Game State │  │
│  → OSC Cue   │                  │  │ Listener │   │ (memory)   │  │
└──────────────┘                  │  └──────────┘   └─────┬──────┘  │
                                  │                       │         │
                                  │  ┌──────────┐   ┌────▼───────┐ │
                                  │  │ SQLite   │◄──│ Express    │ │
                                  │  │ (logs)   │   │ API + WS   │ │
                                  │  └──────────┘   └─────┬──────┘ │
                                  │                       │        │
                                  │  ┌──────────────┐     │        │
                                  │  │ React SPA    │◄────┘        │
                                  │  │ (static)     │  WebSocket   │
                                  │  └──────────────┘              │
                                  └──────────────────────────────────┘
```

---

## QLab OSC Configuration

### Setting up QLab to send to this server

1. In QLab, go to **Workspace Settings → Network → OSC**.
2. Add a new **Network Destination**:
   - **Name:** `BRB Bingo`
   - **Type:** UDP
   - **Host:** IP address of the machine running the Docker container (e.g. `192.168.1.100`)
   - **Port:** `8001` (or whatever you set `OSC_PORT` to)

3. For each bingo number (1–90), create an **OSC Cue**:
   - **OSC Destination:** `BRB Bingo`
   - **OSC Message:**
     - Address: `/brbingo/number`
     - Argument: Integer value `1` through `90`

### OSC Protocol Reference

| Direction | Address | Arguments | Description |
|-----------|---------|-----------|-------------|
| QLab → Server | `/brbingo/number` | `int32` (1–90) | Call a bingo number |
| Server → QLab | `/cue/0/text` | `string` | Current number (most recently called) |
| Server → QLab | `/cue/1/text` – `/cue/10/text` | `string` | Previous 10 numbers (history) |

> On every number call, the server sends up to 11 OSC messages to QLab updating text cues 0–10. On session reset, all 11 cues are blanked with empty strings. Only slots with values are sent (e.g. if only 3 numbers have been called, only `/cue/0`, `/cue/1`, `/cue/2` are sent).

### Setting up the QLab scoreboard

1. Create 11 **Text cues** in your QLab workspace, numbered **0** through **10**.
2. Set `QLAB_HOST` in your `.env` to the IP of the Mac running QLab.
3. `QLAB_OSC_PORT` defaults to `53000` (QLab's standard OSC receive port).

### Example QLab cue script (for bulk creation)

If you're scripting cue creation in QLab, each cue's OSC message should be:

```
Address: /brbingo/number
Type: Integer
Value: <number 1-90>
```

### Testing OSC without QLab

You can test with `oscsend` (from `liblo-tools`):

```bash
# Call number 42
oscsend localhost 8001 /brbingo/number i 42

# Call number 7
oscsend localhost 8001 /brbingo/number i 7
```

---

## API Reference

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/state` | Current game state (numbers, last called, session info) |
| `GET` | `/api/diagnostics` | OSC status, connected clients, uptime |
| `GET` | `/api/logs?range=today\|7d\|30d` | Filtered log entries |
| `GET` | `/api/logs/export?range=...` | Download logs as CSV |
| `POST` | `/api/session/reset` | Start new session (preserves history) |
| `POST` | `/api/call/:number` | Manually call a number (for testing) |

### WebSocket

Connect to `ws://<host>:<port>/ws`

**Events received:**

| Type | Payload | When |
|------|---------|------|
| `state` | Full `GameState` | On initial connection |
| `number-called` | `{ number, logEntry, state }` | When a number is called |
| `session-reset` | Full `GameState` | When session is reset |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP/WS server port |
| `OSC_PORT` | `8001` | UDP port for inbound OSC from QLab |
| `OSC_INTERFACE` | `0.0.0.0` | OSC bind address |
| `QLAB_HOST` | `127.0.0.1` | IP of the QLab machine (scoreboard target) |
| `QLAB_OSC_PORT` | `53000` | QLab OSC receive port |
| `DATA_DIR` | `./data` | SQLite database location |

---

## Project Structure

```
big-red-button-bingo/
├── client/                 # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # useSocket for realtime state
│   │   ├── lib/            # API client
│   │   ├── App.tsx         # Main app
│   │   └── types.ts        # Shared type definitions
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                 # Node.js backend
│   └── src/
│       ├── index.ts        # Entry point
│       ├── api.ts          # Express routes
│       ├── config.ts       # Environment config
│       ├── db.ts           # SQLite (better-sqlite3)
│       ├── osc.ts          # OSC UDP listener
│       ├── state.ts        # In-memory game state
│       └── ws.ts           # WebSocket broadcast
├── Dockerfile              # Multi-stage production build
├── docker-compose.yml      # One-command deploy
├── .env.example
└── README.md
```

---

## Networking Notes

- **OSC uses UDP.** When running Docker, you must publish the port as UDP: `-p 8001:8001/udp`
- **QLab and the server must be on the same network** (or have a route between them).
- **QLab's OSC destination** should point to the Docker host's IP, not `127.0.0.1` (unless running on the same Mac).
- Inside Docker, the OSC listener binds to `0.0.0.0` so it can receive external packets.

---

## License

Private / Internal use.
