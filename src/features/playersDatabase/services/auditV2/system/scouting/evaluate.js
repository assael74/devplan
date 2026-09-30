// src/features/playersDatabase/services/auditV2/system/scouting/evaluate.js

import { buildStatsScoutedPlayer } from '../../../../domain/statsV2/teamSeasonStats.builder.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
} from '../../../../domain/projections/teamPerformance.projection.js'
import { buildLeagueTeamSeasons } from '../../../../domain/orchestration/buildLeagueTeamSeasons.js'
import { isCurrentRosterPlayer } from '../../../../model/team/rosterStatus.model.js'
import { isSameSeason } from '../../../../model/shared/season.model.js'
import {
  SCOUTING_INTEGRITY_V2_FINDING,
  SCOUTING_INTEGRITY_V2_RESULT,
} from './contract.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const cleanList = values => [
  ...new Set((Array.isArray(values) ? values : []).map(clean).filter(Boolean)),
].sort()

const nullableNumber = value => (
  value === undefined || value === null || value === '' || !Number.isFinite(Number(value))
    ? null
    : Number(value)
)

const compactScoutState = player => ({
  primaryScoutProfileId: clean(player?.primaryScoutProfileId),
  primaryScoutProfileStrengthDepthPct: nullableNumber(
    player?.primaryScoutProfileStrengthDepthPct
  ),
  professionalScoutProfileIds: cleanList(player?.professionalScoutProfileIds),
  preliminaryScoutProfileIds: cleanList(player?.preliminaryScoutProfileIds),
  scoutEffectiveImmediacyStatus: clean(player?.scoutEffectiveImmediacyStatus),
  scoutPlayerInterestLevel: clean(player?.scoutPlayerInterestLevel),
  scoutEngineVersion: clean(player?.scoutEngineVersion),
})

const sameCompactScoutState = (left, right) => (
  JSON.stringify(compactScoutState(left)) === JSON.stringify(compactScoutState(right))
)

const resolveLeagueSeason = ({ league = {}, season = {} } = {}) => {
  const status = resolveLeagueSeasonStatus({ league, season })
  if (status === 'active') {
    const current = league?.current || null
    return current && isSameSeason(current, season)
      ? { season: current, status, target: 'current' }
      : null
  }

  if (status === 'completed') {
    const row = (Array.isArray(league?.history) ? league.history : [])
      .find(item => isSameSeason(item, season)) || null
    return row ? { season: row, status, target: 'history' } : null
  }

  return null
}

const resolveCanonicalTeamScout = ({ league = {}, leagueSeason = {}, target = '', team = {} } = {}) => {
  const teamId = clean(
    team?.birthTeamDocumentId || team?.teamDocumentId || team?.teamId || team?.id
  )
  const matches = buildLeagueTeamSeasons({
    leagueDocument: league,
    seasonDocument: leagueSeason,
    target,
  }).filter(item => {
    const identity = item?.identity || {}
    return [
      identity.teamId,
      identity.teamDocumentId,
      identity.birthTeamId,
      identity.birthTeamDocumentId,
    ].map(clean).includes(teamId)
  })

  return matches.length === 1 ? matches[0]?.performance || null : null
}

