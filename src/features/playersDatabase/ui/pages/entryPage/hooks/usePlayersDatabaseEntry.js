// src/features/playersDatabase/ui/pages/entryPage/hooks/usePlayersDatabaseEntry.js

import {
  useMemo,
} from 'react'

import {
  LEAGUES_CENTER_STORE_KEY,
} from '../../../../services/read/pages/leagueCenter.read.js'
import usePlayersDatabaseReadStoreEntry from '../../../hooks/usePlayersDatabaseReadStoreEntry.js'

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

export function usePlayersDatabaseEntry() {
  const entry = usePlayersDatabaseReadStoreEntry(LEAGUES_CENTER_STORE_KEY)
  const leaguesCenterDocument = entry.data

  const summary = useMemo(() => {
    const leagues = Object.values(object(leaguesCenterDocument?.leaguesById))
    const seasons = leagues.flatMap(league => Object.values(object(league?.seasonsById)))
    const teams = seasons.flatMap(season => Object.values(object(season?.teamsById)))
    const teamsWithStats = teams.filter(team => (
      ['STATS_LOADED', 'STATS_FINAL'].includes(String(team?.documentationState || '').trim().toUpperCase())
    ))

    return {
      leaguesCount: leagues.length,
      seasonsCount: seasons.length,
      teamsCount: teams.length,
      teamsWithStatsCount: teamsWithStats.length,
    }
  }, [leaguesCenterDocument])

  return {
    leaguesCenterDocument,
    summary,
    loading: entry.status === 'idle' || entry.status === 'loading',
    refreshing: entry.status === 'refreshing',
    error: entry.status === 'error'
      ? entry.error?.message || 'טעינת מרכז הליגות נכשלה'
      : '',
  }
}
