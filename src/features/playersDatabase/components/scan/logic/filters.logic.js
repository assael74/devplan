// src/features/playersDatabase/components/scan/logic/filters.logic.js

import { getLeagueLevelLabel } from '../../leagues/leagueUtils.js'
import { getLeagueBirthYear } from './season.logic.js'
import { clean } from './utils.js'

export const buildScanYearOptions = (leagues, seasonId = '') => [
  { value: 'all', label: 'כל השנתונים' },
  ...Array.from(new Set(leagues.map(league => getLeagueBirthYear(league, seasonId)).filter(Boolean))).sort((a, b) => Number(a) - Number(b)).map(value => ({ value, label: value })),
]

export const buildScanLeagueOptions = leagues => {
  const options = leagues.map(league => ({ value: clean(league.id), label: `${getLeagueLevelLabel(league.level)} | ${league.ageGroupLabel || '-'} | ${league.leagueName || '-'}`, level: Number(league.level) || 0 }))
  return [{ value: 'all', label: 'כל הליגות' }, ...options.sort((a, b) => a.level - b.level || a.label.localeCompare(b.label, 'he'))]
}

export const getScanChipCounts = row => ({ playersCount: Number(row?.scoutProfilesCount) || 0, teamsCount: Number(row?.loadedTeamsCount) || 0 })

export const filterProfilesBySearch = ({ profiles, yearRows, leagueRows, searchMode, primaryFilter, selectedLeagueIds, selectedBirthYears }) => {
  if (searchMode === 'all') return profiles

  if (searchMode === 'year') {
    return yearRows.filter(row => {
      const primaryOk = primaryFilter === 'all' || row.birthYear === primaryFilter
      const chipOk = !selectedLeagueIds.length || selectedLeagueIds.some(leagueId => row.children?.some(child => child.leagueId === leagueId))
      return primaryOk && chipOk
    })
  }

  return leagueRows.filter(row => {
    const primaryOk = primaryFilter === 'all' || row.leagueId === primaryFilter
    const chipOk = !selectedBirthYears.length || selectedBirthYears.includes(row.birthYear)
    return primaryOk && chipOk
  })
}
