/** Player shape returned by backend (MongoDB _id as string). */
export interface Player {
  id: string
  nickname: string
  lobbyId: string | undefined
}
