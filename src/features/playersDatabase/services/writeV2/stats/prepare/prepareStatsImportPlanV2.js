import { doc, getDoc } from 'firebase/firestore'

import { getLeagueById } from '../../../read/entities/league.js'
import { resolveRosterCounterpartCandidateV2 } from '../../../read/entities/teamMovementCounterpartV2.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildPlayerDocumentId } from '../../../../model/player/playerIdentity.model.js'
import { reconcileRosterMovement } from '../../../../domain/movement/index.js'
import { buildTeamSeasonDocumentId } from '../../../../model/team/teamIdentity.model.js'
import { buildPlayerSeasonIndexId } from '../../../../domain/rosterV2/support/searchIndex/player/playerSeasonIndex.identity.js'
import { buildApprovedStatsState } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { buildFinalStatsTeamSeasonState } from '../../../../domain/statsV2/teamSeasonStats.builder.js'
import { buildStatsReloadDecisionState } from '../../../../domain/statsV2/statsReloadDecision.builder.js'
import { buildTeamBalanceSearchIndexProjection } from '../../../../domain/projections/teamBalanceSearchIndex.projection.js'
import {
  buildLeaguesMasterLeagueEntry,
  buildLeaguesMasterSummary,
  sortLeaguesMasterEntries,
} from '../../../../domain/projections/leaguesMaster.projection.js'
import {
  buildClubAgeGroupSeasonProjection,
  buildClubDocumentProjection,
  buildClubsMasterClubProjection,
} from '../../../../domain/projections/club/index.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
  resolveLeagueTeamPoints,
} from '../../../../domain/projections/teamPerformance.projection.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const clone = value => JSON.parse(JSON.stringify(value))

const readRequired = async (collectionName, id, code) => {
  const snapshot = await getDoc(doc(db, collectionName, id))
  if (!snapshot.exists()) {
    const error = new Error(`Required Stats V2 document not found: ${id}`)
    error.code = code
    throw error
  }
  return { id: snapshot.id, ...snapshot.data() }
}

const buildPlayerSeasonRow = ({ player, season, team }) => ({
  seasonId: clean(season.seasonId),
  seasonKey: clean(season.seasonKey),
  seasonStatus: clean(season.seasonStatus),
  leagueId: clean(season.leagueId || team.leagueId),
  leagueName: clean(season.leagueName || team.leagueName),
  ageGroupId: clean(team.ageGroupId || season.ageGroupId),
  ageGroupLabel: clean(team.ageGroupLabel || season.ageGroupLabel),
  clubId: clean(team.clubId),
  clubName: clean(team.clubName),
  clubLevel: team.clubLevel ?? null,
  clubStrengthLevel: team.clubStrengthLevel ?? null,
  leagueLevel: season.leagueLevel ?? team.leagueLevel ?? null,
  expectedLevelDelta: season.expectedLevelDelta ?? team.expectedLevelDelta ?? null,
  teamName: clean(team.name || team.teamName),
  birthTeamId: clean(team.birthTeamId || team.birthTeamDocumentId),
  birthTeamDocumentId: clean(team.birthTeamDocumentId || team.birthTeamId),
  birthTeamSlot: Number(team.birthTeamSlot || 1),
  teamId: clean(team.teamId || team.birthTeamDocumentId),
  birthYear: player.birthYear ?? team.birthYear ?? null,
  primaryPosition: clean(player.primaryPosition),
  positionLayer: clean(player.positionLayer),
  lineClassification: player.lineClassification || null,
  numShirt: player.numShirt ?? null,
  rosterStatus: clean(player.rosterStatus || 'regular'),
  isYoungerAgeGroup: clean(player.rosterStatus) === 'youngerAgeGroup',
  statsStatus: clean(player.statsStatus),
  playerStats: clone(player.playerStats || {}),
  scoutProfiles: clone(player.scoutProfiles || []),
  scoutCombinationIds: clone(player.scoutCombinationIds || []),
  scoutOpportunity: player.scoutOpportunity || null,
  scoutProfileProgression: player.scoutProfileProgression || null,
  scoutProfileHierarchy: player.scoutProfileHierarchy || null,
  scoutPlayerInterest: player.scoutPlayerInterest || null,
  scoutEngineVersion: clean(player.scoutEngineVersion),
})

