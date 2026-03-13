import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '@/shared/store'
import { audioPlayer } from './player'

/**
 * Syncs music with route and battle state. Call from a component that is
 * rendered inside the router (so useLocation works).
 * - Config / Lobby: play lobby music.
 * - Battle (no winner): play battle music.
 * - Battle (winner set): play victory or defeat once.
 * - On turn_result: play attack SFX; if defender defeated, play faint SFX.
 */
export function useAudioSync(): void {
  const location = useLocation()
  const pathname = location.pathname
  const battle = useAppStore((s) => s.battle)
  const player = useAppStore((s) => s.player)
  const lastTurnResult = useAppStore((s) => s.lastTurnResult)

  const prevWinnerId = useRef<string | undefined>(undefined)
  const prevTurnResultId = useRef<string | null>(null)

  // Music by route and battle state. Only re-run when pathname or winner changes,
  // so lobby/battle music does not restart on every store update (e.g. Join, Attack).
  const winnerId = battle?.winnerId ?? null
  useEffect(() => {
    const isLobbyOrConfig = pathname === '/config' || pathname === '/lobby' || pathname === '/'
    const isBattle = pathname === '/battle'

    if (isLobbyOrConfig) {
      audioPlayer.playLobby()
      return
    }

    if (!isBattle) {
      audioPlayer.stopAll()
      return
    }

    if (winnerId) {
      const alreadyPlayed = prevWinnerId.current === winnerId
      prevWinnerId.current = winnerId
      if (!alreadyPlayed) {
        const isWinner = player?.id === winnerId
        if (isWinner) audioPlayer.playVictory()
        else audioPlayer.playDefeat()
      }
      return
    }

    prevWinnerId.current = undefined
    if (battle) {
      audioPlayer.playBattle()
    }
  }, [pathname, winnerId])

  // SFX on turn_result: attack always; faint when defender defeated
  useEffect(() => {
    if (!lastTurnResult) return
    const id = `${lastTurnResult.battleId}-${lastTurnResult.defender.currentHp}-${lastTurnResult.defender.defeated}`
    if (prevTurnResultId.current === id) return
    prevTurnResultId.current = id

    audioPlayer.playAttackSfx()
    if (lastTurnResult.defender.defeated) {
      audioPlayer.playFaintSfx()
    }
  }, [lastTurnResult])
}
