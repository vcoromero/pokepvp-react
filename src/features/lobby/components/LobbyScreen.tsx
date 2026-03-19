import { useLobbyFlow } from '../hooks/useLobbyFlow'
import { useConnectionService } from '@/app/services-hooks'
import { LobbyHeader } from './LobbyHeader'
import { LobbyAlerts } from "./LobbyAlerts";
import { NicknameForm } from "./NicknameForm";
import { LobbyStatusCard } from "./LobbyStatusCard";
import { TeamGrid } from "./TeamGrid";
import { ReadySection } from "./ReadySection";
import lobbyImage from '@/shared/assets/images/lobby.png'
import { BackgroundImage } from '@/shared/ui/BackgroundImage'

export function LobbyScreen() {
  const {
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
  } = useLobbyFlow()

  const connectionService = useConnectionService()
  const handleRetry = () => {
    connectionService.reconnect()
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center relative">
      <div className="absolute inset-0 z-0">
        <BackgroundImage src={lobbyImage} />
      </div>

      <div className="relative z-10 w-full min-h-screen p-4 flex flex-col items-center">
      <LobbyHeader />
      <LobbyAlerts
        socketStatus={socketStatus}
        lastError={lastError}
        actionError={actionError}
        onRetry={handleRetry}
      />

      {!player ? (
        <div className="w-full max-w-sm panel-overlay p-6">
          <NicknameForm
            value={nickname}
            onChange={setNickname}
            onSubmit={join}
            isSubmitting={isJoining}
            disabled={!isConnected}
          />
        </div>
      ) : (
        <div className="w-full max-w-lg space-y-6">
          <p className="inline-block px-3 py-1.5 rounded-lg bg-slate-900/75 text-white text-sm drop-shadow-sm">
            Joined as <strong>{player.nickname}</strong>
            <span className="ml-2 text-slate-300 text-xs">
              (ID: …{player.id.slice(-6)})
            </span>
          </p>

          <LobbyStatusCard playerCount={playerCount} readyCount={readyCount} />

          {!team ? (
            <button
              type="button"
              onClick={getTeam}
              disabled={isGettingTeam || !isConnected}
              className="btn-base w-full py-2 px-4 bg-slate-600 text-white font-medium hover:bg-slate-500"
            >
              {isGettingTeam ? "Getting team…" : "Get team"}
            </button>
          ) : (
            <>
              <TeamGrid teamDetails={teamDetails} team={team} />
              <ReadySection
                onReady={ready}
                isMarkingReady={isMarkingReady}
                isReady={isReady}
                disabled={!isConnected}
                showWaiting={isReady && !bothReady}
              />
            </>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
