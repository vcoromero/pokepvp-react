<div align="center">

# 🎮 PokePVP — Frontend ⚡

[![Status](https://img.shields.io/badge/Status-Live%20on%20Netlify-2ECC71?style=flat-square)](https://pokepvp-lite.netlify.app/lobby)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

> **Playable and deployed.** The game is live at [`pokepvp-lite.netlify.app`](https://pokepvp-lite.netlify.app/lobby). The core flow matches the defined business rules and is fully playable; further UI/UX polish and visual improvements are planned.

Frontend client for **PokePVP**: a lightweight real-time PvP game where two players pick a team of 3 Pokémon from a catalog, join a lobby, and battle turn by turn until one player wins.

## Overview

This is the browser client that connects to the PokePVP backend via Socket.IO and REST (health check). It handles:

- **Backend config** — set and persist backend base URL (local or deployed). **Test connection** button calls `GET /health` and shows "Connection OK" or failure.
- **Lobby & team selection** — enter a nickname, get assigned 3 random Pokémon, and confirm ready (Stage 1.3).
- **Real-time battle** — turn-based combat driven by Socket.IO events (Stage 1.4), including a **Surrender** action to concede very long battles.

## Run

```bash
npm install
npm run dev
```

App runs at **http://localhost:3000**. Set the backend URL in the config screen and use "Test connection" to verify `GET /health` before saving.

## 📚 Documentation

- **[docs/frontend-spec.md](docs/frontend-spec.md)** — Frontend architecture, stack, Zustand store, Socket.IO integration, and implementation stages (Stage 1: functional MVP; Stage 2: effects and audio).
- **[docs/business-rules.md](docs/business-rules.md)** — Canonical business rules: catalog, team selection, lobby states, battle flow, damage formula, and events. Shared with the backend.
- **[docs/backend-data-contracts.md](docs/backend-data-contracts.md)** — MongoDB schemas, domain shapes (what the backend returns), Socket.IO event payloads and ack returns. Use this to define TypeScript types.
- **[docs/solid-clean-code-improvements.md](docs/solid-clean-code-improvements.md)** — SOLID & Clean Code audit: prioritized findings, applied improvements (Phase 1 complete), and roadmap for Phases 2–3.

---

*Connects to the PokePVP backend API and real-time Socket.IO endpoint.*
