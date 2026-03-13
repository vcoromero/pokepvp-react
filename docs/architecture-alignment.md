# Architecture alignment: Clean Code, SOLID, Hexagonal

This document verifies that the lobby-connection changes (URL normalization, single gateway flow, LobbyService connect guard, store sync) stay aligned with **Clean Code**, **SOLID**, and **Hexagonal Architecture** (ports & adapters).

## Dependency rule (Hexagonal)

- **Domain** does not depend on application, infrastructure, or features (enforced by ESLint).
- **Application** (services, ports) does not depend on features or infrastructure; it depends only on ports and shared/domain.
- **Infrastructure** implements ports (adapters); it may depend on application ports and shared.
- **Features** do not import infrastructure directly; they use application services or shared (enforced by ESLint).
- **Shared** does not import from features, application, or infrastructure. It only provides cross-cutting concerns (types, store slices, utils, audio, UI, schemas, errors, api facades).

The **only composition root** for realtime and store wiring is `app/services-context.tsx`, which:

- Creates the concrete adapters (`SocketIoRealtimeGateway`, `ZustandConnectionStore`, `ZustandSessionStore`, `ZustandBattleRepository`, `HttpHealthClient`).
- Instantiates application services (`ConnectionService`, `LobbyService`, `BattleService`).
- Exposes them to features/shared hooks via React context (`useConnectionService`, `useLobbyService`, `useBattleService`).

All recent changes respect these boundaries.

---

## Changes and alignment

### 1. URL normalization (`toConnectableBaseUrl`)

| Where | Role | Alignment |
|-------|------|-----------|
| `shared/utils/url.ts` | Pure function: 0.0.0.0 / :: → localhost | **Shared** = no framework/infra; single responsibility (SRP). |
| `shared/api/http.ts` | Uses it for health URL | **Infrastructure** (HTTP client) uses shared util. |
| `shared/api/socket-client.ts` | Uses it for Socket.IO URL | **Infrastructure** (realtime client) uses shared util. |

- **SOLID:** Single responsibility (URL shape), no new dependencies from application/domain.
- **Hexagonal:** No new ports needed; URL transform is a shared utility used by adapters.

---

### 2. Single connection flow (`useAutoConnect` → `ConnectionService`)

| Where | Role | Alignment |
|-------|------|-----------|
| `useAutoConnect` | Calls `connectionService.reconnect()` instead of `connect()` from `socket.ts` | **Single gateway:** orchestration goes through the same application service (Config and Lobby use the same adapter). |
| `ConnectionService` | Owns `reconnect()` and `syncStatusFromRealtime()` | **Application** owns “when to connect” and “sync store from realtime”; no UI or infra in the service. |

- **SOLID:** Dependency Inversion — hook depends on `ConnectionService` (abstraction), not on a concrete gateway or socket.
- **Hexagonal:** Only the application layer triggers connection; infrastructure (gateway) is used via the port.

---

### 3. Store sync via port (no direct store in hook)

| Where | Role | Alignment |
|-------|------|-----------|
| `RealtimeGateway` (port) | New: `getConnectionState(): 'connected' \| 'disconnected'` | **Port** exposes connection state; adapter owns the “how” (e.g. socket). |
| `SocketIoRealtimeGateway` | Implements `getConnectionState()` with `socketClient.getSocket()?.connected` | **Adapter** translates socket state into port contract. |
| `ConnectionService` | New: `syncStatusFromRealtime()` — reads port, writes via `ConnectionStore` | **Application** owns the rule “if realtime is connected, store must be connected”; all store updates go through ports. |
| `useAutoConnect` | Calls `connectionService.syncStatusFromRealtime()` instead of `useAppStore.setState(...)` | **Hook** only orchestrates; no direct store writes. |

- **SOLID:** SRP (service = connection rules), OCP (new behavior via new method), DIP (hook → service → ports).
- **Hexagonal:** Store and socket are only touched through ports; UI (hook) does not depend on infrastructure.

---

### 4. LobbyService: connect only when needed

| Where | Role | Alignment |
|-------|------|-----------|
| `LobbyService.join()` | Calls `this.realtime.connect(baseUrl)` only when `getSocketStatus()` is not `'connected'` or `'connecting'` | **Application** rule: “do not reconnect if already connected/connecting.” Uses only `ConnectionStore` and `RealtimeGateway` (ports). |

- **SOLID:** SRP (service decides when to ensure connection); uses existing ports.
- **Hexagonal:** Application depends only on ports; no infra or UI.

---

## Summary

| Principle | How it’s respected |
|-----------|--------------------|
| **Clean Code** | Small, focused functions; naming clear; logic in application/shared, not scattered in UI. |
| **SOLID** | SRP (services/ports have clear roles), DIP (hooks and services depend on abstractions), OCP (extend via ports/methods). |
| **Hexagonal** | Dependency rule enforced; store and socket accessed only via ports; single connection flow through `ConnectionService`. |

The lobby-connection fixes (URL normalization, single gateway, connect guard, sync via service) are aligned with these practices. The only remaining coupling is `shared/hooks/useAutoConnect.ts` importing `@/app/services-context` to get `ConnectionService`; that is acceptable because the app layer is the composition root and the hook is an orchestration point that uses the injected service.
