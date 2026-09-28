import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../model/team/teamIdentity.model.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [...new Set(
  (Array.isArray(values) ? values : []).map(clean).filter(Boolean)
)]

const readDoc = async (collectionName, id, action) => {
  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, id),
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

const readCandidate = async ({
  birthTeamDocumentId = '',
  seasonKey = '',
  teamRoot = null,
} = {}) => {
  const teamSeasonDocumentId = buildTeamSeasonDocumentId(
    birthTeamDocumentId,
    seasonKey
  )
  const teamSeason = await readDoc(
    PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    teamSeasonDocumentId,
    'audit-v2-roster-read-counterpart-team-season'
  )

  const leagueId = clean(teamSeason?.leagueId || teamRoot?.leagueId)
  const league = leagueId
    ? await readDoc(
        PLAYERS_DATABASE_COLLECTIONS.leagues,
        leagueId,
        'audit-v2-roster-read-counterpart-league'
      )
    : null

  return {
    birthTeamDocumentId,
    seasonKey,
    teamRoot: teamRoot || null,
    teamSeason: teamSeason || null,
    league: league || null,
  }
}

export async function readActualRosterCounterpartsV2({
  expectedCounterparts = [],
} = {}) {
  const byTeam = new Map()

  ;(Array.isArray(expectedCounterparts) ? expectedCounterparts : [])
    .forEach(row => {
      const teamId = clean(row?.target?.birthTeamDocumentId)
      if (!teamId) return
      const current = byTeam.get(teamId) || []
      current.push(row)
      byTeam.set(teamId, current)
    })

  const actual = []

  for (const [teamId, rows] of byTeam.entries()) {
    const root = await readDoc(
      PLAYERS_DATABASE_COLLECTIONS.teams,
      teamId,
      'audit-v2-roster-read-counterpart-team-root'
    )
    const rootSeasonKeys = (Array.isArray(root?.seasons) ? root.seasons : [])
      .map(row => clean(row?.seasonKey || row?.seasonId))
      .filter(Boolean)
    const explicitKeys = rows.map(row => clean(row?.target?.seasonKey))
    const seasonKeys = unique([...explicitKeys, ...rootSeasonKeys])

    for (const seasonKey of seasonKeys) {
      actual.push(await readCandidate({
        birthTeamDocumentId: teamId,
        seasonKey,
        teamRoot: root,
      }))
    }
  }

  return actual
}
