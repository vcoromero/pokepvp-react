# Frontend Specification — PokePVP

This document defines the architecture, stack, and implementation stages for the PokePVP web client. It is the single source of truth for frontend development. Business rules and event contracts are in [business-rules.md](business-rules.md).

---

## Implementation status (current)

- **Stage 1.1 — Done.** Project scaffold (Vite + React + TypeScript, Tailwind, Zustand, React Router, Socket.IO client), shared types, config feature (backend URL input, **Test connection** via `GET /health` — verified working), persistence in localStorage, router (`/`, `/config`, `/lobby`, `/battle`). Dev server runs on **port 3000**.
- **Stage 1.2 — Done.** `shared/api/socket.ts` (connect, disconnect, emit with ack: join_lobby, rejoin_lobby, assign_pokemon, ready, attack). All server events (`lobby_status`, `battle_start`, `turn_result`, `battle_end`, `error`) update Zustand slices. Connection slice includes `lastError` for Socket errors. Auto-connect when URL is set (hook `useAutoConnect` on lobby/battle screens). On connect, if store has player and lobby, auto-emit `rejoin_lobby` to restore player context after reconnect (e.g. tab backgrounded). Selector `selectIsMyTurn` for battle UI.
- **Stage 1.3 — Done.** Lobby UI: nickname input, Join, lobby state (players/ready count), Get team, 3 Pokémon (sprite from CDN + id), Ready, “Waiting for opponent”; on `battle_start` redirect to `/battle`.
- **Stage 1.4 — Done.** Battle screen: two sides (you vs opponent), active Pokémon (sprite, name, HP bar), bench list, Attack button (when `isMyTurn`), turn indicator, damage text from `turn_result`, winner overlay and Play again. Component-based: BattleScreen, BattleLayout, BattleSide, ActivePokemonCard, BenchPokemonList, AttackButton, TurnIndicator, WinnerOverlay; shared HpBar; useBattleFlow.
- **Stage 1.5 — Done.** Socket error and disconnect handling: `ConnectionBanner` in shared UI shows `lastError`, socket status, and "Change backend URL" link when disconnected; used on lobby and battle. Buttons already have loading/disabled states (Join, Get team, Ready, Attack).
- **Stage 2.1 — Done.** Full-screen background images: stadium in battle (`BattleLayout`), lobby in lobby screen (`LobbyScreen`), host/backend in config screen (`ConfigScreen`); assets in `shared/assets/images/` (stadium.png, lobby.png, host-backend.png) with dark overlay. Framer Motion: entrance animations for battle sides and Pokémon cards, stagger on bench; hit-shake on defender when damage is applied; transitions on AttackButton, TurnIndicator, WinnerOverlay, BenchPokemonList. Shared UI: `TypeBadge` / `TypeBadges` (oval gradient, white text, 18 types; sizes xs/sm/md) in ActivePokemonCard and lobby TeamGrid; `PulseGlowText` (pulse + glow, no box) for turn indicator and "Waiting for opponent to be ready…". Readability: semi-transparent panels for config form and lobby nickname form; "Joined as" pill on lobby; battle bottom bar with backdrop blur. Optional overlays: BattleStartOverlay (short "Battle start!" then fade out); WinnerOverlay with short "Victory!" / "Defeat!" phase then result + Play again. **8-bit theme:** Press Start 2P font (Google Fonts), `.pixel-art` for sharp sprites, `.btn-base` / `.text-btn-8bit` for button text size; **shared CSS** in `src/index.css` (`@layer components`): `.panel-card`, `.panel-card-subtle`, `.panel-overlay`, `.input-8bit`, `.btn-base` to avoid repeating class strings. Lobby team: three cards in a single row (flex-nowrap, overflow-x-auto), compact type badges (size xs), sprite w-16 h-16.

---

## 1. Overview

- **Goal:** A React + TypeScript SPA that connects to the PokePVP backend (REST + Socket.IO), lets two players join a lobby, pick a team, and fight a turn-based battle with clear UI and optional sound/visual effects.
- **Backend:** Already deployed (e.g. Render); MongoDB Atlas. All game flow is over Socket.IO; REST is minimal (e.g. `/health` for connectivity check).
- **Priority:** First **functional** end-to-end (config, lobby, battle); then **polish** (animations, sounds, stadium background).

---

## 2. Stack

