// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamClubIntelligence.js

import * as React from 'react'

import { buildClubIntelligenceFromCanonicalSources } from '../../../../domain/clubIntelligence/index.js'
import { adaptClubCohortComparison } from '../../../../domain/clubIntelligence/clubCohortComparison.adapter.js'
import { readClubCohortComparisonSources } from '../../../../services/read/pages/clubCohortComparison.read.js'

export default function useTeamClubIntelligence({ clubId, club, seasonOption, seasonOptions = [] }) {
  const seasonId = seasonOption?.seasonId || ''
  const seasonKey = seasonOption?.seasonKey || ''
  const knownSeasonIds = [...new Set(seasonOptions.map(option => option.seasonId).filter(Boolean))].sort().join(',')
  const requestKey = `${clubId || ''}:${seasonId}:${knownSeasonIds}`
  const [result, setResult] = React.useState({ key: '', intelligence: null })

  React.useEffect(() => {
    if (!clubId || !seasonId) return undefined

    let active = true
    readClubCohortComparisonSources({ clubId, seasonId, seasonIds: knownSeasonIds.split(',') }).then(sources => {
      const { current, history, leaguesById: leagueDocumentsById, unavailableSeasonIds } = sources
      const { center: document, teamSeasonsById } = current
      if (!active) return
      setResult({
        key: requestKey,
        intelligence: {
          ...buildClubIntelligenceFromCanonicalSources({
            clubId,
            directoryEntry: club,
            centers: [{
              season: { seasonId, seasonKey, target: 'current' },
              document,
              leagueDocumentsById,
            }],
          }),
          cohortComparison: adaptClubCohortComparison({
            clubId, seasonId, center: document, leaguesById: leagueDocumentsById,
            teamSeasonsById, history, unavailableSeasonIds,
          }),
        },
      })
    }).catch(() => {
      if (active) setResult({ key: requestKey, intelligence: null })
    })

    return () => { active = false }
  }, [club, clubId, requestKey, seasonId, seasonKey, knownSeasonIds])

  return result.key === requestKey ? result.intelligence : null
}
