import { useEffect } from 'react'
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '@/shared/store'
import { useAutoConnect } from '@/shared/hooks/useAutoConnect'
import { useAudioSync } from '@/shared/audio/useAudioSync'
import { preloadBackgroundForRoute } from '@/shared/utils/preloadBackgroundImages'
import { ConfigScreen } from '@/features/config/components/ConfigScreen'
import { LobbyScreen } from '@/features/lobby/components/LobbyScreen'
import { BattleScreen } from '@/features/battle/components/BattleScreen'

function AppLayout() {
  useAudioSync()
  const { pathname } = useLocation()
  // Preload next screen background so it is cached when user navigates (images are large).
  useEffect(() => {
    if (pathname === '/config' || pathname === '/') preloadBackgroundForRoute('lobby')
    else if (pathname === '/lobby') preloadBackgroundForRoute('battle')
    else if (pathname === '/battle') preloadBackgroundForRoute('lobby')
  }, [pathname])
  return <Outlet />
}

function RequireBackendUrl({ children }: { children: React.ReactNode }) {
  const backendBaseUrl = useAppStore((s) => s.backendBaseUrl)
  useAutoConnect()
  if (!backendBaseUrl) {
    return <Navigate to="/config" replace />
  }
  return <>{children}</>
}

function RootRedirect() {
  const backendBaseUrl = useAppStore((s) => s.backendBaseUrl)
  if (backendBaseUrl) {
    return <Navigate to="/lobby" replace />
  }
  return <Navigate to="/config" replace />
}

function LobbyRoute() {
  return (
    <RequireBackendUrl>
      <LobbyScreen />
    </RequireBackendUrl>
  )
}

function BattleRoute() {
  const battle = useAppStore((s) => s.battle)
  if (!battle) {
    return <Navigate to="/lobby" replace />
  }
  return (
    <RequireBackendUrl>
      <BattleScreen />
    </RequireBackendUrl>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/config" element={<ConfigScreen />} />
      <Route path="/lobby" element={<LobbyRoute />} />
      <Route path="/battle" element={<BattleRoute />} />
    </Route>
  )
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
