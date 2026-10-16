// src/features/playersDatabase/ui/pages/teamPage/information/model/teamInsights.presentation.js

import {
  TEAM_SCOUTING_SUMMARY_ITEMS,
  getTeamScoutingSummaryTitle,
  getTeamScoutingSummaryTitles,
} from '../../scouting/model/teamScoutingSummary.presentation.js'
import { numberOrNull } from '../../model/teamInformation.utils.js'
import { buildFutureCompetitionInsight } from './teamFutureCompetition.presentation.js'
import { buildClubComparisonInsight } from './teamClubComparison.presentation.js'

export const buildRosterBalanceSeasonView = (currentView, rosterView) => {
  if (!rosterView || rosterView.selectedSeasonKey === currentView.selectedSeasonKey) return rosterView || currentView
  return {
    ...rosterView,
    previousRosterBalance: { seasonKey: currentView.selectedSeasonKey, structure: currentView.structure },
  }
}

const buildRosterBalanceComparison = view => {
  const previous = view?.previousRosterBalance
  const structure = previous?.structure
  const available = Boolean(structure && structure.availability !== 'unavailable')
  const unavailableText = !previous
    ? 'בעונה הקודמת: אין נתונים להשוואה'
    : `בעונת ${previous.seasonKey}: ${structure?.availabilityReason === 'season_sample_insufficient'
      ? 'המדגם אינו מספיק להשוואה' : 'אין ניתוח זמין להשוואה'}`
  const minutes = Object.fromEntries(TEAM_SCOUTING_SUMMARY_ITEMS.map(item => {
    const previousSignal = item.key === 'squad'
      ? structure?.classificationCoverageBenchmark?.state
      : structure?.teamInterest?.lines?.[item.key]?.finding ||
        structure?.teamInterest?.lines?.[item.key]?.reason
    if (!available || !previousSignal) return [item.key, { text: unavailableText, iconId: 'info' }]

    const previousTitle = getTeamScoutingSummaryTitle({ structure, item })
    const currentTitle = getTeamScoutingSummaryTitle({ structure: view.structure, item })
    const unchanged = previousTitle === currentTitle
    return [item.key, {
      text: `בעונת ${previous.seasonKey}: ${previousTitle}${unchanged ? ' · ללא שינוי' : ''}`,
      iconId: unchanged ? 'equal' : 'swapVert',
    }]
  }))
  const positions = Object.fromEntries(['goalkeeper', 'defense', 'midfield', 'attack', 'classified'].map(key => {
    const currentCount = numberOrNull(view?.structure?.lines?.[key])
    const previousCount = numberOrNull(structure?.lines?.[key])
    if (!available || currentCount === null || previousCount === null) {
      return [key, {
        text: available ? `בעונת ${previous.seasonKey}: אין נתון להשוואה` : unavailableText,
        iconId: 'info',
      }]
    }

    const delta = currentCount - previousCount
    const change = delta === 0 ? 'ללא שינוי' : `${delta > 0 ? 'עלייה' : 'ירידה'} ב־${Math.abs(delta)}`
    return [key, {
      text: `בעונת ${previous.seasonKey}: ${previousCount} · ${change}`,
      iconId: delta === 0 ? 'equal' : delta > 0 ? 'sortUp' : 'sortDown',
    }]
  }))

  return { minutes, positions }
}

const buildMovementSeasonSignal = (season, clubLevel, balancePoint) => {
  const directionDepartureCount = clubLevel === 1
    ? season?.higherOrSameLevelDepartures || 0
    : season?.higherLevelDepartures || 0
  const professionalDepartureCount = season?.professionalProfileDepartures || 0
  const available = Boolean(season && season.movementDataAvailable &&
    !season.isUpcoming && balancePoint !== null)
  const directionActive = available && directionDepartureCount > balancePoint
  const professionalActive = available && professionalDepartureCount > balancePoint
  const count = Number(directionActive) + Number(professionalActive)

  return {
    seasonKey: season?.seasonKey || '',
    balancePoint,
    directionDepartureCount,
    professionalDepartureCount,
    directionActive,
    professionalActive,
    count,
    status: !available ? 'limited' : count === 2 ? 'multiple' : count === 1 ? 'single' : 'none',
  }
}