const buildPlayerDocumentPlans = async ({ players, season, team }) => {
  const plans = []
  for (const player of players) {
    const playerDocumentId = clean(player.playerDocumentId || buildPlayerDocumentId(player))
    if (!playerDocumentId) continue
    const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.players, playerDocumentId)
    const snapshot = await getDoc(ref)
    const exists = snapshot.exists()
    const hasProfile = Array.isArray(player.scoutProfiles) && player.scoutProfiles.length > 0
    if (!exists && !hasProfile) continue
    const seasonRow = buildPlayerSeasonRow({ player, season, team })
    const target = clean(season.seasonStatus) === 'completed' ? 'history' : 'current'
    const currentData = exists ? (snapshot.data() || {}) : {}
    const currentRows = Array.isArray(currentData.current) ? currentData.current : []
    const historyRows = Array.isArray(currentData.history) ? currentData.history : []
    const replace = rows => [...rows.filter(row => clean(row?.seasonKey) !== clean(season.seasonKey)), seasonRow]
    const ownedPatch = {
      current: target === 'current' ? replace(currentRows) : currentRows,
      history: target === 'history' ? replace(historyRows) : historyRows,
    }
    if (!exists) {
      Object.assign(ownedPatch, {
        id: playerDocumentId,
        externalPlayerId: clean(player.externalPlayerId || player.playerId),
        fullName: clean(player.fullName || player.name),
        normalizedName: clean(player.normalizedName || player.fullName || player.name).toLowerCase(),
        birthYear: player.birthYear ?? team.birthYear ?? null,
        primaryPosition: clean(player.primaryPosition),
        positionLayer: clean(player.positionLayer),
        numShirt: player.numShirt ?? null,
      })
    }
    plans.push({ action: exists ? 'update' : 'create', playerDocumentId, ownedPatch })
  }
  return plans
}

const buildPlayerIndexStates = ({ players, season, team }) => players.map(player => {
  const playerId = clean(player.playerId)
  const externalPlayerId = clean(player.externalPlayerId)
  const docId = buildPlayerSeasonIndexId({
    seasonKey: season.seasonKey,
    clubId: team.clubId,
    ageGroupId: team.ageGroupId,
    ageGroupLabel: team.ageGroupLabel,
    birthYear: team.birthYear,
    birthTeamSlot: team.birthTeamSlot || 1,
    playerId,
    externalPlayerId,
    normalizedName: player.normalizedName || player.fullName,
  })
  const stats = player.playerStats || {}
  return {
    docId,
    fields: {
      playerDocumentId: clean(player.playerDocumentId || buildPlayerDocumentId(player)),
      primaryPosition: clean(player.primaryPosition),
      positionLayer: clean(player.positionLayer),
      statsStatus: clean(player.statsStatus),
      games: Number(stats.games || 0),
      goals: Number(stats.goals || 0),
      yellowCards: Number(stats.yellowCards || 0),
      minutes: Number(stats.minutes || 0),
      starts: Number(stats.starts || 0),
      substituteIn: Number(stats.substituteIn || 0),
      substitutedOut: Number(stats.substitutedOut || 0),
      primaryScoutProfileId: clean(player.primaryScoutProfileId),
      scoutEffectiveImmediacyStatus: clean(player.scoutEffectiveImmediacyStatus),
      scoutPlayerInterestLevel: clean(player.scoutPlayerInterestLevel),
      scoutProfileIds: (player.scoutProfiles || []).map(profile => clean(profile?.profileId || profile?.id)).filter(Boolean),
      sourceCollection: PLAYERS_DATABASE_COLLECTIONS.birthTeams,
      sourceDocumentId: clean(team.birthTeamDocumentId),
      sourceTarget: clean(season.seasonStatus) === 'completed' ? 'history' : 'current',
    },
  }
}).filter(state => clean(state.docId))

const buildTeamIndexPatch = ({ leagueId, season, team, teamSeason, performance }) => ({
  docId: ['birthTeamSeason', clean(leagueId), clean(season.seasonKey), clean(team.birthTeamDocumentId)].filter(Boolean).join('__'),
  fields: {
    teamSeasonDocumentId: `${clean(team.birthTeamDocumentId)}__${clean(season.seasonKey)}`,
    playersCount: teamSeason.playersCount,
    scoutProfilesSummary: teamSeason.scoutProfilesSummary,
    ...buildTeamBalanceSearchIndexProjection(teamSeason.teamBalance),
  },
})

