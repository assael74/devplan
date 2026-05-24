// playerProfile/sharedLogic/games/module/playerGames.toolbar.utils.js

export const safeArray = (v) => (Array.isArray(v) ? v : [])

export const pickToolbarOption = (arr, value, fallbackKey = 'id') => {
  const key = String(value || '').trim()
  if (!key) return null

  const base = safeArray(arr)

  return base.find(item => {
    return (
      String(item?.value || '') === key ||
      String(item?.id || '') === key ||
      String(item?.[fallbackKey] || '') === key
    )
  }) || null
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

  const ratingOptions = safeArray(options?.ratingOptions)
  const selectedRating = pickToolbarOption(ratingOptions, filters?.ratingKey || '')

  const totalGames = summary?.totalGames || summary?.total || 0
  const filteredGames = summary?.filteredGames || summary?.shown || totalGames
  const activeFiltersCount = summary?.activeFiltersCount || 0
  const hasActiveFilters = activeFiltersCount > 0

  const selectedType = pickToolbarOption(typeOptions, filters?.typeKey || '')
  const selectedResult = pickToolbarOption(resultOptions, filters?.resultKey || '')
  const selectedHome = pickToolbarOption(homeOptions, filters?.homeKey || '')
  const selectedDifficulty = pickToolbarOption(difficultyOptions, filters?.difficultyKey || '')

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
    ratingOptions,
    selectedRating,
  }
}

export const clearToolbarIndicator = (item, onChangeFilters) => {
  if (!item?.type || !onChangeFilters) return

  if (item.type === 'search') return onChangeFilters({ search: '' })
  if (item.type === 'typeKey') return onChangeFilters({ typeKey: '' })
  if (item.type === 'homeKey') return onChangeFilters({ homeKey: '' })
  if (item.type === 'resultKey') return onChangeFilters({ resultKey: '' })
  if (item.type === 'difficultyKey') return onChangeFilters({ difficultyKey: '' })
  if (item.type === 'ratingKey') return onChangeFilters({ ratingKey: '' })
}
