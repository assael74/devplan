// src/features/playersDatabase/ui/pages/teamPage/information/hooks/useMovementScrollEntries.js
import { useLayoutEffect, useState } from 'react'

export default function useMovementScrollEntries({
  enabled,
  resetKey,
  scrollRef,
  headerRef,
  movementRef,
}) {
  const [entries, setEntries] = useState([])

  useLayoutEffect(() => {
    setEntries([])
    const root = scrollRef?.current
    const movement = movementRef.current
    if (!enabled || !root || !movement) return undefined

    let frame = null
    const anchors = [...movement.querySelectorAll('[data-movement-toolbar-entry]')]
    const measure = () => {
      frame = null
      const boundary = headerRef.current?.getBoundingClientRect().bottom
      if (boundary === undefined) return
      const next = anchors
        .filter(anchor => anchor.getBoundingClientRect().bottom <= boundary)
        .map(anchor => anchor.getAttribute('data-movement-toolbar-entry'))
      setEntries(current => current.length === next.length &&
        current.every((entry, index) => entry === next[index]) ? current : next)
    }
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    ;[root, headerRef.current, movement, ...anchors].filter(Boolean)
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
  }, [enabled, resetKey, scrollRef, headerRef, movementRef])

  return enabled ? entries : []
}
