# Hexagonal Architecture Migration Plan

## 1) Goals and Non‑Goals

**Goals**

- Make the frontend architecture explicit and resilient using a hexagonal (ports & adapters) style.
- Isolate **domain and application logic** from React, Zustand, and Socket.IO.
- Enable safer refactors and easier testing (unit + integration) of core game flows.
- Keep the current playable flow (`config -> lobby -> battle`) working throughout the migration.

**Non‑Goals**

- No full rewrite of the project.
- No change to the backend contract (battle/lobby APIs and events remain the same).
- No change of libraries (keep React, React Router, Zustand, Socket.IO, Vite).

---

## 2) Target High‑Level Architecture

At the end of this migration, the frontend should be organized conceptually into four main layers:

1. **Domain (Core)**
   - Pure business rules and models:
     - battle rules (turn resolution, winner detection, HP transitions),
     - lobby/session rules (when a player can join/ready, etc.).
   - No dependencies on React, Zustand, Socket.IO, browser APIs, or Vite.
   - Example folders:
     - `src/domain/battle`
     - `src/domain/lobby`
     - `src/domain/player`

2. **Application (Use Cases / Services)**
   - Orchestrates domain logic to satisfy user scenarios.
   - Depends on **ports (interfaces)**, not on concrete infrastructure.
   - Examples:
     - `joinLobby`, `assignRandomTeam`, `markPlayerReady`, `performAttack`, `surrenderBattle`, `reconnectSession`.
   - Example folder:
     - `src/application` (or `src/core/application`)

3. **Ports (Interfaces)**
   - Abstractions used by the application layer to interact with the outside world:
     - `RealtimeGateway` (send events and subscribe to backend pushes),
     - `LobbyRepository`, `BattleRepository`, `SessionStore`,
     - `Clock`, `Logger` (if needed later).
   - Example folder:
     - `src/application/ports`

4. **Adapters (Infrastructure + UI)**
   - **Infrastructure adapters** implement ports for the real world:
     - `SocketIoRealtimeGateway` wraps `socket.io-client`,
     - `ZustandBattleRepository`, `ZustandSessionStore` wrap the global store,
     - HTTP clients for REST endpoints.
   - **UI adapters** translate user interactions and navigation into use case invocations:
     - React components in `src/features/**/components`,
     - hooks such as `useConfigFlow`, `useLobbyFlow`, `useBattleFlow`,
     - route guards (`RequireBackendUrl`).
   - Example folders:
     - `src/infrastructure/realtime`
     - `src/infrastructure/store`
     - `src/infrastructure/http`
     - `src/app` and `src/features/**`

---

## 3) Current State vs Target State (Quick Mapping)

**Current**

- `src/features/*/components`
  - React UI; after Phase 1 refactors, mostly presentational and already in good shape.
- `src/features/*/hooks/use*Flow.ts`
  - Flow hooks that orchestrate network calls and store mutations; currently call Socket.IO and Zustand directly.
- `src/shared/store/*`
  - Zustand slices that mix:
    - domain behavior (battle transitions, lobby state),
    - persistence (in‑memory store),
    - sometimes direct effectful behavior (e.g. reading from `localStorage`).
- `src/shared/api/socket.ts`
  - Socket.IO client tightly coupled to `useAppStore`.
- `src/shared/api/http.ts`
  - HTTP helper coupled to normalized base URL.
- `src/shared/types/**`
  - Shared types for battle, lobby, teams, players, errors, socket events.

**Target**

- **Domain**
  - Extract pure logic from `battle` and parts of `session` slices into `src/domain/battle` and `src/domain/lobby`.
- **Application**
  - Wrap complex flows in explicit use case services under `src/application`:
    - Use cases depend on ports (`RealtimeGateway`, repositories, stores).
- **Ports**
  - Define TypeScript interfaces under `src/application/ports` (no implementation, no imports from React/Zustand).
- **Adapters**
  - Move all direct Socket.IO usage into `src/infrastructure/realtime`.
  - Move Zustand‑specific behavior into `src/infrastructure/store`.
  - Keep React UI and router under `src/app` and `src/features/**` but make them call application services instead of infrastructure directly.

