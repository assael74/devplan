import { buildTeamLoadStatus } from '../../../../model/team/teamLoadStatus.model.js'
import { resolveTeamLookupKey } from '../../../../model/team/teamIdentity.model.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const stableId = (...parts) => parts.map(clean).filter(Boolean).join('::')

const buildOperation = ({
  family,
  target = {},
  patch = {},
  expected = {},
  sourceRevision = '',
  operationKey = '',
} = {}) => ({
  operationId: stableId('roster-sync', sourceRevision, family, operationKey),
  family,
  sourceRevision: clean(sourceRevision),
  target,
  expected,
  patch,
})

const buildCounterpartOps = ({ requests = [], sourceRevision = '' } = {}) => (
  (Array.isArray(requests) ? requests : []).map(request => {
    const fact = request.outgoing || request.incoming || null
    const side = request.outgoing ? 'transfersOut' : request.incoming ? 'transfersIn' : ''
    const teamId = clean(request.counterpartBirthTeamDocumentId || request.sourceBirthTeamDocumentId)
    const seasonKey = clean(request.counterpartSeasonKey || request.seasonKey)

    return buildOperation({
      family: 'counterpart',
      sourceRevision,
      operationKey: clean(request.movementId),
      target: {
        birthTeamDocumentId: teamId,
        seasonKey,
      },
      expected: {
        movementId: clean(request.movementId),
        side,
        counterpartRosterProjectionRevision: clean(request.counterpartRosterProjectionRevision),
        counterpartMovementProjectionRevision: clean(request.counterpartMovementProjectionRevision),
      },
      patch: {
        side,
        fact,
        playerId: clean(request.playerId),
      },
    })
  }).filter(operation => (
    operation.target.birthTeamDocumentId &&
    operation.target.seasonKey &&
    operation.patch.side &&
    operation.patch.fact
  ))
)

const buildLeagueTeamOp = ({
  leagueId = '',
  season = {},
  team = {},
  players = [],
  sourceRevision = '',
} = {}) => {
  const teamId = resolveTeamLookupKey(team)
  const loadStatus = buildTeamLoadStatus(players)

  return buildOperation({
    family: 'leagueTeam',
    sourceRevision,
    operationKey: stableId(leagueId, season.seasonKey, teamId),
    target: {
      leagueId: clean(leagueId),
      seasonKey: clean(season.seasonKey || season.seasonId),
      sourceTarget: clean(season.seasonStatus) === 'completed' ? 'history' : 'current',
      birthTeamDocumentId: clean(teamId),
      clubId: clean(team.clubId),
    },
    expected: {
      rowKey: clean(teamId),
    },
    patch: {
      teamUrl: clean(team.teamUrl),
      playersCount: Array.isArray(players) ? players.length : 0,
      hasPlayers: Boolean(loadStatus.hasPlayers),
      hasStats: Boolean(loadStatus.hasStats),
      statsComplete: Boolean(loadStatus.statsComplete),
    },
  })
}

const buildLeaguesMasterOp = ({ leagueId = '', season = {}, sourceRevision = '', entry = null, summary = null } = {}) => (
  buildOperation({
    family: 'leaguesMaster',
    sourceRevision,
    operationKey: stableId(leagueId, season.seasonKey),
    target: {
      leagueId: clean(leagueId),
      seasonKey: clean(season.seasonKey || season.seasonId),
    },
    expected: {
      source: 'leagueTeam',
    },
    patch: entry ? {
      league: {
        leagueId: clean(entry.leagueId), leagueDocumentId: clean(entry.leagueDocumentId),
        leagueName: clean(entry.leagueName), leagueUrl: clean(entry.leagueUrl), region: clean(entry.region),
        ageGroupId: clean(entry.ageGroupId), ageGroupLabel: clean(entry.ageGroupLabel), active: entry.active !== false,
      },
      seasonEntry: (Array.isArray(entry.seasons) ? entry.seasons : []).find(row => (
        clean(row?.seasonKey || row?.seasonId) === clean(season.seasonKey || season.seasonId)
      )) || null,
      summary: summary || null,
    } : {},
  })
)

