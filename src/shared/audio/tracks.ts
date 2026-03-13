/**
 * Sound track URLs for Howler. Lobby/config share the same track.
 * Imported as static URLs so Vite bundles and resolves them.
 */
import lobbyUrl from '@/shared/assets/sounds/lobby.mp3'
import battleUrl from '@/shared/assets/sounds/battle.mp3'
import victoryUrl from '@/shared/assets/sounds/victory.mp3'
import defeatUrl from '@/shared/assets/sounds/defeat.mp3'
import attackUrl from '@/shared/assets/sounds/attack.mp3'
import faintUrl from '@/shared/assets/sounds/faint.mp3'

export const TRACK_URLS = {
  /** Used for both config and lobby screens. */
  lobby: lobbyUrl,
  battle: battleUrl,
  victory: victoryUrl,
  defeat: defeatUrl,
} as const

export const SFX_URLS = {
  attack: attackUrl,
  faint: faintUrl,
} as const
