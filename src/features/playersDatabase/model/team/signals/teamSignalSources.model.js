// src/features/playersDatabase/model/team/signals/teamSignalSources.model.js

import { buildTeamBalanceState } from '../../../domain/orchestration/buildTeamBalanceState.js'
import { buildClubSeasonIntelligence } from '../../../domain/clubIntelligence/clubIntelligence.canonical.js'
import {
  buildTeamMovementDepartureFacts,
  hasTeamScoutingEvidence,
  resolveTeamMovementDirection,
  resolveTeamMovementLevelChange,
} from '../../../domain/signals/teamMovementSignal.js'
import { buildTeamPlayerLineClassificationEvaluation } from '../../../../../shared/scouting/teams/index.js'
import { buildTeamPageSeasonSnapshots } from '../page/teamPageSeasonSnapshots.model.js'
import { buildTeamPerformanceInsight } from './teamPerformanceInsight.model.js'
import { buildTeamSignals } from './teamSignals.model.js'

const object = value => value && typeof value === 'object' ? value : {}
const order = id => Number(String(id || '').split('_')[0]) || 0

// The registry has the read adapter's navigation shape, but every entry is
// built from canonical League/Team Season documents rather than Center facts.
export const buildTeamSignalRegistry = ({ leagues = [], teamSeasons = [] }) => {
  const registry = {}
  const ensure = (seasonId, seasonKey) => {
    if (!registry[seasonId]) registry[seasonId] = { seasonId, seasonKey, leaguesById: {}, clubsById: {} }
    return registry[seasonId]
  }
  const add = (center, clubId, teamId, entry) => {
    if (!clubId || !teamId) return
    if (!center.clubsById[clubId]) center.clubsById[clubId] = { teamsById: {} }
    const teams = center.clubsById[clubId].teamsById
    teams[teamId] = { ...teams[teamId], ...entry }
  }
  teamSeasons.forEach(season => {
    const identity = object(season.identity)
    if (!identity.seasonId) return
    add(ensure(identity.seasonId, identity.seasonKey), identity.clubId, identity.teamId, {
      birthYear: identity.birthYear, teamSlot: identity.teamSlot, leagueId: identity.leagueId,
      teamSeasonDocumentId: identity.teamSeasonDocumentId || season.id, documentExists: true,
    })
  })
  leagues.forEach(league => Object.entries(object(league.seasonsById)).forEach(([seasonId, season]) => {
    const center = ensure(seasonId, season.seasonKey)
    const leagueId = league.leagueId || league.id
    center.leaguesById[leagueId] = {
      leagueLevel: league.level, seasonStatus: season.seasonStatus,
      displayName: league.names?.display || league.names?.official || leagueId,
      ageGroupLabel: league.ageGroupLabel,
    }
    Object.entries(object(season.table?.teamsById)).forEach(([teamId, row]) => {
      add(center, row.clubId, teamId, {
        birthYear: season.birthYear, teamSlot: row.teamSlot, leagueId,
        ageGroupId: league.ageGroupId,
        performance: { ...row.performance, tableRank: row.officialTable?.rank, teamGamePlayed: row.officialTable?.teamGamePlayed },
        teamSignalSummary: row.teamSignalSummary,
      })
    })
  }))
  return registry
}

const buildSignalStructure = snapshot => {
  if (snapshot?.stats?.statsLoadState?.status !== 'loaded') return null
  const players = (snapshot.teamPlayers || []).map(player => {
    const calculation = snapshot.scouting?.playersById?.[player.playerId]?.evidence?.calculationContext
    const evaluation = buildTeamPlayerLineClassificationEvaluation({
      player,
      team: { teamGamePlayed: calculation?.teamGamePlayed },
      season: {
        seasonStatus: calculation?.seasonStatus || snapshot.seasonStatus,
        leagueTotalRound: calculation?.leagueTotalRound,
      },
    })
    return {
      ...player,
      lineClassification: evaluation.eligible === false ? null : evaluation.classification || player.lineClassification || null,
    }
  })
  const balance = buildTeamBalanceState({ seasonDocument: { ...snapshot, teamPlayers: players } })
  return {
    availability: balance.scoutInterpretation?.availability || 'unavailable',
    teamInterest: balance.scoutInterpretation?.teamInterest,
  }
}