export const buildTeamInsightsPresentation = ({ view, club, clubIntelligence }) => {
  const analysisAvailable = view?.structure && view.structure.availability !== 'unavailable'
  const teamInterest = analysisAvailable ? view.structure.teamInterest : null
  const rosterBalanceTaskCount = [
    teamInterest?.lines?.defense?.isInteresting,
    teamInterest?.lines?.offense?.isInteresting,
    teamInterest?.squad?.isInteresting,
  ].filter(Boolean).length
  const rosterBalanceStatus = rosterBalanceTaskCount >= 2
    ? 'multiple'
    : rosterBalanceTaskCount === 1 ? 'single' : 'none'

  const clubLevel = Number(club?.clubLevel)
  const clubComparison = buildClubComparisonInsight(view, clubIntelligence)
  const movementSeasons = view?.yearDevelopment?.movementSeasons || []
  const selectedMovements = movementSeasons.find(season => season.seasonKey === view?.selectedSeasonKey)
  const movementBalancePoint = [1, 1.5].includes(clubLevel)
    ? 3
    : [2, 2.5].includes(clubLevel) ? 2 : clubLevel >= 3 ? 1 : null
  const movementSeasonSignals = movementSeasons.map(season => (
    buildMovementSeasonSignal(season, clubLevel, movementBalancePoint)
  ))
  const movementSignal = movementSeasonSignals.find(signal => (
    signal.seasonKey === view?.selectedSeasonKey
  )) || buildMovementSeasonSignal(null, clubLevel, movementBalancePoint)
  const directionDepartureCount = movementSignal.directionDepartureCount
  const professionalDepartureCount = movementSignal.professionalDepartureCount
  const movementSummary = !selectedMovements
    ? 'נתוני העברות טרם זמינים'
    : selectedMovements.isUpcoming
      ? 'העונה טרם החלה'
      : !selectedMovements.movementDataAvailable
        ? 'נתוני העברות טרם זמינים'
      : `${directionDepartureCount} עזבו ${clubLevel === 1 ? 'למועדון ברמה זהה' : 'לרמה גבוהה יותר'}` +
        ` · ${professionalDepartureCount} עזבו עם פרופיל מקצועי`
  const olderYearGroups = (clubIntelligence?.birthYearTeams || [])
    .filter(group => Number(group.birthYear) > 0 && Number(group.birthYear) < Number(view?.team?.birthYear))
    .sort((left, right) => Number(right.birthYear) - Number(left.birthYear))
  const balanceReliability = !analysisAvailable
    ? view?.structure?.availabilityReason === 'season_sample_insufficient'
      ? 'מהימנות: נדרשים 8 משחקי ליגה לניתוח'
      : 'מהימנות: ניתוח הדקות טרם זמין'
    : view?.performanceInsight?.reliability || 'מהימנות הנתונים טרם ידועה'
  const movementAvailability = !selectedMovements
    ? 'זמינות נתונים: אין רישומי העברות להצגה'
    : selectedMovements.isUpcoming
      ? 'זמינות נתונים: העונה טרם החלה'
      : !selectedMovements.movementDataAvailable
        ? 'זמינות נתונים: נתוני ההעברות לעונה חסרים'
      : movementBalancePoint === null
        ? 'זמינות נתונים: רמת המועדון חסרה לקביעת סף האיתות'
        : `נקודת איזון ${movementBalancePoint} · השוואת רמות ל־${selectedMovements.comparableDepartures || 0}` +
          ` מתוך ${selectedMovements.outgoingPlayerCount || 0} עוזבים` +
          ` · סקאוטינג ל־${selectedMovements.profileKnownDepartures || 0}` +
          ` מתוך ${selectedMovements.outgoingPlayerCount || 0}`

  const futureCompetitionSignal = buildFutureCompetitionInsight(view, clubIntelligence)
  return {
    rosterBalanceTaskCount,
    futureCompetitionSignal,
    rosterBalanceComparison: buildRosterBalanceComparison(view),
    rosterBalanceStatus,
    rosterBalanceAvailable: Boolean(analysisAvailable),
    movementSignal,
    movementSeasonSignals,
    rosterBalanceTitles: analysisAvailable
      ? getTeamScoutingSummaryTitles(view.structure)
      : ['ניתוח טרם זמין'],
    signalSummaries: {
      performance: view?.performanceInsight?.summary || 'נתוני הביצוע טרם זמינים.',
      'year-movements': movementSummary,
      'future-competition': futureCompetitionSignal.summary,
      'club-gap': clubComparison.summary,
    },
    signalReliability: {
      'roster-balance': balanceReliability,
      'year-movements': movementAvailability,
      'future-competition': futureCompetitionSignal.reliability,
      'club-gap': clubComparison.reliability,
    },
    clubComparison: {
      clubLevel,
      ...clubComparison,
    },
    olderYearGroups,
    competitionYearGroups: (clubIntelligence?.birthYearTeams || [])
      .filter(group => Number(group.birthYear) > 0 && Number(group.birthYear) <= Number(view?.team?.birthYear))
      .sort((left, right) => Number(right.birthYear) - Number(left.birthYear)),
  }
}
