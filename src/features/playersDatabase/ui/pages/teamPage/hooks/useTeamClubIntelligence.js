// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamClubIntelligence.js

import * as React from 'react'

import { buildClubSeasonIntelligence } from '../../../../domain/clubIntelligence/index.js'
import { readClubCohortComparisonSources } from '../../../../services/read/pages/clubCohortComparison.read.js'

export default function useTeamClubIntelligence({ clubId, club, seasonOption, seasonOptions = [] }) {
  const seasonId = seasonOption?.seasonId || ''
  const seasonKey = seasonOption?.seasonKey || ''
  const knownSeasonIds = [...new Set(seasonOptions.map(option => option.seasonId).filter(Boolean))].sort().join(',')
  const requestKey = `${clubId || ''}:${seasonId}:${knownSeasonIds}`
  const [result, setResult] = React.useState({ key: '', intelligence: null, sources: null })

  React.useEffect(() => {
    if (!clubId || !seasonId) return undefined

    let active = true
    readClubCohortComparisonSources({ clubId, seasonId, seasonIds: knownSeasonIds.split(',') }).then(sources => {
      if (!active) return
      setResult({
        key: requestKey,
        sources,
        intelligence: buildClubSeasonIntelligence({
          clubId,
          directoryEntry: club,
          seasonKey,
          sources,
        }),
      })
    }).catch(() => {
      if (active) setResult({ key: requestKey, intelligence: null, sources: null })
    })

    return () => { active = false }
  }, [club, clubId, requestKey, seasonId, seasonKey, knownSeasonIds])

  const current = result.key === requestKey
  return {
    intelligence: current ? result.intelligence : null,
    sources: current ? result.sources : null,
    loading: Boolean(clubId && seasonId && !current),
  }
}