const buildMovementSeason = (snapshot, previous, clubsById) => {
  const byId = source => new Map((source?.teamPlayers || []).map(player => [player.playerId, player]))
  const currentPlayers = byId(snapshot)
  const previousPlayers = byId(previous)
  const consecutive = previous && order(snapshot.seasonId) - order(previous.seasonId) === 1
  const rows = (snapshot.transfersOut || []).map(fact => {
    const direction = resolveTeamMovementDirection(fact, clubsById)
    const departureProfilePlayer = [currentPlayers.get(fact.playerId), consecutive ? previousPlayers.get(fact.playerId) : null]
      .find(hasTeamScoutingEvidence) || null
    return {
      playerId: fact.playerId, movementId: fact.movementId, side: 'out', direction,
      levelChange: resolveTeamMovementLevelChange(fact, direction, clubsById), departureProfilePlayer,
    }
  })
  return {
    seasonKey: snapshot.seasonKey,
    isUpcoming: ['not_started', 'upcoming'].includes(snapshot.seasonStatus || snapshot.season?.seasonStatus),
    movementDataAvailable: Array.isArray(snapshot.transfersOut) || Array.isArray(snapshot.transfersIn),
    ...buildTeamMovementDepartureFacts(rows),
  }
}

export const buildClubTeamSignalStates = ({
  clubId,
  profilesById = {},
  leagues = [],
  teamSeasons = [],
  computedAt = null,
  scope = null,
}) => {
  const registry = buildTeamSignalRegistry({ leagues, teamSeasons })
  const leaguesById = Object.fromEntries(leagues.map(league => [league.leagueId || league.id, league]))
  const clubSeasons = teamSeasons.filter(season => season.identity?.clubId === clubId)
  const seasonSources = Object.values(registry).map(center => ({
    seasonId: center.seasonId,
    center,
    teamSeasonsById: Object.fromEntries(clubSeasons.filter(season => season.identity?.seasonId === center.seasonId)
      .map(season => [season.identity.teamId, season])),
  }))
  const snapshotsByTeamId = new Map()
  const results = []
  seasonSources.forEach(source => {
    if (scope && source.seasonId !== scope.seasonId) return
    const teams = source.center.clubsById[clubId]?.teamsById || {}
    const targetTeams = Object.entries(teams).filter(([, entry]) => (
      !scope || Number(entry.birthYear) === scope.birthYear
    ))
    if (!targetTeams.length) return
    const clubIntelligence = buildClubSeasonIntelligence({
      clubId,
      profile: profilesById[clubId],
      seasonKey: source.center.seasonKey,
      sources: {
        current: source,
        leaguesById,
        history: seasonSources.filter(item => order(item.seasonId) < order(source.seasonId)),
      },
    })
    targetTeams.forEach(([teamId, entry]) => {
      if (!snapshotsByTeamId.has(teamId)) snapshotsByTeamId.set(teamId, buildTeamPageSeasonSnapshots({
        teamId, teamSeasons: clubSeasons.filter(season => season.identity?.teamId === teamId), leagueDocuments: leagues,
      }))
      const snapshots = snapshotsByTeamId.get(teamId)
      const current = snapshots.find(season => season.seasonId === source.seasonId)
      if (!current) return
      const previous = snapshots.filter(season => order(season.seasonId) < order(current.seasonId))
        .sort((a, b) => order(b.seasonId) - order(a.seasonId))[0] || null
      const team = {
        id: teamId, birthTeamId: teamId, clubId, birthYear: entry.birthYear,
        teamSlot: entry.teamSlot, birthTeamSlot: entry.teamSlot,
        league: { leagueLevel: leaguesById[entry.leagueId]?.level },
        leagueLevel: leaguesById[entry.leagueId]?.level,
      }
      const option = {
        seasonId: source.seasonId,
        target: ['not_started', 'upcoming'].includes(current.seasonStatus || current.season?.seasonStatus) ? 'future' : 'current',
      }
      const view = {
        team,
        selectedSeasonKey: current.seasonKey,
        selectedSeasonOption: option,
        performanceInsight: buildTeamPerformanceInsight({
          team, currentSeason: current, previousSeason: previous,
          selectedTeamSeason: current, selectedSeasonOption: option,
        }),
        structure: buildSignalStructure(current),
        yearDevelopment: { movementSeasons: [buildMovementSeason(current, previous, profilesById)] },
      }
      results.push({
        teamId, clubId, seasonId: source.seasonId, leagueId: entry.leagueId,
        teamSeasonDocumentId: source.teamSeasonsById[teamId]?.identity?.teamSeasonDocumentId ||
          source.teamSeasonsById[teamId]?.id || '',
        state: buildTeamSignals({ view, club: profilesById[clubId], clubIntelligence, computedAt }),
      })
    })
  })
  return results
}
