// features/playersDatabase/hooks/useAliveRef.js

import { useEffect, useRef } from 'react'

export function useAliveRef() {
  const aliveRef = useRef(true)

  useEffect(() => {
    aliveRef.current = true

    return () => {
      aliveRef.current = false
    }
  }, [])

  return aliveRef
}
