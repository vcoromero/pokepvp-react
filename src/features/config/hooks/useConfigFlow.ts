import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConnectionService } from '@/app/services-context'
import { useAppStore } from '@/shared/store'

export function useConfigFlow() {
  const navigate = useNavigate()
  const connection = useConnectionService()
  const backendBaseUrl = useAppStore((s) => s.backendBaseUrl)

  const [inputUrl, setInputUrl] = useState(backendBaseUrl ?? '')
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [testSuccess, setTestSuccess] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const canSubmit = inputUrl.trim().length > 0

  const save = () => {
    const result = connection.setBackendUrlAndConnect(inputUrl.trim())
    if (!result.success) {
      setTestMessage(result.error ?? 'Invalid URL')
      setTestSuccess(false)
      return
    }
    setTestMessage(null)
    navigate('/lobby')
  }

  const testConnection = async () => {
    setIsTesting(true)
    setTestMessage(null)
    try {
      const result = await connection.testConnection(inputUrl.trim())
      setTestMessage(result.message)
      setTestSuccess(result.success)
    } finally {
      setIsTesting(false)
    }
  }

  return {
    inputUrl,
    setInputUrl,
    testMessage,
    testSuccess,
    isTesting,
    canSubmit,
    save,
    testConnection,
  }
}