const buildProjectionDescriptor = ({
  family,
  sourceRevision = '',
  leagueId = '',
  season = {},
  team = {},
  teamSeason = {},
  players = [],
  extra = {},
} = {}) => {
  const teamId = resolveTeamLookupKey(team) || clean(teamSeason.birthTeamDocumentId || teamSeason.teamId)

  return buildOperation({
    family,
    sourceRevision,
    operationKey: stableId(leagueId, season.seasonKey, teamId),
    target: {
      leagueId: clean(leagueId),
      seasonKey: clean(season.seasonKey || season.seasonId),
      birthTeamDocumentId: clean(teamId),
      clubId: clean(team.clubId || teamSeason.clubId),
    },
    expected: {
      sourceRevision: clean(sourceRevision),
    },
    patch: {
      playersCount: Array.isArray(players) ? players.length : 0,
      ...extra,
    },
  })
}

const wrapPreparedOperations = ({ family, sourceRevision, operations = [] } = {}) => (
  (Array.isArray(operations) ? operations : []).map((operation, index) => buildOperation({
    family,
    sourceRevision,
    operationKey: clean(operation.operationKey || operation.docId || operation.target?.docId || index),
    target: operation.target || { docId: clean(operation.docId) },
    expected: operation.expected || {},
    patch: {
      type: clean(operation.type || 'upsert'),
      ...(operation.patch ? { fields: operation.patch } : {}),
    },
  }))
)

export const buildApprovedRosterSyncPayload = ({
  sourceRevision = '',
  leagueId = '',
  season = {},
  team = {},
  teamSeason = {},
  players = [],
  approvedCounterpartRequests = [],
  teamPerformance = null,
  teamPoints = 0,
  playerIndexPlan = null,
  teamIndexPlan = null,
  leaguesMasterEntry = null,
  leaguesMasterSummary = null,
  clubProjectionOperations = [],
  clubsMasterOperations = [],
  leagueTeamPlan = null,
} = {}) => {
  const revision = clean(sourceRevision)
  if (!revision) throw new Error('Missing roster sync source revision')

  const leagueTeamOp = buildLeagueTeamOp({
    leagueId,
    season,
    team,
    players,
    sourceRevision: revision,
  })

  return {
    version: 1,
    sourceRevision: revision,
    canonical: {
      leagueId: clean(leagueId),
      seasonKey: clean(season.seasonKey || season.seasonId),
      birthTeamDocumentId: clean(resolveTeamLookupKey(team)),
    },
    operations: {
      counterpart: buildCounterpartOps({
        requests: approvedCounterpartRequests,
        sourceRevision: revision,
      }),
      leagueTeam: leagueTeamPlan?.patch ? [buildOperation({
        family: 'leagueTeam', sourceRevision: revision,
        operationKey: stableId(leagueTeamPlan.target?.leagueId, leagueTeamPlan.target?.seasonKey, leagueTeamPlan.target?.birthTeamDocumentId),
        target: leagueTeamPlan.target, expected: leagueTeamPlan.expected || {}, patch: leagueTeamPlan.patch,
      })] : (leagueTeamOp.target.birthTeamDocumentId ? [leagueTeamOp] : []),
      leaguesMaster: leaguesMasterEntry ? [buildLeaguesMasterOp({
        leagueId, season, sourceRevision: revision, entry: leaguesMasterEntry, summary: leaguesMasterSummary,
      })] : [],
      playerIndex: wrapPreparedOperations({
        family: 'playerIndex', sourceRevision: revision, operations: playerIndexPlan?.operations,
      }),
      teamIndex: teamIndexPlan?.docId ? [buildOperation({
        family: 'teamIndex', sourceRevision: revision, operationKey: teamIndexPlan.docId,
        target: { docId: teamIndexPlan.docId }, expected: teamIndexPlan.expected || {},
        patch: { type: 'upsert', fields: teamIndexPlan.patch || {} },
      })] : [],
      clubProjection: wrapPreparedOperations({
        family: 'clubProjection', sourceRevision: revision, operations: clubProjectionOperations,
      }),
      clubsMaster: wrapPreparedOperations({
        family: 'clubsMaster', sourceRevision: revision, operations: clubsMasterOperations,
      }),
    },
  }
}
