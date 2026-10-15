// src/features/playersDatabase/ui/pages/teamPage/information/model/teamInsights.presentation.js

import { CLUB_LEAGUE_LEVEL_GAP_THRESHOLD } from '../../../../../domain/clubIntelligence/clubIntelligence.contract.js'
import { getTeamScoutingSummaryTitles } from '../../scouting/model/teamScoutingSummary.presentation.js'

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
  const leagueLevel = Number(view?.team?.league?.leagueLevel)
  const isPrimaryTeam = Number(view?.team?.birthTeamSlot) === 1
  const hasClubComparison = isPrimaryTeam && Number.isFinite(clubLevel) && clubLevel > 0 &&
    Number.isFinite(leagueLevel) && leagueLevel > 0
  const clubGap = hasClubComparison ? leagueLevel - clubLevel : null
  const clubGapSummary = clubGap === null
    ? isPrimaryTeam ? 'נתוני השוואה טרם זמינים' : 'ההשוואה מיועדת לקבוצה הראשית'
    : Math.abs(clubGap) < CLUB_LEAGUE_LEVEL_GAP_THRESHOLD
      ? 'רמת הליגה תואמת לרמת המועדון'
      : clubGap < 0 ? 'הליגה מעל רמת המועדון' : 'הליגה מתחת לרמת המועדון'
  const movementSeasons = view?.yearDevelopment?.movementSeasons || []
  const selectedMovements = movementSeasons.find(season => season.seasonKey === view?.selectedSeasonKey)
  const movementSummary = !selectedMovements
    ? 'נתוני העברות טרם זמינים'
    : selectedMovements.isUpcoming
      ? 'העונה טרם החלה'
      : `${selectedMovements.joinedCount} הצטרפו · ${selectedMovements.leftCount} עזבו בעונה הנבחרת`
  const olderYearGroups = (clubIntelligence?.birthYearTeams || [])
    .filter(group => Number(group.birthYear) < Number(view?.team?.birthYear))
    .sort((left, right) => Number(right.birthYear) - Number(left.birthYear))
    .slice(0, 2)
  const balanceReliability = !analysisAvailable
    ? view?.structure?.availabilityReason === 'season_sample_insufficient'
      ? 'מהימנות: נדרשים 8 משחקי ליגה לניתוח'
      : 'מהימנות: ניתוח הדקות טרם זמין'
    : view?.performanceInsight?.reliability || 'מהימנות הנתונים טרם ידועה'
  const movementAvailability = !selectedMovements
    ? 'זמינות נתונים: אין רישומי העברות להצגה'
    : selectedMovements.isUpcoming
      ? 'זמינות נתונים: העונה טרם החלה'
      : selectedMovements.movements?.length
        ? 'זמינות נתונים: קיימים רישומי העברות לעונה'
        : 'זמינות נתונים: אין רישומי העברות להצגה'

  return {
    rosterBalanceTaskCount,
    rosterBalanceStatus,
    rosterBalanceAvailable: Boolean(analysisAvailable),
    rosterBalanceTitles: analysisAvailable
      ? getTeamScoutingSummaryTitles(view.structure)
      : ['ניתוח טרם זמין'],
    signalSummaries: {
      performance: view?.performanceInsight?.summary || 'נתוני הביצוע טרם זמינים.',
      'year-movements': movementSummary,
      'future-competition': 'השנתונים שמעל · הצפי טרם נקבע',
      'club-gap': clubGapSummary,
    },
    signalReliability: {
      'roster-balance': balanceReliability,
      'year-movements': movementAvailability,
      'future-competition': olderYearGroups.length
        ? 'זמינות נתונים: קיימים נתוני שנתונים מעל'
        : 'זמינות נתונים: אין נתוני שנתונים מעל להצגה',
      'club-gap': hasClubComparison
        ? 'זמינות נתונים: רמת הליגה ורמת המועדון ידועות'
        : isPrimaryTeam
          ? 'זמינות נתונים: חסרה רמת ליגה או מועדון'
          : 'זמינות נתונים: ההשוואה מיועדת לקבוצה הראשית',
    },
    clubComparison: {
      clubLevel,
      leagueLevel,
      isPrimaryTeam,
      available: hasClubComparison,
      summary: clubGapSummary,
    },
    olderYearGroups,
  }
}