const buildLeagueAndMaster = ({ league, season, team, teamSeason, leaguesMaster }) => {
  const fields = {
    playersCount: teamSeason.playersCount,
    hasPlayers: teamSeason.playersCount > 0,
    hasStats: (teamSeason.finalTeamSeasonPreview?.teamPlayers || []).some(player => clean(player.statsStatus) === 'loaded'),
    statsComplete: true,
    scoutProfilesSummary: teamSeason.scoutProfilesSummary,
    teamTaskSignals: teamSeason.teamBalance?.teamTaskSignals || null,
  }
  const projectedLeague = clone(league)
  const target = clean(season.seasonStatus) === 'completed' ? 'history' : 'current'
  const seasonRow = target === 'current'
    ? projectedLeague.current
    : (projectedLeague.history || []).find(row => clean(row?.seasonKey) === clean(season.seasonKey))
  if (seasonRow) {
    const row = (seasonRow.tableRank || []).find(item => [item.teamId, item.birthTeamId, item.birthTeamDocumentId].map(clean).includes(clean(team.birthTeamDocumentId)))
    if (row) Object.assign(row, fields)
  }
  const currentEntries = Array.isArray(leaguesMaster.leagues) ? leaguesMaster.leagues : []
  const entry = buildLeaguesMasterLeagueEntry(projectedLeague, currentEntries.find(item => clean(item?.leagueId || item?.id) === clean(league.id)) || {})
  const leagues = sortLeaguesMasterEntries([...currentEntries.filter(item => clean(item?.leagueId || item?.id) !== clean(league.id)), entry])
  return {
    leagueMetadataPatch: { seasonKey: season.seasonKey, birthTeamDocumentId: team.birthTeamDocumentId, fields },
    leaguesMasterPatch: { id: clean(leaguesMaster.id) || 'all', docType: clean(leaguesMaster.docType) || 'leagues_master', leagues, summary: buildLeaguesMasterSummary(leagues) },
  }
}

const buildClubProjectionInput = ({ league, season, team, teamSeason, performance, points }) => ({
  season,
  league,
  team,
  teamSeason,
  performance,
  points,
})

const buildAllClubStates = async ({
  league,
  season,
  team,
  teamSeason,
  performance,
  points,
  clubsMaster,
  localClub,
  counterpartContexts = [],
}) => {
  const inputs = [
    clean(team.clubId) && localClub
      ? { league, season, team, teamSeason: teamSeason.finalTeamSeasonPreview, performance, points, existingClub: localClub }
      : null,
    ...counterpartContexts,
  ].filter(Boolean)
  const projectedByClubId = new Map()

  for (const input of inputs) {
    const clubId = clean(input.team?.clubId)
    if (!clubId) continue
    let projectedClub = projectedByClubId.get(clubId)
    if (!projectedClub) {
      const existingClub = input.existingClub || await readRequired(
        PLAYERS_DATABASE_COLLECTIONS.clubs,
        clubId,
        'STATS_CLUB_NOT_FOUND'
      )
      projectedClub = existingClub
    }
    const projection = buildClubAgeGroupSeasonProjection(buildClubProjectionInput(input))
    projectedClub = buildClubDocumentProjection({
      existingClub: projectedClub,
      clubIdentity: { clubId, name: clean(input.team?.clubName || input.team?.name) },
      ageGroupSeasonProjection: projection,
      projectionVersion: 1,
      updatedAt: projectedClub.updatedAt || null,
    })
    projectedByClubId.set(clubId, projectedClub)
  }

  const clubProjectionPatches = [...projectedByClubId.entries()].map(([clubId, projectedClub]) => ({
    clubId,
    fields: {
      ageGroups: projectedClub.ageGroups || [],
      competitionPaths: projectedClub.competitionPaths || [],
    },
  }))
  const entries = [...projectedByClubId.entries()].map(([clubId, projectedClub]) => {
    const masterEntry = buildClubsMasterClubProjection({ club: projectedClub })
    return {
      clubId,
      fields: {
        name: masterEntry.name,
        clubLevel: masterEntry.clubLevel,
        ageGroups: masterEntry.ageGroups || [],
        competitionPaths: masterEntry.competitionPaths || [],
        currentSeason: masterEntry.currentSeason || null,
        previousSeason: masterEntry.previousSeason || null,
      },
    }
  })
  return {
    clubProjectionPatches,
    clubsMasterPatch: { id: clean(clubsMaster.id) || 'all', entries },
  }
}

