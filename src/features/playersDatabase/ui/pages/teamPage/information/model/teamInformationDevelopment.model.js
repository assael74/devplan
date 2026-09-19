import { clean, numberOrNull, withFallback } from '../../model/teamInformation.utils.js'
import { countCurrentRosterPlayers } from '../../../../../model/team/rosterStatus.model.js'

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

export const buildDevelopmentTimeline = ({ team = {}, teamSeasons = [], seasonOptions = [] } = {}) => {
  const rows = buildAllDevelopmentSeasons({ teamSeasons, seasonOptions })
  const metric = (season, key) => withFallback(
    numberOrNull(season?.[key]),
    season.isCurrent ? numberOrNull(team?.[key]) : null
  )
  const toEntry = season => ({
    ...seasonSummaryMeta(season),
    isCurrent: Boolean(season.isCurrent),
    status: season.isUpcoming ? 'upcoming' : 'available',
    tableRank: metric(season, 'tableRank'),
    games: withFallback(metric(season, 'games'), numberOrNull(season?.teamStats?.teamGamePlayed)),
    goalsForPerGame: metric(season, 'goalsForPerGame'),
    goalsAgainstPerGame: metric(season, 'goalsAgainstPerGame'),
    tableAttackRank: metric(season, 'tableAttackRank'),
    tableDefenseRank: metric(season, 'tableDefenseRank'),
    offensePriorityLevel: clean(
      season?.performance?.offense?.priorityLevel ||
      (season.isCurrent ? team?.performanceView?.offense?.priority?.level : '')
    ),
    defensePriorityLevel: clean(
      season?.performance?.defense?.priorityLevel ||
      (season.isCurrent ? team?.performanceView?.defense?.priority?.level : '')
    ),
  })

  return rows.map(toEntry).filter(entry => entry.seasonKey)
}

export const buildYearDevelopmentOverview = ({ team = {}, teamSeasons = [], seasonOptions = [] } = {}) => {
  const seasons = buildAllDevelopmentSeasons({ teamSeasons, seasonOptions })

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

    return {
      ...seasonSummaryMeta(season),
      isCurrent: season.isCurrent,
      total: numberOrNull(summary.total),
      profiles: Object.entries(profileCounts)
        .map(([profileId, count]) => ({ profileId, count: numberOrNull(count) || 0 }))
        .filter(profile => profile.profileId && profile.count > 0)
        .sort((left, right) => right.count - left.count || left.profileId.localeCompare(right.profileId)),
    }
  }
  const playerById = new Map()
  seasons.forEach(season => {
    ;(Array.isArray(season?.teamPlayers) ? season.teamPlayers : []).forEach(player => {
      const playerId = clean(player?.playerId)
      if (playerId) playerById.set(playerId, player)
    })
  })
  const resolveMovementLine = fact => {
    const player = playerById.get(clean(fact?.playerId)) || {}
    const value = clean(
      player?.lineClassification?.line ||
      player?.line ||
      player?.primaryPosition
    ).toUpperCase()

    if (['GOALKEEPER', 'GK', 'GOALIE'].includes(value)) return 'GOALKEEPER'
    if (['DEFENSE', 'DEFENDER', 'FULLBACK'].includes(value)) return 'DEFENSE'
    if (['MIDFIELD', 'MIDFIELDER', 'ATTACKING_MIDFIELDER'].includes(value)) return 'MIDFIELD'
    if (['ATTACK', 'ATTACKER', 'FORWARD', 'STRIKER'].includes(value)) return 'ATTACK'
    return 'UNKNOWN'
  }
  const movementSeasons = seasons.map(season => {
    const left = Array.isArray(season?.transfersOut) ? season.transfersOut : []
    const joined = Array.isArray(season?.transfersIn) ? season.transfersIn : []
    const directionCounts = left.reduce((counts, fact) => {
      const direction = clean(fact?.direction) || 'unknown'
      return { ...counts, [direction]: (counts[direction] || 0) + 1 }
    }, {})
    const lineCounts = left.reduce((counts, fact) => {
      const line = resolveMovementLine(fact)
      return { ...counts, [line]: (counts[line] || 0) + 1 }
    }, {})

    return {
      ...seasonSummaryMeta(season),
      isUpcoming: Boolean(season.isUpcoming),
      leftCount: left.length,
      joinedCount: joined.length,
      directionCounts,
      lineCounts,
      movements: left.map(fact => {
        const player = playerById.get(clean(fact?.playerId)) || {}

        return {
          seasonKey: seasonKey(season),
          name: clean(player?.fullName || player?.name || player?.playerName) || 'שחקן ללא שם',
          direction: clean(fact?.direction) || 'unknown',
          line: resolveMovementLine(fact),
          hasScoutProfile: Boolean(
            clean(player?.primaryScoutProfileId) ||
            (Array.isArray(player?.professionalScoutProfileIds) && player.professionalScoutProfileIds.length)
          ),
        }
      }),
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
    scoutProfileDistributionTimeline: seasons.map(buildProfileDistribution),
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

export const buildSeasonChange = ({ balance, previousBalance, season, previousSeason }) => {
  if (!previousSeason || !previousBalance || !balance) return []
  const playersCount = Array.isArray(season?.teamPlayers) ? countCurrentRosterPlayers(season.teamPlayers) : null
  const previousPlayersCount = Array.isArray(previousSeason?.teamPlayers) ? countCurrentRosterPlayers(previousSeason.teamPlayers) : null
  const previousCard = key => previousBalance.cards.find(card => card.key === key)
  const currentCard = key => balance.cards.find(card => card.key === key)

  return [
    ['גודל סגל', previousPlayersCount, playersCount],
    ['פיזור דקות', previousCard('minutes')?.value, currentCard('minutes')?.value],
    ['עומק שימוש', previousCard('depth')?.value, currentCard('depth')?.value],
    ['ריכוז תפוקה', previousCard('production')?.value, currentCard('production')?.value],
    ['רוטציה', previousCard('rotation')?.value, currentCard('rotation')?.value],
  ]
}
