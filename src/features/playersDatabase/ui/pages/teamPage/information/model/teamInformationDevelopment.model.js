// src/features/playersDatabase/ui/pages/teamPage/information/model/teamInformationDevelopment.model.js
import { calculateSuccessPercent, clean, numberOrNull, withFallback } from '../../model/teamInformation.utils.js'
import { countCurrentRosterPlayers } from '../../../../../model/team/rosterStatus.model.js'
import { buildTeamDisplayName } from '../../../../../catalog/teamDisplay.js'
import { resolveMovementDirection } from '../../../../../domain/movement/index.js'
import { buildPositionClassificationRows } from '../../positionClassification/model/teamPositionClassificationRows.model.js'
import {
  buildScoutProfileGroupCounts,
  resolveActiveProfessionalProfileIds,
} from '../../../../../model/scout/scoutProfilesSummary.model.js'
import { SCOUT_PROFILE_IDENTITY } from '../../../../../../../shared/scouting/players/ids.js'
import { resolveScoutProfileIdentity } from '../../../../../../../shared/scouting/players/profiles.js'

const seasonOrder = season => {
  const match = clean(season?.seasonKey || season?.seasonId).match(/^(\d{2})[/_-](\d{2})$/)
  return match ? Number(match[1]) : 0
}

const buildAllDevelopmentSeasons = ({ teamSeasons = [], seasonOptions = [] } = {}) => {
  const optionsByKey = new Map(
    (Array.isArray(seasonOptions) ? seasonOptions : []).map(option => [
      clean(option?.seasonKey),
      option,
    ]).filter(([seasonKey]) => seasonKey)
  )
  const seasonsByKey = new Map()
  const addSeason = (source, option = null) => {
    const seasonKey = clean(source?.seasonKey || source?.seasonId || option?.seasonKey)
    if (!seasonKey) return

    const existing = seasonsByKey.get(seasonKey) || {}
    const resolvedOption = option || optionsByKey.get(seasonKey) || null
    seasonsByKey.set(seasonKey, {
      ...existing,
      ...source,
      seasonKey,
      leagueName: source?.leagueName || existing.leagueName || resolvedOption?.leagueName || '',
      ageGroupLabel: source?.ageGroupLabel || existing.ageGroupLabel || resolvedOption?.ageGroupLabel || '',
      leagueLevel: source?.leagueLevel || existing.leagueLevel || resolvedOption?.leagueLevel || null,
      isCurrent: resolvedOption?.target === 'current',
      isUpcoming: resolvedOption?.target === 'future',
    })
  }

  ;(Array.isArray(teamSeasons) ? teamSeasons : []).filter(Boolean).forEach(season => addSeason(season))
  ;(Array.isArray(seasonOptions) ? seasonOptions : [])
    .filter(option => option?.target === 'future')
    .forEach(option => addSeason(option.season || option, option))

  return Array.from(seasonsByKey.values())
    .sort((left, right) => seasonOrder(right) - seasonOrder(left))
}

const seasonSummaryMeta = season => ({
  seasonKey: clean(season?.seasonKey || season?.seasonId),
  leagueName: clean(season?.leagueName || season?.league?.leagueName || season?.league?.name),
  leagueLevel: numberOrNull(season?.leagueLevel || season?.league?.leagueLevel),
  ageGroupLabel: clean(season?.ageGroupLabel || season?.ageGroup?.label),
})

