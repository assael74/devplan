// src/features/playersDatabase/ui/pages/leaguePage/components/LeagueFutureCompetitionBadge.js

import { useEffect, useMemo, useState } from 'react'
import TeamSignalLevelBadge from '../../../components/teamSignals/TeamSignalLevelBadge.js'
import { readTeamSignalSummary } from '../../../../domain/signals/teamSignalSummary.js'
import { getLeagueById } from '../../../../services/read/index.js'
import {
  describeLeagueFutureCompetition,
  resolveLeagueFutureCompetitionSource,
} from '../../../../model/league/page/leagueFutureCompetition.model.js'

export default function LeagueFutureCompetitionBadge({ row, context = {} }) {
  const { seasonId, birthYear, leaguesCenterDocument } = context
  const resolution = useMemo(() => resolveLeagueFutureCompetitionSource({
    clubId: row.clubId, teamSlot: row.teamSlot, birthYear, seasonId, leaguesCenterDocument,
  }), [row.clubId, row.teamSlot, birthYear, seasonId, leaguesCenterDocument])
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState(null)
  const summary = readTeamSignalSummary(row.teamSignalSummary)
  const missing = summary.familiesById['future-competition'].level === null
  const key = [row.id, seasonId, birthYear, resolution.source?.leagueId, resolution.source?.teamId, summary.computedAt].join(':')

  useEffect(() => {
    if (!open || !missing || !resolution.source) return undefined
    let active = true
    const source = resolution.source
    setDetails({ key, description: 'טוען את סיבת חוסר המידע...' })
    getLeagueById(source.leagueId).then(leagueDocument => {
      if (active) setDetails({ key, description: describeLeagueFutureCompetition(source, leagueDocument) })
    }).catch(() => {
      if (active) setDetails({ key, description: 'טעינת נתוני ליגת המקור נכשלה. אפשר לרחף שוב כדי לנסות שנית.' })
    })
    return () => { active = false }
  }, [open, missing, resolution, key])

  return (
    <TeamSignalLevelBadge
      summary={row.teamSignalSummary}
      familyId='future-competition'
      missingDescription={resolution.description || (details?.key === key
        ? details.description : 'טוען את סיבת חוסר המידע...')}
      onMissingTooltipOpen={() => setOpen(true)}
      onMissingTooltipClose={() => setOpen(false)}
    />
  )
}
