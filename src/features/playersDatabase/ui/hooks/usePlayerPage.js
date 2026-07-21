// features/playersDatabase/ui/hooks/usePlayerPage.js

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  buildEmptyPlayerPageView,
  buildPlayerPageView,
} from '../../model/playerPage.model.js'
import { readPlayerPageData } from '../../services/read/index.js'

export function usePlayerPage() {
  const { playerId = '' } = useParams()
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError(null)

    readPlayerPageData({ playerId })
      .then(data => {
        if (!active) return
        setRow(data)
        setLoading(false)
      })
      .catch(nextError => {
        if (!active) return
        setRow(null)
        setError(nextError)
        setLoading(false)
      })

    return () => { active = false }
  }, [playerId])

  const player = useMemo(
    () => buildPlayerPageView(row) || buildEmptyPlayerPageView(playerId),
    [playerId, row]
  )

  return {
    player,
    loading,
    error,
  }
}