const largestProfessionalProfileChange = (timeline, selectedSeasonKey) => {
  const currentIndex = timeline.findIndex(season => season?.seasonKey === clean(selectedSeasonKey))
  const current = timeline[currentIndex]
  const previous = timeline[currentIndex + 1]
  if (!current || !previous || current.total === null || previous.total === null ||
    !current.groupCounts || !previous.groupCounts) return null

  const counts = season => new Map(
    (season.profileGroups.find(group => group.key === 'professional')?.profiles || [])
      .map(profile => [profile.profileId, profile.count])
  )
  const currentCounts = counts(current)
  const previousCounts = counts(previous)
  const profileIds = new Set([...currentCounts.keys(), ...previousCounts.keys()])
  const changes = [...profileIds].map(profileId => {
    const currentCount = currentCounts.get(profileId) || 0
    const previousCount = previousCounts.get(profileId) || 0
    return {
      profileId,
      current: currentCount,
      previous: previousCount,
      delta: currentCount - previousCount,
      seasonKey: current.seasonKey,
    }
  }).filter(change => Math.abs(change.delta) >= 3)
    .sort((left, right) => (
      Math.abs(right.delta) - Math.abs(left.delta) ||
      right.delta - left.delta ||
      left.profileId.localeCompare(right.profileId)
    ))

  return changes[0] || null
}

export const findPreviousSeason = ({ teamSeasons, selectedSeasonKey }) => {
  const rows = (Array.isArray(teamSeasons) ? teamSeasons : [])
    .filter(Boolean)
    .sort((left, right) => seasonOrder(right) - seasonOrder(left))
  const index = rows.findIndex(row => clean(row.seasonKey || row.seasonId) === clean(selectedSeasonKey))
  return index >= 0 && index < rows.length - 1 ? rows[index + 1] : null
}

export const buildSeasonTimeline = ({ team = {}, teamSeasons = [], selectedSeasonKey = '', selectedSeasonOption = null } = {}) => {
  const selectedKey = clean(selectedSeasonKey)
  const selectedOrder = seasonOrder({ seasonKey: selectedKey })
  const rows = (Array.isArray(teamSeasons) ? teamSeasons : []).filter(Boolean)
  const selectedSeason = rows.find(row => clean(row.seasonKey || row.seasonId) === selectedKey) || null
  const previousSeasons = rows
    .filter(row => seasonOrder(row) < selectedOrder)
    .sort((left, right) => seasonOrder(right) - seasonOrder(left))
    .slice(0, 2)
  const toEntry = (season, isSelected = false) => ({
    seasonKey: clean(season?.seasonKey || season?.seasonId || selectedKey),
    tableRank: isSelected
      ? withFallback(numberOrNull(season?.tableRank), numberOrNull(team?.tableRank))
      : numberOrNull(season?.tableRank),
    status: isSelected && selectedSeasonOption?.target === 'future' ? 'upcoming' : 'available',
  })

  return [
    toEntry(selectedSeason || { seasonKey: selectedKey }, true),
    ...previousSeasons.map(season => toEntry(season)),
  ].filter(entry => entry.seasonKey)
}

export const buildDevelopmentTimeline = ({
  team = {},
  teamSeasons = [],
  seasonOptions = [],
  selectedTeamSeason = null,
  selectedSeasonKey = '',
} = {}) => {
  const rows = buildAllDevelopmentSeasons({ teamSeasons, seasonOptions })
  const metric = (season, key) => withFallback(
    numberOrNull(season?.[key]),
    season.isCurrent ? numberOrNull(team?.[key]) : null
  )
  const toEntry = season => {
    const selectedProfileSource = season.seasonKey === clean(selectedSeasonKey) &&
      numberOrNull(selectedTeamSeason?.scoutProfilesSummary?.total) !== null &&
      Array.isArray(selectedTeamSeason?.teamPlayers)
    const profileSource = selectedProfileSource ? selectedTeamSeason : season
    const profileCounts = numberOrNull(profileSource?.scoutProfilesSummary?.total) !== null &&
      Array.isArray(profileSource?.teamPlayers)
      ? buildScoutProfileGroupCounts(profileSource.teamPlayers)
      : null
    const games = withFallback(metric(season, 'games'), numberOrNull(season?.teamStats?.teamGamePlayed))
    const points = withFallback(
      numberOrNull(season?.teamStats?.points),
      season.isCurrent ? numberOrNull(team?.points) : null
    )
    return {
      ...seasonSummaryMeta(season),
      isCurrent: Boolean(season.isCurrent),
      status: season.isUpcoming ? 'upcoming' : 'available',
      tableRank: metric(season, 'tableRank'),
      games,
      successPercent: season.isUpcoming ? null : calculateSuccessPercent(points, games),
      goalsForPerGame: metric(season, 'goalsForPerGame'),
      goalsAgainstPerGame: metric(season, 'goalsAgainstPerGame'),
      professionalProfiles: profileCounts ? profileCounts.professional : null,
      underuseProfiles: profileCounts ? profileCounts.underuse : null,
    }
  }

  return rows.map(toEntry).filter(entry => entry.seasonKey)
}

