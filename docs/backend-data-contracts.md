# Backend Data Contracts — PokePVP

This document describes how data is stored in MongoDB and what exact shapes the frontend receives, either via Socket.IO events or ack callbacks. Use this as the source of truth for TypeScript types in `shared/types/`.

---

## 1. MongoDB Collections (Storage Layer)

These are the Mongoose schemas — what lives in the database. All documents use MongoDB `ObjectId` as `_id`; Mongoose also adds `createdAt` and `updatedAt` via `{ timestamps: true }`.

### Collection: `players`

```
{
  _id:       ObjectId     // auto-generated
  nickname:  String       // required, max 30 chars
  lobbyId:   ObjectId     // ref: Lobby — nullable (null until joined)
  createdAt: Date         // auto via timestamps
  updatedAt: Date         // auto via timestamps
}
```

Index: `{ lobbyId: 1 }`

---

### Collection: `lobbies`

```
{
  _id:            ObjectId                                 // auto-generated
  status:         'waiting' | 'ready' | 'battling' | 'finished'   // required
  playerIds:      ObjectId[]   // ref: Player — up to 2 entries
  readyPlayerIds: ObjectId[]   // ref: Player — default []
  createdAt:      Date         // auto via timestamps
  updatedAt:      Date         // auto via timestamps
}
```

Index: `{ status: 1 }`

---

### Collection: `teams`

```
{
  _id:        ObjectId    // auto-generated
  lobbyId:    ObjectId    // ref: Lobby — required
  playerId:   ObjectId    // ref: Player — required
  pokemonIds: Number[]    // exactly 3 catalog IDs
  createdAt:  Date
  updatedAt:  Date
}
```

Unique index: `{ lobbyId: 1, playerId: 1 }` — one team per player per lobby.

---

### Collection: `battles`

```
{
  _id:               ObjectId   // auto-generated
  lobbyId:           ObjectId   // ref: Lobby — required
  startedAt:         Date       // default: now
  winnerId:          ObjectId   // ref: Player — null until battle ends
  nextToActPlayerId: ObjectId   // ref: Player — null until battle starts; updated after each turn
  createdAt:         Date
  updatedAt:         Date
}
```

Unique index: `{ lobbyId: 1 }` — one battle per lobby.

---

### Collection: `pokemonstates`

```
{
  _id:       ObjectId   // auto-generated
  battleId:  ObjectId   // ref: Battle — required
  pokemonId: Number     // catalog ID — required
  playerId:  ObjectId   // ref: Player — required
  currentHp: Number     // required; starts at catalog hp, never below 0
  defeated:  Boolean    // default: false; becomes true when currentHp reaches 0
  name:      String     // default: '' — Pokémon name (from catalog, stored at battle start)
  sprite:    String     // default: '' — sprite URL (from catalog, stored at battle start)
  type:      String[]   // default: [] — type array e.g. ['Fire', 'Flying'] (from catalog)
  createdAt: Date
  updatedAt: Date
}
```

Index: `{ battleId: 1, playerId: 1, pokemonId: 1 }`

> `name`, `sprite`, and `type` are populated by `StartBattleUseCase` from the external catalog API at battle initialization and stored in MongoDB so the frontend does not need to call the catalog API separately during battle.

---

## 2. Domain Shapes (What the Backend Returns to the Frontend)

The backend maps MongoDB documents to plain domain objects before sending them. The key transformation: `_id` (ObjectId) → `id` (string). All IDs the frontend receives are plain strings.

### Player

```ts
{
  id:      string           // MongoDB _id as string
  nickname: string
  lobbyId: string | undefined  // undefined if not yet joined a lobby
}
```

### Lobby

```ts
{
  id:             string
  status:         'waiting' | 'ready' | 'battling' | 'finished'
  playerIds:      string[]   // up to 2 player IDs as strings
  readyPlayerIds: string[]   // player IDs that clicked ready
  createdAt:      Date
}
```

### Team

```ts
{
  id:         string
  lobbyId:    string
  playerId:   string
  pokemonIds: number[]   // exactly 3 catalog IDs
}
```

### Battle

```ts
{
  id:                string
  lobbyId:           string
  startedAt:         Date
  winnerId:          string | undefined   // undefined while battle in progress
  nextToActPlayerId: string | undefined   // undefined before battle starts
}
```

### PokemonState

```ts
{
  id:        string
  battleId:  string
  pokemonId: number    // catalog ID (not a MongoDB ref — external API ID)
  playerId:  string
  currentHp: number
  defeated:  boolean
  name:      string    // Pokémon name — populated from catalog at battle start
  sprite:    string    // sprite URL (animated GIF) — populated from catalog at battle start
  type:      string[]  // e.g. ['Fire', 'Flying'] — populated from catalog at battle start
}
```

> Because `name`, `sprite`, and `type` are persisted in MongoDB at battle start, the frontend receives them directly in `battle_start.pokemonStates` and in subsequent queries — no extra catalog API calls needed during battle.

### Catalog Pokémon (External API, not MongoDB)

Fetched by the backend from `https://pokemon-api-92034153384.us-central1.run.app/list/:id`. The backend's Anti-Corruption Layer (PokeAPIAdapter) normalizes and caches these. The frontend may need to fetch them for displaying names, sprites, and stats.

```ts
// GET /list — list item
{
  id:   number
  name: string
}

// GET /list/:id — detail
{
  id:      number
  name:    string
  type:    string[]
  hp:      number
  attack:  number
  defense: number
  speed:   number
  sprite:  string   // URL to animated GIF sprite
}
```

