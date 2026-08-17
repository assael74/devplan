// src/features/playersDatabase/ui/pages/playerPage/logic/playerScoutView.js

import { resolveCurrentSeasonContext } from './playerPage.utils.js'
import { SCOUT_PROFILES } from '../../../../../../shared/scouting/players/profiles.js'

const ACTION_LABELS = {
  immediate: 'לבדוק עכשיו',
  priority: 'עדיפות גבוהה',
  watch: 'מעקב',
  remove: 'הוסר',
  unknown: 'לא נקבעה',
}

const ACTION_NOTES = {
  immediate: 'השחקן מצדיק בדיקה מקצועית מיידית.',
  priority: 'השחקן מצדיק בדיקה מקצועית בזמן הקרוב.',
  watch: 'השחקן מסומן למעקב עד שיצטברו נתונים או אימות נוסף.',
  remove: 'הפרופיל הוסר מהמצב הפעיל בעקבות החלטה ידנית.',
  unknown: 'המנוע עדיין לא קבע רמת עניין לשחקן.',
}

const ACTION_COLORS = {
  immediate: 'danger',
  priority: 'warning',
  watch: 'neutral',
  remove: 'neutral',
  unknown: 'neutral',
}

const TRAJECTORY_LABELS = {
  breakthrough: 'פריצה',
  up: 'מתחזק',
  stable: 'יציב',
  down: 'נחלש',
  unknown: 'לא ידוע',
}

const TREND_LABELS = {
  closing_fast: 'מתקרב במהירות',
  closing: 'מתקרב',
  stable: 'יציב',
  moving_away: 'מתרחק',
  unknown: 'לא ידוע',
}

const TEAM_CONTEXT_LABELS = {
  supportive: 'תומך',
  neutral: 'נייטרלי',
  adverse: 'מאתגר',
  mixed: 'מעורב',
  unavailable: 'לא זמין',
}

const COMPETITION_CONTEXT_LABELS = {
  plays_above_club_level: 'משחק מעל רמת המועדון',
  plays_at_club_level: 'משחק בהתאם לרמת המועדון',
  plays_below_club_level: 'משחק מתחת לרמת המועדון',
  unavailable: 'הקשר תחרותי לא זמין',
}

const METRIC_LABELS = {
  games: 'משחקים',
  goals: 'שערים',
  minutes: 'דקות',
  starts: 'פתיחות',
  goalsPerGameDuration: 'קצב הבקעה',
  goalsPer90: 'שערים ל־90',
  goalsShareOfTeam: 'חלק משערי הקבוצה',
  startsPct: 'אחוז פתיחות',
  minutesPct: 'אחוז דקות',
  minutesPerGame: 'דקות למשחק',
  scoringGamesPct: 'משחקים עם שער',
  yellowCards: 'צהובים',
  yellowCardsPer90: 'צהובים ל־90',
  subIn: 'כניסות כמחליף',
  subInPct: 'אחוז כניסות כמחליף',
  subOut: 'יציאות בחילוף',
  subOutPct: 'אחוז יציאות בחילוף',
  isYoungerAgeGroup: 'שנתון צעיר',
  topClubOpportunityEligible: 'הזדמנות במועדון מוביל',
  clubLevel: 'רמת מועדון',
}

const METRIC_UNITS = {
  games: 'משחקים',
  goals: 'שערים',
  minutes: 'דקות',
  starts: 'פתיחות',
  goalsPerGameDuration: 'שערים למשחק',
  goalsPer90: 'שערים ל־90',
  goalsShareOfTeam: 'משערי הקבוצה',
  startsPct: 'פתיחות',
  minutesPct: 'מהדקות',
  minutesPerGame: 'דקות למשחק',
  scoringGamesPct: 'משחקים עם שער',
  yellowCards: 'צהובים',
  yellowCardsPer90: 'צהובים ל־90',
  subIn: 'כניסות',
  subInPct: 'כניסות כמחליף',
  subOut: 'יציאות',
  subOutPct: 'יציאות בחילוף',
  clubLevel: 'רמת מועדון',
}

