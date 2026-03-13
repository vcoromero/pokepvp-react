import { useConfigFlow } from '../hooks/useConfigFlow'
import { ConfigHeader } from './ConfigHeader'
import { BackendUrlInput } from './BackendUrlInput'
import { ConfigMessage } from './ConfigMessage'
import { ConfigActions } from './ConfigActions'
import hostBackendImage from '@/shared/assets/images/host-backend.png'

export function ConfigScreen() {
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
      {/* Full-screen config/backend background */}
      <div className="absolute inset-0 z-0 bg-slate-900" aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${hostBackendImage})` }}
        />
        <div className="absolute inset-0 bg-slate-900/55" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-xl bg-slate-900/85 backdrop-blur-sm p-6 shadow-xl">
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
        </div>
      </div>
    </div>
  )
}