| Concern | Choice | Notes |
|--------|--------|--------|
| Framework | React 18+ | With TypeScript strict mode |
| Build | Vite | Fast dev and small bundles |
| Styling | Tailwind CSS | Utility-first; shared component classes in `src/index.css` (§3.4); 8-bit font (Press Start 2P) |
| Global state | Zustand | Lightweight; one store split by domain (connection, session, battle) |
| Real-time | Socket.IO client | Same events as backend (see business-rules §7) |
| Animations | Framer Motion | Stage 2: battle FX, transitions |
| Audio | Howler.js | Stage 2: music + SFX (attack, faint, victory) |
| HTTP | `fetch` or thin client | Only for `/health` (and future REST if any) |

---

## 3. Frontend Architecture

We use a **feature-first** layout with clear **layers** so the app stays scalable and maintainable.

### 3.1 Folder Structure

```
src/
  app/                    # App shell, router, global providers
    App.tsx
    router.tsx
    providers.tsx
  config/                 # Env, constants, backend URL
    env.ts
    constants.ts
  features/               # Feature modules (one folder per flow)
    config/               # Backend URL setup & health check
      components/
      hooks/
      api/
    lobby/                # Join, assign team, ready
      components/
      hooks/
    battle/               # Battle screen, turn, attack
      components/
      hooks/
  shared/                 # Shared across features
    api/                  # Socket client, REST helpers
      socket.ts
      http.ts
    store/                # Zustand slices
      connection.ts
      session.ts
      battle.ts
      index.ts
    ui/                   # Reusable UI (HpBar, TypeBadge, PulseGlowText, etc.)
    types/                # TS types (Player, Lobby, Battle, events)
    hooks/                # useBackendUrl, useSocket, etc.
    utils/
    assets/               # Images, sounds (Stage 2)
      images/             # stadium.png, lobby.png, host-backend.png
      sounds/             # (Stage 2.2)
```

### 3.2 Layering Rules

- **`shared/`** must not import from **`features/`**. Features can use shared (store, api, ui, types).
- **`features/`** own their screens and feature-specific hooks; they call **`shared/api`** (Socket, HTTP) and **`shared/store`**.
- **State flow:** Socket events → update Zustand store → components read from store (and optional local UI state).
- **Side effects (audio, analytics):** Triggered from store subscriptions or from feature components that react to store changes (e.g. when `turn_result` is set, play SFX).

### 3.3 Data Flow (High Level)

```
Backend (Socket.IO)  →  socket.ts (listeners)  →  Zustand store  →  React components
User actions         →  socket.emit(...)       →  (ack / server events)  →  store updates
```

### 3.4 Styling and theme (8-bit)

- **Font:** "Press Start 2P" (Google Fonts) applied globally; base font-size 12px (mobile) / 14px (sm+).
- **Sprites:** Class `.pixel-art` (in `src/index.css`) keeps scaled sprites sharp (`image-rendering: pixelated`); used on all Pokémon sprite `<img>`s.
- **Buttons:** `.btn-base` for common button styling (font-size 0.8rem, rounded-lg, disabled states); components add color/hover. `.text-btn-8bit` available for non-button text when needed.
- **Shared component classes** (`@layer components` in `src/index.css`): `.panel-card` (dark slate panel), `.panel-card-subtle` (slate/80), `.panel-overlay` (floating form container with backdrop-blur), `.input-8bit` (dark input + amber focus ring). Use these instead of repeating long Tailwind strings.
- **TypeBadge:** Sizes `xs` (lobby team), `sm` (bench), `md` (battle cards). Lobby team cards use single row, compact badges, sprite 16×16 (Tailwind w-16 h-16).

---

## 4. Global State (Zustand)

Single store split into **slices** for clarity and minimal re-renders.

### 4.1 Connection slice (`shared/store/connection.ts`)

- `backendBaseUrl: string | null` — from localStorage; null until set.
- `socketStatus: 'disconnected' | 'connecting' | 'connected' | 'error'`
- `lastError: { code, message } | null` — last Socket `error` event (e.g. for toast/banner).
- `setBackendUrl(url: string)`, `clearBackendUrl()`, `setLastError()` — persist to localStorage and update state.

### 4.2 Session slice (`shared/store/session.ts`)

- `player: { id, nickname, lobbyId } | null`
- `lobby: Lobby | null` — full lobby (id, status, playerIds, readyPlayerIds, etc.).
- `team: { pokemonIds: number[] } | null` — current player’s team (from assign_pokemon ack).
- Actions: set from Socket acks and `lobby_status` payloads.

### 4.3 Battle slice (`shared/store/battle.ts`)

- `battle: Battle | null` — id, lobbyId, winnerId, nextToActPlayerId.
- `pokemonStates: PokemonState[]` — from `battle_start` and updated by `turn_result`.
- `lastTurnResult: TurnResultPayload | null` — last `turn_result` for UI (damage, defeated, next active).
- `isMyTurn: boolean` — derived: `battle?.nextToActPlayerId === session.player?.id`.
- Actions: set from `battle_start`, `turn_result`, `battle_end`.

