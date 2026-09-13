import { cleanValue, pickDefinedValue } from '../shared/value.model.js'

const clean = cleanValue
const MISSING_LABEL = 'אין מידע'
const AGE_GROUP_ORDER = ['u13', 'u14', 'u15', 'u16', 'u17', 'u19']
const CLUB_LEAGUE_PATH_STAGES = [
  { ageGroupId: 'u15', ageGroupLabel: 'נערים ג', ageOffset: 14 },
  { ageGroupId: 'u16', ageGroupLabel: 'נערים ב', ageOffset: 15 },
  { ageGroupId: 'u17', ageGroupLabel: 'נערים א', ageOffset: 16 },
  { ageGroupId: 'u19', ageGroupLabel: 'נוער', ageOffset: 18 },
]
const CLUB_LEAGUE_PATH_COLOR_REFERENCE_STAGE = {
  ageGroupId: 'u14',
  ageGroupLabel: 'ילדים א',
  ageOffset: 13,
}
const CLUB_LEAGUE_PATH_COMPARISON_STAGES = [
  CLUB_LEAGUE_PATH_COLOR_REFERENCE_STAGE,
  ...CLUB_LEAGUE_PATH_STAGES,
]

const numberOrNull = value => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

const leagueLevelOf = team => numberOrNull(
  pickDefinedValue(team?.league?.leagueLevel, team?.leagueLevel)
)

const clubStrengthLevelOf = club => numberOrNull(
  pickDefinedValue(club?.clubStrengthLevel, club?.clubLevel)
)

const seasonStartYear = seasonKey => {
  const firstPart = clean(seasonKey).match(/\d+/)?.[0] || ''
  const value = Number(firstPart)
  if (!Number.isFinite(value)) return null
  return value < 100 ? 2000 + value : value
}

const expectedBirthYear = ({ seasonKey, ageOffset }) => {
  const startYear = seasonStartYear(seasonKey)
  return startYear && Number.isFinite(ageOffset) ? startYear - ageOffset : null
}

const resolveTeamSlot = team => {
  const explicitSlot = numberOrNull(
    pickDefinedValue(
      team?.slot,
      team?.teamSlot,
      team?.birthTeamSlot
    )
  )
  if (explicitSlot) return explicitSlot

  const lastPart = clean(team?.teamId).split('_').filter(Boolean).at(-1)
  return numberOrNull(lastPart) || 1
}

const teamSort = (left, right) => {
  const yearDifference = Number(right?.birthYear || 0) - Number(left?.birthYear || 0)
  if (yearDifference) return yearDifference

  const ageDifference = AGE_GROUP_ORDER.indexOf(clean(left?.ageGroupId)) - AGE_GROUP_ORDER.indexOf(clean(right?.ageGroupId))
  if (ageDifference) return ageDifference
  return resolveTeamSlot(left) - resolveTeamSlot(right)
}

const seasonOrder = value => {
  const numbers = clean(value).match(/\d+/g) || []
  return Number(numbers[0]) * 10000 + Number(numbers[1] || 0)
}

const metricState = value => {
  const normalized = clean(value).toLowerCase()
  if (!normalized || normalized === 'unavailable' || normalized === 'unknown') return 'missing'
  if (['elite', 'high', 'positive', 'above', 'strong'].includes(normalized)) return 'high'
  if (['low', 'weak', 'below'].includes(normalized)) return 'low'
  if (['neutral', 'regular', 'normal'].includes(normalized)) return 'regular'
  return 'missing'
}

const metricLabel = (kind, state) => ({
  team: { high: 'מעל', regular: 'רגיל', low: 'נמוך', missing: MISSING_LABEL },
  attack: { high: 'חזק', regular: 'רגיל', low: 'חלש', missing: MISSING_LABEL },
}[kind][state])

const buildDistribution = (teams, kind) => {
  const values = teams.reduce((counts, team) => {
    const rawValue = kind === 'attack'
      ? team?.performance?.offense?.priorityLevel || team?.performance?.offense?.level
      : team?.performance?.overall?.priorityLevel || team?.performance?.priorityLevel
    const state = metricState(rawValue)
    counts[state] += 1
    return counts
  }, { high: 0, regular: 0, low: 0, missing: 0 })

  return ['high', 'regular', 'low', 'missing'].map(state => ({
    key: state,
    label: metricLabel(kind, state),
    count: values[state],
  }))
}