---

## 4) Ports Design (First Iteration)

This section defines the initial set of ports (interfaces) the application layer will depend on. Names can be adjusted, but the idea is to capture the responsibilities clearly.

### 4.1 RealtimeGateway

```ts
// src/application/ports/RealtimeGateway.ts
export interface RealtimeGateway {
  connect(baseUrl: string): void
  disconnect(): void

  joinLobby(
    nickname: string,
    ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
  ): void

  rejoinLobby(
    playerId: string,
    lobbyId: string,
    ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
  ): void

  assignPokemon(
    ack?: (err: AppError | null, data?: unknown) => void,
  ): void

  markReady(
    ack?: (err: AppError | null, lobby?: unknown) => void,
  ): void

  attack(
    lobbyId: string,
    ack?: (err: AppError | null, result?: TurnResultPayload) => void,
  ): void

  surrender(
    lobbyId: string,
    ack?: (err: AppError | null, result?: SurrenderAckPayload) => void,
  ): void

  subscribeLobbyStatus(
    handler: (payload: LobbyStatusPayload) => void,
  ): () => void

  subscribeBattleEvents(handlers: {
    onBattleStart?: (payload: BattleStartPayload) => void
    onTurnResult?: (payload: TurnResultPayload) => void
    onBattleEnd?: (payload: BattleEndPayload) => void
    onError?: (error: AppError) => void
  }): () => void
}
```

This interface hides Socket.IO ack details and presents the application layer with a callback-based API built on the existing ack contracts.

### 4.2 Repositories and Stores

```ts
// src/application/ports/SessionStore.ts
export interface SessionStore {
  getPlayer(): Player | null
  setPlayer(player: Player | null): void

  getLobby(): Lobby | null
  setLobby(lobby: Lobby | null): void

  getTeam(): Team | null
  setTeam(team: Team | null): void

  setLobbyStatus(lobby: Lobby, player?: Player): void

  resetSession(): void
}
```

```ts
// src/application/ports/BattleRepository.ts
export interface BattleRepository {
  getBattle(): Battle | null
  getPokemonStates(): PokemonState[]

  setBattleStart(battle: Battle, pokemonStates: PokemonState[]): void
  applyTurnResult(payload: TurnResultPayload): void
  setBattleEnd(winnerId: string): void
  resetBattle(): void
}
```

```ts
// src/application/ports/ConnectionStore.ts
export interface ConnectionStore {
  getBackendBaseUrl(): string | null
  setBackendBaseUrl(url: string | null): void
  clearBackendBaseUrl(): void

  getSocketStatus(): SocketStatus
  setSocketStatus(status: SocketStatus): void

  getLastError(): AppError | null
  setLastError(error: AppError | null): void
}
```

The actual method signatures should be aligned with existing types in `src/shared/types`, but the key idea is: **application services only know about these ports**, not about Zustand or Socket.IO directly.

---

## 5) Application Services / Use Cases (First Iteration)

Application services compose domain logic and ports to implement flows. They have no JSX and no direct store or Socket.IO calls.

Example files:

- `src/application/LobbyService.ts`
- `src/application/BattleService.ts`
- `src/application/ConnectionService.ts`

### 5.1 LobbyService

Responsibilities:

- Join or rejoin a lobby.
- Assign Pokémon team.
- Mark player as ready.
- Derive lobby‑level information that UI needs (counts, flags like `bothReady`).

Sketch:

```ts
export class LobbyService {
  constructor(
    private readonly realtime: RealtimeGateway,
    private readonly sessionStore: SessionStore,
    private readonly connectionStore: ConnectionStore,
  ) {}

  async joinLobby(nickname: string): Promise<void> {
    const baseUrl = this.connectionStore.getBackendBaseUrl()
    if (!baseUrl) {
      throw new Error('Backend URL not configured')
    }

    await this.realtime.connect(baseUrl)

    const { lobbyId, playerId } = await this.realtime.joinLobby(nickname)

    // Domain & session updates via ports
    const currentLobby = this.sessionStore.getLobby()
    this.sessionStore.setPlayer({ id: playerId, nickname })
    this.sessionStore.setLobby({
      ...(currentLobby ?? { id: lobbyId }),
      // other lobby fields
    } as Lobby)
  }

  async assignTeam(): Promise<void> {
    await this.realtime.assignPokemon()
  }

  async markReady(): Promise<void> {
    await this.realtime.markReady()
  }
}
```

