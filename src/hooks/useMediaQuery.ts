import { useSyncExternalStore } from 'react'

const queryLists = new Map<string, MediaQueryList>()
const subscriptions = new Map<string, (onChange: () => void) => () => void>()

function getQueryList(query: string): MediaQueryList {
  const cached = queryLists.get(query)
  if (cached) return cached
  const list = window.matchMedia(query)
  queryLists.set(query, list)
  return list
}

function getSubscription(query: string): (onChange: () => void) => () => void {
  const cached = subscriptions.get(query)
  if (cached) return cached
  const subscribe = (onChange: () => void) => {
    const list = getQueryList(query)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }
  subscriptions.set(query, subscribe)
  return subscribe
}

export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    getSubscription(query),
    () => getQueryList(query).matches,
    () => fallback,
  )
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
