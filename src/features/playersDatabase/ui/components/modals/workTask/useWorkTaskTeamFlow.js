// src/features/playersDatabase/ui/components/modals/workTask/useWorkTaskTeamFlow.js

import * as React from 'react'

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import {
  buildLeagueTeamsForBirthYear,
  readLeagueTeamsForBirthYear,
} from '../../../../services/read/workTasks.read.js'
import {
  TEAM_ROUTE,
  clean,
} from './workTask.model.js'

export default function useWorkTaskTeamFlow({
  open,
  workRoute,
  allRows,
  birthYearOptions,
  initialBirthYear,
  leagueDocuments = [],
}) {
  const [teamKey, setTeamKey] = React.useState('')
  const [teamInputValue, setTeamInputValue] = React.useState('')
  const [teamBirthYear, setTeamBirthYear] = React.useState('')
  const [selectedAppearanceKey, setSelectedAppearanceKey] = React.useState('')
  const [teamTaskType, setTeamTaskType] = React.useState('')
  const [teamOptions, setTeamOptions] = React.useState([])
  const [teamOptionsLoading, setTeamOptionsLoading] = React.useState(false)
  const [teamOptionsError, setTeamOptionsError] = React.useState('')

  React.useEffect(() => {
    if (!open) return

    setTeamKey('')
    setTeamInputValue('')
    setTeamBirthYear(initialBirthYear)
    setSelectedAppearanceKey('')
    setTeamTaskType('')
    setTeamOptions([])
    setTeamOptionsLoading(false)
    setTeamOptionsError('')
  }, [
    initialBirthYear,
    open,
  ])

  const clubMap = React.useMemo(() => new Map(
    PLAYERS_DATABASE_CLUBS_CATALOG.map(club => [club.id, club])
  ), [])

  React.useEffect(() => {
    if (!open || workRoute !== TEAM_ROUTE || !teamBirthYear) {
      setTeamOptions([])
      setTeamKey('')
      setTeamInputValue('')
      setSelectedAppearanceKey('')
      setTeamTaskType('')
      setTeamOptionsError('')
      return undefined
    }

    let active = true

    setTeamOptionsLoading(true)
    setTeamOptionsError('')
    setTeamKey('')
    setTeamInputValue('')
    setSelectedAppearanceKey('')
    setTeamTaskType('')

    const hasLoadedLeagueDocuments = Array.isArray(leagueDocuments) &&
      leagueDocuments.length > 0
    const teamsPromise = hasLoadedLeagueDocuments
      ? Promise.resolve(buildLeagueTeamsForBirthYear({
        birthYear: teamBirthYear,
        leagueRows: allRows,
        leagueDocuments,
      }))
      : readLeagueTeamsForBirthYear({
        birthYear: teamBirthYear,
        leagueRows: allRows,
      })

    teamsPromise
      .then(rows => {
        if (!active) return

        const nextOptions = rows
          .map(row => {
            const club = clubMap.get(row.clubId)
            const baseName = clean(club?.shortName || club?.name || row.clubId)
            const slotLabel = Number(row.birthTeamSlot || 1) > 1
              ? ` · קבוצה ${row.birthTeamSlot}`
              : ''

            return {
              ...row,
              label: `${baseName}${slotLabel}`,
            }
          })
          .filter(row => row.label)
          .sort((teamA, teamB) => teamA.label.localeCompare(teamB.label, 'he'))

        setTeamOptions(nextOptions)
      })
      .catch(error => {
        if (!active) return

        setTeamOptions([])
        setTeamOptionsError(error?.message || 'טעינת רשימת הקבוצות נכשלה')
      })
      .finally(() => {
        if (active) setTeamOptionsLoading(false)
      })

    return () => {
      active = false
    }
  }, [
    clubMap,
    allRows,
    leagueDocuments,
    open,
    teamBirthYear,
    workRoute,
  ])

  const selectedTeam = React.useMemo(() => (
    teamOptions.find(team => team.key === teamKey) || null
  ), [
    teamKey,
    teamOptions,
  ])

  const selectedTeamAppearances = React.useMemo(() => {
    if (!selectedTeam) return []

    const seen = new Set()

    return selectedTeam.appearances
      .map(appearance => {
        const leagueRow = allRows.find(row => (
          clean(row.leagueId || row.id) === clean(appearance.leagueId) &&
          clean(row.seasonKey || row.seasonId) === clean(appearance.seasonKey || appearance.seasonId) &&
          String(row.birthYear) === String(teamBirthYear)
        ))
        const key = `${appearance.leagueId}-${appearance.seasonKey || appearance.seasonId}`

        return {
          ...appearance,
          key,
          leagueName: clean(leagueRow?.leagueName || leagueRow?.name) || clean(appearance.leagueId),
          level: leagueRow?.level,
          seasonLabel: clean(appearance.seasonKey || appearance.seasonId) || 'עונה לא מוגדרת',
        }
      })
      .filter(appearance => {
        if (seen.has(appearance.key)) return false
        seen.add(appearance.key)
        return true
      })
      .sort((appearanceA, appearanceB) => (
        appearanceB.seasonLabel.localeCompare(appearanceA.seasonLabel)
      ))
  }, [
    allRows,
    selectedTeam,
    teamBirthYear,
  ])

  const selectedAppearance = React.useMemo(() => (
    selectedTeamAppearances.find(appearance => (
      appearance.key === selectedAppearanceKey
    )) || null
  ), [
    selectedAppearanceKey,
    selectedTeamAppearances,
  ])

  const model = {
    birthYearOptions,
    teamBirthYear,
    teamOptions,
    teamOptionsLoading,
    teamOptionsError,
    teamInputValue,
    selectedTeam,
    selectedTeamAppearances,
    selectedAppearance,
    selectedAppearanceKey,
    selectedAppearanceHasRoster: Boolean(selectedAppearance?.hasPlayers),
    selectedAppearanceStatsComplete: Boolean(selectedAppearance?.statsComplete),
    teamTaskType,
    teamWorkStatusLoading: false,
    teamWorkStatusError: '',
  }

  const actions = {
    onTeamBirthYearChange: value => {
      setTeamBirthYear(value)
      setTeamKey('')
      setTeamInputValue('')
      setSelectedAppearanceKey('')
      setTeamTaskType('')
    },
    onTeamInputChange: value => {
      setTeamInputValue(value)

      if (selectedTeam && value !== selectedTeam.label) {
        setTeamKey('')
      }

      setSelectedAppearanceKey('')
      setTeamTaskType('')
    },
    onTeamChange: team => {
      if (!team || typeof team === 'string') {
        setTeamKey('')
        if (typeof team === 'string') setTeamInputValue(team)
      } else {
        setTeamKey(team.key)
        setTeamInputValue(team.label)
      }

      setSelectedAppearanceKey('')
      setTeamTaskType('')
    },
    onAppearanceSelect: appearanceKey => {
      setSelectedAppearanceKey(appearanceKey)
      setTeamTaskType('')
    },
    onTeamTaskTypeChange: setTeamTaskType,
  }

  return {
    model,
    actions,
    selectedTeam,
    selectedAppearance,
    teamBirthYear,
    teamInputValue,
    teamKey,
    selectedAppearanceKey,
    teamTaskType,
  }
}
