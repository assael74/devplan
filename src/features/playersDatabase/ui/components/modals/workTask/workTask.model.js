// src/features/playersDatabase/ui/components/modals/workTask/workTask.model.js

import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'

export const YEAR_ROUTE = 'birthYear'
export const TEAM_ROUTE = 'teamBirthYear'
export const LEAGUE_PAGE_ROUTE = 'leaguePage'

export const YEAR_STEPS = [
  'מסלול עבודה',
  'שנתון',
  'רמת ליגה',
  'סקירת ליגות',
]

export const TEAM_STEPS = [
  'מסלול עבודה',
  'קבוצה ושנתון',
  'משימת קבוצה',
]

export const LEAGUE_PAGE_STEPS = [
  'סוג משימה',
  'בחירת יעד',
]

export const POSITIVE_PRIORITY_LEVELS = [
  'positive',
  'high',
  'elite',
]

export const TABLE_STATUS = {
  full: {
    label: 'טבלה מלאה',
    action: 'הושלם',
    tone: 'success',
  },
  partial: {
    label: 'טבלה חלקית',
    action: 'הוספת קבוצות',
    tone: 'warning',
  },
  missing: {
    label: 'טבלה ריקה',
    action: 'הוספת קבוצות',
    tone: 'danger',
  },
}

export function clean(value) {
  return String(value || '').trim()
}

export function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))]
}

export function getWorkTaskSteps(workRoute) {
  if (workRoute === LEAGUE_PAGE_ROUTE) return LEAGUE_PAGE_STEPS
  return workRoute === TEAM_ROUTE ? TEAM_STEPS : YEAR_STEPS
}

export function isPositiveLevel(value) {
  return POSITIVE_PRIORITY_LEVELS.includes(String(value || ''))
}

export function isPositivePriority(team = {}) {
  return (
    isPositiveLevel(team.attackPriority) ||
    isPositiveLevel(team.defensePriority)
  )
}

export function buildLeagueTaskDraft({
  selectedLeague,
  birthYear,
  leagueLevel,
}) {
  const leagueId = clean(selectedLeague?.leagueId || selectedLeague?.id)
  const leagueName = clean(selectedLeague?.leagueName || selectedLeague?.name)
  const seasonKey = clean(selectedLeague?.seasonKey || selectedLeague?.seasonId)
  const ageGroupId = clean(selectedLeague?.ageGroupId)
  const ageGroupLabel = clean(
    selectedLeague?.ageGroupLabel || selectedLeague?.ageGroup
  )

  return {
    title: 'הוספת קבוצות',
    description: [
      ageGroupLabel,
      leagueName,
      `רמה ${leagueLevel}`,
      seasonKey,
      `שנתון ${birthYear}`,
    ].filter(Boolean).join(' · '),
    url: PLAYERS_DATABASE_UI_ROUTES.league(leagueId, {
      seasonKey,
      birthYear,
      level: leagueLevel,
      centerSeasonKey: seasonKey,
      centerBirthYear: birthYear,
      centerLevel: leagueLevel,
    }),
    contextArea: 'playersDatabase',
    contextMode: 'league',
    workContext: {
      source: 'playersDatabase',
      scope: 'league',
      action: 'loadTeams',
      birthYear: String(birthYear),
      leagueLevel: String(leagueLevel),
      seasonKey,
      leagueId,
      leagueName,
      ageGroupId,
      ageGroupLabel,
    },
  }
}

export function buildTeamTaskDraft({
  selectedTeam,
  selectedAppearance,
  teamBirthYear,
  teamTaskType,
}) {
  const leagueId = clean(selectedAppearance?.leagueId)
  const leagueName = clean(selectedAppearance?.leagueName)
  const seasonKey = clean(
    selectedAppearance?.seasonKey || selectedAppearance?.seasonId
  )
  const teamId = clean(selectedTeam?.birthTeamId || selectedTeam?.teamId)
  const teamName = clean(
    selectedTeam?.label ||
    selectedTeam?.name ||
    selectedTeam?.teamName ||
    selectedTeam?.displayName
  )
  const isStats = teamTaskType === 'stats'
  const taskLabel = isStats ? 'טעינת סטטיסטיקה' : 'טעינת סגל'

  return {
    title: `${taskLabel} · ${teamName} · ${seasonKey}`,
    description: `${leagueName} · שנתון ${teamBirthYear} · ${seasonKey}`,
    url: PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId,
      teamId,
      seasonKey,
      fromLeague: leagueId,
    }),
    contextArea: 'playersDatabase',
    contextMode: 'team',
    workContext: {
      source: 'playersDatabase',
      scope: 'team',
      action: isStats ? 'loadStats' : 'loadRoster',
      birthYear: String(teamBirthYear),
      seasonKey,
      leagueId,
      leagueName,
      teamId,
      birthTeamId: teamId,
      teamName,
    },
  }
}

export function buildLeaguePageTaskDraft({
  leagueContext,
  taskType,
  selectedTeam,
}) {
  const league = leagueContext?.league || {}
  const leagueId = clean(league.id)
  const leagueName = clean(league.name)
  const seasonKey = clean(leagueContext?.seasonKey || league.seasonKey)
  const birthYear = clean(league.birthYear)
  const leagueLevel = clean(league.level)
  const ageGroupId = clean(league.ageGroupId)
  const ageGroupLabel = clean(league.ageGroup)
  const url = clean(leagueContext?.url)

  if (taskType === 'teams') {
    return {
      title: 'הוספת קבוצות',
      description: [
        ageGroupLabel,
        leagueName,
        leagueLevel ? `רמה ${leagueLevel}` : '',
        seasonKey,
        birthYear ? `שנתון ${birthYear}` : '',
      ].filter(Boolean).join(' · '),
      url,
      contextArea: 'playersDatabase',
      contextMode: 'league',
      workContext: {
        source: 'playersDatabase',
        scope: 'league',
        action: 'loadTeams',
        birthYear,
        leagueLevel,
        seasonKey,
        leagueId,
        leagueName,
        ageGroupId,
        ageGroupLabel,
      },
    }
  }

  const teamId = clean(
    selectedTeam?.birthTeamId ||
    selectedTeam?.teamId ||
    selectedTeam?.id
  )
  const teamName = clean(
    selectedTeam?.name ||
    selectedTeam?.teamName ||
    selectedTeam?.displayName ||
    selectedTeam?.label
  )
  const isStats = taskType === 'stats'
  const taskLabel = isStats ? 'טעינת סטטיסטיקה' : 'טעינת סגל'

  return {
    title: taskLabel,
    description: [
      teamName,
      ageGroupLabel,
      leagueName,
      leagueLevel ? `רמה ${leagueLevel}` : '',
      seasonKey,
      birthYear ? `שנתון ${birthYear}` : '',
    ].filter(Boolean).join(' · '),
    url: PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId,
      teamId,
      seasonKey,
      fromLeague: url,
    }),
    contextArea: 'playersDatabase',
    contextMode: 'team',
    workContext: {
      source: 'playersDatabase',
      scope: 'team',
      action: isStats ? 'loadStats' : 'loadRoster',
      birthYear,
      leagueLevel,
      seasonKey,
      leagueId,
      leagueName,
      ageGroupId,
      ageGroupLabel,
      teamId,
      birthTeamId: teamId,
      teamName,
    },
  }
}
