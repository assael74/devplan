// src/features/hub/playerProfile/sharedLogic/info/targets.cards.js

const EMPTY = '—'

const OFFENSIVE_LAYERS = ['attack', 'atMidfield', 'midfield']
const DEFENSIVE_LAYERS = ['dmMid', 'defense']

const toNumber = value => {
  if (value == null || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const formatNumber = value => {
  const number = toNumber(value)
  return number === null ? EMPTY : String(number)
}

const formatWholeNumber = value => {
  const number = toNumber(value)
  return number === null ? EMPTY : String(Math.round(number))
}

const formatDecimal = value => {
  const number = toNumber(value)
  return number === null ? EMPTY : String(Number(number.toFixed(2)))
}

const formatPercent = value => {
  const formatted = formatWholeNumber(value)
  return formatted === EMPTY ? EMPTY : `${formatted}%`
}

const formatRange = (range, suffix = '') => {
  if (!Array.isArray(range) || range.length < 2) return EMPTY

  const min = toNumber(range[0])
  const max = toNumber(range[1])

  if (min === null && max === null) return EMPTY
  if (max === null) return `${formatNumber(min)}+${suffix}`
  if (min === null) return `עד ${formatNumber(max)}${suffix}`

  return `${formatNumber(min)}-${formatNumber(max)}${suffix}`
}

const buildAdjustedTarget = ({ professionalTarget, guaranteedTarget }) => {
  const professional = toNumber(professionalTarget)
  const adjusted = toNumber(guaranteedTarget)
  const active = adjusted !== null ? adjusted : professional
  const changed = professional !== null && adjusted !== null && Math.round(professional) !== Math.round(adjusted)

  return {
    value: formatWholeNumber(active),
    originalValue: changed ? formatWholeNumber(professional) : '',
  }
}

const buildGoalTierCard = profile => ({
  id: 'goalTier',
  label: 'מדרגת כובש',
  value: profile?.goalTierLabel || EMPTY,
  helper: 'לפי יעד הקבוצה, מעמד בסגל והעמדה הראשית',
  icon: 'targets',
})

const buildGoalsCard = profile => {
  const target = buildAdjustedTarget({
    professionalTarget: profile?.goalsTarget,
    guaranteedTarget: profile?.guaranteedGoalsTarget,
  })

  return {
    id: 'goals',
    label: 'יעד שערים',
    value: target.value,
    originalValue: target.originalValue,
    range: formatRange(profile?.goalsRange),
    perGame: formatDecimal(profile?.goalsPerGameTarget),
    icon: 'goal',
  }
}

const buildAssistsCard = profile => {
  const target = buildAdjustedTarget({
    professionalTarget: profile?.assistsTarget,
    guaranteedTarget: profile?.guaranteedAssistsTarget,
  })

  return {
    id: 'assists',
    label: 'יעד בישולים',
    value: target.value,
    originalValue: target.originalValue,
    range: formatRange(profile?.assistsRange),
    perGame: formatDecimal(profile?.assistsPerGameTarget),
    icon: 'assist',
  }
}

const buildGoalContributionsCard = profile => {
  const target = buildAdjustedTarget({
    professionalTarget: profile?.goalContributionsTarget,
    guaranteedTarget: profile?.guaranteedGoalContributionsTarget,
  })

  return {
    id: 'goalContributions',
    label: 'יעד מעורבות בשערים',
    value: target.value,
    originalValue: target.originalValue,
    range: formatRange(profile?.goalContributionsRange),
    perGame: formatDecimal(profile?.goalContributionsPerGameTarget),
    icon: 'targets',
  }
}

const buildTeamGoalsAgainstCard = targets => {
  const defense = targets?.values?.defense || {}
  const teamSeason = targets?.values?.teamSeason || {}
  const value = defense.teamGoalsAgainstTarget ?? teamSeason.goalsAgainst

  return {
    id: 'teamGoalsAgainst',
    label: 'ספיגה קבוצתית',
    value: formatWholeNumber(value),
    helper: 'מספר השערים המרבי שהקבוצה שואפת לספוג בעונה',
    icon: 'defense',
  }
}

const buildGoalsAgainstPerGameCard = targets => {
  const value = targets?.values?.defense?.goalsAgainstPerGameTarget

  return {
    id: 'goalsAgainstPerGame',
    label: 'ספיגה למשחק',
    value: formatDecimal(value),
    helper: 'ממוצע הספיגה הקבוצתי הרצוי למשחק',
    icon: 'defense',
  }
}

const buildDefenseResponsibilityCard = profile => {
  const target = profile?.defense?.goalsAgainstResponsibilityPct

  return {
    id: 'defenseResponsibility',
    label: 'אחריות הגנתית',
    value: formatPercent(target?.target),
    range: formatRange(target?.range, '%'),
    helper: 'משקל האחריות המקצועית של השחקן במניעת ספיגות',
    icon: 'defense',
  }
}

const buildCleanSheetCard = ({ profile, targets }) => {
  const benchmark = profile?.defense?.cleanSheetPct
  const explicitTarget = targets?.values?.position?.cleanSheetPctTarget
  const value = explicitTarget ?? benchmark?.target

  return {
    id: 'cleanSheets',
    label: 'יעד משחקים ללא ספיגה',
    value: formatPercent(value),
    range: formatRange(benchmark?.range, '%'),
    icon: 'cleanSheet',
  }
}

const buildMinutesCard = profile => ({
  id: 'minutes',
  label: 'נפח דקות מתוכנן',
  value: formatPercent(profile?.minutesPctTarget),
  range: formatRange(profile?.minutesPctRange, '%'),
  absoluteTarget: `${formatWholeNumber(profile?.minutesTarget)} דקות`,
  absoluteRange: formatRange(profile?.minutesRange, ' דקות'),
  icon: 'timePlayed',
})

const buildStartsCard = profile => ({
  id: 'lineup',
  label: 'צפי הזדמנות בהרכב',
  value: formatPercent(profile?.startsPctTarget),
  range: formatRange(profile?.startsPctRange, '%'),
  absoluteTarget: `${formatWholeNumber(profile?.startsTarget)} משחקים`,
  absoluteRange: formatRange(profile?.startsRange, ' משחקים'),
  icon: 'isStart',
})

const buildOffensiveSection = profile => ({
  title: 'יעדי תפוקה אישית',
  subtitle: 'יעדי שערים, בישולים ומעורבות בהתאם לפרופיל המקצועי',
  cards: [
    buildGoalTierCard(profile),
    buildGoalsCard(profile),
    buildAssistsCard(profile),
    buildGoalContributionsCard(profile),
  ],
})

const buildDefensiveSection = ({ profile, targets }) => ({
  title: 'יעדים הגנתיים והתקפיים',
  subtitle: 'יעדי הספיגה הקבוצתיים לצד האחריות ההגנתית והתרומה ההתקפית',
  cards: [
    buildTeamGoalsAgainstCard(targets),
    buildGoalsAgainstPerGameCard(targets),
    buildDefenseResponsibilityCard(profile),
    buildGoalsCard(profile),
  ],
})

const buildGoalkeeperSection = ({ profile, targets }) => ({
  title: 'יעדי שוער',
  subtitle: 'יעדי ספיגה, משחקים ללא ספיגה ואחריות הגנתית',
  cards: [
    buildTeamGoalsAgainstCard(targets),
    buildGoalsAgainstPerGameCard(targets),
    buildDefenseResponsibilityCard(profile),
    buildCleanSheetCard({ profile, targets }),
  ],
})

const buildPrimarySection = ({ profile, targets }) => {
  const layerKey = profile?.layerKey || ''

  if (layerKey === 'goalkeeper') return buildGoalkeeperSection({ profile, targets })
  if (DEFENSIVE_LAYERS.includes(layerKey)) return buildDefensiveSection({ profile, targets })
  if (OFFENSIVE_LAYERS.includes(layerKey)) return buildOffensiveSection(profile)

  return buildOffensiveSection(profile)
}

export const buildPlayerTargetSections = ({ profile = {}, targets = {} } = {}) => {
  return {
    layerKey: profile?.layerKey || '',
    primary: buildPrimarySection({ profile, targets }),

    usage: {
      title: 'נפח פעילות מתוכנן',
      subtitle: 'דקות משחק והזדמנויות בהרכב בהתאם למעמד בסגל',
      cards: [
        buildMinutesCard(profile),
        buildStartsCard(profile),
      ],
    },
  }
}
