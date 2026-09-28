import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../model/team/teamIdentity.model.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const readDoc = async (collectionName, id, action) => {
  const snapshot = await trackedGetDocFromServer(doc(db, collectionName, id), {
    feature: 'playersDatabase',
    collection: collectionName,
    action,
    operationSubtype: 'audit-getDoc',
  })

  return snapshot.exists()
    ? {
        id: snapshot.id,
        ...(snapshot.data() || {}),
      }
    : null
}

export async function readStatsCanonicalV2({
  birthTeamDocumentId = '',
  seasonKey = '',
} = {}) {
  const teamId = clean(birthTeamDocumentId)
  const key = clean(seasonKey)

  if (!teamId) throw new Error('Missing Stats birth team document id')
  if (!key) throw new Error('Missing Stats season key')

  const teamSeasonDocumentId = buildTeamSeasonDocumentId(teamId, key)
  const [teamRoot, teamSeason] = await Promise.all([
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.teams,
      teamId,
      'audit-v2-stats-read-team-root'
    ),
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      teamSeasonDocumentId,
      'audit-v2-stats-read-team-season'
    ),
  ])

  if (!teamRoot) throw new Error(`Stats Team Root not found: ${teamId}`)
  if (!teamSeason) throw new Error(`Stats Team Season not found: ${teamSeasonDocumentId}`)

  const leagueId = clean(teamSeason.leagueId || teamRoot.leagueId)
  if (!leagueId) throw new Error('Stats canonical League id is missing')

  const league = await readDoc(
    PLAYERS_DATABASE_COLLECTIONS.leagues,
    leagueId,
    'audit-v2-stats-read-league'
  )

  if (!league) throw new Error(`Stats canonical League not found: ${leagueId}`)

  const clubId = clean(teamRoot.clubId || teamSeason.scoutIdentityContext?.clubId)
  const club = clubId
    ? await readDoc(
        PLAYERS_DATABASE_COLLECTIONS.clubs,
        clubId,
        'audit-v2-stats-read-club'
      )
    : null

  return {
    teamRoot,
    teamSeason,
    league,
    club,
    birthTeamDocumentId: teamId,
    seasonKey: key,
    leagueId,
  }
}
