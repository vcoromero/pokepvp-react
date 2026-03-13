interface LobbyStatusCardProps {
  playerCount: number
  readyCount: number
}

export function LobbyStatusCard({ playerCount, readyCount }: LobbyStatusCardProps) {
  return (
    <div className="panel-card p-4">
      <h2 className="text-lg font-semibold mb-2">Lobby status</h2>
      <p>Players: {playerCount} / 2</p>
      <p>Ready: {readyCount} / 2</p>
    </div>
  )
}
