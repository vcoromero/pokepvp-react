import type { StateCreator } from 'zustand'
import type { AppStore, SessionSlice } from './types'

export const createSessionSlice: StateCreator<
  AppStore,
  [],
  [],
  SessionSlice
> = (set) => ({
  player: null,
  lobby: null,
  team: null,

  setPlayer: (player) => set({ player }),

  setLobby: (lobby) => set({ lobby }),

  setTeam: (team) => set({ team }),

  setLobbyStatus: (lobby, player) =>
    set({
      lobby,
      ...(player !== undefined && { player }),
    }),

  resetSession: () => set({ player: null, lobby: null, team: null }),
})
