import { buildTeamStatsCanonicalCommit } from '../../teams/teamSeasonStats.js'
import { readTeamSeasonRosterHistory } from '../../../read/entities/teamSeasonRosterHistory.js'
import { resolveTeamLookupKey } from '../../../../model/team/teamIdentity.model.js'
import { ROSTER_IMPORT_MODE, reconcileRosterMovement } from '../../../../domain/movement/index.js'
import { buildStatsSourceFingerprint } from '../../teams/statsPlanFingerprint.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export async function prepareStatsCanonicalPlan({
  league = {},
  season = {},
  team = {},
  players = [],
  teamPerformance = null,
  teamPoints = null,
  statsProjectionRevision = '',
} = {}) {
  const birthTeamDocumentId = resolveTeamLookupKey(team)
  const seasonKey = clean(season.seasonKey || season.seasonId)

  if (!birthTeamDocumentId) throw new Error('Missing birth team id')
  if (!seasonKey) throw new Error('Missing season key')

  const history = await readTeamSeasonRosterHistory({
    birthTeamDocumentId,
    seasonKey,
    bypassCache: true,
  })

  const reconcileMovement = ({ currentSeason, previousSeason }) => reconcileRosterMovement({
    seasonKey,
    team: {
      ...team,
      birthTeamDocumentId,
    },
    incomingPlayers: players,
    currentSeason,
    previousSeason,
    rosterImport: {
      mode: ROSTER_IMPORT_MODE.PATCH,
      sourceSnapshotKey: currentSeason?.rosterImport?.sourceSnapshotKey || `stats__${seasonKey}`,
      contentHash: currentSeason?.rosterImport?.contentHash || '',
      effectiveAt: currentSeason?.rosterImport?.effectiveAt || null,
    },
  })

  const canonicalCommit = buildTeamStatsCanonicalCommit({
    season,
    team,
    players,
    teamPerformance,
    teamPoints,
    reconcileMovement,
    statsProjectionRevision,
    existingSeason: history.currentSeason,
    existingRoot: history.teamRoot,
    previousSeason: history.previousSeason,
  })

  return {
    planType: 'approvedStatsCanonicalPlan',
    planVersion: 1,
    birthTeamDocumentId,
    seasonKey: canonicalCommit.seasonKey,
    statsProjectionRevision,
    league,
    season,
    team,
    sourceFingerprints: {
      teamRoot: buildStatsSourceFingerprint(history.teamRoot),
      currentSeason: buildStatsSourceFingerprint(history.currentSeason),
      previousSeason: buildStatsSourceFingerprint(history.previousSeason),
      previousSeasonKey: clean(history.previousSeasonKey),
    },
    canonicalCommit,
  }
}