const priorityLevelOf = (team, kind) => clean(
  team?.performance?.[kind]?.priorityLevel || team?.performance?.[kind]?.level
).toLowerCase()

const scoutPriorityValue = value => (
  ['elite', 'high', 'positive', 'neutral', 'low'].includes(value)
    ? value
    : 'neutral'
)

const scoutPriorityLabel = value => (
  value ? undefined : MISSING_LABEL
)

const POSITIVE_PRIORITY_LEVELS = new Set(['positive', 'high', 'elite'])

const masterSeasonTeamsOf = ({ club = {}, seasonView = 'current' } = {}) => (
  (Array.isArray(club?.ageGroups) ? club.ageGroups : []).flatMap(ageGroup => (
    (Array.isArray(ageGroup?.[seasonView]) ? ageGroup[seasonView] : []).map(team => ({
      ...team,
      ageGroupId: clean(team?.ageGroupId || ageGroup?.ageGroupId),
    }))
  ))
)

const buildPerformancePrioritySummary = ({
  teams = [],
  previousTeams = [],
  kind,
} = {}) => {
  const primaryTeamsOf = source => source.filter(team => resolveTeamSlot(team) === 1)
  const countByState = (source, state) => primaryTeamsOf(source).reduce((count, team) => {
    const level = priorityLevelOf(team, kind)
    const matches = state === 'positive'
      ? POSITIVE_PRIORITY_LEVELS.has(level)
      : level === 'low'

    return matches ? count + 1 : count
  }, 0)
  const hasPriorityData = source => primaryTeamsOf(source)
    .some(team => priorityLevelOf(team, kind))
  const hasCurrentPriorityData = hasPriorityData(teams)
  const hasPreviousPriorityData = hasPriorityData(previousTeams)

  return [
    { key: 'positive', label: 'מעל חיובי', state: 'positive' },
    { key: 'low', label: 'נמוך', state: 'low' },
  ].map(item => {
    const count = countByState(teams, item.state)
    const previousCount = countByState(previousTeams, item.state)

    return {
      ...item,
      count: hasCurrentPriorityData ? count : null,
      previousCount: hasPreviousPriorityData ? previousCount : null,
      delta: hasCurrentPriorityData && hasPreviousPriorityData ? count - previousCount : null,
    }
  })
}

const buildLeaguePath = (teams, fallbackSeasonKey = '') => {
  const resolvedSeasonKey = fallbackSeasonKey || teams.find(team => clean(team?.seasonKey))?.seasonKey || ''
  const teamsByAgeGroup = new Map(
    [...teams]
      .sort(teamSort)
      .map(team => [clean(team?.ageGroupId), team])
  )

  const comparisonNodes = CLUB_LEAGUE_PATH_COMPARISON_STAGES.map(stage => {
    const team = teamsByAgeGroup.get(stage.ageGroupId)
    const leagueLevel = leagueLevelOf(team)

    return {
      birthYear: Number(team?.birthYear) || expectedBirthYear({
        seasonKey: team?.seasonKey || resolvedSeasonKey,
        ageOffset: stage.ageOffset,
      }),
      ageGroupId: stage.ageGroupId,
      ageGroupLabel: stage.ageGroupLabel,
      level: leagueLevel,
      label: leagueLevel ? String(leagueLevel) : '?',
    }
  })

  return comparisonNodes.slice(1).map((node, index) => {
    const previousNode = comparisonNodes[index]

    return {
      ...node,
      comparisonAgeGroupLabel: previousNode.ageGroupLabel,
      hasLeagueLevelDecline: Boolean(
        previousNode?.level &&
        node.level &&
        node.level > previousNode.level
      ),
      hasLeagueLevelIncrease: Boolean(
        previousNode?.level &&
        node.level &&
        node.level < previousNode.level
      ),
    }
  })
}