Types (`Lobby`, `Battle`, `PokemonState`, `TurnResultPayload`) live in `shared/types/` and must match the exact shapes in [backend-data-contracts.md](backend-data-contracts.md).

---

## 5. Socket.IO Integration

### 5.1 Client API (`shared/api/socket.ts`)

- **Connect:** `connect(baseUrl: string)` — `io(baseUrl, { path: '/socket.io', ... })`.
- **Emit (with ack):**
  - `joinLobby(nickname)`
  - `rejoinLobby(playerId, lobbyId)` (used internally on reconnect)
  - `assignPokemon()`
  - `markReady()`
  - `attack(lobbyId)`
  - `surrender(lobbyId)` — extra feature to let a player concede the current battle.
- **Listen:** Register once on connect: `lobby_status`, `battle_start`, `turn_result`, `battle_end`, `error`.
- **Store sync:** On each event, update the corresponding Zustand slice so UI stays in sync.

### 5.2 Event Payloads (Reference)

- **lobby_status:** `{ lobby, player? }`
- **battle_start:** `{ battle, pokemonStates }` — battle includes `nextToActPlayerId`.
- **turn_result:** `{ battleId, lobbyId, attacker, defender, nextActivePokemon?, battleFinished, nextToActPlayerId? }`
- **battle_end:** `{ battleId, lobbyId, winnerId, loserId?, reason? }`
  - When the battle ends by surrender, backend also includes `loserId` and `reason: "surrender"`.
- **error:** `{ code, message }` — show in UI (toast or inline).

Server stores `playerId` and `lobbyId` on the socket; client must not send them for `assign_pokemon` or `ready`. For `attack`, payload is `{ lobbyId }` (and server validates against socket.data).

### 5.3 Client flow sequence

1. **Connect** to backend base URL (Socket.IO).
2. **join_lobby** `{ nickname }` → ack returns `{ player, lobby }`; server emits `lobby_status`.
3. **assign_pokemon** `{}` → ack returns team; server emits `lobby_status`.
4. **ready** `{}` → when both ready, server emits `battle_start` with `{ battle, pokemonStates }` (battle includes `nextToActPlayerId`).
5. **attack** `{ lobbyId }` (only when `nextToActPlayerId === my playerId`) → ack and server emit `turn_result`; use `nextToActPlayerId` for next turn; repeat until `battle_end`.
6. **surrender** `{ lobbyId }` — optional; lets the current player concede the battle. On success:
   - Ack: `{ battleId, lobbyId, winnerId, loserId, reason: "surrender", lobby }`
   - Server emits `battle_end` with `reason: "surrender"` so both clients can update UI.
7. **battle_end** `{ battleId, lobbyId, winnerId, loserId?, reason? }` — show winner and optionally allow new match.

---

## 6. Stages of Implementation

### Stage 1 — Functional (MVP)

**Objective:** Full playable flow without fancy effects. User can set backend URL, join lobby, get team, mark ready, and complete a battle with turn-based attacks.

#### Stage 1.1 — Project and config ✅ Done

- [x] Init Vite + React + TypeScript, Tailwind, Zustand.
- [x] Add `shared/types` for Player, Lobby, Battle, PokemonState, TurnResult, etc.
- [x] **Config feature:** Screen to set `backendBaseUrl` (input + “Save” + “Test connection” via `GET /health`). Persist in localStorage; redirect to config if missing. **Health check verified working.**
- [x] App router: `/` → config or lobby depending on whether URL is set; `/config`, `/lobby`, `/battle`. Dev server on port 3000.

#### Stage 1.2 — Socket and store ✅ Done

- [x] `shared/api/socket.ts`: connect, disconnect, emit with ack for join_lobby, rejoin_lobby, assign_pokemon, ready, attack. On connect, auto rejoin when store has player + lobby.
- [x] Listen to all server events and update Zustand (connection, session, battle slices). Connection slice includes `lastError` for Socket errors.
- [x] Connection slice: `backendBaseUrl`, `socketStatus`; auto-connect when URL is set (or on demand from lobby screen) via `useAutoConnect`. Selector `selectIsMyTurn` for battle UI.

#### Stage 1.3 — Lobby flow ✅ Done

- [x] Lobby UI: input nickname → “Join” → call `joinLobby(nickname)`; show lobby state (players, status: waiting/ready).
- [x] "Get team" → `assignPokemon()`; show 3 Pokémon (name, sprite, type from backend ack `pokemonDetails`).
- [x] "Ready" (enabled after team) → `markReady()`; show "Waiting for opponent" until both ready; on `battle_start` navigate to `/battle`.

