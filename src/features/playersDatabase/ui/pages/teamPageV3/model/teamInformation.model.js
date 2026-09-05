import { buildTeamLineInterpretationState } from '../../../../domain/index.js'
import {
  getTeamLineInterestPresentation,
  getTeamSquadInterestPresentation,
} from './teamInterest.presentation.js'
import { TEAM_STRUCTURE_FILTER } from './teamStructureFilter.model.js'
import {
  buildTeamPlayerLineClassificationEvaluation,
  isTeamLineBalanceRelevantPlayer,
  isTeamPlayerKnownGoalkeeper,
} from '../../../../../../shared/scouting/teams/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const numberOrNull = value => {
  const next = Number(value)
  return Number.isFinite(next) ? next : null
}

const percent = value => {
  const next = numberOrNull(value)
  if (next === null) return null
  return next <= 1 ? Math.round(next * 100) : Math.round(next)
}

const RELIABILITY_LABELS = Object.freeze({
  sufficient: 'גבוהה',
  high: 'גבוהה',
  medium: 'בינונית',
  partial: 'חלקית',
  low: 'נמוכה',
  insufficient: 'נמוכה',
  unavailable: 'אין מספיק נתונים',
})

const reliabilityLabel = value => RELIABILITY_LABELS[clean(value)] || 'אין מספיק נתונים'