const buildCounterpartClubContexts = async ({ requests = [], patches = [] } = {}) => {
  const patchByTarget = new Map((Array.isArray(patches) ? patches : []).map(patch => [
    `${clean(patch.birthTeamDocumentId)}::${clean(patch.seasonKey)}`,
    patch,
  ]))
  const contexts = []
  const seen = new Set()

  for (const request of Array.isArray(requests) ? requests : []) {
    const candidate = await resolveRosterCounterpartCandidateV2({ request })
    if (!candidate?.teamRoot || !candidate?.teamSeason) continue
    const birthTeamDocumentId = clean(candidate.birthTeamDocumentId)
    const seasonKey = clean(candidate.seasonKey)
    const key = `${birthTeamDocumentId}::${seasonKey}`
    if (seen.has(key)) continue
    seen.add(key)
    const patch = patchByTarget.get(key)
    if (!patch) continue
    const simulatedTeamSeason = {
      ...candidate.teamSeason,
      transfersIn: clone(patch.transfersIn || []),
      transfersOut: clone(patch.transfersOut || []),
      pendingPlayers: clone(patch.pendingPlayers || []),
    }
    const counterpartTeam = {
      ...candidate.teamRoot,
      birthTeamDocumentId,
    }
    const counterpartLeagueId = clean(simulatedTeamSeason.leagueId || counterpartTeam.leagueId)
    if (!counterpartLeagueId) continue
    const counterpartLeague = await getLeagueById(counterpartLeagueId, { bypassCache: true })
    if (!counterpartLeague) continue
    const counterpartSeason = {
      ...simulatedTeamSeason,
      seasonKey,
      seasonId: clean(simulatedTeamSeason.seasonId || seasonKey),
    }
    const counterpartSeasonStatus = resolveLeagueSeasonStatus({
      league: counterpartLeague,
      season: counterpartSeason,
    })
    const counterpartProjectionTarget = counterpartSeasonStatus === 'completed'
      ? 'history'
      : 'current'
    const effectiveCounterpartSeason = {
      ...counterpartSeason,
      seasonStatus: counterpartSeasonStatus,
    }
    const counterpartPerformance = buildLeagueTeamPerformanceProjection({
      league: counterpartLeague,
      season: effectiveCounterpartSeason,
      target: counterpartProjectionTarget,
      team: counterpartTeam,
    })
    const counterpartPoints = resolveLeagueTeamPoints({
      league: counterpartLeague,
      season: effectiveCounterpartSeason,
      target: counterpartProjectionTarget,
      team: counterpartTeam,
    })
    contexts.push({
      league: counterpartLeague,
      season: effectiveCounterpartSeason,
      team: counterpartTeam,
      teamSeason: simulatedTeamSeason,
      performance: counterpartPerformance,
      points: counterpartPoints,
    })
  }
  return contexts
}

const buildCounterpartPatches = async requests => {
  const patches = []
  for (const request of Array.isArray(requests) ? requests : []) {
    const birthTeamDocumentId = clean(request.counterpartBirthTeamDocumentId || request.sourceBirthTeamDocumentId)
    const seasonKey = clean(request.counterpartSeasonKey || request.seasonKey)
    if (!birthTeamDocumentId || !seasonKey) {
      const error = new Error('Counterpart Movement target must be resolved before approval')
      error.code = 'STATS_COUNTERPART_IDENTITY_INVALID'
      throw error
    }
    const teamSeasonDocumentId = buildTeamSeasonDocumentId(birthTeamDocumentId, seasonKey)
    const snapshot = await getDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId))
    if (!snapshot.exists()) {
      patches.push({ birthTeamDocumentId, seasonKey, transfersIn: [], transfersOut: [], pendingPlayers: [] })
      continue
    }
    const current = snapshot.data() || {}
    const transfersIn = [...(Array.isArray(current.transfersIn) ? current.transfersIn : [])]
    const transfersOut = [...(Array.isArray(current.transfersOut) ? current.transfersOut : [])]
    const upsert = (rows, movement) => {
      if (!movement?.movementId) return rows
      const next = rows.filter(row => clean(row?.movementId) !== clean(movement.movementId))
      next.push(movement)
      return next
    }
    patches.push({
      birthTeamDocumentId,
      seasonKey,
      transfersIn: request.incoming ? upsert(transfersIn, request.incoming) : transfersIn,
      transfersOut: request.outgoing ? upsert(transfersOut, request.outgoing) : transfersOut,
      pendingPlayers: Array.isArray(current.pendingPlayers) ? current.pendingPlayers : [],
    })
  }
  return patches
}

