import { Howl } from 'howler'
import { CONSTANTS } from '@/shared/constants'
import { TRACK_URLS, SFX_URLS } from './tracks'

type MusicTrack = keyof typeof TRACK_URLS

const DEFAULT_VOLUME = 0.4

function loadMuted(): boolean {
  try {
    return localStorage.getItem(CONSTANTS.MUSIC_MUTED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

let lobbyHowl: Howl | null = null
let battleHowl: Howl | null = null
let victoryHowl: Howl | null = null
let defeatHowl: Howl | null = null
let attackHowl: Howl | null = null
let faintHowl: Howl | null = null

const SFX_VOLUME = 0.90

let musicMuted = loadMuted()
let musicVolume = DEFAULT_VOLUME

function getHowl(track: MusicTrack): Howl {
  const url = TRACK_URLS[track]
  const isLoop = track === 'lobby' || track === 'battle'
  const howl = new Howl({ src: [url], loop: isLoop, volume: musicVolume })
  if (track === 'lobby') lobbyHowl = howl
  else if (track === 'battle') battleHowl = howl
  else if (track === 'victory') victoryHowl = howl
  else defeatHowl = howl
  return howl
}

function stopAll(): void {
  lobbyHowl?.stop()
  battleHowl?.stop()
  victoryHowl?.stop()
  defeatHowl?.stop()
}

export const audioPlayer = {
  playLobby(): void {
    const h = lobbyHowl ?? getHowl('lobby')
    if (h.playing()) return // already playing, avoid restart on store updates
    stopAll()
    h.volume(musicMuted ? 0 : musicVolume)
    h.play()
  },

  playBattle(): void {
    const h = battleHowl ?? getHowl('battle')
    if (h.playing()) return // already playing, avoid restart on store updates
    stopAll()
    h.volume(musicMuted ? 0 : musicVolume)
    h.play()
  },

  playVictory(): void {
    stopAll()
    const h = victoryHowl ?? getHowl('victory')
    h.volume(musicMuted ? 0 : musicVolume)
    h.play()
  },

  playDefeat(): void {
    stopAll()
    const h = defeatHowl ?? getHowl('defeat')
    h.volume(musicMuted ? 0 : musicVolume)
    h.play()
  },

  stopAll(): void {
    stopAll()
  },

  playAttackSfx(): void {
    if (musicMuted) return
    const h = attackHowl ?? (attackHowl = new Howl({ src: [SFX_URLS.attack], volume: SFX_VOLUME }))
    h.volume(musicMuted ? 0 : SFX_VOLUME)
    h.play()
  },

  playFaintSfx(): void {
    if (musicMuted) return
    const h = faintHowl ?? (faintHowl = new Howl({ src: [SFX_URLS.faint], volume: SFX_VOLUME }))
    h.volume(musicMuted ? 0 : SFX_VOLUME)
    h.play()
  },

  setMusicVolume(volume: number): void {
    musicVolume = Math.max(0, Math.min(1, volume))
    if (!musicMuted) {
      lobbyHowl?.volume(musicVolume)
      battleHowl?.volume(musicVolume)
      victoryHowl?.volume(musicVolume)
      defeatHowl?.volume(musicVolume)
    }
  },

  setMuted(muted: boolean): void {
    musicMuted = muted
    try {
      localStorage.setItem(CONSTANTS.MUSIC_MUTED_STORAGE_KEY, String(muted))
    } catch {
      // ignore
    }
    const v = muted ? 0 : musicVolume
    lobbyHowl?.volume(v)
    battleHowl?.volume(v)
    victoryHowl?.volume(v)
    defeatHowl?.volume(v)
  },

  isMuted(): boolean {
    return musicMuted
  },
}
