// src/shared/liveTagging/clock/liveClock.logic.js

const now = () => Date.now()

const toClockParts = (ms) => {
  const safeMs = Math.max(0, Number(ms) || 0)
  const totalSeconds = Math.floor(safeMs / 1000)

  return {
    minute: Math.floor(totalSeconds / 60),
    second: totalSeconds % 60,
    ms: safeMs,
  }
}

export const buildInitialClock = ({
  period = 1,
  startMs = 0,
  speed = 1,
} = {}) => ({
  period,
  baseMs: Math.max(0, Number(startMs) || 0),
  startedAt: null,
  pausedAt: null,
  running: false,
  speed,
})

export const getClockMs = (clock) => {
  if (!clock) return 0
  if (!clock.running || !clock.startedAt) return clock.baseMs || 0

  const speed = Number(clock.speed) || 1
  return (clock.baseMs || 0) + (now() - clock.startedAt) * speed
}

export const startClock = (clock) => ({
  ...clock,
  startedAt: now(),
  pausedAt: null,
  running: true,
})

export const pauseClock = (clock) => {
  if (!clock?.running || !clock?.startedAt) return clock

  return {
    ...clock,
    baseMs: getClockMs(clock),
    pausedAt: now(),
    startedAt: null,
    running: false,
  }
}

export const resetClock = ({ period = 1, speed = 1 } = {}) => {
  return buildInitialClock({ period, startMs: 0, speed })
}

export const setClockTime = ({ clock, minute = 0, second = 0 }) => {
  const baseMs = (Number(minute) * 60 + Number(second)) * 1000

  return {
    ...clock,
    baseMs: Math.max(0, baseMs),
    startedAt: clock?.running ? now() : null,
    pausedAt: null,
  }
}

export const setClockSpeed = (clock, speed = 1) => ({
  ...clock,
  baseMs: getClockMs(clock),
  startedAt: clock?.running ? now() : null,
  speed,
})

export const toggleClockSpeed = (clock) => {
  const nextSpeed = Number(clock?.speed) === 2 ? 1 : 2
  return setClockSpeed(clock, nextSpeed)
}

export const getClockSnapshot = (clock) => ({
  period: clock?.period || 1,
  ...toClockParts(getClockMs(clock)),
})

export const formatClock = (clock) => {
  const { minute, second } = getClockSnapshot(clock)
  const mm = String(minute).padStart(2, '0')
  const ss = String(second).padStart(2, '0')

  return `${mm}:${ss}`
}
