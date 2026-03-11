import { create } from 'zustand'
import type { AppStore } from './types'
import { createConnectionSlice } from './connection'
import { createSessionSlice } from './session'
import { createBattleSlice } from './battle'

export const useAppStore = create<AppStore>()((...a) => ({
  ...createConnectionSlice(...a),
  ...createSessionSlice(...a),
  ...createBattleSlice(...a),
}))

/** Derived: true when it is the current player's turn to attack. */
export const selectIsMyTurn = (s: AppStore): boolean =>
  s.battle?.nextToActPlayerId != null &&
  s.battle.nextToActPlayerId === s.player?.id

export { createConnectionSlice, createSessionSlice, createBattleSlice }
export type {
  AppStore,
  ConnectionSlice,
  SessionSlice,
  BattleSlice,
  SocketStatus,
} from './types'
