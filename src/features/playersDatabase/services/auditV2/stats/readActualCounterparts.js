import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../model/team/teamIdentity.model.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const readDoc = async (collectionName, id, action) => {
  if (!clean(id)) return null

  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, clean(id)),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action,
      operationSubtype: 'audit-getDocFromServer',
    }
  )

  return snapshot.exists()
    ? { id: snapshot.id, ...(snapshot.data() || {}) }
    : null
}

export async function readActualStatsCounterpartsV2({
  expectedCounterparts = [],
} = {}) {
  const targets = new Map()

  ;(Array.isArray(expectedCounterparts) ? expectedCounterparts : [])
    .forEach(row => {
      const birthTeamDocumentId = clean(row?.target?.birthTeamDocumentId)
      const seasonKey = clean(row?.target?.seasonKey)
      if (!birthTeamDocumentId || !seasonKey) return
      targets.set(`${birthTeamDocumentId}::${seasonKey}`, {
        birthTeamDocumentId,
        seasonKey,
      })
    })

  const rows = []

  for (const target of targets.values()) {
    const teamSeasonDocumentId = buildTeamSeasonDocumentId(
      target.birthTeamDocumentId,
      target.seasonKey
    )
    const [teamRoot, teamSeason] = await Promise.all([
      readDoc(
        PLAYERS_DATABASE_COLLECTIONS.teams,
        target.birthTeamDocumentId,
        'audit-v2-stats-read-counterpart-team-root'
      ),
      readDoc(
        PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
        teamSeasonDocumentId,
        'audit-v2-stats-read-counterpart-team-season'
      ),
    ])
    const leagueId = clean(teamSeason?.leagueId || teamRoot?.leagueId)
    const league = leagueId
      ? await readDoc(
          PLAYERS_DATABASE_COLLECTIONS.leagues,
          leagueId,
          'audit-v2-stats-read-counterpart-league'
        )
      : null

    rows.push({ ...target, teamRoot, teamSeason, league })
  }

  return rows
}
