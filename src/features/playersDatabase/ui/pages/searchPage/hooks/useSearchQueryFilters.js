// features/playersDatabase/ui/pages/searchPage/hooks/useSearchQueryFilters.js

import * as React from 'react'

import {
  createSearchFilters,
  SEARCH_OPERATORS,
  SEARCH_SCOUT_PROFILES,
  SEARCH_STAT_FIELDS,
  SEARCH_TEAM_INTERPRETATION_LEVELS,
} from '../logic/search.constants.js'
import { buildActiveFilterItems } from '../logic/search.selectors.js'

const resolveCombinationProfileIds = combinationId => (
  SEARCH_SCOUT_PROFILES.find(option => (
    option.isCombination && option.value === combinationId
  ))?.profileIds || []
)

export const cloneSearchFilters = filters => ({
  ...filters,
  favoritesOnly: Boolean(filters.favoritesOnly),
  expectedLeagueLevelChanges: [...(filters.expectedLeagueLevelChanges || [])],
  seasons: [...filters.seasons],
  birthYears: [...filters.birthYears],
  leagueLevels: [...filters.leagueLevels],
  leagues: [...filters.leagues],
  scoutProfiles: [...filters.scoutProfiles],
  scoutCombinations: [...(filters.scoutCombinations || [])],
  scoutImmediacyStatus: filters.scoutImmediacyStatus || '',
  teamBalanceReliability: filters.teamBalanceReliability || '',
  teamBalanceMinutesBand: filters.teamBalanceMinutesBand || '',
  teamBalanceProductionBand: filters.teamBalanceProductionBand || '',
  teamBalanceRotationBand: filters.teamBalanceRotationBand || '',
  teamAttackPriorityLevels: [...(filters.teamAttackPriorityLevels || [])],
  teamDefensePriorityLevels: [...(filters.teamDefensePriorityLevels || [])],
  conditions: filters.conditions.map(condition => ({ ...condition })),
})

export default function useSearchQueryFilters() {
  const [queryFilters, setQueryFilters] = React.useState(createSearchFilters)
  const conditionId = React.useRef(1)

  const queryFiltersKey = React.useMemo(
    () => JSON.stringify(queryFilters),
    [queryFilters]
  )

  const queryActiveItems = React.useMemo(() => buildActiveFilterItems(queryFilters, {
    profiles: SEARCH_SCOUT_PROFILES,
    teamInterpretationLevels: SEARCH_TEAM_INTERPRETATION_LEVELS,
    fields: SEARCH_STAT_FIELDS,
    operators: SEARCH_OPERATORS,
  }), [queryFilters])

  const updateQueryFilter = React.useCallback((key, value) => {
    setQueryFilters(current => ({
      ...current,
      [key]: value,
    }))
  }, [])

  const toggleQueryArrayValue = React.useCallback((key, value) => {
    setQueryFilters(current => {
      const values = current[key]
      const exists = values.includes(value)
      const nextValues = exists
        ? values.filter(item => item !== value)
        : [...values, value]

      if (key === 'scoutCombinations') {
        const profileIds = resolveCombinationProfileIds(value)

        return {
          ...current,
          scoutCombinations: nextValues,
          scoutProfiles: exists
            ? current.scoutProfiles
            : current.scoutProfiles.filter(
              profileId => !profileIds.includes(profileId)
            ),
        }
      }

      return {
        ...current,
        [key]: nextValues,
      }
    })
  }, [])

  const setQueryPresetCondition = React.useCallback(({
    field,
    operator,
    value,
  }) => {
    setQueryFilters(current => {
      const existing = current.conditions.find(
        condition => condition.field === field
      )

      if (value === '') {
        return {
          ...current,
          conditions: current.conditions.filter(
            condition => condition.field !== field
          ),
        }
      }

      if (existing) {
        return {
          ...current,
          conditions: current.conditions.map(condition => (
            condition.field === field
              ? {
                ...condition,
                operator,
                value,
              }
              : condition
          )),
        }
      }

      const id = conditionId.current
      conditionId.current += 1

      return {
        ...current,
        conditions: [
          ...current.conditions,
          {
            id,
            field,
            operator,
            value,
          },
        ],
      }
    })
  }, [])

  const resetQueryConditions = React.useCallback(() => {
    setQueryFilters(current => ({
      ...current,
      conditions: [],
    }))
  }, [])

  const resetTeamPerformanceFilters = React.useCallback(() => {
    setQueryFilters(current => ({
      ...current,
      teamAttackPriorityLevels: [],
      teamDefensePriorityLevels: [],
    }))
  }, [])

  const removeQueryActiveItem = React.useCallback(item => {
    if (!item) return

    setQueryFilters(current => {
      if (item.type === 'condition') {
        return {
          ...current,
          conditions: current.conditions.filter(
            condition => condition.id !== item.conditionId
          ),
        }
      }

      if (item.type === 'array') {
        const values = current[item.field] || []

        return {
          ...current,
          [item.field]: values.filter(value => value !== item.value),
        }
      }

      if (item.type === 'scalar') {
        return {
          ...current,
          [item.field]: '',
        }
      }

      if (item.type === 'boolean') {
        return {
          ...current,
          [item.field]: false,
        }
      }

      return current
    })
  }, [])

  const resetQuery = React.useCallback(() => {
    setQueryFilters(createSearchFilters())
  }, [])

  return {
    queryFilters,
    queryFiltersKey,
    queryActiveItems,
    updateQueryFilter,
    toggleQueryArrayValue,
    setQueryPresetCondition,
    resetQueryConditions,
    resetTeamPerformanceFilters,
    removeQueryActiveItem,
    resetQuery,
  }
}
