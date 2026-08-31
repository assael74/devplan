import { syncPlayerScoutProfileDocsMany } from '../write/players/index.js'
import { updatePlayerSeasonSearchIndexStatsMany, updateTeamSeasonSearchIndexScoutProfilesSummary } from '../write/searchIndex/index.js'
import { updateTeamSeasonPlayersScoutProjections } from '../write/teams/index.js'
import { updateLeagueSeasonTableRankTeamSyncMeta } from '../write/leagues/index.js'
import { buildTeamLoadStatus } from '../../model/teamLoadStatus.model.js'
import { buildTeamDisplayName } from '../../catalog/teamDisplay.js'
import { resolveAgeGroupLabel } from '../../catalog/ageGroups.catalog.js'
import { buildScoutProfilesSummary } from '../write/flows/shared.js'
import { buildLeagueTeamPerformanceProjection } from '../write/shared/teamPerformanceProjection.js'
import { shouldHavePlayerDocument } from '../write/players/scoutingPlayerLifecycle.model.js'
import { AUDIT_FINDING_TYPE } from './audit.contract.js'
import { readPlayerDatabaseAuditSnapshot } from './audit.read.js'

const clean = value => String(value ?? '').trim()
const seasonKeyOf = row => clean(row?.seasonKey || row?.seasonId)
const teamIdOf = row => clean(row?.birthTeamDocumentId || row?.teamDocumentId)
const playerKeyOf = player => clean(player?.playerDocumentId || player?.playerId || player?.externalPlayerId)
const repairTarget = season => clean(season?.seasonStatus) === 'completed' ? 'history' : 'current'

const buildRepairGroups = ({ findings = [], snapshot }) => {
  const { leagues, teams, teamSeasons, players, searchIndexes } = snapshot.rows
  const playerDocumentIds = new Set(players.map(row => row.id))
  const rootsById = new Map(teams.map(row => [row.id, row.data]))
  const groups = new Map()

  findings
    .filter(finding => (
      finding?.type === AUDIT_FINDING_TYPE.MISSING_DOCUMENT &&
      finding?.entityType === 'player' &&
      clean(finding?.playerDocumentId)
    ))
    .forEach(finding => {
      const teamId = clean(finding.teamDocumentId)
      const seasonKey = clean(finding.seasonKey)
      const playerDocumentId = clean(finding.playerDocumentId)
      const seasonRow = teamSeasons.find(row => (
        teamIdOf(row.data) === teamId && seasonKeyOf(row.data) === seasonKey
      ))
      if (!seasonRow || playerDocumentIds.has(playerDocumentId)) return

      const player = (seasonRow.data.teamPlayers || []).find(row => (
        playerKeyOf(row) === playerDocumentId
      ))
      if (!player || !shouldHavePlayerDocument(player)) return

      const leagueRow = leagues.find(row => clean(row.data.leagueId || row.id) === clean(seasonRow.data.leagueId))
      const leagueSeason = [leagueRow?.data?.current, ...(leagueRow?.data?.history || [])]
        .find(row => seasonKeyOf(row) === seasonKey)
      if (!leagueRow || !leagueSeason) return
      const teamIndex = searchIndexes.find(row => (
        row.data?.entityType === 'birthTeamSeason' &&
        teamIdOf(row.data) === teamId &&
        seasonKeyOf(row.data) === seasonKey
      ))?.data || {}

      const groupKey = [clean(leagueRow.data.leagueId || leagueRow.id), seasonKey, teamId].join('::')
      const existing = groups.get(groupKey) || {
        league: { ...leagueRow.data, id: clean(leagueRow.data.id || leagueRow.id) },
        season: leagueSeason,
        team: { ...(rootsById.get(teamId) || {}), ...seasonRow.data, birthTeamDocumentId: teamId, teamDocumentId: teamId },
        teamIndex,
        teamSeasonDocument: seasonRow.data,
        teamSeasonDocumentId: seasonRow.id,
        players: [],
      }
      existing.players.push(player)
      groups.set(groupKey, existing)
    })

  return [...groups.values()]
}

const mergeScoutedPlayers = ({ players = [], scoutedPlayers = [] }) => {
  const scoutedByKey = new Map(scoutedPlayers.map(player => [playerKeyOf(player), player]).filter(([key]) => key))
  return players.map(player => ({ ...player, ...(scoutedByKey.get(playerKeyOf(player)) || {}) }))
}

