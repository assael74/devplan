// src/features/playersDatabase/ui/pages/teamPage/stats/import/logic/teamStatsPreview.model.js

import { buildStatsPlayerPreviewState } from '../../../../../../domain/stats/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const list = value => (Array.isArray(value) ? value : [])

export const resolveStatsPreviewLeagueLevel = ({ team = {}, selectedSeasonOption = {} } = {}) => {
  const candidates = [
    team?.leagueLevel,
    team?.league?.leagueLevel,
    team?.domain?.league?.leagueLevel,
    selectedSeasonOption?.season?.leagueLevel,
    selectedSeasonOption?.season?.level,
  ]
  const resolved = candidates
    .map(value => Number(value))
    .find(value => Number.isFinite(value) && value > 0)

  return resolved || null
}

const buildScoutProfiles = scouting => {
  const source = object(scouting)
  const profileDepthsById = object(source.profileDepthsById)
  const buildProfile = profileId => ({
    profileId: clean(profileId),
    profileStrength: {
      depthPct: profileDepthsById[clean(profileId)],
    },
  })
  const profiles = [
    {
      profileId: clean(source.primary?.profileId),
      profileStrength: {
        depthPct: source.primary?.strengthDepthPct,
      },
    },
    {
      profileId: clean(source.secondary?.profileId),
      profileStrength: {
        depthPct: source.secondary?.strengthDepthPct,
      },
    },
    ...list(source.professionalProfileIds).map(buildProfile),
    ...list(source.preliminaryProfileIds).map(buildProfile),
  ].filter(profile => profile.profileId)
  const seen = new Set()

  return profiles.filter(profile => {
    if (seen.has(profile.profileId)) return false
    seen.add(profile.profileId)
    return true
  })
}

const hasCompleteMovementDecision = row => {
  const decision = clean(row?.statsMovementDecision || row?.rosterStatus)
  const hasExternalPlayerId = Boolean(clean(row?.externalPlayerId))
  const hasMovementTeam = Boolean(clean(
    row?.statsMovementTeam?.birthTeamDocumentId || row?.statsMovementTeam?.teamId
  ))

  return hasExternalPlayerId && (
    decision === 'youngerAgeGroup' ||
    (['joined', 'left'].includes(decision) && hasMovementTeam)
  )
}

const getPlayerKeys = player => [
  clean(player?.playerId),
  clean(player?.externalPlayerId),
  clean(player?.originalPlayerId),
  clean(player?.fullName || player?.matchedPlayerName || player?.originalFullName).toLowerCase(),
].filter(Boolean)

const buildApprovedLookup = approvedStatsPlan => {
  const lookup = new Map()
  const teamSeason = approvedStatsPlan?.canonicalTeamSeason
  const roster = object(teamSeason?.roster?.playersById)
  const stats = object(teamSeason?.stats?.playersById)
  const scouting = object(teamSeason?.scouting?.playersById)

  Object.entries(roster).forEach(([playerId, player]) => {
    const row = {
      ...player,
      playerId,
      statsStatus: stats[playerId]?.statsStatus || '',
      playerStats: stats[playerId]?.playerStats || {},
      lineClassification: stats[playerId]?.lineClassification || null,
      scouting: scouting[playerId] || null,
    }
    getPlayerKeys(row).forEach(key => {
      if (!lookup.has(key)) lookup.set(key, row)
    })
  })
  return lookup
}

const findApprovedPlayer = (row, lookup) => {
  for (const key of getPlayerKeys(row)) {
    if (lookup.has(key)) return lookup.get(key)
  }
  return null
}

const withSeasonMinutes = ({ row, seasonMinutes }) => {
  const safeSeasonMinutes = Number(seasonMinutes)
  if (!Number.isFinite(safeSeasonMinutes) || safeSeasonMinutes <= 0) return row
  return {
    ...row,
    scoutCalculationContract: {
      ...(row?.scoutCalculationContract || {}),
      seasonMinutes: safeSeasonMinutes,
    },
  }
}

const withCalculatedPreview = ({ row, previewContext, seasonMinutes }) => {
  const calculated = previewContext
    ? buildStatsPlayerPreviewState({
      player: row,
      teamSeason: previewContext.teamSeason,
      leagueContext: previewContext.leagueContext,
      leagueLevel: previewContext.leagueLevel,
      leagueTotalRound: previewContext.leagueTotalRound,
    })
    : null
  const scouting = object(calculated?.scouting)
  const previewRow = calculated
    ? {
      ...row,
      lineClassification: calculated.lineClassification,
      primaryPosition: clean(scouting.primaryPosition || row.primaryPosition),
      positionLayer: clean(scouting.positionLayer || row.positionLayer),
      scoutProfiles: buildScoutProfiles(scouting),
      scoutCombinations: list(scouting.combinationIds),
      scoutProfileDisplay: {
        label: clean(scouting.primary?.profileId),
        profileStrength: {
          depthPct: scouting.primary?.strengthDepthPct,
        },
      },
      scoutSeasonProjection: scouting,
    }
    : row

  return withSeasonMinutes({ row: previewRow, seasonMinutes })
}

export const snapshotStatsPreviewProfiles = row => (
  (Array.isArray(row?.scoutProfiles) ? row.scoutProfiles : [])
    .map(profile => ({
      profileId: clean(profile?.profileId || profile?.id),
      label: clean(profile?.label || profile?.profileLabel),
    }))
    .filter(profile => profile.profileId)
)

export const buildStatsPreviewModel = ({
  rows = [],
  approvedStatsPlan = null,
  seasonMinutes = null,
  previewContext = null,
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  if (!approvedStatsPlan) {
    return safeRows.map(row => withCalculatedPreview({
      row,
      previewContext,
      seasonMinutes,
    }))
  }
  const lookup = buildApprovedLookup(approvedStatsPlan)

  return safeRows.map(row => {
    const approved = findApprovedPlayer(row, lookup)
    if (!approved) return withSeasonMinutes({ row, seasonMinutes })
    return withSeasonMinutes({
      seasonMinutes,
      row: {
        ...row,
        statsStatus: approved.statsStatus,
        playerStats: approved.playerStats,
        lineClassification: approved.lineClassification,
        primaryPosition: clean(approved.scouting?.primaryPosition || row.primaryPosition),
        positionLayer: clean(approved.scouting?.positionLayer || row.positionLayer),
        scoutProfiles: buildScoutProfiles(approved.scouting),
        scoutCombinations: list(approved.scouting?.combinationIds),
        scoutProfileDisplay: {
          label: clean(approved.scouting?.primary?.profileId),
          profileStrength: {
            depthPct: approved.scouting?.primary?.strengthDepthPct,
          },
        },
        scoutSeasonProjection: approved.scouting,
      },
    })
  })
}

export const buildStatsMovementPreviewModel = ({ rows = [] } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const nonRosterRows = safeRows.filter(row => clean(row.identityStatus) !== 'roster_match')
  const unresolvedRows = nonRosterRows.filter(row => !hasCompleteMovementDecision(row))
  return {
    existingIncomingCount: 0,
    newPlayerCount: nonRosterRows.filter(row => clean(row.identityStatus) === 'new_player').length,
    decisionRequiredCount: unresolvedRows.length,
    leftCount: safeRows.filter(row => clean(row.rosterStatus) === 'left').length,
    joinedCount: safeRows.filter(row => clean(row.rosterStatus) === 'joined').length,
    youngerAgeGroupCount: safeRows.filter(row => clean(row.rosterStatus) === 'youngerAgeGroup').length,
    requiresDecision: unresolvedRows.length > 0,
  }
}
