# SOLID & Clean Code Improvement Plan

## 1) Scope and Objective

This document reviews the current frontend implementation and proposes improvements aligned with:

- SOLID principles
- Clean Code practices
- React, Zustand, and Socket.IO official guidance (validated with Context7)

Primary objective: improve maintainability, testability, and scalability without breaking the current playable flow (`config -> lobby -> battle placeholder`).

---

## 2) Baseline Snapshot

Strengths at project start:

- Feature-first folder structure already in place (`app`, `features`, `shared`).
- Zustand slices separated (`connection`, `session`, `battle`), good starting point for SRP.
- Socket event syncing centralized in one module (`shared/api/socket.ts`).
- Build and type-check pass (`npm run build`).

Risks identified at audit:

- ~~UI components mixed rendering + orchestration + domain/state mutation.~~  ✅ Fixed in Phase 1
- ~~Networking layer tightly coupled to the global store.~~  (Phase 2)
- ~~Event payload typing weak (`unknown` casts in ack handling).~~  ✅ Fixed in Phase 1
- ~~URL normalization duplicated in multiple places.~~  ✅ Fixed in Phase 1
- ~~No domain-level error mapping.~~  ✅ Fixed in Phase 1
- No automated tests protecting current behavior.  (Phase 3)

---

## 3) Context7 References Used

### React (official docs)

- Keep components and hooks pure in render phase.
- Move side-effects to `useEffect` and encapsulate reusable logic in custom hooks.
- Prefer purpose-driven hooks to reduce component complexity.

### Zustand (official docs / guides)

- Use slices pattern for modular stores (already started here).
- Use selectors consistently to reduce unnecessary rerenders.
- Keep derived state computed with selectors instead of duplicating data.

### Socket.IO Client API

- Register listeners predictably and clean them with `off`/cleanup when needed.
- Avoid listener duplication and keep connection lifecycle explicit.

---

## 4) Findings and Improvements (Prioritized)

## P0 — High Impact

### P0.1 Separate view from orchestration in feature screens ✅ Done

**Was**
- `ConfigScreen` and `LobbyScreen` handled: UI rendering, API/socket orchestration, error mapping, direct store writes, and payload adaptation in one place.

**Violation**
- SRP (Single Responsibility Principle): components carried too many responsibilities.

**Applied**
- Extracted `features/config/hooks/useConfigFlow.ts` — manages form state, URL normalization, health check, save + navigate.
- Extracted `features/lobby/hooks/useLobbyFlow.ts` — manages join, getTeam, ready, derived state (isConnected, isReady, bothReady, playerCount, readyCount), and error mapping.
- `ConfigScreen` reduced to ~55 lines of pure JSX.
- `LobbyScreen` reduced to ~130 lines of pure JSX with no imports of API or store.

---

### P0.2 Decouple Socket client from Zustand store

**Current state**
- `shared/api/socket.ts` directly imports and mutates `useAppStore`.

**Why this is a problem**
- Violates DIP (Dependency Inversion Principle).
- Infrastructure layer depends on a concrete app-state implementation.
- Hard to reuse or test socket client in isolation.

**Planned improvement** (Phase 2)
- Introduce a thin event dispatcher/gateway contract:
  - `shared/api/socket-client.ts` (transport only)
  - `shared/realtime/socket-handlers.ts` (maps events to app actions)
- Inject handlers into `connect()` instead of hard-coding store access.

---

### P0.3 Harden event and ack typing ✅ Done

**Was**
- `joinLobby`, `assignPokemon`, `markReady`, `attack` used `unknown` and ad-hoc inline casting.

**Violation**
- Weak compile-time guarantees; runtime shape mismatches could silently break UI flow.

**Applied**
- Added `AckError`, `AckResponse<T>`, `JoinLobbyAckData`, `AssignPokemonAckData` types to `shared/types/socket-events.ts`.
- Added `AppError` canonical type in `shared/types/error.ts` and re-exported from barrel.
- Introduced type guard `isAckError<T>()` in `socket.ts`.
- All four emit functions (`joinLobby`, `assignPokemon`, `markReady`, `attack`) now use fully typed ack callbacks — zero `unknown` remaining.
- `store/types.ts` now uses `AppError` instead of the inline `{ code, message }` shape.

---

## P1 — Important

### P1.1 Introduce domain-level error mapping ✅ Done

**Was**
- Error strings handled ad-hoc per screen (`joinError`, `testMessage`, generic fallback messages scattered).

**Applied**
- Added `shared/types/error.ts` with `AppError { code, message }`.
- Added `shared/errors/index.ts` with `mapBackendError(error: AppError): string`.
  - Centralizes transport-to-user-facing message normalization.
  - `NotConnected` code gets a clear user-facing message.
- `useLobbyFlow` now calls `mapBackendError(err)` on every action error instead of reading `err.message` directly.
- `ConfigScreen` no longer compares strings to decide success color; hook exposes `testSuccess: boolean`.

---

### P1.2 Consolidate URL normalization ✅ Done

**Was**
- `trim().replace(/\/+$/, '')` duplicated in `ConfigScreen`, `socket.ts`, `http.ts`, and `connection.ts`.

**Applied**
- Added `shared/utils/url.ts` with:
  - `normalizeBaseUrl(url)` — trims and strips trailing slashes.
  - `isValidHttpUrl(url)` — validates `http:` / `https:` protocol.
- All four callers now import and use `normalizeBaseUrl`.

---

