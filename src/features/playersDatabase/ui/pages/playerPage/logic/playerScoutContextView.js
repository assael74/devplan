// Context and trajectory presentation for the player scout view model.

import { COMPETITION_CONTEXT_LABELS, FUTURE_OUTLOOK_LABELS, TEAM_CONTEXT_LABELS, TRAJECTORY_LABELS, TREND_LABELS } from './playerScoutView.constants.js'
import { clean, formatNumber, formatPercent } from './playerScoutView.utils.js'

export const buildContext = profile => {
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

export const buildTrajectory = (scout, historyRows = []) => {
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

