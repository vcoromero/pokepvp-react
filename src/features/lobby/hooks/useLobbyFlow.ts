import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/shared/store'
import { assignPokemon, joinLobby, markReady } from '@/shared/api/socket'
import { mapBackendError } from '@/shared/errors'
import type { AssignPokemonDetail } from '@/shared/types/catalog'

export function useLobbyFlow() {
  const navigate = useNavigate()
  const player = useAppStore((s) => s.player)
  const lobby = useAppStore((s) => s.lobby)
  const team = useAppStore((s) => s.team)
  const battle = useAppStore((s) => s.battle)
  const socketStatus = useAppStore((s) => s.socketStatus)
  const lastError = useAppStore((s) => s.lastError)

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
        useAppStore.getState().setTeam(data)
        setTeamDetails(data.pokemonDetails ?? [])
      }
    })
  }

  const ready = () => {
    setIsMarkingReady(true)
    markReady((err, updatedLobby) => {
      setIsMarkingReady(false)
      if (err) {
        setActionError(mapBackendError(err))
        return
      }
      if (updatedLobby) {
        useAppStore.getState().setLobby(updatedLobby)
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