export const clubHasLeaguePathDirection = ({
  teams = [],
  seasonKey = '',
  direction = '',
} = {}) => {
  const directionKey = direction === 'down' ? 'hasLeagueLevelDecline'
    : direction === 'up' ? 'hasLeagueLevelIncrease'
      : ''

  if (!directionKey) return false

  return buildLeaguePath(
    teams.filter(team => resolveTeamSlot(team) === 1),
    seasonKey,
  ).some(node => node[directionKey])
}

const mismatchDirectionOf = ({ club = {}, leagueLevel = null } = {}) => {
  const clubStrengthLevel = clubStrengthLevelOf(club)
  if (!clubStrengthLevel || !leagueLevel) return null

  const isMismatch = clubStrengthLevel < 2
    ? leagueLevel === 2
    : leagueLevel === 1 || leagueLevel === 2
  if (!isMismatch || leagueLevel === clubStrengthLevel) return null

  return leagueLevel < clubStrengthLevel ? 'above' : 'below'
}

export const clubHasLeagueLevelDirection = ({
  club = {},
  teams = [],
  direction = '',
} = {}) => {
  const clubStrengthLevel = clubStrengthLevelOf(club)
  if (!clubStrengthLevel || !['above', 'below'].includes(direction)) return false

  return teams
    .filter(team => resolveTeamSlot(team) === 1)
    .some(team => {
      const leagueLevel = leagueLevelOf(team)
      if (!leagueLevel) return false

      return direction === 'above'
        ? leagueLevel < clubStrengthLevel
        : leagueLevel > clubStrengthLevel
    })
}

const buildPathModel = ({ club = {}, teams = [], seasonKey = '' } = {}) => {
  const primaryTeams = teams.filter(team => resolveTeamSlot(team) === 1)
  const secondaryBySlot = teams.reduce((bySlot, team) => {
    const slot = resolveTeamSlot(team)
    if (slot > 1) (bySlot.get(slot) || bySlot.set(slot, []).get(slot)).push(team)
    return bySlot
  }, new Map())

  return {
    primary: buildLeaguePath(primaryTeams, seasonKey).map(node => ({
      ...node,
      clubLevelDirection: mismatchDirectionOf({ club, leagueLevel: node.level }),
    })),
    secondary: [...secondaryBySlot.entries()].map(([slot, slotTeams]) => ({
      slot,
      path: buildLeaguePath(slotTeams, seasonKey).map(node => ({
        ...node,
        clubLevelDirection: mismatchDirectionOf({ club, leagueLevel: node.level }),
      })),
    })),
  }
}

const buildTransferSummary = teams => {
  const coverage = teams.map(team => clean(team?.transfers?.coverageStatus).toUpperCase())
  if (!coverage.length || coverage.includes('NOT_LOADED') || !coverage.some(Boolean)) {
    return { status: 'NOT_LOADED', label: MISSING_LABEL, up: null, down: null }
  }

  const partial = coverage.includes('PARTIAL')
  const totals = teams.reduce((summary, team) => ({
    up: summary.up + Number(team?.transfers?.out?.up || 0),
    down: summary.down + Number(team?.transfers?.out?.down || 0),
  }), { up: 0, down: 0 })

  return { status: partial ? 'PARTIAL' : 'COMPLETE', label: partial ? 'כיסוי חלקי' : '', ...totals }
}

const flattenAgeGroups = club => (Array.isArray(club?.ageGroups) ? club.ageGroups : []).flatMap(ageGroup => {
  const seasons = Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : []
  return seasons.map(season => ({ ...season, ageGroupId: clean(ageGroup?.ageGroupId), ageGroupLabel: clean(ageGroup?.ageGroupLabel) }))
})

const ageGroupLabelOf = team => (
  clean(team?.ageGroupLabel) ||
  CLUB_LEAGUE_PATH_STAGES.find(stage => stage.ageGroupId === clean(team?.ageGroupId))?.ageGroupLabel ||
  clean(team?.ageGroupId) ||
  '?'
)

