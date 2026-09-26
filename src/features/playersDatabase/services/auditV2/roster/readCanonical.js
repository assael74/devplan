import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { cleanValue } from '../../../model/shared/value.model.js'
import { buildTeamSeasonDocumentId } from '../../../model/team/teamIdentity.model.js'

const readDoc = async (collectionName, id, action) => {
  const snapshot = await trackedGetDoc(doc(db, collectionName, id), {
    feature: 'playersDatabase',
    collection: collectionName,
    action,
    operationSubtype: 'audit-getDoc',
  })
  return snapshot.exists() ? { id: snapshot.id, ...(snapshot.data() || {}) } : null
}

export async function readRosterCanonicalV2({
  birthTeamDocumentId = '',
  seasonKey = '',
} = {}) {
  const teamId = cleanValue(birthTeamDocumentId)
  const key = cleanValue(seasonKey)
  if (!teamId) throw new Error('Missing birth team document id')
  if (!key) throw new Error('Missing season key')

  const teamSeasonDocumentId = buildTeamSeasonDocumentId(teamId, key)
  const [teamRoot, teamSeason] = await Promise.all([
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.teams,
      teamId,
      'audit-v2-roster-read-team-root'
    ),
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      teamSeasonDocumentId,
      'audit-v2-roster-read-team-season'
    ),
  ])

  if (!teamRoot) throw new Error(`Roster Team Root not found: ${teamId}`)
  if (!teamSeason) throw new Error(`Roster Team Season not found: ${teamSeasonDocumentId}`)

  const leagueId = cleanValue(teamSeason.leagueId || teamRoot.leagueId)
  if (!leagueId) throw new Error('Roster canonical League id is missing')

  const league = await readDoc(
    PLAYERS_DATABASE_COLLECTIONS.leagues,
    leagueId,
    'audit-v2-roster-read-league'
  )
  if (!league) throw new Error(`Roster canonical League not found: ${leagueId}`)

  return {
    teamRoot,
    teamSeason,
    league,
    birthTeamDocumentId: teamId,
    seasonKey: key,
    leagueId,
  }
}