#### Stage 1.4 — Battle flow ✅ Done

- [x] Battle screen: two sides (you vs opponent); show active Pokémon (sprite, name, HP bar); list other 2 with alive/defeated.
- [x] HP bar component: width by percentage (currentHp / maxHp); derive max from initial state or catalog.
- [x] "Attack" button: enabled only when `isMyTurn` and battle not finished; on click emit `attack(lobbyId)`.
- [x] "Surrender" button: available while the battle is in progress; opens a confirmation modal and, on confirm, emits `surrender(lobbyId)` so the opponent wins immediately.
- [x] On `turn_result`: update HP, show damage text, mark defeated; if `nextActivePokemon` switch displayed active.
- [x] On `battle_end`: show winner (and optionally “Play again” that resets and goes back to lobby/config). Supports both normal victories and victories by surrender (via `reason: "surrender"`).

#### Stage 1.5 — Error handling and UX ✅ Done

- [x] Show Socket `error` events (toast or banner): `ConnectionBanner` shows `lastError` on lobby and battle.
- [x] Handle disconnect: show status and "Change backend URL" link to `/config` to reconnect.
- [x] Loading/disabled states for buttons while request in flight (Join, Get team, Ready, Attack).

**Stage 1 exit criteria:** Two browser tabs can complete: set URL → join → assign → ready → battle → attack until victory, with correct turn order and HP updates.

---

### Stage 2 — Polish (Effects and Atmosphere)

**Objective:** Add stadium background, Framer Motion animations, and Howler.js music/SFX without changing game logic.

#### Stage 2.1 — Visual ✅ Done

- [x] Battle screen: background image (stadium) full-screen; position sprites and HP bars on top.
- [x] Lobby screen: full-screen background (lobby.png); nickname form in panel; "Joined as" pill. Config screen: full-screen background (host-backend.png); form in panel. Framer Motion: entrance for battle sides (stagger) and ActivePokemonCard; hit-shake on defender; transitions on AttackButton, TurnIndicator, WinnerOverlay, BenchPokemonList. TypeBadge/TypeBadges (oval, white text, 18 types). PulseGlowText for turn and "Waiting for opponent to be ready…". See Implementation status above for full list.
- [x] Optional: short “battle start” and “victory/defeat” overlays: BattleStartOverlay + WinnerOverlay announce phase (done).

#### Stage 2.2 — Audio (Howler.js)

- [ ] `shared/audio` (or `features/battle/audio`): init Howler; define music tracks (lobby, battle, victory/defeat) and SFX (attack, faint, etc.).
- [ ] Play lobby music when in lobby screen; switch to battle music on `battle_start`; play victory/defeat on `battle_end`.
- [ ] On each `turn_result`: play attack SFX; if defender defeated, play faint SFX.
- [ ] Optional: volume controls or mute in config/settings.

#### Stage 2.3 — Assets and tuning

- [x] Add stadium image to `shared/assets/images/stadium.png`; reference in battle layout.
- [x] Add lobby image `shared/assets/images/lobby.png`; reference in lobby screen.
- [x] Add config/backend image `shared/assets/images/host-backend.png`; reference in config screen.
- [ ] Add or link sound files (e.g. `assets/sounds/attack.mp3`, `battle.mp3`); document format and licensing if needed.
- [x] Tune animation duration and easing (entrance ~0.25s, shake 0.35s, pulse 2s loop) so feedback feels clear but not slow.
- [x] 8-bit theme and shared CSS: Press Start 2P font, `.pixel-art`, `.panel-card`, `.panel-overlay`, `.input-8bit`, `.btn-base`; lobby team single row with compact badges (TypeBadge xs).

**Stage 2 exit criteria:** Same flow as Stage 1, with stadium background, smooth animations on hit/switch/end, and coherent music + SFX.

---

## 7. Out of Scope (for this spec)

- Multiple concurrent lobbies or matchmaking (backend currently single lobby).
- Catalog browsing UI (team is random from backend).
- Auth beyond “nickname in lobby” (no login/register).
- Persisting game state across full page reload (rejoin works when tab is still open and only the socket reconnects; full reload would need session storage or similar).
- Backend deployment or database (already done).

---

## 8. References

- [business-rules.md](business-rules.md) — Catalog, team selection, lobby states, battle flow, damage formula, events (client–server contract).
- Backend is deployed (e.g. Render); Socket.IO path `/socket.io`; CORS and URL config per environment.
- Event payload shapes and ack behaviour: see backend Socket handler and `socketio-test-flow` (if kept in repo for reference).

---

*This spec should be updated when adding new features or changing architecture. Keep business-rules.md as the canonical contract between frontend and backend.*
