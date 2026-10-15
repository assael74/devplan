// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamClubIntelligence.js

import * as React from 'react'

import { buildClubIntelligenceFromCanonicalSources } from '../../../../domain/clubIntelligence/index.js'
import { readClubsCenterSeasonDocument } from '../../../../services/read/index.js'

export default function useTeamClubIntelligence({ clubId, club, seasonOption }) {
  const seasonId = seasonOption?.seasonId || ''
  const seasonKey = seasonOption?.seasonKey || ''
  const requestKey = `${clubId || ''}:${seasonId}`
  const [result, setResult] = React.useState({ key: '', intelligence: null })

  React.useEffect(() => {
    if (!clubId || !seasonId) return undefined

    let active = true
    readClubsCenterSeasonDocument({ seasonId }).then(document => {
      if (!active) return
      setResult({
        key: requestKey,
        intelligence: buildClubIntelligenceFromCanonicalSources({
          clubId,
          directoryEntry: club,
          centers: [{
            season: { seasonId, seasonKey, target: 'current' },
            document,
          }],
        }),
      })
    }).catch(() => {
      if (active) setResult({ key: requestKey, intelligence: null })
    })

    return () => { active = false }
  }, [club, clubId, requestKey, seasonId, seasonKey])

  return result.key === requestKey ? result.intelligence : null
}