export const summarizePlayerDocumentRepair = ({ findings = [], snapshot }) => {
  const groups = buildRepairGroups({ findings, snapshot })
  return {
    groups: groups.map(group => ({
      leagueId: clean(group.league.id || group.league.leagueId),
      leagueName: clean(group.league.name || group.league.leagueName || group.league.title),
      seasonKey: seasonKeyOf(group.season),
      ageGroup: resolveAgeGroupLabel({
        ageGroupId: group.teamIndex.ageGroupId || group.season.ageGroupId || group.team.ageGroupId,
        ageGroupLabel: group.teamIndex.ageGroupLabel || group.season.ageGroupLabel || group.team.ageGroupLabel,
      }),
      teamDocumentId: teamIdOf(group.team),
      teamName: clean(group.teamIndex.displayName) || buildTeamDisplayName({
        clubName: group.team.clubName,
        clubId: group.teamIndex.clubId || group.team.clubId,
        teamId: teamIdOf(group.team),
        teamSlot: group.teamIndex.birthTeamSlot || group.team.birthTeamSlot || group.team.teamSlot,
      }) || clean(group.team.teamName || group.team.name || group.team.displayName),
      teamSlot: clean(group.teamIndex.birthTeamSlot || group.team.birthTeamSlot || group.team.teamSlot || '1'),
      birthYear: clean(group.teamIndex.birthYear || group.team.birthYear || group.season.birthYear),
      playersCount: group.players.length,
      players: group.players.map(player => ({
        playerDocumentId: playerKeyOf(player),
        fullName: clean(player.fullName || player.matchedPlayerName || player.displayName),
      })),
    })),
    groupsCount: groups.length,
    playersCount: groups.reduce((count, group) => count + group.players.length, 0),
  }
}

export async function previewMissingPlayerDocumentRepair({ findings = [] } = {}) {
  const snapshot = await readPlayerDatabaseAuditSnapshot()
  return summarizePlayerDocumentRepair({ findings, snapshot })
}

export async function repairMissingPlayerDocuments({ findings = [] } = {}) {
  const snapshot = await readPlayerDatabaseAuditSnapshot()
  const groups = buildRepairGroups({ findings, snapshot })
  const results = []

  for (const group of groups) {
    const target = repairTarget(group.season)
    const playerDocs = await syncPlayerScoutProfileDocsMany({
      season: group.season,
      team: group.team,
      target,
      players: group.players,
      teamSeasonDocument: group.teamSeasonDocument,
    })
    if (playerDocs.failedCount) throw new Error('יצירת מסמכי שחקן נכשלה בחלקה')

    const teamProjection = await updateTeamSeasonPlayersScoutProjections({
      season: group.season,
      team: group.team,
      scoutedPlayers: playerDocs.scoutedPlayers,
    })
    if (!teamProjection?.updated) throw new Error('עדכון נתוני הקבוצה נכשל')

    const allPlayers = Array.isArray(teamProjection.players)
      ? teamProjection.players
      : group.teamSeasonDocument.teamPlayers || []
    const repairedPlayers = mergeScoutedPlayers({
      players: group.players,
      scoutedPlayers: playerDocs.scoutedPlayers,
    })
    const teamWithLoadStatus = { ...group.team, ...buildTeamLoadStatus(allPlayers) }
    const teamPerformance = buildLeagueTeamPerformanceProjection({
      league: group.league,
      season: group.season,
      target,
      team: group.team,
    })

    await updatePlayerSeasonSearchIndexStatsMany({
      league: group.league,
      season: group.season,
      team: teamWithLoadStatus,
      target,
      players: repairedPlayers,
    })

    const scoutProfilesSummary = teamProjection.scoutProfilesSummary || buildScoutProfilesSummary(allPlayers)
    await updateLeagueSeasonTableRankTeamSyncMeta({
      league: group.league,
      season: group.season,
      team: teamWithLoadStatus,
      scoutProfilesSummary,
    })
    await updateTeamSeasonSearchIndexScoutProfilesSummary({
      league: group.league,
      season: group.season,
      team: group.team,
      target,
      teamSeasonDocumentId: group.teamSeasonDocumentId,
      playersCount: allPlayers.length,
      scoutProfilesSummary,
      teamBalance: group.teamSeasonDocument.teamBalance,
      teamPerformance,
    })
    results.push({
      leagueId: clean(group.league.id || group.league.leagueId),
      seasonKey: seasonKeyOf(group.season),
      teamDocumentId: teamIdOf(group.team),
      repairedPlayersCount: playerDocs.createdCount,
    })
  }

  return {
    groupsCount: results.length,
    playersCount: results.reduce((count, result) => count + result.repairedPlayersCount, 0),
    results,
  }
}
