/** Lobby shape returned by backend. */
export interface Lobby {
  id: string
  status: 'waiting' | 'ready' | 'battling' | 'finished'
  playerIds: string[]
  readyPlayerIds: string[]
  createdAt: string
}