---

## 3. Socket.IO Event Payloads (What the Frontend Receives)

These are the exact shapes emitted by the server to all clients in the lobby room.

### Event: `lobby_status`

Emitted after `join_lobby`, `assign_pokemon`, and `ready`.

```ts
// After join_lobby (includes player for the joining client)
{ lobby: Lobby, player: Player }

// After assign_pokemon and ready (player field may be absent)
{ lobby: Lobby }
```

### Event: `battle_start`

Emitted to all clients in the room once both players mark ready and the battle is initialized.

```ts
{
  battle: {
    id:                string
    lobbyId:           string
    winnerId:          null
    nextToActPlayerId: string   // player who attacks first (highest Speed of initial active Pokémon)
  },
  pokemonStates: Array<{
    id:        string
    battleId:  string
    pokemonId: number
    playerId:  string
    currentHp: number    // full HP — use this as maxHp for the HP bar
    defeated:  false
    name:      string    // e.g. 'Charmander'
    sprite:    string    // animated GIF URL
    type:      string[]  // e.g. ['Fire']
  }>
  // pokemonStates has 6 entries: 3 per player, all with defeated: false and full HP
}
```

### Event: `turn_result`

Emitted to all clients in the room after each processed attack.

```ts
{
  battleId:   string
  lobbyId:    string
  attacker: {
    playerId:  string
    pokemonId: number
  }
  defender: {
    playerId:  string
    pokemonId: number   // the Pokémon that received damage (may now be defeated)
    damage:    number   // always >= 1
    previousHp: number
    currentHp:  number  // never below 0
    defeated:   boolean
  }
  nextActivePokemon: {
    playerId:  string
    pokemonId: number | null  // null if defender still has HP (no switch happened)
                              // new pokemonId if the previous active was defeated and a new one enters
                              // null (battleFinished: true) if defender has no Pokémon left
  }
  battleFinished:    boolean
  nextToActPlayerId: string | undefined  // undefined when battleFinished is true
}
```

### Event: `battle_end`

Emitted to all clients when a player has no Pokémon left.

```ts
{
  battleId: string
  lobbyId:  string
  winnerId: string   // the attacking player who delivered the final blow
}
```

### Event: `error`

Emitted on validation, conflict, or server errors.

```ts
{
  code:    string   // e.g. 'ValidationError', 'ConflictError', 'NotFoundError'
  message: string
}
```

---

## 4. Socket.IO Ack Returns

When the client emits with a callback (ack), the server replies:

| Emit | Ack payload on success | Ack payload on error |
|------|------------------------|----------------------|
| `join_lobby` | `{ player: Player, lobby: Lobby }` | `{ error: { code, message } }` |
| `assign_pokemon` | `{ team: Team & { pokemonDetails }, lobby: Lobby }` — use `ack.team` and optionally `ack.lobby` | `{ error: { code, message } }` |
| `ready` | `{ lobby: Lobby }` — use `ack.lobby` for the updated lobby | `{ error: { code, message } }` |
| `attack` | Same shape as `turn_result` event | `{ error: { code, message } }` |

### assign_pokemon ack payload (success)

The server returns an object with `team` and `lobby`. The `team` object has `Team` fields plus `pokemonDetails`:

```ts
{
  team: {
    id:            string
    lobbyId:       string
    playerId:      string
    pokemonIds:    number[]    // exactly 3 catalog IDs
    pokemonDetails: Array<{
      pokemonId: number      // catalog ID (matches one of pokemonIds)
      name:      string     // e.g. "Venusaur"
      sprite:    string     // URL (e.g. animated GIF from PokeAPI)
      type:      string[]   // e.g. ["Grass", "Poison"]
    }>
  },
  lobby: Lobby   // updated lobby; frontend should set store from ack.team and ack.lobby
}
```

### ready ack payload (success)

The server returns an object with a single key `lobby` (not the lobby at top level):

```ts
{ lobby: Lobby }   // frontend must use ack.lobby when updating the store
```

---

## 5. Key Derivations for Frontend State

These are not stored as-is; the frontend must compute them from the state above.

### Active Pokémon per player
The **active Pokémon** for a player is the first entry in their `pokemonIds` (from `Team`) whose matching `PokemonState` has `defeated === false`.

```ts
function getActive(team: Team, states: PokemonState[]): PokemonState | undefined {
  for (const pokemonId of team.pokemonIds) {
    const state = states.find(s => s.playerId === team.playerId && s.pokemonId === pokemonId);
    if (state && !state.defeated) return state;
  }
}
```

### Is it my turn?
```ts
const isMyTurn = battle.nextToActPlayerId === myPlayer.id;
```

### Max HP per Pokémon
`currentHp` is initialized to the catalog `hp` value at battle start. Since it only decreases, the initial `currentHp` from `battle_start.pokemonStates` serves as `maxHp`. Store it separately on `battle_start`.

---

## 6. Notes

- All IDs from the backend are **plain strings** (MongoDB ObjectId serialized to string). Do not treat them as numbers.
- `pokemonId` (in Team and PokemonState) is a **number** — it is the catalog's external integer ID, not a MongoDB ObjectId.
- `nextToActPlayerId` is absent (undefined) in `turn_result` when `battleFinished` is true. Always check `battleFinished` before reading it.
- The backend validates `lobbyId` in the `attack` payload against `socket.data.lobbyId`. It rejects events if they don't match. For `assign_pokemon` and `ready`, no payload IDs are needed (server uses `socket.data`).
