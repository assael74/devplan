// teamProfile/sharedModules/abilities/useTeamAbilitiesModuleModel.js

import { useEffect, useMemo, useState } from 'react'

import { resolveTeamAbilitiesDomain } from '../../../../../shared/abilities/abilities.domain.logic.js'

import {
  isFilled,
  useAbilitiesSummary,
} from '../../sharedLogic/abilities'

import {
  DEFAULT_SELECTED_DOMAINS,
} from './teamAbilitiesModule.constants.js'

export default function useTeamAbilitiesModuleModel({
  entity,
  context,
  abilitiesInsightsRequest = 0,
}) {
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [selectedDomains, setSelectedDomains] = useState(DEFAULT_SELECTED_DOMAINS)
  const [showOnlyFilled, setShowOnlyFilled] = useState(false)

  const team = entity || null

  const domainResult = useMemo(() => {
    return resolveTeamAbilitiesDomain(team || {}, context || {})
  }, [team, context])

  const domains = domainResult?.domains || []
  const summary = domainResult?.summary || {}

  const { total, filled, avgAll } = useAbilitiesSummary(domains)

  const filteredDomains = useMemo(() => {
    const selectedSet = new Set(selectedDomains || [])

    return domains
      .filter(domain => {
        if (!selectedSet.size) return true

        return selectedSet.has(domain?.domain)
      })
      .map(domain => {
        const items = (domain?.items || []).filter(item => {
          return showOnlyFilled ? isFilled(item?.value) : true
        })

        return {
          ...domain,
          items,
          filled: items.filter(item => isFilled(item?.value)).length,
        }
      })
      .filter(domain => (domain?.items || []).length > 0)
  }, [domains, selectedDomains, showOnlyFilled])

  useEffect(() => {
    if (abilitiesInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [abilitiesInsightsRequest])

  const indicators = useMemo(() => {
    const next = []

    if (selectedDomains.length) {
      next.push({
        id: 'domains',
        label: `דומיינים: ${selectedDomains.length}`,
        idIcon: 'filter',
        color: 'primary',
      })
    }

    if (showOnlyFilled) {
      next.push({
        id: 'filled-only',
        label: 'רק מלאים',
        idIcon: 'filter',
        color: 'primary',
      })
    }

    return next
  }, [selectedDomains, showOnlyFilled])

  const hasActiveFilters = indicators.length > 0

  const handleClearIndicator = item => {
    if (!item?.id) return

    if (item.id === 'domains') {
      setSelectedDomains([])
      return
    }

    if (item.id === 'filled-only') {
      setShowOnlyFilled(false)
    }
  }

  const handleResetFilters = () => {
    setSelectedDomains([])
    setShowOnlyFilled(false)
  }

  return {
    team,
    domains,
    summary,

    total,
    filled,
    avgAll,

    filteredDomains,
    indicators,
    hasActiveFilters,

    insightsOpen,
    filtersOpen,

    selectedDomains,
    showOnlyFilled,

    setInsightsOpen,
    setFiltersOpen,
    setSelectedDomains,
    setShowOnlyFilled,

    handleClearIndicator,
    handleResetFilters,
  }
}
