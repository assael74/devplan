import { db } from '../../../../../services/firebase/firebase.js'
import { buildSeasonKey, clean } from '../leagues/leagueDoc.js'
import { normalizeSeasonIdentity } from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { teamSeasonDocRef, buildTeamSeasonDocumentData } from './teamSeasonDoc.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

const patchSeason = async ({ teamId, team = {}, season = {}, patch = {} } = {}) => {
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  const ref = teamSeasonDocRef({ birthTeamDocumentId: teamId, seasonKey })
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) return { birthTeamDocumentId: teamId, teamDocumentId: teamId, teamSeasonDocumentId: ref.id, seasonId, seasonKey, updated: false, reason: 'teamSeasonMissing' }
    const current = snapshot.data() || {}
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
    const persisted = buildTeamSeasonDocumentData({ team: { ...team, birthTeamDocumentId: teamId }, season: { ...season, seasonId, seasonKey }, seasonDoc: next, existingData: current })
    transaction.set(ref, persisted)
    return { birthTeamDocumentId: teamId, teamDocumentId: teamId, teamSeasonDocumentId: ref.id, seasonId, seasonKey, updated: true, seasonDocument: persisted }
  })
}

export async function updateTeamSeasonTeamUrl({ season = {}, team = {}, teamUrl = '' } = {}) {
  const teamId = resolveTeamLookupKey(team)
  if (!teamId) throw new Error('Missing birth team id')
  return patchSeason({ teamId, team, season, patch: { teamUrl: clean(teamUrl) } })
}

export async function updateTeamSeasonsMetaMany({ season = {}, team = {}, rows = [], teams = [], birthYear = null, leagueTotalRound = null } = {}) {
  const candidates = [team, ...rows, ...teams]
  const teamIds = [...new Set(candidates.map(resolveTeamLookupKey).filter(Boolean))]
  const results = []
  for (const teamId of teamIds) {
    results.push(await patchSeason({
      teamId,
      team: { ...team, birthTeamDocumentId: teamId },
      season,
      patch: {
        ...(birthYear === null || birthYear === undefined ? {} : { birthYear: Number(birthYear) || 0 }),
        ...(leagueTotalRound === null || leagueTotalRound === undefined ? {} : { leagueTotalRound: Number(leagueTotalRound) || 0 }),
      },
    }))
  }
  return results
}
