# 🎮 PokePVP — Frontend ⚡

[![Status](https://img.shields.io/badge/Status-Live%20on%20Netlify-2ECC71?style=flat-square)](https://pokepvp-lite.netlify.app)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

<br />

> **Playable and deployed.** The game is live and ready to play. The core flow matches the defined business rules and you can already battle end‑to‑end; further UI/UX polish and visual improvements are planned for future iterations.

Frontend client for **PokePVP**: a lightweight real-time PvP game where two players pick a team of 3 Pokémon from a catalog, join a lobby, and battle turn by turn until one player wins.

## Live demo

You can start playing directly here:

- **PokePVP (Netlify):** https://pokepvp-lite.netlify.app

No local setup required: open the link, add https://pokepvp.onrender.com as backend service, choose a nickname, wait for a second player (or open another browser/tab), and start battling.

## Overview

This is the browser client that connects to the PokePVP backend via Socket.IO and REST (health check). It handles:

- **Backend config** — set and persist backend base URL (local or deployed). **Test connection** button calls `GET /health` and shows "Connection OK" or failure. **Mute music** option (persisted in localStorage).
- **Lobby & team selection** — enter a nickname, get assigned 3 random Pokémon, and confirm ready.
- **Real-time battle** — turn-based combat driven by Socket.IO events, including a **Surrender** action to concede.
- **Audio (Howler.js)** — lobby/config and battle music, victory/defeat jingles, attack and faint SFX; music does not restart on button presses.

## Run

```bash
npm install
npm run dev
```

App runs at **http://localhost:3000**. Set the backend URL in the config screen and use "Test connection" to verify `GET /health` before saving.

## Local development (frontend + backend)

When running both the frontend and the backend on your machine:

1. **Start the backend first** (e.g. on port 8080). Ensure it is listening (e.g. `PokePVP server listening on http://0.0.0.0:8080`).
2. **Start the frontend**: `npm run dev` (runs on http://localhost:3000).
3. **Configure the backend URL**: open http://localhost:3000 → you should be redirected to **Config** if no URL is saved. Enter **`http://localhost:8080`** (same port as your backend, no trailing slash), click **Test connection**. If you see "Connection OK", click **Save**.
4. You are taken to the Lobby. The app will try to connect to the backend via Socket.IO. If you see **"Not connected to the server"**:
   - Click **"Retry connection"** in the banner (the app does not auto-retry after a first failure).
   - Or go to **Change backend URL**, then Save again to force a new connection.
5. **CORS**: the backend must allow the frontend origin (e.g. `http://localhost:3000`). If the Socket.IO handshake is blocked, the connection will fail; check the backend CORS/cors configuration and the browser **Network** tab (look for failed or blocked requests to `http://localhost:8080/socket.io/`).

## 📚 Documentation

- **[docs/frontend-spec.md](docs/frontend-spec.md)** — Frontend architecture, stack, Zustand store, Socket.IO integration, and implementation stages (Stage 1: functional MVP; Stage 2: visuals and audio, including `shared/audio` with Howler.js).
- **[docs/business-rules.md](docs/business-rules.md)** — Canonical business rules: catalog, team selection, lobby states, battle flow, damage formula, and events. Shared with the backend.
- **[docs/backend-data-contracts.md](docs/backend-data-contracts.md)** — MongoDB schemas, domain shapes (what the backend returns), Socket.IO event payloads and ack returns. Use this to define TypeScript types.

---

*Connects to the PokePVP backend API and real-time Socket.IO endpoint.*
