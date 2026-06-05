// src/features/liveTagging/hooks/useLiveClockModel.js

import React from 'react'

import {
  buildInitialClock,
  formatClock,
  pauseClock,
  resetClock,
  setClockTime,
  startClock,
  toggleClockSpeed,
} from '../../../shared/liveTagging/index.js'

import {
  buildLiveTaggingHeaderModel,
} from '../logic/index.js'

function useClockTick(running) {
  const [, setTick] = React.useState(0)

  React.useEffect(() => {
    if (!running) return undefined

    const id = setInterval(() => {
      setTick(value => value + 1)
    }, 300)

    return () => clearInterval(id)
  }, [running])
}

export function useLiveClockModel({ ready }) {
  const [clock, setClock] = React.useState(() => buildInitialClock())

  useClockTick(clock?.running && ready)

  const headerModel = buildLiveTaggingHeaderModel({
    clock,
    clockText: formatClock(clock),
  })

  const resetClockForSession = React.useCallback(() => {
    setClock(prev => resetClock({
      period: prev?.period || 1,
      speed: prev?.speed || 1,
    }))
  }, [])

  const handleToggleClock = React.useCallback(() => {
    if (!ready) return

    setClock(prev => (prev?.running ? pauseClock(prev) : startClock(prev)))
  }, [ready])

  const handleResetClock = React.useCallback(() => {
    resetClockForSession()
  }, [resetClockForSession])

  const handleSetClockTime = React.useCallback(({ minute, second }) => {
    if (!ready) return

    setClock(prev => setClockTime({ clock: prev, minute, second }))
  }, [ready])

  const handleToggleSpeed = React.useCallback(() => {
    if (!ready) return

    setClock(prev => toggleClockSpeed(prev))
  }, [ready])

  return {
    clock,
    setClock,
    headerModel,

    resetClockForSession,

    handleToggleClock,
    handleResetClock,
    handleSetClockTime,
    handleToggleSpeed,
  }
}
