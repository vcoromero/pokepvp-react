import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/shared/store'
import { useLobbyService } from '@/app/services-hooks'
import { areBothReady, getPlayerCount, getReadyCount, isPlayerReady } from '@/domain/lobby'
import type { AssignPokemonDetail } from '@/shared/types/catalog'

export function useLobbyFlow() {
  const navigate = useNavigate()
  const lobbyService = useLobbyService()
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

  const join = async () => {
    const name = nickname.trim()
    if (!name) return
    setActionError(null)
    setIsJoining(true)
    const result = await lobbyService.join(name)
    setIsJoining(false)
    if (result.error) {
      setActionError(result.error)
      return
    }
  }

  const getTeam = async () => {
    setIsGettingTeam(true)
    const result = await lobbyService.assignTeam()
    setIsGettingTeam(false)
    if (result.error) {
      setActionError(result.error)
      return
    }
    if (result.teamDetails) {
      setTeamDetails(result.teamDetails)
    }
  }

  const ready = async () => {
    setIsMarkingReady(true)
    const result = await lobbyService.markReady()
    setIsMarkingReady(false)
    if (result.error) {
      setActionError(result.error)
      return
    }
  }

  const isConnected = socketStatus === 'connected'
  const isReady = isPlayerReady(lobby, player?.id ?? null)
  const bothReady = areBothReady(lobby)
  const playerCount = getPlayerCount(lobby)
  const readyCount = getReadyCount(lobby)

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
