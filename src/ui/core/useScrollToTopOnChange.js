// src/ui/core/useScrollToTopOnChange.js

import { useLayoutEffect, useRef } from 'react'

/**
 * Returns a scroll container to its top when a meaningful view key changes.
 * The initial value is intentionally ignored, so opening a page preserves its normal
 * initial scroll position.
 */
export default function useScrollToTopOnChange(
  containerRef,
  changeKey,
  {
    behavior = 'smooth',
    enabled = true,
  } = {}
) {
  const previousKeyRef = useRef(changeKey)

  useLayoutEffect(() => {
    const previousKey = previousKeyRef.current
    previousKeyRef.current = changeKey

    if (!enabled || previousKey === changeKey) return

    containerRef.current?.scrollTo({
      top: 0,
      behavior,
    })
  }, [behavior, changeKey, containerRef, enabled])
}
