// src/features/playersDatabase/domain/statsV2/playerDocumentStats.projection.js

import { buildStatsPlayerDocumentScoutSnapshot } from './playerDocumentScout.projection.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const clone = value => JSON.parse(JSON.stringify(value))

export const normalizeStatsPlayerBirthYear = value => {
  if (value === null || value === undefined || value === '') return null

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export const buildStatsPlayerDocumentSeasonRow = ({
  player = {},
  season = {},
  team = {},
} = {}) => {
  const scoutSnapshot = buildStatsPlayerDocumentScoutSnapshot(player)

  return {
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
    birthYear: normalizeStatsPlayerBirthYear(
      player.birthYear ?? team.birthYear
    ),
    primaryPosition: clean(player.primaryPosition),
    positionLayer: clean(player.positionLayer),
    lineClassification: player.lineClassification || null,
    numShirt: player.numShirt ?? null,
    rosterStatus: clean(player.rosterStatus || 'regular'),
    isYoungerAgeGroup: clean(player.rosterStatus) === 'youngerAgeGroup',
    statsStatus: clean(player.statsStatus),
    playerStats: clone(player.playerStats || {}),
    ...scoutSnapshot,
    scoutProfiles: clone(scoutSnapshot.scoutProfiles),
    scoutCombinationIds: clone(scoutSnapshot.scoutCombinationIds),
  }
}

export const shouldProjectStatsPlayerDocument = ({
  player = {},
  documentExists = false,
} = {}) => (
  documentExists === true ||
  (Array.isArray(player.scoutProfiles) && player.scoutProfiles.length > 0)
)
