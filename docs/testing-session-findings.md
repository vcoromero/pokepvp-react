# Testing & Session Findings

This document records issues observed when testing the PokePVP frontend with multiple players (multiple browser tabs or windows). It helps distinguish frontend responsibilities from likely backend/session behaviour.

---

## 1. Same nickname in both tabs (two normal tabs)

**Observation:** When opening two normal tabs to the same lobby (same browser, same session), both tabs showed the same nickname (e.g. "Joined as samy") after joining.

**Likely cause:** Both tabs share the same session/cookies, so the backend sees a single client. The same `player.id` and nickname are used in both tabs.

**Frontend mitigation:** Show a short player ID suffix in the lobby (e.g. `ID: …xxxxxx`) so testers can confirm whether both tabs are the same player. Recommend using different nicknames and an incognito window (or another browser) for the second player.

---

## 2. Ready button not disabling after press

**Observation:** After pressing "Ready", the button stayed active; it did not reflect the ready state until the next `lobby_status` from the server.

**Cause:** The UI depended only on `lobby_status` to update `readyPlayerIds`. There was no update from the `markReady` ack.

**Fix (frontend):** On successful `markReady` ack, the frontend now calls `setLobby(updatedLobby)` with the lobby returned by the server, so the button disables immediately without waiting for `lobby_status`.

---

## 3. Pokémon shown incorrectly (same team on both sides)

**Observation:** In battle, sometimes "You" and "Opponent" showed the same Pokémon (e.g. same bench on both sides).

**Likely cause:** When using two normal tabs with the same session, the backend effectively has a single player. `opponentPlayerId` is derived as "the other player in the lobby"; if there is no other player, or the same player is treated as both sides, `opponentPlayerId` can equal `player.id`, so both sides render the same team.

**Frontend mitigation:** Detect when `opponentPlayerId === player.id` and show a warning banner: "Same player detected on both sides... For 2-player testing, use an incognito window or another browser for the second player." Recommend testing with one normal window and one incognito (or two browsers) so the backend sees two distinct sessions.

---

## 4. Incognito tab overwriting the non-incognito user

**Observation:** Even when using one normal tab and one incognito tab, the user from the **non-incognito** tab was overwritten. After the incognito tab joined (e.g. with a different nickname), the normal tab no longer showed its original user (e.g. "vico"); the normal tab’s session/user was replaced or both ended up showing the same joined user.

**Implications:**

- This suggests the backend may not be treating "normal" and "incognito" as two independent sessions per lobby, or it may be keying sessions/lobby membership by something that gets reused (e.g. same lobby ID with a single "current player" slot, or IP-based association that overwrites the first join when the second joins from the same machine).
- From the frontend’s perspective, the two tabs have separate Socket.IO connections and separate in-memory stores; the overwrite is likely due to backend behaviour (e.g. replacing the first player when a second connection joins the same lobby, or a single session store per lobby).

**Recommendation:** Document this in the backend repo: when two distinct clients (e.g. normal + incognito) join the same lobby, both should be kept as separate players; the first joined user should not be replaced by the second. Frontend can only show what the backend sends in `lobby_status`, `battle_start`, and socket acks.

---

## 5. Example `battle_start` event payload (from testing)

Below is a representative `battle_start` payload as received during multi-tab testing. It matches the contract in [backend-data-contracts.md](backend-data-contracts.md). The frontend uses `battle.nextToActPlayerId` to know whose turn it is; `pokemonStates` carries one entry per Pokémon (6 total), with `playerId` indicating owner.

**Player 1** (`69b1e7f8203696e413a9f7ee`): Charizard, Charmeleon, Ivysaur  
**Player 2** (`69b1e821203696e413a9f7f8`): Raichu, Wartortle, Squirtle  
**First to act:** `nextToActPlayerId` = Player 2 (`69b1e821203696e413a9f7f8`).

```json
{
  "battle": {
    "id": "69b1e838203696e413a9f805",
    "lobbyId": "69b1e7f8203696e413a9f7ec",
    "startedAt": "2026-03-11T22:10:00.822Z",
    "nextToActPlayerId": "69b1e821203696e413a9f7f8"
  },
  "pokemonStates": [
    {
      "id": "69b1e838203696e413a9f807",
      "battleId": "69b1e838203696e413a9f805",
      "pokemonId": 6,
      "playerId": "69b1e7f8203696e413a9f7ee",
      "currentHp": 78,
      "defeated": false,
      "name": "Charizard",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/6.gif",
      "type": ["Fire", "Flying"]
    },
    {
      "id": "69b1e838203696e413a9f809",
      "battleId": "69b1e838203696e413a9f805",
      "pokemonId": 5,
      "playerId": "69b1e7f8203696e413a9f7ee",
      "currentHp": 58,
      "defeated": false,
      "name": "Charmeleon",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/5.gif",
      "type": ["Fire"]
    },
    {
      "id": "69b1e838203696e413a9f80b",
      "battleId": "69b1e838203696e413a9f805",
      "pokemonId": 2,
      "playerId": "69b1e7f8203696e413a9f7ee",
      "currentHp": 60,
      "defeated": false,
      "name": "Ivysaur",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/2.gif",
      "type": ["Grass", "Poison"]
    },
    {
      "id": "69b1e838203696e413a9f80d",
      "battleId": "69b1e838203696e413a9f805",
      "pokemonId": 26,
      "playerId": "69b1e821203696e413a9f7f8",
      "currentHp": 60,
      "defeated": false,
      "name": "Raichu",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/26.gif",
      "type": ["Electric"]
    },
    {
      "id": "69b1e838203696e413a9f80f",
      "battleId": "69b1e838203696e413a9f805",
      "pokemonId": 8,
      "playerId": "69b1e821203696e413a9f7f8",
      "currentHp": 59,
      "defeated": false,
      "name": "Wartortle",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/8.gif",
      "type": ["Water"]
    },
    {
      "id": "69b1e838203696e413a9f811",
      "battleId": "69b1e838203696e413a9f805",
      "pokemonId": 7,
      "playerId": "69b1e821203696e413a9f7f8",
      "currentHp": 44,
      "defeated": false,
      "name": "Squirtle",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/7.gif",
      "type": ["Water"]
    }
  ]
}
```

Notes:

- `nextToActPlayerId` must be present for the frontend to enable the Attack button for the correct player; if the backend sends `null`/absent, the UI shows "Waiting for turn order from server...".
- Each client uses `player.id` (from session) to split `pokemonStates` into "my team" vs "opponent"; if both tabs share the same `player.id`, both will show the same team on both sides (see finding #3).

---

## Summary table

| # | Issue | Likely layer | Status |
|---|--------|----------------|--------|
| 1 | Same nickname in both tabs (normal tabs) | Shared session (expected with same browser) | Documented; UI hints + testing tips added |
| 2 | Ready button not disabling | Frontend (no ack update) | Fixed: store updated from `markReady` ack |
| 3 | Same Pokémon on both battle sides | Same session → one player in backend | Documented; warning banner when `opponentPlayerId === player.id` |
| 4 | Incognito join overwrites non-incognito user | Backend / session design | Documented; needs backend fix so two clients = two players |

---

*Last updated: 2025-03 (from multi-tab / incognito testing).*