const REASON_LABELS = {
  elite_goal_total: 'כמות שערים גבוהה',
  exceptional_goal_total: 'כמות שערים חריגה',
  minimum_minutes_sample: 'מדגם דקות מספק',
  deep_minutes_sample: 'מדגם דקות עמוק',
  enough_goal_sample: 'מדגם שערים מספק',
  strong_goal_sample: 'מדגם שערים חזק',
  elite_goals_per_game_duration: 'קצב הבקעה גבוה',
  exceptional_goals_per_game_duration: 'קצב הבקעה חריג',
  high_team_goals_share: 'תלות התקפית גבוהה',
  elite_team_goals_share: 'תלות התקפית חריגה',
  max_starter_load: 'נוכחות קבועה בהרכב',
  elite_starter_share: 'נוכחות כמעט מלאה בהרכב',
  near_full_starter: 'באנקר בהרכב',
  very_high_minutes: 'עומס דקות גבוה',
  elite_minutes_load: 'עומס דקות חריג',
  max_minutes_load: 'נוכחות גבוהה מאוד בדקות',
  defensive_goal_threat: 'איום הבקעה מעמדה אחורית',
  elite_defensive_goal_threat: 'איום הבקעה חריג מעמדה אחורית',
  younger_age_group: 'משחק בשנתון גבוה יותר',
  minimum_games_sample: 'מדגם משחקים מספק',
  deep_games_sample: 'מדגם משחקים עמוק',
  low_cards: 'משמעת נקייה',
  never_subbed_out: 'לא מוחלף',
  near_double_digit_goals: 'קרוב לדו־ספרתי בשערים',
  strong_secondary_goal_total: 'כמות שערים משנית חזקה',
  top_club_or_level_two_first_team: 'הזדמנות במועדון/רמה גבוהה',
  low_minutes_share: 'מעט דקות',
  not_younger_age_group: 'לא שנתון צעיר',
  top_club_only: 'מועדון מוביל',
  many_appearances: 'הרבה הופעות',
  low_minutes_per_appearance: 'מעט דקות להופעה',
  frequent_substitute_in: 'נכנס הרבה כמחליף',
  few_starts: 'מעט פתיחות',
}

const REASON_SUB_LABELS = {
  minimum_minutes_sample: 'מדגם דקות מספק לקבלת החלטה ראשונית.',
  deep_minutes_sample: 'בסיס הדקות מספיק עמוק כדי לחזק את הסיגנל.',
  enough_goal_sample: 'כמות השערים כבר אינה מקרית בלבד.',
  strong_goal_sample: 'מדגם השערים חזק ביחס לפרופיל.',
  elite_goals_per_game_duration: 'קצב ההבקעה עובר את רף הפרופיל.',
  exceptional_goals_per_game_duration: 'קצב ההבקעה חריג ביחס לסביבה.',
  high_team_goals_share: 'חלק משמעותי מההתקפה עובר דרך השחקן.',
  elite_team_goals_share: 'התלות ההתקפית של הקבוצה בשחקן חריגה.',
  max_starter_load: 'השחקן מקבל אמון עקבי בהרכב.',
  elite_starter_share: 'הנוכחות בהרכב כמעט מלאה.',
  near_full_starter: 'השחקן מתפקד כשחקן הרכב קבוע.',
  very_high_minutes: 'עומס הדקות מצביע על תפקיד משמעותי.',
  elite_minutes_load: 'היקף הדקות חריג ביחס לסביבה.',
  max_minutes_load: 'השחקן כמעט לא יוצא מהרוטציה.',
  younger_age_group: 'השחקן מקבל הזדמנות מול סביבת גיל גבוהה יותר.',
  low_cards: 'היקף הכרטיסים נשאר בטווח שמאפשר לראות בו שחקן יציב ואמין.',
  never_subbed_out: 'כאשר הוא פותח, הוא כמעט לא יוצא מהרוטציה.',
  near_double_digit_goals: 'כמות השערים קרובה לרף דו־ספרתי.',
  strong_secondary_goal_total: 'כמות השערים חזקה לפרופיל איום משני.',
  low_minutes_share: 'היקף הדקות נמוך ביחס לפוטנציאל הסביבה.',
  many_appearances: 'הוא מופיע מספיק פעמים כדי לזהות דפוס שימוש.',
  low_minutes_per_appearance: 'הוא מקבל מעט דקות בכל הופעה.',
  frequent_substitute_in: 'תפקידו כרגע בעיקר כניסה מהספסל.',
  few_starts: 'מספר הפתיחות נמוך ביחס לכמות ההופעות.',
}


const FUTURE_OUTLOOK_LABELS = {
  upside: 'הזדמנות אפשרית',
  risk: 'סביבה צפויה להתחזק',
  stable: 'יציב',
  unknown: 'לא ידוע',
}

const clean = value => String(
  value === null || value === undefined ? '' : value
).trim()

const toNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const formatNumber = value => {
  const number = toNumber(value)

  if (number === null) return '-'
  if (Number.isInteger(number)) return String(number)

  return number.toFixed(2)
}

const formatPercent = value => {
  const number = toNumber(value)

  if (number === null) return '-'

  return `${Math.round(number * 100)}%`
}

const formatMetricValue = (metric, value) => {
  if (metric === 'isYoungerAgeGroup' || metric === 'topClubOpportunityEligible') {
    return value ? 'כן' : 'לא'
  }

  if (
    metric === 'goalsShareOfTeam' ||
    metric === 'startsPct' ||
    metric === 'minutesPct' ||
    metric === 'scoringGamesPct'
  ) {
    return formatPercent(value)
  }

  return formatNumber(value)
}

const resolveProfileId = profile => clean(
  profile?.profileId ||
  profile?.id ||
  ''
)

const resolveProfileDefinition = profile => {
  const profileId = resolveProfileId(profile)

  return SCOUT_PROFILES.find(item => item.id === profileId) || null
}

const resolveProfileLabel = profile => {
  const profileDefinition = resolveProfileDefinition(profile)

  return clean(
    profile?.label ||
    profile?.profileLabel ||
    profileDefinition?.label ||
    resolveProfileId(profile)
  )
}

