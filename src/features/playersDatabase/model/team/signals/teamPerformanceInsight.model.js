// src/features/playersDatabase/model/team/signals/teamPerformanceInsight.model.js

import { numberOrNull } from '../teamInformation.utils.js'
import { buildScoutProfileGroupCounts } from '../../scout/scoutProfilesSummary.model.js'
import { TEAM_SIGNAL_CALIBRATION } from '../../../../../shared/scouting/teams/signals/teamSignalCalibration.js'

const thresholds = TEAM_SIGNAL_CALIBRATION.performance

const PRIORITY_LEVELS = ['low', 'neutral', 'positive', 'high', 'elite']
export const ADEQUATE_RELIABILITY_GAMES = 16
const PRIORITY_LABELS = {
  low: 'נמוכה',
  neutral: 'רגילה',
  positive: 'חיובית',
  high: 'גבוהה',
  elite: 'מובילה',
}
const SINGULAR_UNITS = { מקומות: 'מקום', שחקנים: 'שחקן' }

const reliabilityOf = games => {
  if (games === null || games < 8) return 'insufficient'
  if (games < 12) return 'basic'
  if (games < ADEQUATE_RELIABILITY_GAMES) return 'intermediate'
  return 'adequate'
}

const reliabilityLabel = reliability => ({
  insufficient: 'מדגם לא מספק',
  basic: 'מהימנות בסיסית',
  intermediate: 'מהימנות ביניים',
  adequate: 'מהימנות תקינה',
}[reliability])

const seasonGames = season => numberOrNull(
  season?.games === undefined || season?.games === null
    ? season?.teamStats?.teamGamePlayed
    : season.games
)

const priorityFact = ({ side, current, previous, comparable }) => {
  const currentLevel = current?.[side]?.priorityLevel || ''
  const previousLevel = previous?.[side]?.priorityLevel || ''
  const currentIndex = PRIORITY_LEVELS.indexOf(currentLevel)
  const previousIndex = PRIORITY_LEVELS.indexOf(previousLevel)
  const delta = comparable && currentIndex >= 0 && previousIndex >= 0
    ? currentIndex - previousIndex
    : null

  return {
    side,
    currentLevel,
    previousLevel,
    delta,
    significant: delta !== null && Math.abs(delta) >= thresholds.priorityChange,
  }
}

const changeText = (delta, up, down, unit) => {
  const amount = Math.abs(delta)
  return `${delta > 0 ? up : down} ב־${amount} ${amount === 1 ? SINGULAR_UNITS[unit] || unit : unit}`
}

const changeTone = (delta, higherIsBetter = true) => {
  if (delta === null || delta === 0) return 'neutral'
  return (delta > 0) === higherIsBetter ? 'positive' : 'negative'
}

const profileFact = ({ group, currentCounts, previousCounts, comparable }) => {
  const current = currentCounts ? currentCounts[group] : null
  const previous = previousCounts ? previousCounts[group] : null
  const delta = comparable && current !== null && previous !== null
    ? current - previous
    : null

  return {
    current,
    previous,
    delta,
    significant: delta !== null && Math.abs(delta) >= thresholds.profileCountChange,
  }
}

const profileDetail = (fact, label) => {
  if (fact.current === null) return `לא ניתן להשוות ${label}: נתוני הפרופילים חסרים.`
  if (fact.previous === null) return `אין נתון קודם להשוואת ${label}.`
  if (fact.delta === null) return `השוואת ${label} ממתינה למדגם מספק בשתי העונות.`
  if (fact.delta === 0) return `${label}: אין שינוי מעונה קודמת.`
  return `מספר שחקני הסגל עם ${label} ${changeText(fact.delta, 'עלה', 'ירד', 'שחקנים')} לעומת העונה הקודמת.`
}

const priorityChangeText = (fact, label) => (
  `העדיפות ה${label} ${fact.delta > 0 ? 'עלתה' : 'ירדה'} ` +
  `מ${PRIORITY_LABELS[fact.previousLevel]} ל${PRIORITY_LABELS[fact.currentLevel]}`
)

const priorityDetail = (fact, label) => {
  if (fact.delta === null) return ''
  if (fact.delta === 0) return 'אין שינוי מעונה קודמת.'
  return `${priorityChangeText(fact, label)} לעומת העונה הקודמת.`
}