const BALANCE_KPI_PRESENTATION = Object.freeze({
  minutes: {
    title: 'חלוקת דקות',
    iconId: 'time',
    description: 'בודק עד כמה דקות המשחק מרוכזות אצל מספר מצומצם של שחקנים.',
    unavailableReason: 'אין עדיין מספיק מידע כדי לקבוע את דפוס חלוקת הדקות.',
    tooltip: 'מבוסס על ריכוז הדקות אצל חמשת השחקנים בעלי מספר הדקות הגבוה ביותר.',
    profileBands: {
      below_typical: ['מפוזרת', 'ריכוז דקות נמוך מהטווח הטיפוסי', 'הדקות מתחלקות בין יותר שחקנים.'],
      typical: ['טיפוסית', 'ריכוז דקות בטווח הטיפוסי', 'חלוקת הדקות דומה למצופה.'],
      above_typical: ['מרוכזת', 'ריכוז דקות גבוה מהטווח הטיפוסי', 'הדקות מרוכזות אצל פחות שחקנים.'],
    },
    bands: {
      below_typical: ['נמוך', 'המדד מראה איך מתחלקות דקות המשחק בין שחקני הסגל.'],
      typical: ['רגיל', 'המדד מראה איך מתחלקות דקות המשחק בין שחקני הסגל.'],
      above_typical: ['גבוה', 'המדד מראה איך מתחלקות דקות המשחק בין שחקני הסגל.'],
    },
  },
  depth: {
    title: 'עומק שימוש',
    profileTitle: 'שימוש בסגל',
    iconId: 'players',
    description: 'בודק כמה שחקנים מקבלים שימוש משמעותי לאורך העונה.',
    unavailableReason: 'אין עדיין מספיק מידע כדי לקבוע את דפוס השימוש בסגל.',
    tooltip: 'מבוסס על מספר השחקנים שמגיעים לספי השימוש בדקות האפשריות.',
    profileBands: {
      below_typical: ['מצומצם', 'מספר השחקנים בשימוש משמעותי נמוך מהטווח הטיפוסי', 'פחות שחקנים מעורבים באופן משמעותי מהמצופה.'],
      typical: ['בטווח הרגיל', 'מספר השחקנים בשימוש משמעותי נמצא בטווח הטיפוסי', 'מספר השחקנים המעורבים באופן משמעותי דומה למצופה.'],
      above_typical: ['רחב', 'מספר השחקנים בשימוש משמעותי גבוה מהטווח הטיפוסי', 'יותר שחקנים מעורבים באופן משמעותי מהמצופה.'],
    },
    bands: {
      below_typical: ['נמוך', 'המדד מראה כמה שחקנים מקבלים שימוש משמעותי בדקות המשחק.'],
      typical: ['רגיל', 'המדד מראה כמה שחקנים מקבלים שימוש משמעותי בדקות המשחק.'],
      above_typical: ['גבוה', 'המדד מראה כמה שחקנים מקבלים שימוש משמעותי בדקות המשחק.'],
    },
  },
  production: {
    title: 'פיזור שערים',
    iconId: 'goals',
    description: 'בודק עד כמה התפוקה ההתקפית מרוכזת אצל שחקן אחד או מתחלקת בין מספר שחקנים.',
    unavailableReason: 'אין עדיין מספיק מידע כדי לקבוע את דפוס פיזור השערים.',
    tooltip: 'מבוסס על חלקו של השחקן המוביל בתפוקת השערים של הקבוצה.',
    profileBands: {
      below_typical: ['מפוזר', 'ריכוז תפוקה נמוך מהטווח הטיפוסי', 'התפוקה מתחלקת בין יותר שחקנים.'],
      typical: ['טיפוסי', 'ריכוז תפוקה בטווח הטיפוסי', 'פיזור התפוקה דומה למצופה.'],
      above_typical: ['מרוכז', 'ריכוז תפוקה גבוה מהטווח הטיפוסי', 'חלק גדול מהתפוקה מרוכז אצל מעט שחקנים.'],
    },
    bands: {
      below_typical: ['נמוך', 'המדד מראה איך מתחלקת תפוקת השערים בין שחקני הקבוצה.'],
      typical: ['רגיל', 'המדד מראה איך מתחלקת תפוקת השערים בין שחקני הקבוצה.'],
      above_typical: ['גבוה', 'המדד מראה איך מתחלקת תפוקת השערים בין שחקני הקבוצה.'],
    },
  },
  rotation: {
    title: 'חלוקת ההרכב הפותח',
    profileTitle: 'רוטציה בהרכב',
    iconId: 'formation',
    description: 'בודק עד כמה הפתיחות בהרכב מתחלקות בין שחקני הסגל.',
    unavailableReason: 'אין עדיין מספיק מידע כדי לקבוע את דפוס הרוטציה בהרכב.',
    tooltip: 'מבוסס על ריכוז הפתיחות אצל השחקנים שמתחילים בהרכב בתדירות הגבוהה ביותר.',
    profileBands: {
      below_typical: ['רוטציה רחבה', 'ריכוז פתיחות נמוך מהטווח הטיפוסי', 'הפתיחות מתחלקות בין יותר שחקנים.'],
      typical: ['טיפוסית', 'ריכוז פתיחות בטווח הטיפוסי', 'חלוקת הפתיחות דומה למצופה.'],
      above_typical: ['הרכב קבוע', 'ריכוז פתיחות גבוה מהטווח הטיפוסי', 'הפתיחות מרוכזות אצל מספר מצומצם של שחקנים.'],
    },
    bands: {
      below_typical: ['נמוך', 'המדד מראה איך מתחלקות הפתיחות בהרכב בין שחקני הקבוצה.'],
      typical: ['רגיל', 'המדד מראה איך מתחלקות הפתיחות בהרכב בין שחקני הקבוצה.'],
      above_typical: ['גבוה', 'המדד מראה איך מתחלקות הפתיחות בהרכב בין שחקני הקבוצה.'],
    },
  },
});
const buildBalanceCard = ({ key, band }) => {
  const definition = BALANCE_KPI_PRESENTATION[key]
  const presentation = definition?.bands?.[clean(band)] || null
  const profilePresentation = definition?.profileBands?.[clean(band)] || null

  return {
    key,
    title: definition?.title || '',
    profileTitle: definition?.profileTitle || definition?.title || '',
    band: clean(band),
    value: presentation?.[0] || 'אין סטטוס שמור',
    meaning: presentation?.[1] || 'לא נשמר סטטוס להשוואה עבור מדד זה.',
    description: definition?.description || '',
    tooltip: definition?.tooltip || '',
    profileValue: profilePresentation?.[0] || 'אין עדיין הערכה',
    profileFinding: profilePresentation?.[1] || 'אין מספיק מידע לקביעת דפוס',
    profileImplication: profilePresentation?.[2] || '',
    availabilityReason: profilePresentation
      ? ''
      : definition?.unavailableReason || 'אין מספיק נתונים זמינים כדי להשוות את המדד לטווח הקבוצות הרלוונטי.',
    iconId: definition?.iconId || 'info',
  }
}

const buildBalance = ({ seasonDoc }) => {
  if (!seasonDoc || typeof seasonDoc !== 'object') return null

  const balance = seasonDoc.teamBalance && typeof seasonDoc.teamBalance === 'object'
    ? seasonDoc.teamBalance
    : null
  const reliability = balance?.reliability || {}

  return {
    cards: [
      buildBalanceCard({ key: 'minutes', band: balance?.bands?.minutesTop5 }),
      buildBalanceCard({ key: 'depth', band: balance?.bands?.usage50 }),
      buildBalanceCard({ key: 'production', band: balance?.bands?.productionTop1 }),
      buildBalanceCard({ key: 'rotation', band: balance?.bands?.rotationStartsTop5 }),
    ],
    reliability: {
      key: clean(reliability.reliability),
      label: reliabilityLabel(reliability.reliability),
      loadedCoverage: percent(reliability.loadedCoverage),
    },
  }
}

