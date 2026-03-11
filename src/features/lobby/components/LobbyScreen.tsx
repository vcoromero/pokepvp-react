import { useLobbyFlow } from "../hooks/useLobbyFlow";
import { LobbyHeader } from "./LobbyHeader";
import { LobbyAlerts } from "./LobbyAlerts";
import { NicknameForm } from "./NicknameForm";
import { LobbyStatusCard } from "./LobbyStatusCard";
import { TeamGrid } from "./TeamGrid";
import { ReadySection } from "./ReadySection";

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
  } = useLobbyFlow();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center">
      <LobbyHeader />
      <LobbyAlerts
        socketStatus={socketStatus}
        lastError={lastError}
        actionError={actionError}
      />

      {!player ? (
        <NicknameForm
          value={nickname}
          onChange={setNickname}
          onSubmit={join}
          isSubmitting={isJoining}
          disabled={!isConnected}
        />
      ) : (
        <div className="w-full max-w-lg space-y-6">
          <p className="text-slate-400">
            Joined as <strong className="text-white">{player.nickname}</strong>
            <span className="ml-2 text-slate-500 text-xs">
              (ID: …{player.id.slice(-6)})
            </span>
          </p>

          <LobbyStatusCard playerCount={playerCount} readyCount={readyCount} />

          {!team ? (
            <button
              type="button"
              onClick={getTeam}
              disabled={isGettingTeam || !isConnected}
              className="w-full py-2 px-4 rounded-lg bg-slate-600 text-white font-medium hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