### P1.3 Route guards abstraction

**Current state**
- `LobbyRoute` and `BattlePlaceholder` in `router.tsx` duplicate backend-url guard and `useAutoConnect` wiring.

**Planned improvement** (Phase 2)
- Create reusable guard wrapper `app/guards/RequireBackendUrl.tsx`.
- Compose with `useAutoConnect` internally.

**SOLID/Clean benefit**
- OCP: extend routes without duplicating guard logic; cleaner router file.

---

### P1.4 Improve store selectors in heavy components

**Current state**
- `LobbyScreen` subscribed to individual store slices and duplicated derived values as local state.

**Partially resolved**
- `useLobbyFlow` now computes all derived values (`isConnected`, `isReady`, `bothReady`, `playerCount`, `readyCount`) from store reads — they are no longer duplicated as local state.

**Remaining** (Phase 2)
- Add `useShallow` for object-valued selectors to prevent unnecessary re-renders as features grow.

---

## P2 — Strategic (scalability/readiness)

### P2.1 Add tests by layer

Recommended minimum:

- Unit tests:
  - `shared/store/battle.ts` (`applyTurnResult`, winner updates, turn transitions)
  - `shared/utils/url.ts`
  - `shared/errors/index.ts`
- Integration tests:
  - `useLobbyFlow` with mocked socket acks/events
- Component tests:
  - Lobby happy-path and error states

Why:
- Refactoring toward SOLID without tests significantly increases risk.

---

### P2.2 Runtime contract validation for critical payloads

**Improvement**
- Add runtime validation for key inbound events (`battle_start`, `turn_result`, `error`) before state mutation.
- Optional approach: schema validation at boundary (e.g. Zod).

**Benefit**
- Defensive programming against backend drift or malformed payloads.

---

### P2.3 Formal architecture constraints

**Improvement**
- Add import boundary rules (ESLint) to enforce:
  - `shared` cannot import `features`
  - feature modules do not cross-import each other directly

**Benefit**
- Prevent architectural erosion as project grows.

---

## 5) SOLID Mapping (Quick Matrix)

| Principle | Status | Notes |
|-----------|--------|-------|
| S — Single Responsibility | ✅ Phase 1 done | Screens split into UI + flow hooks |
| O — Open/Closed | Phase 2 | Reusable guards, typed event maps, modular handlers |
| L — Liskov Substitution | Phase 2 | Applicable once transport interfaces are extracted |
| I — Interface Segregation | ✅ Phase 1 partial | Narrower ack types; flow hooks expose only needed surface |
| D — Dependency Inversion | Phase 2 | Socket client still depends directly on Zustand store |

---

## 6) Incremental Refactor Plan

### Phase 1 — Low-risk quick wins ✅ Completed

| Task | Result |
|------|--------|
| `shared/utils/url.ts` — `normalizeBaseUrl` + `isValidHttpUrl` | ✅ Created |
| `shared/types/error.ts` — canonical `AppError` | ✅ Created |
| `shared/errors/index.ts` — `mapBackendError` | ✅ Created |
| Typed ack types in `socket-events.ts` (`AckError`, `AckResponse<T>`, `JoinLobbyAckData`, `AssignPokemonAckData`) | ✅ Created |
| Remove all `unknown` casts from `socket.ts` via type guard `isAckError` | ✅ Applied |
| `features/config/hooks/useConfigFlow.ts` | ✅ Created |
| `features/lobby/hooks/useLobbyFlow.ts` | ✅ Created |
| `ConfigScreen` simplified to pure JSX | ✅ Applied |
| `LobbyScreen` simplified to pure JSX | ✅ Applied |
| Build + ESLint pass with zero errors | ✅ Verified |

**Files created:** 6 (`url.ts`, `error.ts`, `errors/index.ts`, `socket-events.ts` extended, `useConfigFlow.ts`, `useLobbyFlow.ts`)
**Files modified:** 7 (`socket.ts`, `http.ts`, `store/types.ts`, `store/connection.ts`, `types/index.ts`, `ConfigScreen.tsx`, `LobbyScreen.tsx`)

---

### Phase 2 — Architectural hardening

1. Extract socket transport (`socket-client.ts`) and inject handlers (DIP for networking layer).
2. Create `app/guards/RequireBackendUrl.tsx` reusable route guard (OCP).
3. Add `useShallow` selectors to `useLobbyFlow` and future heavy hooks.

### Phase 3 — Quality gate

1. Add unit/integration/component tests for critical paths.
2. Add runtime payload validation (Zod or custom guards).
3. Add ESLint boundary rules (`eslint-plugin-boundaries` or equivalent).

---

## 7) Acceptance Criteria for This Improvement Track

| Criterion | Status |
|-----------|--------|
| `ConfigScreen` and `LobbyScreen` are mostly presentational | ✅ Done |
| No `unknown` casting in socket ack/event handling | ✅ Done |
| URL normalization has a single source of truth | ✅ Done |
| Backend errors normalized through a single mapper | ✅ Done |
| Socket transport has no direct dependency on Zustand | Phase 2 |
| Core battle transitions covered by automated tests | Phase 3 |
| Architectural import boundaries enforced by lint rules | Phase 3 |

---

## 8) Feasibility Conclusion

The project has completed Phase 1 successfully: zero TypeScript errors, zero ESLint warnings, build passes.
The codebase is now cleaner and better positioned for Phase 2 (architectural hardening) and Phase 3 (quality gate).