const buildCanonicalScoutContext = ({ canonical = {} } = {}) => {
  const teamRoot = canonical?.teamRoot || {}
  const teamSeason = canonical?.teamSeason || {}
  const league = canonical?.league || {}
  const seasonKey = clean(canonical?.seasonKey || teamSeason?.seasonKey || teamSeason?.seasonId)
  const seasonBase = {
    seasonId: clean(teamSeason?.seasonId || seasonKey),
    seasonKey,
  }
  const leagueSource = resolveLeagueSeason({ league, season: seasonBase })

  if (!leagueSource) {
    const error = new Error('Scouting Integrity requires a canonical League season')
    error.code = 'SCOUTING_INTEGRITY_LEAGUE_SEASON_NOT_FOUND'
    throw error
  }

  const canonicalClub = canonical?.club || {}
  const canonicalAgeGroupId = clean(
    leagueSource.season?.ageGroupId ||
    league?.ageGroupId ||
    teamSeason?.ageGroupId ||
    teamRoot?.ageGroupId
  )
  const canonicalLeagueLevel = (
    leagueSource.season?.leagueLevel ??
    league?.level ??
    teamSeason?.leagueLevel ??
    null
  )
  const teamIdentity = {
    ...teamRoot,
    birthTeamDocumentId: clean(
      canonical?.birthTeamDocumentId || teamRoot?.birthTeamDocumentId || teamRoot?.id
    ),
    teamDocumentId: clean(teamRoot?.teamDocumentId || teamRoot?.id),
    clubId: clean(teamRoot?.clubId || canonicalClub?.clubId || canonicalClub?.id),
    clubName: clean(canonicalClub?.name || teamRoot?.clubName),
    clubLevel: canonicalClub?.clubLevel ?? teamRoot?.clubLevel ?? null,
    clubStrengthLevel: canonicalClub?.clubStrengthLevel ?? teamRoot?.clubStrengthLevel ?? null,
    ageGroupId: canonicalAgeGroupId,
    leagueLevel: canonicalLeagueLevel,
  }
  const season = {
    ...leagueSource.season,
    seasonId: clean(leagueSource.season?.seasonId || seasonBase.seasonId),
    seasonKey,
    seasonStatus: leagueSource.status,
    ageGroupId: canonicalAgeGroupId,
    leagueLevel: canonicalLeagueLevel,
  }
  const performance = buildLeagueTeamPerformanceProjection({
    league,
    season,
    target: leagueSource.target,
    team: teamIdentity,
  })

  if (!performance) {
    const error = new Error('Scouting Integrity could not resolve canonical Team Performance from League')
    error.code = 'SCOUTING_INTEGRITY_TEAM_PERFORMANCE_NOT_FOUND'
    throw error
  }

  const teamScout = resolveCanonicalTeamScout({
    league,
    leagueSeason: leagueSource.season,
    target: leagueSource.target,
    team: teamIdentity,
  })

  if (!teamScout) {
    const error = new Error('Scouting Integrity could not resolve canonical Team Scout from League')
    error.code = 'SCOUTING_INTEGRITY_TEAM_SCOUT_NOT_FOUND'
    throw error
  }

  return {
    birthTeamDocumentId: teamIdentity.birthTeamDocumentId,
    seasonKey,
    season,
    team: {
      ...teamIdentity,
      tableRank: performance.tableRank,
      tableAttackRank: performance.tableAttackRank,
      tableDefenseRank: performance.tableDefenseRank,
      teamGamePlayed: performance.teamGamePlayed,
      goalsFor: performance.goalsFor,
      goalsAgainst: performance.goalsAgainst,
      goalsForPerGame: performance.goalsForPerGame,
      goalsAgainstPerGame: performance.goalsAgainstPerGame,
      performance: teamScout,
      offense: teamScout.offense,
      defense: teamScout.defense,
      teamAttackPerformance: teamScout.offense,
      teamDefensePerformance: teamScout.defense,
    },
  }
}

const playerIdentity = player => ({
  playerDocumentId: clean(player?.playerDocumentId),
  playerId: clean(player?.playerId),
  externalPlayerId: clean(player?.externalPlayerId),
  playerDisplayName: clean(
    player?.fullName || player?.matchedPlayerName || player?.displayName
  ),
})

export function evaluateScoutingIntegrityV2({ canonical = {} } = {}) {
  const teamSeason = canonical?.teamSeason || {}
  const context = buildCanonicalScoutContext({ canonical })
  const players = Array.isArray(teamSeason?.teamPlayers) ? teamSeason.teamPlayers : []
  const findings = []
  let checkedPlayers = 0
  let skippedPlayers = 0

  players.forEach(player => {
    const hasLoadedStats = clean(player?.statsStatus) === 'loaded'
    if (!hasLoadedStats || !isCurrentRosterPlayer(player)) {
      skippedPlayers += 1
      return
    }

    checkedPlayers += 1
    const expected = buildStatsScoutedPlayer({
      player,
      team: context.team,
      season: context.season,
    })

    if (sameCompactScoutState(player, expected)) return

    findings.push({
      code: SCOUTING_INTEGRITY_V2_FINDING.PLAYER_SCOUT_MISMATCH,
      title: 'חישוב הסקאוט של השחקן אינו תואם למצב השמור',
      reason: 'מצב הסקאוט הקומפקטי בעונת הקבוצה שונה מחישוב מחדש באמצעות מנוע הסקאוט הנוכחי ומצב הליגה הקנוני.',
      target: {
        entityType: 'teamSeasonPlayer',
        birthTeamDocumentId: context.birthTeamDocumentId,
        teamSeasonDocumentId: clean(teamSeason?.id),
        seasonKey: context.seasonKey,
        ...playerIdentity(player),
      },
      expected: compactScoutState(expected),
      actual: compactScoutState(player),
    })
  })

  return {
    auditType: 'scouting_integrity',
    birthTeamDocumentId: context.birthTeamDocumentId,
    leagueId: clean(canonical?.leagueId || teamSeason?.leagueId || canonical?.teamRoot?.leagueId),
    seasonKey: context.seasonKey,
    result: findings.length
      ? SCOUTING_INTEGRITY_V2_RESULT.FINDINGS
      : SCOUTING_INTEGRITY_V2_RESULT.CLEAN,
    findings,
    summary: {
      rosterPlayers: players.length,
      checkedPlayers,
      skippedPlayers,
      findingsCount: findings.length,
    },
  }
}
