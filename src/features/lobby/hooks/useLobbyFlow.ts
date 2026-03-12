import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { shallow } from 'zustand/shallow'
import { useAppStore } from '@/shared/store'
import { assignPokemon, joinLobby, markReady } from '@/shared/api/socket'
import { mapBackendError } from '@/shared/errors'
import type {
  AssignPokemonAckData,
  AssignPokemonAckWrapped,
  Lobby,
} from '@/shared/types'
import type { AssignPokemonDetail } from '@/shared/types/catalog'

export function useLobbyFlow() {
  const navigate = useNavigate()
  const {
    player,
    lobby,
    team,
    battle,
    socketStatus,
    lastError,
  } = useAppStore(
    (s) => ({
      player: s.player,
      lobby: s.lobby,
      team: s.team,
      battle: s.battle,
      socketStatus: s.socketStatus,
      lastError: s.lastError,
    }),
    shallow,
  )

  const [nickname, setNickname] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isGettingTeam, setIsGettingTeam] = useState(false)
  const [isMarkingReady, setIsMarkingReady] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [teamDetails, setTeamDetails] = useState<AssignPokemonDetail[]>([])

  useEffect(() => {
    if (battle) {
      navigate('/battle', { replace: true })
    }
  }, [battle, navigate])

  const join = () => {
    const name = nickname.trim()
    if (!name) return
    setActionError(null)
    setIsJoining(true)
    joinLobby(name, (err, data) => {
      setIsJoining(false)
      if (err) {
        setActionError(mapBackendError(err))
        return
      }
      if (data) {
        useAppStore.getState().setLobbyStatus(data.lobby, data.player)
      }
    })
  }

  const getTeam = () => {
    setIsGettingTeam(true)
    assignPokemon((err, data) => {
      setIsGettingTeam(false)
      if (err) {
        setActionError(mapBackendError(err))
        return
      }
      if (data) {
        // Backend ack is { team, lobby } (see socketio-test-flow.md); use .team for store and sync lobby
        const wrapped = data as AssignPokemonAckData | AssignPokemonAckWrapped
        const teamPayload: AssignPokemonAckData | undefined =
          'team' in wrapped ? wrapped.team : wrapped
        const lobbyPayload = 'team' in wrapped ? wrapped.lobby : undefined
        if (teamPayload) {
          useAppStore.getState().setTeam(teamPayload)
          setTeamDetails(teamPayload.pokemonDetails ?? [])
        }
        if (lobbyPayload) {
          useAppStore.getState().setLobby(lobbyPayload)
        }
      }
    })
  }

  const ready = () => {
    setIsMarkingReady(true)
    markReady((err, ackData) => {
      setIsMarkingReady(false)
      if (err) {
        setActionError(mapBackendError(err))
        return
      }
      // Backend ack is { lobby: Lobby } (see socketio-test-flow.md); use inner lobby so store has correct shape
      const lobby: Lobby | null | undefined =
        ackData && typeof ackData === 'object' && 'lobby' in ackData
          ? (ackData as { lobby: Lobby }).lobby
          : (ackData as Lobby | undefined) ?? null
      if (lobby) {
        useAppStore.getState().setLobby(lobby)
      }
    })
  }

  const isConnected = socketStatus === 'connected'
  const isReady = !!(player && lobby?.readyPlayerIds.includes(player.id))
  const bothReady = !!(lobby && lobby.readyPlayerIds.length >= 2)
  const playerCount = lobby?.playerIds.length ?? 0
  const readyCount = lobby?.readyPlayerIds.length ?? 0

  return {
    player,
    team,
    socketStatus,
    lastError,
    nickname,
    setNickname,
    isJoining,
    isGettingTeam,
    isMarkingReady,
    actionError,
    teamDetails,
    isConnected,
    isReady,
    bothReady,
    playerCount,
    readyCount,
    join,
    getTeam,
    ready,
  }
}
