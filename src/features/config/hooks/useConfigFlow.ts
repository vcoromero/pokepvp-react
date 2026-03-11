import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/shared/store'
import { checkHealth } from '@/shared/api/http'
import { connect } from '@/shared/api/socket'
import { normalizeBaseUrl } from '@/shared/utils/url'

export function useConfigFlow() {
  const navigate = useNavigate()
  const backendBaseUrl = useAppStore((s) => s.backendBaseUrl)
  const setBackendUrl = useAppStore((s) => s.setBackendUrl)

  const [inputUrl, setInputUrl] = useState(backendBaseUrl ?? '')
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [testSuccess, setTestSuccess] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const canSubmit = inputUrl.trim().length > 0

  const save = () => {
    const url = normalizeBaseUrl(inputUrl)
    if (!url) return
    setBackendUrl(url)
    setTestMessage(null)
    connect(url)
    navigate('/lobby')
  }

  const testConnection = async () => {
    const url = normalizeBaseUrl(inputUrl)
    if (!url) {
      setTestMessage('Enter a URL first.')
      setTestSuccess(false)
      return
    }
    setIsTesting(true)
    setTestMessage(null)
    try {
      const result = await checkHealth(url)
      if (result?.ok) {
        setTestMessage('Connection OK')
        setTestSuccess(true)
      } else {
        setTestMessage(result ? `HTTP ${result.status}` : 'Connection failed')
        setTestSuccess(false)
      }
    } catch {
      setTestMessage('Connection failed')
      setTestSuccess(false)
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
