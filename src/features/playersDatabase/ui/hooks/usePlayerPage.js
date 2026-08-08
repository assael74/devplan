// features/playersDatabase/ui/hooks/usePlayerPage.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import {
  buildEmptyPlayerPageView,
  buildPlayerPageView,
} from '../../model/playerPage.model.js'
import { normalizeSeasonLookupKey } from '../../model/season.model.js'
import { readPlayerPageData } from '../../services/read/index.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../logic/routeBuilders.js'

function cleanValue(value) {
  return String(value || '').trim()
}

export function usePlayerPage() {
  const navigate = useNavigate()
  const { playerId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const requestedSeasonKey = normalizeSeasonLookupKey(
    searchParams.get('season')
  )
  const requestedTeamId = cleanValue(
    searchParams.get('team')
  )
  const fromTeam = cleanValue(
    searchParams.get('fromTeam')
  )
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

    return () => {
      active = false
    }
  }, [playerId])

  const player = useMemo(() => (
    buildPlayerPageView(
      row,
      requestedSeasonKey,
      requestedTeamId
    ) || buildEmptyPlayerPageView(playerId)
  ), [
    playerId,
    requestedSeasonKey,
    requestedTeamId,
    row,
  ])

  const setSelectedSeasonKey = useCallback(value => {
    const nextSeasonKey = normalizeSeasonLookupKey(value)
    const seasonContexts = Array.isArray(player.seasonContexts)
      ? player.seasonContexts
      : []
    const nextContext = seasonContexts.find(context => (
      normalizeSeasonLookupKey(context.seasonKey) === nextSeasonKey
    ))
    const nextPath = PLAYERS_DATABASE_UI_ROUTES.player({
      playerId,
      seasonKey: nextContext?.seasonKey || nextSeasonKey,
      teamId: nextContext?.teamId || '',
      leagueId: nextContext?.leagueId || '',
      fromTeam,
    })

    navigate(nextPath, {
      replace: true,
      state: null,
    })
  }, [
    fromTeam,
    navigate,
    player.seasonContexts,
    playerId,
  ])

  return {
    player,
    selectedSeasonKey: player.seasonKey || requestedSeasonKey,
    setSelectedSeasonKey,
    fromTeam,
    loading,
    error,
  }
}
