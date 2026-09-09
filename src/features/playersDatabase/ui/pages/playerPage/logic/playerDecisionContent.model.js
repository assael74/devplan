// Presentation model helpers for the player decision view.

import { resolveAgeGroupLabel } from '../../../../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'

const INTEREST_LABELS = {
  reasonable: 'עניין סביר',
  curious: 'מסקרן',
  interesting: 'מעניין',
  super_interesting: 'מעניין מאוד',
}

export const INTEREST_REASON_ORDER = [
  'immediacy',
  'current_profile_persistence',
  'historical_profile_persistence',
  'profile_combination',
  'combination_profile_depth',
]

export const INTEREST_REASON_LABELS = {
  immediacy: 'רמת המיידיות',
  current_profile_persistence: 'פרופיל ב־Current ובעונה קודמת',
  historical_profile_persistence: 'פרופיל בשתי עונות היסטוריות',
  profile_combination: 'שילוב פרופילים',
  combination_profile_depth: 'עומק פרופיל בקומבינציה',
}

const INTEREST_REASON_EXPLANATIONS = {
  immediacy: {
    active: 'המיידיות האוטומטית מוסיפה לניקוד העניין.',
    inactive: 'המיידיות האוטומטית אינה מוסיפה ניקוד כרגע.',
  },
  current_profile_persistence: {
    active: 'אותו פרופיל זוהה ב־Current ובעונה הקודמת.',
    inactive: 'לא זוהה אותו פרופיל ב־Current ובעונה הקודמת.',
  },
  historical_profile_persistence: {
    active: 'אותו פרופיל זוהה בשתי העונות ההיסטוריות האחרונות.',
    inactive: 'לא זוהה אותו פרופיל בשתי העונות ההיסטוריות האחרונות.',
  },
  profile_combination: {
    active: 'זוהתה קומבינציה ב־Current או בעונה ההיסטורית האחרונה.',
    inactive: 'לא זוהתה קומבינציה ב־Current או בעונה ההיסטורית האחרונה.',
  },
  combination_profile_depth: {
    active: 'לפחות פרופיל אחד בקומבינציה הוא בעומק של 50% ומעלה.',
    inactive: 'אין בקומבינציה פרופיל בעומק של 50% ומעלה.',
  },
}

export const clean = value => String(value || '').trim()

export const resolveSeasonStartYear = seasonKey => {
  const match = clean(seasonKey).match(/^(\d{2})[/_-](\d{2})$/)
  return match ? 2000 + Number(match[1]) : null
}

export const resolveNextAgeGroup = row => {
  const match = clean(row?.ageGroupId).toLowerCase().match(/^u(\d+)$/)
  return match ? resolveAgeGroupLabel({ ageGroupId: `u${Number(match[1]) + 1}` }) : '-'
}

export const getCatalogClubStrengthLevel = clubId => {
  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(
    item => clean(item?.id) === clean(clubId)
  )
  const value = Number(club?.clubStrengthLevel)
  return Number.isFinite(value) && value > 0 ? value : null
}

export const getInterestConditionExplanation = (id, active) => (
  INTEREST_REASON_EXPLANATIONS[id]?.[active ? 'active' : 'inactive'] ||
  (active ? 'התנאי פעיל בהערכת העניין.' : 'התנאי אינו פעיל כרגע.')
)

export const getInterest = player => {
  const source = player.scoutPlayerInterest ||
    player.domain?.scoutPlayerInterest ||
    player.scout?.playerInterest ||
    player.playerInterest ||
    {}
  const level = clean(source.interestLevel || source.level)
  const reasons = Array.isArray(source.reasons) ? source.reasons : []
  const factors = Array.isArray(source.factors) ? source.factors : []

  return {
    level,
    label: INTEREST_LABELS[level] || 'לא נקבע',
    score: Number.isFinite(Number(source.score)) ? Number(source.score) : 0,
    maxScore: Number.isFinite(Number(source.maxScore)) ? Number(source.maxScore) : 8,
    factors: factors.map(factor => ({
      id: clean(factor?.id),
      points: Number.isFinite(Number(factor?.points)) ? Number(factor.points) : 0,
      active: Boolean(factor?.active),
    })).filter(factor => factor.id),
    reasons: reasons.map(reason => {
      const id = clean(reason?.id || reason?.reason || reason)
      return {
        id,
        label: clean(reason?.label) || INTEREST_REASON_LABELS[id] || id,
      }
    }).filter(reason => reason.label),
  }
}

export const getLeagueLevel = row => {
  const value = row?.leagueLevel || row?.competitionLevel || row?.scout?.context?.competition?.leagueLevel
  return value === null || value === undefined || value === '' ? '' : String(value)
}


export const getAvailableMinutesPct = row => {
  const minutes = Number(row?.minutes || 0)
  const teamMinutes = Number(row?.teamMinutes || row?.playerStats?.teamMinutes || 0)
  if (!minutes || !teamMinutes) return null

  return Math.round((minutes / teamMinutes) * 100)
}

export const resolveStatTrend = (value, previousValue) => {
  if (previousValue === null || previousValue === undefined || previousValue === '') {
    return 'unavailable'
  }

  const current = Number(value)
  const previous = Number(previousValue)

  if (!Number.isFinite(current) || !Number.isFinite(previous)) return 'unavailable'
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'equal'
}