const buildStructure = ({ seasonDoc }) => {
  const balance = seasonDoc?.teamBalance
  const structure = balance?.lineStructure
  if (!structure || typeof structure !== 'object') return null

  const lines = structure.lines || {}
  const classifiedPlayers = numberOrNull(structure.classifiedPlayersCount)
  const relevantPlayers = numberOrNull(structure.relevantPlayersCount)
  const unclassifiedSufficientSamplePlayers = numberOrNull(
    structure.unclassifiedSufficientSamplePlayersCount
  )
  const insufficientSamplePlayers = numberOrNull(structure.insufficientSamplePlayersCount)
  const midfieldPlayers = numberOrNull(lines.midfield?.playersCount)
  const percentOfRelevantPlayers = value => (
    relevantPlayers !== null && relevantPlayers > 0 && value !== null
      ? Math.round((value / relevantPlayers) * 100)
      : null
  )

  return {
    availability: balance?.scoutInterpretation?.availability ||
      balance?.balanceAvailability?.availability ||
      'unavailable',
    availabilityReason: balance?.scoutInterpretation?.availabilityReason ||
      balance?.balanceAvailability?.availabilityReason ||
      null,
    conclusion: 'מבנה שחקנים מזוהים',
    conclusionDetail: 'הנתונים מתארים את הסיווג העונתי ואת ההשוואה לנקודת ייחוס. הם אינם קובעים צורך, חוסר או הזדמנות סקאוטינג.',
    lines: {
      goalkeeper: numberOrNull(structure.goalkeeperPlayersCount),
      defense: numberOrNull(lines.defense?.playersCount),
      midfield: midfieldPlayers,
      attack: numberOrNull(lines.attack?.playersCount),
      classified: classifiedPlayers,
      unclassifiedSufficientSample: unclassifiedSufficientSamplePlayers,
      insufficientSample: insufficientSamplePlayers,
    },
    rates: {
      classified: percentOfRelevantPlayers(classifiedPlayers),
      unclassifiedSufficientSample: percentOfRelevantPlayers(unclassifiedSufficientSamplePlayers),
      insufficientSample: percentOfRelevantPlayers(insufficientSamplePlayers),
    },
    coverageLabel: classifiedPlayers !== null
        ? `מבוסס על ${classifiedPlayers} שחקנים שסווגו`
        : 'הערכת המבנה מבוססת על השחקנים העומדים בתנאי הסיווג בעונה.',
    benchmark: balance?.lineupBenchmark || null,
    classificationCoverageBenchmark: balance?.classificationCoverageBenchmark || null,
    teamInterest: balance?.scoutInterpretation?.teamInterest || null,
    interestPresentation: {
      offense: getTeamLineInterestPresentation(
        balance?.scoutInterpretation?.teamInterest?.lines?.offense?.reason
      ),
      defense: getTeamLineInterestPresentation(
        balance?.scoutInterpretation?.teamInterest?.lines?.defense?.reason
      ),
      squad: getTeamSquadInterestPresentation({
        reason: balance?.scoutInterpretation?.teamInterest?.squad?.reason,
        offensePerformanceBand: balance?.scoutInterpretation?.offense?.performanceBand,
        defensePerformanceBand: balance?.scoutInterpretation?.defense?.performanceBand,
      }),
    },
    details: [],
  }
}

const getPlayerStats = player => (
  player?.playerStats && typeof player.playerStats === 'object'
    ? player.playerStats
    : player || {}
)

const LINE_CLASSIFICATION_REASON_LABELS = Object.freeze({
  known_goalkeeper: 'שוער מוחרג מהסיווג העונתי',
  insufficient_games: 'לא עומד בתנאי מספר המשחקים לסיווג',
  missing_goals: 'חסר נתון שערים',
  missing_minutes_context: 'חסרים נתוני דקות, משחקים או הרכב פותח',
  invalid_minutes_context: 'לא ניתן לחשב את הקשר הדקות האישי',
  below_minutes_threshold: 'לא עומד בתנאי הדקות לסיווג',
  no_classification: 'לא נמצא סיווג מתאים לפי מודל הסקאוט',
})

