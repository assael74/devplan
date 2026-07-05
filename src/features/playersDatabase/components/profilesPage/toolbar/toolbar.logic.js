// features/playersDatabase/components/profilesPage/toolbar/toolbar.logic.js

import { profileMatchesRegion } from '../logic/filters.logic.js'

const isRegionLevel = value => {
  const level = String(value)
  return level === '3' || level === '4'
}

export const getPrimaryLabel = searchMode => {
  if (searchMode === 'league') return 'רמת ליגה'
  if (searchMode === 'year') return 'שנתונים'
  return 'סוג חיפוש'
}

export const getPrimaryOptions = model => {
  if (model.searchMode === 'league') return model.leagueLevelOptions
  if (model.searchMode === 'year') return model.yearOptions
  return []
}

export const getRegionOptions = model => {
  if (model.searchMode !== 'league') return []
  if (!isRegionLevel(model.primaryFilter)) return []

  return model.regionOptions
}

export const getPrimaryFallback = searchMode => {
  if (searchMode === 'year') return 'בחר שנתון'
  if (searchMode === 'league') return 'בחר רמה'
  return 'בחר סוג חיפוש'
}

export const getRegionFallback = () => 'בחר אזור'

export const getHintText = (searchMode, primaryFilter, regionId) => {
  if (searchMode === 'all') return 'בחר חיפוש לפי סוג חיפוש'
  if (searchMode === 'year' && primaryFilter === 'all') return 'בחר ליגה'
  if (searchMode === 'league' && primaryFilter === 'all') return 'בחר רמת ליגה'
  if (searchMode === 'league' && isRegionLevel(primaryFilter) && regionId === 'all') {
    return 'בחר אזור'
  }
  return ''
}

export const getSecondaryRows = model => {
  const regionFilteredLeagueRows = model.leagueRows.filter(row =>
    profileMatchesRegion(row, model.selectedRegionId)
  )

  const regionFilteredYearRows = model.yearRows.filter(row =>
    profileMatchesRegion(row, model.selectedRegionId)
  )

  if (model.searchMode === 'year') {
    return regionFilteredLeagueRows.filter(
      row => model.primaryFilter === 'all' || row.birthYear === model.primaryFilter
    )
  }

  if (model.searchMode === 'league') {
    return regionFilteredYearRows.filter(
      row =>
        model.primaryFilter === 'all' ||
        row.children?.some(
          child => String(child.league?.level || child.level || '') === String(model.primaryFilter)
        )
    )
  }

  return []
}

export const getSecondaryRowSelected = (model, row) => {
  if (model.searchMode === 'year') {
    return model.selectedLeagueIds.includes(row.leagueId)
  }

  return model.selectedBirthYears.includes(row.birthYear)
}

export const toggleSecondaryRow = (model, row) => {
  if (model.searchMode === 'year') {
    model.toggleLeagueId(row.leagueId)
    return
  }

  model.toggleBirthYear(row.birthYear)
}

export const resetProfilesToolbar = model => {
  const lastSeasonOption = model.seasonOptions[model.seasonOptions.length - 1]

  model.setSelectedSeasonId(lastSeasonOption?.value || model.selectedSeasonId)
  model.setSearchMode('all')
  model.setPrimaryFilter('all')
  model.setSelectedRegionId('all')
  model.setSelectedLeagueIds([])
  model.setSelectedBirthYears([])
}