The actual implementation must respect the real backend contracts, but structurally this shows how services depend only on ports.

### 5.2 BattleService

Responsibilities:

- Coordinate starting a battle on `battle_start` events.
- Apply turn results and detect winners using domain logic.
- Provide read models for the UI (whose turn, HP ratios, winner banners).

Battle‑specific domain logic can live in `src/domain/battle` and be used both by:

- `BattleService` (through `BattleRepository`),
- direct tests (for pure domain functions).

---

## 6) Adapters (Infrastructure)

### 6.1 Socket.IO Adapter

Move the existing `shared/api/socket.ts` into `src/infrastructure/realtime/SocketIoRealtimeGateway.ts` (or similar), and implement `RealtimeGateway` there.

Key changes vs current implementation:

- No direct imports of `useAppStore`.
- Constructor receives callbacks or port implementations (e.g. `ConnectionStore`) to update state.
- Emits and listens to events exactly as today, but passes data/events into ports instead of mutating Zustand directly.

High‑level shape:

```ts
export class SocketIoRealtimeGateway implements RealtimeGateway {
  private socket: Socket | null = null

  constructor(
    private readonly connectionStore: ConnectionStore,
    private readonly sessionStore: SessionStore,
    private readonly battleRepository: BattleRepository,
  ) {}

  connect(baseUrl: string): void {
    // create socket, set connectionStore status,
    // register listeners and bridge events into repositories / stores.
  }

  // ...implement joinLobby, rejoinLobby, assignPokemon, markReady, attack, surrender...
}
```

### 6.2 Zustand Adapters

Wrap the existing slices in adapter classes or simple objects that implement the ports defined in section 4.

Example:

```ts
export class ZustandBattleRepository implements BattleRepository {
  getBattle(): Battle | null {
    return useAppStore.getState().battle
  }

  getPokemonStates(): PokemonState[] {
    return useAppStore.getState().pokemonStates
  }

  setBattleStart(battle: Battle, pokemonStates: PokemonState[]): void {
    useAppStore.getState().setBattleStart(battle, pokemonStates)
  }

  applyTurnResult(payload: TurnResultPayload): void {
    useAppStore.getState().applyTurnResult(payload)
  }

  setBattleEnd(winnerId: string): void {
    useAppStore.getState().setBattleEnd(winnerId)
  }

  resetBattle(): void {
    useAppStore.getState().resetBattle()
  }
}
```

`ZustandSessionStore` and `ZustandConnectionStore` would follow the same pattern.

---

## 7) Adapters (UI)

UI adapters live mostly where they already are:

- `src/app/App.tsx` and `src/app/router.tsx`
- `src/features/config/components/**`
- `src/features/lobby/components/**`
- `src/features/battle/components/**`

The main change is that **flow hooks** should use application services, not infrastructure directly.

### 7.1 Flow Hooks as Application Facades

Today:

- `useConfigFlow` uses store and HTTP/socket helpers.
- `useLobbyFlow` uses socket functions and store selectors.
- `useBattleFlow` (when expanded) will likely do something similar.

Target:

- `useConfigFlow` uses an injected `ConnectionService` (application layer).
- `useLobbyFlow` uses an injected `LobbyService`.
- `useBattleFlow` uses an injected `BattleService`.

Injection strategies:

- Simple and pragmatic:
  - Create services and adapters in a `providers` module (`src/app/providers.tsx`) and expose hooks like `useLobbyService()`.
- More formal:
  - Define a small dependency injection container or context that holds the application services wired with their ports/adapters.

This approach keeps components very thin:

- Components call `const { joinLobby, state } = useLobbyFlow()`.
- `useLobbyFlow` internally forwards to `LobbyService`.

---

## 8) Incremental Migration Plan

The goal is to migrate in small, safe steps without breaking the game flow.

### Phase A — Extract and Wire Ports (Infrastructure DIP)

