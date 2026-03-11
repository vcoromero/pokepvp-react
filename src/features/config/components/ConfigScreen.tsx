import { useConfigFlow } from '../hooks/useConfigFlow'
import { ConfigHeader } from './ConfigHeader'
import { BackendUrlInput } from './BackendUrlInput'
import { ConfigMessage } from './ConfigMessage'
import { ConfigActions } from './ConfigActions'

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md space-y-6">
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
  )
}
