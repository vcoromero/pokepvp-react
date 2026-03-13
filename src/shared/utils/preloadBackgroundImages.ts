/**
 * Preloads the background image for a given route so it is cached when the user navigates.
 * Call with the "next" likely route to spread loading and avoid slow first paint on transition.
 */
import hostBackendImage from '@/shared/assets/images/host-backend.png'
import lobbyImage from '@/shared/assets/images/lobby.png'
import stadiumImage from '@/shared/assets/images/stadium.png'

const ROUTE_IMAGES: Record<'config' | 'lobby' | 'battle', string> = {
  config: hostBackendImage,
  lobby: lobbyImage,
  battle: stadiumImage,
}

const preloaded = new Set<string>()

export function preloadBackgroundForRoute(route: 'config' | 'lobby' | 'battle'): void {
  const url = ROUTE_IMAGES[route]
  if (!url || preloaded.has(url)) return
  preloaded.add(url)
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = url
  document.head.appendChild(link)
}
