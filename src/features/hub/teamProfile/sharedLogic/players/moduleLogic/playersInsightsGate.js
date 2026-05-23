// teamProfile/sharedLogic/players/moduleLogic/playersInsightsGate.js

export const scheduleIdle = callback => {
  if (typeof window === 'undefined') return null

  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout: 700 })
  }

  return window.setTimeout(callback, 120)
}

export const cancelIdle = handle => {
  if (!handle || typeof window === 'undefined') return

  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle)
    return
  }

  window.clearTimeout(handle)
}
