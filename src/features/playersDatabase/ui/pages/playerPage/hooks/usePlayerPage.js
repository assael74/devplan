// src/features/playersDatabase/ui/pages/playerPage/hooks/usePlayerPage.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import {
  buildEmptyPlayerPageView,
  buildPlayerPageView,
} from '../../../../model/player/page/playerPage.model.js'
import { PLAYERS_DATABASE_CURRENT_SEASON_KEY } from '../../../../catalog/seasons.catalog.js'
import { normalizeSeasonLookupKey } from '../../../../model/shared/season.model.js'
import { readClubPageDocument, readPlayerPageData } from '../../../../services/read/index.js'
import { buildPlayerDocumentCacheKey } from '../../../../services/cache/index.js'
import usePlayersDatabaseReadStoreEntry from '../../../hooks/usePlayersDatabaseReadStoreEntry.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'

function cleanValue(value) {
  return String(value || '').trim()
}

export function usePlayerPage() {
  const location = useLocation()
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
  const playerStoreKey = buildPlayerDocumentCacheKey(playerId)
  const playerEntry = usePlayersDatabaseReadStoreEntry(playerStoreKey)
  const row = playerEntry.data
  const loading = !row && (
    playerEntry.status === 'idle' ||
    playerEntry.status === 'loading' ||
    playerEntry.status === 'refreshing'
  )
  const error = row ? null : playerEntry.error
  const refreshError = playerEntry.refreshError?.message || ''
  const [clubDoc, setClubDoc] = useState(null)

  useEffect(() => {
    let active = true

    readPlayerPageData({ playerId }).catch(() => {
      if (!active) return
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

  useEffect(() => {
    let active = true
    const clubId = cleanValue(player?.clubId)
    if (!clubId) { setClubDoc(null); return () => { active = false } }
    readClubPageDocument({ clubId }).then(value => { if (active) setClubDoc(value) }).catch(() => { if (active) setClubDoc(null) })
    return () => { active = false }
  }, [player?.clubId])

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


  const setSelectedSeasonContext = useCallback(context => {
    const nextSeasonKey = normalizeSeasonLookupKey(context?.seasonKey)
    const nextTeamId = cleanValue(context?.teamId)
    const nextLeagueId = cleanValue(context?.leagueId)
    const nextPath = PLAYERS_DATABASE_UI_ROUTES.player({
      playerId,
      seasonKey: nextSeasonKey,
      teamId: nextTeamId,
      leagueId: nextLeagueId,
      fromTeam,
    })

    navigate(nextPath, {
      replace: true,
      state: null,
    })
  }, [fromTeam, navigate, playerId])

  const reload = useCallback(() => (
    readPlayerPageData({
      playerId,
      refresh: true,
    })
  ), [playerId])

  return {
    player,
    clubDoc,
    teamSource: location.state?.playerTeamSource || null,
    requestedSeasonKey,
    requestedTeamId,
    catalogSeasonKey: PLAYERS_DATABASE_CURRENT_SEASON_KEY,
    selectedSeasonKey: player.seasonKey || requestedSeasonKey,
    setSelectedSeasonKey,
    setSelectedSeasonContext,
    fromTeam,
    reload,
    loading,
    error,
    refreshError,
  }
}