const buildMismatchTeams = ({ club = {}, teams = [] } = {}) => {
  const clubStrengthLevel = clubStrengthLevelOf(club)
  if (!clubStrengthLevel) return []

  const isMismatchLeagueLevel = leagueLevel => {
    if (clubStrengthLevel < 2) return leagueLevel === 2
    return leagueLevel === 1 || leagueLevel === 2
  }

  return teams.filter(team => (
    resolveTeamSlot(team) === 1 &&
    isMismatchLeagueLevel(leagueLevelOf(team))
  ))
}

const buildMismatchTeamView = ({ club = {}, team, fallbackSeasonKey = '' } = {}) => {
  const stage = CLUB_LEAGUE_PATH_STAGES.find(item => (
    item.ageGroupId === clean(team?.ageGroupId)
  ))
  const leagueLevel = leagueLevelOf(team)
  const clubStrengthLevel = numberOrNull(
    pickDefinedValue(club?.clubStrengthLevel, club?.clubLevel)
  )
  const levelRelation = leagueLevel && clubStrengthLevel
    ? leagueLevel < clubStrengthLevel
      ? 'above'
      : leagueLevel > clubStrengthLevel
        ? 'below'
        : 'at'
    : 'unknown'

  return {
    ageGroupLabel: ageGroupLabelOf(team),
    birthYear: Number(team?.birthYear) || expectedBirthYear({
      seasonKey: team?.seasonKey || fallbackSeasonKey,
      ageOffset: stage?.ageOffset,
    }),
    leagueLevel,
    levelRelation,
  }
}

const buildSignals = ({ club = {}, teams = [], seasonKey = '' } = {}) => {
  const mismatchTeams = buildMismatchTeams({ club, teams })
  const mismatchAgeGroups = [...new Set(mismatchTeams.map(ageGroupLabelOf))]
  const missingCount = teams.filter(team => !leagueLevelOf(team)).length
  return [
    mismatchTeams.length ? {
      key: 'mismatch',
      label: 'חריגת רמת ליגה',
      count: mismatchTeams.length,
      ageGroups: mismatchAgeGroups,
      teams: mismatchTeams.map(team => buildMismatchTeamView({
        club,
        team,
        fallbackSeasonKey: seasonKey,
      })),
    } : null,
    missingCount ? { key: 'missing', label: 'מידע חסר', count: missingCount } : null,
  ].filter(Boolean)
}

const buildTeamRowModel = ({ club = {}, team = {} } = {}) => ({
  ...team,
  slot: resolveTeamSlot(team),
  teamName: ageGroupLabelOf(team),
  leagueName: clean(team?.league?.leagueName || team?.leagueName) || MISSING_LABEL,
  leagueLevel: leagueLevelOf(team),
  tableRank: numberOrNull(team?.performance?.tableRank),
  gamesPlayed: pickDefinedValue(team?.performance?.teamGamePlayed, null),
  goalsFor: pickDefinedValue(team?.performance?.goalsFor, null),
  goalsAgainst: pickDefinedValue(team?.performance?.goalsAgainst, null),
  goalsForPerGame: pickDefinedValue(team?.performance?.goalsForPerGame, null),
  goalsAgainstPerGame: pickDefinedValue(team?.performance?.goalsAgainstPerGame, null),
  defensePriorityValue: scoutPriorityValue(priorityLevelOf(team, 'defense')),
  defensePriorityLabel: scoutPriorityLabel(priorityLevelOf(team, 'defense')),
  offensePriorityValue: scoutPriorityValue(priorityLevelOf(team, 'offense')),
  offensePriorityLabel: scoutPriorityLabel(priorityLevelOf(team, 'offense')),
})

const buildMissingAgeGroupTeam = ({ stage, seasonKey }) => {
  const birthYear = expectedBirthYear({
    seasonKey,
    ageOffset: stage.ageOffset,
  })

  return {
    teamId: `missing_${seasonKey}_${stage.ageGroupId}_1`,
    slot: 1,
    seasonKey,
    ageGroupId: stage.ageGroupId,
    ageGroupLabel: stage.ageGroupLabel,
    birthYear,
    fullWidthMessage: `אין מידע על השנתון ${birthYear || '?'} · ${stage.ageGroupLabel}`,
  }
}

