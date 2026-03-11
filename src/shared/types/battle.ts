/** Battle shape returned by backend. */
export interface Battle {
  id: string
  lobbyId: string
  startedAt: string
  winnerId: string | undefined
  /** Player who attacks next; may be null/undefined if backend has not set it yet. */
  nextToActPlayerId: string | null | undefined
}
