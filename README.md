<div align="center">

# 🎮 PokePVP — Frontend ⚡

[![Status](https://img.shields.io/badge/Status-In%20Development-F39C12?style=flat-square)](.)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

> **Work in progress.** This repository is under active development.

Frontend client for **PokePVP**: a lightweight real-time PvP game where two players pick a team of 3 Pokémon from a catalog, join a lobby, and battle turn by turn until one player wins.

## Overview

This is the browser client that connects to the [PokePVP backend](../pokepvp-back) via REST and Socket.IO. It handles:

- **Catalog browsing** — display available Pokémon with stats and sprites
- **Lobby & team selection** — enter a nickname, get assigned 3 random Pokémon, and confirm ready
- **Real-time battle** — turn-based combat driven by Socket.IO events (attack, damage, defeat, battle end)

For the full game rules and flow, see [docs/business-rules.md](docs/business-rules.md).

## 📚 Documentation

- **[docs/business-rules.md](docs/business-rules.md)** — Canonical business rules: catalog, team selection, lobby states, battle flow, damage formula, and events. Shared with the backend.

---

*Connects to the PokePVP backend API and real-time Socket.IO endpoint.*