const buildPrimaryTableTeams = ({ teams = [], seasonKey = '' } = {}) => {
  const primaryByAgeGroup = new Map(
    teams
      .filter(team => resolveTeamSlot(team) === 1)
      .map(team => [clean(team?.ageGroupId), team])
  )

  return CLUB_LEAGUE_PATH_COMPARISON_STAGES.map(stage => (
    primaryByAgeGroup.get(stage.ageGroupId) || buildMissingAgeGroupTeam({
      stage,
      seasonKey,
    })
  ))
}

export const buildClubSummaryModel = ({
  club = {},
  teams = [],
  previousTeams = [],
  seasonKey = '',
  seasonView = 'current',
} = {}) => ({
  leaguePath: buildPathModel({ club, teams, seasonKey }),
  mismatch: buildSignals({ club, teams, seasonKey }).find(signal => signal.key === 'mismatch') || null,
  performance: buildDistribution(teams, 'team'),
  attack: buildDistribution(teams, 'attack'),
  offense: buildPerformancePrioritySummary({
    teams: masterSeasonTeamsOf({ club, seasonView }) || teams,
    previousTeams: seasonView === 'current'
      ? masterSeasonTeamsOf({ club, seasonView: 'previous' })
      : previousTeams,
    kind: 'offense',
  }),
  defense: buildPerformancePrioritySummary({
    teams: masterSeasonTeamsOf({ club, seasonView }) || teams,
    previousTeams: seasonView === 'current'
      ? masterSeasonTeamsOf({ club, seasonView: 'previous' })
      : previousTeams,
    kind: 'defense',
  }),
  transfers: buildTransferSummary(teams),
  hasTeams: teams.length > 0,
})

export const buildClubExpandedModel = ({ club = {}, teams = [], seasonKey = '' } = {}) => {
  const bySeason = teams.reduce((groups, team) => {
    const seasonKey = clean(team?.seasonKey) || MISSING_LABEL
    ;(groups.get(seasonKey) || groups.set(seasonKey, []).get(seasonKey)).push(team)
    return groups
  }, new Map())

  return {
    seasons: [...bySeason.entries()]
      .sort(([left], [right]) => seasonOrder(right) - seasonOrder(left))
      .map(([seasonKey, seasonTeams], index) => ({
        primaryTeams: buildPrimaryTableTeams({ teams: seasonTeams, seasonKey })
          .map(team => buildTeamRowModel({ club, team })),
        secondaryTeams: seasonTeams
          .filter(team => resolveTeamSlot(team) === 2)
          .sort(teamSort)
          .map(team => buildTeamRowModel({ club, team })),
        seasonKey,
        defaultOpen: index === 0,
        path: buildPathModel({ club, teams: seasonTeams, seasonKey }),
        performance: buildDistribution(seasonTeams, 'team'),
        attack: buildDistribution(seasonTeams, 'attack'),
        teams: [...seasonTeams]
          .sort(teamSort)
          .map(team => buildTeamRowModel({ club, team })),
        signals: buildSignals({ club, teams: seasonTeams, seasonKey }),
      })),
  }
}

export const buildClubPageModel = ({ club = {} } = {}) => {
  const teams = flattenAgeGroups(club)
  const expanded = buildClubExpandedModel({ club, teams })
  const developmentByBirthYear = teams.reduce((groups, team) => {
    const birthYear = Number(team?.birthYear) || 0
    if (!birthYear) return groups
    ;(groups.get(birthYear) || groups.set(birthYear, []).get(birthYear)).push(team)
    return groups
  }, new Map())

  return {
    header: { club },
    overview: buildClubSummaryModel({ club, teams }),
    opportunities: buildSignals({ club, teams }),
    transfers: buildTransferSummary(teams),
    seasons: expanded.seasons,
    development: [...developmentByBirthYear.entries()]
      .sort(([left], [right]) => right - left)
      .map(([birthYear, cohortTeams]) => ({
        birthYear,
        teams: [...cohortTeams]
          .sort((left, right) => seasonOrder(left?.seasonKey) - seasonOrder(right?.seasonKey))
          .map(buildTeamRowModel),
      })),
  }
}
