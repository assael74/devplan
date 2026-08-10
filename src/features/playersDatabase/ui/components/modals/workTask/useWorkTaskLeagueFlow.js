// src/features/playersDatabase/ui/components/modals/workTask/useWorkTaskLeagueFlow.js

import * as React from 'react'

import {
  LEAGUE_PAGE_ROUTE,
  clean,
  isPositivePriority,
  uniqueValues,
} from './workTask.model.js'

export default function useWorkTaskLeagueFlow({
  open,
  workRoute,
  allRows,
  levelOptions,
  birthYearOptions,
  initialBirthYear,
  initialLeagueLevel,
  leagueContext,
}) {
  const [birthYear, setBirthYear] = React.useState('')
  const [leagueLevel, setLeagueLevel] = React.useState('')
  const [seasonKey, setSeasonKey] = React.useState('all')
  const [selectedLeagueKey, setSelectedLeagueKey] = React.useState('')
  const [leagueTaskType, setLeagueTaskType] = React.useState('')
  const [leagueTeamId, setLeagueTeamId] = React.useState('')

  React.useEffect(() => {
    if (!open) return

    setBirthYear(initialBirthYear)
    setLeagueLevel(initialLeagueLevel)
    setSeasonKey('all')
    setSelectedLeagueKey('')
    setLeagueTaskType('')
    setLeagueTeamId('')
  }, [
    initialBirthYear,
    initialLeagueLevel,
    open,
  ])

  const leagueTeamStatuses = React.useMemo(() => {
    const leagueTeams = Array.isArray(leagueContext?.teams)
      ? leagueContext.teams
      : []

    return Object.fromEntries(
      leagueTeams
        .map(team => {
          const teamId = clean(team.birthTeamId || team.teamId || team.id)
          if (!teamId) return null

          return [
            teamId,
            {
              rosterLoaded: Boolean(team.hasPlayers),
              playersCount: Number(team.playersCount || 0),
              statsLoaded: Boolean(team.hasStats),
              statsComplete: Boolean(team.statsComplete),
            },
          ]
        })
        .filter(Boolean)
    )
  }, [leagueContext])

  const leagueTaskTeams = React.useMemo(() => {
    const leagueTeams = Array.isArray(leagueContext?.teams)
      ? leagueContext.teams
      : []

    if (leagueTaskType === 'roster') {
      return leagueTeams.filter(isPositivePriority)
    }

    if (leagueTaskType === 'stats') {
      return leagueTeams
        .filter(isPositivePriority)
        .filter(team => {
          const teamId = clean(team.birthTeamId || team.teamId || team.id)
          return Boolean(leagueTeamStatuses[teamId]?.rosterLoaded)
        })
    }

    return []
  }, [
    leagueContext,
    leagueTaskType,
    leagueTeamStatuses,
  ])

  const leagueTaskCounts = React.useMemo(() => {
    const leagueTeams = Array.isArray(leagueContext?.teams)
      ? leagueContext.teams
      : []
    const priorityTeams = leagueTeams.filter(isPositivePriority)

    const rosterMissing = priorityTeams.filter(team => {
      const teamId = clean(team.birthTeamId || team.teamId || team.id)
      return !leagueTeamStatuses[teamId]?.rosterLoaded
    }).length

    const statsMissing = priorityTeams
      .filter(team => {
        const teamId = clean(team.birthTeamId || team.teamId || team.id)
        return Boolean(leagueTeamStatuses[teamId]?.rosterLoaded)
      })
      .filter(team => {
        const teamId = clean(team.birthTeamId || team.teamId || team.id)
        return !leagueTeamStatuses[teamId]?.statsComplete
      }).length

    return {
      rosterMissing,
      statsMissing,
    }
  }, [
    leagueContext,
    leagueTeamStatuses,
  ])

  const selectedLeagueTaskTeam = React.useMemo(() => (
    leagueTaskTeams.find(team => (
      clean(team.birthTeamId || team.teamId || team.id) === leagueTeamId
    )) || null
  ), [
    leagueTaskTeams,
    leagueTeamId,
  ])

  const availableLevelOptions = React.useMemo(() => {
    if (!birthYear) return []

    const availableLevels = new Set(
      allRows
        .filter(row => String(row.birthYear) === String(birthYear))
        .map(row => String(row.level))
    )

    return levelOptions.filter(option => (
      availableLevels.has(String(option.value))
    ))
  }, [
    birthYear,
    allRows,
    levelOptions,
  ])

  const levelSummaryMap = React.useMemo(() => {
    if (!birthYear) return new Map()

    const summaryMap = new Map()

    allRows
      .filter(row => String(row.birthYear) === String(birthYear))
      .forEach(row => {
        const levelKey = String(row.level)
        const seasonLabel = clean(row.seasonKey || row.seasonId) || 'עונה לא מוגדרת'

        if (!summaryMap.has(levelKey)) {
          summaryMap.set(levelKey, new Map())
        }

        const seasonMap = summaryMap.get(levelKey)
        const current = seasonMap.get(seasonLabel) || {
          total: 0,
          full: 0,
          missing: 0,
          partial: 0,
        }

        current.total += 1

        if (row.tableStatus === 'full') {
          current.full += 1
        } else if (row.tableStatus === 'partial') {
          current.partial += 1
        } else {
          current.missing += 1
        }

        seasonMap.set(seasonLabel, current)
      })

    return summaryMap
  }, [
    birthYear,
    allRows,
  ])

  const contextRows = React.useMemo(() => (
    allRows.filter(row => (
      String(row.birthYear) === String(birthYear) &&
      String(row.level) === String(leagueLevel)
    ))
  ), [
    birthYear,
    leagueLevel,
    allRows,
  ])

  const seasonOptions = React.useMemo(() => (
    uniqueValues(
      contextRows.map(row => clean(row.seasonKey || row.seasonId))
    ).sort().reverse()
  ), [contextRows])

  const reviewRows = React.useMemo(() => {
    if (seasonKey === 'all') return contextRows

    return contextRows.filter(row => (
      clean(row.seasonKey || row.seasonId) === seasonKey
    ))
  }, [
    contextRows,
    seasonKey,
  ])

  const selectedLeague = React.useMemo(() => {
    if (!selectedLeagueKey) return null

    return reviewRows.find(row => {
      const rowKey = `${row.leagueId}-${row.seasonKey}-${row.birthYear}`
      return rowKey === selectedLeagueKey
    }) || null
  }, [
    reviewRows,
    selectedLeagueKey,
  ])

  const actions = {
    onBirthYearChange: value => {
      setBirthYear(value)
      setLeagueLevel('')
      setSeasonKey('all')
      setSelectedLeagueKey('')
    },
    onLeagueLevelChange: value => {
      setLeagueLevel(value)
      setSeasonKey('all')
      setSelectedLeagueKey('')
    },
    onSeasonChange: value => {
      setSeasonKey(value)
      setSelectedLeagueKey('')
    },
    onLeagueSelect: setSelectedLeagueKey,
    onLeagueTaskTypeChange: taskType => {
      setLeagueTaskType(taskType)
      setLeagueTeamId('')
    },
    onLeagueTeamSelect: setLeagueTeamId,
  }

  const model = {
    workRoute,
    birthYear,
    birthYearOptions,
    leagueLevel,
    seasonKey,
    availableLevelOptions,
    levelSummaryMap,
    seasonOptions,
    reviewRows,
    selectedLeagueKey,
    selectedLeague,
    leagueContext,
    leagueTaskType,
    leagueTeamId,
    leagueTeamStatuses,
    leagueTeamStatusesLoading: false,
    leagueTeamStatusesError: '',
    leagueTaskTeams,
    leagueTaskCounts,
    selectedLeagueTaskTeam,
  }

  return {
    model,
    actions,
    birthYear,
    leagueLevel,
    selectedLeagueKey,
    selectedLeague,
    leagueTaskType,
    leagueTeamId,
    selectedLeagueTaskTeam,
    resetRouteContext() {
      setLeagueLevel('')
      setSeasonKey('all')
      setSelectedLeagueKey('')
    },
  }
}