export const buildYearDevelopmentOverview = ({
  team = {},
  teamSeasons = [],
  seasonOptions = [],
  clubsDirectory = null,
  selectedSeasonKey = '',
} = {}) => {
  const seasons = buildAllDevelopmentSeasons({ teamSeasons, seasonOptions })
  const clubsById = clubsDirectory?.clubsById || {}

  const seasonKey = season => clean(season.seasonKey || season.seasonId)
  const seasonOptionByKey = new Map(
    (Array.isArray(seasonOptions) ? seasonOptions : []).map(option => [clean(option?.seasonKey), option])
  )
  const countPlayers = season => withFallback(
    numberOrNull(season?.playersCount),
    Array.isArray(season?.teamPlayers) ? countCurrentRosterPlayers(season.teamPlayers) : null
  )
  const profilesCount = season => numberOrNull(season?.scoutProfilesSummary?.total)
  const buildLineDistribution = season => {
    const structure = season?.teamBalance?.lineStructure
    if (!structure || typeof structure !== 'object') return null

    const lines = structure.lines || {}
    const unclassified = numberOrNull(structure.unclassifiedSufficientSamplePlayersCount) || 0
    const insufficientSample = numberOrNull(structure.insufficientSamplePlayersCount) || 0
    const categories = [
      ['goalkeeper', 'שוער', numberOrNull(structure.goalkeeperPlayersCount) || 0],
      ['defense', 'הגנה', numberOrNull(lines.defense?.playersCount) || 0],
      ['midfield', 'קישור', numberOrNull(lines.midfield?.playersCount) || 0],
      ['attack', 'התקפה', numberOrNull(lines.attack?.playersCount) || 0],
    ]

    if (unclassified || insufficientSample) {
      categories.push(['unclassified', 'לא מסווגים / מדגם חסר', unclassified + insufficientSample])
    }

    return {
      ...seasonSummaryMeta(season),
      isCurrent: season.isCurrent,
      total: numberOrNull(structure.relevantPlayersCount),
      categories: categories.map(([key, label, count]) => ({ key, label, count })),
    }
  }
  const buildProfileDistribution = season => {
    const summary = season?.scoutProfilesSummary
    if (!summary || typeof summary !== 'object') return null

    const profileCounts = summary.profileCounts && typeof summary.profileCounts === 'object'
      ? summary.profileCounts
      : {}
    const profiles = Object.entries(profileCounts)
      .map(([profileId, count]) => ({ profileId, count: numberOrNull(count) || 0 }))
      .filter(profile => profile.profileId && profile.count > 0)
      .sort((left, right) => right.count - left.count || left.profileId.localeCompare(right.profileId))
    const profileGroups = [
      { key: 'professional', label: 'פרופילים מקצועיים', identity: SCOUT_PROFILE_IDENTITY.CORE },
      { key: 'underuse', label: 'פרופילים ללא שימוש', identity: SCOUT_PROFILE_IDENTITY.OPPORTUNITY },
    ].map(group => ({
      key: group.key,
      label: group.label,
      profiles: profiles.filter(profile => resolveScoutProfileIdentity(profile.profileId) === group.identity),
    }))
    const otherProfiles = profiles.filter(profile => ![
      SCOUT_PROFILE_IDENTITY.CORE,
      SCOUT_PROFILE_IDENTITY.OPPORTUNITY,
    ].includes(resolveScoutProfileIdentity(profile.profileId)))
    if (otherProfiles.length) {
      profileGroups.push({ key: 'other', label: 'פרופילים נוספים', profiles: otherProfiles })
    }

    return {
      ...seasonSummaryMeta(season),
      isCurrent: season.isCurrent,
      total: numberOrNull(summary.total),
      profiles,
      profileGroups,
      groupCounts: Array.isArray(season?.teamPlayers)
        ? buildScoutProfileGroupCounts(season.teamPlayers)
        : null,
    }
  }
  const profileTimeline = seasons.map(buildProfileDistribution)
  const profileChange = largestProfessionalProfileChange(profileTimeline, selectedSeasonKey)
  const playerById = new Map()
  seasons.forEach(season => {
    ;(Array.isArray(season?.teamPlayers) ? season.teamPlayers : []).forEach(player => {
      const playerId = clean(player?.playerId)
      if (playerId && !playerById.has(playerId)) playerById.set(playerId, player)
    })
  })
  const resolveMovementPlayer = (fact, season, previousSeason, side) => {
    const playerId = clean(fact?.playerId)
    const fromSeason = source => (Array.isArray(source?.teamPlayers) ? source.teamPlayers : [])
      .find(player => clean(player?.playerId) === playerId)
    const current = fromSeason(season)
    if (current) return current
    if (side === 'out') return fromSeason(previousSeason) || playerById.get(playerId) || {}
    return playerById.get(playerId) || {}
  }
  const teamSlotFromId = value => {
    const match = clean(value).match(/_([1-9]\d*)$/)
    return match ? Number(match[1]) : null
  }
  const resolveFactDirection = fact => {
    const storedDirection = clean(fact?.levelDirection || fact?.direction) || 'unknown'
    if (storedDirection !== 'unknown') return storedDirection

    const fromClubId = clean(fact?.fromClubId)
    const toClubId = clean(fact?.toClubId)
    if (!fromClubId || !toClubId || fromClubId === toClubId) return storedDirection

    const fromLevel = numberOrNull(clubsById[fromClubId]?.clubLevel)
    const toLevel = numberOrNull(clubsById[toClubId]?.clubLevel)
    const fromSlot = teamSlotFromId(fact?.fromTeamId || fact?.fromBirthTeamDocumentId)
    const toSlot = teamSlotFromId(fact?.toTeamId || fact?.toBirthTeamDocumentId)
    if (!fromSlot || fromLevel === null || fromLevel <= 1 || toLevel !== 1 || toSlot !== 2) {
      return storedDirection
    }

    return resolveMovementDirection({
      fromClubId,
      toClubId,
      fromClubLevel: fromLevel,
      toClubLevel: toLevel,
      fromBirthTeamSlot: fromSlot,
      toBirthTeamSlot: toSlot,
    })
  }
  const resolveLevelChange = (fact, direction) => {
    const fromClubId = clean(fact?.fromClubId)
    const toClubId = clean(fact?.toClubId)
    if (!fromClubId || !toClubId || fromClubId === toClubId || direction === 'unknown') return null

    const fromLevel = numberOrNull(clubsById[fromClubId]?.clubLevel)
    const toLevel = numberOrNull(clubsById[toClubId]?.clubLevel)
    if (fromLevel === null || toLevel === null || fromLevel <= 0 || toLevel <= 0) return null

    const change = fromLevel - toLevel
    if ((change > 0 && direction !== 'up') ||
      (change < 0 && direction !== 'down') ||
      (change === 0 && direction !== 'lateral')) return null

    return Math.abs(change)
  }
  const hasScoutingEvidence = player => {
    if (!player) return false
    if (Object.prototype.hasOwnProperty.call(player, 'scoutSeasonProjection')) {
      return Boolean(player.scoutSeasonProjection)
    }
    return [
      'professionalScoutProfileIds',
      'primaryScoutProfileId',
      'scoutProfileHierarchy',
      'scoutProfiles',
      'scoutSignals',
    ].some(key => Object.prototype.hasOwnProperty.call(player, key))
  }
  const movementSeasons = seasons.map((season, seasonIndex) => {
    const left = Array.isArray(season?.transfersOut) ? season.transfersOut : []
    const joined = Array.isArray(season?.transfersIn) ? season.transfersIn : []
    const earlierSeason = seasons[seasonIndex + 1]
    const previousSeason = seasonOrder(season) - seasonOrder(earlierSeason) === 1
      ? earlierSeason
      : null
    const departurePlayer = fact => {
      const playerId = clean(fact?.playerId)
      if (!playerId) return null
      const fromSeason = source => (Array.isArray(source?.teamPlayers) ? source.teamPlayers : [])
        .find(player => clean(player?.playerId) === playerId)
      return [fromSeason(season), fromSeason(previousSeason)].find(hasScoutingEvidence) || null
    }
    const movements = [
      ...left.map(fact => ({ fact, side: 'out' })),
      ...joined.map(fact => ({ fact, side: 'in' })),
    ]
    const directionCounts = movements.reduce((counts, { fact }) => {
      const direction = resolveFactDirection(fact)
      return { ...counts, [direction]: (counts[direction] || 0) + 1 }
    }, {})
    const movementRows = movements.map(({ fact, side }) => {
      const player = resolveMovementPlayer(fact, season, previousSeason, side)
      const playerId = clean(fact?.playerId || player?.playerId)
      const tableRow = buildPositionClassificationRows({
        seasonDoc: { teamPlayers: [{ ...player, playerId }] },
      })[0]
      const direction = resolveFactDirection(fact)
      const otherClubId = clean(side === 'out' ? fact?.toClubId : fact?.fromClubId)
      const otherTeamId = clean(side === 'out' ? fact?.toTeamId : fact?.fromTeamId)
      const profilePlayer = side === 'out' ? departurePlayer(fact) : null

      return {
        ...tableRow,
        movementId: clean(fact?.movementId),
        playerId,
        favoriteKey: clean(fact?.playerId || player?.playerId || player?.playerDocumentId ||
          player?.externalPlayerId || player?.id),
        seasonKey: seasonKey(season),
        name: clean(player?.fullName || player?.name || player?.playerName) || 'שחקן ללא שם',
        playerUrl: clean(player?.playerUrl),
        side,
        direction,
        player: tableRow.player,
        departureProfilePlayer: profilePlayer,
        otherTeamName: buildTeamDisplayName({
          clubNames: clubsById[otherClubId]?.names,
          clubId: otherClubId,
          teamId: otherTeamId,
        }),
        levelChange: resolveLevelChange(fact, direction),
      }
    })
    const outgoingByPlayer = new Map()
    movementRows.filter(row => row.side === 'out').forEach((row, index) => {
      const key = row.playerId || row.movementId || `out-${index}`
      const existing = outgoingByPlayer.get(key) || {
        comparable: false,
        movedUp: false,
        movedLateral: false,
        profileKnown: false,
        professionalProfile: false,
      }
      const profilePlayer = row.departureProfilePlayer
      outgoingByPlayer.set(key, {
        comparable: existing.comparable || row.levelChange !== null,
        movedUp: existing.movedUp || (row.direction === 'up' && row.levelChange > 0),
        movedLateral: existing.movedLateral || (row.direction === 'lateral' && row.levelChange === 0),
        profileKnown: existing.profileKnown || Boolean(profilePlayer),
        professionalProfile: existing.professionalProfile || Boolean(profilePlayer &&
          resolveActiveProfessionalProfileIds(profilePlayer).some(profileId => (
            resolveScoutProfileIdentity(profileId) === SCOUT_PROFILE_IDENTITY.CORE
          ))),
      })
    })
    const outgoingPlayers = [...outgoingByPlayer.values()]
    return {
      ...seasonSummaryMeta(season),
      isUpcoming: Boolean(season.isUpcoming),
      movementDataAvailable: Array.isArray(season?.transfersOut) ||
        Array.isArray(season?.transfersIn),
      leftCount: left.length,
      outgoingPlayerCount: outgoingPlayers.length,
      joinedCount: joined.length,
      directionCounts,
      higherLevelDepartures: outgoingPlayers.filter(player => player.movedUp).length,
      sameLevelDepartures: outgoingPlayers.filter(player => player.movedLateral).length,
      higherOrSameLevelDepartures: outgoingPlayers
        .filter(player => player.movedUp || player.movedLateral).length,
      comparableDepartures: outgoingPlayers.filter(player => player.comparable).length,
      professionalProfileDepartures: outgoingPlayers.filter(player => player.professionalProfile).length,
      profileKnownDepartures: outgoingPlayers.filter(player => player.profileKnown).length,
      movements: movementRows,
    }
  })
  const movements = movementSeasons.flatMap(season => (
    season.movements
  ))

  return {
    leaguePath: seasons.map(season => ({
      seasonKey: seasonKey(season),
      leagueName: clean(
        season?.leagueName || season?.league?.name ||
        seasonOptionByKey.get(seasonKey(season))?.leagueName ||
        (season.isCurrent ? team?.leagueName : '')
      ),
      ageGroupLabel: clean(
        season?.ageGroupLabel || season?.ageGroup?.label ||
        seasonOptionByKey.get(seasonKey(season))?.ageGroupLabel
      ),
      leagueLevel: numberOrNull(season?.leagueLevel),
      isCurrent: season.isCurrent,
      status: season.isUpcoming ? 'upcoming' : 'available',
    })),
    profileTimeline: seasons.map(season => ({
      ...seasonSummaryMeta(season),
      count: profilesCount(season),
      isCurrent: season.isCurrent,
    })),
    rosterTimeline: seasons.map(season => ({
      ...seasonSummaryMeta(season),
      count: countPlayers(season),
      isCurrent: season.isCurrent,
    })),
    rosterBalanceTimeline: seasons.map(buildLineDistribution),
    scoutProfileDistributionTimeline: profileTimeline,
    largestProfessionalProfileChange: profileChange,
    movements,
    movementSeasons,
    birthYear: numberOrNull(team?.birthYear),
  }
}

