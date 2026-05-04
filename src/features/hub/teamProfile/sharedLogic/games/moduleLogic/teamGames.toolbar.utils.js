// teamProfile/sharedLogic/games/moduleLogic/teamGames.toolbar.utils.js

export const safeArray = (v) => (Array.isArray(v) ? v : [])

export const pickToolbarOption = (arr, value, fallbackKey = 'id') => {
  const base = safeArray(arr)

  return (
    base.find((x) => {
      return x?.value === value || x?.id === value || x[fallbackKey] === value
    }) || null
  )
}

export const getHomeOptionColor = (item) => {
  if (item?.idIcon === 'home') return 'success'
  if (item?.idIcon === 'away') return 'danger'
  return 'neutral'
}

export const buildToolbarState = ({ summary, filters, options }) => {
  const typeOptions = safeArray(options?.typeOptions)
  const resultOptions = safeArray(options?.resultOptions)
  const homeOptions = safeArray(options?.homeOptions)
  const difficultyOptions = safeArray(options?.difficultyOptions)

  const totalGames = summary?.totalGames || summary?.total || 0
  const filteredGames = summary?.filteredGames || summary?.shown || totalGames
  const activeFiltersCount = summary?.activeFiltersCount || 0
  const hasActiveFilters = activeFiltersCount > 0

  const selectedType = pickToolbarOption(typeOptions, filters?.typeKey || '')
  const selectedResult = pickToolbarOption(resultOptions, filters?.resultKey || '')
  const selectedHome = pickToolbarOption(homeOptions, filters?.homeKey || '')
  const selectedDifficulty = pickToolbarOption(
    difficultyOptions,
    filters?.difficultyKey || ''
  )

  return {
    typeOptions,
    resultOptions,
    homeOptions,
    difficultyOptions,
    totalGames,
    filteredGames,
    activeFiltersCount,
    hasActiveFilters,
    selectedType,
    selectedResult,
    selectedHome,
    selectedDifficulty,
  }
}

export const clearToolbarIndicator = (item, onChangeFilters) => {
  if (!item?.type && !item?.key) return
  if (!onChangeFilters) return

  const key = item.type || item.key

  if (key === 'search') return onChangeFilters({ search: '' })
  if (key === 'typeKey') return onChangeFilters({ typeKey: '' })
  if (key === 'homeKey') return onChangeFilters({ homeKey: '' })
  if (key === 'resultKey') return onChangeFilters({ resultKey: '' })
  if (key === 'difficultyKey') return onChangeFilters({ difficultyKey: '' })
  if (key === 'onlyPlayed') return onChangeFilters({ onlyPlayed: false })
}