1. **Define ports** in `src/application/ports`:
   - `RealtimeGateway`, `SessionStore`, `BattleRepository`, `ConnectionStore`.
2. **Create Zustand adapters** for these ports:
   - `ZustandSessionStore`, `ZustandBattleRepository`, `ZustandConnectionStore`.
3. **Refactor `shared/api/socket.ts` into a Socket.IO adapter**:
   - Move it into `src/infrastructure/realtime`.
   - Make it implement `RealtimeGateway` and depend only on port interfaces.
   - Remove direct imports of `useAppStore` from that file.
4. **Update `useAutoConnect` and router guards** to use the new gateway abstraction instead of the raw `connect()` function.

Result of Phase A:

- The networking layer no longer depends on the concrete Zustand store (DIP satisfied).
- Existing hooks and screens still work because adapters map ports back to the current store implementation.

### Phase B — Extract Domain Logic

1. **Battle domain**:
   - Extract pure functions from `shared/store/battle.ts` into `src/domain/battle`.
   - Examples:
     - `applyTurnResultDomain(battle, pokemonStates, payload)`,
     - `calculateNextToActPlayer(...)`,
     - `isBattleFinished(...)`.
   - Make the battle slice call these pure functions.
   - Add/extend unit tests to cover domain functions directly (in addition to slice behavior).
2. **Lobby domain**:
   - Extract rules around readiness, lobby capacity, etc. into `src/domain/lobby`.
   - Use those functions within the application services in the next phase.

Result of Phase B:

- Domain logic is testable in isolation (no React, no Zustand).
- The store becomes a persistence adapter around domain code.

### Phase C — Introduce Application Services

1. **Create `LobbyService`, `BattleService`, `ConnectionService`** in `src/application`.
2. **Move orchestration logic** from flow hooks (`useLobbyFlow`, `useBattleFlow`, `useConfigFlow`) into these services:
   - API call ordering,
   - error mapping using `mapBackendError`,
   - decisions about when to navigate to battle, etc.
3. **Refactor flow hooks to depend on services**:
   - Use React context or factories in `app/providers.tsx` to instantiate services with the right ports and adapters.
   - Inside hooks, replace direct calls to `socket.*` and `useAppStore` with delegated calls to services.

Result of Phase C:

- Flow hooks become thin facades over application services.
- Application services, in turn, depend only on ports and domain code.

### Phase D — Clean Up and Enforce Boundaries

1. **Remove remaining direct dependencies** from UI to infrastructure where not justified.
2. **Add ESLint boundary rules** (e.g. `eslint-plugin-boundaries`):
   - Forbid `domain` importing from `application`, `infrastructure`, or `features`.
   - Forbid `application` importing from `features`.
   - Only allow `features` and `app` to import `application`, `domain`, and `ports`.
3. **Add integration tests**:
   - `LobbyService` behavior under mocked `RealtimeGateway`.
   - Router guards under mocked stores/services.

Result of Phase D:

- Architectural intent is captured in code and enforced automatically.
- Future contributors are guided away from erosion (e.g. calling Socket.IO directly from components).

---

## 9) Testing and Safety Net

To keep the migration safe:

- **Unit tests**
  - Domain functions in `src/domain/battle` and `src/domain/lobby`.
  - Adapters (Zustand repositories, socket gateway) where logic is non‑trivial.
- **Integration tests**
  - Application services (`LobbyService`, `BattleService`) interacting with in‑memory/mock adapters.
- **Component tests**
  - Critical flows in `LobbyScreen` and `BattleScreen` using testing libraries with mocked services.

Vitest and the existing tests for `battle`, `url` utils, and `mapBackendError` act as the first slice of this safety net; they should be extended as new layers are extracted.

---

## 10) Summary

- The current project already follows many SOLID and Clean Code practices and is structurally close to a layered architecture.
- By introducing **ports** (interfaces) and **adapters** (Zustand, Socket.IO, HTTP) around the existing logic, the project can evolve into a clear hexagonal architecture without a rewrite.
- The migration should be performed incrementally (Phases A–D), with tests added or extended at each step to avoid regressions.