const buildProfileItem = (profile, hierarchySignal = null) => {
  if (!profile && !hierarchySignal) return null

  const source = profile || hierarchySignal
  const depthPct = toNumber(
    source?.profileDepth?.depthPct !== undefined
      ? source.profileDepth.depthPct
      : hierarchySignal?.profileDepth?.depthPct
  )
  return {
    id: resolveProfileId(source),
    label: resolveProfileLabel(source),
    depthPct,
    depthLabel: depthPct === null ? '' : formatDepth(depthPct),
  }
}

const buildProfilesView = scout => {
  const profiles = Array.isArray(scout?.profiles) ? scout.profiles : []
  const hierarchy = scout?.profileHierarchy && typeof scout.profileHierarchy === 'object'
    ? scout.profileHierarchy
    : {}
  const progression = scout?.profileProgression && typeof scout.profileProgression === 'object'
    ? scout.profileProgression
    : {}
  const byId = new Map(profiles.map(profile => [resolveProfileId(profile), profile]))
  const primaryProfileId = clean(hierarchy.primaryProfileId)
  const primaryProfile = byId.get(primaryProfileId) || hierarchy.primarySignal || profiles[0] || null
  const resolvedPrimaryId = resolveProfileId(primaryProfile)
  const orderedProfileIds = Array.isArray(hierarchy.orderedProfileIds)
    ? hierarchy.orderedProfileIds.map(clean).filter(Boolean)
    : []
  const supportingProfileIds = Array.isArray(hierarchy.supportingProfileIds)
    ? hierarchy.supportingProfileIds.map(clean).filter(Boolean)
    : []
  const supportingOrder = orderedProfileIds.length
    ? orderedProfileIds
    : supportingProfileIds.length
      ? supportingProfileIds
      : profiles.map(resolveProfileId)
  const supportingSignals = Array.isArray(hierarchy.supportingSignals)
    ? hierarchy.supportingSignals
    : []
  const supportingSignalById = new Map(
    supportingSignals
      .map(signal => [resolveProfileId(signal), signal])
      .filter(([profileId]) => profileId)
  )
  const supporting = supportingOrder
    .filter(profileId => profileId && profileId !== resolvedPrimaryId)
    .map(profileId => buildProfileItem(
      byId.get(profileId),
      supportingSignalById.get(profileId) || null
    ))
    .filter(Boolean)
  const nearProfile = progression.nearestProfile || (Array.isArray(progression.nearProfiles)
    ? progression.nearProfiles[0]
    : null)

  return {
    primary: buildProfileItem(primaryProfile, hierarchy.primarySignal),
    supporting,
    near: nearProfile ? {
      id: clean(nearProfile.profileId || nearProfile.id),
      label: clean(nearProfile.profileLabel || nearProfile.label) || resolveProfileLabel(nearProfile),
      distance: toNumber(nearProfile.distance),
      distancePct: toNumber(nearProfile.distancePct),
    } : null,
  }
}

const formatDepth = value => {
  const number = toNumber(value)

  if (number === null) return ''

  return `${number >= 0 ? '+' : ''}${Math.round(number)}% מעל הרף`
}

