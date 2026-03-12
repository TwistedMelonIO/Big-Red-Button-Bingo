# Big Red Button Bingo

A live bingo number display powered by QLab and OSC. Press a physical button in QLab, and the number appears instantly on a web dashboard.

**Stack:** React + Node.js + SQLite + OSC (Open Sound Control)

---

## What Does This Do?

This is a show-control tool for running bingo at live events. Here's the flow:

1. Someone presses a physical button (or triggers a cue) in **QLab**
2. QLab sends an **OSC message** over the network with the bingo number
3. This app receives the number and updates a **live web dashboard**
4. The dashboard shows the current number, recent history, and a full 1–90 board
5. The app also sends the numbers **back to QLab** to update on-screen text cues (scoreboard)

---

## Getting Started

### What You Need

- **Docker Desktop** — this runs the entire app in a container, no other software needed
  - [Download for Mac](https://www.docker.com/products/docker-desktop/)
  - [Download for Windows](https://www.docker.com/products/docker-desktop/)
  - [Install on Linux](https://docs.docker.com/engine/install/)

That's it. Docker includes everything else.

### Step 1: Download This Project

Open a terminal and run:

```bash
git clone https://github.com/TwistedMelonIO/Big-Red-Button-Bingo.git
cd Big-Red-Button-Bingo
```

> **Don't have git?** You can also click the green **"Code"** button on the GitHub page and select **"Download ZIP"**, then unzip it.

### Step 2: Run the Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Check that Docker is installed and running
- Create a `.env` config file from the template
- Build and start the app

> **On Windows?** Open PowerShell in the project folder and run:
> ```powershell
> docker compose up -d --build
> ```

### Step 3: Open the Dashboard

Go to **http://localhost:3000** in your browser. You should see the bingo board.

### That's It!

The app is now running. To connect it to QLab, see the [QLab Setup](#qlab-setup) section below.

---

## Useful Commands

Run these in a terminal from the project folder:

| Command | What it does |
|---------|-------------|
| `docker compose up -d` | Start the app (in background) |
| `docker compose down` | Stop the app |
| `docker compose up -d --build` | Rebuild and restart (after updates) |
| `docker compose logs -f` | Watch live logs |
| `./setup.sh` | Re-run full setup |

---

## Configuration

Copy `.env.example` to `.env` and edit it (the setup script does this automatically):

| Setting | Default | What it does |
|---------|---------|-------------|
| `PORT` | `3000` | Web dashboard port |
| `OSC_PORT` | `8001` | Port that listens for OSC messages from QLab |
| `OSC_INTERFACE` | `0.0.0.0` | Network interface to listen on (leave as-is) |
| `QLAB_HOST` | `127.0.0.1` | **IP address of your QLab Mac** (change this!) |
| `QLAB_OSC_PORT` | `53000` | QLab's OSC receive port |
| `DATA_DIR` | `./data` | Where the database is stored |

> **Important:** Set `QLAB_HOST` to the IP address of the Mac running QLab (e.g. `192.168.1.50`). This is how the scoreboard sends numbers back to QLab.

---

## QLab Setup

### Sending Numbers from QLab to This App

1. In QLab, go to **Workspace Settings > Network > OSC**
2. Add a new **Network Destination**:
   - **Name:** `BRB Bingo`
   - **Type:** UDP
   - **Host:** IP of the machine running this app (e.g. `192.168.1.100`)
   - **Port:** `8001`
3. For each bingo number (1–90), create an **OSC Cue**:
   - **Destination:** `BRB Bingo`
   - **Address:** `/brbingo/number`
   - **Argument:** Integer — the number (1 through 90)

### Receiving the Scoreboard in QLab

The app automatically sends the current and previous 10 called numbers back to QLab as text cue updates:

| OSC Address | Content |
|-------------|---------|
| `/cue/0/text` | Most recently called number |
| `/cue/1/text` through `/cue/10/text` | Previous 10 numbers |

To use this:
1. Create 11 **Text cues** in your QLab workspace, numbered `0` through `10`
2. Make sure `QLAB_HOST` in `.env` points to your QLab Mac's IP
3. The default QLab OSC port is `53000` — change `QLAB_OSC_PORT` if yours is different

### OSC Reference

| Direction | Address | Argument | Description |
|-----------|---------|----------|-------------|
| QLab → App | `/brbingo/number` | Integer (1–90) | Call a bingo number |
| QLab → App | `/brbingo/reset` | (none) | Reset the current session |
| App → QLab | `/cue/0/text` | String | Current number |
| App → QLab | `/cue/1/text` – `/cue/10/text` | String | Previous 10 numbers |

### Testing Without QLab

You can test manually in two ways:

**From the web dashboard:** Click the settings icon and use the manual number entry.

**From the command line** (using `oscsend` from `liblo-tools`):

```bash
# Call number 42
oscsend localhost 8001 /brbingo/number i 42

# Reset the session
oscsend localhost 8001 /brbingo/reset
```

**Via the API:**

```bash
# Call number 42
curl -X POST http://localhost:3000/api/call/42

# Reset the session
curl -X POST http://localhost:3000/api/session/reset
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
       ▲                          │                       │         │
       │ /cue/N/text              │  ┌──────────┐   ┌────▼───────┐ │
       └──────────────────────────│──│ SQLite   │◄──│ Express    │ │
         (scoreboard updates)     │  │ (logs)   │   │ API + WS   │ │
                                  │  └──────────┘   └─────┬──────┘ │
                                  │                       │        │
                                  │  ┌──────────────┐     │        │
                                  │  │ React SPA    │◄────┘        │
                                  │  │ (dashboard)  │  WebSocket   │
                                  │  └──────────────┘              │
                                  └──────────────────────────────────┘
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/state` | Current game state |
| `GET` | `/api/diagnostics` | OSC status, connected clients, uptime |
| `GET` | `/api/logs?range=today\|7d\|30d` | Filtered log entries |
| `GET` | `/api/logs/export?range=...` | Download logs as CSV |
| `POST` | `/api/session/reset` | Start a new session |
| `POST` | `/api/call/:number` | Manually call a number |

### WebSocket

Connect to `ws://<host>:3000/ws` for real-time updates:

| Event | When |
|-------|------|
| `state` | On initial connection (full game state) |
| `number-called` | When a number is called |
| `session-reset` | When the session is reset |

---

## Networking Notes

- **OSC uses UDP** — Docker must publish the port as UDP: `-p 8001:8001/udp` (the docker-compose.yml handles this)
- **QLab and the server must be on the same network** (or have a route between them)
- **QLab's OSC destination** should point to the Docker host's IP, not `127.0.0.1` (unless running on the same Mac)
- The OSC listener inside Docker binds to `0.0.0.0` so it receives packets from any network interface

---

## Troubleshooting

**Dashboard shows "Disconnected"**
- Make sure the Docker container is running: `docker compose ps`
- Check logs for errors: `docker compose logs`

**QLab numbers aren't showing up**
- Verify the OSC destination IP and port in QLab match your setup
- Check that both machines are on the same network
- Test with `curl -X POST http://localhost:3000/api/call/42` to confirm the app works

**Scoreboard not updating in QLab**
- Make sure `QLAB_HOST` in `.env` is set to your QLab Mac's IP (not `127.0.0.1`)
- Restart after changing `.env`: `docker compose down && docker compose up -d`

**Port conflict**
- If port 3000 or 8001 is already in use, change them in `.env` and `docker-compose.yml`

---

## Development (Optional)

If you want to modify the code instead of just running it:

### Prerequisites

- Node.js 20+
- npm

### Install Dependencies

```bash
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Run in Development Mode

Open two terminals:

```bash
# Terminal 1: Backend (with hot reload)
cd server && npm run dev

# Terminal 2: Frontend (Vite dev server)
cd client && npm run dev
```

The UI is at **http://localhost:5173** (auto-proxies API/WebSocket to port 3000).

### Build for Production (without Docker)

```bash
cd client && npm run build && cd ..
cd server && npm run build && npm start
```

---

## Project Structure

```
big-red-button-bingo/
├── client/                 # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # UI components (Board, LastCalled, etc.)
│   │   ├── hooks/          # WebSocket connection hook
│   │   ├── lib/            # API client
│   │   ├── App.tsx         # Main app layout
│   │   └── types.ts        # TypeScript types
│   └── ...
├── server/                 # Node.js backend (Express + TypeScript)
│   └── src/
│       ├── index.ts        # Entry point
│       ├── api.ts          # HTTP routes
│       ├── db.ts           # SQLite database
│       ├── osc.ts          # OSC listener + sender
│       ├── state.ts        # Game state management
│       └── ws.ts           # WebSocket broadcast
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # One-command deployment
├── setup.sh                # Automated setup script
├── .env.example            # Environment config template
└── README.md               # This file
```
