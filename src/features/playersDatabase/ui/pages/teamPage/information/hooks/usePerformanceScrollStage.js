// src/features/playersDatabase/ui/pages/teamPage/information/hooks/usePerformanceScrollStage.js

import { useLayoutEffect, useState } from 'react'

export default function usePerformanceScrollStage({
  enabled,
  resetKey,
  scrollRef,
  headerRef,
  kpiRef,
  metricsRef,
}) {
  const [stage, setStage] = useState(0)

  useLayoutEffect(() => {
    setStage(0)
    const root = scrollRef?.current
    if (!enabled || !root) return undefined
    let frame = null
    const measure = () => {
      frame = null
      const boundary = headerRef.current?.getBoundingClientRect().bottom
      if (boundary === undefined) return
      const passed = ref => Boolean(ref.current && ref.current.getBoundingClientRect().bottom <= boundary)
      setStage(passed(kpiRef) ? passed(metricsRef) ? 2 : 1 : 0)
    }
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure)
    }
    // The floating rows sit outside layout; their height never changes these thresholds.
    const observer = new ResizeObserver(schedule)
    ;[root, headerRef.current, kpiRef.current, metricsRef.current].filter(Boolean)
      .forEach(element => observer.observe(element))
    root.addEventListener('scroll', schedule, { passive: true })
    root.addEventListener('animationend', schedule)
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      observer.disconnect()
      root.removeEventListener('scroll', schedule)
      root.removeEventListener('animationend', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [enabled, resetKey, scrollRef, headerRef, kpiRef, metricsRef])

  return enabled ? stage : 0
}