const buildPositionRuleLabel = ({ evaluation, classification }) => {
  if (evaluation?.reasonCode !== 'classified') {
    return LINE_CLASSIFICATION_REASON_LABELS[evaluation?.reasonCode] ||
      'אין סיווג זמין לפי מודל הסקאוט'
  }

  const line = clean(classification?.line)
  const position = clean(classification?.position)
  if (position === 'ATTACKING_MIDFIELDER') return 'סווג כקשר התקפי לפי מודל הסקאוט'
  if (position === 'FULLBACK') return 'סווג כמגן לפי מודל הסקאוט'
  if (line === 'ATTACK') return 'סווג להתקפה לפי מודל הסקאוט'
  if (line === 'MIDFIELD') return 'סווג לקישור לפי מודל הסקאוט'
  if (line === 'DEFENSE') return 'סווג להגנה לפי מודל הסקאוט'
  return 'סווג לפי מודל הסקאוט'
}

const MINUTES_BAND_LABELS = Object.freeze({
  high: 'גבוה',
  medium_high: 'בינוני־גבוה',
  medium: 'בינוני',
  low: 'נמוך',
})

const SUBSTITUTION_BAND_LABELS = Object.freeze({
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
})

const resolveMinutesBand = value => MINUTES_BAND_LABELS[clean(value)] || 'לא זמין'
const resolveSubstitutionBand = value => SUBSTITUTION_BAND_LABELS[clean(value)] || 'לא זמין'

const LINE_SORT_ORDER = Object.freeze({
  DEFENSE: 0,
  MIDFIELD: 1,
  ATTACK: 2,
})

const resolveStructureFilterKeys = ({ player, classification, isGoalkeeper, evaluation }) => {
  if (!isTeamLineBalanceRelevantPlayer(player) || clean(player?.statsStatus) !== 'loaded') return []

  const line = clean(classification?.line)
  if (isGoalkeeper) {
    return [TEAM_STRUCTURE_FILTER.GOALKEEPER, TEAM_STRUCTURE_FILTER.CLASSIFIED]
  }
  if (line) {
    const lineFilter = {
      DEFENSE: TEAM_STRUCTURE_FILTER.DEFENSE,
      MIDFIELD: TEAM_STRUCTURE_FILTER.MIDFIELD,
      ATTACK: TEAM_STRUCTURE_FILTER.ATTACK,
    }[line]

    return [TEAM_STRUCTURE_FILTER.CLASSIFIED, lineFilter].filter(Boolean)
  }

  return [evaluation?.eligible
    ? TEAM_STRUCTURE_FILTER.UNCLASSIFIED_SUFFICIENT_SAMPLE
    : TEAM_STRUCTURE_FILTER.INSUFFICIENT_SAMPLE]
}

const buildPositionClassificationRows = ({ seasonDoc }) => {
  const players = Array.isArray(seasonDoc?.teamPlayers) ? seasonDoc.teamPlayers : []

  return players
    .map((player, index) => {
      const stats = getPlayerStats(player)
      const minutes = numberOrNull(stats.minutes)
      const teamMinutes = numberOrNull(stats.teamMinutes)
      const games = numberOrNull(stats.games)
      const teamGames = numberOrNull(stats.teamGames)
      const starts = numberOrNull(stats.starts)
      const substitutedOut = numberOrNull(stats.substitutedOut)
      const evaluation = buildTeamPlayerLineClassificationEvaluation({ player })
      const gameMinutes = numberOrNull(evaluation.gameMinutes)
      const possiblePlayerMinutes = numberOrNull(evaluation.possiblePlayerMinutes)
      const minutesRate = percent(evaluation.minutesRate)
      const substitutionRate = percent(evaluation.substitutionRate)
      const primaryPosition = clean(player?.primaryPosition).toUpperCase()
      const positionLayer = clean(player?.positionLayer).toLowerCase()
      const classification = player?.lineClassification || evaluation.classification || null
      const isGoalkeeper = isTeamPlayerKnownGoalkeeper({ player })

      return {
        id: clean(player?.playerId || player?.playerDocumentId || player?.id || index),
        player,
        name: clean(player?.fullName || player?.name || player?.playerName) || 'שחקן ללא שם',
        playerUrl: clean(player?.playerUrl),
        rosterStatus: clean(player?.rosterStatus),
        manualTransferDirection: clean(player?.manualTransferDirection || player?.transferDirection),
        games,
        goals: numberOrNull(stats.goals),
        minutes,
        teamMinutes,
        teamGames,
        gameMinutes,
        possiblePlayerMinutes,
        minutesRate,
        minutesBand: resolveMinutesBand(evaluation.minutesBand),
        starts,
        substitutedOut,
        substitutionRate,
        substitutionBand: resolveSubstitutionBand(evaluation.substitutionBand),
        primaryPosition,
        positionLayer,
        isGoalkeeper,
        classification,
        structureFilterKeys: resolveStructureFilterKeys({
          player,
          classification,
          isGoalkeeper,
          evaluation,
        }),
        rule: buildPositionRuleLabel({ evaluation, classification }),
      }
    })
    .sort((left, right) => {
      const leftOrder = left.isGoalkeeper
        ? 0
        : (LINE_SORT_ORDER[clean(left.classification?.line)] ?? 3) + 1
      const rightOrder = right.isGoalkeeper
        ? 0
        : (LINE_SORT_ORDER[clean(right.classification?.line)] ?? 3) + 1

      return leftOrder - rightOrder || left.name.localeCompare(right.name, 'he')
    })
}