export const buildTeamPerformanceInsight = ({
  team = {},
  currentSeason = null,
  previousSeason = null,
  selectedTeamSeason = null,
  selectedSeasonOption = null,
} = {}) => {
  const upcoming = selectedSeasonOption?.target === 'future'
  const seasonGameCount = seasonGames(currentSeason)
  const currentGames = upcoming ? null : seasonGameCount === null
    ? numberOrNull(team.games)
    : seasonGameCount
  const previousGames = seasonGames(previousSeason)
  const currentReliability = reliabilityOf(currentGames)
  const previousReliability = reliabilityOf(previousGames)
  const comparable = Boolean(!upcoming && previousSeason &&
    currentReliability !== 'insufficient' && previousReliability !== 'insufficient'
  )
  const comparisonReliability = comparable
    ? reliabilityOf(Math.min(currentGames, previousGames))
    : null
  const currentLevel = numberOrNull(team?.league?.leagueLevel || currentSeason?.leagueLevel)
  const previousLevel = numberOrNull(previousSeason?.leagueLevel)
  const currentRank = numberOrNull(currentSeason?.tableRank === undefined
    ? team.tableRank
    : currentSeason.tableRank)
  const previousRank = numberOrNull(previousSeason?.tableRank)
  const sameCompetitionLevel = currentLevel !== null && previousLevel !== null &&
    currentLevel === previousLevel
  const rankDelta = comparable && sameCompetitionLevel && currentRank !== null &&
    previousRank !== null ? previousRank - currentRank : null
  const currentPerformance = currentSeason?.performance || team?.performance || {}
  const previousPerformance = previousSeason?.performance || {}
  const priorities = {
    offense: priorityFact({
      side: 'offense', current: currentPerformance, previous: previousPerformance, comparable,
    }),
    defense: priorityFact({
      side: 'defense', current: currentPerformance, previous: previousPerformance, comparable,
    }),
  }
  const currentProfileCounts = numberOrNull(selectedTeamSeason?.scoutProfilesSummary?.total) !== null &&
    Array.isArray(selectedTeamSeason?.teamPlayers)
    ? buildScoutProfileGroupCounts(selectedTeamSeason.teamPlayers)
    : null
  const previousProfileCounts = numberOrNull(previousSeason?.scoutProfilesSummary?.total) !== null &&
    Array.isArray(previousSeason?.teamPlayers)
    ? buildScoutProfileGroupCounts(previousSeason.teamPlayers)
    : null
  const profiles = {
    professional: profileFact({
      group: 'professional', currentCounts: currentProfileCounts,
      previousCounts: previousProfileCounts, comparable,
    }),
    underuse: profileFact({
      group: 'underuse', currentCounts: currentProfileCounts,
      previousCounts: previousProfileCounts, comparable,
    }),
  }

  const levelChange = !upcoming && previousLevel !== null && currentLevel !== null &&
    currentLevel !== previousLevel
    ? `רמת התחרות ${currentLevel < previousLevel ? 'עלתה' : 'ירדה'} מרמה ${previousLevel} לרמה ${currentLevel}`
    : ''
  const teamName = typeof team.name === 'string' && team.name.trim()
    ? team.name.trim()
    : 'הקבוצה'
  const findings = []
  if (levelChange) findings.push(levelChange)
  if (rankDelta !== null && Math.abs(rankDelta) >= thresholds.rankChange) {
    findings.push(`${teamName} ${changeText(rankDelta, 'עלתה', 'ירדה', 'מקומות')} בטבלה`)
  }
  ;[['offense', 'התקפית'], ['defense', 'הגנתית']].forEach(([side, label]) => {
    const fact = priorities[side]
    if (fact.significant) {
      findings.push(priorityChangeText(fact, label))
    }
  })

  const summary = upcoming
    ? 'העונה טרם החלה.'
    : findings.length
      ? `${findings.join(' · ')}.`
      : comparable
        ? 'לא זוהה שינוי משמעותי במדדים הזמינים.'
        : 'אין עדיין בסיס מספק להשוואה לעונה הקודמת.'
  const profileSummary = [
    profiles.professional.significant
      ? `מספר שחקני הסגל עם פרופיל סקאוט מקצועי ${changeText(profiles.professional.delta, 'עלה', 'ירד', 'שחקנים')}.`
      : '',
    profiles.underuse.significant
      ? `מספר שחקני הסגל עם פרופיל חוסר שימוש ${changeText(profiles.underuse.delta, 'עלה', 'ירד', 'שחקנים')}.`
      : '',
  ].filter(Boolean).join(' ')
  const hasSignificantChange = findings.length > 0 ||
    profiles.professional.significant || profiles.underuse.significant
  const changes = [
    rankDelta,
    priorities.offense.delta,
    priorities.defense.delta,
    profiles.professional.delta,
    profiles.underuse.delta,
  ]
  const hasMinorChange = changes.some(delta => delta !== null && delta !== 0)
  const comparisonComplete = comparable && sameCompetitionLevel &&
    changes.every(delta => delta !== null)
  const changeStatus = hasSignificantChange
    ? 'significant'
    : hasMinorChange
      ? 'minor'
      : comparisonComplete ? 'steady' : 'limited'
  const reliability = upcoming
    ? 'העונה טרם החלה'
    : currentGames === null
      ? 'מהימנות הנתונים טרם ידועה · מספר המשחקים חסר'
      : `${reliabilityLabel(currentReliability)} · ${currentGames} משחקים`

  const details = [
    {
      key: 'competition',
      label: 'רמת התחרות',
      text: levelChange ? `${levelChange}.` : sameCompetitionLevel
        ? 'רמת התחרות: אין שינוי מעונה קודמת.' : '',
      tone: levelChange ? changeTone(previousLevel - currentLevel) : 'neutral',
    },
    {
      key: 'rank',
      label: 'מיקום בטבלה',
      text: !comparable
        ? ''
        : !sameCompetitionLevel
          ? 'המיקום אינו מושווה בין עונות ברמות תחרות שונות או ללא רמה ידועה.'
          : rankDelta === null
            ? 'חסר מיקום באחת העונות להשוואה.'
            : rankDelta === 0
              ? 'אין שינוי מעונה קודמת.'
              : `${teamName} ${changeText(rankDelta, 'עלתה', 'ירדה', 'מקומות')} בטבלה לעומת העונה הקודמת.`,
      tone: changeTone(rankDelta),
    },
    {
      key: 'offense',
      label: 'עדיפות התקפית',
      text: priorityDetail(priorities.offense, 'התקפית'),
      tone: changeTone(priorities.offense.delta),
    },
    {
      key: 'defense',
      label: 'עדיפות הגנתית',
      text: priorityDetail(priorities.defense, 'הגנתית'),
      tone: changeTone(priorities.defense.delta),
    },
    {
      key: 'professionalProfiles',
      label: 'פרופילים מקצועיים',
      text: profileDetail(profiles.professional, 'פרופיל מקצועי'),
      tone: changeTone(profiles.professional.delta),
    },
    {
      key: 'underuseProfiles',
      label: 'פרופילי חוסר שימוש',
      text: profileDetail(profiles.underuse, 'פרופיל חוסר שימוש'),
      tone: changeTone(profiles.underuse.delta, false),
    },
    {
      key: 'reliability',
      label: 'מהימנות הנתונים',
      text: comparisonReliability
        ? `מהימנות ההשוואה ${reliabilityLabel(comparisonReliability).replace('מהימנות ', '')}.`
        : 'אין עדיין בסיס מספק להשוואה לעונה הקודמת.',
      tone: 'neutral',
    },
  ]

  const changeSignal = (id, delta, significant, available = delta !== null) => ({
    id,
    level: !available ? null : significant ? 2 : delta !== 0 ? 1 : 0,
    availability: available ? 'available' : 'unavailable',
    subSignalsById: available ? {
      change: { id: 'change', delta, direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'equal' },
    } : {},
  })
  const signals = [
    changeSignal('competition', levelChange ? previousLevel - currentLevel : 0, Boolean(levelChange),
      !upcoming && previousLevel !== null && currentLevel !== null),
    changeSignal('rank', rankDelta, rankDelta !== null && Math.abs(rankDelta) >= thresholds.rankChange),
    changeSignal('offense', priorities.offense.delta, priorities.offense.significant),
    changeSignal('defense', priorities.defense.delta, priorities.defense.significant),
    changeSignal('professionalProfiles', profiles.professional.delta, profiles.professional.significant),
    changeSignal('underuseProfiles', profiles.underuse.delta, profiles.underuse.significant),
  ]

  return {
    facts: {
      currentLevel,
      previousLevel,
      currentGames,
      previousGames,
      currentReliability,
      comparisonReliability,
      rankDelta,
      priorities,
      profiles,
    },
    summary,
    profileSummary,
    changeStatus,
    reliability,
    details,
    signals,
  }
}