export async function prepareStatsImportPlanV2({ league, season, team, teamRoot, teamSeason, incomingPlayers = [], reloadDecisions = {}, movementState = null, performance = null, points = 0, approvedAt = '' } = {}) {
  const leagueId = clean(league?.id || league?.leagueId || season?.leagueId)
  const teamId = clean(team?.birthTeamDocumentId || teamRoot?.id)
  const seasonKey = clean(season?.seasonKey || teamSeason?.seasonKey)
  if (!leagueId || !teamId || !seasonKey) throw new Error('Missing Stats V2 identity')

  const reloadDecisionState = buildStatsReloadDecisionState({ previousPlayers: teamSeason?.teamPlayers || [], incomingPlayers, decisions: reloadDecisions })
  if (!reloadDecisionState.isComplete) {
    const error = new Error('Missing Stats reload decisions')
    error.code = 'STATS_RELOAD_DECISIONS_REQUIRED'
    error.reloadDecisionState = reloadDecisionState
    throw error
  }

  const resolvedMovementState = movementState || reconcileRosterMovement({
    seasonKey,
    team,
    incomingPlayers,
    missingPlayers: [],
    currentSeason: teamSeason,
    previousSeason: null,
    rosterImport: {},
  })
  const counterpartMovementPatches = await buildCounterpartPatches(resolvedMovementState.counterpartRequests)
  const finalTeamSeason = buildFinalStatsTeamSeasonState({ canonical: { teamRoot, teamSeason, league }, season, team, incomingPlayers, reloadDecisionState, movementState: resolvedMovementState, statsLoadState: { status: 'loaded' } })
  const finalPlayers = finalTeamSeason.finalTeamSeasonPreview.teamPlayers || []
  const [playerDocumentPlans, leaguesMaster, clubsMaster, club] = await Promise.all([
    buildPlayerDocumentPlans({ players: finalPlayers, season: { ...season, seasonStatus: finalTeamSeason.seasonStatus }, team }),
    readRequired(PLAYERS_DATABASE_COLLECTIONS.leaguesMaster, 'all', 'STATS_LEAGUES_MASTER_NOT_FOUND'),
    readRequired(PLAYERS_DATABASE_COLLECTIONS.clubsMaster, 'all', 'STATS_CLUBS_MASTER_NOT_FOUND'),
    clean(team.clubId) ? readRequired(PLAYERS_DATABASE_COLLECTIONS.clubs, clean(team.clubId), 'STATS_CLUB_NOT_FOUND') : Promise.resolve(null),
  ])
  const effectiveSeason = { ...season, seasonStatus: finalTeamSeason.seasonStatus, leagueId }
  const leagueStates = buildLeagueAndMaster({ league, season: effectiveSeason, team, teamSeason: finalTeamSeason, leaguesMaster })
  const counterpartClubContexts = await buildCounterpartClubContexts({
    requests: resolvedMovementState.counterpartRequests,
    patches: counterpartMovementPatches,
  })
  const clubStates = await buildAllClubStates({
    league,
    season: effectiveSeason,
    team,
    teamSeason: finalTeamSeason,
    performance,
    points,
    clubsMaster,
    localClub: club,
    counterpartContexts: counterpartClubContexts,
  })

  return buildApprovedStatsState({
    identity: { birthTeamDocumentId: teamId, seasonKey, leagueId },
    approvedAt: approvedAt || new Date().toISOString(),
    canonical: { teamRoot, teamSeason, league },
    reloadDecisionState,
    teamSeason: finalTeamSeason,
    counterpartMovementPatches,
    playerDocumentPlans,
    playerSearchIndexStates: buildPlayerIndexStates({ players: finalPlayers, season: effectiveSeason, team }),
    teamSearchIndexPatch: buildTeamIndexPatch({ leagueId, season: effectiveSeason, team, teamSeason: finalTeamSeason, performance }),
    ...leagueStates,
    ...clubStates,
  })
}