const formatRuleTarget = rule => {
  if (!rule) return ''

  const metric = clean(rule.metric)

  if (rule.op === 'gte') return `לפחות ${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'gt') return `מעל ${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'lte') return `עד ${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'lt') return `פחות מ־${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'eq') return `שווה ל־${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'between') {
    return `בין ${formatMetricValue(metric, rule.min)} ל־${formatMetricValue(metric, rule.max)}`
  }
  if (rule.op === 'truthy') return 'נדרש כן'
  if (rule.op === 'falsy') return 'נדרש לא'
  if (rule.op === 'in') {
    return `אחד מתוך ${(rule.values || []).map(value => formatMetricValue(metric, value)).join(', ')}`
  }

  return ''
}

const buildDepthLabelForRule = ({ rule, value }) => {
  const current = toNumber(value)

  if (current === null) return ''

  if ((rule.op === 'gte' || rule.op === 'gt') && toNumber(rule.value)) {
    const threshold = toNumber(rule.value)
    return `${Math.round((current / threshold) * 100)}% מהרף`
  }

  if ((rule.op === 'lte' || rule.op === 'lt') && toNumber(rule.value)) {
    const threshold = toNumber(rule.value)
    return current <= threshold
      ? 'בתוך הרף'
      : `${formatMetricValue(rule.metric, current - threshold)} מעל הרף`
  }

  if (rule.op === 'between') {
    const min = toNumber(rule.min)
    const max = toNumber(rule.max)

    if (min !== null && max !== null && current >= min && current <= max) {
      return 'בתוך הטווח'
    }
  }

  if (rule.op === 'truthy' || rule.op === 'falsy' || rule.op === 'eq') {
    return 'תנאי מתקיים'
  }

  return ''
}

const getMetricSupplement = ({ metric, metrics }) => {
  const supplements = {
    goals: [
      ['goalsPerGameDuration', 'קצב למשחק'],
      ['goalsPer90', 'קצב ל־90'],
      ['goalsShareOfTeam', 'חלק משערי הקבוצה'],
    ],
    minutes: [
      ['minutesPct', 'אחוז דקות'],
      ['minutesPerGame', 'דקות למשחק'],
    ],
    minutesPct: [
      ['minutes', 'דקות'],
      ['minutesPerGame', 'דקות למשחק'],
    ],
    starts: [
      ['startsPct', 'אחוז פתיחות'],
    ],
    startsPct: [
      ['starts', 'פתיחות'],
    ],
    yellowCards: [
      ['yellowCardsPer90', 'צהובים ל־90'],
    ],
    subIn: [
      ['subInPct', 'אחוז כניסות כמחליף'],
    ],
    subOut: [
      ['subOutPct', 'אחוז יציאות בחילוף'],
    ],
  }
  const match = (supplements[metric] || []).find(([supplementMetric]) => (
    metrics?.[supplementMetric] !== null &&
    metrics?.[supplementMetric] !== undefined
  ))

  if (!match) return ''

  const [supplementMetric, label] = match

  return `${label}: ${formatMetricValue(supplementMetric, metrics[supplementMetric])}`
}

const buildEvidenceRule = evidence => {
  const threshold = evidence?.threshold

  if (evidence?.op === 'between' && threshold && typeof threshold === 'object') {
    return {
      metric: evidence.metric,
      reason: evidence.reason,
      op: evidence.op,
      min: threshold.min,
      max: threshold.max,
    }
  }

  if (evidence?.op === 'in') {
    return {
      metric: evidence.metric,
      reason: evidence.reason,
      op: evidence.op,
      values: Array.isArray(threshold) ? threshold : [],
    }
  }

  return {
    metric: evidence?.metric,
    reason: evidence?.reason,
    op: evidence?.op,
    value: threshold,
  }
}

const mergeProfileEvidence = ({ evidence, depthRule, metrics }) => {
  const rule = buildEvidenceRule(evidence)
  const metric = clean(evidence?.metric)
  const value = evidence?.actual
  const depthLabel = depthRule?.depthPct !== undefined
    ? formatDepth(depthRule.depthPct)
    : buildDepthLabelForRule({ rule, value })

  return {
    id: `${metric}_${clean(evidence?.reason || metric)}`,
    metric,
    title: REASON_LABELS[evidence?.reason] || METRIC_LABELS[metric] || evidence?.reason || metric,
    subtitle: REASON_SUB_LABELS[evidence?.reason] || '',
    value: formatMetricValue(metric, value),
    metricLabel: METRIC_LABELS[metric] || metric,
    unit: METRIC_UNITS[metric] || '',
    ruleLabel: formatRuleTarget(rule),
    depthLabel,
    supplement: getMetricSupplement({ metric, metrics }),
  }
}

const resolveScoutRow = (rows, selectedSeasonKey) => {
  const safeRows = Array.isArray(rows) ? rows : []

  if (selectedSeasonKey) {
    return safeRows.find(row => row.seasonKey === selectedSeasonKey) || {}
  }

  return resolveCurrentSeasonContext(safeRows)
}

const buildSeasonStats = row => {
  const games = Number(row.games || 0)
  const goals = Number(row.goals || 0)

  return [
    {
      label: 'משחקים',
      value: games,
    },
    {
      label: 'שערים',
      value: goals,
    },
    {
      label: 'דקות',
      value: Number(row.minutes || 0),
    },
    {
      label: 'פתיחות',
      value: Number(row.starts || 0),
    },
    {
      label: 'שערים למשחק',
      value: games ? (goals / games).toFixed(2) : '-',
    },
    {
      label: 'פרופילים',
      value: Number(row.scoutProfileCount || 0),
    },
  ]
}

const buildMainReasons = profile => {
  const metrics = profile?.metrics || {}
  const depthRules = Array.isArray(profile?.profileDepth?.rules)
    ? profile.profileDepth.rules
    : []
  const matchEvidence = Array.isArray(profile?.matchEvidence)
    ? profile.matchEvidence.filter(item => item?.matched)
    : []
  const sourceRules = matchEvidence.map(evidence => mergeProfileEvidence({
    evidence,
    depthRule: depthRules.find(item => item.metric === evidence.metric),
    metrics,
  }))

  return sourceRules.slice(0, 4).map((rule, index) => ({
    ...rule,
    id: `${rule.id}_${index}`,
    tone: index === 0 ? 'ok' : 'info',
  }))
}

const buildEvidenceCards = profile => {
  const metrics = profile?.metrics || {}
  const depthRules = Array.isArray(profile?.profileDepth?.rules)
    ? profile.profileDepth.rules
    : []
  const matchEvidence = Array.isArray(profile?.matchEvidence)
    ? profile.matchEvidence.filter(item => item?.matched)
    : []
  const sourceRules = matchEvidence.map(evidence => mergeProfileEvidence({
    evidence,
    depthRule: depthRules.find(item => item.metric === evidence.metric),
    metrics,
  }))

  return sourceRules.slice(0, 4).map((rule, index) => ({
    id: `${rule.id}_evidence_${index}`,
    title: rule.title,
    metricLabel: rule.metricLabel,
    value: rule.value,
    unit: rule.unit,
    rule: rule.ruleLabel,
    delta: rule.depthLabel,
    supplement: rule.supplement,
    subtitle: rule.subtitle,
  }))
}

const buildWhyView = primaryProfile => {
  if (!primaryProfile) {
    return {
      profileLabel: '',
      profileDepthLabel: '',
      matchedCount: 0,
      requiredCount: 0,
      evidence: [],
    }
  }

  const matchEvidence = Array.isArray(primaryProfile?.matchEvidence)
    ? primaryProfile.matchEvidence
    : []
  const matchedEvidence = matchEvidence.filter(item => item?.matched)
  const depthPct = toNumber(primaryProfile?.profileDepth?.depthPct)

  return {
    profileLabel: resolveProfileLabel(primaryProfile),
    profileDepthLabel: depthPct === null ? '' : formatDepth(depthPct),
    matchedCount: matchedEvidence.length,
    requiredCount: matchEvidence.length,
    evidence: buildEvidenceCards(primaryProfile),
  }
}

const buildContext = profile => {
  const scoutContext = profile?.scoutContext || {}
  const competition = scoutContext.competition || {}
  const team = scoutContext.team || {}
  const futureCompetition = (
    scoutContext.futureCompetition ||
    scoutContext.competition?.futureCompetition ||
    {}
  )
  const items = []

  if (competition.leagueLevel) {
    items.push({
      label: 'רמת ליגה',
      value: formatNumber(competition.leagueLevel),
    })
  }

  if (competition.clubStrengthLevel || competition.clubLevel) {
    items.push({
      label: 'רמת מועדון',
      value: formatNumber(
        competition.clubStrengthLevel || competition.clubLevel
      ),
    })
  }

  const competitionGap = competition.levelGap !== undefined
    ? competition.levelGap
    : competition.gap

  if (competitionGap !== null && competitionGap !== undefined) {
    items.push({
      label: 'פער תחרותי',
      value: formatNumber(competitionGap),
    })
  }

  if (team.attack?.score !== null && team.attack?.score !== undefined) {
    items.push({
      label: 'הקשר התקפי',
      value: formatNumber(team.attack.score),
    })
  }

  if (team.defense?.score !== null && team.defense?.score !== undefined) {
    items.push({
      label: 'הקשר הגנתי',
      value: formatNumber(team.defense.score),
    })
  }

  if (futureCompetition.outlook) {
    items.push({
      label: 'סביבה עתידית',
      value: FUTURE_OUTLOOK_LABELS[futureCompetition.outlook] ||
        futureCompetition.outlook,
      note: futureCompetition.summary || '',
    })
  }

  return {
    items,
    competitionLabel: COMPETITION_CONTEXT_LABELS[
      competition.classification || competition.relation
    ] || '',
    teamLabel: TEAM_CONTEXT_LABELS[
      team.classification || team.relation
    ] || '',
  }
}

const buildTrajectory = (scout, historyRows = []) => {
  const trajectory = scout?.trajectory || {}
  const trajectorySummaries = Array.isArray(trajectory.seasonSummaries)
    ? trajectory.seasonSummaries
    : []
  const fallbackSummaries = (Array.isArray(historyRows) ? historyRows : [])
    .filter(row => !row.placeholder && (row.games || row.minutes || row.starts || row.goals))
  const summaries = (trajectorySummaries.length ? trajectorySummaries : fallbackSummaries).slice(-3)
  const nearest = scout?.profileProgression?.nearestProfile || null

  return {
    direction: clean(trajectory.direction),
    directionLabel: TRAJECTORY_LABELS[trajectory.direction] || 'לא ידוע',
    confidence: clean(trajectory.confidence),
    summaries: summaries.map(summary => ({
      seasonKey: clean(summary.seasonKey || summary.seasonId) || '-',
      games: Number(summary.games || 0),
      goals: Number(summary.goals || 0),
      minutes: Number(summary.minutes || 0),
      startsPct: formatPercent(summary.startsPct),
      goalsPer90: formatNumber(summary.goalsPer90),
      leagueLevel: formatNumber(summary.leagueLevel),
      clubLevel: formatNumber(
        summary.clubStrengthLevel || summary.clubLevel
      ),
      clubName: clean(summary.clubShortName || summary.clubName || summary.club),
      teamName: clean(summary.teamName || summary.team || summary.ageGroupLabel),
      leagueName: clean(summary.leagueName || summary.league),
      ageGroupLabel: clean(summary.ageGroupLabel),
    })),
    nearProfile: nearest ? {
      label: clean(nearest.profileLabel),
      distancePct: nearest.distancePct,
      previousDistancePct: nearest.previousDistancePct,
      trendLabel: TREND_LABELS[nearest.trend] || 'לא ידוע',
    } : null,
    comparison: summaries.length >= 2 ? {
      previous: summaries[summaries.length - 2],
      current: summaries[summaries.length - 1],
    } : null,
  }
}

const PLAYER_REVIEW_LABELS = {
  position: 'עמדה',
  agent_status: 'מצב סוכן',
  transfer_history: 'היסטוריית מעבר קבוצות',
  goal_distribution: 'פיזור שערים',
  minutes_distribution: 'חלוקת דקות',
  visual_review: 'צפייה בשחקן',
  agent_path_fit: 'התאמה למסלול סוכן',
  scout_path_fit: 'התאמה למסלול סקאוט',
}

const isPlayerReviewAnswered = (fieldId, entry = {}) => {
  if (fieldId === 'position') return Boolean(clean(entry.value))

  if ([
    'agent_status',
    'agent_path_fit',
    'scout_path_fit',
  ].includes(fieldId)) {
    return Boolean(clean(entry.value) && clean(entry.value) !== 'unknown')
  }

  return clean(entry.status) === 'reviewed'
}

const buildQuestions = scout => {
  const review = scout?.playerReview && typeof scout.playerReview === 'object'
    ? scout.playerReview
    : {}
  const fieldIds = Object.keys(PLAYER_REVIEW_LABELS)
  const allChecks = fieldIds.map(fieldId => {
    const entry = review[fieldId] && typeof review[fieldId] === 'object'
      ? review[fieldId]
      : {}
    const answered = isPlayerReviewAnswered(fieldId, entry)

    return {
      id: fieldId,
      label: PLAYER_REVIEW_LABELS[fieldId],
      answer: clean(entry.value || entry.status) || 'unknown',
      answerLabel: answered ? 'נבדק' : 'לא ידוע',
      answered,
      priority: '',
      tone: answered ? 'ok' : 'ask',
    }
  })
  const answered = allChecks.filter(check => check.answered).length

  return {
    completion: {
      answered,
      total: allChecks.length,
      complete: answered === allChecks.length,
    },
    checks: allChecks.filter(check => !check.answered),
  }
}

const buildBadges = ({ primaryProfile, context, opportunity }) => {
  const badges = []
  const competitionItems = Array.isArray(context.items) ? context.items : []
  const league = competitionItems.find(item => item.label === 'רמת ליגה')
  const club = competitionItems.find(item => item.label === 'רמת מועדון')

  if (primaryProfile?.label) {
    badges.push(`פרופיל מרכזי: ${primaryProfile.label}`)
  }

  if (league?.value && league.value !== '-') {
    badges.push(`ליגה רמה ${league.value}`)
  }

  if (club?.value && club.value !== '-') {
    badges.push(`מועדון רמה ${club.value}`)
  }

  if (opportunity?.exposureLevel) {
    badges.push(`חשיפה: ${opportunity.exposureLevel}`)
  }

  return badges.slice(0, 4)
}

const buildDataDepth = ({ historyRows, row }) => {
  const rows = (Array.isArray(historyRows) ? historyRows : [])
    .filter(item => !item.placeholder && (item.games || item.minutes || item.starts || item.goals))
  const seasonKeys = [...new Set(rows.map(item => clean(item.seasonKey)).filter(Boolean))]
  const currentGames = Number(row.games || 0)
  const periods = rows.length
  const seasons = seasonKeys.length

  if (!periods) {
    return {
      mode: 'emerging',
      label: 'מידע ראשוני',
      note: 'המידע עדיין בתחילת הצטברות.',
      periods: 0,
      seasons: 0,
    }
  }

  if (seasons <= 1 && currentGames < 10) {
    return {
      mode: 'emerging',
      label: 'מידע ראשוני',
      note: currentGames ? `${currentGames} משחקים בתקופה הנוכחית` : 'תקופה קצרה שעדיין מתהווה',
      periods,
      seasons,
    }
  }

  if (seasons <= 1) {
    return {
      mode: 'emerging',
      label: 'עונה אחת',
      note: `${periods} ${periods === 1 ? 'תקופה מתועדת' : 'תקופות מתועדות'} בעונה`,
      periods,
      seasons,
    }
  }

  if (seasons === 2) {
    return {
      mode: 'comparison',
      label: '2 עונות',
      note: 'קיים בסיס להשוואה בין שתי תקופות מקצועיות.',
      periods,
      seasons,
    }
  }

  return {
    mode: 'timeline',
    label: `${seasons} עונות`,
    note: 'קיים בסיס למסלול מקצועי רב־עונתי.',
    periods,
    seasons,
  }
}

const buildNextAction = ({ interest, questions }) => {
  const checks = Array.isArray(questions.checks) ? questions.checks : []
  const nextCheck = checks.find(check => !check.answered) || checks[0] || null

  if (nextCheck) {
    return {
      title: `הפעולה הבאה: ${nextCheck.label}`,
      description: 'השלמת נקודת האימות תחדד את רמת הוודאות ואת הדחיפות.',
    }
  }

  if (interest.status === 'immediate' || interest.status === 'priority') {
    return {
      title: 'הפעולה הבאה: צפייה מקצועית',
      description: 'מומלץ לתעד התרשמות מקצועית כדי להפוך את הסיגנל להחלטת עבודה.',
    }
  }

  if (interest.status === 'watch' || interest.status === 'exposed') {
    return {
      title: 'הפעולה הבאה: המשך מעקב',
      description: 'אין כרגע שאלת אימות דחופה. כדאי לעקוב אחרי המדידה הבאה.',
    }
  }

  return {
    title: 'הפעולה הבאה: טרם נקבעה',
    description: 'המנוע עדיין לא קבע רמת עניין שממנה ניתן לגזור פעולת המשך.',
  }
}

const hasMetric = (profile, metric) => (
  profile?.metrics?.[metric] !== null &&
  profile?.metrics?.[metric] !== undefined
)

const resolveStoryProfileLabel = primaryProfile => clean(
  primaryProfile?.label ||
  primaryProfile?.profileLabel ||
  primaryProfile?.name ||
  ''
)

const resolveStrongestReason = reasons => (
  Array.isArray(reasons) && reasons.length
    ? reasons[0]
    : null
)

const resolveMainContextItem = context => {
  const items = Array.isArray(context.items) ? context.items : []

  return items.find(item => item.label === 'רמת ליגה') ||
    items.find(item => item.label === 'פער תחרותי') ||
    items.find(item => item.label === 'רמת מועדון') ||
    items[0] ||
    null
}

const buildStoryTitle = ({ primaryProfile, strongestReason, context, trajectory }) => {
  const profileLabel = resolveStoryProfileLabel(primaryProfile)
  const contextLabel = context.competitionLabel || context.teamLabel
  const direction = clean(trajectory.direction)

  if (!primaryProfile) {
    if (trajectory.nearProfile) {
      return 'שחקן שנמצא בדרך לפרופיל משמעותי'
    }

    return 'שחקן שעדיין ממתין לסיגנל מקצועי ברור'
  }

  if (
    hasMetric(primaryProfile, 'goalsPerGameDuration') ||
    hasMetric(primaryProfile, 'goalsPer90') ||
    hasMetric(primaryProfile, 'goalsShareOfTeam')
  ) {
    return contextLabel
      ? 'סקורר שמייצר תפוקה גבוהה בסביבה תחרותית חזקה'
      : 'סקורר שמייצר תפוקה גבוהה'
  }

  if (
    hasMetric(primaryProfile, 'minutesPct') ||
    hasMetric(primaryProfile, 'startsPct') ||
    hasMetric(primaryProfile, 'minutesPerGame')
  ) {
    return direction === 'up' || direction === 'breakthrough'
      ? 'שחקן שמקבל יותר אחריות ונמצא במגמת התחזקות'
      : 'שחקן שמקבל אמון משמעותי ברוטציה'
  }

  if (strongestReason?.title) {
    return `${profileLabel} עם ${strongestReason.title}`
  }

  return profileLabel
    ? `${profileLabel} עם סיגנל מקצועי פעיל`
    : 'שחקן עם סיגנל מקצועי פעיל'
}

const buildStatsSentence = ({ row, primaryProfile, strongestReason }) => {
  const games = Number(row.games || 0)
  const goals = Number(row.goals || 0)
  const minutes = Number(row.minutes || 0)
  const starts = Number(row.starts || 0)
  const profileLabel = resolveStoryProfileLabel(primaryProfile)
  const parts = []

  if (goals && games) {
    parts.push(`${goals} שערים ב־${games} משחקים`)
    parts.push(`קצב של ${(goals / games).toFixed(2)} שערים למשחק`)
  } else if (minutes && games) {
    parts.push(`${minutes} דקות ב־${games} משחקים`)
  } else if (starts && games) {
    parts.push(`${starts} פתיחות ב־${games} משחקים`)
  } else if (strongestReason?.value && strongestReason?.metricLabel) {
    parts.push(`${strongestReason.metricLabel}: ${strongestReason.value}`)
  }

  if (!parts.length) return ''

  const prefix = profileLabel
    ? `בפרופיל ${profileLabel}, `
    : ''

  return `${prefix}הוא מציג ${parts.join(' ו')}.`
}

const buildEvidenceSentence = ({ strongestReason }) => {
  if (!strongestReason) return ''

  if (strongestReason.depthLabel) {
    return `המדד החזק ביותר כרגע הוא ${strongestReason.title}, עם ${strongestReason.depthLabel}.`
  }

  if (strongestReason.subtitle) {
    return strongestReason.subtitle
  }

  return `המדד הבולט ביותר כרגע הוא ${strongestReason.title}.`
}

const buildContextSentence = ({ context }) => {
  const mainItem = resolveMainContextItem(context)
  const parts = []

  if (context.competitionLabel) {
    parts.push(context.competitionLabel)
  }

  if (context.teamLabel) {
    parts.push(`ההקשר הקבוצתי ${context.teamLabel}`)
  }

  if (mainItem?.label && mainItem?.value && mainItem.value !== '-') {
    parts.push(`${mainItem.label}: ${mainItem.value}`)
  }

  if (!parts.length) return ''

  return `${parts.join(', ')}.`
}

const buildTrendSentence = ({ trajectory }) => {
  if (trajectory.nearProfile) {
    const distance = trajectory.nearProfile.distancePct
    const previousDistance = trajectory.nearProfile.previousDistancePct

    if (previousDistance !== null && previousDistance !== undefined) {
      return `במעקב הפרופילים הוא ${trajectory.nearProfile.trendLabel}: הפער מ־${trajectory.nearProfile.label} עבר מ־${previousDistance}% ל־${distance}%.`
    }

    return `הוא קרוב ל־${trajectory.nearProfile.label}, עם ${distance}% חסר לרף.`
  }

  if (trajectory.direction && trajectory.direction !== 'unknown') {
    return `המגמה המקצועית מסומנת כ־${trajectory.directionLabel}.`
  }

  return ''
}

const buildMissingInfoSentence = questions => {
  const checks = Array.isArray(questions.checks) ? questions.checks : []
  const openChecks = checks.filter(check => !check.answered)

  if (!openChecks.length) return ''

  const labels = openChecks
    .slice(0, 2)
    .map(check => check.label.replace(/\?$/, ''))

  return `כדי לחזק את ההחלטה עדיין חסר אימות לגבי ${labels.join(' ו')}.`
}

const buildPlayerStory = ({
  row,
  primaryProfile,
  reasons,
  context,
  trajectory,
  questions,
}) => {
  const strongestReason = resolveStrongestReason(reasons)
  const storyTitle = buildStoryTitle({
    primaryProfile,
    strongestReason,
    context,
    trajectory,
  })
  const sentences = [
    buildStatsSentence({ row, primaryProfile, strongestReason }),
    buildEvidenceSentence({ strongestReason }),
    buildContextSentence({ context }),
    buildTrendSentence({ trajectory }),
    buildMissingInfoSentence(questions),
  ].filter(Boolean)

  return {
    title: storyTitle,
    summary: sentences.length
      ? sentences.slice(0, 4).join(' ')
      : 'עדיין אין מספיק נתונים כדי לבנות סיפור מקצועי ברור על השחקן.',
  }
}

export const buildPlayerScoutView = ({ player, historyRows, selectedSeasonKey }) => {
  const row = resolveScoutRow(historyRows, selectedSeasonKey)
  const scout = row.scout || {}
  const opportunity = scout.opportunity || {}
  const rawProfiles = Array.isArray(scout.profiles)
    ? scout.profiles
    : Array.isArray(row.scoutProfiles)
      ? row.scoutProfiles
      : []
  const profiles = opportunity.profilesRemoved === true ? [] : rawProfiles
  const profileHierarchy = scout.profileHierarchy && typeof scout.profileHierarchy === 'object'
    ? scout.profileHierarchy
    : row.scoutProfileHierarchy || {}
  const primaryProfileId = clean(profileHierarchy.primaryProfileId)
  const primaryProfile = profiles.find(profile => resolveProfileId(profile) === primaryProfileId) ||
    profileHierarchy.primarySignal ||
    scout.primaryProfile ||
    profiles[0] ||
    null
  const effectiveActionStatus = clean(opportunity.effectiveActionStatus) || 'unknown'
  const context = buildContext(primaryProfile)
  const questions = buildQuestions(scout)
  const reasons = buildMainReasons(primaryProfile)
  const why = buildWhyView(primaryProfile)
  const trajectory = buildTrajectory(scout, historyRows)
  const dataDepth = buildDataDepth({ historyRows, row })
  const profilesView = buildProfilesView({
    ...scout,
    profiles,
    profileHierarchy,
  })
  const story = buildPlayerStory({
    row,
    primaryProfile,
    reasons,
    context,
    trajectory,
    questions,
  })
  const interest = {
    status: effectiveActionStatus,
    label: ACTION_LABELS[effectiveActionStatus] || ACTION_LABELS.unknown,
    color: ACTION_COLORS[effectiveActionStatus] || ACTION_COLORS.unknown,
    note: ACTION_NOTES[effectiveActionStatus] || ACTION_NOTES.unknown,
  }

  return {
    seasonKey: clean(row.seasonKey || player.seasonKey) || '-',
    identity: {
      playerId: clean(player.playerId || player.id),
      fullName: clean(player.fullName) || 'שחקן',
      avatarUrl: clean(player.avatarUrl),
      clubName: clean(row.clubName || player.clubName),
      clubId: clean(row.clubId || player.clubId),
      teamName: clean(row.teamName || player.teamName),
      teamId: clean(row.teamId || player.teamId),
      leagueName: clean(row.leagueName || player.leagueName),
    },
    dataDepth,
    profiles: profilesView,
    hasScoutData: Boolean(primaryProfile || profiles.length || scout.opportunity),
    storyTitle: story.title,
    storyText: story.summary,
    storySummary: story.summary,
    seasonStats: buildSeasonStats(row),
    evidenceCards: why.evidence,
    why,
    badges: buildBadges({ primaryProfile, context, opportunity }),
    interest,
    playerReview: scout.playerReview || {},
    manualDecision: opportunity.manualDecision || {},
    profileStrength: {
      depthPct: profilesView.primary?.depthPct !== undefined
        ? profilesView.primary.depthPct
        : null,
      label: profilesView.primary?.depthLabel || '-',
    },
    reasons,
    context,
    trajectory,
    questions,
    nextAction: buildNextAction({ interest, questions }),
    supportingProfiles: profilesView.supporting,
  }
}
