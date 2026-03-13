import { useState } from 'react'
import { useConfigFlow } from '../hooks/useConfigFlow'
import { ConfigHeader } from './ConfigHeader'
import { BackendUrlInput } from './BackendUrlInput'
import { ConfigMessage } from './ConfigMessage'
import { ConfigActions } from './ConfigActions'
import { audioPlayer } from '@/shared/audio'
import hostBackendImage from '@/shared/assets/images/host-backend.png'
import { BackgroundImage } from '@/shared/ui/BackgroundImage'

export function ConfigScreen() {
  const [muted, setMuted] = useState(() => audioPlayer.isMuted())
  const {
    inputUrl,
    setInputUrl,
    testMessage,
    testSuccess,
    isTesting,
    canSubmit,
    save,
    testConnection,
  } = useConfigFlow()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 relative">
      <div className="absolute inset-0 z-0">
        <BackgroundImage src={hostBackendImage} />
      </div>

      <div className="relative z-10 w-full max-w-md panel-overlay p-6">
        <div className="space-y-6">
          <ConfigHeader />
          <BackendUrlInput value={inputUrl} onChange={setInputUrl} />
          {testMessage && (
            <ConfigMessage message={testMessage} success={testSuccess} />
          )}
          <ConfigActions
            isTesting={isTesting}
            canTest={canSubmit}
            canSave={canSubmit}
            onTest={testConnection}
            onSave={save}
          />
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={muted}
              onChange={() => {
                const next = !muted
                audioPlayer.setMuted(next)
                setMuted(next)
              }}
              className="rounded border-slate-500 bg-slate-800 text-amber-500 focus:ring-amber-500"
            />
            Mute music
          </label>
        </div>
      </div>
    </div>
  )
}