const IMMEDIACY_PARAMETER_LABELS = {
  early_age_group: 'קבוצת גיל מוקדמת',
  profile_combination: 'שילוב פרופילים מוגדר',
  ideal_club_range: 'טווח חוזק מועדון',
  ideal_league_level: 'רמת ליגה יעד',
  future_level_risk: 'סיכון ברמת התחרות העתידית',
  playing_up_validation: 'אימות משחק בשנתון גבוה יותר',
  profile_persistence: 'התמדה של הפרופיל',
  profile_combination_persistence: 'התמדה של שילוב הפרופילים',
  signal_decay: 'דעיכת הסימן לאורך זמן',
}

const IMMEDIACY_MISSING_INFO_REASONS = new Set([
  'club_strength_unavailable',
  'league_level_unavailable',
  'future_path_unavailable',
  'future_path_season_mismatch',
])

const IMMEDIACY_MISSING_PREREQUISITE_REASONS = new Set([
  'multiple_profiles_required',
  'promoted_talent_profile_required',
  'current_profile_required',
  'current_combination_required',
])

export const getImmediacyParameterLabel = item => IMMEDIACY_PARAMETER_LABELS[item.id] || item.label || item.id

const getMissedExplanation = item => {
  const details = item.details || {}

  switch (item.reason) {
    case 'age_group_not_early':
      return 'קבוצת הגיל אינה עומדת בתנאי הגיל המוקדם.'
    case 'no_defined_combination':
      return 'יש יותר מפרופיל אחד, אך לא זוהה שילוב פרופילים מוגדר.'
    case 'club_strength_outside_ideal_range':
      return Number.isFinite(Number(details.clubStrengthLevel))
        ? `חוזק המועדון הוא ${details.clubStrengthLevel}; טווח היעד הוא ${details.min}–${details.max}.`
        : 'חוזק המועדון נמצא מחוץ לטווח היעד.'
    case 'league_level_not_ideal':
      return Number.isFinite(Number(details.leagueLevel))
        ? `רמת הליגה היא ${details.leagueLevel}; רמת היעד היא ${details.targetLeagueLevel}.`
        : 'רמת הליגה אינה רמת היעד.'
    case 'future_outlook_not_risk':
      return 'המסלול העתידי אינו מסומן כרגע כסיכון שמעלה דחיפות.'
    case 'playing_up_sample_too_small':
      return Number.isFinite(Number(details.games)) && Number.isFinite(Number(details.minGames))
        ? `המדגם הוא ${details.games} משחקים; נדרשים לפחות ${details.minGames}.`
        : 'מדגם המשחקים בשנתון הגבוה עדיין קטן מהסף הנדרש.'
    case 'profile_not_repeated':
      return 'הפרופיל עדיין לא חזר במספר העונות הנדרש.'
    case 'combination_not_repeated':
      return 'שילוב הפרופילים עדיין לא חזר במספר העונות הנדרש.'
    default:
      return 'התנאי נבדק ולא התקיים.'
  }
}

const getMissingExplanation = item => {
  switch (item.reason) {
    case 'club_strength_unavailable':
      return 'חסר נתון חוזק מועדון.'
    case 'league_level_unavailable':
      return 'חסרה רמת הליגה.'
    case 'future_path_unavailable':
      return 'חסר מסלול תחרות עתידי לעונה הנוכחית.'
    case 'future_path_season_mismatch':
      return 'קיים מסלול עתידי, אך הוא אינו תואם לעונה הנוכחית.'
    case 'multiple_profiles_required':
      return 'נדרש יותר מפרופיל פעיל אחד כדי לבדוק שילוב פרופילים.'
    case 'promoted_talent_profile_required':
      return 'נדרש פרופיל של משחק בשנתון גבוה יותר כדי לבצע את הבדיקה.'
    case 'current_profile_required':
      return 'נדרש פרופיל פעיל בעונה הנוכחית כדי לבדוק התמדה.'
    case 'current_combination_required':
      return 'נדרש שילוב פרופילים פעיל בעונה הנוכחית כדי לבדוק התמדה שלו.'
    default:
      return 'אין כרגע מספיק מידע או תנאי מקדים כדי לבצע את הבדיקה.'
  }
}

export const getFactorState = item => {
  switch (item.type) {
    case 'boost':
      return { label: 'התקיים', tone: 'boost' }
    case 'reduction':
      return { label: 'הפחית', tone: 'reduction' }
    case 'no_change':
      return { label: 'לא התקיים', tone: 'missed' }
    case 'not_applicable':
      return { label: 'לא רלוונטי', tone: 'notApplicable' }
    default:
      return { label: item.resultLabel || 'מידע', tone: 'context' }
  }
}

export const getFactorExplanation = item => {
  if (item.type === 'no_change') return getMissedExplanation(item)
  if (item.type === 'not_applicable') return getMissingExplanation(item)
  if (item.type === 'reduction') return 'הפרמטר מפחית את ציון המיידיות.'
  if (item.type === 'boost') return 'הפרמטר תורם לציון המיידיות.'

  return ''
}

export const getFactorPointsLabel = item => {
  if (item.points === null || item.points === undefined) return '—'

  const points = Number(item.points)

  if (!Number.isFinite(points)) return '—'
  if (!points) return '0'

  return `${points > 0 ? '+' : ''}${points}`
}

export const getFactorPointsTone = item => {
  if (item.points === null || item.points === undefined) return 'empty'

  const points = Number(item.points)

  if (!Number.isFinite(points)) return 'empty'
  if (points > 0) return 'positive'
  if (points < 0) return 'negative'
  return 'zero'
}

export const formatImmediacyScore = value => {
  const score = Number(value)
  if (!Number.isFinite(score)) return '0'

  return `${score > 0 ? '+' : ''}${score}`
}