const seasonOrder = season => {
  const match = clean(season?.seasonKey || season?.seasonId).match(/^(\d{2})[/_-](\d{2})$/)
  return match ? Number(match[1]) : 0
}

const findPreviousSeason = ({ teamSeasons, selectedSeasonKey }) => {
  const rows = (Array.isArray(teamSeasons) ? teamSeasons : [])
    .filter(Boolean)
    .sort((left, right) => seasonOrder(right) - seasonOrder(left))
  const index = rows.findIndex(row => clean(row.seasonKey || row.seasonId) === clean(selectedSeasonKey))
  return index >= 0 && index < rows.length - 1 ? rows[index + 1] : null
}

const buildSeasonTimeline = ({ team = {}, teamSeasons = [], selectedSeasonKey = '', selectedSeasonOption = null } = {}) => {
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
      ? (numberOrNull(season?.tableRank) ?? numberOrNull(team?.tableRank))
      : numberOrNull(season?.tableRank),
    status: isSelected && selectedSeasonOption?.target === 'future' ? 'upcoming' : 'available',
  })

  return [
    toEntry(selectedSeason || { seasonKey: selectedKey }, true),
    ...previousSeasons.map(season => toEntry(season)),
  ].filter(entry => entry.seasonKey)
}

const buildPriorityTimeline = ({ side, team = {}, teamSeasons = [], selectedSeasonKey = '', selectedSeasonOption = null } = {}) => {
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
const buildPerformance = team => [
  ['מיקום בטבלה', numberOrNull(team?.tableRank)],
  ['משחקים', numberOrNull(team?.games)],
  ['שערים למשחק', numberOrNull(team?.goalsForPerGame)],
  ['ספיגה למשחק', numberOrNull(team?.goalsAgainstPerGame)],
  ['דירוג התקפה', numberOrNull(team?.tableAttackRank)],
  ['דירוג הגנה', numberOrNull(team?.tableDefenseRank)],
]

const buildSeasonChange = ({ balance, previousBalance, season, previousSeason }) => {
  if (!previousSeason || !previousBalance || !balance) return []
  const playersCount = Array.isArray(season?.teamPlayers) ? season.teamPlayers.length : null
  const previousPlayersCount = Array.isArray(previousSeason?.teamPlayers) ? previousSeason.teamPlayers.length : null
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

export const buildTeamInformationView = ({
  team = {},
  teamSeasons = [],
  selectedTeamSeason = null,
  selectedSeasonKey = '',
  selectedSeasonOption = null,
} = {}) => {
  const previousSeason = findPreviousSeason({ teamSeasons, selectedSeasonKey })
  const balance = buildBalance({ seasonDoc: selectedTeamSeason })
  const previousBalance = buildBalance({ seasonDoc: previousSeason })
  const structure = buildStructure({ seasonDoc: selectedTeamSeason })
  const positionClassificationRows = buildPositionClassificationRows({
    seasonDoc: selectedTeamSeason,
  })
  const lineInterpretation = selectedTeamSeason
    ? buildTeamLineInterpretationState({
      teamDocument: team || {},
      seasonDocument: selectedTeamSeason,
      balanceState: selectedTeamSeason.teamBalance || null,
    })
    : null

  return {
    team,
    selectedSeasonKey: clean(selectedSeasonKey),
    balance,
    structure,
    positionClassificationRows,
    lineInterpretation,
    performance: buildPerformance(team),
    seasonTimeline: buildSeasonTimeline({ team, teamSeasons, selectedSeasonKey, selectedSeasonOption }),
    offensePriorityTimeline: buildPriorityTimeline({
      side: 'offense', team, teamSeasons, selectedSeasonKey, selectedSeasonOption,
    }),
    defensePriorityTimeline: buildPriorityTimeline({
      side: 'defense', team, teamSeasons, selectedSeasonKey, selectedSeasonOption,
    }),
    previousSeasonKey: clean(previousSeason?.seasonKey || previousSeason?.seasonId),
    seasonChange: buildSeasonChange({ balance, previousBalance, season: selectedTeamSeason, previousSeason }),
  }
}