export const buildPriorityTimeline = ({ side, team = {}, teamSeasons = [], selectedSeasonKey = '', selectedSeasonOption = null } = {}) => {
  const selectedKey = clean(selectedSeasonKey)
  const selectedOrder = seasonOrder({ seasonKey: selectedKey })
  const previousSeasons = (Array.isArray(teamSeasons) ? teamSeasons : [])
    .filter(season => seasonOrder(season) < selectedOrder)
    .sort((left, right) => seasonOrder(right) - seasonOrder(left))
    .slice(0, 2)

  const currentPriority = team?.performanceView?.[side]?.priority || {}
  const toPreviousEntry = season => ({
    seasonKey: clean(season?.seasonKey || season?.seasonId),
    score: numberOrNull(season?.performance?.[side]?.scoutPriorityScore),
    level: clean(season?.performance?.[side]?.priorityLevel),
    status: 'available',
  })

  return [
    {
      seasonKey: selectedKey,
      score: numberOrNull(currentPriority.score),
      level: clean(currentPriority.level),
      status: selectedSeasonOption?.target === 'future' ? 'upcoming' : 'available',
    },
    ...previousSeasons.map(toPreviousEntry),
  ].filter(entry => entry.seasonKey)
}
export const buildPerformance = team => [
  ['מיקום בטבלה', numberOrNull(team?.tableRank)],
  ['משחקים', numberOrNull(team?.games)],
  ['שערים למשחק', numberOrNull(team?.goalsForPerGame)],
  ['ספיגה למשחק', numberOrNull(team?.goalsAgainstPerGame)],
  ['דירוג התקפה', numberOrNull(team?.tableAttackRank)],
  ['דירוג הגנה', numberOrNull(team?.tableDefenseRank)],
]
