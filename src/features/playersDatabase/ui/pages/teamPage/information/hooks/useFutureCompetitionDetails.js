// src/features/playersDatabase/ui/pages/teamPage/information/hooks/useFutureCompetitionDetails.js

import { useEffect, useMemo, useState } from 'react'
import { getLeagueById, readClubsCenterSeasonDocument } from '../../../../../services/read/index.js'

export default function useFutureCompetitionDetails(groups, clubId) {
  const teams = groups.flatMap(group => group.seasons?.current?.teams || [])
  const seasonId = teams.find(team => team.seasonId)?.seasonId || ''
  const leagueKey = [...new Set(teams.map(team => team.league?.leagueId).filter(Boolean))].sort().join('|')
  const key = `${clubId}:${seasonId}:${leagueKey}`
  const [state, setState] = useState(null)

  useEffect(() => {
    if (!seasonId || !clubId || !leagueKey) return undefined
    let active = true
    const years = seasonId.match(/^(\d{4})_(\d{4})$/)
    const previousSeasonId = years ? `${Number(years[1]) - 1}_${Number(years[2]) - 1}` : ''
    const leagueIds = leagueKey.split('|')
    Promise.allSettled([
      previousSeasonId ? readClubsCenterSeasonDocument({ seasonId: previousSeasonId }) : Promise.resolve(null),
      ...leagueIds.map(leagueId => getLeagueById(leagueId)),
    ]).then(results => {
      if (!active) return
      const previous = results[0].status === 'fulfilled' ? results[0].value : null
      const leaguesById = Object.fromEntries(leagueIds.map((id, index) => [
        id, results[index + 1].status === 'fulfilled' ? results[index + 1].value : null,
      ]))
      setState({
        key,
        details: {
          leaguesById,
          previousTeamsById: previous?.clubsById?.[clubId]?.teamsById || {},
          previousLeaguesById: previous?.leaguesById || {},
        },
        error: results.some(result => result.status === 'rejected'),
      })
    })
    return () => { active = false }
  }, [clubId, seasonId, leagueKey, key])

  return useMemo(() => state?.key === key
    ? { details: state.details, loading: false, error: state.error }
    : { details: {}, loading: Boolean(seasonId && clubId && leagueKey), error: false }, [state, key, seasonId, clubId, leagueKey])
}
